import { useState, type ReactNode } from "react";
import {
  DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Column<S extends string> {
  id: S;
  label: string;
  items: { id: string }[];
  footer?: ReactNode;
}

interface Props<S extends string, T extends { id: string }> {
  columns: Column<S>[];
  itemsByColumn: Record<S, T[]>;
  renderCard: (item: T) => ReactNode;
  onMove: (itemId: string, toColumn: S) => void;
  className?: string;
  /** If set, columns initially show only this many cards with a "Vis flere" toggle. */
  collapseAfter?: number;
}

function DraggableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: isDragging ? 50 : undefined }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn(isDragging && "opacity-60")}>
      {children}
    </div>
  );
}

function DroppableColumn<S extends string>({
  id, label, count, total, children,
}: { id: S; label: string; count: number; total?: ReactNode; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn("kanban-column transition-colors", isOver && "ring-2 ring-primary/40")}>
      <div className="kanban-column-header">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</div>
          {total && <div className="mt-0.5 text-caption text-muted-foreground tabular-nums">{total}</div>}
        </div>
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{count}</Badge>
      </div>
      <div className="kanban-cards min-h-12">{children}</div>
    </div>
  );
}

function ColumnCards<T extends { id: string }>({
  items, renderCard, collapseAfter,
}: { items: T[]; renderCard: (item: T) => ReactNode; collapseAfter?: number }) {
  const [expanded, setExpanded] = useState(false);
  const limit = collapseAfter ?? Infinity;
  const shouldCollapse = items.length > limit && !expanded;
  const visible = shouldCollapse ? items.slice(0, limit) : items;
  return (
    <>
      {visible.map((item) => (
        <DraggableCard key={item.id} id={item.id}>
          {renderCard(item)}
        </DraggableCard>
      ))}
      {items.length === 0 && (
        <div className="rounded border border-dashed border-border px-2 py-6 text-center text-caption text-muted-foreground">
          Træk hertil
        </div>
      )}
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded border border-dashed border-border px-2 py-2 text-caption text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
        >
          Vis flere ({items.length - limit})
        </button>
      )}
      {expanded && items.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full px-2 py-1 text-caption text-muted-foreground hover:text-foreground transition-colors"
        >
          Vis færre
        </button>
      )}
    </>
  );
}

export function KanbanBoard<S extends string, T extends { id: string }>({
  columns, itemsByColumn, renderCard, onMove, className, collapseAfter,
}: Props<S, T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    onMove(String(e.active.id), e.over.id as S);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("overflow-x-auto -mx-1 px-1 pb-2", className)}>
        <div className="flex gap-3 min-w-max">
          {columns.map((col) => {
            const items = itemsByColumn[col.id] ?? [];
            return (
              <div key={col.id} className="w-[340px] shrink-0">
                <DroppableColumn id={col.id} label={col.label} count={items.length} total={col.footer}>
                  <ColumnCards items={items} renderCard={renderCard} collapseAfter={collapseAfter} />
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
