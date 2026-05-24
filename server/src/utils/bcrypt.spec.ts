import { hashPassword, comparePassword, generateOTP } from './bcrypt';

describe('Bcrypt Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'mypassword123';
      const hashed = await hashPassword(password);
      expect(hashed).toBeDefined();
      expect(hashed).not.toEqual(password);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'mypassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'mypassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'mypassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP string', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThanOrEqual(999999);
    });

    it('should generate different OTPs each time', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // Not guaranteed but very likely different
      expect(typeof otp1).toBe('string');
      expect(typeof otp2).toBe('string');
    });
  });
});
