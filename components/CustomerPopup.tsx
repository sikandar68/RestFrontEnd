import { Customer } from '@/types/types';
import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useMutation } from '@tanstack/react-query';
import { getCustomerByPhone } from '@/services/customer';

interface CustomerPopupProps {
  onAddCustomer: (customer: Customer) => void;
  setIsCustomerPopupOpen: (isOpen: boolean) => void;
}

const CustomerPopup: React.FC<CustomerPopupProps> = ({
  onAddCustomer,
  setIsCustomerPopupOpen,
}) => {
  const [customerInfo, setCustomerInfo] = useState<Customer>({ id: 0, name: '', localizedName: '', phone: '', address: '' });
  const { mutate: handlePhoneChange, isPending: loading } = useMutation({
    mutationFn: async (phone : string) => {
      return await getCustomerByPhone(phone);
    },
    onError: (error) => {
      console.log('Error', error.message);
    },
    onSuccess: (data) => {
      setCustomerInfo({
        id: data.id,
        name: data.name,
        localizedName: data.localizedName,
        phone: data.phone,
        address: data.address,
      });
    },
  });
  return (
    <div className='fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden'>
      <div className='relative max-h-full w-full max-w-md p-4'>
        <div className='relative rounded-lg bg-background'>
          <div className='flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600'>
            <h3 className='text-xl font-semibold text-secondary-foreground'>
              Select Customer
            </h3>
            <button
              type='button'
              className='end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
              onClick={() => setIsCustomerPopupOpen(false)}
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
                onAddCustomer(customerInfo);
              }}
            >
              {' '}
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                Name
              </label>
              <Input
                type='text'
                name='name'
                id='name'
                value={customerInfo.name}
                onChange={({ target }) =>
                  setCustomerInfo({ ...customerInfo, name: target.value })
                }
                placeholder='name'
                disabled={loading}
                required
              />
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                Localized Name
              </label>
              <Input
                type='text'
                name='localizedName'
                id='localizedName'
                value={customerInfo.localizedName}
                onChange={({ target }) =>
                  setCustomerInfo({ ...customerInfo, localizedName: target.value })
                }
                placeholder='Localized Name'
                disabled={loading}
                required
              />
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                Phone
              </label>
              <Input
                type='text'
                placeholder='phone'
                required
                onBlur={() => handlePhoneChange(customerInfo.phone)}
                value={customerInfo.phone}
                onChange={({ target }) =>
                  setCustomerInfo({ ...customerInfo, phone: target.value })
                }
                disabled={loading}
              />
              <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                Address
              </label>
              <Input
                type='text'
                value={customerInfo.address}
                onChange={({ target }) =>
                  setCustomerInfo({ ...customerInfo, address: target.value })
                }
                placeholder='address'
                disabled={loading}
                required
              />
              <Button
                type='submit'
                isLoading={loading}
                disabled={loading}
                className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPopup;
