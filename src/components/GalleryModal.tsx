"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { useEffect } from "react";

export interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onChange: (i: number) => void;
  /** Shown in the top bar on desktop (truncated). */
  title?: string;
}

export function GalleryModal({ open, onClose, images, activeIndex, onChange, title }: GalleryModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onChange(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
      else if (e.key === "ArrowLeft") onChange(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, activeIndex, images.length, onChange, onClose]);

  const handleSwipe = (dir: number) => {
    if (dir < 0) onChange(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
    else onChange(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
  };

  return (
    <AnimatePresence>
      {open && images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:py-4 flex-shrink-0 bg-black/80 backdrop-blur-sm relative z-10">
            <span className="text-white/70 text-sm font-semibold">{activeIndex + 1} / {images.length}</span>
            {title && (
              <p className="text-white text-sm font-bold truncate max-w-[50%] hidden sm:block">{title}</p>
            )}
            <button
              onClick={onClose}
              aria-label="Close gallery"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Stage — swipeable on mobile */}
          <div
            className="flex-1 flex items-center justify-center relative min-h-0 touch-pan-y"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.currentTarget as unknown as { _tx?: number; _ty?: number })._tx = touch.clientX;
              (e.currentTarget as unknown as { _tx?: number; _ty?: number })._ty = touch.clientY;
            }}
            onTouchEnd={(e) => {
              const el = e.currentTarget as unknown as { _tx?: number; _ty?: number };
              const startX = el._tx;
              const startY = el._ty;
              if (startX == null || startY == null) return;
              const endX = e.changedTouches[0].clientX;
              const endY = e.changedTouches[0].clientY;
              const dx = endX - startX;
              const dy = endY - startY;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                handleSwipe(dx > 0 ? 1 : -1);
              }
            }}
          >
            {images.length > 1 && (
              <button
                onClick={() => handleSwipe(1)}
                aria-label="Previous image"
                className="hidden sm:flex absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={images[activeIndex]}
                alt={title ? `${title} ${activeIndex + 1}` : `Image ${activeIndex + 1}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className="max-h-[85vh] w-auto max-w-[90vw] sm:max-w-[85vw] object-contain select-none"
                draggable={false}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <button
                onClick={() => handleSwipe(-1)}
                aria-label="Next image"
                className="hidden sm:flex absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}

            {/* Mobile pagination dots */}
            {images.length > 1 && (
              <div className="sm:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onChange(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`rounded-full transition-all ${i === activeIndex ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop thumbnail strip */}
          {images.length > 1 && (
            <div className="hidden sm:flex justify-center gap-2 px-4 pb-4 flex-shrink-0 overflow-x-auto scrollbar-hide bg-black/80">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onChange(i)}
                  className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIndex
                      ? "border-accent shadow-lg shadow-accent/30 scale-105"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <NextImage src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
