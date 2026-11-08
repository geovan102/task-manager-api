import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTasksDto } from './dto/find-tasks.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Req() req: { user: { sub: number } },
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(req.user.sub, createTaskDto);
  }

  @Get()
  findAll(@Req() req: { user: { sub: number } }, @Query() query: FindTasksDto) {
    return this.tasksService.findAll(req.user.sub, query);
  }

  @Get(':id')
  findOne(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.sub, id, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Req() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.remove(req.user.sub, id);
  }
}
