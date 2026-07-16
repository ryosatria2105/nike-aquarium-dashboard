export function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </span>
  );
}