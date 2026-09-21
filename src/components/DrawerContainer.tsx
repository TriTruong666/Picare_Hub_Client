import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { drawerAtom, closeDrawerAtom } from "@/stores/drawerStore";
import { useAtom } from "jotai";
import { AccountDetailDrawer } from "./drawers/AccountDetailDrawer";

export default function DrawerContainer() {
  const [drawerKey] = useAtom(drawerAtom);
  const [, closeDrawer] = useAtom(closeDrawerAtom);

  useEffect(() => {
    if (!drawerKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerKey, closeDrawer]);

  return (
    <AnimatePresence>
      {drawerKey && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeDrawer()}
            className="fixed inset-0 z-40 bg-black/80"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex shadow-2xl will-change-transform"
          >
            {drawerKey === "account_detail" && <AccountDetailDrawer />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
