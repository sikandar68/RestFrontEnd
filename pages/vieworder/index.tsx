import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { OrderData } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import {
  calculateTotal,
  getOrders,
} from '@/services/order';
import { useToast } from '@/components/ui/use-toast';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, Loader2, MoreHorizontal, Pencil, Trash2, Divide } from 'lucide-react';
import ConfirmationDialog from '@/components/alerts/ConfirmationDialog';
import { parseCookies } from 'nookies';
import Jwt from 'jsonwebtoken';
import { PaginationSection } from '@/components/PaginationSection';
import Layout from '@/components/Layout';
import ViewReceipt from '@/components/ViewReceipt';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import SplitBill from '@/components/SplitBill';

const ViewOrders = () => {
  const router = useRouter();
  const { locale } = router;
  const t = locale === 'en' ? en : ar;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
  const [tenantId, setTenantId] = useState('');
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [isSplitBillOpen, setSplitBillOpen] = useState(false);
  const [orderDataa, setOrderData] = useState<OrderData>({
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
    orderDetails: [],
    discount: 0,
    serviceCharges: 0,
    note: '',
  });

  const cookies = parseCookies();
  const getTenantId = () => {
    const token = cookies.token || '';
    const json = Jwt.decode(token) as { tenantId: string };
    const tenantId = json['tenantId'];
    setTenantId(tenantId);
  };
  
  useEffect(() => {
    getTenantId();
  }, []);

  const { toast } = useToast();
  const { data: orderData, isPending : fetchPending } = useQuery({
    queryKey: [
      'orders',
      page,
      rowsPerPage,
      descriptionSearch,
      sortBy,
      sortOrder,
      tenantId
    ],
    queryFn: () =>
      getOrders(
        page,
        rowsPerPage,
        descriptionSearch,
        sortBy,
        sortOrder,
        tenantId
      ),
  });
  // const { data: orderData, refetch } = useQuery({
  //   queryKey: [
  //     'orders',
  //     page,
  //     rowsPerPage,
  //     descriptionSearch,
  //     sortBy,
  //     sortOrder,
  //     tenantId
  //   ],
  //   queryFn: () =>
  //     getOrders(
  //       page,
  //       rowsPerPage,
  //       descriptionSearch,
  //       sortBy,
  //       sortOrder,
  //       tenantId
  //     ),
  // });
  const handlePageChange = (page: number) => {
    setPage(page);
  };
  const handleRowsPerPage = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setPage(1);
  };
  const onSearchChange = (value?: string, columnName?: string) => {
    switch (columnName) {
      case 'description':
        setDescriptionSearch(value ?? '');
        break;
      default:
        break;
    }
    setPage(1);
  };
  const handleSort = (columnName: string) => {
    const newSortOrder =
      columnName === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';

    setSortBy(columnName);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleEdit = async (id: string) => {
  };
  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    if (recordToDelete) {
    }
    setRecordToDelete('');
    setDeleteConfirmationOpen(false);
  };

  const handleCancelDelete = () => {
    setRecordToDelete('');
    setDeleteConfirmationOpen(false);
  };
  const handleRowClick = (item: any) => {
    console.log(item);
    setOrderData(item);
    console.log(orderDataa);
  };
  const renderTableBody = () => {
    if (fetchPending) {
      return (
        <TableRow className="bg-primary">
          <TableCell colSpan={6}>
            <div className='flex justify-center'>
              <Loader2 className='mr-2 h-10 w-10 animate-spin' />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!orderData || orderData.totalRecords === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='text-center'>
            No data found !
          </TableCell>
        </TableRow>
      );
    }

    // Render table rows when data is available
    return orderData?.orders?.map((item: any) => (
      <TableRow className='rounded-3xl' onClick={() => handleRowClick(item)} key={item.id}>
        <TableCell>
          {item.id}
        </TableCell>
        <TableCell>${calculateTotal(item.orderDetails)?.toFixed(2)}</TableCell>
        <TableCell>{item.paymentType}</TableCell>
        <TableCell>{item.deliveryType}</TableCell>
        <TableCell>{item.status}</TableCell>
        <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-light' align='end'>
            <DropdownMenuItem
            className='hover:bg-accent hover:text-accent-foreground'
            onClick={() => handleEdit(item.id.toString())}
            >
              <Pencil className='w-4 h-4 mx-2'/>
              {t.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='hover:bg-accent hover:text-accent-foreground'>
            <Trash2 className='w-4 h-4 mx-2'/>
              {t.delete}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            <DropdownMenuItem 
            onClick={() => setShowReceiptPopup(true)}
            className='hover:bg-accent hover:text-accent-foreground flex lg:hidden'>
            <Trash2 className='w-4 h-4 mx-2 flex'/>
              Details
              </DropdownMenuItem>
              <DropdownMenuItem 
            onClick={() => {
              setSplitBillOpen(true);
              handleRowClick(item);
            }}
            className='hover:bg-accent hover:text-accent-foreground flex'>
            <Divide className='w-4 h-4 mx-2 flex'/>
              Split Bill
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          {/* Edit button */}
          {/* <Button
            onClick={() => handleEdit(item.id.toString())}
            variant='secondary'
            //disabled={editPending}
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
            onClick={() => setShowReceiptPopup(true)}
            className='ml-6 flex lg:hidden'
          >
            Details
          </Button> */}
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <>
      <Layout>
        {isSplitBillOpen ?(
        <SplitBill orderData={orderDataa} setSplitBillOpen={setSplitBillOpen} />
        ):(
          <div className='flex h-full w-full flex-col sm:flex-row'>
          <section className='flex-1 overflow-y-auto'>
            <div className='mx-4'>
              <div className='flex items-end justify-between gap-3'>
                <div className='flex w-full items-center justify-between border-b-2 py-2'>
                  <div>
                    <div className='text-primary-content text-xl'>
                      {t.categories}
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-2 flex flex-col items-start justify-between overflow-x-auto sm:flex-row'>
                <label className='text-default-400 text-small flex'>
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
                <div className='mx-2 mt-2 flex flex-row justify-start gap-2 overflow-x-auto'>
                  <Button color='primary' className='flex justify-start'>
                    {t.addNew}
                  </Button>
                  <Button color='primary' className='hidden sm:flex'>
                    {t.applyFilters}
                  </Button>
                  <Button color='primary' className='hidden sm:flex'>
                    {t.clearFilters}
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableHeadRow>
                    <TableHead>{t.orderNumber}</TableHead>
                    <TableHead>{t.total}</TableHead>
                    <TableHead>{t.paymentType}</TableHead>
                    <TableHead>{t.deliveryType}</TableHead>
                    <TableHead>{t.description}</TableHead>
                    <TableHead>{t.action}</TableHead>
                  </TableHeadRow>
                </TableHeader>
                <TableBody>{renderTableBody()}</TableBody>
                {orderData?.totalRecords > 0 && (
                  <TableFooter>
                    <TableCell colSpan={5}>
                      <div className='flex justify-start'>
                        <PaginationSection
                          totalPosts={orderData?.totalRecords}
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
                              (orderData?.totalRecords ?? 0) / rowsPerPage
                            )
                          ) +
                          ' '}
                      </span>
                    </TableCell>
                  </TableFooter>
                )}
              </Table>
            </div>
          </section>
          <div className='hidden lg:flex lg:flex-col'>
            <ViewReceipt orderData={orderDataa} />
          </div>
          {showReceiptPopup ? (
        <div className="fixed overflow-x-auto inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <button
              className="absolute p-2"
              onClick={() => setShowReceiptPopup(false)}
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
            </button>
            <ViewReceipt orderData={orderDataa} />
          </div>
        </div>
      ) : null}
        </div>
        )
        }
      </Layout>
    </>
  );
};

export default ViewOrders;
