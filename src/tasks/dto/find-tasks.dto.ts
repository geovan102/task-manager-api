import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindTasksDto {
  // Required: which project's tasks we want
  @Type(() => Number)
  @IsInt()
  projectId: number;

  // Optional filter: only tasks with this status
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'DONE'])
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';

  // Optional text search in the title
  @IsOptional()
  @IsString()
  search?: string;

  // Page number, starts at 1
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // How many items per page (max 50)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
