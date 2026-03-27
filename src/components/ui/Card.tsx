import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-xl overflow-hidden", {
  variants: {
    variant: {
      default: "bg-surface-secondary border border-border-default",
      ghost: "bg-transparent",
      accent:
        "bg-surface-secondary border border-border-default border-l-2 border-l-accent-blue",
    },
    padding: {
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  );
}
