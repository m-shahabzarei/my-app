"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface GeneratedImageCardProps {
  imageUrl: string;
  prompt: string;
}

function createImageFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `ai-image-${timestamp}.png`;
}

export default function GeneratedImageCard({ imageUrl, prompt }: GeneratedImageCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error("Unable to download image.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = createImageFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30"
    >
      <div className="relative overflow-hidden bg-black/40">
        <img src={imageUrl} alt={prompt || "Generated image"} className="h-full max-h-[72vh] min-h-88 w-full object-contain" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="line-clamp-2 text-sm leading-6 text-neutral-400">{prompt}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-medium text-neutral-200 transition hover:border-white/25 hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-500"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        </div>
      </div>
    </motion.div>
  );
}
