import axios from "axios";

export type TaxPayerLookupResponse = {
  orgType?: string;
  taxID: string;
  name?: string;
  address?: string;
  taxDepartment?: string;
  status?: string;
  updatedAt?: string;
};

export async function getTaxPayerByMst(mst: string) {
  const res = await axios.get<TaxPayerLookupResponse>(
    `https://api.xinvoice.vn/gdt-api/tax-payer/${mst}`,
  );
  return res.data;
}
