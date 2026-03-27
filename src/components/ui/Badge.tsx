import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      positive: "bg-accent-green/15 text-accent-green",
      negative: "bg-accent-coral/15 text-accent-coral",
      neutral: "bg-surface-tertiary text-text-secondary",
      info: "bg-accent-blue/15 text-accent-blue",
    },
    size: {
      sm: "text-xs px-1.5 py-0.5",
      md: "text-xs px-2 py-1",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "md",
  },
});

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
