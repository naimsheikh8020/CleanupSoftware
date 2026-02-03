import {
  useDeleteInvoiceMutation,
  useGetOutgoingInvoicesQuery,
  useGetSearchAllInvoiceQuery,
  useUpdateInvoiceStatusMutation,
} from "@/redux/features/admin/invoice/invoice.api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../Components/ui/alert-dialog";
import { Download, Trash, Loader2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

interface Invoice {
  id: number;
  invoice_id: string;
  vendor_name: string | null;
  type: "outgoing";
  date_issued: string;
  due_date: string | null;
  client_name: string | null;
  building_name: string;
  region_name: string;
  status: string;
  total_amount: number;
  note: string;
  plan: number;
  apartments: number[];
  apartment_name: string[];
  vendor: string | null;
  vendor_invoice_file: string | null;
  line_items: any[];
  file: string | null;
}

const InvoicesList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Default");

  const {
    data: invoicesData,
    isLoading,
    isFetching,
    isError,
  } = useGetOutgoingInvoicesQuery(page, {
    refetchOnMountOrArgChange: true,
    keepPreviousData: true,
  });

  const shouldSearch = search.trim().length > 0;
  const {
    data: searchInvoice,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useGetSearchAllInvoiceQuery(search, { skip: !shouldSearch });

  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoiceStatus] = useUpdateInvoiceStatusMutation();

  const invoices = invoicesData?.results || [];
  const totalCount = invoicesData?.count || 0;
  const nextPage = invoicesData?.next;
  const prevPage = invoicesData?.previous;

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let result: Invoice[] = [];

    if (shouldSearch) {
      result = searchInvoice?.results || [];
    } else {
      result = [...invoices];
    }

    if (status !== "All Status") {
      result = result.filter(
        (inv) => inv.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (sort === "Oldest to New") {
      result.sort(
        (a, b) =>
          new Date(a.date_issued).getTime() - new Date(b.date_issued).getTime()
      );
    } else if (sort === "New to Oldest") {
      result.sort(
        (a, b) =>
          new Date(b.date_issued).getTime() - new Date(a.date_issued).getTime()
      );
    }

    setFilteredInvoices(result);
  }, [search, status, sort, invoices, searchInvoice, shouldSearch]);

  const handleDelete = async (invoice: Invoice) => {
    try {
      await deleteInvoice(invoice.id).unwrap();
      toast.success(`Invoice ${invoice.invoice_id} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete invoice ${invoice.invoice_id}`);
      console.error("Delete error:", error);
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      await updateInvoiceStatus({ id: invoiceId, status: newStatus }).unwrap();
      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update invoice status");
      console.error("Update error:", error);
    }
  };

  const handlePrev = () => {
    if (prevPage && !isFetching) {
      setPage((p) => Math.max(p - 1, 1));
    }
  };

  const handleNext = () => {
    if (nextPage && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  // Show full-page loader only on initial load
  if (isLoading || (shouldSearch && isSearchLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || (shouldSearch && isSearchError)) {
    return <p className="text-center text-red-600">Error fetching invoices.</p>;
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search Invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Default</option>
          <option>Oldest to New</option>
          <option>New to Oldest</option>
        </select>
      </div>

      {/* Table Container with Fixed Height & Overlay */}
      <div className="relative mt-6 min-h-[500px] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Overlay Spinner - Only during pagination/search fetch */}
        {isFetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <Table className="min-w-full border border-gray-200">
              <TableHeader className="bg-gray-50 border-b">
                <TableRow>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Invoice ID</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Building</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Region</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Apartment(s)</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Client</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Date Issued</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Due Date</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Total Amount</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Status</TableHead>
                  <TableHead className="p-3 text-left font-medium text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="p-3 font-semibold text-gray-800">
                      {invoice.invoice_id}
                    </TableCell>
                    <TableCell className="p-3">{invoice.building_name}</TableCell>
                    <TableCell className="p-3">{invoice.region_name}</TableCell>
                    <TableCell className="p-3">
                      {invoice.apartment_name?.join(", ") || "N/A"}
                    </TableCell>
                    <TableCell className="p-3">{invoice.client_name ?? "N/A"}</TableCell>
                    <TableCell className="p-3">
                      {new Date(invoice.date_issued).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-3">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="p-3 font-semibold text-gray-800">
                      {invoice.total_amount.toFixed(2)} SAR
                    </TableCell>
                    <TableCell className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={invoice.status.toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(invoice.id, e.target.value)
                          }
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>

                        {/* PDF Download - Fixed Size */}
                        <div className="inline-flex items-center justify-center w-9 h-9">
                          <PDFDownloadLink
                            document={<InvoicePDF invoice={invoice} />}
                            fileName={`invoice-${invoice.invoice_id}.pdf`}
                          >
                            {({ loading }) =>
                              loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                              ) : (
                                <Download className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                              )
                            }
                          </PDFDownloadLink>
                        </div>

                        {/* Delete Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete invoice{" "}
                                <span className="font-semibold">
                                  {invoice.invoice_id}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(invoice)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No invoices found
            </div>
          )}
        </div>

        {/* Pagination - Only when not searching */}
        {!shouldSearch && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
            <Button
              onClick={handlePrev}
              disabled={!prevPage || isFetching}
              variant="outline"
              size="sm"
              className="disabled:opacity-50"
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {Math.ceil(totalCount / 10)}
            </span>

            <Button
              onClick={handleNext}
              disabled={!nextPage || isFetching}
              variant="outline"
              size="sm"
              className="disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default InvoicesList;