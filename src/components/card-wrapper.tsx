import type React from "react";
import { cn } from "@/lib/utils/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

interface CardWrapperProps {
  title: string;
  description?: string;
  sections: SectionProps[];
  footer?: React.ReactNode | string;
  className?: string;
  footerClassName?: string;
}

export function CardWrapper({
  title,
  description,
  sections,
  footer,
  className,
  footerClassName,
}: CardWrapperProps) {
  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {sections.map((section, index) => (
            <div
              key={index}
              className={cn(
                "border-b border-border",
                index === sections.length - 1 && !footer && "border-b-0"
              )}>
              <div className={cn("px-6 py-1 border-b border-border", {})}>
                <h3 className="text-sm font-medium text-foreground">
                  {section.title}
                </h3>
              </div>
              <div className="p-6">{section.children}</div>
            </div>
          ))}
        </CardContent>

        {typeof footer !== "string" ? (
          <CardFooter
            className={cn("flex justify-end space-x-2 px-4 py-0",footerClassName)}>
            {footer}
          </CardFooter>
        ) : (
          <CardFooter className={cn("text-start text-sm", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
