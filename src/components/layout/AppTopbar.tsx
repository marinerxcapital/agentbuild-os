'use client'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

function getBreadcrumbs(pathname: string): string[] {
  if (pathname === '/' || pathname === '') return ['Dashboard']
  const segments = (pathname || '').split('/').filter(Boolean)
  const crumbs: string[] = ['Dashboard']
  segments.forEach((seg) => {
    if (seg === 'projects') crumbs.push('Projects')
    else if (seg === 'new') crumbs.push('New Project')
    else if (seg === 'agents') crumbs.push('Agents')
    else if (seg === 'fleet') crumbs.push('Fleet Command')
    else if (seg === 'autonomous') crumbs.push('Autonomous Ops')
    else crumbs.push(seg.length > 12 ? seg.slice(0,8)+'…' : seg)
  })
  return crumbs
}
export default function AppTopbar() {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)
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