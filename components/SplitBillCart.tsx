import { OrderData, OrderItem } from '@/types/types';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useState } from 'react';
import { CopyPlus } from 'lucide-react';

interface SplitBillCartProps {
  setSplitBillOpen: (isOpen: boolean) => void;
  addItemToSplitter: (splitterId: number, item: OrderItem) => void;
  selectedSplitter: number | null;
  setLocalOrderData: (orderData: OrderData) => void;
  localOrderData : OrderData;
}

const SplitBillCart: React.FC<SplitBillCartProps> = ({
  setSplitBillOpen,
  addItemToSplitter,
  selectedSplitter,
  setLocalOrderData,
  localOrderData,
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRowExpansion = (index: number) => {
    setExpandedRow((prev) => (prev === index ? null : index));
  };
  const handleItemClick = (index: number) => {
    if (selectedSplitter !== null) {
      const item = localOrderData.orderDetails[index];
      addItemToSplitter(selectedSplitter, { ...item, quantity: 1 });

      const updatedOrderDetails = localOrderData.orderDetails.map((orderItem, i) => {
        if (i === index) {
          return { ...orderItem, quantity: orderItem.quantity - 1 };
        }
        return orderItem;
      }).filter(orderItem => orderItem.quantity > 0);

      setLocalOrderData({ ...localOrderData, orderDetails: updatedOrderDetails });
    }
  };

  return (
    <div>
      <div className='flex h-[535px] w-[350px] flex-col justify-between bg-white'>
        <div className='sm:rounded-lg'>
          <div className='flex flex-row'>
            <button
              onClick={() => setSplitBillOpen(false)}
              className='w-28 flex h-10 items-center justify-center gap-1 rounded-md bg-destructive text-black'
            >
              <div className='font-bold text-sm'>
                {t.cancel}
              </div>
            </button>
            <div
              className='w-full p-2 flex h-10 font-bold text-sm items-center justify-start rounded-md bg-[#758f47] text-black'
            >
              {t.updateOrderPending}
            </div>
          </div>
          <table className='w-full text-left text-sm text-gray-500 rtl:text-right'>
            <thead className='bg-white text-xs text-gray-900'>
              <tr className='flex cursor-pointer flex-row gap-x-4'>
                <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                  {t.quantity}
                </td>
                <td className='flex min-w-32 items-center px-3 py-1 font-medium'>
                  {t.item}
                </td>
                <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                  {t.price}
                </td>
              </tr>
            </thead>
            <tbody className='flex max-h-[405px] flex-col overflow-y-auto text-gray-900'>
              {localOrderData.orderDetails?.map((item, index) => (
                <>
                  <tr
                    className='mt-1 flex cursor-pointer flex-row gap-x-4 bg-[#00b5fa]'
                    key={index}
                    onClick={() => toggleRowExpansion(index)}
                  >
                    <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                      <div className='flex items-center'>
                        <div className='flex min-w-4 justify-center bg-white'>
                          {item.quantity}
                        </div>
                      </div>
                    </td>
                    <td className='flex min-w-32 items-center px-3 py-1 font-medium'>
                      ({item.itemName})
                    </td>
                    <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                      {item.price}
                      <button
                        onClick={() => handleItemClick(index)}
                        className='ml-2 bg-red-500 px-2 py-1 text-white'
                      >
                        <CopyPlus size={18} color='white' />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <>
                      {item.adOnItems?.map((addon, addonIndex) => (
                        <tr
                          key={addonIndex}
                          className='flex cursor-pointer flex-row gap-x-4 bg-[#00b5fa]'
                        >
                          <td className='w-[100px] px-3 py-1'></td>
                          <td className='flex w-[170px] font-medium'>
                            {addon.name}
                          </td>
                          <td className='flex items-start gap-2 px-2 py-1'>
                            {addon.price}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className='rounded-lg bg-white text-xs text-black'>
            <div className='m-2 flex items-center justify-center gap-4 px-2'>
              <button
                onClick={() => setSplitBillOpen(false)}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-destructive p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  {t.cancel}
                </div>
              </button>
              <button
                //onClick={handleSettleClick}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-[#758f47] p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  Save And Print Bill
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBillCart;
