import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProjectsDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}