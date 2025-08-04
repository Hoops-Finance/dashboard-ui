import { Token } from "@/utils/types";
import { motion } from "framer-motion";
import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DataItem {
  token: Token;
  value: number;
}

export interface TokenCardProps {
  icon: JSX.Element;
  title: string;
  data: DataItem[];
  delay: number;
  isServer?: boolean;
}

export function TokenCard({ icon, title, data, delay, isServer = false }: TokenCardProps) {
  const TokenCard = (
    <Card>
      <CardHeader>
        <CardTitle className="topCardTitle">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, i) => {
          const rank = i + 1;
          const symbolName =
            item.token.name === "native"
              ? "XLM"
              : `${item.token.name.substring(0, 8)}...${item.token.name.substring(item.token.name.length - 3)}`;
          return (
            <motion.div
              key={item.token.id}
              className="flex items-center justify-between group"
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#{rank}</span>
                <span className="CardRowLabel">{symbolName}</span>
              </div>
              <span className="text-foreground">${item.value.toLocaleString().split(".")[0]}</span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
  return isServer ? (
    TokenCard
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="transform-gpu"
    >
      {TokenCard}
    </motion.div>
  );
}
