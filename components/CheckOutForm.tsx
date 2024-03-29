import { OrderData } from '@/types/types';
import { Input } from './ui/input';
import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';

interface CheckOutFormProps {
  orderData: OrderData;
  onUpdateOrderData: (updatedOrderData: OrderData) => void;
  handlePrintBillClick: () => void;
  handleDiscountClick: () => void;
}

const CheckOutForm: React.FC<CheckOutFormProps> = ({
  orderData,
  onUpdateOrderData,
  handlePrintBillClick,
  handleDiscountClick,
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
    <div className=' mt-2 h-[400px] min-h-[400px] w-[520px] min-w-[520px] rounded-xl bg-[#f9f9f9]'>
      <div className='container relative mx-auto'>
        <div className='mx-1 my-2 flex flex-row'>
          <div className="w-20">
          <h1 className='mt-2 font-bold'>{t.total}:</h1>
          </div>
          <Input
            className='ml-10 block h-10 w-56 p-2.5'
            value={(
              orderData.items.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              ) - orderData.discount
            ).toFixed(2)}
            disabled
          />
        </div>
        <div className='mx-1 my-2 flex flex-row'>
        <div className="w-20">
          <h1 className='mt-4 font-bold'>{t.charged}:</h1>
          </div>
          <Input
            onChange={(e) => setChargedValue(e.target.value)}
            className='ml-10 block h-10 w-56 p-2.5'
            value={chargedValue}
            required
          />
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
        <div className='mx-1 my-2 flex flex-row gap-4'>
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
        </div>
      </div>
      <div className='container mx-auto mt-1'>
        <div className='mx-2 flex max-w-[500px] flex-wrap justify-center'>
          <div
            dir='ltr'
            className='flex max-w-[500px] flex-wrap justify-center'
          >
            <button
              type='button'
              onClick={() => handleDigitButtonClick('10')}
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#636363] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              10
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('1')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              1
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('2')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              2
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('3')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              3
            </button>
            <button
              type='button'
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#3471ff] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              All
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('20')}
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#636363] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              20
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('4')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              4
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('5')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              5
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('6')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              6
            </button>
            <button
              type='button'
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#3471ff] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              1/n
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('50')}
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#636363] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              50
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('7')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              7
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('8')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              8
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('9')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              9
            </button>
            <button
              type='button'
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#3471ff] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              Split
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('100')}
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#636363] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              100
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('.')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              .
            </button>
            <button
              type='button'
              onClick={() => handleDigitButtonClick('0')}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              0
            </button>
            <button
              type='button'
              onClick={handleRemoveLastDigit}
              className=' bg-color-Light mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              X
            </button>
            <button
              type='button'
              className=' mb-2 me-2 h-8 w-20 rounded-lg border border-gray-200 bg-[#3471ff] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
            >
              bal
            </button>
          </div>
          <button
            onClick={handleDiscountClick}
            type='button'
            className=' mb-1 me-2 h-8 w-32 rounded-lg border border-gray-200 bg-[#019706] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
          >
            {t.discount}%
          </button>
          <button
            type='button'
            className=' mb-1 me-2 h-8 w-32 rounded-lg border border-gray-200 bg-[#ffb534] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
          >
            {t.round}
          </button>
          <button
            type='button'
            onClick={handlePrintBillClick}
            className=' mb-1 me-2 h-8 w-32 rounded-lg border border-gray-200 bg-[#ff4155] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none  '
          >
            {t.printBill}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutForm;
