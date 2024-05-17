import { OrderItem } from '@/types/types';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';

interface CustomerPopupProps {
  onAddNewItem: (newItem: OrderItem) => void;
  setNewItemPopupOpen: (isOpen: boolean) => void;
}

const NewItem: React.FC<CustomerPopupProps> = ({
  onAddNewItem,
  setNewItemPopupOpen,
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [itemData, setItemData] = useState<OrderItem>({ itemId: 0, itemName: '', price: 0, quantity: 0, adOnItems: [], });
  
  return (
    <div className='fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden'>
      <div className='relative max-h-full w-full max-w-md p-4'>
        <div className='relative rounded-lg bg-background'>
          <div className='flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600'>
            <h3 className='text-xl font-semibold text-secondary-foreground'>
              {t.newItem}
            </h3>
            <button
              type='button'
              className='end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
              onClick={() => setNewItemPopupOpen(false)}
            >
              <svg
                className='h-3 w-3'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 14 14'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                />
              </svg>
              <span className='sr-only'>Close modal</span>
            </button>
          </div>
          <div className='p-4 md:p-5'>
            <form
              className='space-y-4'
              onSubmit={(e) => {
                e.preventDefault();
                onAddNewItem(itemData);
                setNewItemPopupOpen(false);
              }}
            >
              {' '}
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                {t.name}
              </label>
              <Input
                type='text'
                name='name'
                id='name'
                value={itemData.itemName}
                onChange={({ target }) =>
                  setItemData({ ...itemData, itemName: target.value })
                }
                placeholder={t.name}
                //disabled={loading}
                required
              />
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                {t.quantity}
              </label>
              <Input
                type='text'
                placeholder={t.quantity}
                required
                value={itemData.quantity}
                onChange={({ target }) =>
                  setItemData({ ...itemData, quantity: parseFloat(target.value) })
                }
                //disabled={loading}
              />
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                {t.price}
              </label>
              <Input
                type='text'
                value={itemData.price}
                onChange={({ target }) =>
                  setItemData({ ...itemData, price: parseFloat(target.value) })
                }
                placeholder={t.price}
                //disabled={loading}
                required
              />
              <Button
                type='submit'
                //isLoading={loading}
                //disabled={loading}
                className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              >
                {t.submit}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewItem;
