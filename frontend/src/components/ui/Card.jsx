export default function Card({ title, subtitle, className = "", children }) {
	return (
		<section
			className={`rounded-2xl border border-[#e7ebf3] bg-white p-6 shadow-sm ${className}`}
		>
			{title ? <h2 className="text-xl font-semibold text-[#1f2937]">{title}</h2> : null}
			{subtitle ? <p className="mt-1 text-sm text-[#5f6368]">{subtitle}</p> : null}
			<div className={title || subtitle ? "mt-5" : ""}>{children}</div>
		</section>
	);
}
