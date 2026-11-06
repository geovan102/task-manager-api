import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { INVITATION_QUEUE, InvitationJobData } from './invitation.queue';

@Processor(INVITATION_QUEUE)
export class InvitationProcessor extends WorkerHost {
  private readonly logger = new Logger(InvitationProcessor.name);

  async process(job: Job<InvitationJobData>): Promise<void> {
    this.logger.log(
      `Job ${job.id}: sending invitation for project ${job.data.projectId}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Job ${job.id}: invitation sent`);
  }
}
