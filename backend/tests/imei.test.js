const { validateIMEI } = require('../src/utils/imeiValidator');

describe('IMEI Validation', () => {
  describe('validateIMEI', () => {
    it('should validate a correct 15-digit IMEI', () => {
      const result = validateIMEI('356789012345678');
      expect(result.valid).toBe(true);
      expect(result.cleaned).toBe('356789012345678');
    });

    it('should reject empty IMEI', () => {
      const result = validateIMEI('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IMEI is required.');
    });

    it('should reject null IMEI', () => {
      const result = validateIMEI(null);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IMEI is required.');
    });

    it('should reject 14-digit IMEI', () => {
      const result = validateIMEI('35678901234567');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('15 digits');
    });

    it('should reject 16-digit IMEI', () => {
      const result = validateIMEI('3567890123456789');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('15 digits');
    });

    it('should reject non-numeric IMEI', () => {
      const result = validateIMEI('35678901234567A');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('only digits');
    });

    it('should trim whitespace', () => {
      const result = validateIMEI('  356789012345678  ');
      expect(result.valid).toBe(true);
      expect(result.cleaned).toBe('356789012345678');
    });
  });
});
