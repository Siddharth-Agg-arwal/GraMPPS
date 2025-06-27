import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-8xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento h-3xl shadow-input row-span-1 flex flex-col rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-gray-600 hover:shadow-md dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
      )}
      style={{ minHeight: 0 }}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-4 flex-shrink-0 flex-1 min-h-0 h-0">{header}</div>
        <div className="flex-1 flex flex-col justify-end h-full">
          <div className="transition duration-200 group-hover/bento:translate-x-2">
            <div className="flex items-center gap-2 mt-2 mb-2">
              {icon}
              <span className="font-sans font-bold text-neutral-200 dark:text-neutral-200">
                {title}
              </span>
            </div>
            <div className="font-sans text-xs font-normal text-neutral-200 dark:text-neutral-300">
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
