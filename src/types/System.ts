export type SystemHealthResponse = {
  status: string;
  app: string;
  version: string;
  env: string;
  database: string;
  redis: string;
  uptime: number;
  isConnectPicare: boolean;
};
