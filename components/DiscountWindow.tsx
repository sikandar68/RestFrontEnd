import { OrderData } from '@/types/types';
import { Input } from './ui/input';
import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';

interface EposCheckOutFormProps {
  orderData: OrderData;
  onUpdateOrderData: (orderData: OrderData) => void;
  setDiscountWindowOpen: (isOpen: boolean) => void;
}

const DiscountWindow: React.FC<EposCheckOutFormProps> = ({
  orderData,
  onUpdateOrderData,
  setDiscountWindowOpen,
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [value, setValue] = useState('');
  const [type, setType] = useState('cash');

  const handleDigitButtonClick = (digit: string) => {
    if (digit === '.' && value.includes('.')) {
      return;
    }

    setValue((prevValue) => prevValue + digit);
  };

  const handleRemoveLastDigit = () => {
    setValue((prevValue) => prevValue.slice(0, -1));
  };
  const handleSaveClick = () => {
    const total = orderData.items.reduce(
      (total, item) =>
        total +
        (item.price + item.adOnItems.reduce(
          (addonTotal, addon) => addonTotal + addon.price,
          0
        )) * item.quantity,
      0
    );
  
    let discount = 0;
    if (type === 'percentage') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        discount = (numericValue / 100) * total;
      } else {
        console.error('Invalid percentage value:', value);
      }
    } else {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        discount = numericValue;
      } else {
        console.error('Invalid discount value:', value);
      }
    }
    onUpdateOrderData({
      ...orderData,
      discount: orderData.discount + discount,
    });
    setDiscountWindowOpen(false);
  };
  
  const handleTypeClick = (selectedPaymentType: string) => {
    setType(selectedPaymentType);
  };
  
  return (
    <div className='fixed inset-0 flex items-center justify-center'>
      <div className='z-50 mx-4 max-w-full rounded-lg bg-white shadow-lg'>
        {/* Modal content */}
        <div className='relative max-h-full w-full'>
          {/* Modal header */}
          <div className='flex items-center justify-between gap-4 rounded-t'>
            
          </div>
          {/* Modal body */}
          <div className='bg-[#f9f9f9] p-2'>
            <div className='container mx-auto mt-1 flex justify-center'>
              <div className='mx-2 flex max-w-[320px] flex-wrap justify-center'>
                <div className='flex flex-row gap-4'>
                <div className='flex w-[320px] flex-col justify-start'>
                      <Input
                        onChange={(e) => setValue(e.target.value)}
                        className='h-10 w-full'
                        value={value}
                        required
                      />
                      <div dir='ltr' className='flex flex-wrap justify-center'>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('1')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          1
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('2')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          2
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('3')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          3
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('10')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          10
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('4')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          4
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('5')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          5
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('6')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          6
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('20')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          20
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('7')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          7
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('8')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          8
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('9')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          9
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('30')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          30
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('.')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          .
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('0')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          0
                        </button>
                        <button
                          type='button'
                          onClick={handleRemoveLastDigit}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          X
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDigitButtonClick('50')}
                          className=' h-12 w-20 bg-primary px-5 py-2.5 text-lg font-bold text-white'
                        >
                          50
                        </button>
                      </div>
                    </div>
                </div>
                <div className='mx-1 my-6 flex flex-row gap-4'>
                  <div className='flex gap-x-4'>
                    <Button
                      onClick={() => handleTypeClick('cash')}
                      className={`h-12 w-full rounded-lg px-6 font-semibold text-black md:w-40 ${
                        type === 'cash' ? 'bg-primary' : 'bg-light'
                      }`}
                    >
                      {t.cash}
                    </Button>
                    <Button
                      onClick={() => handleTypeClick('percentage')}
                      className={`h-12 w-full rounded-lg px-6 font-semibold text-black md:w-40 ${
                        type === 'percentage' ? 'bg-primary' : 'bg-light'
                      }`}
                    >
                      {t.percentage}
                    </Button>
                  </div>
                </div>
                <div className='mx-1 my-2 flex flex-row gap-16'>
                  <div className='flex gap-x-4'>
                  <button
                      onClick={() => {
                        onUpdateOrderData({
                          ...orderData,
                          discount: 0,
                        });
                        setDiscountWindowOpen(false);
                      }}
                      className='md:w-30 flex h-6 w-full items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-destructive p-6 text-black'
                    >
                      <div className='flex flex-col items-center text-xl'>
                        {t.cancel}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveClick();
                      }}
                      className='md:w-30 flex h-6 w-full items-center justify-center gap-1 rounded-md border border-[#a1a1a1] bg-[#758f47] p-6 text-black'
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
        </div>
      </div>
    </div>
  );
};

export default DiscountWindow;
