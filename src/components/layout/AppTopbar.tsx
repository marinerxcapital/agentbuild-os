'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

export default function AppTopbar() {
  const pathname = usePathname() || ''
  const { getProject } = useStore()

  const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/)
  let projectName: string | null = null
  if (projectIdMatch && projectIdMatch[1] && projectIdMatch[1] !== 'new') {
    const id = projectIdMatch[1]
    const proj = getProject(id)
    if (proj) projectName = proj.name
  }

  const crumbs: string[] = ['Dashboard']

  const segs = pathname.split('/').filter(Boolean)
  if (segs[0] === 'projects' && segs[1] && segs[1] !== 'new') {
    if (projectName) {
      crumbs.push(projectName)
    } else {
      const raw = segs[1]
      crumbs.push(raw.length > 12 ? raw.slice(0, 8) + '…' : raw)
    }
  } else if (segs[0] === 'projects' && segs[1] === 'new') {
    crumbs.push('New Project')
  } else if (segs[0] === 'autonomous') {
    crumbs.push('Autonomous Ops')
  } else if (segs[0] === 'fleet') {
    crumbs.push('Fleet Command')
  } else if (segs.length > 0 && segs[0] !== 'projects') {
    const s0 = segs[0]
    if (s0 && !crumbs.includes(s0)) crumbs.push(s0.charAt(0).toUpperCase() + s0.slice(1))
  }

  return (
    <header className="h-[52px] shrink-0 border-b border-[#E5E7EB] bg-white z-10">
      <div className="flex h-full items-center px-8">
        <nav className="flex items-center text-[12px] text-[#6B6B78]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return <span key={index} className="flex items-center"><span className={cn(isLast && 'text-[#14141A] font-medium')}>{crumb}</span>{!isLast && <span className="mx-1.5 text-[#9B9BA8]">/</span>}</span>
          })}
        </nav>
      </div>
    </header>
  )
}