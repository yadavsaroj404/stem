type BorderRadius =
  | "rounded-4xl"
  | "rounded-3xl"
  | "rounded-2xl"
  | "rounded-xl"
  | "rounded-lg"
  | "rounded-md"
  | "rounded-sm"
  | "rounded";

export default function GradientBorder({
  children,
  className = "",
  outerClassName = "",
  borderRadius,
}: {
  children: React.ReactNode | null;
  className?: string;
  outerClassName?: string;
  borderRadius?: BorderRadius | null;
}) {
  return (
    <div
      className={`w-fit p-px pt-[1.2px] bg-gradient-to-r from-[#6300FF] to-[#270265] ${borderRadius} ${outerClassName}`}
    >
      <div className={`bg-[#1B0244] ${borderRadius} h-full ${className}`}>
        {children}
      </div>
    </div>
  );
}
