import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bullmq';

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    RedisModule,
    BullModule.forRoot({
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port) || 6379,
        password: redisUrl.password || undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
