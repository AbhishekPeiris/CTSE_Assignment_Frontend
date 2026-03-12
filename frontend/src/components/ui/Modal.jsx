import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {

    useEffect(() => {

        const closeOnEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", closeOnEsc);

        return () => {
            window.removeEventListener("keydown", closeOnEsc);
        };

    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">

            <div className="modal">

                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>

                {children}

            </div>

        </div>
    );
}