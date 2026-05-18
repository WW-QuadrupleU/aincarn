'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'

type SmoothHashLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

export default function SmoothHashLink({ href, className, children }: SmoothHashLinkProps) {
  const pathname = usePathname()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return

    const targetPath = href.slice(0, hashIndex)
    const targetId = href.slice(hashIndex + 1)
    if (!targetId) return

    const currentPath = pathname || window.location.pathname
    const isSamePage = !targetPath || targetPath === currentPath

    if (!isSamePage) return

    const target = document.getElementById(decodeURIComponent(targetId))
    if (!target) return

    event.preventDefault()
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${targetId}`)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
