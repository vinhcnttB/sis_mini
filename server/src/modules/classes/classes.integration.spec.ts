import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from 'src/prisma.service';

/**
 * Integration Tests for ClassesService
 * Tests multiple layers working together: Service + PrismaService (mocked)
 * Verifies complete class management flows
 */
describe('ClassesService - Integration Tests', () => {
  let service: ClassesService;

  const mockClass = {
    id: 'class-id-123',
    name: 'Web Nâng Cao',
    description: 'Môn học phát triển web',
    code: 'WEB001',
    classTeachers: [
      {
        teachers: {
          id: 'teacher-id-1',
          firstName: 'Nguyen',
          lastName: 'Van B',
          email: 'teacher@example.com',
          avatar: 'https://avatar.url',
        },
      },
    ],
  };

  const mockPrismaService = {
    classes: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    classTeachers: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    classStudents: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    jest.clearAllMocks();
  });

  // ===== getAllClasses Integration Tests =====
  describe('getAllClasses - fetch all classes flow', () => {
    it('should return all classes with teachers mapped correctly', async () => {
      mockPrismaService.classes.findMany.mockResolvedValue([mockClass]);

      const result = await service.getAllClasses();

      expect(result).toHaveLength(1);
      expect(result[0].teachers).toHaveLength(1);
      expect(result[0].teachers[0].email).toBe('teacher@example.com');
      expect(result[0].classTeachers).toBeUndefined();
    });

    it('should return empty array when no classes exist', async () => {
      mockPrismaService.classes.findMany.mockResolvedValue([]);

      const result = await service.getAllClasses();

      expect(result).toEqual([]);
    });

    it('should map multiple classes correctly', async () => {
      const mockClass2 = { ...mockClass, id: 'class-id-456', name: 'DevOps', classTeachers: [] };
      mockPrismaService.classes.findMany.mockResolvedValue([mockClass, mockClass2]);

      const result = await service.getAllClasses();

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('DevOps');
      expect(result[1].teachers).toEqual([]);
    });
  });

  // ===== create Integration Tests =====
  describe('create - create class flow', () => {
    it('should create a new class and return it', async () => {
      const createDto = { name: 'New Class', description: 'Test', code: 'NC001' };
      mockPrismaService.classes.create.mockResolvedValue({ id: 'new-class-id', ...createDto });

      const result = await service.create(createDto);

      expect(result.id).toBe('new-class-id');
      expect(result.name).toBe('New Class');
      expect(mockPrismaService.classes.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  // ===== checkTeacherInClass Integration Tests =====
  describe('checkTeacherInClass - teacher membership flow', () => {
    it('should return record when teacher is in class', async () => {
      const mockRecord = { classId: 'class-id-123', teacherId: 'teacher-id-1' };
      mockPrismaService.classTeachers.findFirst.mockResolvedValue(mockRecord);

      const result = await service.checkTeacherInClass('class-id-123', 'teacher-id-1');

      expect(result).toEqual(mockRecord);
      expect(mockPrismaService.classTeachers.findFirst).toHaveBeenCalledWith({
        where: { classId: 'class-id-123', teacherId: 'teacher-id-1' },
      });
    });

    it('should return null when teacher is not in class', async () => {
      mockPrismaService.classTeachers.findFirst.mockResolvedValue(null);

      const result = await service.checkTeacherInClass('class-id-123', 'other-teacher-id');

      expect(result).toBeNull();
    });
  });

  // ===== addTeacherToClass Integration Tests =====
  describe('addTeacherToClass - add teacher flow', () => {
    it('should add teacher to class as creator', async () => {
      const mockRecord = { classId: 'class-id-123', teacherId: 'teacher-id-1', isCreator: true };
      mockPrismaService.classTeachers.create.mockResolvedValue(mockRecord);

      const result = await service.addTeacherToClass('class-id-123', 'teacher-id-1', true);

      expect(result.isCreator).toBe(true);
      expect(mockPrismaService.classTeachers.create).toHaveBeenCalledWith({
        data: { classId: 'class-id-123', teacherId: 'teacher-id-1', isCreator: true },
      });
    });

    it('should add teacher to class as non-creator by default', async () => {
      const mockRecord = { classId: 'class-id-123', teacherId: 'teacher-id-2', isCreator: false };
      mockPrismaService.classTeachers.create.mockResolvedValue(mockRecord);

      const result = await service.addTeacherToClass('class-id-123', 'teacher-id-2');

      expect(result.isCreator).toBe(false);
    });
  });
});
