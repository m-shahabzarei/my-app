"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAiImageStore } from "@/store/ai/image-store";
import GeneratedImageCard from "./GeneratedImageCard";
import ImageControls from "./ImageControls";
import ImagePlaceholder from "./ImagePlaceholder";
import ImagePromptInput from "./ImagePromptInput";

export default function ImageGenerator() {
  const prompt = useAiImageStore((state) => state.prompt);
  const selectedModelId = useAiImageStore((state) => state.selectedModelId);
  const selectedSize = useAiImageStore((state) => state.selectedSize);
  const isGenerating = useAiImageStore((state) => state.isGenerating);
  const imageUrl = useAiImageStore((state) => state.imageUrl);
  const error = useAiImageStore((state) => state.error);
  const setPrompt = useAiImageStore((state) => state.setPrompt);
  const selectModel = useAiImageStore((state) => state.selectModel);
  const selectSize = useAiImageStore((state) => state.selectSize);
  const generateImage = useAiImageStore((state) => state.generateImage);
  const clearError = useAiImageStore((state) => state.clearError);
  const canGenerate = prompt.trim().length > 0 && Boolean(selectedModelId) && !isGenerating;

  function handleGenerate() {
    void generateImage();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_30rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6 xl:p-8">
        <header className="rounded-3xl border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/20 sm:p-6">
          <Link
            href="/ai"
            className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI tools
          </Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-sm text-neutral-400">
                <Sparkles className="h-4 w-4" />
                AI Image Generation
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create calm, polished visuals from a prompt.</h1>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Generate premium creative imagery with GapGPT Z Image while keeping provider credentials safely on the server.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-neutral-400">
              Model and size controls are capability-based for future image providers.
            </div>
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 sm:p-5">
            <div className="flex flex-col gap-5">
              <ImagePromptInput value={prompt} onChange={setPrompt} onSubmit={handleGenerate} disabled={isGenerating} />
              <ImageControls
                selectedModelId={selectedModelId}
                selectedSize={selectedSize}
                onModelChange={selectModel}
                onSizeChange={selectSize}
                disabled={isGenerating}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                      <button type="button" onClick={clearError} className="text-xs text-rose-200/70 transition hover:text-rose-100">
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                whileHover={canGenerate ? { y: -2 } : undefined}
                whileTap={canGenerate ? { scale: 0.98 } : undefined}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black shadow-2xl shadow-white/10 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-600 disabled:shadow-none"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Generating image..." : "Generate image"}
              </motion.button>
            </div>
          </section>

          <section className="min-w-0">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ImagePlaceholder loading />
                </motion.div>
              ) : imageUrl ? (
                <GeneratedImageCard key={imageUrl} imageUrl={imageUrl} prompt={prompt} />
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ImagePlaceholder />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
}
