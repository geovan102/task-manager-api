import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId,
      },
    });
  }

  async findAll(ownerId: number) {
    return this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(ownerId :number, id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}