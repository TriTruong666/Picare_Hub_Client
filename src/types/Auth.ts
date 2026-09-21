export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginChallengeDetails = {
  challengeId: string;
  expiresIn: number;
  resendAfter: number;
  maskedEmail: string;
};

export type LoginVerificationChallenge = LoginChallengeDetails & {
  requiresVerification: true;
};

export type LoginSuccess = {
  requiresVerification: false;
};

export type LoginResponseData = LoginVerificationChallenge | LoginSuccess;

export type VerifyLoginRequest = {
  challengeId: string;
  code: string;
};

export type ResendLoginCodeRequest = {
  challengeId: string;
};

export type TrustedIpRecord = {
  ipAddress: string;
  trustedAt: string;
  lastUsedAt: string;
  expiresAt: string;
  device: string;
};

export type TrustedIpsData = {
  trustedIps: string[];
  trustedIpRecords: TrustedIpRecord[];
  currentLoginIp: string | null;
  lastLoginAt: string | null;
  bypassIpVerification: boolean;
  policy: {
    ttlDays: number;
    maxRecords: number;
  };
};

export type RevokeTrustedIpRequest = {
  ipAddress: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};
