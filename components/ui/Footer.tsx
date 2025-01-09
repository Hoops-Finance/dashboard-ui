"use client";

import Link from "next/link";
import { useState } from "react";
import { PrivacyModal } from "@/components/PrivacyModal";
import { TosModal } from "@/components/TosModal";

export function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTos, setShowTos] = useState(false);

  return (
    <footer className="border-t border-border p-4" style={{ display: "var(--footer-display, block)" }}>
      <nav className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
        <Link href="#" className="hover:text-primary transition-colors duration-300">
          Pricing
        </Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">
          Enterprise
        </Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">
          FAQ
        </Link>

        <button
          onClick={() => {
            setShowTos(true);
          }}
          className="hover:text-primary transition-colors duration-300 underline"
        >
          TOS
        </button>

        <button
          onClick={() => {
            setShowPrivacy(true);
          }}
          className="hover:text-primary transition-colors duration-300 underline"
        >
          Privacy
        </button>

        <Link href="#" className="hover:text-primary transition-colors duration-300">
          Explore
        </Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">
          Save ↗
        </Link>
      </nav>

      <PrivacyModal
        open={showPrivacy}
        onClose={() => {
          setShowPrivacy(false);
        }}
      />
      <TosModal
        open={showTos}
        onClose={() => {
          setShowTos(false);
        }}
      />
    </footer>
  );
}
