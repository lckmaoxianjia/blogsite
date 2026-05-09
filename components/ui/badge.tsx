export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning";
}) {
  const colors = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    success:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[variant]}`}>
      {children}
    </span>
  );
}
