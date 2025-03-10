import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOS } from "./TOS";
import Link from "next/link";

interface TosModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

export function TosModal({ open, onClose }: TosModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            <Link href="/tos" className="hover:text-primary transition-colors duration-300 text-xs">
              (View Page)
            </Link>
            {/* Date included in TOS component */}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-foreground max-h-[60vh] overflow-auto">
          <TOS />
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
