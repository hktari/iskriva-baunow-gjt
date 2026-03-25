'use client';

import Link from 'next/link';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Menu, LogOut, BarChart3, FolderKanban, Users, BookOpen, Newspaper } from 'lucide-react';
import { useState } from 'react';

interface AppHeaderProps {
  user?: User;
}

const ROLE_COLORS = {
  VIEWER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  EDITOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  SUPER_USER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

const ROLE_LABELS = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor',
  SUPER_USER: 'Super User',
};

export function AppHeader({ user }: AppHeaderProps) {
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const navigation = [
    { name: 'Projects', href: '/', icon: FolderKanban },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Methodology', href: '/methodology', icon: BookOpen },
    { name: 'News', href: '/news', icon: Newspaper },
  ];

  if (isLoggedIn && user.role === 'SUPER_USER') {
    navigation.push({ name: 'Users', href: '/users', icon: Users });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="hidden sm:inline">EU Project Manager</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map(item => (
              <Link key={item.name} href={item.href as any}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">Login</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
              </div>
            ) : null}

            <nav className="flex flex-col gap-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button variant="default" size="sm" asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
