export type SystemLogStatus = "complete" | "error" | "running";

export type SystemLog = {
  id: string;
  jobId: string;
  jobName: string;
  queueName: string;
  companyId: string;
  status: SystemLogStatus;
  progress: number;
  message: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
};

export type SystemHealthResponse = {
  status: string;
  app: string;
  version: string;
  env: string;
  database: string;
  redis: string;
  uptime: number;
};
