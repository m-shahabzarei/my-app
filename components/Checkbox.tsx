"use client";

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Checkbox({ checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked
          ? "bg-white border-white"
          : "bg-transparent border-gray-600"
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
      }`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}