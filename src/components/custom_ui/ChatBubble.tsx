import { motion } from "framer-motion";
import clsx from "clsx";

interface ChatBubbleProps {
  message: string;
  sender: "me" | "other";
  timestamp?: string;
  isEdited?: boolean;
  senderName?: string;
  avatarUrl?: string | null;
}

export function ChatBubble({
  message,
  sender,
  timestamp,
  isEdited,
  senderName,
  avatarUrl,
}: ChatBubbleProps) {
  const isMe = sender === "me";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={clsx(
        "group flex w-full gap-2",
        isMe ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar for other senders */}
      {!isMe && (
        <div className="group/avatar relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#de3c3c]/10 text-[10px] font-bold text-[#de3c3c]">
          {/* Mini Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100">
            {senderName || "Người dùng"}
          </div>

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={senderName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            senderName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "U"
          )}
        </div>
      )}

      <div
        className={clsx(
          "flex max-w-[75%] flex-col gap-1",
          isMe ? "items-end" : "items-start",
        )}
      >
        <div
          className={clsx(
            "rounded-2xl px-4 py-2 text-[13px] leading-relaxed shadow-sm transition-all duration-200",
            isMe
              ? "rounded-br-none bg-[#de3c3c] text-white"
              : "rounded-bl-none bg-white/10 text-white/80 backdrop-blur-md",
          )}
        >
          {message}
        </div>
        {timestamp && (
          <span
            className={clsx(
              "text-[10px] text-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              isMe ? "pr-1" : "pl-1",
            )}
          >
            {timestamp}
            {isEdited && " · đã chỉnh sửa"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
export function TypingBubble() {
  return (
    <div className="flex">
      <div className="flex gap-1 rounded-2xl bg-white/10 px-3 py-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
