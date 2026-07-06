export type SendEcontractMailTemplatePayload = {
  smtpUser: string;
  mailFrom: string;
  mailFromName: string;
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

export type SendLicenseActiveMailTemplatePayload = {
  smtpUser: string;
  mailFrom: string;
  mailFromName: string;
  to: string;
  cc?: string | null;
  bcc?: string | null;
  subject: string;
  title: string;
  intro: string;
  bodyLines: string[];
  clientUrl: string;
  softwareId: string;
  licenseKey: string;
  footer: string;
  replyTo: string;
};
