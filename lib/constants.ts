// Define available protocols
export const PROTOCOLS = ["soroswap", "aquarius", "blend", "phoenix"] as const;
export type Protocol = (typeof PROTOCOLS)[number];

// Protocol-specific information
export const PROTOCOL_INFO: Record<
  Protocol,
  {
    name: string;
    description: string;
    logo: string;
    links: { name: string; url: string }[];
  }
> = {
  soroswap: {
    name: "Soroswap",
    description: "Soroswap is a decentralized exchange protocol built on the Stellar network.",
    logo: "/images/protocols/soroswap.svg",
    links: [
      { name: "Website", url: "https://soroswap.finance" },
      { name: "Docs", url: "https://docs.soroswap.finance" }
    ]
  },
  aquarius: {
    name: "Aquarius",
    description: "Aquarius is a lending and borrowing protocol on Stellar.",
    logo: "/images/protocols/aquarius.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" }
    ]
  },
  blend: {
    name: "Blend",
    description: "Blend is a decentralized exchange aggregator.",
    logo: "/images/protocols/blend.svg",
    links: [
      { name: "Website", url: "https://blend.finance" },
      { name: "Docs", url: "https://docs.blend.finance" }
    ]
  },
  phoenix: {
    name: "Phoenix",
    description: "Phoenix is a decentralized perpetual exchange protocol.",
    logo: "/images/protocols/phoenix.svg",
    links: [
      { name: "Website", url: "https://phoenix.finance" },
      { name: "Documentation", url: "https://docs.phoenix.finance" }
    ]
  }
};

// Add protocol mapping
export const PROTOCOL_MAPPING: Record<Protocol, string> = {
  soroswap: "soroswap",
  phoenix: "phoenix",
  aquarius: "aqua",
  blend: "blend"
};
