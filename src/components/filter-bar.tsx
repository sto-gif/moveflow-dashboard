import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { activeFilterCount, type FilterValues } from "@/hooks/use-filters";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterGroup[];
  value: FilterValues;
  onChange: (next: FilterValues) => void;
  className?: string;
}

export function FilterBar({ filters, value, onChange, className }: FilterBarProps) {
  const total = activeFilterCount(value);

  const toggle = (key: string, v: string) => {
    const cur = value[key] ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    const out = { ...value, [key]: next };
    if (next.length === 0) delete out[key];
    onChange(out);
  };

  const clearGroup = (key: string) => {
    const out = { ...value };
    delete out[key];
    onChange(out);
  };

  const clearAll = () => onChange({});

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", className)}>
          <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
          Filter
          {total > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-[10px] tabular-nums">
              {total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filtre
          </span>
          {total > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] text-primary hover:underline"
            >
              Ryd alle
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-auto py-1">
          {filters.map((group) => (
            <div key={group.key} className="px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </span>
                {(value[group.key]?.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => clearGroup(group.key)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Ryd
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {group.options.map((opt) => {
                  const checked = value[group.key]?.includes(opt.value) ?? false;
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded px-1.5 py-1 hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(group.key, opt.value)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {opt.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FilterChipsProps {
  filters: FilterGroup[];
  value: FilterValues;
  onChange: (next: FilterValues) => void;
}

export function FilterChips({ filters, value, onChange }: FilterChipsProps) {
  const total = activeFilterCount(value);
  if (total === 0) return null;
  const labelFor = (key: string, v: string) => {
    const g = filters.find((f) => f.key === key);
    return g?.options.find((o) => o.value === v)?.label ?? v;
  };
  const groupLabel = (key: string) => filters.find((f) => f.key === key)?.label ?? key;
  const remove = (key: string, v: string) => {
    const next = (value[key] ?? []).filter((x) => x !== v);
    const out = { ...value };
    if (next.length === 0) delete out[key];
    else out[key] = next;
    onChange(out);
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {Object.entries(value).flatMap(([key, vals]) =>
        (vals ?? []).map((v) => (
          <span
            key={`${key}:${v}`}
            className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-[11px]"
          >
            <span className="text-muted-foreground">{groupLabel(key)}:</span>
            <span className="font-medium">{labelFor(key, v)}</span>
            <button
              type="button"
              onClick={() => remove(key, v)}
              className="ml-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Fjern filter"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </span>
        )),
      )}
      <button
        type="button"
        onClick={() => onChange({})}
        className="ml-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
      >
        Ryd alle
      </button>
    </div>
  );
}
