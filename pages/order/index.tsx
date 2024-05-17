import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { layouts } from '@/constants/layouts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import axios from 'axios';
import {
  AdOnCategory,
  AdOnItem,
  Category,
  Collection,
  Customer,
  Floor,
  Item,
  OrderData,
  SubCategory,
  Table,
} from '@/types/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/constants/api-config';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import CheckOutForm from '@/components/CheckOutForm';
import CustomerPopup from '@/components/CustomerPopup';
import { useReactToPrint } from 'react-to-print';
import Receipt from '@/components/Receipt';
import CouponPopup from '@/components/CoupanPopup';
import { getCouponByCode } from '@/services/order';
import { getFloors, getTables } from '@/services/floorTable';
import TicketNote from '@/components/TicketNote';
import OrderItemSection from '@/components/OrderItemsSection';
import Cart from '@/components/Cart';
import en from '@/locales/en';
import ar from '@/locales/ar';
import SelectTable from '@/components/SelectTable';
import AdOnPopup from '@/components/AdOnPopup';
import { parseCookies } from 'nookies';
import Jwt from 'jsonwebtoken';

const Order = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const printRef = useRef<any>(null);

  const [layout, setLayout] = useState<keyof typeof layouts.order>('default');
  const layoutsList = [
    { key: 'default', value: 'default' },
    { key: 'epos', value: 'epos' },
  ];
  const handleChange = (value: string) => {
    setLayout(value as keyof typeof layouts.order);
  };
  const OrderScreen = layouts.order[layout];

  const [collection, setCollection] = useState<Collection[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<SubCategory[]>([]);
  const [itemData, setItemData] = useState<Collection[]>([]);
  const [selectedItem, setSelectedItem] = useState<Collection>();
  const [adOnData, setAdOnData] = useState<AdOnItem[]>([]);
  const [adOnCategories, setAdOnCategories] = useState<AdOnCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [orderData, setOrderData] = useState<OrderData>({
    tableNumber: '',
    status: 'New',
    paymentType: 'Cash',
    deliveryType: 'waiting',
    customer: {
      id: 0,
      name: '',
      localizedName: '',
      phone: '',
      homeNumber: '',
      postCode: '',
      street: '',
      town: '',
      email: '',
    },
    items: [],
    discount: 0,
    serviceCharges : 0,
    note: '',
  });
  const [middleComponent, setMiddleComponent] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false);
  const [isAdOnPopupOpen, setIsAdOnPopupOpen] = useState(false);
  const [isCouponPopupOpen, setIsCouponPopupOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [couponError, setCouponError] = useState('');
  const [floorData, setFloorData] = useState<Floor[]>([]);
  const [selectTableOpen, setSelectTableOpen] = useState(false);
  const [tableData, setTableData] = useState<Table[]>([]);
  const [tabs, setTabs] = useState([
    { id: 0, type: 'all', label: 'Categories' },
  ]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { toast } = useToast();
  const getCategoryData = () => {
    axios
      .get(`${API_CONFIG.BASE_URL}api/Category`)
      .then((response) => {
        setCollection(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getCustomerData = () => {
    axios
      .get(`${API_CONFIG.BASE_URL}api/Customer`)
      .then((response) => {
        setCustomerData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getSubCategoryData = (id = 0) => {
    axios
      .get(
        `${API_CONFIG.BASE_URL}api/SubCategory/GetSubCategoriesByCategoryId?categoryId=${id}`
      )
      .then((response) => {
        setSubCategoryData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getItemData = (id = 0) => {
    axios
      .get(
        `${API_CONFIG.BASE_URL}api/Item/GetItemsBySubCategoryId?subCategoryId=${id}`
      )
      .then((response) => {
        setItemData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const cookies = parseCookies();
  const getTenantId = () => {
    const token = cookies.token || '';
    const json = Jwt.decode(token) as { tenantId: string };
    const tenantId = json['tenantId'];
    setTenantId(tenantId);
  };
  useEffect(() => {
    getCategoryData();
    getFloorData();
    getTableData('0');
    getTenantId();
  }, []);
  const handleCategoryClick = (categoryId: number) => {
    getSubCategoryData(categoryId);
    setSelectedCategory(
      collection.find((category) => category.id === categoryId) || null
    );
    setTabIndex(1);
    setItemData([]);
  };
  const fetchCollectionData = async (id: number, type: string) => {
    const url = `${API_CONFIG.BASE_URL}api/Category/CollectionClick?id=${id}&Type=${type}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API error:', error);
      throw error; // Rethrow the error to be caught by the caller if needed
    }
  };

  const getCollectionData = async (id: number, type: string) => {
    try {
      const data = await fetchCollectionData(id, type);

      if (data.type === 'item') {
        setItemData(data.data);
      } else {
        setCollection(data);
      }
    } catch (error) {
      console.error('Error in getCollectionData:', error);
    }
  };
  const handleCollectionClick = async (
    id: number,
    type: string,
    name: string
  ) => {
    try {
      const data = await fetchCollectionData(id, type);

      if (data.type === 'item') {
        setItemData(data.data);
      } else {
        setCollection(data);
        const newTab = { id, type, label: name };
        setTabs([...tabs, newTab]);
        setSelectedTabIndex(tabs.length);
      }
    } catch (error) {
      console.error('Error in getCollectionData:', error);
    }
    //getCollectionData(id, type);
  };
  const handleTabClick = async (
    clickedIndex: number,
    clickedId: number,
    clickedType: string
  ) => {
    try {
      const newTabs = tabs.slice(0, clickedIndex + 1);
      setTabs(newTabs);
      setSelectedTabIndex(newTabs.length);
      const data = await fetchCollectionData(clickedId, clickedType);
      if (data.type === 'item') {
        setItemData(data.data);
      } else {
        setCollection(data);
      }
    } catch (error) {
      console.error('Error in getCollectionData:', error);
    }
  };
  const handleSubCategoryClick = (subCategoryId: number) => {
    getItemData(subCategoryId);
    //setIsModalOpen(true);
  };
  const handleItemClick = async (item: Collection) => {
    const data = await fetchCollectionData(item.id, item.type);
    if (data && data != '') {
      setAdOnData(data.adOnItems);
      setAdOnCategories([]);
      setAdOnCategories((prevCategories) => [
        ...prevCategories,
        data.adOnCategory,
      ]);
      setIsAdOnPopupOpen(true);
      setSelectedItem(item);
    } else {
      const existingItemIndex = orderData.items.findIndex(
        (orderItem) => orderItem.itemId === item.id
      );

      if (existingItemIndex !== -1) {
        setOrderData((prevOrderData) => {
          const updatedItems = [...prevOrderData.items];
          updatedItems[existingItemIndex].quantity += 1;
          return { ...prevOrderData, items: updatedItems };
        });
      } else {
        setOrderData((prevOrderData) => ({
          ...prevOrderData,
          items: [
            ...prevOrderData.items,
            {
              itemId: item.id,
              itemName: item.name,
              price: item.price,
              quantity: 1,
              subCategoryName: item.subCategoryName,
              adOnItems: [],
            },
          ],
        }));
      }
      //setSelectedItem(undefined);
    }
  };
  const handleAdOnClick = async (selectedAdOns: AdOnItem[]) => {
    if(selectedItem){
      const existingItemIndex = orderData.items.findIndex(
        (orderItem) => orderItem.itemId === selectedItem?.id
      );
  
      if (existingItemIndex !== -1) {
        setOrderData((prevOrderData) => {
          const updatedItems = [...prevOrderData.items];
          updatedItems[existingItemIndex].quantity += 1;
          return { ...prevOrderData, items: updatedItems };
        });
      } else {
        setOrderData((prevOrderData) => ({
          ...prevOrderData,
          items: [
            ...prevOrderData.items,
            {
              itemId: selectedItem?.id,
              itemName: selectedItem?.name,
              price: selectedItem?.price,
              quantity: 1,
              adOnItems: selectedAdOns,
              //subCategoryName: selectedItem?.subCategoryName,
            },
          ],
        }));
      }
    }
  };
  const handleAdOnNextClick = async (nextMoveId: number) => {
    const url = `${API_CONFIG.BASE_URL}api/Category/AdOnNextClick?nextMoveId=${nextMoveId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
      }

      const data = await response.json();
      if (data) {
        setAdOnData(data.adOnItems);
        setAdOnCategories((prevCategories) => [
          ...prevCategories,
          data.adOnCategory,
        ]);
      }
    } catch (error) {
      console.error('API error:', error);
      throw error; // Rethrow the error to be caught by the caller if needed
    }
  };
  // const handleItemClick = async (item: Collection) => {
  //   const data = await fetchCollectionData(item.id, item.type);
  //   const existingItemIndex = orderData.items.findIndex(
  //     (orderItem) => orderItem.itemId === item.id
  //   );

  //   if (existingItemIndex !== -1) {
  //     setOrderData((prevOrderData) => {
  //       const updatedItems = [...prevOrderData.items];
  //       updatedItems[existingItemIndex].quantity += 1;
  //       return { ...prevOrderData, items: updatedItems };
  //     });
  //   } else {
  //     setOrderData((prevOrderData) => ({
  //       ...prevOrderData,
  //       items: [
  //         ...prevOrderData.items,
  //         {
  //           itemId: item.id,
  //           itemName: item.name,
  //           price: item.price,
  //           quantity: 1,
  //           subCategoryName: item.subCategoryName,
  //         },
  //       ],
  //     }));
  //   }
  // };
  const handleSelectCustomerClick = () => {
    getCustomerData();
    setIsCustomerPopupOpen(true);
  };
  const handleAddCustomer = (customer: Customer) => {
    setOrderData((prevOrderData) => {
      return {
        ...prevOrderData,
        customer: customer,
      };
    });

    setIsCustomerPopupOpen(false);
  };
  const handleApplyCoupon = async (couponCode: string) => {
    var response = await getCouponByCode(couponCode);

    if (!response.ok) {
      setCouponError('Coupon code is not valid.');
    } else {
      setCouponError('');
      const couponData = await response.json();
      let discountAmount = 0;
      if (couponData.type === 'pound') {
        discountAmount = parseFloat(couponData.couponValue);
      } else if (couponData.type === 'percentage') {
        discountAmount =
          (orderData.items.reduce((total, item) => total + item.price, 0) /
            100) *
          parseFloat(couponData.couponValue);
      }
      const orderTotal = orderData.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      if (orderTotal >= couponData.minimumOrderAmount) {
        setOrderData({
          ...orderData,
          discount: discountAmount,
        });
        setIsCouponPopupOpen(false);
      } else {
        setCouponError('Order amount is less then minimum order amount.');
      }
    }
  };

  const handleUpdateOrderData = (updatedOrderData: OrderData) => {
    setOrderData(updatedOrderData);
  };

  const handleSettleClick = async () => {
    setMiddleComponent('checkoutform');
  };
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });
  const handleSaveClick = async () => {
    try {
      const apiRequestData = {
        id: 0,
        tableNumber: orderData.tableNumber,
        status: orderData.status,
        tenantId : tenantId,
        paymentType: orderData.paymentType,
        deliveryType: orderData.deliveryType,
        customer: orderData.customer,
        orderDetails: orderData.items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
          addonItems: item.adOnItems
          //subCategoryName: item.subCategoryName,
        })),
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}api/Order`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestData),
      });
      var result = await response.json();
      if (result.color === 'success') {
        clearOrderData();
        setIsModalOpen(false);
        toast({
          title: result.management,
          description: result.msg,
        });
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    handlePrint();
    //setCheckOutOpen(false);
  };
  const handlePrintBillClick = async () => {
    handlePrint();
  };
  const handleDiscountClick = async () => {
    setIsCouponPopupOpen(true);
  };
  const handleCloseClick = () => {
    clearOrderData();
    setIsModalOpen(false);
    setMiddleComponent('');
  };
  const handleQuantityChange = (index: number, newQuantity: number) => {
    setOrderData((prevOrderData) => {
      const updatedItems = [...prevOrderData.items];
      updatedItems[index].quantity = newQuantity;
      return { ...prevOrderData, items: updatedItems };
    });
  };

  const handleRemoveItemClick = (index: number) => {
    setOrderData((prevOrderData) => {
      const updatedItems = [...prevOrderData.items];
      updatedItems.splice(index, 1);
      return { ...prevOrderData, items: updatedItems };
    });
  };
  const clearOrderData = () => {
    setOrderData({
      tableNumber: '',
      status: 'New',
      paymentType: 'Cash',
      deliveryType: 'waiting',
      customer: {
        id: 0,
        name: '',
        localizedName: '',
        phone: '',
        homeNumber: '',
        postCode: '',
        street: '',
        town: '',
        email: '',
      },
      items: [],
      discount: 0,
      serviceCharges: 0,
      note: '',
    });
  };
  const handleTableClick = (tableName: string) => {
    setOrderData({
      ...orderData,
      tableNumber: tableName,
    });
    setSelectTableOpen(false);
  };
  const getFloorData = async () => {
    try {
      const floors = await getFloors();
      setFloorData(floors);
    } catch (error) {
      console.error('Error fetching floor data:', error);
    }
  };
  const getTableData = async (floorId: string) => {
    try {
      const tables = await getTables(floorId);
      setTableData(tables);
    } catch (error) {
      console.error('Error fetching floor data:', error);
    }
  };
  return (
    <>
      <div className='max-h-screen w-full min-w-[500px] bg-white'>
        <nav className='w-full min-w-[500px] border-gray-200 bg-[#f5f6f9] p-2'>
          <div className='mx-auto flex max-w-screen-xl items-center justify-between'>
            <Button
              onClick={() => router.push('/')}
              className='bg-cyan text-sm font-medium text-white'
            >
              {t.mainMenu}
            </Button>
            <div className='flex flex-row items-center'>
              <ul className='flex space-x-4'>
                <li>
                  <Select value={layout} onValueChange={handleChange}>
                    <SelectTrigger>{layout}</SelectTrigger>
                    <SelectContent>
                      {layoutsList.map((op) => (
                        <SelectItem value={op.key} key={op.key}>
                          {op.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
                <li>Date</li>
              </ul>
            </div>
          </div>
        </nav>
        {selectTableOpen ? (
          <SelectTable
            tableData={tableData}
            floorData={floorData}
            handleTableClick={handleTableClick}
            getTableData={getTableData}
          />
        ) : (
          <div>
            <div>
              <Tabs
                selectedIndex={selectedTabIndex}
                onSelect={(index) => setSelectedTabIndex(index)}
              >
                <TabList>
                  {tabs.map((tab, index) => (
                    <Tab
                      key={index}
                      onClick={() => handleTabClick(index, tab.id, tab.type)}
                    >
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
              <div className='bg-[#efefef] px-1'>
                <div className='scrollbar-hide flex max-h-[100px] flex-row gap-x-4 overflow-x-auto'>
                  {collection.map((item) => (
                    <div
                      key={item.id}
                      className='my-1 flex min-w-32 flex-col items-center justify-start overflow-hidden rounded-lg border bg-cyan shadow-md'
                      onClick={() =>
                        handleCollectionClick(item.id, item.type, item.name)
                      }
                    >
                      <div className='h-10 w-full'>
                      <img
                        //src={item.pic}
                        src= 'https://localhost:7160/Image/gril244047809.jpg'
                        alt={item.name}
                        className='h-full w-full object-cover'
                      />
                      </div>
                      <div className='p-1'>
                        <h4 className='text-center text-sm font-bold text-white'>
                          {locale === 'en' ? item.name : item.localizedName}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-x-8 lg:flex-row'>
              <div className='flex flex-row lg:ml-10 lg:mt-2 lg:flex-col'>
                <Button
                  onClick={() => setSelectTableOpen(true)}
                  className='mb-4 flex h-16 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border bg-yellow text-yellow-foreground shadow-md md:flex-row'
                >
                  {t.changeTable}
                </Button>
                <Button
                  onClick={() => handleSelectCustomerClick()}
                  className='mb-4 flex h-16 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border bg-primary text-primary-foreground shadow-md'
                >
                  {t.selectCustomer}
                </Button>
                <Button
                  onClick={() => setMiddleComponent('ticketNote')}
                  className='mb-4 flex h-16 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border bg-gray text-gray-foreground shadow-md'
                >
                  {t.ticketNote}
                </Button>
                <Button
                  variant='destructive'
                  className='mb-4 flex h-16 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border shadow-md'
                >
                  {t.printBill}
                </Button>
                <Button
                  onClick={handleSaveClick}
                  className='mb-2 flex h-16 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border bg-light text-light-foreground shadow-md'
                >
                  {t.addTicket}
                </Button>
              </div>
              {middleComponent == 'checkoutform' ? (
                <CheckOutForm
                  orderData={orderData}
                  onUpdateOrderData={handleUpdateOrderData}
                  handlePrintBillClick={handlePrintBillClick}
                  handleDiscountClick={handleDiscountClick}
                />
              ) : middleComponent == 'ticketNote' ? (
                <TicketNote
                  orderData={orderData}
                  setOrderData={setOrderData}
                  setMiddleComponent={setMiddleComponent}
                />
              ) : (
                <OrderItemSection
                  itemData={itemData}
                  handleItemClick={handleItemClick}
                />
              )}
              <Cart
                orderData={orderData}
                handleQuantityChange={handleQuantityChange}
                handleRemoveItemClick={handleRemoveItemClick}
                handleSettleClick={handleSettleClick}
                handleCloseClick={handleCloseClick}
              />
            </div>
            <div>
              {isModalOpen && (
                <div
                  id='default-modal'
                  className='fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform p-4 md:p-5'
                >
                  <div className='relative max-h-full w-full max-w-2xl p-4'>
                    {/* Modal content */}
                    <div className='relative bg-background'>
                      {/* Modal header */}
                      <div className='flex items-center justify-between rounded-t p-2 md:p-3'>
                        <button
                          type='button'
                          onClick={() => setIsModalOpen(false)}
                          className='ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-black hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
                          data-modal-hide='default-modal'
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
                      {/* Modal body */}
                      <div className='space-y-4 p-4 md:p-5'>
                        <div className='scrollbar-hide flex max-h-[100px] flex-row justify-center gap-4 overflow-x-auto'>
                          {itemData.map((item) => (
                            <div
                              key={item.id}
                              className=' my-2 flex h-20 w-32 flex-col items-center justify-center overflow-hidden rounded-lg border bg-cyan shadow-md'
                              onClick={() => handleItemClick(item)}
                            >
                              <div className='flex flex-col p-1'>
                                <h3 className='text-center font-bold text-white'>
                                  {item.name}
                                </h3>
                                <h4 className='text-center font-bold text-white'>
                                  {'(' + item.price + ')'}
                                </h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isCustomerPopupOpen && (
        <CustomerPopup
          onAddCustomer={handleAddCustomer}
          setIsCustomerPopupOpen={setIsCustomerPopupOpen}
        />
      )}
      {isAdOnPopupOpen && (
        <AdOnPopup
          adOnData={adOnData}
          adOnCategories={adOnCategories}
          onAdOnClick={handleAdOnClick}
          setIsAdOnPopupOpen={setIsAdOnPopupOpen}
          handleAdOnNextClick={handleAdOnNextClick}
        />
      )}
      {isCouponPopupOpen && (
        <CouponPopup
          customerData={customerData}
          handleApplyCoupon={handleApplyCoupon}
          setIsCouponPopupOpen={setIsCouponPopupOpen}
          setCouponError={setCouponError}
          couponError={couponError}
        />
      )}
      <div className='hidden'>
        <Receipt ref={printRef} orderData={orderData} />
      </div>
    </>
  );
};

export default Order;
