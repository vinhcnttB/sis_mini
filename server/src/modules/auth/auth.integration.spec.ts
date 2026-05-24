import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';

/**
 * Integration Tests for AuthService
 * Tests multiple layers working together: Service + PrismaService (mocked) + JwtService (mocked)
 * Unlike unit tests, these tests verify the full flow of each use case
 */
describe('AuthService - Integration Tests', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    firstName: 'Nguyen',
    lastName: 'Van A',
    encryptedPassword: '$2b$10$hashedpassword',
    emailVerified: true,
    isBan: false,
    role: { name: 'USER' },
    uniqueId: null,
  };

  const mockPrismaService = {
    users: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('integration-test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ===== signUpByEmail Integration Tests =====
  describe('signUpByEmail - full registration flow', () => {
    it('should register a new user and return token', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      });

      const result = await service.signUpByEmail({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      });

      expect(result.token).toBe('integration-test-token');
      expect(result.user.email).toBe('newuser@example.com');
      expect(mockPrismaService.users.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if email already verified (account exists)', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue({
        ...mockUser,
        emailVerified: true,
      });

      await expect(
        service.signUpByEmail({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should update existing unverified user instead of creating new one', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await service.signUpByEmail({
        firstName: 'Updated',
        lastName: 'User',
        email: 'test@example.com',
        password: 'newpassword',
      });

      expect(mockPrismaService.users.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.users.create).not.toHaveBeenCalled();
      expect(result.token).toBe('integration-test-token');
    });
  });

  // ===== login Integration Tests =====
  describe('login - full authentication flow', () => {
    it('should login successfully with correct credentials', async () => {
      const bcrypt = require('bcrypt');
      const realPassword = 'correctpassword';
      const hashedPassword = await bcrypt.hash(realPassword, 10);

      mockPrismaService.users.findFirst.mockResolvedValue({
        ...mockUser,
        encryptedPassword: hashedPassword,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: realPassword,
      });

      expect(result.status).toBe(true);
      expect(result.data.token).toBe('integration-test-token');
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.message).toBe('Đăng nhập thành công');
    });

    it('should throw error when user not found', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when password is incorrect', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockPrismaService.users.findFirst.mockResolvedValue({
        ...mockUser,
        encryptedPassword: hashedPassword,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when account is banned', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockPrismaService.users.findFirst.mockResolvedValue({
        ...mockUser,
        encryptedPassword: hashedPassword,
        isBan: true,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(HttpException);
    });
  });

  // ===== findUserVerifyByUserId Integration Tests =====
  describe('findUserVerifyByUserId - user lookup flow', () => {
    it('should return verified user by id', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findUserVerifyByUserId('user-id-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-id-123', emailVerified: true },
      });
    });

    it('should return null when user is not verified', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      const result = await service.findUserVerifyByUserId('unverified-id');

      expect(result).toBeNull();
    });
  });
});
