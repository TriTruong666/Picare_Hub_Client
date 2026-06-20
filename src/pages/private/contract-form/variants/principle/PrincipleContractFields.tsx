import {
  FieldLabel,
  SectionTitle,
  TextInput,
} from "../../common/FormPrimitives";

export function PrincipleContractFields({
  paymentTermDays,
  creditLimit,
  onPaymentTermDaysChange,
  onCreditLimitChange,
}: {
  paymentTermDays: string;
  creditLimit: string;
  onPaymentTermDaysChange: (value: string) => void;
  onCreditLimitChange: (value: string) => void;
}) {
  return (
    <section className="border-b border-black/10 py-6 dark:border-white/10">
      <SectionTitle>Thông tin hợp đồng</SectionTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Thời hạn thanh toán (ngày)</FieldLabel>
          <TextInput
            id="payment-term-days"
            type="number"
            value={paymentTermDays}
            onChange={onPaymentTermDaysChange}
            placeholder="30"
            required
          />
        </div>
        <div>
          <FieldLabel>Hạn mức công nợ</FieldLabel>
          <TextInput
            id="credit-limit"
            type="text"
            value={creditLimit}
            onChange={onCreditLimitChange}
            placeholder="Để trống nếu không áp dụng"
          />
        </div>
      </div>
    </section>
  );
}

