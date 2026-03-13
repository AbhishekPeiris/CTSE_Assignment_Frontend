import { useId } from "react";

export default function Input({
    id,
    label,
    error,
    className = "",
    inputClassName = "",
    ...props
}) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className={className}>
            {label ? (
                <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-[#374151]">
                    {label}
                </label>
            ) : null}

            <input
                id={inputId}
                className={`w-full rounded-xl border border-[#d9dde8] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc] ${inputClassName}`}
                {...props}
            />

            {error ? <p className="mt-1 text-xs text-[#b42318]">{error}</p> : null}
        </div>
    );
}