import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import type { Employee } from "@/Types/Types";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useUpdateEmployeeMutation } from "@/redux/features/admin/users/employee.api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UpdateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const UpdateEmployeeModal = ({ isOpen, onClose, employee }: UpdateEmployeeModalProps) => {
  const [salary, setSalary] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState(""); // NEW: shift
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [updateEmployee] = useUpdateEmployeeMutation();

  useEffect(() => {
    if (employee) {
      setSalary(employee.employee_profile?.base_salary || "");
      setRole(employee.employee_profile?.role || "");
      setDepartment(employee.employee_profile?.department || "");
      setShift(employee.employee_profile?.shift || ""); // NEW: shift
      setIsOnLeave(employee.employee_profile?.is_on_leave || false);
    }
  }, [employee]);

  const handleUpdate = async () => {
    if (!employee) return;

    const formData = new FormData();
    formData.append("employee_profile.base_salary", salary);
    formData.append("employee_profile.role", role);
    formData.append("employee_profile.department", department);
    formData.append("employee_profile.shift", shift); // NEW: shift
    formData.append("employee_profile.is_on_leave", isOnLeave.toString());
    if (avatar) {
      formData.append("employee_profile.avatar", avatar);
    }

    try {
      await updateEmployee({ id: employee.id, data: formData });
      toast.success("Employee updated successfully");
    } catch (error) {
      toast.error("Failed to update employee");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Employee</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Salary */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salary" className="text-right">Salary</Label>
            <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="col-span-3" />
          </div>

          {/* Role */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" />
          </div>

          {/* Department */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Department</Label>
            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="col-span-3" />
          </div>

          {/* Shift (NEW) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shift" className="text-right">Shift</Label>
            <select id="shift" value={shift} onChange={(e) => setShift(e.target.value)} className="col-span-3 p-2 rounded-md border border-gray-300">
              <option value="">Select Shift</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          {/* On Leave */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_on_leave" className="text-right">On Leave</Label>
            <select id="is_on_leave" value={isOnLeave.toString()} onChange={(e) => setIsOnLeave(e.target.value === 'true')} className="col-span-3 p-2 rounded-md border border-gray-300">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Avatar */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">Avatar</Label>
            <Input id="avatar" type="file" onChange={(e) => setAvatar(e.target.files?.[0] || null)} className="col-span-3" />
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmployeeModal;
