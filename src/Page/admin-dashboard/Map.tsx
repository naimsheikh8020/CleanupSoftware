import { useState } from "react";
import { useGetBuildingsByRegionQuery } from "@/redux/features/admin/buildings/building.api";
import { useGetregionsQuery } from "@/redux/features/admin/regions/regions.api";
import { LayerMarkers } from "@/Components/map/mapcn";

interface Apartment {
  id: number;
  apartment_number: string;
  floor: number;
  living_rooms: number;
  bathrooms: number;
  outdoor_area: boolean;
  postcode: string;
  location: string;
  client: number | null;
  building: number;
}

interface Building {
  id: number;
  name: string;
  type: string;
  city: string;
  location: string;
  latitude: string;
  longitude: string;
  created_at: string;
  region: number;
  region_name: string;
  total_apartments: number;
  active_apartments_in_building: number;
  apartments: Apartment[];
}

interface RegionType {
  id: number;
  name: string;
}

const MapRegionOverview = () => {
  const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const { data: regions = [], isLoading: loadingRegions, error } =
    useGetregionsQuery(undefined);

  const toggleRegion = (regionId: number) => {
    setExpandedRegions((prev) => {
      const newSet = new Set(prev);
      newSet.has(regionId) ? newSet.delete(regionId) : newSet.add(regionId);
      return newSet;
    });
  };

  // 🔍 Filter regions based on search text
  const filteredRegions = regions?.results?.filter((region: RegionType) =>
    region.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* <div>
        <RegionsHierarchy />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar with Regions & Buildings List */}
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold mb-3">Regions & Buildings</h2>

          <div className="mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search region or building..."
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              Failed to load regions
            </div>
          )}

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="h-full overflow-y-auto">
              {loadingRegions ? (
                <div className="p-4 text-gray-500 text-sm">Loading regions...</div>
              ) : filteredRegions.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No matching regions found</div>
              ) : (
                filteredRegions.map((region: RegionType) => (
                  <RegionItem
                    key={region.id}
                    region={region}
                    isExpanded={expandedRegions.has(region.id)}
                    onToggle={() => toggleRegion(region.id)}
                    search={search} // 🔍 pass search
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-4 h-[700px] relative">
            {/* <MyMap /> */}
            <LayerMarkers />
          </div>
        </div>
      </div>
    </>
  );
};

interface RegionItemProps {
  region: RegionType;
  isExpanded: boolean;
  onToggle: () => void;
  search: string;
}

const RegionItem = ({ region, isExpanded, onToggle, search }: RegionItemProps) => {
  const { data: buildings = [], isLoading } = useGetBuildingsByRegionQuery(region.id, {
    skip: !isExpanded,
  });

  // 🔍 Filter buildings by name
  const filteredBuildings =
    search.trim().length > 0
      ? buildings.filter((b: Building) =>
          b.name.toLowerCase().includes(search.toLowerCase())
        )
      : buildings;

  return (
    <div className="border-b last:border-b-0">
      {/* Region Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-medium text-gray-900">{region.name}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Buildings List */}
      {isExpanded && (
        <div className="bg-gray-50">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Loading buildings...
            </div>
          ) : filteredBuildings.length > 0 ? (
            filteredBuildings.map((building: Building) => (
              <BuildingCard key={building.id} building={building} />
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching buildings
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface BuildingCardProps {
  building: Building;
}

const BuildingCard = ({ building }: BuildingCardProps) => {
  return (
    <div className="px-4 py-3 border-t border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{building.name}</h3>
          <p className="text-xs text-gray-600 mt-1">
            {building.location}, {building.city}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {building.type}
            </span>
            <span className="text-xs text-gray-500">
              {building.total_apartments} apartment
              {building.total_apartments !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapRegionOverview;
