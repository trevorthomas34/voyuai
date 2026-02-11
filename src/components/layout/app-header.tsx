'use client'

import Link from 'next/link'
import { UserMenu } from './user-menu'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
  { href: '/assets', label: 'Assets', key: 'assets' },
  { href: '/risks', label: 'Risks', key: 'risks' },
  { href: '/controls', label: 'Controls', key: 'controls' },
  { href: '/evidence', label: 'Evidence', key: 'evidence' },
  { href: '/soa', label: 'SoA', key: 'soa' },
]

interface AppHeaderProps {
  subtitle: string
  currentPage?: string
  simple?: boolean
}

export function AppHeader({ subtitle, currentPage, simple }: AppHeaderProps) {
  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Voyu</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {!simple && (
            <nav className="flex items-center space-x-4">
              {navLinks.map(link => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`text-sm ${
                    currentPage === link.key ? 'font-medium' : 'hover:underline'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
