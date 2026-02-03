import { useState } from "react";
import { Loader2, Search, XCircle } from "lucide-react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";
import { useGetregionsQuery } from "@/redux/features/admin/regions/regions.api";
import {
  useGetBuildingByIdQuery,
  useGetBuildingsByRegionQuery,
} from "@/redux/features/admin/buildings/building.api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import { useGetSearchAllEmpoloyeesQuery } from "@/redux/features/admin/users/employee.api";
import { useGetSearchClientsQuery } from "@/redux/features/admin/users/clients.api";
import { useGetPlansQuery } from "@/redux/features/admin/plan/plan.api";
import { useAddSubscriptionMutation } from "@/redux/features/admin/subscription/subscription.api";
import DatePicker from "react-datepicker";

const AddSubscriptionForm = () => {
  interface FormState {
    user: number | null;
    plan: number | null;
    building: number | null;
    apartment: number | null;
    region: number | null;
    status: "active" | "inactive" | "paused" | "cancelled" | "past_due";
    start_date: string;
    payment: "prepaid" | "postpaid";
    employee: number[];
    dateFormat: "string",
  }
  const initialFormState: FormState = {
    user: null,
    plan: null,
    building: null,
    apartment: null,
    region: null,
    status: "active",
    start_date: "",
    payment: "prepaid",
    employee: [],
    dateFormat: "string"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // API Queries
  const { data: regionsData, isLoading: isRegionsLoading } =
    useGetregionsQuery(undefined);
  const { data: buildings, isLoading: isBuildingsLoading } =
    useGetBuildingsByRegionQuery(formData.region, { skip: !formData.region });
  const { data: apartmentsData } = useGetBuildingByIdQuery(
    formData.building || 0,
    { skip: !formData.building }
  );
  const { data: usersData, isLoading: isUsersLoading } =
    useGetSearchClientsQuery(userSearch ? `${userSearch}` : "");
  const { data: employeesData, isLoading: isEmployeesLoading } =
    useGetSearchAllEmpoloyeesQuery(employeeSearch ? `${employeeSearch}` : "");
  const { data: plansData } = useGetPlansQuery(undefined);
  const [addSubscription] = useAddSubscriptionMutation();

  const apartments = apartmentsData?.apartments || [];

  type FormField = keyof typeof initialFormState;

  const handleInputChange = (
    field: FormField,
    value: string | number | null | number[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "region" && { building: null, apartment: null }),
      ...(field === "building" && { apartment: null }),
    }));
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setSelectedUser("");
    setUserSearch("");
    setShowUserDropdown(false);
    setSelectedEmployees([]);
    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
  };

  const handleSave = async () => {
    const payload = {
      user: formData.user,
      plan: formData.plan,
      building: formData.building,
      apartment: formData.apartment,
      region: formData.region,
      status: formData.status,
      start_date: formData.start_date,
      payment: formData.payment,
      employee: formData.employee,
    };

    try {
      await addSubscription(payload);

      toast.success("Subscription created successfully");
      handleCancel();
    } catch (error) {
      console.error("Subscription creation failed:", error);
      toast.error("Subscription creation failed");
    }
  };

  const removeEmployee = (employeeId: number) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    handleInputChange(
      "employee",
      formData.employee.filter((id) => id !== employeeId)
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add New Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new subscription for a user
        </p>
      </div>

      {/* User & Plan Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label htmlFor="user" className="text-sm required:">
                Select User *
              </Label>
              <div className="relative">
                <Input
                  required
                  type="text"
                  value={selectedUser || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserSearch(value);
                    setSelectedUser(value);
                    setShowUserDropdown(!!value);
                  }}
                  onFocus={() => {
                    if (!selectedUser) {
                      setShowUserDropdown(true);
                    }
                  }}
                  className="peer ps-9 pe-9"
                  placeholder="Search user by name or email..."
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  {isUsersLoading ? (
                    <Loader2
                      className="animate-spin"
                      size={16}
                      role="status"
                      aria-label="Loading..."
                    />
                  ) : (
                    <Search size={16} aria-hidden="true" />
                  )}
                </div>
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser("");
                      setUserSearch("");
                      handleInputChange("user", null);
                      setShowUserDropdown(false);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
              {showUserDropdown &&
                (usersData?.results?.length > 0 ? (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {usersData.results.map((user: any) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                          handleInputChange("user", user.id);
                          setSelectedUser(user.name);
                          setUserSearch("");
                          setShowUserDropdown(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    <p className="text-sm text-gray-500">No user found</p>
                  </div>
                ))}
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-sm">
                Select Plan *
              </Label>
              <Select
                value={formData.plan?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange("plan", Number(value))
                }
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansData?.results?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4">Location Details</h2>
          <div className="space-y-4">
            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm">
                Region *
              </Label>
              <Select
                value={formData.region?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange("region", Number(value))
                }
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {isRegionsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    regionsData?.results?.map(
                      (region: { id: number; name: string }) => (
                        <SelectItem
                          key={region.id}
                          value={region.id.toString()}
                        >
                          {region.name}
                        </SelectItem>
                      )
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Building */}
            <div className="space-y-2">
              <Label htmlFor="building" className="text-sm">
                Building *
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Select
                      disabled={formData.region === null}
                      value={formData.building?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange("building", Number(value))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Building" />
                      </SelectTrigger>
                      <SelectContent>
                        {isBuildingsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : buildings && buildings.length > 0 ? (
                          buildings?.map((building: any) => (
                            <SelectItem
                              key={building.id}
                              value={String(building.id)}
                            >
                              {building.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No Buildings available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                {formData.region === null && (
                  <TooltipContent>Please select a region first</TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Apartment */}
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-sm">
                Apartment *
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Select
                      disabled={formData.building === null}
                      value={formData.apartment?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange("apartment", Number(value))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Apartment" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartments.length > 0 ? (
                          apartments.map((apt: any) => (
                            <SelectItem key={apt.id} value={String(apt.id)}>
                              {apt.apartment_number}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No Apartments available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                {formData.building === null && (
                  <TooltipContent>
                    Please select a building first
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4">Subscription Details</h2>
          <div className="space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  handleInputChange("status", value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  {/* <SelectItem value="paused">Paused</SelectItem> */}
                  {/* <SelectItem value="paused_due">Paused due</SelectItem> */}
                  {/* <SelectItem value="cancelled">stopped</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="payment" className="text-sm">
                Payment Type
              </Label>
              <Select
                value={formData.payment}
                onValueChange={(value: any) =>
                  handleInputChange("payment", value)
                }
              >
                <SelectTrigger id="payment">
                  <SelectValue placeholder="Select Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="postpaid">Postpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Date Configuration */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4">Date Configuration</h2>
          <div className="space-y-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm">
                Start Date *
              </Label>

              <DatePicker
                selected={formData.start_date ? new Date(formData.start_date) : null}
                onChange={(date) => {
                  const d = new Date(date);
                  const formatted = d.toLocaleDateString("en-GB").replace(/\//g, "-");
                  handleInputChange("start_date", formatted);
                }}
                dateFormat="dd-MM-yyyy"
                className="w-full border rounded-md p-2"
              />
            </div>


          </div>
        </div>
      </div>

      {/* Employee Assignment */}
      <div className="bg-white border rounded-lg p-6 mb-4">
        <h2 className="text-base font-semibold mb-4">Assign Employees</h2>
        <div className="space-y-4">
          {/* Employee Search */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm">
              Search Employees
            </Label>
            <div className="relative">
              <Input
                required
                type="text"
                value={employeeSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmployeeSearch(value);
                  setShowEmployeeDropdown(!!value);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                className="peer ps-9"
                placeholder="Search by name or email..."
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                {isEmployeesLoading ? (
                  <Loader2
                    className="animate-spin"
                    size={16}
                    role="status"
                    aria-label="Loading..."
                  />
                ) : (
                  <Search size={16} aria-hidden="true" />
                )}
              </div>
            </div>
            {showEmployeeDropdown &&
              employeeSearch &&
              (employeesData?.results?.length > 0 ? (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {employeesData.results
                    .filter((emp: any) => !formData.employee.includes(emp.id))
                    .map((employee: any) => (
                      <div
                        key={employee.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                          const newEmployees = [
                            ...formData.employee,
                            employee.id,
                          ];
                          handleInputChange("employee", newEmployees);
                          setSelectedEmployees([
                            ...selectedEmployees,
                            { id: employee.id, name: employee.name },
                          ]);
                          setEmployeeSearch("");
                          setShowEmployeeDropdown(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.email}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                  <p className="text-sm text-gray-500">No employees found</p>
                </div>
              ))}
          </div>

          {/* Selected Employees */}
          {selectedEmployees.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Selected Employees</Label>
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm"
                  >
                    <span>{emp.name}</span>
                    <button
                      type="button"
                      onClick={() => removeEmployee(emp.id)}
                      className="hover:text-blue-900"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 gap-4">
        <Button onClick={handleCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave}>Create Subscription</Button>
      </div>
    </div>
  );
};

export default AddSubscriptionForm;
