interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title = "No data found", 
  message = "There is nothing to display here.",
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="mb-4 text-gray-600">{icon}</div>}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm text-center max-w-sm">{message}</p>
    </div>
  );
}