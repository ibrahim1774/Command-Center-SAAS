import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[10px] overflow-hidden transition-shadow duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-card-bg border border-card-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        ghost: "bg-transparent",
        accent:
          "bg-card-bg border border-card-border border-l-2 border-l-accent-primary hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        success:
          "bg-card-bg border border-card-border border-l-2 border-l-success hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        danger:
          "bg-card-bg border border-card-border border-l-2 border-l-danger hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-7",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  );
}
