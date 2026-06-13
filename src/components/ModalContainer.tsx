import { useAtom } from "jotai";
import { modalAtom, closeModalAtom, selectedUserAtom } from "@/stores/modalStore";
import { AddAccountModal } from "@/components/modals/AddAccountModal";
import { UpdateAccountModal } from "@/components/modals/UpdateAccountModal";

export default function ModalContainer() {
  const [modal] = useAtom(modalAtom);
  const [selectedUser] = useAtom(selectedUserAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div onClick={(event) => event.stopPropagation()}>
        {modal === "add_account" ? <AddAccountModal /> : null}
        {modal === "update_account" && selectedUser ? (
          <UpdateAccountModal key={selectedUser.userId} user={selectedUser} />
        ) : null}
      </div>
    </div>
  );
}
