import { Customer, OrderData, OrderItem } from '@/types/types';
import { Button } from './ui/button';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useState } from 'react';
import { BadgePercent, Puzzle, XOctagon } from 'lucide-react';
interface OrderSummaryProps {
  orderData: OrderData;
  handleQuantityChange: (index: number, quantity: number) => void;
  handleRemoveItemClick: (index: number) => void;
  handleSettleClick: () => void;
  handleCloseClick: () => void;
  setIsCouponPopupOpen: (isOpen: boolean) => void;
  setDiscountWindowOpen: (isOpen: boolean) => void;
  setServiceChargesWindowOpen: (isOpen: boolean) => void;
  handleEatInClick: () => void;
  setNewItemPopupOpen: (isOpen: boolean) => void;
}

const EposCart: React.FC<OrderSummaryProps> = ({
  orderData,
  handleQuantityChange,
  handleRemoveItemClick,
  handleSettleClick,
  handleCloseClick,
  setIsCouponPopupOpen,
  setDiscountWindowOpen,
  setServiceChargesWindowOpen,
  handleEatInClick,
  setNewItemPopupOpen
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRowExpansion = (index: number) => {
    setExpandedRow((prev) => (prev === index ? null : index));
  };
  return (
    <div>
      <div className='flex h-[542px] w-[360px] flex-col justify-between bg-white'>
        <div className='sm:rounded-lg'>
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
            <tbody className='flex max-h-[280px] flex-col overflow-y-auto text-gray-900'>
              {orderData.orderDetails?.map((item, index) => (
                <>
                  <tr
                    className='mt-1 flex cursor-pointer flex-row gap-x-4 bg-[#00b5fa]'
                    key={index}
                    onClick={() => toggleRowExpansion(index)}
                  >
                    <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                      <div className='flex items-center'>
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity - 1)
                          }
                          className='w-6 bg-gray-200 px-2 py-1 text-gray-700'
                        >
                          -
                        </button>
                        <div className='flex min-w-4 justify-center bg-white'>
                          {item.quantity}
                        </div>
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          className='w-6 bg-gray-200 px-2 py-1 text-gray-700'
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className='flex min-w-32 items-center px-3 py-1 font-medium'>
                      {/* {item.subCategoryName}  */}({item.itemName})
                    </td>
                    <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                      {item.price}
                      <button
                        onClick={() => handleRemoveItemClick(index)}
                        className='ml-2 bg-red-500 px-2 py-1 text-white'
                      >
                        <XOctagon size={18} color='white' />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <>
                      {item.adOnItems.map((addon, addonIndex) => (
                        <tr
                          key={addonIndex}
                          className='flex cursor-pointer flex-row gap-x-4 bg-[#00b5fa]'
                        >
                          <td className='w-[100px] px-3 py-1'></td>
                          <td className='flex w-[170px] font-medium'>
                            {addon.name}
                          </td>
                          <td className='flex items-start  gap-2 px-2 py-1'>
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
          {orderData.note && (
            <div className='text-bg-cyan-foreground overflow-y-auto rounded-lg bg-cyan text-xs'>
              <div className='flex flex-row font-semibold'>
                <div className='px-6 py-2 text-base'>{t.note}:</div>
                <div className='py-2 text-base'>{orderData.note}</div>
              </div>
            </div>
          )}
          <div className='rounded-lg bg-white text-xs text-black'>
            <div className='flex flex-col'>
              <div className='flex items-end gap-2 space-x-2 font-semibold'>
                <div className='w-16 px-6 py-1 text-sm'>{t.total}:</div>
                <div className='mr-5 px-6 py-2'>
                  {/* Total Amount Calculation */}
                  {orderData.orderDetails?.reduce(
                      (total, item) =>
                        total +
                        (item.price + // Item price
                          item.adOnItems.reduce(
                            (addonTotal, addon) => addonTotal + addon.price,
                            0
                          )) * // Addon prices
                          item.quantity,
                      0
                    )
                    .toFixed(2)}
                </div>
                <div className='w-16 px-6 py-1 text-sm'>{t.discount}:</div>
                <div className='mr-5 px-6 py-2'>
                  {orderData.discount.toFixed(2)}
                </div>
              </div>
              <div className='flex items-end gap-2 space-x-2 font-semibold'>
                <div className='w-16 px-6 py-1 text-sm'>
                  {t.serviceCharges}:
                </div>
                <div className='mr-5 px-6 py-2'>
                  {orderData.serviceCharges.toFixed(2)}
                </div>
              </div>
              <div className='flex items-end gap-36 space-x-2 font-semibold'></div>
            </div>

            <div className='flex flex-wrap items-center justify-start gap-1 px-2'>
              <button
                onClick={() => setDiscountWindowOpen(true)}
                className='flex h-10 w-20 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-light p-6 text-black'
              >
                <div className='flex flex-col items-center'>
                  <BadgePercent />
                  {t.discount}
                </div>
              </button>
              <button
                onClick={() => setIsCouponPopupOpen(true)}
                className='flex h-10 w-20 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-light p-6 text-black'
              >
                <div className='flex flex-col items-center'>
                  <Puzzle />
                  {t.coupon}
                </div>
              </button>
              <button
                onClick={() => setServiceChargesWindowOpen(true)}
                className='flex h-10 w-20 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-light p-6 text-black'
              >
                <div className='flex flex-col items-center'>
                  <BadgePercent />
                  {t.serviceCharges}
                </div>
              </button>
              <button
                onClick={handleEatInClick}
                className='flex h-10 w-20 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-light p-6 text-black'
              >
                <div className='flex flex-col items-center'>
                  <BadgePercent />
                  {t.eatIn}
                </div>
              </button>
              <button
                    onClick={() => setNewItemPopupOpen(true)}
                    className='flex h-10 w-20 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-light p-6 text-black'
                  >
                    <div className='flex flex-col items-center'>
                      <BadgePercent />
                      New
                    </div>
                  </button>
            </div>

            <div className='m-2 flex items-center justify-center gap-4 px-2'>
              <button
                onClick={handleCloseClick}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-destructive p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  {t.delete}
                </div>
              </button>
              <button
                onClick={handleSettleClick}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-[#758f47] p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  {t.proceed}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EposCart;
