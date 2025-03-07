"use client";

/* import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 *  If you want to pass the data from the page, we do so via props.
 *  This way 'ai-home.tsx' can be used by any page that needs the chart.
 */
interface AIHomeComponentsProps {
  poolData: { name: string; apy: number }[];
}

export default function AIHomeComponents({ poolData }: AIHomeComponentsProps) {
  return (
    <div className="mt-6">
      {/* 
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={poolData}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-20" />
          <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
          <YAxis stroke="currentColor" className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderColor: "#E5E5E5",
              color: "#1A1A1A"
            }}
          />
          <Line type="monotone" dataKey="apy" stroke="currentColor" className="text-primary" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      */}
      <p className="mt-4 text-sm text-muted-foreground">
        Note: APYs are subject to change. Always do your own research before investing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground/90 text-xl">Explore ETH/XLM Pool</CardTitle>
            <CardDescription className="text-primary text-lg font-medium">
              Highest APY at 10.3%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed">
              Dive deeper into the ETH/XLM liquidity pool and understand its performance factors.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              View Details <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground/90 text-xl">Follow-up Questions</CardTitle>
            <CardDescription className="text-primary text-lg font-medium">
              Explore more about liquidity pools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "What are the risks associated with high APY pools?",
                "How often do APY rates change?",
                "What factors influence APY in liquidity pools?",
              ].map((question, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80">
                  <span className="text-primary">•</span>
                  <span className="leading-relaxed">{question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/10 text-foreground gap-2"
            >
              Ask a Question <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
