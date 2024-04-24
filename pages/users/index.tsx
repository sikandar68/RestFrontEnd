import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeadRow,
  TableCell,
  TableHead,
  TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/header/NavBar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addUser,
  deleteUser,
  editUser,
  getUser,
  getUsers,
} from '@/services/user';
import { useToast } from '@/components/ui/use-toast';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ConfirmationDialog from '@/components/alerts/ConfirmationDialog';
import { PaginationSection } from '@/components/PaginationSection';
import Layout from '@/components/Layout';
import Jwt from 'jsonwebtoken';
import { ClientPreference } from '@/types/types';
import nookies, { parseCookies, destroyCookie } from 'nookies';

const Users = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;



  const cookies = parseCookies();
  const token = cookies.token;
  const jsonToken = Jwt.decode(token) as { [key: string]: string } | null;
  const tenantId = jsonToken ? jsonToken['tenantId'] || '' : '';
  const [id, setId] = useState('');
  const [username, setUserName] = useState('');
  const [localizedName, setLocalizedName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  //const [tenantId, setTenantId] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');

  const [image, setImage] = useState<File | null>(null);
  const [tempNameSearch, setTempNameSearch] = useState('');
  const [tempEmailSearch, setTempEmailSearch] = useState('');
  const [tempPhoneSearch, setTempPhoneSearch] = useState('');

  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
  const [isLoginConfirmationOpen, setLoginConfirmationOpen] = useState(false);
  const [userToLogin, setUserToLogin] = useState<string>('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);


  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { mutate: addOrEditRecord, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (id !== '') {
        formData.append('Id', id);
      }
      formData.append('Username', username);
      formData.append('LocalizedName', localizedName);
      formData.append('Email', email);
      formData.append('Password', password);
      formData.append('PhoneNumber', phoneNumber);      
      formData.append('Role', 'Admin');
      formData.append('TenantId', tenantId);

      if (image) {
        formData.append('Image', image);
      }

      if (id === '') {
        // Add operation
        return await addUser(formData);
      } else {
        // Edit operation
        formData.append('Id', id);
        return await editUser(formData);
      }
    },
    onError: (error) => {
      toast({
        title: `${t.error}`,
        description: `${t.somethingWentWrong}`,
      });
    },
    onSuccess: (data) => {
      clear();
      setModalOpen(false);
      toast({
        title: data.management,
        description: data.msg,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const { mutate: deleteRecord, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      if (recordToDelete) {
        const result = await deleteUser(recordToDelete);
        return result;
      }
    },
    onError: (error, variable, context) => {
      toast({
        title: 'Error',
        description: error.message,
      });
    },
    onSuccess: (data, variable, context) => {
      setRecordToDelete('');
      setDeleteConfirmationOpen(false);
      toast({
        title: data.management,
        description: data.msg,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const { mutate: handleEdit, isPending: editPending } = useMutation({
    mutationFn: async (id: string) => {
      return await getUser(id);
    },
    onError: (error) => {
      console.log('Error', error.message);
    },
    onSuccess: (data) => {
      setId(id);
      setUserName(data.response.userName);
      setLocalizedName(data.response.localizedName);
      setEmail(data.response.email);
      setPhoneNumber(data.response.phoneNumber);
      setPassword(data.response.password);
      setRole(data.response.role);
      setId(data.response.id);
      setModalOpen(true);
    },
  });
  const { data: userData, isPending: fetchPending } = useQuery({
    queryKey: [
      'users',
      page,
      rowsPerPage,
      nameSearch,
      emailSearch,
      phoneSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getUsers(
        page,
        rowsPerPage,
        nameSearch,
        emailSearch,
        phoneSearch,
        sortBy,
        sortOrder
      ),
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };
  const clear = () => {
    setId('');
    setUserName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setLocalizedName('');
  };

  const onSearchChange = (value?: string, columnName?: string) => {
    switch (columnName) {
      case 'name':
        setTempNameSearch(value ?? '');
        break;
      case 'email':
        setTempEmailSearch(value ?? '');
        break;
      case 'phone':
          setTempPhoneSearch(value ?? '');
          break;
      default:
        break;
    }
    setPage(1);
  };
  const applyFilters = () => {
    setNameSearch(tempNameSearch);
    setEmailSearch(tempEmailSearch);
    setPhoneSearch(tempPhoneSearch);
    setFilterModalOpen(false);
    setPage(1);
  };
  const handleSort = (columnName: string) => {
    const newSortOrder =
      columnName === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';

    setSortBy(columnName);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteConfirmationOpen(true);
  };
  const handleCancelDelete = () => {
    setRecordToDelete('');
    setDeleteConfirmationOpen(false);
  };
  const handleLogin = (id: string) => {
    setUserToLogin(id);
    setLoginConfirmationOpen(true);
  };
  const handleCancelLogin = () => {
    setUserToLogin('');
    setLoginConfirmationOpen(false);
  };
  const loginUser = async () => {
      try {
        const token = cookies.token || '';
        const jsonToken = Jwt.decode(token) as { [key: string]: string }; // Decoding the JWT token
        const userId =
          jsonToken[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ];
        const fetchResponse = await fetch(
          `https://localhost:7160/api/Auth/AuthenticateById?id=${userToLogin}&saId=${userId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

          if (!fetchResponse.ok) {
              throw new Error(`Request failed with status: ${fetchResponse.status}`);
          }

          const resp = await fetchResponse.json();
          const respToken = resp.response.token || '';

          const json = Jwt.decode(respToken) as { [key: string]: string };
          console.log(json);
          setUserCookies(resp.response.token, json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '', json['saId'] || '', false, resp.response.clientPreferences);
          window.location.href = '/';
      } catch (error) {
          console.error('Fetch error:');
      }
  };
  function setUserCookies(
    //twoFAEnabled: boolean,
    token: string,
    //guid: string,
    username: string,
    saId : string, 
    //onboarding: string,
    rememberMe: boolean = true,
    clientPreference : ClientPreference
  ) {
    // Set the cookie with an explicit expiration time (e.g., 30 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

    const expiration = rememberMe
      ? {
        maxAge: DAYS_IN_SECONDS, // Cookie will expire in 30 days (in seconds)
        expires: expirationDate, // Sets the explicit expiration date
        path: '/', // Cookie will be accessible from all paths
        secure: true,
        httpOnly: false,
      }
      : {
        path: '/', // Cookie will be accessible from all paths
        secure: true,
        httpOnly: false,
      };

    nookies.set(undefined, 'token', token, expiration);
    //nookies.set(undefined, "guid", guid, expiration);
    nookies.set(undefined, 'username', username, expiration);
    nookies.set(undefined, 'saId', saId, expiration);
    //nookies.set(undefined, "onboarding", onboarding, expiration);
    nookies.set(undefined, 'rememberMe', rememberMe + '', expiration);
    const clientPreferenceString = JSON.stringify(clientPreference);

    nookies.set(undefined, 'clientPreference', clientPreferenceString, expiration);
  }
  const renderTableBody = () => {
    if (fetchPending) {
      return (
        <TableRow className="bg-primary">
          <TableCell colSpan={5}>
            <div className='flex justify-center'>
              <Loader2 className='mr-2 h-10 w-10 animate-spin' />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!userData || userData.totalRecords === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className='text-center'>
            No data found !
          </TableCell>
        </TableRow>
      );
    }

    // Render table rows when data is available
    return userData?.users?.map((item: any) => (
      <TableRow className='rounded-3xl' key={item.id}>
        <TableCell>
          <img
            src={item.pic}
            alt={item.userName}
            className='mr-2 h-8 w-8 rounded-full'
          />
          {/* Display user name */}
        </TableCell>
        <TableCell>
          {locale === 'ar' ? item.localizedName : item.userName}
        </TableCell>
        <TableCell>
          {item.email}
        </TableCell>
        <TableCell>
          {item.phoneNumber}
        </TableCell>
        <TableCell>
          {/* Edit button */}
          <Button
            onClick={() => handleEdit(item.id.toString())}
            variant='secondary'
            disabled={editPending}
          >
            {t.edit}
          </Button>
          <Button
            onClick={() => handleDelete(item.id.toString())}
            variant='destructive'
            className='ml-6'
          >
            {t.delete}
          </Button>
          <Button
            onClick={() => handleLogin(item.id.toString())}
            variant='outline'
            className='ml-6'
          >
            Login
          </Button>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
    <NavBar />
      <Layout>
        <section className=' flex items-center justify-center'>
          <div className='container'>
            <div className='flex items-end justify-between gap-3'>
              <div className='flex w-full items-center justify-between border-b-2 py-2'>
                <div>
                  <div className='text-primary-content text-xl'>Users</div>
                </div>
              </div>
            </div>
            <div className='mt-2 flex items-center justify-between'>
              <label className='text-default-400 text-small flex items-center'>
                <span className='mx-2'>{t.show}</span>
                <select
                  className='text-default-400 text-small bg-light outline-none'
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                >
                  <option value='5'>5</option>
                  <option value='10'>10</option>
                  <option value='15'>15</option>
                </select>
                <span className='mx-2'>{t.entries}</span>
              </label>
              <div className='flex gap-3'>
                <Button onClick={() => setModalOpen(true)} color='primary'>
                  {t.addNew}
                </Button>
                <Button
                  onClick={() => setFilterModalOpen(true)}
                  color='primary'
                >
                  {t.applyFilters}
                </Button>
                <Button
                  onClick={() => {
                    setNameSearch('');
                    setEmailSearch('');
                    setPhoneSearch('');
                  }}
                  color='primary'
                >
                  {t.clearFilters}
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableHeadRow>
                <TableHead className='flex items-center'>{t.avtar}</TableHead>
                  <TableHead>
                    <div
                      className='flex items-center'
                      onClick={() => handleSort('name')}
                    >
                      {t.name}
                      {sortBy === 'name' ? (
                        <span className='ml-2'>
                          {sortOrder === 'asc' ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </span>
                      ) : (
                        <span className='ml-2'>
                          <ChevronDown />
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className='flex items-center'
                      onClick={() => handleSort('email')}
                    >
                      {t.email}
                      {sortBy === 'email' ? (
                        <span className='ml-2'>
                          {sortOrder === 'asc' ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </span>
                      ) : (
                        <span className='ml-2'>
                          <ChevronDown />
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className='flex items-center'
                      onClick={() => handleSort('phone')}
                    >
                      {t.phone}
                      {sortBy === 'phone' ? (
                        <span className='ml-2'>
                          {sortOrder === 'asc' ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </span>
                      ) : (
                        <span className='ml-2'>
                          <ChevronDown />
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className='flex items-center'>{t.action}</TableHead>
                </TableHeadRow>
              </TableHeader>
              <TableBody>{renderTableBody()}</TableBody>
              {userData?.totalRecords > 0 && (
                <TableFooter>
                  <TableCell colSpan={4}>
                    <div className="flex justify-between items-center">
                    <PaginationSection
                      totalPosts={userData?.totalRecords}
                      postsPerPage={rowsPerPage}
                      currentPage={page}
                      setCurrentPage={setPage}
                    />
                    </div>
                  </TableCell>
                  <TableCell>
                  <span className='text-default-400 text-small'>
                      {'Page ' +
                        page +
                        ' of ' +
                        Math.max(
                          1,
                          Math.ceil((userData?.totalRecords ?? 0) / rowsPerPage)
                        ) +
                        ' '}
                    </span>
                  </TableCell>
                </TableFooter>
              )}
            </Table>
            {/* Add Or Update Modal */}
            {isModalOpen && (
              <div className='fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden'>
                <div className='relative max-h-full w-full max-w-md border border-light shadow-lg'>
                  <div className='relative rounded-lg bg-background'>
                    <div className='flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600'>
                      <h3 className='text-xl font-semibold text-secondary-foreground'>
                        {t.addOrUpdateRecord}
                      </h3>
                      <button
                        type='button'
                        className='end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
                        onClick={() => {
                          setModalOpen(false);
                          clear();
                        }}
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
                    <div className='p-4 md:p-5'>
                      <form
                        className='space-y-4'
                        onSubmit={(e) => {
                          e.preventDefault();
                          addOrEditRecord();
                        }}
                      >
                        {' '}
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.name}
                        </label>
                        <Input
                          type='text'
                          name='username'
                          id='username'
                          value={username}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder={t.name}
                          required
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.localizedName}
                        </label>
                        <Input
                          type='text'
                          name='localizedName'
                          id='localizedName'
                          value={localizedName}
                          onChange={(e) => setLocalizedName(e.target.value)}
                          placeholder={t.localizedName}
                          required
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.email}
                        </label>
                        <Input
                          type='text'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder='example@email.com'
                          required
                          disabled={id !== ''}
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.password}
                        </label>
                        <Input
                          type='password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='*******'
                          required
                          disabled={id !== ''}
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.phone}
                        </label>
                        <Input
                          type='text'
                          name='phonenumber'
                          id='phonenumber'
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={t.phone}
                          required
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.uploadImage}
                        </label>
                        <Input
                          type='file'
                          accept='image/*'
                          className='text-secondary-foreground'
                          onChange={handleImageChange}
                        />
                        <Button
                          type='submit'
                          isLoading={isPending}
                          disabled={isPending}
                          className='text-bg-primary-foreground w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium hover:bg-opacity-80'
                        >
                          {t.submit}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Filter Modal */}
            {isFilterModalOpen && (
              <div className='fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden'>
                <div className='relative max-h-full w-full max-w-md border border-gray-500'>
                  <div className='relative  rounded-lg bg-background'>
                    <div className='flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600'>
                      <h3 className='text-xl font-semibold text-secondary-foreground'>
                        {t.applyFilters}
                      </h3>
                      <button
                        type='button'
                        className='end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white'
                        onClick={() => {
                          setFilterModalOpen(false);
                          clear();
                        }}
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
                    <div className='p-4 md:p-5'>
                      <form
                        className='space-y-4'
                        onSubmit={(e) => {
                          e.preventDefault();
                          applyFilters();
                        }}
                      >
                        {' '}
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.name}
                        </label>
                        <Input
                          type='text'
                          placeholder={t.search}
                          value={tempNameSearch}
                          onChange={(e) =>
                            onSearchChange(e.target.value, 'name')
                          }
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.email}
                        </label>
                        <Input
                          type='text'
                          placeholder={t.search}
                          value={tempEmailSearch}
                          onChange={(e) =>
                            onSearchChange(e.target.value, 'email')
                          }
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.phone}
                        </label>
                        <Input
                          type='text'
                          placeholder={t.search}
                          value={tempPhoneSearch}
                          onChange={(e) =>
                            onSearchChange(e.target.value, 'phone')
                          }
                        />
                        <Button
                          type='submit'
                          isLoading={fetchPending}
                          disabled={fetchPending}
                          className='text-bg-primary-foreground w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium hover:bg-opacity-80'>
                          {t.applyFilters}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/*Delete Confirmation Dialog */}
            <ConfirmationDialog
              onConfirmed={deleteRecord}
              onCancel={handleCancelDelete}
              isOpen={isDeleteConfirmationOpen}
              title={t.confirmationTitle}
              description={t.confirmationDelete}
              isLoading={deletePending}
            />
            {/*Login Confirmation Dialog */}
            <ConfirmationDialog
              onConfirmed={loginUser}
              onCancel={handleCancelLogin}
              isOpen={isLoginConfirmationOpen}
              title={t.confirmationTitle}
              description={t.confirmationLogin}
              isLoading={deletePending}
            />
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Users;
