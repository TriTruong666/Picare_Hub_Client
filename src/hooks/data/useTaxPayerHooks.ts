import { useMutation } from "@tanstack/react-query";

import * as TaxPayerService from "@/apis/tax_payer.service";

export function useTaxPayerLookup() {
  return useMutation({
    mutationFn: (mst: string) => TaxPayerService.getTaxPayerByMst(mst),
  });
}
