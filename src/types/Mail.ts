export type SendMailTemplatePayload = {
  to: string;
  cc?: string | null;
  bcc?: string | null;
  subject: string;
  title: string;
  intro: string;
  bodyLines: string[];
  actionLabel: string;
  actionUrl: string;
  footer: string;
  replyTo: string;
};
