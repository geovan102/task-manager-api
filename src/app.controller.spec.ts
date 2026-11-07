import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prismaMock: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prismaMock = { $queryRaw: jest.fn() };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should report the database as up when the query works', async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await appController.getHealth();

      expect(result).toEqual({ status: 'ok', database: 'up' });
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should report the database as down when the query fails', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('db unreachable'));

      const result = await appController.getHealth();

      expect(result).toEqual({ status: 'error', database: 'down' });
    });
  });
});
