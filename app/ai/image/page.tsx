import type { Metadata } from "next";
import ImageGenerator from "@/components/ai/image/ImageGenerator";

export const metadata: Metadata = {
  title: "AI Image Generation | Productivity App",
  description: "Generate images with GapGPT Z Image.",
};

export default function AiImagePage() {
  return <ImageGenerator />;
}
