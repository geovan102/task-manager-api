import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: { user: { sub: number } }, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: { user: { sub: number } }) {
    return this.projectsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.remove(req.user.sub, id);
  }

  @Post(':id/members')
  addMember(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(req.user.sub, id, dto);
  }

  @Get(':id/members')
  listMembers(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.listMembers(req.user.sub, id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) memberUserId: number,
  ) {
    return this.projectsService.removeMember(req.user.sub, id, memberUserId);
  }
}
