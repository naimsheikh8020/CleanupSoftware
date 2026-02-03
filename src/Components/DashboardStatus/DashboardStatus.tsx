import { useMemo, useState } from "react";
import man from "../../assets/Image/Heart.png";
import vector from "../../assets/Image/vector.png";
import vector1 from "../../assets/Image/Vector (1).png";
import house from "../../assets/Image/solar_card-outline.png";
import { useGetAdminDashboardQuery } from "@/redux/features/admin/dashboard/dashboard.api";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const buildYears = (center: number, before = 2, after = 2) =>
  Array.from({ length: before + after + 1 }, (_, i) => center - before + i);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DashboardStats() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = MONTHS[now.getMonth()];

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<string>(currentMonth);

  const { data, isLoading, isError } = useGetAdminDashboardQuery({ year, month });
  const d = data ?? {};

  const formatInt = (n?: number) => (typeof n === "number" ? n.toLocaleString() : "0");
  const formatSAR = (n?: number) => (typeof n === "number" ? `SAR ${n.toLocaleString()}` : "SAR 0");

  const cards = useMemo(
    () => [
      { id: 1, title: "Total Client", value: formatInt(d.clients), icon: man },
      { id: 2, title: "Active Subscriptions", value: formatInt(d.month_new_subscription), icon: house },
      { id: 3, title: "Monthly Revenue", value: formatSAR(d.month_sales), icon: vector },
      { id: 4, title: "Total Buildings", value: formatInt(d.month_new_added_building), icon: vector1 },
    ],
    [d]
  );

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-bold text-2xl text-center sm:text-left">Dashboard</h1>

        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 bg-white p-2 rounded-lg">
          {/* Year dropdown */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-[#9A9AA9] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {buildYears(currentYear, 3, 3).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month dropdown */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-[#9A9AA9] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {capitalize(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded mb-4">
          Failed to load dashboard data.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow border border-gray-200 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full" />
              <div className="h-4 w-28 bg-gray-100 rounded mt-3" />
              <div className="h-6 w-16 bg-gray-100 rounded mt-2" />
            </div>
          ))
          : cards.map((c) => (
            <div
              key={c.id}
              className="bg-white flex justify-between items-center rounded-xl p-5 shadow border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div>
                <h3 className="text-gray-500 text-sm sm:text-base">{c.title}</h3>
                <p className="text-xl sm:text-2xl font-bold mt-1">{c.value}</p>
              </div>
              <div>
                <img
                  src={c.icon}
                  alt={c.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF5FF] p-2 sm:p-3 rounded-full"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
