import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props<T extends string> {
  value: T;
  options: T[];
  labels: Record<T, string>;
  colors?: Record<T, string>;
  onChange: (next: T) => void;
}

export function StageSelect<T extends string>({ value, options, labels, colors, onChange }: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button type="button" className="inline-flex" aria-label="Skift status">
          <Badge variant="outline" className={cn("text-[10px] cursor-pointer hover:opacity-80", colors?.[value])}>
            {labels[value]}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt);
            }}
          >
            <Badge variant="outline" className={cn("text-[10px] mr-2", colors?.[opt])}>{labels[opt]}</Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
