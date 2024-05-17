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
import { Tenant } from '@/types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addTenant,
  deleteTenant,
  getTenant,
  getTenants,
} from '@/services/tenant';
import { useToast } from '@/components/ui/use-toast';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ConfirmationDialog from '@/components/alerts/ConfirmationDialog';
import { PaginationSection } from '@/components/PaginationSection';
import Layout from '@/components/Layout';

const Tenants = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;

  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [localizedName, setLocalizedName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [restaurantLogo, setRestaurantLogo] = useState<File | null>(null);
  const [userImage, setUserImage] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [nameSearch, setNameSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [tempNameSearch, setTempNameSearch] = useState('');
  const [tempDescriptionSearch, setTempDescriptionSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
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

    formData.append('Name', name);
    formData.append('LocalizedName', localizedName);
    formData.append('IsActive', isActive.toString());
    formData.append('Email', email);
    formData.append('Password', password);
    formData.append('ConfirmPassword', confirmPassword);
    formData.append('IsDeleted', 'false');

    // Append file data
    if(restaurantLogo){
      formData.append('RestaurantLogo', restaurantLogo);
    }
    if(userImage){
      formData.append('UserImage', userImage);
    }
      const result = await addTenant(formData);
      return result;
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
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const { mutate: deleteRecord, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      if (recordToDelete) {
        const result = await deleteTenant(recordToDelete);
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
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
  const { mutate: handleEdit, isPending: editPending } = useMutation({
    mutationFn: async (id: string) => {
      return await getTenant(id);
    },
    onError: (error) => {
      console.log('Error', error.message);
    },
    onSuccess: (data) => {
      setName(data.name);
      setIsActive(data.isActive);
      setLocalizedName(data.localizedName);
      setId(data.id);
      setModalOpen(true);
    },
  });
  const { data: tenantData, isPending : fetchPending } = useQuery({
    queryKey: [
      'tenants',
      page,
      rowsPerPage,
      nameSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getTenants(
        page,
        rowsPerPage,
        nameSearch,
        sortBy,
        sortOrder
      ),
  });
  const handleRestaurantLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestaurantLogo(file);
    }
  };
  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
    }
  };
  const clear = () => {
    setId('');
    setName('');
    setLocalizedName('');
    setIsActive(true);
    setRestaurantLogo(null);
    setUserImage(null);
  };
  const onSearchChange = (value?: string, columnName?: string) => {
    switch (columnName) {
      case 'name':
        setTempNameSearch(value ?? '');
        break;
      default:
        break;
    }
    setPage(1);
  };
  const applyFilters = () => {
    setNameSearch(tempNameSearch);
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

  const renderTableBody = () => {
    if (fetchPending) {
      return (
        <TableRow className="bg-primary">
          <TableCell colSpan={3}>
            <div className='flex justify-center'>
              <Loader2 className='mr-2 h-10 w-10 animate-spin' />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!tenantData || tenantData.totalRecords === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className='text-center'>
            No data found !
          </TableCell>
        </TableRow>
      );
    }

    // Render table rows when data is available
    return tenantData?.tenants?.map((item: Tenant) => (
      <TableRow className='rounded-3xl' key={item.id}>
        <TableCell>
          {locale === 'ar' ? item.localizedName : item.name}
        </TableCell>
        <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
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
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
      <Layout>
        <section className=' flex items-center justify-center'>
          <div className='container'>
            <div className='flex items-end justify-between gap-3'>
              {/* <Input
              className='h-12 w-full sm:max-w-[44%]'
              placeholder='search'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            /> */}
              <div className='flex w-full items-center justify-between border-b-2 py-2'>
                <div>
                  <div className='text-primary-content text-xl'>
                    {t.tenant}
                  </div>
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
                    setDescriptionSearch('');
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
                    {t.isActive}
                  </TableHead>
                  <TableHead>{t.action}</TableHead>
                </TableHeadRow>
              </TableHeader>
              <TableBody>{renderTableBody()}</TableBody>
              {tenantData?.totalRecords > 0 && (
                <TableFooter>
                  <TableCell colSpan={2}>
                    <div className='flex justify-start'>
                      <PaginationSection
                        totalPosts={tenantData?.totalRecords}
                        postsPerPage={rowsPerPage}
                        currentPage={page}
                        setCurrentPage={setPage}
                      />
                    </div>
                  </TableCell>
                  <TableCell className=''>
                    <span className='text-default-400 text-small'>
                      {'Page ' +
                        page +
                        ' of ' +
                        Math.max(
                          1,
                          Math.ceil(
                            (tenantData?.totalRecords ?? 0) / rowsPerPage
                          )
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
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.name}
                        </label>
                        <Input
                          type='text'
                          name='name'
                          id='name'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.name}
                          required
                        />
                        <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                          {t.localizedName}
                        </label>
                        <Input
                          type='text'
                          value={localizedName}
                          onChange={(e) => setLocalizedName(e.target.value)}
                          placeholder={t.localizedName}
                          required
                        />
                        {id === '' && (
                          <>
                            <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                              {t.email}
                            </label>
                            <Input
                              type='email'
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder='email@example.com'
                              required
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
                            />
                            <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                              {t.confirmPassword}
                            </label>
                            <Input
                              type='password'
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder='*******'
                              required
                            />
                            <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                              {t.tenantLogo}
                            </label>
                            <Input
                              type='file'
                              accept='image/*'
                              className='text-secondary-foreground bg-light'
                              onChange={handleRestaurantLogoChange}
                            />
                            <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                              {t.userImage}
                            </label>
                            <Input
                              type='file'
                              accept='image/*'
                              className='text-secondary-foreground bg-light'
                              onChange={handleUserImageChange}
                            />
                          </>
                        )}
                        <label className='relative me-5 inline-flex cursor-pointer items-center'>
                          <Input
                            type='checkbox'
                            value=''
                            className='peer sr-only'
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:start-[2px] after:top-1 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-green-300 rtl:peer-checked:after:-translate-x-full"></div>
                          <span className='mb-2 block text-sm font-medium text-secondary-foreground'>
                            {t.isActive}
                          </span>
                        </label>
                        <Button
                        type='submit'
                        isLoading={isPending}
                        disabled={isPending}
                        className='w-full rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-bg-primary-foreground hover:bg-opacity-80'
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
                        <Button
                          type='submit'
                          isLoading={fetchPending}
                          disabled={fetchPending}
                          className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                        >
                          {t.applyFilters}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Confirmation Dialog */}
            <ConfirmationDialog
              onConfirmed={deleteRecord}
              onCancel={handleCancelDelete}
              isOpen={isDeleteConfirmationOpen}
              title={t.confirmationTitle}
              description={t.confirmationDelete}
              isLoading={deletePending}
            />
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Tenants;
