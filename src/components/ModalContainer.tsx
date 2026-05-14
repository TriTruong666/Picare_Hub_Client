import { useAtom } from "jotai";
import { modalAtom, closeModalAtom, userIdAtom } from "@/stores/modalStore";
import { AddAccountModal } from "@/components/modals/AddAccountModal";

function ActionStateModal({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-neutral-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={closeModal}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
        >
          Dong
        </button>
      </div>
    </div>
  );
}

export default function ModalContainer() {
  const [modal] = useAtom(modalAtom);
  const [userId] = useAtom(userIdAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div onClick={(event) => event.stopPropagation()}>
        {modal === "add_account" ? <AddAccountModal /> : null}
        {modal === "lock" ? (
          <ActionStateModal
            title="Khoa tai khoan"
            description={`Action lock cho user ${userId || ""} chua duoc noi API.`}
          />
        ) : null}
        {modal === "unlock" ? (
          <ActionStateModal
            title="Mo khoa tai khoan"
            description={`Action unlock cho user ${userId || ""} chua duoc noi API.`}
          />
        ) : null}
      </div>
    </div>
  );
}
