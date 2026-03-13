export default function Loader({ text = "Loading..." }) {
    return (
        <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-[#e7ebf3] bg-white">
            <div className="space-y-2 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d2e3fc] border-t-[#1a73e8]" />
                <p className="text-sm text-[#5f6368]">{text}</p>
            </div>
        </div>
    );
}