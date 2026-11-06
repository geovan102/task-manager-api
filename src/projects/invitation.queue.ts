export const INVITATION_QUEUE = 'invitations';

export interface InvitationJobData {
  projectId: number;
  projectName: string;
  email: string;
}
