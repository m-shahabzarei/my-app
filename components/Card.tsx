import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-black border border-gray-800 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}