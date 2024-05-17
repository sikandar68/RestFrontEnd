import classNames from 'classnames';
import React, { useState, FC, useEffect } from 'react';
import {
  CollapsIcon,
  LogoutIcon,
} from './icons';
import { API_CONFIG } from '@/constants/api-config';
import { parseCookies } from 'nookies';
import { MenuItems } from '../types/interfaces';
import { ClientPreference } from '@/types/types';
import { MenuItem } from './MenuItem';


const Sidebar: FC = () => {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItems[]>([]);
  const [logo, setLogo] = useState('');

  const cookies = parseCookies();

  const getData = (userEmail: string) => {
    fetch(
      `${API_CONFIG.BASE_URL}api/Permission/GetMenuItems?userEmail=${encodeURIComponent(
        userEmail
      )}`,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setMenuItems(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  const getLogo = () => {
    const clientPreferenceString = cookies.clientPreference || '{}';
    const clientPreference: ClientPreference = JSON.parse(clientPreferenceString);
    setLogo(clientPreference.logo);
  };
  useEffect(() => {
    const userEmail = cookies.username;
    getData(userEmail);
    getLogo();
  }, []);
  const wrapperClasses = classNames(
    'overflow-auto px-2 pt-8 bg-light flex justify-between flex-col shadow-lg',
    {
      ['w-56 min-w-56']: !toggleCollapse,
      ['w-16 min-w-16']: toggleCollapse,
    }
  );

  const collapseIconClasses = classNames(
    'p-4 rounded bg-light absolute ltr:right-0 rtl:left-0',
    {
      'rotate-180': toggleCollapse,
    }
  );

  const handleSidebarToggle = () => {
    setToggleCollapse(!toggleCollapse);
  };

  return (
    <div
      className={wrapperClasses}
      style={{ transition: 'width 400ms cubic-bezier(0.2, 0, 0, 1) 0s' }}
    >
      <div className='flex flex-col'>
        <div className='relative flex items-center justify-between'>
          {/* <div className='flex items-center justify-between'>
          {logo ? (
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
          </div> */}
          <button
              className={collapseIconClasses}
              onClick={handleSidebarToggle}
            >
              <CollapsIcon />
            </button>
        </div>

        <div className='mt-24 flex flex-col items-start'>
          {menuItems.map((item, idx) => {
            return (
              <MenuItem key={idx} item={item} toggleCollapse={toggleCollapse} />
            );
          })}
        </div>
      </div>
      {/* <a
            href='/logout'
            className='flex flex-row items-center gap-4 rounded-lg p-2 hover:bg-dark'
          >
            <div>
            <LogoutIcon/>
            </div>
            {!toggleCollapse && (
              <span className={classNames('text-xl text-text-light font-medium')}>
                Logout
              </span>
            )}
          </a> */}
    </div>
  );
};

export default Sidebar;
