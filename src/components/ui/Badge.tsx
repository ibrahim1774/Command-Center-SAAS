import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      positive: "bg-success/10 text-success",
      negative: "bg-danger/10 text-danger",
      neutral: "bg-[#f0ede8] text-text-secondary",
      info: "bg-accent-primary/10 text-accent-primary",
      platform: "bg-[#f0ede8] text-text-primary",
    },
    size: {
      sm: "text-[10px] px-1.5 py-0.5",
      md: "text-xs px-2.5 py-1",
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
