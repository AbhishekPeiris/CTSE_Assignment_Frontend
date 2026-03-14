export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-full py-3 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg";

  const variants = {
    primary: "bg-[#1a73e8] text-white hover:bg-[#155fc6]",
    secondary:
      "border border-[#d9dde8] bg-white text-[#3c4043] hover:bg-[#f6f8fc]",
    danger: "bg-[#d93025] text-white hover:bg-[#b42318]",
    success: "bg-[#188038] text-white hover:bg-[#146c2e]",
    ghost: "text-[#3c4043] hover:bg-[#f1f3f4]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
