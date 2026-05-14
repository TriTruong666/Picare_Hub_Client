import { atom } from "jotai";

type LockType = "account" | null;
type UnlockType = "account" | null;

export type ModalKey = "add_account" | "lock" | "unlock" | null;

export const modalAtom = atom<ModalKey>(null);
export const userIdAtom = atom<string | null>(null);
export const lockTypeAtom = atom<LockType>(null);
export const unlockTypeAtom = atom<UnlockType>(null);
export const isModalLockedAtom = atom(false);

export const openModalAtom = atom(null, (_, set, type: ModalKey) => {
  set(modalAtom, type);
});

export const closeModalAtom = atom(null, (get, set) => {
  if (get(isModalLockedAtom)) return;

  set(modalAtom, null);
  set(userIdAtom, null);
  set(lockTypeAtom, null);
  set(unlockTypeAtom, null);
  set(isModalLockedAtom, false);
});

export const openLockModalAtom = atom(
  null,
  (_, set, type: LockType, userId: string) => {
    set(userIdAtom, userId);
    set(lockTypeAtom, type);
    set(modalAtom, "lock");
  },
);

export const openUnlockModalAtom = atom(
  null,
  (_, set, type: UnlockType, userId: string) => {
    set(userIdAtom, userId);
    set(unlockTypeAtom, type);
    set(modalAtom, "unlock");
  },
);
