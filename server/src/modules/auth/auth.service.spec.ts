import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    users: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should return a token string', async () => {
      const payload = { id: '123', email: 'test@test.com' };
      const token = await service.generateAccessToken(payload);
      expect(token).toBe('mock-token');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: process.env.SECRET_KEY,
      });
    });
  });

  describe('findUserVerifyByUserId', () => {
    it('should return user if found', async () => {
      const mockUser = { id: '123', email: 'test@test.com', emailVerified: true };
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findUserVerifyByUserId('123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      const result = await service.findUserVerifyByUserId('not-exist');
      expect(result).toBeNull();
    });
  });
});
