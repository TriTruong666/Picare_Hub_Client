import { motion } from "framer-motion";
import { FiArrowRight, FiFolder } from "react-icons/fi";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/custom_ui/Breadcrumb";
import { Badge } from "@/components/custom_ui/Badge";
import { PATHS } from "@/config/paths";

export type StorageFileType = "image" | "video";

export type StorageFileRecord = {
  id: string;
  name: string;
  size: string;
  mimeLabel: string;
  type: StorageFileType;
  tags: string[];
  thumbnail: string;
  duration?: string;
};

export type StorageFolder = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  totalSize: string;
  lastUpdated: string;
  accent: string;
  cover: string;
  files: StorageFileRecord[];
};

export const storageFolders: StorageFolder[] = [
  {
    id: "marketing-campaigns",
    name: "Marketing Campaigns",
    description:
      "Social cuts, banners, and launch media for current campaigns.",
    itemCount: 18,
    totalSize: "12.4 GB",
    lastUpdated: "2 hours ago",
    accent: "from-red-500/20 to-orange-400/10",
    cover:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    files: [
      {
        id: "mk-1",
        name: "launch-banner-v3.png",
        size: "4.8 MB",
        mimeLabel: "PNG",
        type: "image",
        tags: ["campaign", "hero", "approved"],
        thumbnail:
          "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "mk-2",
        name: "teaser-reel-cut01.mp4",
        size: "148 MB",
        mimeLabel: "MP4",
        type: "video",
        tags: ["video", "short-form", "priority"],
        thumbnail:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
        duration: "00:32",
      },
      {
        id: "mk-3",
        name: "creator-brief-cover.jpg",
        size: "2.1 MB",
        mimeLabel: "JPG",
        type: "image",
        tags: ["brief", "creative"],
        thumbnail:
          "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "clinic-uploads",
    name: "Clinic Uploads",
    description: "Raw images and videos sent from clinics before processing.",
    itemCount: 42,
    totalSize: "31.8 GB",
    lastUpdated: "15 minutes ago",
    accent: "from-blue-500/20 to-cyan-400/10",
    cover:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    files: [
      {
        id: "cl-1",
        name: "patient-room-overview.mov",
        size: "412 MB",
        mimeLabel: "MOV",
        type: "video",
        tags: ["raw", "clinic", "review"],
        thumbnail:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
        duration: "01:48",
      },
      {
        id: "cl-2",
        name: "equipment-angle-02.png",
        size: "5.2 MB",
        mimeLabel: "PNG",
        type: "image",
        tags: ["equipment", "reference"],
        thumbnail:
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "cl-3",
        name: "walkthrough-stabilized.mp4",
        size: "228 MB",
        mimeLabel: "MP4",
        type: "video",
        tags: ["stabilized", "tour"],
        thumbnail:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
        duration: "02:14",
      },
    ],
  },
  {
    id: "brand-archive",
    name: "Brand Archive",
    description:
      "Evergreen image library, logos, and long-term brand references.",
    itemCount: 76,
    totalSize: "9.7 GB",
    lastUpdated: "Yesterday",
    accent: "from-purple-500/20 to-pink-400/10",
    cover:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    files: [
      {
        id: "ba-1",
        name: "logo-lockup-dark.svg",
        size: "180 KB",
        mimeLabel: "SVG",
        type: "image",
        tags: ["logo", "brand"],
        thumbnail:
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "ba-2",
        name: "brand-film-master.mp4",
        size: "982 MB",
        mimeLabel: "MP4",
        type: "video",
        tags: ["brand-film", "master"],
        thumbnail:
          "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
        duration: "03:42",
      },
      {
        id: "ba-3",
        name: "editorial-shot-07.jpg",
        size: "3.7 MB",
        mimeLabel: "JPG",
        type: "image",
        tags: ["editorial", "approved"],
        thumbnail:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
];

export function getStorageFolder(folderId?: string) {
  return storageFolders.find((folder) => folder.id === folderId) ?? null;
}

export default function StorageDashboardPage() {
  return (
    <div className="page-layout">
      <div className="mb-6 flex flex-col">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
            { label: "Lưu trữ" },
          ]}
        />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
          Lưu trữ
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {storageFolders.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <Link
              to={`${PATHS.DASHBOARD.STORAGE}/${folder.id}`}
              className="group block overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
            >
              <div
                className={`relative overflow-hidden bg-gradient-to-br p-5 ${folder.accent} border-b border-gray-300 dark:border-white/10`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 text-gray-900 shadow-sm backdrop-blur dark:bg-black/40 dark:text-white">
                      <FiFolder className="text-xl" />
                    </span>
                    <Badge type="info" value={`${folder.itemCount} files`} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase tabular-nums dark:text-gray-400">
                    {folder.totalSize}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                    {folder.name}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {folder.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-300 pt-3 dark:border-white/10">
                  <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {folder.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white">
                    Truy cập
                    <FiArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
