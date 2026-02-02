import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import type { LatLng } from "@/Types/map.types";
import type { Building } from "@/Types/building.types";
import { useGetSearchClientsQuery } from "@/redux/features/admin/users/clients.api";
import {
  useCreateApartmentMutation,
  useGetBuilidingBySearchQuery,
} from "@/redux/features/admin/buildings/building.api";
import { toast } from "sonner";
import { Map, MapMarker, MarkerContent } from "../ui/map";
import FlyToLocation from "../map/fly-to-location";

type Client = {
  id: number;
  name: string;
  email?: string;
};

type ApartmentFormData = {
  apartment_number: string;
  floor: string;
  living_rooms: string;
  bathrooms: string;
  bedrooms: string;
  outdoor_area: boolean;
};

const INITIAL_FORM_DATA: ApartmentFormData = {
  apartment_number: "",
  floor: "",
  living_rooms: "",
  bathrooms: "",
  bedrooms: "",
  outdoor_area: false,
};

const DEFAULT_MAP_CENTER: LatLng = { lat: 24.7136, lng: 46.6753 };

// Searchable Dropdown Component
interface SearchDropdownProps<T> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  items: T[];
  showDropdown: boolean;
  onToggleDropdown: (show: boolean) => void;
  placeholder: string;
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string | number;
}

function SearchDropdown<T>({
  label,
  value,
  onChange,
  onSelect,
  items,
  showDropdown,
  onToggleDropdown,
  placeholder,
  renderItem,
  getKey,
}: SearchDropdownProps<T>) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onToggleDropdown(true);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (items.length > 0) onToggleDropdown(true);
        }}
        className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
      />

      {showDropdown && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {items.map((item) => (
            <div
              key={getKey(item)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
              onClick={() => onSelect(item)}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Form Input Component
interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "number";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

export default function AddApartment() {
  const [searchClient, setSearchClient] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [searchBuilding, setSearchBuilding] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);

  const [location, setLocation] = useState<LatLng | null>(null);
  const [formData, setFormData] =
    useState<ApartmentFormData>(INITIAL_FORM_DATA);

  const { data: clientsData } = useGetSearchClientsQuery(searchClient, {
    skip: searchClient.length < 2,
  });

  const { data: buildingsData } = useGetBuilidingBySearchQuery(searchBuilding, {
    skip: searchBuilding.length < 2,
  });

  const [addApartmentMutation] = useCreateApartmentMutation();

  // Validate form
  const isFormValid =
    selectedClient !== null &&
    selectedBuilding !== null &&
    formData.apartment_number.trim() !== "" &&
    formData.floor.trim() !== "" &&
    formData.living_rooms.trim() !== "" &&
    formData.bathrooms.trim() !== "" &&
    formData.bedrooms.trim() !== "";

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowClientDropdown(false);
      setShowBuildingDropdown(false);
    };

    if (showClientDropdown || showBuildingDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showClientDropdown, showBuildingDropdown]);

  // Handlers
  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client);
    setSearchClient(client.name);
    setShowClientDropdown(false);
  }, []);

  const handleBuildingSelect = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setSearchBuilding(building.name);
    setShowBuildingDropdown(false);

    if (building.latitude && building.longitude) {
      setLocation({
        lat: parseFloat(building.latitude),
        lng: parseFloat(building.longitude),
      });
    }
  }, []);

  const handleClientSearch = useCallback((value: string) => {
    setSearchClient(value);
    if (!value) setSelectedClient(null);
  }, []);

  const handleBuildingSearch = useCallback((value: string) => {
    setSearchBuilding(value);
    if (!value) setSelectedBuilding(null);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, type, value, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedClient(null);
    setSelectedBuilding(null);
    setSearchClient("");
    setSearchBuilding("");
    setLocation(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedBuilding) {
      toast.error("Please select both a client and building.");
      return;
    }

    const payload = {
      client: selectedClient.id,
      building_id: selectedBuilding.id,
      apartment_number: formData.apartment_number,
      floor: formData.floor,
      living_rooms: Number(formData.living_rooms),
      bathrooms: Number(formData.bathrooms),
      bedrooms: Number(formData.bedrooms),
      outdoor_area: formData.outdoor_area,
      location: selectedBuilding.location || "Unknown",
    };

    try {
      await addApartmentMutation(payload).unwrap();
      toast.success("Apartment created successfully!");
      resetForm();
    } catch (error) {
      toast.error("Failed to create apartment. Please try again.");
      console.error("Error creating apartment:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9.75L12 3l9 6.75M4.5 10.5V20a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V10.5M9 21V13h6v8"
            />
          </svg>
          Add Apartment
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white border-0 rounded-lg max-w-6xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="bg-gradient-to-r from-[#0a078f] via-[#8241ed] to-[#2463ea] bg-clip-text text-transparent font-semibold text-2xl">
            Add New Apartment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left side form */}
            <div className="space-y-4">
              {/* Client Search */}
              <SearchDropdown
                label="Client"
                value={searchClient}
                onChange={handleClientSearch}
                onSelect={handleClientSelect}
                items={clientsData?.results || []}
                showDropdown={showClientDropdown}
                onToggleDropdown={setShowClientDropdown}
                placeholder="Search by name or email..."
                renderItem={(client) => (
                  <>
                    <div className="font-medium text-gray-900">
                      {client.name}
                    </div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </>
                )}
                getKey={(client) => client.id}
              />

              {/* Building Search */}
              <SearchDropdown
                label="Building"
                value={searchBuilding}
                onChange={handleBuildingSearch}
                onSelect={handleBuildingSelect}
                items={buildingsData?.results || []}
                showDropdown={showBuildingDropdown}
                onToggleDropdown={setShowBuildingDropdown}
                placeholder="Search by location or name..."
                renderItem={(building) => (
                  <>
                    <div className="font-medium text-gray-900">
                      {building.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {building.location}, {building.city}
                    </div>
                  </>
                )}
                getKey={(building) => building.id}
              />

              {/* Apartment Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Apartment Number"
                  name="apartment_number"
                  value={formData.apartment_number}
                  onChange={handleChange}
                  placeholder="e.g. A-203"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor *
                  </label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Floor</option>
                    <option value="Basement">Basement</option>
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="Top Floor">Top Floor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Living Rooms"
                  name="living_rooms"
                  type="number"
                  value={formData.living_rooms}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
                <FormInput
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                />
              </div>
              <FormInput
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="e.g. 1"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="outdoor_area"
                  checked={formData.outdoor_area}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Outdoor area</label>
              </div>
            </div>
            {/* Map */}
            <div className="w-full h-48 md:h-full rounded-md border border-gray-300 overflow-hidden">
              {/* <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultZoom={12}
                  defaultCenter={location || DEFAULT_MAP_CENTER}
                  mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                  gestureHandling="greedy"
                  disableDefaultUI
                >
                  {location && (
                    <AdvancedMarker position={location}>
                      <CustomMarker />
                    </AdvancedMarker>
                  )}
                </Map>
              </APIProvider> */}
              <Map
                center={location || DEFAULT_MAP_CENTER}
                zoom={12}
                style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              >
                <FlyToLocation location={location || undefined} />
                {location && (
                  <MapMarker longitude={location.lng} latitude={location.lat}>
                    <MarkerContent>
                      <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
                    </MarkerContent>
                  </MapMarker>
                )}
              </Map>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 px-6 flex justify-end gap-3">
            <Button type="submit" disabled={!isFormValid}>
              + Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
