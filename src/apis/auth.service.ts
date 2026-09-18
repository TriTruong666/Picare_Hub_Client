import type { BaseResponse } from "@/types/ApiResponse";
import type {
  ChangePasswordPayload,
  LoginChallengeDetails,
  LoginRequest,
  LoginResponseData,
  LoginSuccess,
  ResendLoginCodeRequest,
  RevokeTrustedIpRequest,
  TrustedIpsData,
  VerifyLoginRequest,
} from "@/types/Auth";
import { hubAxiosClient } from "./client";

export const login = async (
  data: LoginRequest,
): Promise<BaseResponse<LoginResponseData>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/login", data);
  return res.data;
};

export const verifyLogin = async (
  data: VerifyLoginRequest,
): Promise<BaseResponse<LoginSuccess>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/login/verify", data);
  return res.data;
};

export const resendLoginCode = async (
  data: ResendLoginCodeRequest,
): Promise<BaseResponse<LoginChallengeDetails>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/login/resend-code", data);
  return res.data;
};

export const getTrustedIps = async (): Promise<
  BaseResponse<TrustedIpsData>
> => {
  const res = await hubAxiosClient.get("/api/v1/auth/trusted-ips");
  return res.data;
};

export const revokeTrustedIp = async (
  data: RevokeTrustedIpRequest,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete("/api/v1/auth/trusted-ips", {
    data,
  });
  return res.data;
};

export const revokeAllTrustedIps = async (): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete("/api/v1/auth/trusted-ips/all");
  return res.data;
};

export const logout = async (data: {
  email: string;
}): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/logout", data);
  return res.data;
};

export const changePassword = async (
  data: ChangePasswordPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/change-password", data);
  return res.data;
};
