import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { NotificationPromptWrapper } from '@/components/NotificationPromptWrapper'
// Cache bust

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 relative w-full md:w-[calc(100%-240px)] ml-0 md:ml-0">
        <NotificationPromptWrapper />
        <TopBar />
        <main className="flex-1 p-6 overflow-x-hidden md:ml-[240px] w-full md:w-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}