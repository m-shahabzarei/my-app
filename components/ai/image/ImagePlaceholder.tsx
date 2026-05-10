"use client";

import { ImageIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ImagePlaceholderProps {
  loading?: boolean;
}

export default function ImagePlaceholder({ loading = false }: ImagePlaceholderProps) {
  if (loading) {
    return (
      <div className="relative flex aspect-square min-h-[22rem] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/4 shadow-2xl shadow-black/25">
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-black/40 text-white">
            <Sparkles className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Creating your image</p>
            <p className="mt-1 text-sm text-neutral-500">GapGPT is rendering the first preview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-square min-h-[22rem] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/3 px-6 text-center shadow-2xl shadow-black/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-black/30 text-neutral-300">
        <ImageIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-white">Your generated image will appear here</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        Choose a model, pick a size, and describe the scene you want to create.
      </p>
    </div>
  );
}
