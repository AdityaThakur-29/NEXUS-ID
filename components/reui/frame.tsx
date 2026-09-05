import * as React from "react";
import { cn } from "@/lib/utils";

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "xs" | "sm" | "default" | "lg";
  variant?: "default" | "inverse" | "ghost";
}

export function Frame({ className, spacing = "default", variant = "default", ...props }: FrameProps) {
  return (
    <div
      className={cn("reui-frame", `reui-frame-spacing-${spacing}`, `reui-frame-${variant}`, className)}
      {...props}
    />
  );
}

export function FramePanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("reui-frame-panel", className)} {...props} />;
}

export function FrameHeader({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <header className={cn("reui-frame-header", className)} {...props} />;
}

export function FrameTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("reui-frame-title", className)} {...props} />;
}

export function FrameDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("reui-frame-description", className)} {...props} />;
}

export function FrameFooter({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <footer className={cn("reui-frame-footer", className)} {...props} />;
}
