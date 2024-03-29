import { API_CONFIG } from '@/constants/api-config';

export const getCustomerByPhone = async (phone: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}api/Customer/GetByPhone?phone=${phone}`
    );
    const json = await response.json();
  
    if (json) return json;
    return {};
  };