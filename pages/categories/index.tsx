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
import { Category } from '@/types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCategory,
  deleteCategory,
  getCategory,
  getCategories,
} from '@/services/category';
import { useToast } from '@/components/ui/use-toast';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ConfirmationDialog from '@/components/alerts/ConfirmationDialog';
import { PaginationSection } from '@/components/PaginationSection';
import Layout from '@/components/Layout';

const Categories = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;

  const [id, setId] = useState<string>('');
  const [name, setName] = useState('');
  const [localizedName, setLocalizedName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
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
      formData.append('Description', description);
      if (image) {
        formData.append('Image', image);
      }
      const result = await addCategory(formData);
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const { mutate: deleteRecord, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      if (recordToDelete) {
        const result = await deleteCategory(recordToDelete);
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
  const { mutate: handleEdit, isPending: editPending } = useMutation({
    mutationFn: async (id: string) => {
      return await getCategory(id);
    },
    onError: (error) => {
      console.log('Error', error.message);
    },
    onSuccess: (data) => {
      setName(data.name);
      setDescription(data.description);
      setLocalizedName(data.localizedName);
      setId(data.id);
      setModalOpen(true);
    },
  });
  const { data: categoryData, isPending : fetchPending } = useQuery({
    queryKey: [
      'categories',
      page,
      rowsPerPage,
      nameSearch,
      descriptionSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getCategories(
        page,
        rowsPerPage,
        nameSearch,
        descriptionSearch,
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
    setName('');
    setLocalizedName('');
    setDescription('');
    setImage(null);
  };
  const onSearchChange = (value?: string, columnName?: string) => {
    switch (columnName) {
      case 'name':
        setTempNameSearch(value ?? '');
        break;
      case 'description':
        setTempDescriptionSearch(value ?? '');
        break;
      default:
        break;
    }
    setPage(1);
  };
  const applyFilters = () => {
    setNameSearch(tempNameSearch);
    setDescriptionSearch(tempDescriptionSearch);
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

    if (!categoryData || categoryData.totalRecords === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className='text-center'>
            No data found !
          </TableCell>
        </TableRow>
      );
    }

    // Render table rows when data is available
    return categoryData?.clientPreferences?.map((item: Category) => (
      <TableRow className='rounded-3xl' key={item.id}>
        <TableCell>
          {locale === 'ar' ? item.localizedName : item.name}
        </TableCell>
        <TableCell>{item.description}</TableCell>
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
      <NavBar />
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
                <div className='text-primary-content text-xl'>{t.categories}</div>
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
              <Button onClick={() => setFilterModalOpen(true)} color='primary'>
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
                        {sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
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
                    onClick={() => handleSort('description')}
                  >
                    {t.description}
                    {sortBy === 'description' ? (
                      <span className='ml-2'>
                        {sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
                      </span>
                    ) : (
                      <span className='ml-2'>
                        <ChevronDown />
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>{t.action}</TableHead>
              </TableHeadRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
            {categoryData?.totalRecords > 0 && (
              <TableFooter>
                <TableCell className='flex justify-start'>
                  <PaginationSection
                    totalPosts={categoryData?.totalRecords}
                    postsPerPage={rowsPerPage}
                    currentPage={page}
                    setCurrentPage={setPage}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell className=''>
                  <span className='text-default-400 text-small'>
                    {'Page ' +
                      page +
                      ' of ' +
                      (categoryData?.totalRecords ?? 0) / rowsPerPage +
                      ' '}
                  </span>
                </TableCell>
              </TableFooter>
            )}
          </Table>
          {/* Add Or Update Modal */}
          {isModalOpen && (
            <div className='fixed inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden'>
              <div className='relative border shadow-lg border-light max-h-full w-full max-w-md'>
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
                        name='localizedName'
                        id='localizedName'
                        value={localizedName}
                        onChange={(e) => setLocalizedName(e.target.value)}
                        placeholder={t.localizedName}
                        required
                      />
                      <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                        {t.description}
                      </label>
                      <Input
                        type='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.description}
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
              <div className='relative border border-gray-500 max-h-full w-full max-w-md'>
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
                        onChange={(e) => onSearchChange(e.target.value, 'name')}
                      />
                      <label className='mb-2 block text-sm font-medium text-secondary-foreground'>
                        {t.description}
                      </label>
                      <Input
                        type='text'
                        placeholder={t.search}
                        value={tempDescriptionSearch}
                        onChange={(e) =>
                          onSearchChange(e.target.value, 'description')
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

export default Categories;
