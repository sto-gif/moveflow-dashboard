import { useMemo } from "react";

export type FilterValues = Record<string, string[]>;

/**
 * Apply a filter map to a list. Multi-select within a group is OR;
 * across groups is AND. Empty groups are ignored.
 *
 * `accessors` maps each filter key to a function that returns the
 * value(s) of that key for a given item.
 */
export function applyFilters<T>(
  list: T[],
  values: FilterValues,
  accessors: Record<string, (item: T) => string | string[] | undefined | null>,
): T[] {
  const activeKeys = Object.keys(values).filter((k) => values[k] && values[k]!.length > 0);
  if (activeKeys.length === 0) return list;
  return list.filter((item) =>
    activeKeys.every((key) => {
      const acc = accessors[key];
      if (!acc) return true;
      const got = acc(item);
      const arr = Array.isArray(got) ? got : got == null ? [] : [got];
      return values[key]!.some((v) => arr.includes(v));
    }),
  );
}

export function useFilteredList<T>(
  list: T[],
  values: FilterValues,
  accessors: Record<string, (item: T) => string | string[] | undefined | null>,
): T[] {
  return useMemo(() => applyFilters(list, values, accessors), [list, values, accessors]);
}

export function activeFilterCount(values: FilterValues): number {
  return Object.values(values).reduce((s, arr) => s + (arr?.length ?? 0), 0);
}
