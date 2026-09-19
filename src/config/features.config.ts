const parseBooleanFlag = (value: string | undefined): boolean =>
  String(value ?? "false").toLowerCase() === "true";

export const featureFlags = Object.freeze({
  loginVerification: parseBooleanFlag(
    import.meta.env.VITE_AUTH_LOGIN_VERIFICATION_ENABLED,
  ),
});
