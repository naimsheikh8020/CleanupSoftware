import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import type { LatLng } from "@/Types/map.types";
import { MapPin, Plus } from "lucide-react";
import { useCreateBuildingMutation } from "@/redux/features/admin/buildings/building.api";
import { toast } from "sonner";
import { useSearchRegionQuery } from "@/redux/features/admin/regions/regions.api";
import { Map, MapMarker, MarkerContent } from "../ui/map";
import { getAddressFromCoordinates } from "./geocoding-service";
import { MapClickHandler } from "./on-map-click";

type Region = {
  id: number;
  name: string;
};

type BuildingFormData = {
  name: string;
  type: string;
  city: string;
  region: number | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
};

const INITIAL_FORM_DATA: BuildingFormData = {
  name: "",
  type: "residential",
  city: "",
  region: null,
  location: "",
  latitude: null,
  longitude: null,
};

const DEFAULT_MAP_CENTER: LatLng = { lat: 24.7136, lng: 46.6753 };

const BUILDING_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];
interface SearchDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (region: Region) => void;
  items: Region[];
  showDropdown: boolean;
  onToggleDropdown: (show: boolean) => void;
  placeholder?: string;
}

function SearchDropdown({
  label,
  value,
  onChange,
  onSelect,
  items,
  showDropdown,
  onToggleDropdown,
  placeholder = "Search...",
}: SearchDropdownProps) {
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
        placeholder={placeholder}
        className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showDropdown && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
              onClick={() => onSelect(item)}
            >
              <div className="font-medium text-gray-900">{item.name}</div>
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
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
   autoExpand?: boolean;
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoExpand = false,
}: FormInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoExpand && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value, autoExpand]);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && "*"}
      </label>
      {autoExpand ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          ref={textareaRef}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

export default function AddBuilding() {
  const [searchRegion, setSearchRegion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [location, setLocation] = useState<LatLng>(DEFAULT_MAP_CENTER);
  const [formData, setFormData] = useState<BuildingFormData>(INITIAL_FORM_DATA);

  const [createBuilding, { isLoading: isCreating }] =
    useCreateBuildingMutation();
  const { data: regions } = useSearchRegionQuery(searchRegion, {
    skip: searchRegion.length < 2,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowRegionDropdown(false);

    if (showRegionDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showRegionDropdown]);

  // Validate form
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.type.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.region !== null &&
    formData.location.trim() !== "" &&
    formData.latitude !== null &&
    formData.longitude !== null;

  // Handlers
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleRegionSelect = useCallback((region: Region) => {
    setSelectedRegion(region.id);
    setSearchRegion(region.name);
    setFormData((prev) => ({
      ...prev,
      region: region.id,
    }));
    setShowRegionDropdown(false);
  }, []);

  const handleRegionSearch = useCallback((value: string) => {
    setSearchRegion(value);
    if (!value) {
      setSelectedRegion(null);
      setFormData((prev) => ({ ...prev, region: null }));
    }
  }, []);

  const handleMapClick = useCallback(async (e: any) => {
    const lat = e.lat;
    const lng = e.lng;

    setLocation({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Fetch and set address
    const address = await getAddressFromCoordinates(lat, lng);
    //  console.log("Fetched address:", address);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        location: address.address,
        city: address.city,
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setLocation(DEFAULT_MAP_CENTER);
    setSearchRegion("");
    setSelectedRegion(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await createBuilding(formData).unwrap();
      toast.success("Building created successfully!");
      resetForm();
    } catch (error) {
      toast.error("Failed to create building. Please try again.");
      console.error("Error creating building:", error);
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Building
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white border-0 rounded-lg max-w-6xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="bg-gradient-to-r from-[#0a078f] via-[#8241ed] to-[#2463ea] bg-clip-text text-transparent font-semibold text-2xl">
            Add New Building
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left side form */}
            <div className="space-y-4">
              <FormInput
                label="Building Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter building name"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {BUILDING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />

                <SearchDropdown
                  label="Region"
                  value={searchRegion}
                  onChange={handleRegionSearch}
                  onSelect={handleRegionSelect}
                  items={regions?.results || []}
                  showDropdown={showRegionDropdown}
                  onToggleDropdown={setShowRegionDropdown}
                  placeholder="Search region..."
                />
              </div>

              <FormInput
                label="Location / Address"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Click on map to set location"
                required
                autoExpand
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={handleChange}
                />
                <FormInput
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right side map */}
            <div className="w-full h-[500px] rounded-md border border-gray-300 overflow-hidden">
              {/* <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultZoom={12}
                  defaultCenter={location}
                  mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
                  gestureHandling="greedy"
                  disableDefaultUI
                  onClick={handleMapClick}
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
                //  onclick={handleMapClick}
              >
                <MapClickHandler
                  onSelect={setLocation}
                  onPress={handleMapClick}
                />
                {/* <FlyToLocation location={location || undefined} /> */}
                {location && (
                  <MapMarker
                    //   draggable
                    //   onDrag={handleMapClick}
                    longitude={location.lng}
                    latitude={location.lat}
                  >
                    <MarkerContent>
                      {/* <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" /> */}
                      <MapPin fill="blue" color="blue" />
                    </MarkerContent>
                  </MapMarker>
                )}
              </Map>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 px-6 flex justify-end gap-3">
            <Button type="submit" disabled={!isFormValid || isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create Building"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
