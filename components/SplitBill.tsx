import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { OrderData, OrderItem } from '@/types/types';
import { useToast } from '@/components/ui/use-toast';
import { useReactToPrint } from 'react-to-print';
import Receipt from '@/components/Receipt';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { parseCookies } from 'nookies';
import SplitBillCart from './SplitBillCart';
import { CopyMinus, CopyPlus } from 'lucide-react';

interface SplitBillProps {
  orderData: OrderData;
  setSplitBillOpen: (isOpen: boolean) => void;
}

interface Splitter {
  id: number;
  items: OrderItem[];
}

const SplitBill: React.FC<SplitBillProps> = ({ orderData, setSplitBillOpen }) => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const printRef = useRef<any>(null);
  const printWrapperRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printWrapperRef.current,
    documentTitle: 'Receipts',
    pageStyle: '@page { size: auto;  margin: 10mm; }',
  });
  const { toast } = useToast();
  const cookies = parseCookies();
  // const handlePrint = useReactToPrint({
  //   content: () => printRef.current,
  // });

  const [splitters, setSplitters] = useState<Splitter[]>([{ id: 1, items: [] }]);
  const [selectedSplitter, setSelectedSplitter] = useState<number | null>(1);
  const [localOrderData, setLocalOrderData] = useState<OrderData>(orderData);

  const addSplitter = () => {
    const newSplitter: Splitter = { id: splitters.length + 1, items: [] };
    setSplitters([...splitters, newSplitter]);
  };

  const removeSplitter = () => {
    if (splitters.length > 1) {
      setSplitters(splitters.slice(0, -1));
    }
  };

  const addItemToSplitter = (splitterId: number, newItem: OrderItem) => {
    setSplitters((prevSplitters) =>
      prevSplitters.map((splitter) => {
        if (splitter.id === splitterId) {
          const existingItemIndex = splitter.items.findIndex(item => item.itemName === newItem.itemName);
          if (existingItemIndex > -1) {
            const updatedItems = [...splitter.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { ...splitter, items: updatedItems };
          }
          return { ...splitter, items: [...splitter.items, newItem] };
        }
        return splitter;
      })
    );
  };
  const removeItemFromSplitter = (splitterId: number, item: OrderItem) => {
    setSplitters((prevSplitters) =>
      prevSplitters.map((splitter) => {
        if (splitter.id === splitterId) {
          const updatedItems = splitter.items
            .map((splitterItem) => {
              if (splitterItem.itemName === item.itemName) {
                return { ...splitterItem, quantity: splitterItem.quantity - 1 };
              }
              return splitterItem;
            })
            .filter((splitterItem) => splitterItem.quantity > 0);
          return { ...splitter, items: updatedItems };
        }
        return splitter;
      })
    );
  
    setLocalOrderData((localOrderData) => {
      const existingItemIndex = localOrderData.orderDetails.findIndex(
        (orderItem) => orderItem.itemName === item.itemName
      );
  
      if (existingItemIndex > -1) {
        // Item exists in localOrderData, increment its quantity
        const updatedOrderDetails = localOrderData.orderDetails.map((orderItem, index) => {
          if (index === existingItemIndex) {
            return { ...orderItem, quantity: orderItem.quantity + 1 };
          }
          return orderItem;
        });
        return { ...localOrderData, orderDetails: updatedOrderDetails };
      } else {
        // Item does not exist in localOrderData, add it with quantity 1
        const updatedOrderDetails = [
          ...localOrderData.orderDetails,
          { ...item, quantity: 1 },
        ];
        return { ...localOrderData, orderDetails: updatedOrderDetails };
      }
    });
  };
  
  return (
    <>
      <div className='flex w-full min-w-[500px] flex-col bg-[#0175a8]'>
        <div id='body' className='flex w-full flex-col sm:flex-row'>
          <div className='w-full md:w-5/6'>
            <div 
            className='max-h-screen-minus-4rem flex flex-col gap-1 overflow-auto'
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              <div className='m-2 flex justify-between'>
                <button
                  onClick={addSplitter}
                  className='bg-blue-500 p-2 text-white'
                >
                  {t.addSplitter}
                </button>
                <button
                  onClick={removeSplitter}
                  className='bg-red-500 p-2 text-white'
                >
                  {t.removeSplitter}
                </button>
                <button
                  onClick={handlePrint}
                  className='bg-red-500 p-2 text-white'
                >
                  print
                </button>
              </div>
              {' '}
              <div className='flex flex-row flex-wrap justify-center'>
              {splitters.map((splitter) => (
                <div
                  key={splitter.id}
                  onClick={() => setSelectedSplitter(splitter.id)}
                  className='m-2 h-[330px] max-h-[330px] w-[282px] bg-white'
                >
                  <table className='w-full text-left text-sm text-gray-500 rtl:text-right'>
                    <thead className='bg-white text-xs text-gray-900'>
                      <tr
                        className={`flex justify-center border-b-2 text-lg font-medium ${
                          selectedSplitter === splitter.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                        }`}
                      >
                        {t.splitter} {splitter.id}
                      </tr>
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
                    <tbody className='flex max-h-[276px] flex-col overflow-y-auto text-gray-900'>
                      {splitter.items.map((item, index) => (
                        <tr
                          key={index}
                          className='mt-1 flex cursor-pointer flex-row gap-x-4 bg-[#00b5fa]'
                        >
                          <td className='flex flex-1 items-center px-1 py-1 font-medium'>
                            <div className='flex items-center'>
                              <div className='flex min-w-4 justify-center bg-white'>
                                {item.quantity}
                              </div>
                            </div>
                          </td>
                          <td className='flex min-w-28 items-center px-2 py-1 font-medium'>
                            ({item.itemName})
                          </td>
                          <td className='flex flex-1 items-center px-3 py-1 font-medium'>
                            {item.price}
                            <button
                                onClick={() => removeItemFromSplitter(splitter.id, item)}
                                className='ml-2 bg-red-500 px-2 py-1 text-white'
                              >
                                <CopyMinus size={18} color='white' />
                              </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              </div>
            </div>
          </div>
          <div>
            <SplitBillCart
              setSplitBillOpen={setSplitBillOpen}
              addItemToSplitter={addItemToSplitter}
              selectedSplitter={selectedSplitter}
              setLocalOrderData={setLocalOrderData}
              localOrderData={localOrderData}
            />
          </div>
        </div>
      </div>
      {/* <div className='hidden'>
        <Receipt ref={printRef} orderData={orderData} />
      </div> */}
      {splitters.map((splitter, index) => (
          <Receipt
            key={index}
            orderData={{ ...orderData, 
              tableNumber : orderData.tableNumber,
              status : orderData.status,
              paymentType : orderData.paymentType,
              deliveryType : orderData.deliveryType,
              customer : orderData.customer,
              orderDetails: splitter.items,
              discount : orderData.discount,
              serviceCharges : orderData.serviceCharges,
              note : orderData.note
            }}
          />
        ))}
    </>
  );
};

export default SplitBill;
