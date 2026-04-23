import { HTMLAttributes, ReactNode, useState } from "react";

type CollapsableProps = {
  title: ReactNode;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">;

const Collapsable = (props: CollapsableProps) => {
  const { title, children } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div className="w-full bg-zinc-800 px-3 py-4 rounded-lg overflow-clip flex flex-col gap-2">
      <div className="font-semibold text-zinc-50 text-lg flex items-center">
        {title}
      </div>
      <div className="flex items-center">
        <div aria-hidden="true" className="w-full border-t border-zinc-600" />
        <div className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex hover:bg-zinc-700 cursor-pointer items-center gap-x-1.5 rounded-full bg-zinc-600 px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-zinc-50 shadow-xs"
          >
            <span className="size-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`size-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </button>
        </div>
        <div aria-hidden="true" className="w-full border-t border-zinc-600" />
      </div>
      {isCollapsed && children}
    </div>
  );
};

export default Collapsable;
