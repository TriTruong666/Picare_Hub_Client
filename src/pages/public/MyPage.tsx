import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import RotatingText, {
  type RotatingTextRef,
} from "@/components/reactbit/RotatingText";
import Beams from "@/components/reactbit/Beams";
import DarkVeil from "@/components/reactbit/DarkVeil";
import Masonry from "@/components/reactbit/Masonry";
import SideRays from "@/components/reactbit/SideRay";
const INVITATION_MESSAGE =
  "Vk ơi, cuối tuần này mình đi chơi nhé.\nCk đã tính sẵn một buổi hẹn nho nhỏ rồi.\nNếu vk đồng ý thì bấm vào nút bên dưới đi.";

const PROFILE_IMAGE_SRC = "/quynh-nhu-profile.jpg";
const FINAL_NODE_TOOLTIP = "Cái cuối sẽ được tiết lộ vào 1 dịp đặc biệt";

const GREETINGS = ["Xin chào", "Hello", "Hallo", "Bonjour"];
const NICKNAMES = [
  "Quỳnh Như",
  "Miboo Nguyen",
  "congchua",
  "boobcatiii",
  "@niiiz52",
];

const PROFILE_DETAILS = [
  { label: "Ngày sinh", value: "05/08/2004" },
  { label: "Biệt danh", value: "Miboo, Bé heo" },
  {
    label: "Món ăn",
    value:
      "Matcha latte, ốc len xào dừa, cút lộn xào me, mì xào ốc móng tay, đồ Nhật, trà sữa Đài Loan trân châu khoai môn và vô vàn món mà ck chưa biết...",
  },
  {
    label: "Đặc điểm",
    value:
      "Xinh (nhất thế giới), lỳ như trâu (số 2 không ai số 1), siu dăm (khó nói), tướng nét như Sinbad (trom via), thích hoa, đánh liqi ngu, đau lưng (già), quả cười đỉnh nhất VN.",
  },
];

const STAGES = [
  { id: 1, label: "01", name: "Lời chào" },
  { id: 2, label: "02", name: "Quỳnh Như" },
  { id: 3, label: "03", name: "Đặc biệt" },
  { id: 4, label: "04", name: "Lời mời" },
  { id: 5, label: "05", name: "Khoảnh khắc" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const MEMORIES = [
  {
    id: 1,
    label: "01",
    top: 58,
    left: 10,
    title: "Mốc đầu tiên",
    body: "Đây là modal đầu tiên của chòm sao. Bạn có thể thay phần text này bằng câu chuyện thật đầu tiên mà hai người muốn giữ lại.",
    imageSrc: PROFILE_IMAGE_SRC,
  },
  {
    id: 2,
    label: "02",
    top: 38,
    left: 27,
    title: "Mốc thứ hai",
    body: "Node này chỉ mở sau khi mốc đầu tiên đã được xem xong, để cảm giác như đang lần theo một đường sao thật sự.",
    imageSrc: PROFILE_IMAGE_SRC,
  },
  {
    id: 3,
    label: "03",
    top: 55,
    left: 43,
    title: "Mốc thứ ba",
    body: "Từng modal có thể là một kỷ ức, một tấm ảnh, hoặc một đoạn chữ dài hơn khi bạn bắt đầu điền nội dung thật.",
    imageSrc: PROFILE_IMAGE_SRC,
  },
  {
    id: 4,
    label: "04",
    top: 32,
    left: 59,
    title: "Mốc thứ tư",
    body: "Đường nối sẽ tiếp tục sáng dần về phía trước. Nhịp mở khóa tuần tự giúp stage này có cảm giác được khám phá thay vì hiện ra một lần.",
    imageSrc: PROFILE_IMAGE_SRC,
  },
  {
    id: 5,
    label: "05",
    top: 50,
    left: 75,
    title: "Mốc thứ năm",
    body: "Đây là mốc cuối đang mở. Đọc xong modal này thì node thứ sáu mới lộ diện, nhưng vẫn giữ trạng thái khóa đúng như ý đồ.",
    imageSrc: PROFILE_IMAGE_SRC,
  },
  {
    id: 6,
    label: "06",
    top: 29,
    left: 90,
    title: "Mốc cuối",
    body: FINAL_NODE_TOOLTIP,
    imageSrc: PROFILE_IMAGE_SRC,
    disabled: true,
  },
] as const;

const createStars = (
  count: number,
  sizeMin: number,
  sizeMax: number,
  opacityMin: number,
  opacityMax: number,
) =>
  Array.from({ length: count }, (_, index) => {
    const seed = index * 19.371;
    const top = (Math.sin(seed * 1.13) * 0.5 + 0.5) * 100;
    const left = (Math.cos(seed * 1.71) * 0.5 + 0.5) * 100;
    const size =
      sizeMin + (Math.sin(seed * 2.41) * 0.5 + 0.5) * (sizeMax - sizeMin);
    const opacity =
      opacityMin +
      (Math.cos(seed * 1.97) * 0.5 + 0.5) * (opacityMax - opacityMin);
    const scale = 0.82 + (Math.sin(seed * 0.83) * 0.5 + 0.5) * 0.54;

    return {
      id: `${count}-${index}`,
      top,
      left,
      size,
      opacity,
      scale,
    };
  });

const MASONRY_ITEMS = [
  {
    id: "1",
    img: "https://picsum.photos/id/1015/600/900",
    url: "https://example.com/one",
    height: 420,
  },
  {
    id: "2",
    img: "https://picsum.photos/id/1011/600/750",
    url: "https://example.com/two",
    height: 280,
  },
  {
    id: "3",
    img: "https://picsum.photos/id/1020/600/800",
    url: "https://example.com/three",
    height: 520,
  },
  {
    id: "4",
    img: "https://picsum.photos/id/1025/600/860",
    url: "https://example.com/four",
    height: 460,
  },
  {
    id: "5",
    img: "https://picsum.photos/id/1035/600/700",
    url: "https://example.com/five",
    height: 300,
  },
  {
    id: "6",
    img: "https://picsum.photos/id/1039/600/920",
    url: "https://example.com/six",
    height: 560,
  },
  {
    id: "7",
    img: "https://picsum.photos/id/1040/600/760",
    url: "https://example.com/seven",
    height: 360,
  },
  {
    id: "8",
    img: "https://picsum.photos/id/1043/600/860",
    url: "https://example.com/eight",
    height: 480,
  },
  {
    id: "9",
    img: "https://picsum.photos/id/1050/600/780",
    url: "https://example.com/nine",
    height: 340,
  },
  {
    id: "10",
    img: "https://picsum.photos/id/1067/600/940",
    url: "https://example.com/ten",
    height: 580,
  },
  {
    id: "11",
    img: "https://picsum.photos/id/1074/600/820",
    url: "https://example.com/eleven",
    height: 410,
  },
  {
    id: "12",
    img: "https://picsum.photos/id/1084/600/760",
    url: "https://example.com/twelve",
    height: 330,
  },
  {
    id: "13",
    img: "https://picsum.photos/id/1080/600/930",
    url: "https://example.com/thirteen",
    height: 570,
  },
  {
    id: "14",
    img: "https://picsum.photos/id/1081/600/780",
    url: "https://example.com/fourteen",
    height: 350,
  },
  {
    id: "15",
    img: "https://picsum.photos/id/1082/600/860",
    url: "https://example.com/fifteen",
    height: 470,
  },
  {
    id: "16",
    img: "https://picsum.photos/id/1083/600/900",
    url: "https://example.com/sixteen",
    height: 500,
  },
  {
    id: "17",
    img: "https://picsum.photos/id/1084/600/880",
    url: "https://example.com/seventeen",
    height: 455,
  },
  {
    id: "18",
    img: "https://picsum.photos/id/1085/600/760",
    url: "https://example.com/eighteen",
    height: 320,
  },
  {
    id: "19",
    img: "https://picsum.photos/id/1081/600/980",
    url: "https://example.com/nineteen",
    height: 600,
  },
  {
    id: "20",
    img: "https://picsum.photos/id/1077/600/840",
    url: "https://example.com/twenty",
    height: 430,
  },
] as const;

export default function MyPage() {
  const [activeStage, setActiveStage] = useState<StageId>(1);
  const [transitionTargetStage, setTransitionTargetStage] =
    useState<StageId>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [openMemoryId, setOpenMemoryId] = useState<number | null>(null);
  const [visibleMemoryCount, setVisibleMemoryCount] = useState(1);
  const [visibleLineCount, setVisibleLineCount] = useState(1);
  const [unlockedStage, setUnlockedStage] = useState<StageId>(1);
  const [isInvitationComplete, setIsInvitationComplete] = useState(false);
  const [hasAcceptedInvitation, setHasAcceptedInvitation] = useState(false);
  const [invitationTypingSession, setInvitationTypingSession] = useState(0);
  const [galleryTypingSession, setGalleryTypingSession] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stageThreeSceneRef = useRef<HTMLDivElement>(null);
  const stageFourAreaRef = useRef<HTMLDivElement>(null);
  const invitationTextRef = useRef<HTMLSpanElement>(null);
  const galleryTextRef = useRef<HTMLSpanElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const activeLineRef = useRef<SVGLineElement>(null);
  const nameRotatingTextRef = useRef<RotatingTextRef>(null);
  const transitionCleanupRef = useRef<gsap.core.Timeline | null>(null);
  const closeModalButtonRef = useRef<HTMLButtonElement>(null);
  const memoryTimeoutRef = useRef<number | null>(null);
  const inviteTypingTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const galleryTypingTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const activeStageIndex = useMemo(
    () => STAGES.findIndex((stage) => stage.id === activeStage),
    [activeStage],
  );
  const visibleStages = useMemo(
    () => STAGES.filter((stage) => stage.id <= unlockedStage),
    [unlockedStage],
  );
  const canAdvanceFromCurrentStage = useMemo(() => {
    if (activeStage === 3) {
      return visibleMemoryCount >= 5;
    }

    if (activeStage === 4) {
      return false;
    }

    return activeStage < STAGES.length;
  }, [activeStage, visibleMemoryCount]);
  const farStars = useMemo(() => createStars(230, 0.5, 1.5, 0.14, 0.5), []);
  const midStars = useMemo(() => createStars(95, 0.9, 2.4, 0.2, 0.7), []);
  const nearStars = useMemo(() => createStars(34, 1.5, 3.8, 0.3, 0.88), []);
  const visibleNodes = useMemo(
    () => MEMORIES.filter((memory) => memory.id <= visibleMemoryCount),
    [visibleMemoryCount],
  );
  const visibleLineNodes = useMemo(
    () => MEMORIES.filter((memory) => memory.id <= visibleLineCount),
    [visibleLineCount],
  );
  const completedLineSegments = useMemo(() => {
    const segments: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];

    for (let index = 0; index < Math.max(visibleLineCount - 2, 0); index += 1) {
      const from = MEMORIES[index];
      const to = MEMORIES[index + 1];
      if (!from || !to) continue;
      segments.push({
        id: `${from.id}-${to.id}`,
        x1: from.left,
        y1: from.top,
        x2: to.left,
        y2: to.top,
      });
    }

    return segments;
  }, [visibleLineCount]);
  const animatedLineSegment = useMemo(() => {
    if (visibleLineCount <= 1) return null;

    const from = MEMORIES[visibleLineCount - 2];
    const to = MEMORIES[visibleLineCount - 1];
    if (!from || !to) return null;

    return {
      id: `${from.id}-${to.id}`,
      x1: from.left,
      y1: from.top,
      x2: to.left,
      y2: to.top,
    };
  }, [visibleLineCount]);
  const activeMemory = useMemo(
    () => MEMORIES.find((memory) => memory.id === openMemoryId) ?? null,
    [openMemoryId],
  );

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = document.querySelector(
      'meta[name="description"]',
    );
    const previousDescription =
      descriptionElement?.getAttribute("content") ?? "";

    document.title = "Quỳnh Như";
    descriptionElement?.setAttribute(
      "content",
      "Xin chào vk, ck có một bất ngờ nhỏ dành cho vk, vk vào xem đi nhé",
    );

    return () => {
      document.title = previousTitle;
      descriptionElement?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    const rotationInterval = 4200;
    const startDelay = 1600;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      nameRotatingTextRef.current?.next();

      intervalId = window.setInterval(() => {
        nameRotatingTextRef.current?.next();
      }, rotationInterval);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (isTransitioning) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 28, filter: "blur(10px)", scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
        },
      );
    });

    return () => ctx.revert();
  }, [activeStage, isTransitioning]);

  useEffect(() => {
    return () => {
      transitionCleanupRef.current?.kill();
      if (memoryTimeoutRef.current) {
        window.clearTimeout(memoryTimeoutRef.current);
      }
      inviteTypingTimelineRef.current?.kill();
      galleryTypingTimelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!openMemoryId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeoutId = window.setTimeout(() => {
      closeModalButtonRef.current?.focus();
    }, 60);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = previousOverflow;
    };
  }, [openMemoryId]);

  useEffect(() => {
    if (activeStage !== 3 || !animatedLineSegment || !activeLineRef.current) {
      return;
    }

    const line = activeLineRef.current;
    const length = line.getTotalLength();

    gsap.killTweensOf(line);
    gsap.set(line, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    gsap.to(line, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: "power2.out",
    });
  }, [activeStage, animatedLineSegment]);

  useEffect(() => {
    inviteTypingTimelineRef.current?.kill();
    inviteTypingTimelineRef.current = null;

    const textElement = invitationTextRef.current;
    if (activeStage !== 4 || invitationTypingSession === 0 || !textElement) {
      return;
    }

    textElement.textContent = "";
    setIsInvitationComplete(false);
    setHasAcceptedInvitation(false);
    if (noButtonRef.current) {
      gsap.set(noButtonRef.current, { x: 0, y: 0 });
    }

    // if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    //   textElement.textContent = INVITATION_MESSAGE;
    //   setIsInvitationComplete(true);
    //   return;
    // }

    const typingProgress = { value: 0 };
    const timeline = gsap.timeline({
      delay: 0.45,
      onComplete: () => {
        textElement.textContent = INVITATION_MESSAGE;
        setIsInvitationComplete(true);
        inviteTypingTimelineRef.current = null;
      },
    });

    timeline.to(typingProgress, {
      value: INVITATION_MESSAGE.length,
      duration: 6.2,
      ease: "none",
      onUpdate: () => {
        textElement.textContent = INVITATION_MESSAGE.slice(
          0,
          Math.floor(typingProgress.value),
        );
      },
    });
    inviteTypingTimelineRef.current = timeline;

    return () => {
      timeline.kill();
      inviteTypingTimelineRef.current = null;
    };
  }, [activeStage, invitationTypingSession]);

  useEffect(() => {
    galleryTypingTimelineRef.current?.kill();
    galleryTypingTimelineRef.current = null;

    const textElement = galleryTextRef.current;
    const galleryMessage = "Chúc Miboo của anh tất cả ♡";
    if (activeStage !== 5 || galleryTypingSession === 0 || !textElement) {
      return;
    }

    textElement.textContent = "";

    const typingProgress = { value: 0 };
    const timeline = gsap.timeline({
      delay: 0.18,
      onComplete: () => {
        textElement.textContent = galleryMessage;
        galleryTypingTimelineRef.current = null;
      },
    });

    timeline.to(typingProgress, {
      value: galleryMessage.length,
      duration: 2.9,
      ease: "none",
      onUpdate: () => {
        textElement.textContent = galleryMessage.slice(
          0,
          Math.floor(typingProgress.value),
        );
      },
    });

    galleryTypingTimelineRef.current = timeline;

    return () => {
      timeline.kill();
      galleryTypingTimelineRef.current = null;
    };
  }, [activeStage, galleryTypingSession]);

  useEffect(() => {
    if (activeStage === 2) {
      setUnlockedStage((current) => (current < 2 ? 2 : current));
      return;
    }

    if (activeStage === 3) {
      setUnlockedStage((current) => {
        if (visibleMemoryCount >= 5) {
          return current < 4 ? 4 : current;
        }

        return current < 3 ? 3 : current;
      });
      return;
    }

    if (activeStage === 5) {
      setUnlockedStage((current) => (current < 5 ? 5 : current));
    }
  }, [activeStage, visibleMemoryCount]);

  const closeMemoryModal = () => {
    if (!activeMemory) return;

    setOpenMemoryId(null);
    if (
      activeMemory.id === visibleMemoryCount &&
      activeMemory.id < MEMORIES.length
    ) {
      const nextId = activeMemory.id + 1;
      setVisibleLineCount(nextId);
      if (memoryTimeoutRef.current) {
        window.clearTimeout(memoryTimeoutRef.current);
      }
      memoryTimeoutRef.current = window.setTimeout(() => {
        setVisibleMemoryCount(nextId);
        memoryTimeoutRef.current = null;
      }, 1600);
    }
  };

  const openMemoryModal = (memoryId: number) => {
    const memory = MEMORIES.find((item) => item.id === memoryId);
    const scene = stageThreeSceneRef.current;

    if (!memory || !scene) {
      setOpenMemoryId(memoryId);
      return;
    }

    if (memoryTimeoutRef.current) {
      window.clearTimeout(memoryTimeoutRef.current);
      memoryTimeoutRef.current = null;
    }

    gsap.killTweensOf(scene);
    gsap.fromTo(
      scene,
      {
        scale: 1,
        x: 0,
        y: 0,
        transformOrigin: `${memory.left}% ${memory.top}%`,
      },
      {
        scale: 1.32,
        x: (50 - memory.left) * 4.2,
        y: (50 - memory.top) * 3.8,
        duration: 0.72,
        ease: "power3.out",
        onComplete: () => {
          window.setTimeout(() => {
            setOpenMemoryId(memoryId);
            gsap.to(scene, {
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              delay: 0.08,
            });
          }, 120);
        },
      },
    );
  };

  const getNextStageId = (stage: StageId): StageId => {
    const nextStage = STAGES.find((item) => item.id === stage + 1);
    return nextStage?.id ?? stage;
  };

  const handleStageChange = (nextStage: StageId) => {
    const movingBackward = nextStage < activeStage;
    const isSequentialNext = nextStage === activeStage + 1;
    const canOpenStage =
      nextStage <= unlockedStage ||
      (isSequentialNext && canAdvanceFromCurrentStage);

    if (
      nextStage === activeStage ||
      isTransitioning ||
      (!movingBackward && !canOpenStage)
    ) {
      return;
    }

    setIsTransitioning(true);
    setTransitionTargetStage(nextStage);
    transitionCleanupRef.current?.kill();

    gsap.set(overlayRef.current, {
      pointerEvents: "auto",
      opacity: 0,
    });
    gsap.set(overlayTextRef.current, {
      opacity: 0,
      y: 24,
      scale: 0.96,
    });

    const closeTimeline = gsap.timeline({
      onComplete: () => {
        flushSync(() => {
          setActiveStage(nextStage);
        });

        gsap.set(contentRef.current, {
          opacity: 0.08,
          scale: 0.96,
          filter: "blur(16px)",
        });

        const revealTimeline = gsap.timeline({
          onComplete: () => {
            gsap.set(overlayRef.current, {
              pointerEvents: "none",
              opacity: 0,
            });
            setIsTransitioning(false);
            if (nextStage === 4) {
              setInvitationTypingSession((session) => session + 1);
            }
            if (nextStage === 5) {
              setGalleryTypingSession((session) => session + 1);
            }
          },
        });

        transitionCleanupRef.current = revealTimeline;

        revealTimeline
          .to(
            contentRef.current,
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.72,
              ease: "power3.out",
            },
            0.08,
          )
          .to(
            overlayTextRef.current,
            {
              opacity: 0,
              y: -18,
              scale: 1.02,
              duration: 0.28,
              ease: "power2.in",
            },
            0,
          )
          .to(
            overlayRef.current,
            {
              opacity: 0,
              duration: 0.52,
              ease: "power2.out",
            },
            0.16,
          );
      },
    });

    transitionCleanupRef.current = closeTimeline;

    closeTimeline
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.34,
        ease: "power2.out",
      })
      .to(
        contentRef.current,
        {
          scale: 0.94,
          opacity: 0.08,
          filter: "blur(18px)",
          duration: 0.34,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        overlayTextRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: "power3.out",
        },
        0.08,
      )
      .to({}, { duration: 0.18 });
  };

  const moveNoButton = (pointerX?: number, pointerY?: number) => {
    const button = noButtonRef.current;

    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const paddingX = Math.max(buttonRect.width / 2 + 24, 72);
    const paddingY = Math.max(buttonRect.height / 2 + 24, 64);
    const currentCenterX = buttonRect.left + buttonRect.width / 2;
    const currentCenterY = buttonRect.top + buttonRect.height / 2;
    const currentX = Number(gsap.getProperty(button, "x")) || 0;
    const currentY = Number(gsap.getProperty(button, "y")) || 0;
    let targetX = currentCenterX;
    let targetY = currentCenterY;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateX =
        paddingX +
        Math.random() * Math.max(window.innerWidth - paddingX * 2, 1);
      const candidateY =
        paddingY +
        Math.random() * Math.max(window.innerHeight - paddingY * 2, 1);
      const distanceFromCurrent = Math.hypot(
        candidateX - currentCenterX,
        candidateY - currentCenterY,
      );
      const distanceFromPointer =
        typeof pointerX === "number" && typeof pointerY === "number"
          ? Math.hypot(candidateX - pointerX, candidateY - pointerY)
          : Number.POSITIVE_INFINITY;

      targetX = candidateX;
      targetY = candidateY;
      if (distanceFromCurrent > 260 && distanceFromPointer > 220) break;
    }

    const nextX = currentX + targetX - currentCenterX;
    const nextY = currentY + targetY - currentCenterY;
    gsap.to(button, {
      x: nextX,
      y: nextY,
      duration: 0.42,
      ease: "power4.out",
      overwrite: true,
    });
  };

  const renderStage = () => {
    if (activeStage === 1) {
      return (
        <section className="relative flex min-h-screen items-center justify-center px-6">
          <div
            ref={contentRef}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              <RotatingText
                texts={GREETINGS}
                mainClassName="font-ephesis justify-center overflow-hidden px-1 text-[clamp(2.85rem,7vw,5rem)] leading-none text-white/88"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.04}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{
                  type: "spring",
                  damping: 36,
                  stiffness: 180,
                  mass: 1.1,
                }}
                rotationInterval={4200}
                splitBy="characters"
                auto
                loop
              />

              <RotatingText
                ref={nameRotatingTextRef}
                texts={NICKNAMES}
                mainClassName="font-ephesis inline-flex max-w-full justify-center overflow-hidden px-1 text-[clamp(2.7rem,7.2vw,5.2rem)] leading-none text-[#f6d2df]"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.04}
                splitLevelClassName="overflow-hidden pb-1"
                elementLevelClassName="will-change-transform"
                transition={{
                  type: "spring",
                  damping: 36,
                  stiffness: 180,
                  mass: 1.1,
                }}
                rotationInterval={4200}
                splitBy="characters"
                auto={false}
                loop
              />
            </div>
          </div>
        </section>
      );
    }

    if (activeStage === 2) {
      return (
        <section className="relative flex min-h-screen items-center px-6 py-14 md:px-10 xl:px-16">
          <div className="absolute inset-0 -z-10 opacity-70">
            <Beams
              beamWidth={2.2}
              beamHeight={16}
              beamNumber={12}
              lightColor="#f6d2df"
              speed={1.25}
              noiseIntensity={1.45}
              scale={0.22}
              rotation={-8}
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(246,210,223,0.14),transparent_30%),linear-gradient(180deg,rgba(5,5,5,0.36),rgba(5,5,5,0.82))]" />

          <div
            ref={contentRef}
            className="mx-auto grid w-full max-w-[92rem] items-center gap-8 lg:grid-cols-[minmax(20rem,0.95fr)_minmax(24rem,1.05fr)] lg:gap-14"
          >
            <div className="order-2 flex flex-col gap-7 lg:order-1">
              <div className="space-y-3">
                <p className="font-ephesis text-[clamp(2.7rem,5vw,4.2rem)] leading-none text-[#f6d2df]/88">
                  Miboo
                </p>
                <h2 className="font-over text-[66px] leading-[0.88] text-white">
                  Nguyễn Quỳnh Như
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
                {PROFILE_DETAILS.map((detail, index) => (
                  <div
                    key={detail.label}
                    className={`border-white/10 pb-5 ${
                      index < PROFILE_DETAILS.length - 2
                        ? "border-b"
                        : "border-b md:border-b-0"
                    }`}
                  >
                    <p className="mb-2 text-sm leading-6 text-white/34">
                      {detail.label}
                    </p>
                    <p className="text-base leading-7 text-white/86">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-[34rem]">
                <div className="absolute -inset-6 rounded-[2.4rem] bg-[radial-gradient(circle_at_top_left,rgba(246,210,223,0.2),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_45%)] blur-2xl" />
                <div className="absolute top-0 left-0 h-full w-px bg-white/10" />
                <div className="absolute right-0 bottom-0 h-px w-full bg-white/10" />

                {imageFailed ? (
                  <div className="relative flex aspect-[4/5] items-end overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(255,241,246,0.14),rgba(255,255,255,0.04))] px-7 py-8">
                    <div className="absolute top-6 -left-10 h-28 w-28 rounded-full bg-[#f6d2df]/16 blur-3xl" />
                    <div className="absolute right-4 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                      <p className="font-ephesis text-5xl leading-none text-[#f6d2df]">
                        Quỳnh Như
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={PROFILE_IMAGE_SRC}
                    alt="Nguyễn Quỳnh Như"
                    className="relative aspect-[4/5] w-full rounded-[2rem] border border-white/8 object-cover object-center shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
                    onError={() => setImageFailed(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (activeStage === 4) {
      return (
        <section className="relative min-h-screen overflow-hidden px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(246,210,223,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#050505_0%,#0d0a0d_52%,#050505_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-[14%] -z-10 mx-auto h-44 w-[78vw] max-w-5xl rounded-full bg-[#f6d2df]/10 blur-3xl" />

          <div
            ref={contentRef}
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
          >
            <div className="w-full max-w-6xl">
              <p className="font-ephesis text-[clamp(1.6rem,2.8vw,2.55rem)] leading-[1.24] whitespace-pre-line text-white/92">
                <span ref={invitationTextRef} />
                <span
                  aria-hidden="true"
                  className={`text-[#f6d2df] ${
                    isInvitationComplete ? "animate-pulse opacity-70" : ""
                  }`}
                >
                  {"\u2060|"}
                </span>
              </p>
            </div>

            <div
              ref={stageFourAreaRef}
              className={`absolute inset-0 z-20 transition-all duration-700 ${
                isInvitationComplete
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-5 opacity-0"
              }`}
              onMouseMove={(event) => {
                const button = noButtonRef.current;
                if (!button) return;

                const rect = button.getBoundingClientRect();
                const dx = event.clientX - (rect.left + rect.width / 2);
                const dy = event.clientY - (rect.top + rect.height / 2);

                if (Math.hypot(dx, dy) < 110) {
                  moveNoButton(event.clientX, event.clientY);
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setHasAcceptedInvitation(true);
                  setUnlockedStage((current) => (current < 5 ? 5 : current));
                  handleStageChange(5);
                }}
                className="absolute top-[75%] left-[calc(50%_-_7rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f6d2df]/30 bg-[#f6d2df]/12 px-8 py-3 text-sm text-[#f9dfea] shadow-[0_12px_40px_rgba(246,210,223,0.08)] transition duration-300 hover:-translate-y-[55%] hover:bg-[#f6d2df]/20"
              >
                Đồng ý
              </button>

              <button
                ref={noButtonRef}
                type="button"
                onMouseEnter={(event) =>
                  moveNoButton(event.clientX, event.clientY)
                }
                onPointerDown={(event) => {
                  event.preventDefault();
                  moveNoButton(event.clientX, event.clientY);
                }}
                onFocus={() => moveNoButton()}
                className="absolute top-[75%] left-[calc(50%_+_7rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/6 px-8 py-3 text-sm text-white/72 backdrop-blur-md"
              >
                Không
              </button>
            </div>

            <p
              className={`absolute top-[84%] left-1/2 -translate-x-1/2 text-sm text-[#f6d2df]/78 transition-all duration-500 ${
                hasAcceptedInvitation
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              Vậy là mặc định vk đồng ý rồi nha.
            </p>
          </div>
        </section>
      );
    }

    if (activeStage === 5) {
      return (
        <section className="relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#050505] px-2 py-2 md:px-3 md:py-3">
          <div ref={contentRef} className="relative h-full w-full">
            <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/40 md:rounded-[2rem]">
              <div className="h-full overflow-y-auto scroll-smooth px-2 py-2 md:px-3 md:py-3">
                <Masonry
                  items={[...MASONRY_ITEMS]}
                  ease="power3.out"
                  duration={1.15}
                  stagger={0.08}
                  animateFrom="bottom"
                  scaleOnHover
                  hoverScale={0.95}
                  blurToFocus
                  colorShiftOnHover={false}
                  grayscale
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(5,5,5,0.2),rgba(5,5,5,0.36)_38%,rgba(5,5,5,0.68))] md:rounded-[2rem]" />
            <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_center,rgba(246,210,223,0.08),transparent_42%)] md:rounded-[2rem]" />

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
              <p className="font-ephesis text-[clamp(1.8rem,3.8vw,3rem)] leading-[1.16] whitespace-pre-line text-white/90">
                <span ref={galleryTextRef} />
                <span className="text-[#f6d2df]">{"\u2060|"}</span>
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative isolate flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <DarkVeil
            hueShift={18}
            noiseIntensity={0.01}
            scanlineIntensity={0.03}
            scanlineFrequency={1.2}
            warpAmount={0.12}
            speed={0.38}
            resolutionScale={0.65}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_45%_52%,rgba(246,210,223,0.12),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(5,5,8,0.08),rgba(5,5,8,0.46))]" />

        <div
          ref={contentRef}
          className="relative z-10 flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-hidden"
          style={{ perspective: "1800px" }}
        >
          <div
            ref={stageThreeSceneRef}
            className="relative h-[100vh] w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="pointer-events-none absolute inset-[-4%]"
              style={{
                transform: "translateZ(-240px) scale(1.18)",
                transformStyle: "preserve-3d",
              }}
            >
              {farStars.map((star) => (
                <span
                  key={star.id}
                  className="absolute rounded-full bg-white/90"
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    transform: `translate3d(-50%, -50%, -180px) scale(${star.scale})`,
                  }}
                />
              ))}
            </div>

            <div
              className="pointer-events-none absolute inset-[-3%]"
              style={{
                transform: "translateZ(-80px) scale(1.1)",
                transformStyle: "preserve-3d",
              }}
            >
              {midStars.map((star) => (
                <span
                  key={star.id}
                  className="absolute rounded-full bg-[#f7d5e1] shadow-[0_0_10px_rgba(247,213,225,0.4)]"
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    transform: `translate3d(-50%, -50%, -70px) scale(${star.scale})`,
                  }}
                />
              ))}
            </div>

            <div
              className="pointer-events-none absolute inset-[-2%]"
              style={{
                transform: "translateZ(100px) scale(1.04)",
                transformStyle: "preserve-3d",
              }}
            >
              {nearStars.map((star) => (
                <span
                  key={star.id}
                  className="absolute rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)]"
                  style={{
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    transform: `translate3d(-50%, -50%, 40px) scale(${star.scale})`,
                    filter: "blur(0.2px)",
                  }}
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-[-18%] rotate-[-17deg] bg-[linear-gradient(105deg,transparent_28%,rgba(246,210,223,0.025)_38%,rgba(255,255,255,0.11)_49%,rgba(246,210,223,0.045)_59%,transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-[-12%] rotate-[-17deg] bg-[linear-gradient(105deg,transparent_34%,rgba(255,255,255,0.035)_45%,rgba(246,210,223,0.1)_50%,rgba(255,255,255,0.025)_57%,transparent_66%)] blur-xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.07),transparent_14%),radial-gradient(circle_at_78%_66%,rgba(246,210,223,0.07),transparent_17%),radial-gradient(circle_at_52%_48%,rgba(255,255,255,0.055),transparent_20%)] blur-2xl" />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {completedLineSegments.map((segment) => (
                <line
                  key={segment.id}
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  stroke="rgba(246,210,223,0.92)"
                  strokeWidth="0.22"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 8px rgba(246,210,223,0.55))"
                />
              ))}
              {animatedLineSegment ? (
                <line
                  ref={activeLineRef}
                  key={animatedLineSegment.id}
                  x1={animatedLineSegment.x1}
                  y1={animatedLineSegment.y1}
                  x2={animatedLineSegment.x2}
                  y2={animatedLineSegment.y2}
                  stroke="rgba(246,210,223,0.92)"
                  strokeWidth="0.22"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 8px rgba(246,210,223,0.55))"
                />
              ) : null}
            </svg>

            {MEMORIES.map((memory) => {
              const isVisible = memory.id <= visibleMemoryCount;
              const isDisabled = Boolean(memory.disabled);

              return (
                <div
                  key={memory.id}
                  className={`group pointer-events-auto absolute z-[60] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                    isVisible
                      ? "opacity-100"
                      : "pointer-events-none scale-50 opacity-0"
                  }`}
                  style={{
                    top: `${memory.top}%`,
                    left: `${memory.left}%`,
                  }}
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    aria-label={
                      isDisabled ? FINAL_NODE_TOOLTIP : `Mở mốc ${memory.label}`
                    }
                    onClick={() => {
                      if (isDisabled) return;
                      openMemoryModal(memory.id);
                    }}
                    className={`relative z-[61] block min-h-11 min-w-11 touch-manipulation p-4 ${
                      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg ${
                        isDisabled ? "bg-white/12" : "bg-[#f6d2df]/30"
                      }`}
                    />
                    <span
                      className={`relative block h-2.5 w-2.5 rounded-full border transition-transform duration-300 group-hover:scale-125 ${
                        isDisabled
                          ? "border-white/24 bg-white/10"
                          : "border-[#f6d2df]/70 bg-[#f6d2df]"
                      }`}
                      style={{
                        boxShadow: isDisabled
                          ? "0 0 12px rgba(255,255,255,0.14)"
                          : "0 0 20px rgba(246,210,223,0.9)",
                      }}
                    />
                  </button>

                  {isDisabled ? (
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-center text-xs leading-5 text-white/72 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
                      {FINAL_NODE_TOOLTIP}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {activeMemory ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/64 p-4 backdrop-blur-md">
            <button
              type="button"
              aria-label="Đóng modal"
              className="absolute inset-0"
              onClick={closeMemoryModal}
            />

            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,12,0.96),rgba(18,12,16,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
              <div className="grid gap-0 md:grid-cols-[minmax(16rem,22rem)_1fr]">
                <div className="relative min-h-[22rem] bg-black/30">
                  {imageFailed ? (
                    <div className="flex h-full min-h-[22rem] items-end bg-[radial-gradient(circle_at_top,rgba(246,210,223,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6">
                      <p className="font-ephesis text-5xl leading-none text-[#f6d2df]">
                        {activeMemory.label}
                      </p>
                    </div>
                  ) : (
                    <img
                      src={activeMemory.imageSrc}
                      alt={activeMemory.title}
                      className="h-full min-h-[22rem] w-full object-cover object-center"
                      onError={() => setImageFailed(true)}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.74))]" />
                </div>

                <div className="flex flex-col justify-between gap-8 p-6 md:p-8">
                  <div>
                    <p className="text-sm text-white/38">
                      {activeMemory.label}
                    </p>
                    <h3 className="font-over mt-3 text-[clamp(2rem,4vw,3rem)] leading-[0.92] text-white">
                      {activeMemory.title}
                    </h3>
                    <p className="mt-5 max-w-[34rem] text-base leading-8 text-white/74">
                      {activeMemory.body}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      ref={closeModalButtonRef}
                      type="button"
                      onClick={closeMemoryModal}
                      className="rounded-full border border-[#f6d2df]/24 bg-[#f6d2df]/10 px-5 py-2.5 text-sm text-[#f6d2df] transition hover:bg-[#f6d2df]/16"
                    >
                      Đọc xong rồi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {activeStage === 1 ? (
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_28%),linear-gradient(180deg,_rgba(5,5,5,0.08)_0%,_rgba(5,5,5,0.22)_36%,_rgba(5,5,5,0.6)_100%)]" />
          <SideRays
            className="h-full w-full"
            rayColor1="#f2d0dc"
            rayColor2="#fff3f7"
            speed={1}
            intensity={1.8}
            spread={1.18}
            tilt={-10}
            saturation={1.15}
            blend={0.5}
            falloff={1.85}
            opacity={0.62}
            origin="top-left"
          />
        </div>
      ) : null}

      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,210,223,0.16),transparent_24%),linear-gradient(180deg,rgba(5,5,5,0.96),rgba(5,5,5,1))]" />
        <div
          ref={overlayTextRef}
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
        >
          <span className="font-ephesis text-[clamp(3.5rem,8vw,6rem)] leading-none text-[#f6d2df]">
            {STAGES.find((stage) => stage.id === transitionTargetStage)?.label}
          </span>
          <span className="mt-3 text-base text-white/68">
            {STAGES.find((stage) => stage.id === transitionTargetStage)?.name}
          </span>
        </div>
      </div>

      <div className="relative z-10">{renderStage()}</div>

      <div className="fixed top-1/2 right-5 z-30 -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {visibleStages.map((stage) => {
            const isActive = stage.id === activeStage;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageChange(stage.id)}
                disabled={isTransitioning}
                className={`group flex items-center justify-end gap-3 transition-all ${
                  isTransitioning ? "cursor-wait opacity-60" : ""
                }`}
              >
                <span
                  className={`text-sm leading-none transition-opacity ${
                    isActive
                      ? "text-white/78"
                      : "text-white/26 group-hover:text-white/52"
                  }`}
                >
                  {stage.name}
                </span>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition-all ${
                    isActive
                      ? "border-[#f6d2df]/38 bg-[#f6d2df]/12 text-[#f6d2df]"
                      : "border-white/12 bg-white/4 text-white/54 group-hover:border-white/24 group-hover:bg-white/7 group-hover:text-white/82"
                  }`}
                >
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              handleStageChange(STAGES[Math.max(activeStageIndex - 1, 0)].id)
            }
            disabled={activeStageIndex === 0 || isTransitioning}
            className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Trước
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => handleStageChange(getNextStageId(activeStage))}
            disabled={
              activeStageIndex === STAGES.length - 1 ||
              isTransitioning ||
              !canAdvanceFromCurrentStage
            }
            className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Sau
          </button>
        </div>
      </div>
    </main>
  );
}
