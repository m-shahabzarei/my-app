"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      <div className="relative bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}