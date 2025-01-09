"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Privacy } from "./Privacy";
import Link from "next/link";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <Link href="/privacy" className="hover:text-primary transition-colors duration-300 text-xs">
            (View Page)
          </Link>
          <DialogDescription>{/* Date included in Privacy component */}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-foreground max-h-[60vh] overflow-auto">
          <Privacy />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
