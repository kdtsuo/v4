'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import { Loader2, LogIn, LogOut, Menu, MoonIcon, SunIcon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { IconLink } from './IconLink';
import { getDelayClass } from '@/utils';

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role='button'
      className={`flex rounded-xl p-2 outline ${className}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <SunIcon
        className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0
          dark:-rotate-90'
      />
      <MoonIcon
        className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all
          dark:scale-100 dark:rotate-0'
      />
      <span className='sr-only'>Toggle theme</span>
    </div>
  );
}

function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message, {
          duration: 3000,
        });
      } else {
        setIsOpen(false);
        toast.success('Logged in successfully ' + data.session.user.email, {
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', {
        duration: 3000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          Login
          <LogIn />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            To sign in to your account, one will be provided to you if you are a team
            member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignIn}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' className='cursor-pointer' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='animate-spin' />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LogoutDialog() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success('Logged out successfully', {
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to log out. Please try again.', {
        duration: 3000,
      });
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' disabled={isLoggingOut}>
          {isLoggingOut ? (
            <>
              <Loader2 size={16} className='mr-2 animate-spin' />
              Logging out...
            </>
          ) : (
            <>
              <strong>{user?.email?.split('@')[0]}</strong>
              <LogOut />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[300px]'>
        <DialogHeader>
          <DialogTitle>Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out of{' '}
            <strong>{user?.email?.split('@')[0]}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleSignOut}>
            {isLoggingOut && <Loader2 className='animate-spin' />}
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const items = ['Home', 'About', 'Positions', 'Contacts', 'Sponsors'];
  const [open, setOpen] = useState(false);

  const authSection = user ? (
    <>
      <LogoutDialog />
    </>
  ) : (
    <>
      <LoginDialog />
    </>
  );

  const linkIcons = [
    {
      href: 'https://www.instagram.com/kdt.suo/?theme=dark',
      imgSrc: '/assets/img/icons/instagramlogo.png',
      alt: 'instagram',
    },
    {
      href: 'mailto:kpopdanceteam.suo@gmail.com',
      imgSrc: '/assets/img/icons/maillogo.png',
      alt: 'mail',
    },
    {
      href: 'https://discord.com/invite/tbKkvjV2W8',
      imgSrc: '/assets/img/icons/discordlogo.png',
      alt: 'discord',
    },
    {
      href: 'https://www.github.com/kdtsuo/v4',
      imgSrc: '/assets/img/icons/githublogo.png',
      alt: 'github',
    },
  ];

  return (
    <div
      className='fixed top-0 left-1/2 z-50 mt-4 w-11/12 max-w-7xl -translate-x-1/2 t500e
        md:mt-7'
    >
      <div className='bg-background/20 w-full rounded-full border shadow-sm 
        backdrop-blur-sm'>
        <div className='flex w-full items-center justify-between px-2 py-4 lg:px-4'>
          {/* Logo */}
          <Link href='/'>
            <Image
              src='/assets/img/kdtlogotransparent.png'
              alt='KDT Logo'
              width={64}
              height={64}
              className='h-auto w-16'
            />
          </Link>

          <div>
            {/* Navigation Links - Desktop */}
            <div className='hidden items-center gap-2 lg:flex'>
              <div className='flex items-center gap-2 lg:gap-4'>
                <ThemeToggle className={`fade-in-from-right ${getDelayClass(1)}`} />
                {items.map((item, i) => {
                  const path = item.toLowerCase();
                  const itemPath = path === 'home' ? '' : path;
                  const isActive =
                    pathname === `/${itemPath}` || (pathname === '/' && item === 'Home');

                  return (
                    <Button
                      key={item}
                      asChild
                      variant={isActive ? 'default' : 'outline'}
                      className={`text-base font-medium fade-in-from-right
                      ${getDelayClass(i + 1)}`}
                    >
                      <Link href={`/${itemPath}`}>{item}</Link>
                    </Button>
                  );
                })}
              </div>
              <div
                className={`mx-4 flex items-center fade-in-from-right
                  ${getDelayClass(items.length + 2)}`}
              >
                {authSection}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className='flex h-auto items-center gap-4 lg:hidden'>
              <ThemeToggle />
              {/* turned off for now, just playing */}
              {/* <LanguageSelector /> */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <div role='button' className='rounded-xl p-2 outline'>
                    <Menu />
                  </div>
                </SheetTrigger>
                <SheetContent side='right'>
                  <SheetHeader className='flex items-center'>
                    <SheetTitle>
                      <Image
                        src='/assets/img/kdtlogotransparent.png'
                        alt='KDT Logo'
                        width={112}
                        height={112}
                        className='mx-auto h-auto w-28'
                      />
                    </SheetTitle>
                  </SheetHeader>
                  <div
                    className='mx-auto flex w-1/2 flex-col items-center justify-center
                      space-y-4 text-xl'
                  >
                    <div className='flex items-center justify-center'>
                      <ThemeToggle />
                    </div>
                    {items.map((item) => {
                      const path = item.toLowerCase();
                      const itemPath = path === 'home' ? '' : path;
                      const isActive =
                        pathname === `/${itemPath}` ||
                        (pathname === '/' && item === 'Home');

                      return (
                        <Button
                          key={item}
                          asChild
                          variant={isActive ? 'default' : 'ghost'}
                          onClick={() => setOpen(false)}
                          className='w-full justify-center text-lg'
                        >
                          <Link href={`/${itemPath}`}>{item}</Link>
                        </Button>
                      );
                    })}
                    <div className='flex flex-col items-center gap-4'>{authSection}</div>
                    <div className='flex w-full justify-center'>
                      <IconLink links={linkIcons} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className='mr-1'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
