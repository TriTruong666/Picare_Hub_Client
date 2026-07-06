import { useQueries } from "@tanstack/react-query";

import * as SystemService from "@/apis/system.service";
import { useLicenses } from "@/hooks/data/useLicenseHooks";
import type { SoftwareItem } from "@/types/License";
import type { SystemHealthResponse } from "@/types/System";

export type CommercialSoftwareConnection = {
  key: string;
  customerName: string;
  licenseId: string;
  software: SoftwareItem;
  health: SystemHealthResponse | null;
  isConnected: boolean;
  isChecking: boolean;
};

export function useCommercialSoftwareConnections() {
  const licensesQuery = useLicenses({ page: 1, limit: 100 });
  const servers = (licensesQuery.data || []).flatMap((license) =>
    (license.software || [])
      .filter((software) => software.type === "server")
      .map((software) => ({
        key: `${license.licenseId}-${software.softwareId}`,
        customerName: license.customerName,
        licenseId: license.licenseId,
        software,
      })),
  );

  const healthQueries = useQueries({
    queries: servers.map((server) => ({
      queryKey: ["commercial-software-health", server.software.domain],
      queryFn: () =>
        SystemService.getCommercialSoftwareHealth(server.software.domain),
      enabled: Boolean(server.software.domain),
      retry: false,
      refetchInterval: 30_000,
    })),
  });

  const data: CommercialSoftwareConnection[] = servers.map((server, index) => {
    const health = healthQueries[index]?.data ?? null;
    return {
      ...server,
      health,
      isConnected:
        server.software.isConnectPicare === true ||
        health?.isConnectPicare === true,
      isChecking: healthQueries[index]?.isFetching ?? false,
    };
  });

  return {
    data,
    isLoading:
      licensesQuery.isLoading || healthQueries.some((query) => query.isLoading),
    isFetching:
      licensesQuery.isFetching ||
      healthQueries.some((query) => query.isFetching),
    isError: licensesQuery.isError,
    refetch: async () => {
      await licensesQuery.refetch();
      await Promise.all(healthQueries.map((query) => query.refetch()));
    },
  };
}
