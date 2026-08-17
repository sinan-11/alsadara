const Mobile = require('../models/Mobile');
const { validateIMEI } = require('../utils/imeiValidator');
const { generatePDF } = require('../utils/pdfGenerator');

const LIST_FIELDS = 'imei1 imei2 brand model ram storage color status createdAt';

exports.addMobile = async (req, res, next) => {
  try {
    const { imei1, imei2, brand, model, ram, storage, color } = req.body;

    const imei1Validation = validateIMEI(imei1);
    if (!imei1Validation.valid) {
      return res.status(400).json({ success: false, message: `IMEI 1: ${imei1Validation.message}` });
    }

    if (imei2) {
      const imei2Validation = validateIMEI(imei2);
      if (!imei2Validation.valid) {
        return res.status(400).json({ success: false, message: `IMEI 2: ${imei2Validation.message}` });
      }
      if (imei1Validation.cleaned === imei2Validation.cleaned) {
        return res.status(400).json({ success: false, message: 'IMEI 1 and IMEI 2 must be different.' });
      }
    }

    const userId = req.user._id;

    const [existingImei1, existingImei2] = await Promise.all([
      Mobile.findOne({ user: userId, imei1: imei1Validation.cleaned }).lean(),
      imei2 ? Mobile.findOne({ user: userId, imei2: imei2.trim() }).lean() : null,
    ]);

    if (existingImei1) {
      return res.status(409).json({ success: false, message: 'This IMEI 1 already exists.' });
    }
    if (existingImei2) {
      return res.status(409).json({ success: false, message: 'This IMEI 2 already exists.' });
    }

    const mobile = await Mobile.create({
      user: userId,
      imei1: imei1Validation.cleaned,
      imei2: imei2 ? imei2.trim() : null,
      brand, model,
      ram: ram || '', storage: storage || '', color: color || '',
    });

    res.status(201).json({ success: true, message: 'Mobile added successfully.', data: { mobile } });
  } catch (error) {
    next(error);
  }
};

exports.getMobiles = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const query = { user: req.user._id };

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { imei1: searchRegex },
        { imei2: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
      ];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const [total, mobiles] = await Promise.all([
      Mobile.countDocuments(query),
      Mobile.find(query)
        .select(LIST_FIELDS)
        .lean()
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      data: { mobiles },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const { search, status, brand } = req.query;

    const query = { user: req.user._id };

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { imei1: searchRegex },
        { imei2: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
      ];
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    const [mobiles, statsResult] = await Promise.all([
      Mobile.find(query).select(LIST_FIELDS).lean().sort({ createdAt: -1 }),
      Mobile.aggregate([
        { $match: { user: req.user._id, ...query } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
            sold: { $sum: { $cond: [{ $eq: ['$status', 'SOLD'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stats = statsResult[0] || { total: 0, available: 0, sold: 0 };
    const filters = { search, status, brand };

    const pdfBuffer = await generatePDF(mobiles, filters, stats);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `mobile-stock-report-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

exports.getMobileByImei = async (req, res, next) => {
  try {
    const { imei } = req.params;

    const imeiValidation = validateIMEI(imei);
    if (!imeiValidation.valid) {
      return res.status(400).json({ success: false, message: imeiValidation.message });
    }

    const mobile = await Mobile.findOne({
      user: req.user._id,
      $or: [{ imei1: imeiValidation.cleaned }, { imei2: imeiValidation.cleaned }],
    }).lean();

    if (!mobile) {
      return res.status(404).json({ success: false, message: 'No mobile found for this IMEI.' });
    }

    res.status(200).json({ success: true, data: { mobile } });
  } catch (error) {
    next(error);
  }
};

exports.getMobileById = async (req, res, next) => {
  try {
    const mobile = await Mobile.findOne({ _id: req.params.id, user: req.user._id }).lean();

    if (!mobile) {
      return res.status(404).json({ success: false, message: 'Mobile not found.' });
    }

    res.status(200).json({ success: true, data: { mobile } });
  } catch (error) {
    next(error);
  }
};

exports.updateMobile = async (req, res, next) => {
  try {
    const mobile = await Mobile.findOne({ _id: req.params.id, user: req.user._id });

    if (!mobile) {
      return res.status(404).json({ success: false, message: 'Mobile not found.' });
    }

    const { imei1, imei2, brand, model, ram, storage, color, status } = req.body;
    const userId = req.user._id;

    if (imei1 !== undefined) {
      const imei1Validation = validateIMEI(imei1);
      if (!imei1Validation.valid) {
        return res.status(400).json({ success: false, message: `IMEI 1: ${imei1Validation.message}` });
      }
      if (imei1Validation.cleaned !== mobile.imei1) {
        const existing = await Mobile.findOne({ user: userId, imei1: imei1Validation.cleaned }).lean();
        if (existing) {
          return res.status(409).json({ success: false, message: 'This IMEI 1 already exists.' });
        }
      }
      mobile.imei1 = imei1Validation.cleaned;
    }

    if (imei2 !== undefined) {
      if (imei2 === '' || imei2 === null) {
        mobile.imei2 = null;
      } else {
        const imei2Validation = validateIMEI(imei2);
        if (!imei2Validation.valid) {
          return res.status(400).json({ success: false, message: `IMEI 2: ${imei2Validation.message}` });
        }
        if (imei2Validation.cleaned === mobile.imei1) {
          return res.status(400).json({ success: false, message: 'IMEI 1 and IMEI 2 must be different.' });
        }
        if (imei2Validation.cleaned !== mobile.imei2) {
          const existing = await Mobile.findOne({ user: userId, imei2: imei2Validation.cleaned }).lean();
          if (existing) {
            return res.status(409).json({ success: false, message: 'This IMEI 2 already exists.' });
          }
        }
        mobile.imei2 = imei2Validation.cleaned;
      }
    }

    if (brand !== undefined) mobile.brand = brand;
    if (model !== undefined) mobile.model = model;
    if (ram !== undefined) mobile.ram = ram;
    if (storage !== undefined) mobile.storage = storage;
    if (color !== undefined) mobile.color = color;
    if (status !== undefined) mobile.status = status;

    await mobile.save();

    res.status(200).json({ success: true, message: 'Mobile updated successfully.', data: { mobile } });
  } catch (error) {
    next(error);
  }
};

exports.deleteMobile = async (req, res, next) => {
  try {
    const mobile = await Mobile.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!mobile) {
      return res.status(404).json({ success: false, message: 'Mobile not found.' });
    }

    res.status(200).json({ success: true, message: 'Mobile deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
