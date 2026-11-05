import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindTasksDto } from './dto/find-tasks.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, members: { some: { userId } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
      },
    });

    await this.invalidateProjectCache(task.projectId);
    return task;
  }

  async findAll(userId: number, query: FindTasksDto) {
    const { projectId, status, search, page, limit } = query;

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, members: { some: { userId } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const cacheKey = `tasks:project:${projectId}:status:${status ?? 'all'}:search:${search ?? ''}:page:${page}:limit:${limit}`;

    const cached = await this.redis.getJson<{ data: unknown[]; meta: object }>(
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    const where = {
      projectId,
      status,
      title: search
        ? { contains: search, mode: 'insensitive' as const }
        : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const result = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.redis.setJson(cacheKey, result, 60);

    return result;
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
    const existing = await this.findOne(userId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description,
        status: dto.status,
      },
    });

    await this.invalidateProjectCache(existing.projectId);
    return task;
  }

  async remove(userId: number, id: number) {
    const existing = await this.findOne(userId, id);

    await this.prisma.task.delete({ where: { id } });

    await this.invalidateProjectCache(existing.projectId);
  }

  private async invalidateProjectCache(projectId: number) {
    await this.redis.delByPrefix(`tasks:project:${projectId}:`);
  }
}
