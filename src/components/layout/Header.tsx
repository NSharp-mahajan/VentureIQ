"use client";
import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center md:hidden">
        <Sheet>
          <SheetTrigger className="md:hidden p-2 rounded-md hover:bg-secondary/50 transition-colors">
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </header>
  );
}
