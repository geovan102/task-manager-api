import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number } },
    @Body() dto: CreateProjectDto,
  ) {
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
}