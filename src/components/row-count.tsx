interface RowCountProps {
  shown: number;
  total: number;
  noun?: string;
}

export function RowCount({ shown, total, noun = "rækker" }: RowCountProps) {
  return (
    <div className="mt-2 text-right text-[11px] text-muted-foreground tabular-nums">
      Viser {shown} af {total} {noun}
    </div>
  );
}
