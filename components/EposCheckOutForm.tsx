import { OrderData } from '@/types/types';
import { Input } from './ui/input';
import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';

interface EposCheckOutFormProps {
  orderData: OrderData;
  onUpdateOrderData: (updatedOrderData: OrderData) => void;
  handlePrintBillClick: () => void;
  handleDiscountClick: () => void;
  handleSaveClick: () => void;
  setCheckOutFormOpen: (isOpen: boolean) => void;
}

const EposCheckOutForm: React.FC<EposCheckOutFormProps> = ({
  orderData,
  onUpdateOrderData,
  handlePrintBillClick,
  handleDiscountClick,
  handleSaveClick,
  setCheckOutFormOpen,
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [chargedValue, setChargedValue] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [deliveryType, setDeliveryType] = useState('waiting');

  const handleDigitButtonClick = (digit: string) => {
    if (digit === '.' && chargedValue.includes('.')) {
      return;
    }

    setChargedValue((prevValue) => prevValue + digit);
  };

  const handleRemoveLastDigit = () => {
    setChargedValue((prevValue) => prevValue.slice(0, -1));
  };
  const handlePaymentTypeClick = (selectedPaymentType: string) => {
    setPaymentType(selectedPaymentType);
    onUpdateOrderData({
      ...orderData,
      paymentType: selectedPaymentType,
    });
  };
  const handleDeliveryTypeClick = (selectedDeliveryType: string) => {
    setDeliveryType(selectedDeliveryType);
    onUpdateOrderData({
      ...orderData,
      deliveryType: selectedDeliveryType,
    });
  };
  return (
    <div className='customer-popup fixed inset-0 flex items-center justify-center'>
      <div className='fixed z-50 h-auto w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg md:p-5'>
        {/* Modal content */}
        <div className='relative max-h-full w-full max-w-2xl p-4'>
          {/* Modal header */}
          <div className='flex items-center justify-between gap-4 rounded-t p-2 md:p-3'>
            <button
              onClick={() => setCheckOutFormOpen(false)}
              type='button'
              className='ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-black hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
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
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                />
              </svg>
              <span className='sr-only'>Close modal</span>
            </button>
          </div>
          {/* Modal body */}
          <div className='p-2 min-w-[600px] bg-[#f9f9f9]'>
            <div className='container relative mx-auto'>
              {/* <div className='mx-1 my-2 flex flex-row gap-4'>
                <h1 className='mt-2 font-bold'>{t.deliveryType}:</h1>
                <div className='flex gap-x-4'>
                  <Button
                    onClick={() => handleDeliveryTypeClick('waiting')}
                    className={`h-8 w-16 flex-1 rounded-lg px-6 font-semibold text-black ${
                      deliveryType === 'waiting' ? 'bg-primary' : 'bg-light'
                    }`}
                  >
                    waiting
                  </Button>
                  <Button
                    onClick={() => handleDeliveryTypeClick('delivery')}
                    className={`h-8 w-16 flex-1 rounded-lg px-6 font-semibold text-black ${
                      deliveryType === 'delivery' ? 'bg-primary' : 'bg-light'
                    }`}
                  >
                    delivery
                  </Button>
                  <Button
                    onClick={() => handleDeliveryTypeClick('collection')}
                    className={`h-8 w-16 flex-1 rounded-lg px-6 font-semibold text-black ${
                      deliveryType === 'collection' ? 'bg-primary' : 'bg-light'
                    }`}
                  >
                    collection
                  </Button>
                  <Button
                    onClick={() => handleDeliveryTypeClick('eatin')}
                    className={`h-8 w-16 flex-1 rounded-lg px-6 font-semibold text-black ${
                      deliveryType === 'eatin' ? 'bg-primary' : 'bg-light'
                    }`}
                  >
                    eatin
                  </Button>
                </div>
              </div> */}
            </div>
            <div className='container mx-auto mt-1'>
              <div className='mx-2 flex max-w-[550px] flex-wrap justify-center'>
                <div className='flex flex-row gap-5'>
                  <div className='bg-white'>
                    <div className='flex flex-col justify-start font-semibold'>
                      <div className='flex flex-row justify-start'>
                        <div className='w-16 px-2 py-1 text-sm'>{t.total}:</div>
                        <div className='mr-5 px-6 py-2'>
                          {/* Total Amount Calculation */}
                          {orderData.items
                            .reduce(
                              (total, item) =>
                                total +
                                (item.price + // Item price
                                  item.adOnItems.reduce(
                                    (addonTotal, addon) =>
                                      addonTotal + addon.price,
                                    0
                                  )) * // Addon prices
                                  item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </div>
                      </div>

                      <div className='flex flex-row justify-start'>
                        <div className='w-16 px-2 py-1 text-sm'>
                          {t.discount}:
                        </div>
                        <div className='mr-5 px-6 py-2'>0.00</div>
                      </div>
                      <div className='flex flex-row justify-start'>
                        <div className='w-16 px-2 py-1 text-sm'>
                          {t.serviceCharges}:
                        </div>
                        <div className='mr-5 px-6 py-2'>0.00</div>
                      </div>
                    </div>
                  </div>
                  <div className='flex max-w-[350px] flex-col justify-start'>
                    <Input
                      onChange={(e) => setChargedValue(e.target.value)}
                      className='h-10 w-full'
                      value={chargedValue}
                      required
                    />
                    <div dir='ltr' className='flex flex-wrap justify-center'>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('1')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        1
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('2')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        2
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('3')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        3
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('10')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        10
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('4')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        4
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('5')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        5
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('6')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        6
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('20')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        20
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('7')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        7
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('8')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        8
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('9')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        9
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('30')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        30
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('.')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        .
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('0')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        0
                      </button>
                      <button
                        type='button'
                        onClick={handleRemoveLastDigit}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        X
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDigitButtonClick('50')}
                        className=' h-8 w-20 bg-primary px-5 py-2.5 text-sm font-medium text-white'
                      >
                        50
                      </button>
                    </div>
                  </div>
                </div>
                <div className='mx-1 my-2 flex flex-row gap-16'>
                  <h1 className='mt-2 font-bold'>{t.paymentType}:</h1>
                  <div className='flex gap-x-4'>
                    <Button
                      onClick={() => handlePaymentTypeClick('Cash')}
                      className={`h-8 flex-1 rounded-lg px-6 font-semibold text-black ${
                        paymentType === 'Cash' ? 'bg-primary' : 'bg-light'
                      }`}
                    >
                      {t.cash}
                    </Button>
                    <Button
                      onClick={() => handlePaymentTypeClick('Credit')}
                      className={`h-8 flex-1 rounded-lg px-6 font-semibold text-black ${
                        paymentType === 'Credit' ? 'bg-primary' : 'bg-light'
                      }`}
                    >
                      {t.credit}
                    </Button>
                  </div>
                </div>
                <div className='mx-1 my-2 flex flex-row gap-16'>
                  <div className='flex gap-x-4'>
                  <button
                onClick={handleSaveClick}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-[#758f47] p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  {t.proceed}
                </div>
              </button>
              <button
                onClick={handleSaveClick}
                className='w-30 flex h-6 items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-destructive p-6 text-black'
              >
                <div className='flex flex-col items-center text-xl'>
                  {t.cancel}
                </div>
              </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EposCheckOutForm;
