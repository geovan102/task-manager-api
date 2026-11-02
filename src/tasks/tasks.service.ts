import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, members: { some: { userId } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
      },
    });
  }

  async findAll(userId: number, projectId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, members: { some: { userId } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { members: { some: { userId } } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(userId: number, id: number, dto: UpdateTaskDto) {
    await this.findOne(userId, id);

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description,
        status: dto.status,
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
