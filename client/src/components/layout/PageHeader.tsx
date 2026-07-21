import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2", className)} {...props}>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          {heading}
        </h1>
        {children}
      </div>
      {description && (
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}
