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

export type TrustedIpsData = {
  trustedIps: string[];
  currentLoginIp: string | null;
};

export type RevokeTrustedIpRequest = {
  ipAddress: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};
