import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { INVITATION_QUEUE } from './invitation.queue';

describe('ProjectsService.addMember', () => {
  let service: ProjectsService;
  let prismaMock: {
    projectMember: { findFirst: jest.Mock; create: jest.Mock };
    user: { findUnique: jest.Mock };
    project: { findUniqueOrThrow: jest.Mock };
  };
  let queueMock: { add: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      projectMember: { findFirst: jest.fn(), create: jest.fn() },
      user: { findUnique: jest.fn() },
      project: { findUniqueOrThrow: jest.fn() },
    };
    queueMock = { add: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken(INVITATION_QUEUE), useValue: queueMock },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  it('adds the member and queues exactly one invitation job', async () => {
    prismaMock.projectMember.findFirst
      .mockResolvedValueOnce({ role: 'OWNER' })
      .mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
    prismaMock.projectMember.create.mockResolvedValue({
      id: 10,
      role: 'MEMBER',
    });
    prismaMock.project.findUniqueOrThrow.mockResolvedValue({ name: 'Demo' });

    const result = await service.addMember(1, 5, {
      email: 'maria@example.com',
    });

    expect(result).toEqual({ id: 10, role: 'MEMBER' });
    expect(queueMock.add).toHaveBeenCalledTimes(1);
    expect(queueMock.add).toHaveBeenCalledWith(
      'send-invitation',
      { projectId: 5, projectName: 'Demo', email: 'maria@example.com' },
      expect.objectContaining({ attempts: 3 }),
    );
  });

  it('throws 404 when the caller is not a member of the project', async () => {
    prismaMock.projectMember.findFirst.mockResolvedValue(null);

    await expect(
      service.addMember(1, 5, { email: 'maria@example.com' }),
    ).rejects.toThrow(NotFoundException);
    expect(queueMock.add).not.toHaveBeenCalled();
  });

  it('throws 403 when the caller is a member but not the owner', async () => {
    prismaMock.projectMember.findFirst.mockResolvedValue({ role: 'MEMBER' });

    await expect(
      service.addMember(1, 5, { email: 'maria@example.com' }),
    ).rejects.toThrow(ForbiddenException);
    expect(queueMock.add).not.toHaveBeenCalled();
  });

  it('throws 409 when the invited user is already a member', async () => {
    prismaMock.projectMember.findFirst
      .mockResolvedValueOnce({ role: 'OWNER' })
      .mockResolvedValueOnce({ id: 3 });
    prismaMock.user.findUnique.mockResolvedValue({ id: 2 });

    await expect(
      service.addMember(1, 5, { email: 'maria@example.com' }),
    ).rejects.toThrow(ConflictException);
    expect(prismaMock.projectMember.create).not.toHaveBeenCalled();
    expect(queueMock.add).not.toHaveBeenCalled();
  });
});
