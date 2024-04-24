import { API_CONFIG } from '@/constants/api-config';
import { parseCookies } from 'nookies';
import Jwt from 'jsonwebtoken';



// all users
export const getUsers = async (
  page: number,
  rowsPerPage: number,
  nameSearch: string,
  emailSearch: string,
  phoneSearch: string,
  sortBy: string,
  sortOrder: string
) => {
  const cookies = parseCookies();
  const token = cookies.token;
  const jsonToken = Jwt.decode(token) as { [key: string]: string };
  const tenantId = jsonToken['tenantId'];

  const url = `${API_CONFIG.BASE_URL}api/User`; // Corrected endpoint
  const data = {
    tenant: tenantId,
    page: page,
    pageSize: rowsPerPage,
    nameSearch: nameSearch,
    emailSearch: emailSearch,
    phoneSearch: phoneSearch,
    sortBy: sortBy,
    sortOrder: sortOrder
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


// single user
export const getUser = async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}api/User/${id}`);
    const json = await response.json();

    if (json) return json;
    return {};
};
// delete user
export const deleteUser = async (id: string) => {
    try {
        // Define the URL
        const url = `${API_CONFIG.BASE_URL}api/User/${id}`;

        const options = {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
            },
        };

        const response = await fetch(url, options);

        // Check if the response is successful (status code in the range 200-299)
        if (response.ok) {
            const json = await response.json();
            return json;
        } else {
            // If the response is not successful, throw an error
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        // Catch any errors that occur during the request and throw them
        throw new Error('Failed to delete user: ');
    }
};


// posting a user
export async function addUser(formData: FormData) {
    try {
        const Options = {
            method: 'POST',
            body: formData,
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}api/Auth/Register`, Options);

        if (!response.ok) {
            // If response is not okay (status code other than 2xx), throw an error
            throw new Error('Failed to register user');
        }

        const json = await response.json();

        return json;
    } catch (error) {
        // Catch and rethrow the error
        throw new Error('Failed to register user');
    }
}

// editing a user
export async function editUser(formData: FormData) {
    try {
        const Options = {
            method: 'PUT',
            body: formData,
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}api/User`, Options);

        if (!response.ok) {
            // If response is not okay (status code other than 2xx), throw an error
            throw new Error('Failed to edit user');
        }

        const json = await response.json();

        return json;
    } catch (error) {
        // Catch and rethrow the error
        throw new Error('Failed to edit user');
    }
}


