import { assets } from "@/assets/assets";
import Card from "@/Components/Card";
import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import {
  useGetAllClientsAdminQuery,
  useGetClientOverviewAdminQuery,
  useGetSearchClientsQuery,
  useDeleteClientMutation,
  useUpdateClientMutation,
  useGetClientDetailsQuery,
} from "@/redux/features/admin/users/clients.api";
import { AddClient } from "./add-client";
import { Eye, Edit, Trash } from "lucide-react";
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
} from "@/Components/ui/alert-dialog";
import { toast } from "sonner";
import { Switch } from "@/Components/ui/switch";
import { Button } from "@/Components/ui/button";
import ClientDetails from "./client-detail";
import EditClient from "./update-client";
import ErrorComponent from "@/Components/Error";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const {
    data: all_Client,
    isLoading: all_Client_Loading,
    error: all_Client_error,
  } = useGetAllClientsAdminQuery(page);

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useGetSearchClientsQuery(debouncedSearch, {
    skip: debouncedSearch.trim() === "",
  });

  const {
    data: Overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useGetClientOverviewAdminQuery();

  const { data: clientDetail } =
    useGetClientDetailsQuery(selectedClientId, {
      skip: selectedClientId === null,
    });

  const [deleteClient] = useDeleteClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const clientsToDisplay = debouncedSearch.trim()
    ? searchResults?.results || []
    : all_Client?.results || [];

  const loading =
    all_Client_Loading || overviewLoading || (debouncedSearch && searchLoading);
  const error = all_Client_error || overviewError || searchError;

  const handleDelete = async (clientId: number) => {
    try {
      await deleteClient(clientId).unwrap();
      toast.success("Client deleted successfully");
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  const handleStatusToggle = async (
    clientId: number,
    currentStatus: boolean
  ) => {
    try {
      await updateClient({
        id: clientId,
        body: { is_active: !currentStatus },
      }).unwrap();
      toast.success("Client status updated successfully");
    } catch (error) {
      toast.error("Failed to update client status");
    }
  };

  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = (open: boolean) => {
    setIsDetailsOpen(open);
    if (!open) {
      // Delay clearing the selected client to allow the dialog to close smoothly
      setTimeout(() => setSelectedClientId(null), 300);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <ErrorComponent />;

  const totalPages = debouncedSearch.trim()
    ? 1
    : Math.ceil(all_Client?.count / 10 || 1);

  return (
    <div className="flex flex-col h-screen">
      {/* ===== Top Section ===== */}
      <div className="flex-shrink-0">
        {/* Title */}
        <div className="flex justify-between">
          <div>
            <h2 className="text-black text-2xl font-bold">Clients</h2>
            <p className="text-[#808080] text-base mt-1">
              Manage clients and subscription
            </p>
          </div>
          <AddClient />
        </div>

        {/* ===== Top Cards ===== */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-6">
          <Card
            title="Total Client"
            number={Overview?.total_client ?? 0}
            iconSrc={assets.total_service}
            iconAlt="Clients icon"
          />
          <Card
            title="Total Revenue"
            number={Overview?.total_client_pay ?? 0}
            iconSrc={assets.Total_revenue}
            iconAlt="Revenue icon"
          />
          <Card
            title="Client Rating"
            number={Overview?.client_rating ?? 0}
            iconSrc={assets.Avg_Popularity}
            iconAlt="Total Services icon"
          />
          <Card
            title="Active Bookings"
            number={Overview?.active_booking ?? 0}
            iconSrc={assets.Avg_Popularity}
            iconAlt="Active Bookings icon"
          />
        </div>

        {/* ===== Search + Filters ===== */}
        <div className="flex justify-between mt-10 mb-6 w-full">
          {/* Search */}
          <div className="flex items-center border border-gray-400 p-2 rounded-xl w-full max-w-2xl">
            <IoIosSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search by name, email or location..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
        </div>
        <div>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {clientsToDisplay.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr className="text-left text-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Avatar</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Services</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientsToDisplay.map((client: any) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-3">{client.id}</td>
                  <td className="p-3">
                    <img
                      src={
                        client.client_profile?.avatar ?? "/default-avatar.png"
                      }
                      alt={client.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-300"
                    />
                  </td>
                  <td className="p-3 font-semibold">{client.name}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.prime_phone}</td>
                  <td className="p-3">
                    {client.client_profile?.location ?? "N/A"}
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={client.is_active}
                      onCheckedChange={() =>
                        handleStatusToggle(client.id, client.is_active)
                      }
                    />
                  </td>
                  <td className="p-3">{client.each_client_services}</td>
                  <td className="p-3">
                    {new Date(client.date_joined).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewClient(client.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditOpen(client.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the client.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(client.id)}
                          >
                            <Button variant="destructive">Delete</Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center p-5">No users found.</p>
        )}

        {!debouncedSearch && (
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-4 py-2 cursor-pointer rounded border ${
                page > 1
                  ? "bg-white hover:bg-gray-100"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className={`px-4 py-2 cursor-pointer rounded-md text-white font-medium ${
                page < totalPages
                  ? "bg-blue-600 hover:bg-gray-300 hover:text-black"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      <ClientDetails
        client={clientDetail}
        open={isDetailsOpen}
        onOpenChange={handleCloseDetails}
      />

      <EditClient
        client={clientDetail}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
};

export default Clients;
