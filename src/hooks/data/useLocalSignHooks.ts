import { useMutation } from "@tanstack/react-query";
import * as LocalSignService from "@/apis/local_sign.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useFetch, useSuspenseFetch } from "../useQuery";
import { toast } from "../useToast";
import type { SignPDFCMSPayload } from "@/types/LocalSign";

type MutationToastOptions = {
  showSuccessToast?: boolean;
};

/**
 * Hook kiểm tra trạng thái local signing service
 */
export function useLocalSigningServiceHealth() {
  return useFetch(["local-sign", "health"], () =>
    LocalSignService.checkLocalSigningService(),
  );
}

/**
 * Hook kiểm tra thủ công trạng thái local signing service
 */
export function useCheckLocalSigningService() {
  return useMutation({
    mutationFn: () => LocalSignService.checkLocalSigningService(),
  });
}

/**
 * Hook kiểm tra trạng thái local signing service (Suspense version)
 */
export function useSuspenseLocalSigningServiceHealth() {
  return useSuspenseFetch(["local-sign", "health"], () =>
    LocalSignService.checkLocalSigningService(),
  );
}

/**
 * Hook lấy thông tin USB token
 */
export function useUSBInfo() {
  return useFetch(["local-sign", "tokens"], () =>
    LocalSignService.getUSBInfo(),
  );
}

/**
 * Hook quét USB token thủ công
 */
export function useGetUSBInfoMutation() {
  return useMutation({
    mutationFn: () => LocalSignService.getUSBInfo(),
  });
}

/**
 * Hook lấy thông tin USB token (Suspense version)
 */
export function useSuspenseUSBInfo() {
  return useSuspenseFetch(["local-sign", "tokens"], () =>
    LocalSignService.getUSBInfo(),
  );
}

/**
 * Hook lấy certificate theo certificateId và vendor
 */
export function useCertificate(params: {
  certificateId: string;
  vendor: string;
}) {
  return useFetch(
    ["local-sign", "certificate", params],
    () => LocalSignService.getCertificate(params),
    {
      enabled: !!params.certificateId && !!params.vendor,
    },
  );
}

/**
 * Hook lấy certificate thủ công
 */
export function useGetCertificateMutation() {
  return useMutation({
    mutationFn: (params: { certificateId: string; vendor: string }) =>
      LocalSignService.getCertificate(params),
  });
}

/**
 * Hook lấy certificate theo certificateId và vendor (Suspense version)
 */
export function useSuspenseCertificate(params: {
  certificateId: string;
  vendor: string;
}) {
  return useSuspenseFetch(["local-sign", "certificate", params], () =>
    LocalSignService.getCertificate(params),
  );
}

/**
 * Hook ký PDF CMS bằng USB token
 */
export function useSignPdfCms(options?: MutationToastOptions) {
  const { showSuccessToast = true } = options ?? {};

  return useMutation({
    mutationFn: (data: SignPDFCMSPayload) => LocalSignService.signPdfCms(data),
    onSuccess: (data) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Thành công", "Ký số PDF thành công");
        }
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
