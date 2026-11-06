import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { BullModule } from '@nestjs/bullmq';
import { INVITATION_QUEUE } from './invitation.queue';
import { InvitationProcessor } from './invitation.processor';

@Module({
  imports: [BullModule.registerQueue({ name: INVITATION_QUEUE })],
  providers: [ProjectsService, InvitationProcessor],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
