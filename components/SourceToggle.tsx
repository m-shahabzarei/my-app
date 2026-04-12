interface SourceToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export default function SourceToggle({ label, isActive, onToggle }: SourceToggleProps) {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-800 rounded-2xl">
      <span className="text-white text-sm font-medium">{label}</span>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          isActive ? "bg-white" : "bg-gray-800"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
            isActive ? "left-7 bg-black" : "left-1 bg-gray-400"
          }`}
        />
      </button>
    </div>
  );
}