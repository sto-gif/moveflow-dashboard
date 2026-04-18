import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-[#F1F5F9] text-[#475569]",
        destructive: "bg-[#FEE2E2] text-[#DC2626]",
        outline: "border-border text-foreground bg-transparent",
        success: "bg-[#DCFCE7] text-[#16A34A]",
        warning: "bg-[#FEF3C7] text-[#D97706]",
        error: "bg-[#FEE2E2] text-[#DC2626]",
        neutral: "bg-[#F1F5F9] text-[#475569]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
