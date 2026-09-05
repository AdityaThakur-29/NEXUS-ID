"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "default" | "lg";
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "default", ...props }, ref) => {
    return <div ref={ref} className={cn("reui-avatar", `reui-avatar-${size}`, className)} {...props} />;
  }
);
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = "", src, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(!src);
    if (hasError || !src) return null;
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("reui-avatar-img", className)}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("reui-avatar-fallback", className)} {...props} />;
  }
);
AvatarFallback.displayName = "AvatarFallback";
