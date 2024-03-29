import { AdOnCategory, AdOnItem } from '@/types/types';
import React, { useState } from 'react';
import { Button } from './ui/button';

interface AdOnPopupProps {
  adOnData: AdOnItem[];
  adOnCategories : AdOnCategory[];
  onAdOnClick: (selectedAdOns: AdOnItem[]) => void;
  setIsAdOnPopupOpen: (isOpen: boolean) => void;
  handleAdOnNextClick: (nextMoveId: number) => void;
}

const AdOnPopup: React.FC<AdOnPopupProps> = ({
  adOnData,
  adOnCategories,
  onAdOnClick,
  setIsAdOnPopupOpen,
  handleAdOnNextClick,
}) => {
  const [selectedAdOns, setSelectedAdOns] = useState<AdOnItem[]>([]);

  const toggleAdOnSelection = (adOnId: number) => {
    const isSelected = selectedAdOns.some((adOn) => adOn.id === adOnId);
    if (isSelected) {
      setSelectedAdOns((prevSelected) =>
        prevSelected.filter((adOn) => adOn.id !== adOnId)
      );
    } else {
      const selectedAdOn = adOnData.find((adOn) => adOn.id === adOnId);
      if (selectedAdOn) {
        setSelectedAdOns((prevSelected) => [...prevSelected, selectedAdOn]);
      }
    }
  };

  const getLastSelectedAdOn = () => {
    return selectedAdOns.length > 0 ? selectedAdOns[selectedAdOns.length - 1] : null;
  };

  const handleNextButtonClick = () => {
    const lastSelectedAdOn = getLastSelectedAdOn();
    if (lastSelectedAdOn && lastSelectedAdOn.nextMoveId !== 0) {
      handleAdOnNextClick(lastSelectedAdOn.nextMoveId);
    }
  };

  const handleSubmit = () => {
    onAdOnClick(selectedAdOns);
    setIsAdOnPopupOpen(false);
  };

  return (
    <div className='customer-popup fixed inset-0 flex items-center justify-center'>
      <div className='fixed z-50 h-auto w-full max-w-2xl p-4 md:p-5 bg-white rounded-lg shadow-lg'>
        {/* Modal content */}
        <div className='relative max-h-full w-full max-w-2xl p-4'>
          {/* Modal header */}
          <div className='flex items-center gap-4 justify-between rounded-t p-2 md:p-3'>
            <div className='flex overflow-x-auto max-w-3xl space-x-4'>
              {adOnCategories.map((item) => (
                <div key={item.id}>{item.addonName}</div>
              ))}
            </div>
            <button
              type='button'
              onClick={() => setIsAdOnPopupOpen(false)}
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
          <div className='space-y-4 p-4 md:p-5'>
          <div className='container mx-auto mt-1'>
        <div className='scrollbar-hide flex max-h-[210px] flex-wrap justify-center gap-2 gap-x-6 overflow-x-auto'>
        {adOnData.map((item) => (
                <div
                  key={item.id}
                  className={`min-h-16 h-16 min-w-32 w-32 overflow-hidden border shadow-md ${
                    selectedAdOns.some((adOn) => adOn.id === item.id)
                      ? 'bg-cyan'
                      : 'bg-light'
                  }`}
                  onClick={() => toggleAdOnSelection(item.id)}
                >
                  <div>
                    <h4 className='text-center font-bold'>{item.name}</h4>
                    <h4 className='text-center font-bold'>{item.price}</h4>
                  </div>
                </div>
              ))}
        </div>
      </div>
            <div className='mt-4 flex justify-between'>
              <Button onClick={() => setIsAdOnPopupOpen(false)}>Close</Button>
              {selectedAdOns.length > 0 ? (
                getLastSelectedAdOn()?.nextMoveId !== 0 ? (
                  <Button onClick={handleNextButtonClick}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit}>Submit</Button>
                )
              ) : (
                <Button disabled>Submit</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdOnPopup;
