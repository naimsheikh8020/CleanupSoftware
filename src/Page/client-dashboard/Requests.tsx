import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useDeleteClientRequestMutation,
  useGetClientSubscriptionsQuery,
} from "@/redux/features/Client/Request.api";
import { Loader2, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";

const Requests: React.FC = () => {
  const clientId = useSelector((state: any) => state.auth.user?.id) || 148;
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useGetClientSubscriptionsQuery({
    page,
    page_size: 5,
  });

  const [deleteClientRequest, { isLoading: deleting }] =
    useDeleteClientRequestMutation();

  // Map subscription_name and special_service_name for display
  const requests =
    data?.results
      ?.filter((item: any) => item.client === clientId)
      .map((item: any) => ({
        ...item,
        subscription_name: item.subscription?.name || "Subscription",
        special_service_name:
          item.special_service?.name || item.special_service
            ? "Special Service"
            : "",
      })) || [];

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteClientRequest(selectedId).unwrap();
      toast.success("Request cancelled successfully");
      setOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error("Failed to cancel request");
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-7 h-7 text-blue-500" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          My Requests
        </h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 py-10 justify-center">
          <AlertCircle className="w-5 h-5" /> Failed to load requests
        </div>
      )}

      {!isLoading && !error && (
        <>
          {requests.length > 0 ? (
            <div className="overflow-x-auto rounded-xl shadow bg-white">
              {/* Desktop Table */}
              <table className="min-w-full text-sm text-gray-700 hidden md:table">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">#</th>
                    <th className="py-3 px-4 text-left">Form Name</th>
                    <th className="py-3 px-4 text-left">Form Type</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-left">Service</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any, index: number) => (
                    <tr
                      key={req.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{req.form_name}</td>
                      <td className="py-2 px-4">{req.form_type}</td>
                      <td className="py-2 px-4">{req.description}</td>
                     <td className="p-3">
                  {req.set_time
                    ? new Date(req.set_time).toLocaleDateString("en-GB") // "DD/MM/YYYY"
                    : "-"}
                </td>
                      <td className="py-2 px-4">{req.time_range}</td>
                      <td className="py-2 px-4">
                        {req.special_service
                          ? `${req.subscription_name} + ${req.special_service_name}`
                          : req.subscription_name}
                      </td>
                      <td className="py-2 px-4">
                        <Button
                          variant="destructive"
                          className="flex items-center gap-1"
                          onClick={() => {
                            setSelectedId(req.id);
                            setOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden p-2 space-y-3">
                {requests.map((req: any, index: number) => (
                  <div
                    key={req.id}
                    className="p-3 border rounded-lg shadow-sm bg-white"
                  >
                    <p>
                      <b>Form:</b> {req.form_name}
                    </p>
                    <p>
                      <b>Type:</b> {req.form_type}
                    </p>
                    <p>
                      <b>Date:</b> {req.set_time}
                    </p>
                    <p>
                      <b>Time:</b> {req.time_range}
                    </p>
                    <p>
                      <b>Service:</b>{" "}
                      {req.special_service
                        ? `${req.subscription_name} + ${req.special_service_name}`
                        : req.subscription_name}
                    </p>
                    <p className="mt-1">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    </p>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 w-full flex items-center gap-1"
                      onClick={() => {
                        setSelectedId(req.id);
                        setOpen(true);
                      }}
                    >
                      <Trash2 size={16} /> Cancel
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              You haven’t sent any requests yet.
            </p>
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && data?.results?.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={!data?.previous}
          >
            Previous
          </Button>
          <span className="text-gray-600 text-sm">
            Page {page} of {Math.ceil((data?.count || 1) / 5)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.next}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-4">This action cannot be undone.</p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting && <Loader2 className="animate-spin w-4 h-4" />} Yes,
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;
