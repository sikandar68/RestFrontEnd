import { MenuItems } from "@/types/interfaces";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from 'next/link';
import classNames from 'classnames';

export const MenuItem = ({
    item,
    toggleCollapse,
  }: {
    item: MenuItems;
    toggleCollapse: boolean;
  }) => {
    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const toggleSubMenu = () => {
      setSubMenuOpen(!subMenuOpen);
    };
    const router = useRouter();
    return (
      <div className='w-full'>
        {item.subItems && item.subItems.length > 0 ? (
          <>
            <button
              onClick={toggleSubMenu}
              className={` flex w-full flex-row items-center justify-between p-2 hover:bg-dark ${
                router.pathname == item.href ? 'bg-dark' : ''
              }`}
            >
              <div className='flex flex-row items-center space-x-4'>
                <img
                  src={item.icon}
                  className='h-5 w-5'
                  alt='icon'
                />
  
                {!toggleCollapse && (
                  <span className='flex text-md'>
                    {item.name}
                  </span>
                )}
              </div>
              {!toggleCollapse && (
                <div className={`${subMenuOpen ? 'rotate-180' : ''} flex`}>
                  <ChevronDown width='24' height='24' />
                </div>
              )}
            </button>
  
            {!toggleCollapse && subMenuOpen && (
              <div className=' ml-12 flex flex-col'>
                {item.subItems?.map((subItem, idx) => {
                  return (
                    <Link
                      key={idx}
                      href={subItem.href}
                      className={`${
                        subItem.href === router.pathname ? 'font-bold bg-dark' :
                        'hover:bg-dark'
                      }`}
                    >
                      {!toggleCollapse && (
                        <span
                          className={classNames(
                            'text-sm p-2'
                          )}
                        >
                          {subItem.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            className={`flex flex-row items-center space-x-4 rounded-lg p-2 hover:bg-dark ${
              item.href === router.pathname ? 'bg-dark' : ''
            }`}
          >
            <img
                  src={item.icon}
                  className='h-5 w-5'
                  alt='icon'
                />
            {!toggleCollapse && (
              <span className={classNames('text-md')}>
                {item.name}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };