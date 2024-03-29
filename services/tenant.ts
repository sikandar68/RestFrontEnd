import { API_CONFIG } from '@/constants/api-config';

// all tenants
export const getTenants = async (page: number, rowsPerPage: number, nameSearch : String) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}api/Restaurant?page=${page}&pageSize=${rowsPerPage}&search=${nameSearch}`);
    const json = await response.json();

    return json;
};

// single tenant
export const getTenant = async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}api/Restaurant/GetById?id=${id}`);
    const json = await response.json();

    if (json) return json;
    return {};
};

// posting a tenant
export async function addTenant(formData: FormData) {
    try {
        const url = `${API_CONFIG.BASE_URL}api/Restaurant`;

        const requestOptions = {
            method: 'POST',
            body: formData,
        };

        const response = await fetch(url, requestOptions);
        const json = await response.json();

        return json;
    } catch (error) {
        return error;
    }
}


// Delete a tenant
export async function deleteTenant(id: string) {
    const Options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}api/Restaurant?id=${id}`, Options);
    const json = await response.json();
    return json;
}
