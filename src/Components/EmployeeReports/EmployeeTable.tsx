import { useMemo, useState } from "react";
import { Search as SearchIcon, ChevronDown } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Separator } from "@/Components/ui/separator";
import { useSelector } from "react-redux";
import {
  useGetEmployeesPageQuery,
  useCreateSupervisorFormMutation,
  type EmployeeItem,
} from "@/redux/features/employee/report/reporttable.api";
type Status = "current" | "completed" | "canceled";
type Row = {
  id: number;
  clientName: string;
  clientMail: string;
  region: string;
  employee: string;
  status: Status;
  remarks: string;
};

const statusBadge = (status: Status) => {
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (status === "current")
    return `${base} bg-blue-50 text-blue-700 border-blue-200`;
  if (status === "completed")
    return `${base} bg-green-50 text-green-700 border-green-200`;
  return `${base} bg-red-50 text-red-700 border-red-200`;
};

const mapEmployeeToRow = (e: EmployeeItem): Row => ({
  id: e.id,
  clientName: e.name,
  clientMail: e.email,
  region: e.employee_profile?.department || "N/A",
  employee: e.employee_profile?.role || "N/A",
  status: e.is_active ? "current" : "completed",
  remarks: `Joined on ${new Date(e.date_joined).toLocaleDateString()}`,
});

export const EmployeeTable = () => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<
    "Current Task" | "Completed" | "Canceled"
  >("Current Task");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [reportNotes, setReportNotes] = useState("");

  // RTK hooks
  const [createSupervisorForm, { isLoading: submitting }] =
    useCreateSupervisorFormMutation();

  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetEmployeesPageQuery(page);

  const apiRows: Row[] = useMemo(
    () => (data?.results || []).map(mapEmployeeToRow),
    [data?.results]
  );

  const filtered: Row[] = useMemo(() => {
    if (!apiRows.length) return [];
    const q = search.toLowerCase().trim();
    let base = apiRows;

    if (taskFilter === "Completed")
      base = base.filter((r) => r.status === "completed");
    else if (taskFilter === "Canceled")
      base = base.filter((r) => r.status === "canceled");
    else base = base.filter((r) => r.status !== "canceled");

    if (!q) return base;

    return base.filter((r) =>
      [
        String(r.id),
        r.clientName,
        r.clientMail,
        r.region,
        r.employee,
        r.remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, taskFilter, apiRows]);

  const openModal = (row: Row) => {
    setSelected(row);
    setReportNotes("");
    setOpen(true);
  };
  const supervisor = useSelector((state: any) => state.auth.user);
  const submitReport = async () => {
    if (!selected) return;
    try {
      await createSupervisorForm({
        employee: selected.id,
        supervisor: supervisor.id, // you can make this dynamic (e.g., logged-in supervisor id)
        work_summary: reportNotes || "No summary provided",
        performance: selected.status === "current" ? "Good" : "Completed",
        issues_reported: reportNotes,
      }).unwrap();

      alert("✅ Report submitted successfully!");
      setOpen(false);
      setReportNotes("");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("❌ Failed to submit report.");
    }
  };

  return (
    <>
      <div className="bg-white/50 border rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Employee Report Table</h2>
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center w-full sm:w-80 rounded-full border px-3 py-2 bg-white">
            <SearchIcon size={16} className="text-gray-400 mr-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full outline-none text-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((s) => !s)}
              className="rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm flex items-center gap-2"
            >
              {taskFilter}
              <ChevronDown size={16} />
            </button>
            {filterOpen && (
              <div
                className="absolute z-10 mt-2 w-44 rounded-md border bg-white shadow-sm overflow-hidden"
                onMouseLeave={() => setFilterOpen(false)}
              >
                {(["Current Task", "Completed", "Canceled"] as const).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setTaskFilter(opt);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        taskFilter === opt ? "bg-gray-50" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : isError ? (
            <div className="p-6 text-center text-red-500">
              Failed to load employees
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{row.id}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.clientName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.clientMail}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.region}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.employee}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={statusBadge(row.status)}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" onClick={() => openModal(row)}>
                          Report
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {(data?.next || data?.previous) && (
                <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data?.previous}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil((data?.count || 0) / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data?.next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              Quick view of the selected employee and report form.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Employee Name</div>
                  <div className="font-medium">{selected.clientName}</div>
                  <div className="text-gray-500 text-sm">
                    {selected.clientMail}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Department</div>
                  <div className="font-medium">{selected.region}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-gray-500">Role</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selected.employee}</span>
                    <Badge
                      variant="outline"
                      className={statusBadge(selected.status)}
                    >
                      {selected.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Report Employee</h3>
                <Textarea
                  placeholder="Describe the issue or feedback…"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={5}
                  className="h-40"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={submitReport} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
