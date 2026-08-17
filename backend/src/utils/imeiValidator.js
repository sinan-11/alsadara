const validateIMEI = (imei) => {
  if (!imei || typeof imei !== 'string') {
    return { valid: false, message: 'IMEI is required.' };
  }

  const cleaned = imei.trim();

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'IMEI must contain only digits.' };
  }

  if (cleaned.length !== 15) {
    return { valid: false, message: 'IMEI must contain exactly 15 digits.' };
  }

  return { valid: true, cleaned };
};

module.exports = { validateIMEI };
