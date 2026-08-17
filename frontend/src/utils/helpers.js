export const validateLuhn = (num) => {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

export const validateIMEI = (imei) => {
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

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
