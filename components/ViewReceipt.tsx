import React, { useEffect, useState } from 'react';
import {
  OrderData,
  Customer,
  OrderItem,
  ClientPreference,
} from '@/types/types';
import { parseCookies } from 'nookies';
import { calculateTotal } from '@/services/order';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
//import './Receipt.css'; // Import your stylesheet

interface ReceiptProps {
  orderData: any;
}

const ViewReceipt: React.ForwardRefRenderFunction<any, ReceiptProps> = (
  { orderData },
  ref
) => {
  const cookies = parseCookies();
  const [clientPreference, setClientPreference] = useState<ClientPreference>({ id: 0, name: '', theme: '', language: '', logo: '', address: '', phone : '' });
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  
  useEffect(() => {
    debugger;
    const clientPreferenceString = cookies.clientPreference || '{}';
    const clientPreference: ClientPreference = JSON.parse(
      clientPreferenceString
    );
    setClientPreference(clientPreference);
  }, []);
  return (
    <div
      ref={ref}
      className='max-h-screen-minus-4rem mx-auto flex w-[300px] max-w-md flex-1 flex-col border border-light p-4 shadow-md shadow-light'
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Restaurant Logo */}
      <div className='flex justify-center'>
        <div className='flex w-28 items-center justify-center rounded-full'>
          <img
            src={clientPreference.logo}
            alt='Restaurant Logo'
            className='h-auto max-w-full rounded-full'
          />
        </div>
      </div>
      {/* Customer Details */}
      {orderData.customer ? (
        <div>
          <table className='w-full'>
            <tbody>
              <tr className='flex'>
                <td className='flex-1'>
                  <h2 className='text-xl font-bold'>
                    {orderData.customer.name}
                  </h2>
                </td>
                <td>
                  <p>{clientPreference.name}</p>
                </td>
              </tr>
              <tr className='flex'>
                <td className='flex-1'>
                  <p>{t.phone}: {orderData.customer.phone}</p>
                </td>
                <td>
                  <p>{clientPreference.phone}</p>
                </td>
              </tr>
              <tr className='flex'>
                <td className='flex-1'>
                  <p>{t.address}: {orderData.customer.street}</p>
                </td>
                <td className='w-32'>
                  <p>{clientPreference.address}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className='flex'>
          <div className='flex-1'>
            <img
              src={clientPreference.logo}
              alt='Image'
              className='h-20 w-20 max-w-full rounded-full'
            />
          </div>
          <div>
            <table className='w-full'>
              <tbody>
                <tr>
                  <td>
                    <p>{clientPreference.name}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p>{clientPreference.phone}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p>{clientPreference.address}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className='order-details mt-4 overflow-y-auto'>
        <h3 className='mb-2 text-lg font-bold'>{t.orderDetails}</h3>
        <table className='mb-4 w-full'>
          <thead>
            <tr className='border-b'>
              <th className='py-2'>{t.quantity}</th>
              <th>{t.item}</th>
              <th className='py-2'>{t.price}</th>
              <th className='py-2'>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {orderData.orderDetails?.map((item: any, index: any) => (
              <tr key={index} className='border-b'>
                <td className='py-2'>{item.quantity}</td>
                <td>{item.itemName}</td>
                <td className='py-2'>${item.price.toFixed(2)}</td>
                <td className='py-2'>
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Total */}
      <div className='total text-right text-lg font-bold'>
        <h4>{t.total}: ${calculateTotal(orderData.orderDetails)?.toFixed(2)}</h4>
      </div>
    </div>
  );
};

// Helper function to calculate the total amount

export default React.forwardRef(ViewReceipt);
