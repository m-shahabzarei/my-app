import { Message } from "@/types";

interface MessageCardProps {
  message: Message;
  onClick?: () => void;
  showPreview?: boolean;
}

export default function MessageCard({ message, onClick, showPreview = true }: MessageCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border border-gray-800 rounded-xl hover:bg-gray-900/50 transition-all duration-200 cursor-pointer ${onClick ? "" : ""}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase bg-gray-900 px-2 py-0.5 rounded">
              {message.app}
            </span>
          </div>
          <p className="text-white font-medium text-sm truncate">{message.sender}</p>
          {showPreview && (
            <p className="text-gray-400 text-sm truncate mt-1">{message.text}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{message.date}</span>
      </div>
    </div>
  );
}