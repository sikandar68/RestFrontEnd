import { MenuItems } from "@/types/interfaces";
import { ChevronDown, Dot } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from 'next/link';
import classNames from 'classnames';
import en from "@/locales/en";
import ar from "@/locales/ar";

export const MenuItem = ({
    item,
    toggleCollapse,
  }: {
    item: MenuItems;
    toggleCollapse: boolean;
  }) => {
    const router = useRouter();
    const { locale } = router;
    const t = locale === 'en' ? en : ar;

    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const toggleSubMenu = () => {
      setSubMenuOpen(!subMenuOpen);
    };
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
                    {locale === 'ar' ? item.localizedName : item.name}
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
              <div className=' ml-6 flex flex-col'>
                {item.subItems?.map((subItem, idx) => {
                  return (
                    <Link
                      key={idx}
                      href={subItem.href}
                      className={` ${
                        subItem.href === router.pathname ? 'font-bold bg-dark' :
                        'hover:bg-dark'
                      }`}
                    >
                      {!toggleCollapse && (
                        <span
                          className={classNames(
                            'text-sm p-2 flex flex-row'
                          )}
                        >
                          <Dot />
                          {locale === 'ar' ? subItem.localizedName : subItem.name}

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
                {locale === 'ar' ? item.localizedName : item.name}

              </span>
            )}
          </Link>
        )}
      </div>
    );
  };