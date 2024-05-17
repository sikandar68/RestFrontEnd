import { API_CONFIG } from '@/constants/api-config';
import { OrderItem } from '@/types/types';

// all orders
export const getOrders = async (
  page: number,
  rowsPerPage: number,
  descriptionSearch: string,
  sortBy: string,
  sortOrder: string,
  tenantId: string
) => {
  const url = `${API_CONFIG.BASE_URL}api/Order/GetOrders`;
  const data = {
    page: page,
    pageSize: rowsPerPage,
    sortBy: sortBy,
    sortOrder: sortOrder,
    descriptionSearch: descriptionSearch,
    tenantId: tenantId,
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, requestOptions);
  const json = await response.json();

  return json;
};

export const getCouponByCode = async (couponCode: string) => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}api/Coupon/GetCouponByCode?couponCode=${couponCode}`
  );

  return response;
};

export const calculateTotal = (items: OrderItem[]) => {
  return items?.reduce((total, item) => total + item.quantity * item.price, 0);
};
