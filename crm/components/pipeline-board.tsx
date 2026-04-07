"use client";

export type Stage = {
  value: string;
  label: string;
  count: number;
  color: string; // Tailwind color classes e.g. "bg-blue-100 border-blue-300 text-blue-700"
};

type Props = {
  title: string;
  stages: Stage[];
  entityPath: string; // e.g. "leads"
};

export function PipelineBoard({ title, stages, entityPath }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {stages.map((stage, index) => {
          const isEmpty = stage.count === 0;
          const colorClasses = isEmpty
            ? "bg-muted border-border text-muted-foreground"
            : stage.color;

          return (
            <div key={stage.value} className="flex items-center">
              <button
                onClick={() => {
                  window.location.href = `/${entityPath}?status=${stage.value}`;
                }}
                className={`flex flex-col items-center justify-center rounded-lg border px-4 py-3 min-w-[110px] cursor-pointer transition-opacity hover:opacity-80 ${colorClasses}`}
              >
                <span className="text-xs font-medium truncate max-w-full">
                  {stage.label}
                </span>
                <span className="text-2xl font-bold mt-1">{stage.count}</span>
              </button>
              {index < stages.length - 1 && (
                <span className="text-muted-foreground text-lg px-1 shrink-0 select-none">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
