interface RowCountProps {
  shown: number;
  total: number;
  noun?: string;
  filtered?: boolean;
}

export function RowCount({ shown, total, noun = "rækker", filtered }: RowCountProps) {
  const isFiltered = filtered ?? shown !== total;
  return (
    <div className="mt-2 text-right text-[11px] text-muted-foreground tabular-nums">
      Viser {shown} af {total} {noun}
      {isFiltered && shown !== total && <span className="ml-1 italic">(filtreret)</span>}
    </div>
  );
}
