import { Customer, OrderData } from '@/types/types';
import { Input } from './ui/input';
import { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/router';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useMutation } from '@tanstack/react-query';
import { getCustomerByPhone } from '@/services/customer';
import { DeliveryType } from '@/constants/enum';

interface EposCheckOutFormProps {
  orderData: OrderData;
  onUpdateOrderData: (orderData: OrderData) => void;
  handlePrintBillClick: () => void;
  handleDiscountClick: () => void;
  handleSaveClick: () => void;
  setCheckOutFormOpen: (isOpen: boolean) => void;
  onAddCustomer: (customer: Customer) => void;
}

const EposCheckOutForm: React.FC<EposCheckOutFormProps> = ({
  orderData,
  onUpdateOrderData,
  handlePrintBillClick,
  handleDiscountClick,
  handleSaveClick,
  setCheckOutFormOpen,
  onAddCustomer,
}) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [chargedValue, setChargedValue] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');

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
  const [activeTab, setActiveTab] = useState('waiting');

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    onUpdateOrderData({
      ...orderData,
      deliveryType: tab,
    });
  };
  const [customerInfo, setCustomerInfo] = useState<Customer>({ id: 0, name: '', localizedName: '', phone: '', homeNumber: '', postCode: '', town : '', street: '', email : '' });
  const { mutate: handlePhoneChange, isPending: loading } = useMutation({
    mutationFn: async (phone : string) => {
      return await getCustomerByPhone(phone);
    },
    onError: (error) => {
      AddCustomer();
    },
    onSuccess: (data) => {
      setCustomerInfo({
        id: data.id,
        name: data.name,
        localizedName: data.localizedName,
        phone: data.phone,
        homeNumber: data.address,
        postCode: data.address,
        town: data.address,
        street: data.address,
        email: data.address,
      });
      AddCustomer();
    },
  });
  const AddCustomer = () => {
    onUpdateOrderData({
      ...orderData,
      customer: customerInfo,
    });
  }
  return (
    <div className='fixed inset-0 flex items-center justify-center'>
      <div className='z-50 mx-4 max-w-full rounded-lg bg-white shadow-lg'>
        {/* Modal content */}
        <div className='relative max-h-full w-full'>
          {/* Modal header */}
          <div className='flex items-center justify-between gap-4 rounded-t'>
            {orderData.deliveryType !== 'eatin' && (
              <div className='flex justify-center'>
                <Button
                  onClick={() => handleTabChange('waiting')}
                  className={`h-20 w-32 bg-transparent text-black focus:outline-none ${
                    activeTab === DeliveryType.Waiting ? 'bg-primary text-white' : ''
                  }`}
                >
                  {t.waiting}
                </Button>
                <Button
                  onClick={() => handleTabChange('delivery')}
                  className={`h-20 w-32 bg-transparent text-black focus:outline-none ${
                    activeTab === 'delivery' ? 'bg-primary text-white' : ''
                  }`}
                >
                  {t.delivery}
                </Button>
                <Button
                  onClick={() => handleTabChange('collection')}
                  className={`h-20 w-32 bg-transparent text-black focus:outline-none ${
                    activeTab === 'collection' ? 'bg-primary text-white' : ''
                  }`}
                >
                  {t.collection}
                </Button>
              </div>
            )}
            {/* <button
              onClick={() => {
                setCheckOutFormOpen(false);
                onUpdateOrderData({
                  ...orderData,
                  deliveryType: 'waiting',
                });
              }}
              type='button'
              className='ms-auto m-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-black hover:bg-gray-200 hover:text-gray-900'
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
            </button> */}
          </div>
          {/* Modal body */}
          <div className='bg-[#f9f9f9] p-2'>
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
            <div className='container mx-auto mt-1 flex justify-center'>
              <div className='mx-2 flex max-w-[550px] flex-wrap justify-center'>
                <div className='flex flex-row gap-4'>
                  <div className='bg-white'>
                    <div className='flex w-36 flex-col justify-start p-2 font-semibold'>
                      <div className='flex flex-col  justify-start'>
                        <div className='w-16 px-2 py-1 text-lg'>{t.total}:</div>
                        <div className='px-2 py-1 text-xl'>
                          {/* Total Amount Calculation */}
                          {orderData.orderDetails?.reduce(
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
                      <div className='flex flex-col justify-start text-lg text-[#e06050]'>
                        <div className='w-36 px-2 py-1'>{t.serviceCharges}:</div>
                        <div className='px-2 py-1'>0.00</div>
                      </div>
                      <div className='flex flex-col justify-start text-lg text-[#758f47]'>
                        <div className='w-16 px-2  py-1'>{t.discount}:</div>
                        <div className='px-2 py-1'>{orderData.discount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  {activeTab === DeliveryType.Waiting && (
                    <div className='flex w-[320px] flex-col justify-start'>
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
                  )}
                  {activeTab === DeliveryType.Delivery && (
                    <div className='flex flex-col justify-start'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                          <Input
                            type='text'
                            name='name'
                            id='name'
                            value={customerInfo.name}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                name: target.value,
                              })
                            }
                            placeholder={t.name}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='localizedName'
                            value={customerInfo.localizedName}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                localizedName: target.value,
                              })
                            }
                            id='localizedName'
                            placeholder={t.localizedName}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='phone'
                            id='phone'
                            onBlur={() => handlePhoneChange(customerInfo.phone)}
                            value={customerInfo.phone}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                phone: target.value,
                              })
                            }
                            placeholder={t.phone}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='homeNumber'
                            value={customerInfo.homeNumber}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                homeNumber: target.value,
                              })
                            }
                            id='homeNumber'
                            placeholder={t.homeNumber}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='postCode'
                            value={customerInfo.postCode}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                postCode: target.value,
                              })
                            }
                            id='postCode'
                            placeholder={t.postCode}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='street'
                            value={customerInfo.street}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                street: target.value,
                              })
                            }
                            id='street'
                            placeholder={t.street}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='town'
                            id='town'
                            value={customerInfo.town}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                town: target.value,
                              })
                            }
                            placeholder={t.town}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='email'
                            name='email'
                            id='email'
                            value={customerInfo.email}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                email: target.value,
                              })
                            }
                            placeholder={t.email}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === DeliveryType.Collection && (
                    <div className='ml-14 flex flex-col justify-start'>
                      <div className='grid grid-cols-1 gap-4'>
                        <div>
                          <Input
                            type='text'
                            name='name'
                            id='name'
                            value={customerInfo.name}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                name: target.value,
                              })
                            }
                            placeholder={t.name}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='localizedName'
                            id='localizedName'
                            value={customerInfo.localizedName}
                            onBlur={() => AddCustomer()}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                localizedName: target.value,
                              })
                            }
                            placeholder={t.localizedName}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            type='text'
                            name='phone'
                            id='phone'
                            onBlur={() => handlePhoneChange(customerInfo.phone)}
                            value={customerInfo.phone}
                            onChange={({ target }) =>
                              setCustomerInfo({
                                ...customerInfo,
                                phone: target.value,
                              })
                            }
                            placeholder={t.phone}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className='mx-1 my-6 flex flex-row gap-4'>
                  <h1 className='mt-2 w-full font-bold md:w-40'>
                    {t.paymentType}:
                  </h1>
                  <div className='flex gap-x-4'>
                    <Button
                      onClick={() => handlePaymentTypeClick('Cash')}
                      className={`h-12 w-full rounded-lg px-6 font-semibold text-black md:w-40 ${
                        paymentType === 'Cash' ? 'bg-primary' : 'bg-light'
                      }`}
                    >
                      {t.cash}
                    </Button>
                    <Button
                      onClick={() => handlePaymentTypeClick('Credit')}
                      className={`h-12 w-full rounded-lg px-6 font-semibold text-black md:w-40 ${
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
                      onClick={() => {
                        setCheckOutFormOpen(false);
                        onUpdateOrderData({
                          ...orderData,
                          deliveryType: 'waiting',
                        });
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

export default EposCheckOutForm;
