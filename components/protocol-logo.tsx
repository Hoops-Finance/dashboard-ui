'use client'

import { CircleDashed } from "lucide-react"

interface ProtocolLogoProps {
  logo?: string;
  name: string;
}

function ProtocolLogoPlaceholder({ name }: { name: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <CircleDashed className="h-6 w-6 text-muted-foreground" aria-label={`${name} logo placeholder`} />
    </div>
  );
}

export function ProtocolLogo({ logo, name }: ProtocolLogoProps) {
  if (!logo) {
    return <ProtocolLogoPlaceholder name={name} />;
  }

  return (
    <div className="relative w-12 h-12">
      <img 
        src={logo} 
        alt={`${name} logo`} 
        className="w-12 h-12"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
        }}
      />
      <div className="placeholder hidden absolute inset-0">
        <ProtocolLogoPlaceholder name={name} />
      </div>
    </div>
  );
} 