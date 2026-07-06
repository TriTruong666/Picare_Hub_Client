import axios from "axios";

import type { SystemHealthResponse } from "@/types/System";

function getHealthUrl(domain: string) {
  const normalizedDomain = /^https?:\/\//i.test(domain)
    ? domain
    : `https://${domain}`;
  return `${normalizedDomain.replace(/\/$/, "")}/health`;
}

export async function getCommercialSoftwareHealth(
  domain: string,
): Promise<SystemHealthResponse> {
  const response = await axios.get<SystemHealthResponse>(getHealthUrl(domain), {
    timeout: 8_000,
  });
  return response.data;
}
