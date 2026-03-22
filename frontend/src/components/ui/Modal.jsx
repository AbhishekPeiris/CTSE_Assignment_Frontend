import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        const closeOnEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", closeOnEsc);

        return () => {
            window.removeEventListener("keydown", closeOnEsc);
        };
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-full max-w-lg rounded-2xl border border-[#e7ebf3] bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="mb-4 flex justify-end">
                    <button
                        className="rounded-lg border border-[#d9dde8] px-2 py-1 text-xs font-semibold text-[#3c4043] hover:bg-[#f6f8fc]"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        X
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}