export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    className = "",
}) {
    const base = "btn";

    const variants = {
        primary: "btn-primary",
        danger: "btn-danger",
        success: "btn-success",
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}