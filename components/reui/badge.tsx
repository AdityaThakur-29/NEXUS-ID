import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "destructive"
    | "primary-light"
    | "warning-light"
    | "success-light"
    | "info-light"
    | "destructive-light";
  size?: "xs" | "sm" | "default" | "lg";
  radius?: "default" | "full";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "default", radius = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "reui-badge",
          `reui-badge-${variant}`,
          `reui-badge-${size}`,
          radius === "full" && "reui-badge-pill",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
