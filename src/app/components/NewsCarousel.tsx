import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gem,
  KeyRound,
  Package,
  Shirt,
  Smartphone,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ik1 from "../../assets/ik1.png";
import ik2 from "../../assets/ik2.png";
import ik3 from "../../assets/ik3.png";
import ik4 from "../../assets/ik4.png";

interface NewsCarouselProps {
  onNavigate?: (view: string) => void;
}

const newsData = [
  {
    id: 1,
    title: "",
    description: "",
    image: ik1,
  },
  {
    id: 2,
    title: "",
    description: "",
    image: ik2,
  },
  {
    id: 3,
    title: "Statistik Lost & Found Kampus",
    description:
      "Lebih dari 200+ barang berhasil dikembalikan tahun ini dengan tingkat keberhasilan pengembalian mencapai 75% di lingkungan kampus.",
    image: ik3,
  },
  {
    id: 4,
    title: "",
    description: "",
    image: ik4,
  },
];

const browseCategories = [
  { id: "elektronik", label: "Elektronik", icon: Smartphone },
  { id: "buku", label: "Buku", icon: BookOpen },
  { id: "kartu-identitas", label: "Kartu Identitas", icon: CreditCard },
  { id: "dompet", label: "Dompet", icon: Wallet },
  { id: "tas", label: "Tas", icon: Package },
  { id: "kunci", label: "Kunci", icon: KeyRound },
  { id: "aksesori", label: "Aksesori", icon: Gem },
  { id: "pakaian", label: "Pakaian", icon: Shirt },
  { id: "lainnya", label: "Lainnya", icon: Package },
] as const;

export function NewsCarousel({ onNavigate }: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % newsData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + newsData.length) % newsData.length,
    );
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const currentNews = newsData[currentIndex];

  const scrollCategories = (direction: "left" | "right") => {
    categoryScrollerRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-8">
      {/* Carousel */}
      <div
        className="relative h-[150px] w-full rounded-sm overflow-hidden group sm:h-[260px] md:h-[400px] lg:h-[460px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={currentNews.image}
                alt={currentNews.title}
                className="w-full h-full object-cover"
              />
              {currentNews.id === 3 && (
                <div className="absolute inset-0 bg-black/45" />
              )}
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-8 md:px-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl"
              >
                {currentNews.title && (
                  <>
                    <h2 className="mb-3 text-sm font-semibold leading-tight text-white sm:mb-4 sm:text-xl md:text-4xl">
                      {currentNews.title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-[10px] leading-relaxed text-white/90 sm:text-sm md:text-base">
                      {currentNews.description}
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-white z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-white z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Auto-play Progress Bar */}
        {!isPaused && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 20, ease: "linear" }}
            key={currentIndex}
          />
        )}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Browse By Category
            </h2>
            <p className="text-sm text-muted-foreground">
              Cari barang anda berdasarkan kategori yang anda tetapkan
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:text-gray-600"
              aria-label="Geser kategori ke kiri"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:text-gray-600"
              aria-label="Geser kategori ke kanan"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={categoryScrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {browseCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategory((currentCategory) =>
                    currentCategory === category.id ? null : category.id,
                  )
                }
                className={`flex min-w-[96px] snap-start flex-col items-center justify-center rounded-sm border px-3 py-4 text-center transition-colors sm:min-w-[140px] sm:px-5 sm:py-7 md:min-w-[160px] ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="mb-3 h-5 w-5 stroke-[1.75] sm:mb-4 sm:h-8 sm:w-8 md:h-9 md:w-9" />
                <span className="text-[10px] font-medium leading-tight sm:text-sm md:text-base">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

      </section>
    </div>
  );
}
