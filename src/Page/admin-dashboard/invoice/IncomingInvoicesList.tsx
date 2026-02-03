import {
  useDeleteInvoiceMutation,
  useGetIncomingInvoicesQuery,
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
import { Download, Trash } from "lucide-react";
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
  type: "incoming";
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

const IncomingInvoicesList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Default");

  const {
    data: invoicesData,
    isLoading,
    isError,
    isFetching,
  } = useGetIncomingInvoicesQuery(`?page=${page}`);

  // Only use search API when there's actual search text
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

    // Use search results if searching, otherwise use paginated results
    if (shouldSearch) {
      result = searchInvoice?.results || [];
    } else {
      result = [...invoices];
    }

    // Apply status filter
    if (status !== "All Status") {
      result = result.filter(
        (inv) => inv.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply sorting
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

  if (isLoading || (shouldSearch && isSearchLoading)) {
    return <p>Loading...</p>;
  }

  if (isError || (shouldSearch && isSearchError)) {
    return <p>Error fetching invoices.</p>;
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
            className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-600 cursor-pointer"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </div>

        <div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-600 cursor-pointer"
          >
            <option>Default</option>
            <option>Oldest to New</option>
            <option>New to Oldest</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto mt-6">
        {filteredInvoices.length > 0 ? (
          <>
            <Table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
              <TableHeader className="bg-gray-100 border-b border-gray-300 text-gray-700 text-sm">
                <TableRow>
                  <TableHead className="p-3 text-left">Invoice ID</TableHead>
                  <TableHead className="p-3 text-left">Building</TableHead>
                  <TableHead className="p-3 text-left">Region</TableHead>
                  <TableHead className="p-3 text-left">Apartment(s)</TableHead>
                  <TableHead className="p-3 text-left">Client</TableHead>
                  <TableHead className="p-3 text-left">Date Issued</TableHead>
                  <TableHead className="p-3 text-left">Due Date</TableHead>
                  <TableHead className="p-3 text-left">Total Amount</TableHead>
                  <TableHead className="p-3 text-left">Status</TableHead>
                  <TableHead className="p-3 text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <TableCell className="p-3 font-semibold text-gray-700">
                      {invoice.invoice_id}
                    </TableCell>
                    <TableCell className="p-3">
                      {invoice.building_name}
                    </TableCell>
                    <TableCell className="p-3">{invoice.region_name}</TableCell>
                    <TableCell className="p-3">
                      {invoice.apartment_name?.join(", ") || "N/A"}
                    </TableCell>
                    <TableCell className="p-3">
                      {invoice.client_name ?? "N/A"}
                    </TableCell>
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
                      <select
                        value={invoice.status.toLowerCase()}
                        onChange={(e) =>
                          handleStatusChange(invoice.id, e.target.value)
                        }
                        className={`border border-gray-300 rounded-md px-2 py-1 text-sm cursor-pointer ${invoice.status.toLowerCase() === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </TableCell>
                    <TableCell className="p-3 flex items-center gap-3">
                      {/* Download Button */}
                      <PDFDownloadLink
                        document={<InvoicePDF invoice={invoice} />}
                        fileName={`invoice-${invoice.invoice_id}.pdf`}
                      >
                        {({ loading }) => (
                          <div
                            className={`p-2 bg-gray-100 rounded-lg ${
                              loading ? "cursor-wait" : "cursor-pointer"
                            }`}
                          >
                            {loading ? (
                              <p className="text-xs text-gray-500">
                                Loading...
                              </p>
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </div>
                        )}
                      </PDFDownloadLink>

                      {/* Delete Alert Dialog */}
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
                        <AlertDialogContent>
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
                            >
                              <Button variant="destructive">Delete</Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls - Only show when not searching */}
            {!shouldSearch && (
              <div className="flex justify-between items-center mt-4 px-2">
                <Button
                  onClick={() => prevPage && setPage((p) => Math.max(p - 1, 1))}
                  disabled={!prevPage || isFetching}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    prevPage && !isFetching
                      ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil(totalCount / 10)}
                </span>

                <Button
                  onClick={() => nextPage && setPage((p) => p + 1)}
                  disabled={!nextPage || isFetching}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    nextPage && !isFetching
                      ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6">No invoices found</p>
        )}
      </div>
    </>
  );
};

export default IncomingInvoicesList;
