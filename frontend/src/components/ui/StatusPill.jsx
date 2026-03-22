import { normalizeStatus, statusClasses } from "../../utils/helpers";

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses(
        status,
      )}`}
    >
      {normalizeStatus(status)}
    </span>
  );
}
