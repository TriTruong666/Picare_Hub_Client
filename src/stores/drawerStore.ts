import { atom } from "jotai";
import type { User } from "@/types/User";

export type DrawerKey = "account_detail" | null;

export const drawerAtom = atom<DrawerKey>(null);
export const accountDetailUserAtom = atom<User | null>(null);

export const openDrawerAtom = atom(null, (_, set, key: DrawerKey) => {
  set(drawerAtom, key);
});

export const closeDrawerAtom = atom(null, (_, set) => {
  set(drawerAtom, null);
  set(accountDetailUserAtom, null);
});

export const openAccountDetailDrawerAtom = atom(
  null,
  (_, set, user: User) => {
    set(accountDetailUserAtom, user);
    set(drawerAtom, "account_detail");
  },
);
