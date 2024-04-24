import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
//import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { LangDropDown, themes, USER_IMAGE_URL } from '@/constants/constants';
import { API_CONFIG } from '@/constants/api-config';
import { Context } from '@/contexts/UseContext';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { ClientPreference } from '@/types/types';
import Link from 'next/link';
import { AlignJustify, Moon, Sun, X } from 'lucide-react';
import Jwt from 'jsonwebtoken';
import Image  from 'next/image';
import nookies, { parseCookies, destroyCookie } from 'nookies';
import ToggleSwitch from '../elements/toggleSwitch';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
interface MenuItem {
  itemId: number;
  name: string;
  localizedName: string;
  href: string;
  permission?: string;
  parentId?: number;
  subItems?: MenuItem[];
}
const NavBar: React.FC = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;

  const { changeLanguage, changeTheme, theme } = Context();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserProfileOpen, setUserProfileOpen] = useState(false);
  const [openDropdownMenu, setOpenDropdownMenu] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userImage, setUserImage] = useState('');
  const [email, setEmail] = useState('');
  const [saId, setSaId] = useState('');

  const handleLogin = async () => {
    if (window.confirm('Are you sure to Loing from this user !') === true) {
      try {
        const token = cookies.token || '';
        const jsonToken = Jwt.decode(token) as { [key: string]: string }; // Decoding the JWT token
        const userId =
          jsonToken[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ];
        const fetchResponse = await fetch(
          `https://localhost:7160/api/Auth/AuthenticateById?id=${saId}&saId=${userId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

          if (!fetchResponse.ok) {
              throw new Error(`Request failed with status: ${fetchResponse.status}`);
          }

          const resp = await fetchResponse.json();
          const respToken = resp.response.token || '';

          const json = Jwt.decode(respToken) as { [key: string]: string };
          console.log(json);
          setUserCookies(resp.response.token, json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '', json['saId'] || '', false, resp.response.clientPreferences);
          window.location.href = '/';
      } catch (error) {
          console.error('Fetch error:');
      }
  }
  };
  function setUserCookies(
    //twoFAEnabled: boolean,
    token: string,
    //guid: string,
    username: string,
    saId : string, 
    //onboarding: string,
    rememberMe: boolean = true,
    clientPreference : ClientPreference
  ) {
    // Set the cookie with an explicit expiration time (e.g., 30 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

    const expiration = rememberMe
      ? {
        maxAge: DAYS_IN_SECONDS, // Cookie will expire in 30 days (in seconds)
        expires: expirationDate, // Sets the explicit expiration date
        path: '/', // Cookie will be accessible from all paths
        secure: true,
        httpOnly: false,
      }
      : {
        path: '/', // Cookie will be accessible from all paths
        secure: true,
        httpOnly: false,
      };

    nookies.set(undefined, 'token', token, expiration);
    //nookies.set(undefined, "guid", guid, expiration);
    nookies.set(undefined, 'username', username, expiration);
    nookies.set(undefined, 'saId', saId, expiration);
    //nookies.set(undefined, "onboarding", onboarding, expiration);
    nookies.set(undefined, 'rememberMe', rememberMe + '', expiration);
    const clientPreferenceString = JSON.stringify(clientPreference);

    nookies.set(undefined, 'clientPreference', clientPreferenceString, expiration);
  }
  const handleToggleUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setUserProfileOpen(!isUserProfileOpen);
    setOpenDropdownMenu(null);
  };

  const handleToggleDropdownMenu = (
    menuName: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setOpenDropdownMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const isDropdownClick = (event.target as Element).closest('.dropdown-menu');

    if (!isDropdownClick) {
      setUserProfileOpen(false);
      setOpenDropdownMenu(null);
    }
  };
  const getData = (userEmail: string) => {
    axios
      .get(
        `${API_CONFIG.BASE_URL}api/Permission/GetMenuItems?userEmail=${userEmail}`
      )
      .then((response) => {
        setMenuItems(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getUserImage = () => {
    const token = cookies.token || '';
    const json = Jwt.decode(token) as { userImage: string };
    const userImage = json['userImage'];
    setUserImage(userImage);
  };
  const cookies = parseCookies();

  useEffect(() => {
    const userEmail = cookies.username;
    const saId = cookies.saId;
    getData(userEmail);
    getUserImage();
    setEmail(userEmail);
    setSaId(saId);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  return (
    <div className='w-full bg-light'>
      <div className='mx-auto px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          <div className='absolute inset-y-0 flex items-center sm:hidden'>
          <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              type='button'
              className='inline-flex items-center justify-center p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
            >
              {isMenuOpen ? (
                 <X  className='block h-6 w-6' aria-hidden='true' />
              ) : (
                <AlignJustify className='block h-6 w-6' aria-hidden='true'/>
              )}
            </button>
          </div>
          <div className='flex items-center justify-between'>
          {true ? (
              <img
              className='hidden h-8 w-auto md:block lg:block'
              //src={logo}
              src='https://mavenx-test.s3.eu-north-1.amazonaws.com/default/1efb73cda2934e9b9d63fea237704b09.png'
              alt='Logo'
            />
            ):(
              <img
              className='hidden h-8 w-auto md:block lg:block'
              src='defaultLogo.png'
              alt='Logo'
            />
            )}
          </div>
          {/* <div className='hidden sm:ml-6 sm:flex sm:items-center'>
            {nestedMenuItems.map((menuItem) => (
              <div key={menuItem.name} className='relative ml-3'>
                {menuItem.subItems ? (
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={(event) =>
                        handleToggleDropdownMenu(menuItem.name, event)
                      }
                      className='flex rounded-xl bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
                    >
                      <span className='sr-only'>{`Open ${menuItem.name} menu`}</span>
                      <span className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'>
                        {menuItem.name}
                      </span>
                    </button>
                    {openDropdownMenu === menuItem.name && (
                      <div className='absolute z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                        {menuItem.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className='block px-4 py-2 text-sm text-gray-700'
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={menuItem.href}
                    className={classNames(
                      'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    {menuItem.name}
                  </a>
                )}
              </div>
            ))}
          </div> */}
          <div className='flex flex-row gap-2 relative ml-3'>
            
            {/* <Select
              value={theme}
              onValueChange={(newValue) => {
                changeTheme(newValue);
              }}
            >
              <SelectTrigger>{theme}</SelectTrigger>
              <SelectContent>
                {themes.map((op) => (
                  <SelectItem value={op.value} key={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
          <div className="flex items-center justify-end max-w-[400px] w-full">
          
        </div>
          <div className='sm:ml-6 sm:flex sm:items-center'>
          <div className="hidden sm:block pr-5">
            <div className="flex w-[120px] justify-evenly items-center">
            <Moon className='bg-light h-5 w-5'/>
              <ToggleSwitch
                onChange={()=>{
                  if(theme =='dark'){
                    changeTheme('default');
                  }
                  else{
                    changeTheme('dark');
                  }
                }}
                checked={theme == 'dark'}
                className="scale-[1.15]"
              />
              <Sun className='bg-light h-5 w-5'/>
            </div>
          </div>
          <div className="hidden sm:block pr-5">
          <Select
              value={locale}
              onValueChange={(newValue) => changeLanguage(newValue)}
            >
              <SelectTrigger className='rounded-full h-6'>
                {locale}
                {/* {LangDropDown.find((op) => op.value === locale)?.label} */}
              </SelectTrigger>
              <SelectContent>
                {LangDropDown.map((op) => (
                  <SelectItem value={op.value} key={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            {/* Profile dropdown */}
            {email && (
              <div className='hidden sm:block pr-5'>
                <div className='relative'>
                <button
                  type='button'
                  onClick={(event) =>
                    handleToggleDropdownMenu('StaticDropdown', event)
                  }
                  className='flex rounded-full bg-dark text-sm'
                >
                  <span className='sr-only'>Open Static Dropdown menu</span>
                  <img
                    className='min-h-8 w-8 h-8 min-w-8 rounded-full'
                    src= {userImage || USER_IMAGE_URL}
                    alt='Static Dropdown'
                  />
                </button>
                  {openDropdownMenu === 'StaticDropdown' && (
                    <div className='absolute ltr:right-0 rtl:left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-light py-1 shadow-lg shadow-dark border border-dark'>
                      <div
                        className='text-md hover:bg-dark block px-4 py-2 text-sm font-bold'
                        role='menuitem'
                        id='user-menu-item-0'
                      >
                        {email}
                      </div>
                      <a
                        href='/static-item-1'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.yourProfile}
                      </a>
                      <a
                        href='/static-item-2'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.settings}
                      </a>
                      {saId && saId !== '' && (
                      <a
                        onClick={handleLogin}
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        Impersonate
                      </a>
                      )}
                      <a
                        href='/logout'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.signOut}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className='sm:hidden' onClick={() => setMenuOpen(true)}>
          <div className='space-y-1 px-2 pb-3 pt-2'>
            {/* Profile dropdown */}
            {email && (
              <div className='flex relative ml-3'>
                <div className='relative'>
                <button
                  type='button'
                  onClick={(event) =>
                    handleToggleDropdownMenu('StaticDropdown', event)
                  }
                  className='flex rounded-full bg-dark text-sm'
                >
                  <span className='sr-only'>Open Static Dropdown menu</span>
                  <img
                    className='h-8 w-8 rounded-full'
                    src= {userImage || USER_IMAGE_URL}
                    alt='Static Dropdown'
                  />
                </button>
                  {openDropdownMenu === 'StaticDropdown' && (
                    <div className='absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-light py-1 shadow-lg shadow-dark border border-dark'>
                      <div
                        className='text-md hover:bg-dark block px-4 py-2 text-sm font-bold'
                        role='menuitem'
                        id='user-menu-item-0'
                      >
                        {email}
                      </div>
                      <a
                        href='/static-item-1'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.yourProfile}
                      </a>
                      <a
                        href='/static-item-2'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.settings}
                      </a>
                      {saId && saId !== '' && (
                      <a
                        onClick={handleLogin}
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        Impersonate
                      </a>
                      )}
                      <a
                        href='/logout'
                        className='block hover:bg-dark px-4 py-2 text-sm'
                      >
                        {t.signOut}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
