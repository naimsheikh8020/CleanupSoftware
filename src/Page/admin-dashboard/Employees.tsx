import { useMemo, useState } from "react";
import { assets } from "@/assets/assets";
import ActionButton from "@/Components/ActionButton";
import Card from "@/Components/Card";
import ProgressBar from "@/Components/ProgressBar";
import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import {
  useEmployeeOverviewQuery,
  useGetAllemployeeAdminQuery,
  useGetSearchAllEmpoloyeesQuery,
  useUpdateEmployeeStatusMutation,
} from "@/redux/features/admin/users/employee.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import UpdateEmployeeModal from "@/Components/UpdateEmployeeModal";
import type { Employee } from "@/Types/Types";
import { toast } from "sonner";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [shiftFilter, setShiftFilter] = useState("All Shifts");
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateEmployeeStatus] = useUpdateEmployeeStatusMutation();

  const handleUpdateStatus = async (id: number, status: boolean) => {
    try {
      await updateEmployeeStatus({ id, employee_profile: { is_on_leave: status } });
      toast.success("Employee status updated successfully");
    } catch (error) {
      toast.error("Failed to update employee status");
      console.error(error);
    }
  };

  const { data: overviewData } = useEmployeeOverviewQuery();
  const {
    data: employeeResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetAllemployeeAdminQuery(page);
  const {
    data: searchResponse,
    isLoading: searchLoading,
    error: searchError,
  } = useGetSearchAllEmpoloyeesQuery(searchTerm, {
    skip: searchTerm.trim() === "",
  });

  const employees: Employee[] = useMemo(() => {
    const baseList = searchTerm.trim()
      ? searchResponse?.results || []
      : employeeResponse?.results || [];
    return baseList;
  }, [searchTerm, employeeResponse, searchResponse]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      emp.employee_profile?.department === departmentFilter;
    const matchesShift =
      shiftFilter === "All Shifts" || emp.employee_profile?.shift === shiftFilter;
    return matchesDepartment && matchesShift;
  });

  const totalPages = searchTerm.trim()
    ? 1
    : Math.ceil(employeeResponse?.count / 10 || 1);

  const loading = employeesLoading || (searchTerm && searchLoading);
  const error = employeesError || searchError;

  const cardData = [
    {
      title: "Total Employee",
      number: overviewData?.total_employee ?? 0,
      iconKey: "totalEmployee",
      iconAlt: "total employee",
    },
    {
      title: "Active",
      number: overviewData?.active ?? 0,
      iconKey: "Active",
      iconAlt: "active",
    },
    {
      title: "Avg Performance",
      number: overviewData?.average_performance ?? 0,
      iconKey: "AvgPerformance",
      iconAlt: "Avg Performance",
    },
    {
      title: "Total Payroll",
      number: overviewData?.total_payroll ?? 0,
      iconKey: "totalpayroll",
      iconAlt: "Total Payroll",
    },
    {
      title: "On Leave",
      number: overviewData?.leave ?? 0,
      iconKey: "onLeave",
      iconAlt: "On leave",
    },
  ];

  return (
    <div className="flex flex-col mt-4 min-h-screen">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p>Manage your employees here</p>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
          {cardData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              number={card.number}
              iconSrc={assets[card.iconKey]}
              iconAlt={card.iconAlt}
            />
          ))}
        </div>

        <div className="flex justify-between my-6 items-center">
          <div></div>
          <ActionButton />
        </div>

        <ProgressBar />

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-8 bg-white rounded-xl p-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-6 py-2 text-sm text-gray-600 cursor-pointer"
          >
            <option>All Departments</option>
            <option>Cleaning</option>
            <option>Security</option>
            <option>Maintenance</option>
            <option>Management</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-6 py-2 text-sm text-gray-600 cursor-pointer"
          >
            <option>All Shifts</option>
            <option>morning</option>
            <option>evening</option>
            <option>night</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-visible mt-6 h-auto">
        {loading ? (
          <p className="text-gray-500 text-center">Loading employees...</p>
        ) : error ? (
          <p className="text-red-500 text-center">Failed to load employees.</p>
        ) : filteredEmployees.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-sm mb-4">
              <table className="min-w-full border-collapse text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Avatar</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Shift</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Salary</th>
                    <th className="px-4 py-3 text-left">User Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left cursor-pointer">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3">
                        <img
                          src={emp.employee_profile?.avatar ?? "/default-avatar.png"}
                          alt={emp.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">{emp.name}</td>
                      <td className="px-4 py-3">{emp.employee_profile?.role || "N/A"}</td>
                      <td className="px-4 py-3">{emp.employee_profile?.department || "N/A"}</td>
                      <td className="px-4 py-3">{emp.employee_profile?.shift || "N/A"}</td>
                      <td className="px-4 py-3">{emp.email}</td>
                      <td className="px-4 py-3">{emp.prime_phone}</td>
                      <td className="px-4 py-3">{emp.employee_profile?.base_salary || "0"} SAR</td>
                      <td className="px-4 py-3">{emp.user_type || "N/A"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={emp.employee_profile?.is_on_leave.toString()}
                          onChange={(e) =>
                            handleUpdateStatus(emp.id, e.target.value === "true")
                          }
                          className={`p-2 rounded-md text-xs ${
                            emp.employee_profile?.is_on_leave
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <option value="false">Active</option>
                          <option value="true">On Leave</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button
                          variant={"outline"}
                          onClick={() => setSelectedEmployee(emp)}
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </Button>
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setUpdateModalOpen(true);
                          }}
                          title="Update Details"
                        >
                          <CiEdit size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!searchTerm && (
              <div className="flex justify-between items-center mt-4 px-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    page === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    page >= totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center">No employees found.</p>
        )}
      </div>

      {/* Employee Details Modal */}
      <Dialog
        open={!!selectedEmployee && !updateModalOpen}
        onOpenChange={() => setSelectedEmployee(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected employee.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p>
                    <strong>ID:</strong> {selectedEmployee.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {selectedEmployee.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedEmployee.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedEmployee.prime_phone}
                  </p>
                  <p>
                    <strong>User Type:</strong> {selectedEmployee.user_type || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedEmployee.is_active ? "Active" : "Inactive"}
                  </p>
                  <p>
                    <strong>Date Joined:</strong>{" "}
                    {new Date(selectedEmployee.date_joined).toLocaleDateString()}
                  </p>
                </div>
                <img
                  src={selectedEmployee.employee_profile?.avatar ?? "/default-avatar.png"}
                  alt={selectedEmployee.name}
                  className="w-36 h-36 rounded-full object-cover border border-gray-300"
                />
              </div>
              <hr className="my-2" />
              <p>
                <strong>Department:</strong> {selectedEmployee.employee_profile?.department || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {selectedEmployee.employee_profile?.role || "N/A"}
              </p>
              <p>
                <strong>Shift:</strong> {selectedEmployee.employee_profile?.shift || "N/A"}
              </p>
              <p>
                <strong>On Leave:</strong> {selectedEmployee.employee_profile?.is_on_leave ? "Yes" : "No"}
              </p>
              <p>
                <strong>Location:</strong> {selectedEmployee.employee_profile?.location || "N/A"}
              </p>
              <p>
                <strong>National ID:</strong> {selectedEmployee.employee_profile?.national_id || "N/A"}
              </p>
              <p>
                <strong>Contract Start:</strong> {selectedEmployee.employee_profile?.contract_start || "N/A"}
              </p>
              <p>
                <strong>Contract End:</strong> {selectedEmployee.employee_profile?.contract_end || "N/A"}
              </p>
              <p>
                <strong>Base Salary:</strong> {selectedEmployee.employee_profile?.base_salary || "N/A"} SAR
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Employee Modal */}
      <UpdateEmployeeModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default Employees;
