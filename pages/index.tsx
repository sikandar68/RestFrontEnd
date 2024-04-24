import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Inter } from 'next/font/google';
import React from 'react';
import { parseCookies } from 'nookies';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
import NavBar from '@/components/header/NavBar';
import { ClientPreference } from '@/types/types';
import Layout from '@/components/Layout';
const inter = Inter({ subsets: ['latin'] });

const themes = [
  { code: 'default', translateKey: 'default' },
  { code: 'dark', translateKey: 'dark' },
];
export default function Home() {
  const cookies = parseCookies();
  const logedinuser = cookies.username;
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;

  const { resolvedTheme, theme, setTheme } = useTheme();
  const [date, setDate] = React.useState<Date>();
  const changeTheme = (theme: string) => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  };
  
  return (
    <>
      <NavBar />
      <Layout>
      <section className=' flex items-center justify-center'>
        <div>
          <h1 className='text-shadow px-8 text-center text-5xl font-bold text-white'>
            {t.welcome}
          </h1>
          <br />
          <div></div>
        </div>
      </section>
      </Layout>

    </>
  );
}
