import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Bookmark, BookmarkPlus, Archive, ArchiveRestore, Trash2, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReportActionType = "save" | "unsave" | "archive" | "unarchive" | "delete" | "duplicate" | "regenerate";

interface ReportActionMenuProps {
  isSaved: boolean;
  isArchived: boolean;
  onAction: (action: ReportActionType) => void;
  triggerVariant?: "outline" | "ghost";
  triggerSize?: "sm" | "icon";
  triggerIcon?: React.ReactNode;
  className?: string;
}

export function ReportActionMenu({ 
  isSaved, 
  isArchived, 
  onAction,
  triggerVariant = "ghost",
  triggerSize = "sm",
  triggerIcon = <MoreHorizontal className="w-4 h-4" />,
  className
}: ReportActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: triggerVariant, size: triggerSize }), className)}>
        {triggerIcon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onAction(isSaved ? "unsave" : "save")}>
          {isSaved ? <Bookmark className="w-4 h-4 mr-2 text-primary fill-primary" /> : <BookmarkPlus className="w-4 h-4 mr-2" />}
          {isSaved ? "Unsave Report" : "Save Report"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction(isArchived ? "unarchive" : "archive")}>
          {isArchived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
          {isArchived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction("duplicate")}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("regenerate")}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate AI
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive focus:bg-destructive/10" 
          onClick={() => onAction("delete")}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
