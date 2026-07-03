import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import GlassSelect from "@/components/custom_ui/Select";
import { Spinner } from "@/components/custom_ui/Spinner";
import { PATHS } from "@/config/paths";
import { useCreateLicense } from "@/hooks/data/useLicenseHooks";
import type { LicenseContract, SoftwareItem } from "@/types/License";

const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Đã thanh toán" },
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "pending", label: "Đang chờ xử lý" },
];

const SOFTWARE_TYPE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "server", label: "Server" },
  { value: "custom", label: "Custom" },
];

const SOFTWARE_STATUS_OPTIONS = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
];

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-white/40">
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
    />
  );
}

function TextareaInput({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 transition-all outline-none placeholder:text-gray-400 hover:border-gray-400 hover:bg-gray-50 focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:hover:bg-white/8 dark:focus:bg-white/8 dark:focus:ring-indigo-500/10"
    />
  );
}

export default function LicenseCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateLicense();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [yearlyCost, setYearlyCost] = useState(0);
  const [oncePaymentStatus, setOncePaymentStatus] = useState("paid");
  const [note, setNote] = useState("");

  // Contract list state
  const [contracts, setContracts] = useState<LicenseContract[]>([]);
  const [newContractName, setNewContractName] = useState("");
  const [newContractUrl, setNewContractUrl] = useState("");

  // Software items state
  const [softwares, setSoftwares] = useState<SoftwareItem[]>([]);

  const handleAddContract = () => {
    if (!newContractName || !newContractUrl) return;
    setContracts([...contracts, { name: newContractName, url: newContractUrl }]);
    setNewContractName("");
    setNewContractUrl("");
  };

  const handleRemoveContract = (index: number) => {
    setContracts(contracts.filter((_, i) => i !== index));
  };

  const handleAddSoftware = () => {
    const newItem: SoftwareItem = {
      name: "",
      price: 0,
      status: "active",
      domain: "",
      type: "client",
      serverConfig: {
        name: "",
        active: false,
      },
      note: "",
    };
    setSoftwares([...softwares, newItem]);
  };

  const handleUpdateSoftware = (index: number, key: keyof SoftwareItem, val: any) => {
    const updated = [...softwares];
    updated[index] = {
      ...updated[index],
      [key]: val,
    };
    setSoftwares(updated);
  };

  const handleUpdateSoftwareServerConfig = (
    index: number,
    key: "name" | "active",
    val: any
  ) => {
    const updated = [...softwares];
    updated[index] = {
      ...updated[index],
      serverConfig: {
        ...updated[index].serverConfig,
        [key]: val,
      },
    };
    setSoftwares(updated);
  };

  const handleRemoveSoftware = (index: number) => {
    setSoftwares(softwares.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (createMutation.isPending) return;

    try {
      const response = await createMutation.mutateAsync({
        customerName,
        customerPhone,
        customerEmail,
        yearlyCost,
        oncePaymentStatus,
        licenseContract: contracts,
        note,
        software: softwares,
      });

      if (response.success) {
        navigate(PATHS.DASHBOARD.LICENSE_LIST);
      }
    } catch {
      return;
    }
  };

  const isSaving = createMutation.isPending;

  return (
    <div className="page-layout dashboard-theme">
      <div className="mb-8 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: PATHS.DASHBOARD.ROOT },
            { label: "Bản quyền", path: PATHS.DASHBOARD.LICENSE_LIST },
            { label: "Tạo bản quyền" },
          ]}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(PATHS.DASHBOARD.LICENSE_LIST)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
                Tạo bản quyền mới
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/40">
                Thêm bản quyền sử dụng phần mềm và quản lý cấu hình server
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Spinner size="sm" /> : <FiSave className="text-sm" />}
            Tạo bản quyền
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Thông tin khách hàng */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
              Thông tin khách hàng
            </h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Tên khách hàng</FieldLabel>
                  <TextInput
                    id="customer-name"
                    value={customerName}
                    onChange={setCustomerName}
                    placeholder="Tên khách hàng hoặc doanh nghiệp"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <FieldLabel>Số điện thoại</FieldLabel>
                  <TextInput
                    id="customer-phone"
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    placeholder="Số điện thoại liên hệ"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Email khách hàng</FieldLabel>
                <TextInput
                  id="customer-email"
                  value={customerEmail}
                  onChange={setCustomerEmail}
                  placeholder="user@example.com"
                  type="email"
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>Ghi chú</FieldLabel>
                <TextareaInput
                  id="note"
                  value={note}
                  onChange={setNote}
                  placeholder="Ghi chú thêm về khách hàng hoặc điều khoản bản quyền..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          {/* Hợp đồng */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
              Hợp đồng liên quan
            </h2>
            <div className="flex flex-col gap-4">
              {/* Form thêm hợp đồng */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <FieldLabel>Tên hợp đồng</FieldLabel>
                  <TextInput
                    id="new-contract-name"
                    value={newContractName}
                    onChange={setNewContractName}
                    placeholder="Ví dụ: Hop dong Happycare 2026"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <FieldLabel>Đường dẫn hợp đồng (URL)</FieldLabel>
                  <div className="flex gap-2">
                    <TextInput
                      id="new-contract-url"
                      value={newContractUrl}
                      onChange={setNewContractUrl}
                      placeholder="https://example.com/contracts/..."
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={handleAddContract}
                      className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
                      disabled={isSaving || !newContractName || !newContractUrl}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Danh sách hợp đồng đã thêm */}
              {contracts.length > 0 && (
                <div className="mt-2 divide-y divide-gray-200 rounded-xl border border-gray-300 bg-white p-3 dark:divide-white/5 dark:border-white/10 dark:bg-white/5">
                  {contracts.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-xs font-semibold text-gray-950 dark:text-white">
                          {c.name}
                        </p>
                        <p className="truncate text-[10px] text-gray-400 dark:text-white/40">
                          {c.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContract(idx)}
                        disabled={isSaving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition-all hover:bg-red-550/10 dark:border-red-500/10 dark:text-red-400"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Phần mềm */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Danh sách phần mềm kích hoạt
              </h2>
              <button
                type="button"
                onClick={handleAddSoftware}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                disabled={isSaving}
              >
                <FiPlus /> Thêm phần mềm
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {softwares.map((sw, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col gap-4 rounded-xl border border-gray-300 bg-white p-5 dark:border-white/10 dark:bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSoftware(idx)}
                    disabled={isSaving}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition-all hover:bg-red-550/10 dark:border-red-500/10 dark:text-red-400"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Phần mềm #{idx + 1}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Tên phần mềm</FieldLabel>
                      <TextInput
                        id={`sw-name-${idx}`}
                        value={sw.name}
                        onChange={(v) => handleUpdateSoftware(idx, "name", v)}
                        placeholder="Ví dụ: Happycare App"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <FieldLabel>Giá tiền (VND)</FieldLabel>
                      <TextInput
                        id={`sw-price-${idx}`}
                        value={sw.price}
                        onChange={(v) =>
                          handleUpdateSoftware(idx, "price", parseFloat(v) || 0)
                        }
                        placeholder="Ví dụ: 5000000"
                        type="number"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <FieldLabel>Trạng thái</FieldLabel>
                      <GlassSelect
                        value={sw.status}
                        onChange={(val) => handleUpdateSoftware(idx, "status", val)}
                        options={SOFTWARE_STATUS_OPTIONS}
                        placeholder="Chọn trạng thái"
                      />
                    </div>
                    <div>
                      <FieldLabel>Domain</FieldLabel>
                      <TextInput
                        id={`sw-domain-${idx}`}
                        value={sw.domain}
                        onChange={(v) => handleUpdateSoftware(idx, "domain", v)}
                        placeholder="sub.happycare.vn"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <FieldLabel>Loại Client</FieldLabel>
                      <GlassSelect
                        value={sw.type}
                        onChange={(val) => handleUpdateSoftware(idx, "type", val)}
                        options={SOFTWARE_TYPE_OPTIONS}
                        placeholder="Chọn loại"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 dark:border-white/5">
                    <FieldLabel>Cấu hình Server (Server Config)</FieldLabel>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <FieldLabel>Tên máy chủ / cụm cấu hình</FieldLabel>
                        <TextInput
                          id={`sw-server-name-${idx}`}
                          value={sw.serverConfig.name}
                          onChange={(v) =>
                            handleUpdateSoftwareServerConfig(idx, "name", v)
                          }
                          placeholder="Ví dụ: prod-hub-cluster-1"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sw.serverConfig.active}
                            onChange={(e) =>
                              handleUpdateSoftwareServerConfig(
                                idx,
                                "active",
                                e.target.checked
                              )
                            }
                            disabled={isSaving}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5"
                          />
                          <span className="text-xs font-semibold text-gray-700 dark:text-white/60">
                            Kích hoạt kết nối Client Hub
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Ghi chú cho phần mềm</FieldLabel>
                    <TextareaInput
                      id={`sw-note-${idx}`}
                      value={sw.note}
                      onChange={(v) => handleUpdateSoftware(idx, "note", v)}
                      placeholder="Chi tiết cấu hình, tài khoản admin, thời gian bảo trì..."
                      rows={2}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              ))}

              {softwares.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-8 dark:border-white/10">
                  <p className="text-xs text-gray-400 dark:text-white/30">
                    Chưa có phần mềm nào được chọn kích hoạt bản quyền.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSoftware}
                    className="text-xs font-semibold text-indigo-500 transition hover:text-indigo-400"
                    disabled={isSaving}
                  >
                    Bấm vào đây để thêm phần mềm đầu tiên
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col gap-5">
          {/* Chi phí & Thanh toán */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
              Chi phí & Thanh toán
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>Chi phí hàng năm (VND)</FieldLabel>
                <TextInput
                  id="yearly-cost"
                  value={yearlyCost}
                  onChange={(v) => setYearlyCost(parseFloat(v) || 0)}
                  placeholder="Ví dụ: 12000000"
                  type="number"
                  disabled={isSaving}
                />
              </div>
              <div>
                <FieldLabel>Trạng thái thanh toán</FieldLabel>
                <GlassSelect
                  value={oncePaymentStatus}
                  onChange={(val) => setOncePaymentStatus(val)}
                  options={PAYMENT_STATUS_OPTIONS}
                  placeholder="Chọn trạng thái"
                />
              </div>
            </div>
          </section>

          {/* Lưu ý */}
          <section className="rounded-2xl border border-gray-300 bg-gray-50 p-6 dark:border-white/5 dark:bg-white/3">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Lưu ý khi tạo bản quyền
            </h2>
            <div className="space-y-3 text-xs text-gray-500 dark:text-white/40">
              <p>
                Hãy chắc chắn các thông tin liên hệ của khách hàng chính xác để
                gửi thông báo gia hạn bản quyền.
              </p>
              <p>
                Bản hợp đồng đính kèm cần được đồng bộ lên kho lưu trữ trước.
              </p>
              <p>
                Cấu hình server sẽ kích hoạt tự động đồng bộ khi bạn kiểm chọn
                kết nối.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : (
                <FiPlus className="text-sm" />
              )}
              Tạo ngay
            </button>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
