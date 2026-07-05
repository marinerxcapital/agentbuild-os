'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, Plus, Users, Activity, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-[8px] h-9 px-3 text-[13px] font-medium transition-colors',
        active
          ? 'bg-[#F0EDFF] text-[#6D5EF0] font-semibold'
          : 'text-[#6B6B78] hover:bg-[#F8F9FB]'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href === '/' && pathname === '/')

  const recentProjects = [
    { id: 'proj1', name: 'TradePulse Platform', updated: '2h ago' },
    { id: 'proj2', name: 'Sentinel Analytics', updated: '5h ago' },
    { id: 'proj3', name: 'Nimbus UI Library', updated: '1d ago' },
  ]

  return (
    <aside className="w-[240px] shrink-0 border-r border-[#E5E7EB] bg-white flex flex-col h-full">
      <div className="flex h-14 items-center gap-2.5 border-b border-[#E5E7EB] bg-white px-4">
        <Image src="/logo.svg" alt="AgentBuild OS" width={26} height={26} className="h-6 w-6" />
        <div className="font-semibold tracking-[-0.2px] text-[14px] text-[#14141A]">AgentBuild OS</div>
      </div>

      <nav className="p-2 pt-3">
        <NavItem href="/" icon={<Home className="h-4 w-4" />} label="Dashboard" active={isActive('/')} />
        <NavItem href="/projects/new" icon={<Plus className="h-4 w-4" />} label="New Project" active={isActive('/projects/new')} />
        <NavItem href="/autonomous" icon={<Activity className="h-4 w-4" />} label="Autonomous Ops" active={isActive('/autonomous')} />
        <NavItem href="/fleet" icon={<Users className="h-4 w-4" />} label="Fleet Command" active={isActive('/fleet')} />
      </nav>

      <div className="px-3 pt-3 mt-1">
        <div className="text-[11px] uppercase text-[#9B9BA8] tracking-[1px] mb-2 px-1">Recent Projects</div>
        <ScrollArea className="h-[140px]">
          <div className="space-y-0.5 pr-1">
            {recentProjects.map((proj, idx) => (
              <Link key={idx} href={`/projects/${proj.id}`} className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[12px] text-[#6B6B78] hover:bg-[#F8F9FB] hover:text-[#14141A]">
                <Folder className="h-3.5 w-3.5 shrink-0 text-[#6D5EF0]" />
                <div className="flex-1 truncate">{proj.name}</div>
                <div className="text-[10px] text-[#9B9BA8]">{proj.updated}</div>
              </Link>
            ))}
          </div>
        </ScrollArea>
        <Link href="/fleet" className="mt-1 block px-2 text-[11px] text-[#6D5EF0] hover:underline">View all projects</Link>
      </div>

      <div className="mt-auto border-t border-[#E5E7EB] px-4 py-3 text-[10px] text-[#9B9BA8] tracking-widest">
        AgentBuild OS
      </div>
    </aside>
  )
}