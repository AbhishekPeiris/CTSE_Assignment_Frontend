import { useId } from "react";

export default function Input({
  id,
  label,
  error,
  className = "",
  inputClassName = "",
  placeholder = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={inputId}
          className="block mb-1 text-sm font-medium text-label"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        placeholder={placeholder}
        className={`w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-word outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc] ${inputClassName}`}
        {...props}
      />

      {error ? <p className="mt-1 text-xs text-[#b42318]">{error}</p> : null}
    </div>
  );
}
