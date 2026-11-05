import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
        name: dto.name,
        description: dto.description,
        ownerId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, members: { some: { userId } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(ownerId: number, id: number, dto: UpdateProjectDto) {
    await this.findOne(ownerId, id);

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        description: dto.description,
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.assertOwner(userId, id);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(userId: number, projectId: number, dto: AddMemberDto) {
    await this.assertOwner(userId, projectId);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.projectMember.findFirst({
      where: { userId: user.id, projectId },
    });

    if (existing) {
      throw new ConflictException('User is already a member');
    }

    return this.prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: 'MEMBER',
      },
      select: {
        id: true,
        role: true,
        projectId: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async listMembers(userId: number, projectId: number) {
    await this.findOne(userId, projectId);

    return this.prisma.projectMember.findMany({
      where: { projectId },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async removeMember(userId: number, projectId: number, memberUserId: number) {
    await this.assertOwner(userId, projectId);

    const membership = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberUserId, projectId } },
    });
    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === 'OWNER') {
      throw new BadRequestException('The project owner cannot be removed');
    }

    await this.prisma.projectMember.delete({ where: { id: membership.id } });
  }

  private async assertOwner(userId: number, projectId: number) {
    const membership = await this.prisma.projectMember.findFirst({
      where: { userId, projectId },
    });

    if (!membership) {
      throw new NotFoundException('Project not found');
    }

    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Only the project owner can do this');
    }
  }
}
