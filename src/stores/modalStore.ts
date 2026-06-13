import { atom } from "jotai";
import type { User } from "@/types/User";

export type ModalKey = "add_account" | "update_account" | null;

export const modalAtom = atom<ModalKey>(null);
export const selectedUserAtom = atom<User | null>(null);
export const isModalLockedAtom = atom(false);

export const openModalAtom = atom(null, (_, set, type: ModalKey) => {
  set(modalAtom, type);
});

export const closeModalAtom = atom(null, (get, set) => {
  if (get(isModalLockedAtom)) return;

  set(modalAtom, null);
  set(selectedUserAtom, null);
  set(isModalLockedAtom, false);
});

export const openUpdateAccountModalAtom = atom(
  null,
  (_, set, user: User) => {
    set(selectedUserAtom, user);
    set(modalAtom, "update_account");
  },
);
