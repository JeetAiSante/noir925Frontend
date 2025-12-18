import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Luxury variants for NOIR925
        luxury: "bg-primary text-primary-foreground font-display tracking-wider uppercase hover:shadow-glow-emerald transition-all duration-500",
        "luxury-outline": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground font-display tracking-wider uppercase transition-all duration-500",
        hero: "bg-foreground text-background font-display tracking-widest uppercase text-base hover:bg-foreground/90 shadow-luxury hover:shadow-glow-gold transition-all duration-500",
        "hero-outline": "border-2 border-foreground text-foreground bg-transparent font-display tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500",
        rose: "bg-secondary text-secondary-foreground font-body tracking-wide hover:shadow-glow-rose transition-all duration-500",
        gold: "bg-accent text-accent-foreground font-body tracking-wide hover:shadow-glow-gold transition-all duration-500",
        silver: "bg-silver text-foreground font-body tracking-wide hover:bg-silver-dark transition-all duration-500",
        glass: "bg-card/60 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card/80 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-cursor="button"
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
