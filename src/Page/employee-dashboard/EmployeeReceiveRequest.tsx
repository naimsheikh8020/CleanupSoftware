import React, { useState } from "react";
import {
  useGetClientSubscriptionsQuery,
  useUpdateClientRequestMutation,
  useDeleteClientRequestMutation,
} from "@/redux/features/Client/Request.api";
import { useSelector } from "react-redux";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";

const EmployeeReceiveRequest: React.FC = () => {
  const [page, setPage] = useState(1);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFormType, setEditFormType] = useState("");
  const [editTimeRange, setEditTimeRange] = useState("");

  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.user_type === "admin";

  const { data, isLoading, error } = useGetClientSubscriptionsQuery({
    page,
    page_size: 5,
  });

  const [updateClientRequest] = useUpdateClientRequestMutation();
  const [deleteClientRequest] = useDeleteClientRequestMutation();

  const allTimeRanges =
    Array.from(new Set(data?.results?.map((item: any) => item.time_range))) ||
    [];
  const allFormTypes =
    Array.from(new Set(data?.results?.map((item: any) => item.form_type))) ||
    [];

  const handleUpdateClick = async (id: number) => {
    if (!isAdmin) return alert("Only admin can update!");

    const body: any = {};
    if (editDescription) body.description = editDescription;
    if (editFormType) body.form_type = editFormType;
    if (editTimeRange) body.time_range = editTimeRange;

    try {
      await updateClientRequest({ id, body }).unwrap();
      toast.success("✅ Updated successfully!");
      setEditRowId(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Update failed!");
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!isAdmin) return alert("Only admin can delete!");
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await deleteClientRequest(id).unwrap();
      toast.success("🗑️ Deleted successfully!");
      if (editRowId === id) setEditRowId(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Delete failed!");
    }
  };

  if (isLoading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error)
    return (
      <p className="text-center py-10 text-red-500">
        Failed to load client requests!
      </p>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Client Requests</h1>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              {data?.results?.some(
                (item: any) => item.form_type === "subscription"
              ) ? (
                <>
                  <th className="p-3 text-left">Service Building Name</th>
                  <th className="p-3 text-left">Service Apartment Number</th>
                </>
              ) : (
                <>
                  <th className="p-3 text-left">Subscription Building Name</th>
                  <th className="p-3 text-left">
                    Subscription Apartment Number
                  </th>
                </>
              )}
              <th className="p-3 text-left">Time Range</th>
              <th className="p-3 text-left">Set Date</th>
              <th className="p-3 text-left">Form Type</th>
              <th className="p-3 text-left">Description</th>
              {isAdmin && <th className="p-3 text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {data?.results?.map((item: any) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{item.id}</td>

                {item.subscription && item.form_type === "subscription" ? (
                  <>
                    <td className="p-3">{item.service_building_name || "-"}</td>
                    <td className="p-3">
                      {item.service_apartment_number || "-"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3">
                      {item.subscription_building_name || "-"}
                    </td>
                    <td className="p-3">
                      {item.subscription_apartment_number || "-"}
                    </td>
                  </>
                )}

                <td className="p-3">{item.time_range || "-"}</td>
                <td className="p-3">
                  {item.set_time
                    ? new Date(item.set_time).toLocaleDateString("en-GB") // "DD/MM/YYYY"
                    : "-"}
                </td>
                <td className="p-3">{item.form_type}</td>
                <td className="p-3">{item.description.slice(0, 15)}</td>

                {isAdmin && (
                  <td className="p-3 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditRowId(item.id);
                            setEditDescription(item.description);
                            setEditFormType(item.form_type);
                            setEditTimeRange(item.time_range);
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Request</DialogTitle>
                        </DialogHeader>

                        {/* Description */}
                        <div className="my-2">
                          <Label htmlFor={`description-${item.id}`}>
                            Description
                          </Label>
                          <Input
                            id={`description-${item.id}`}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>

                        {/* Form Type */}
                        <div className="my-2">
                          <Label htmlFor={`form_type-${item.id}`}>
                            Form Type
                          </Label>
                          <Select
                            value={editFormType}
                            onValueChange={setEditFormType}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select form type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {allFormTypes.map((type, i) => (
                                  <SelectItem key={i} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Time Range */}
                        <div className="my-2">
                          <Label htmlFor={`time_range-${item.id}`}>Time </Label>
                          <Select
                            value={editTimeRange}
                            onValueChange={setEditTimeRange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {allTimeRanges.map((range, i) => (
                                  <SelectItem key={i} value={range}>
                                    {range}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="sm:justify-start gap-2">
                          <DialogClose asChild>
                            <Button
                              variant="default"
                              onClick={() => handleUpdateClick(item.id)}
                            >
                              Save
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <Button
          variant="outline"
          disabled={!data?.previous}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        <span className="flex items-center px-3">Page {page}</span>
        <Button
          variant="outline"
          disabled={!data?.next}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default EmployeeReceiveRequest;
