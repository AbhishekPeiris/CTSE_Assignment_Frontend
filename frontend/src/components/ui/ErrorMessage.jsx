export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#f0c8c8] bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">
      {message}
    </div>
  );
}
