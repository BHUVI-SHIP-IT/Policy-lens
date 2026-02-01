/**
 * Empty State Component
 * Better UX when no data exists
 */

import { FileText, Upload, Sparkles } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "document" | "upload" | "sparkles";
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon = "document", 
  actionLabel,
  onAction 
}: EmptyStateProps) {
  const Icon = icon === "upload" ? Upload : icon === "sparkles" ? Sparkles : FileText;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 p-6 mb-6">
        <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="rounded-full"
        >
          {actionLabel}
          <Sparkles className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
