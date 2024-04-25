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
import EposCheckOutForm from '@/components/EposCheckOutForm';
import CustomerPopup from '@/components/CustomerPopup';
import { useReactToPrint } from 'react-to-print';
import Receipt from '@/components/Receipt';
import CouponPopup from '@/components/CoupanPopup';
import { getCouponByCode } from '@/services/order';
import { getFloors, getTables } from '@/services/floorTable';
import TicketNote from '@/components/TicketNote';
import OrderItemSection from '@/components/OrderItemsSection';
import EposCart from '@/components/EposCart';
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
    items: [],
    discount: 0,
    note: '',
  });
  const [middleComponent, setMiddleComponent] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false);
  const [isAdOnPopupOpen, setIsAdOnPopupOpen] = useState(false);
  const [isCheckOutFormOpen, setCheckOutFormOpen] = useState(false);
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
        setCollection(response.data);
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
  const handleCollectionClick = async (
    id: number,
    type: string,
    name: string
  ) => {
    try {
      const data = await fetchCollectionData(id, type);
      if(type == 'item'){
        var item = collection.find(item => item.id === id);
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
              (orderItem) => orderItem.itemId === item?.id
            );
      
            if (existingItemIndex !== -1) {
              setOrderData((prevOrderData) => {
                const updatedItems = [...prevOrderData.items];
                updatedItems[existingItemIndex].quantity += 1;
                return { ...prevOrderData, items: updatedItems };
              });
            } else {
                if(item !== undefined){
                    setOrderData((prevOrderData) => ({
                        ...prevOrderData,
                        items: [
                          ...prevOrderData.items,
                          {
                            itemId: item!.id,
                            itemName: item!.name,
                            price: item!.price,
                            quantity: 1,
                            subCategoryName: item!.subCategoryName,
                            adOnItems: [],
                          },
                        ],
                      }));
                }
              
            }
            //setSelectedItem(undefined);
          }
      }
      else{
        if (data.type === 'item') {
            setCollection(data.data);
          } else {
            setCollection(data);
          }
          const newTab = { id, type, label: name };
            setTabs([...tabs, newTab]);
            setSelectedTabIndex(tabs.length);
      }
      
    } catch (error) {
      console.error('Error in getCollectionData:', error);
    }
    //getCollectionData(id, type);
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
      } else {
        setCouponError('Order amount is less then minimum order amount.');
      }
    }
  };

  const handleUpdateOrderData = (updatedOrderData: OrderData) => {
    setOrderData(updatedOrderData);
  };

  const handleSettleClick = async () => {
    setCheckOutFormOpen(true);
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
      items: [],
      discount: 0,
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
      <div className='flex w-full min-w-[500px] flex-col bg-[#0175a8]'>
        <nav className='w-auto min-w-[500px] border-gray-200 bg-[#00b5fa] p-2'>
          <div className='mx-auto flex items-center justify-between'>
            <Button
              onClick={() => router.push('/')}
              className='bg-cyan text-sm font-medium text-white'
            >
              {t.mainMenu}
            </Button>
          </div>
        </nav>
        <div id='body' className='flex w-full flex-col sm:flex-row'>
          <div className='w-full sm:w-3/4'>
            {' '}
            {/* Updated this line */}
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
            <div className='max-h-[calc(100vh - 96px)] flex flex-row flex-wrap gap-x-4'>
              {collection.map((item) => (
                <div
                  key={item.id}
                  className='my-1 flex h-36 w-20 flex-col items-center justify-start overflow-hidden rounded-md bg-[#00b5fa] shadow-md'
                  onClick={() =>
                    handleCollectionClick(item.id, item.type, item.name)
                  }
                >
                  <img
                    //src={item.pic}
                    src='https://localhost:7160/Image/gril244047809.jpg'
                    alt={item.name}
                    className='mt-1 h-8 w-8 object-cover'
                  />
                  <div className='p-1'>
                    <h4 className='text-center font-bold text-white'>
                      {locale === 'en' ? item.name : item.localizedName}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='w-full sm:w-1/4'>
            {' '}
            {/* Updated this line */}
            <EposCart
              orderData={orderData}
              handleQuantityChange={handleQuantityChange}
              handleRemoveItemClick={handleRemoveItemClick}
              handleSettleClick={handleSettleClick}
              handleCloseClick={handleCloseClick}
            />
          </div>
        </div>
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
      {isCheckOutFormOpen && (
        <EposCheckOutForm
        orderData={orderData}
        onUpdateOrderData={handleUpdateOrderData}
        handlePrintBillClick={handlePrintBillClick}
        handleDiscountClick={handleDiscountClick}
        handleSaveClick={handleSaveClick}
        setCheckOutFormOpen={setCheckOutFormOpen}
      />
      )}
      <div className='hidden'>
        <Receipt ref={printRef} orderData={orderData} />
      </div>
    </>
  );
};

export default Order;
