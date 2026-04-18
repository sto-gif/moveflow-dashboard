import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CreateField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number";
  defaultValue?: string | number;
}

interface Props {
  trigger: ReactNode;
  title: string;
  fields: CreateField[];
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
}

export function CreateDialog({ trigger, title, fields, onSubmit, submitLabel = "Opret" }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, String(f.defaultValue ?? "")])),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    setOpen(false);
    setValues(Object.fromEntries(fields.map((f) => [f.name, String(f.defaultValue ?? "")])));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {fields.map((f) => (
              <div key={f.name} className="grid gap-1.5">
                <Label htmlFor={f.name} className="text-xs">{f.label}</Label>
                <Input
                  id={f.name}
                  type={f.type ?? "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annullér</Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
