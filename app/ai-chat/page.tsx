import { AIChat } from "@/components/ai-chat"
import { StrategiesSidebar } from "@/components/strategies-sidebar"
import { PageLayout } from "@/components/ui/PageLayout"

export default function HoopsAIPage() {
  return (
    <PageLayout className="p-0">
      <div className="flex h-[calc(100vh-7rem)]">
        <StrategiesSidebar />
        <div className="flex-1 overflow-hidden">
          <AIChat />
        </div>
      </div>
    </PageLayout>
  )
}

