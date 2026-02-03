import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";

import { useLazySearchAllClientQuery } from "@/redux/features/admin/Client-code/getAllClient.api";
import { useLazySearchClientRegionQuery } from "@/redux/features/admin/Client-code/clientCode.api";

// Define a TypeScript interface for the client/apartment object
interface Apartment {
  id: number;
  apartment_code: string;
  apartment_number?: string;
  building_name?: string;
  floor?: string;
  client_name?: string;
  client_email?: string;
  region_name?: string;
  region_id?: number | string;
  client?: number;
  living_rooms?: number;
  bathrooms?: number;
  outdoor_area?: boolean;
  location?: string;
}

export default function RegionEmployeeCode() {
  const [clientSearch, setClientSearch] = useState<string>("");
  const [regionSearch, setRegionSearch] = useState<string>("");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [triggerClientSearch, { data: clientData, isFetching: clientLoading }] =
    useLazySearchAllClientQuery();

  const [triggerRegionSearch, { data: regionData, isFetching: regionLoading }] =
    useLazySearchClientRegionQuery();

  const handleSearch = () => {
    if (clientSearch) triggerClientSearch(clientSearch);
    if (regionSearch) triggerRegionSearch(regionSearch);
  };

  // Support both array and paginated response
  const clientList: Apartment[] = Array.isArray(clientData)
    ? clientData
    : clientData?.results ?? [];

  // Filter based on region search
  const filteredClients = clientList.filter((client) => {
    if (!regionSearch) return true;

    const regionIdStr = String(client.region_id ?? "");
    const regionNameStr = String(client.region_name ?? "").toLowerCase();
    const searchStr = regionSearch.toLowerCase();

    return regionIdStr.includes(searchStr) || regionNameStr.includes(searchStr);
  });

  // Pad ID for display only
  const padMin3 = (value?: number) => {
    if (!value) return "000";
    const str = String(value);
    return str.length >= 3 ? str : str.padStart(3, "0");
  };

  const handleViewDetails = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 grid gap-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-2">Search Client & Region</h2>

      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Search Client Email</label>
            <Input
              placeholder="Type client email"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Search Region</label>
            <Input
              placeholder="Type region name"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            className="w-full rounded-xl"
            onClick={handleSearch}
            disabled={clientLoading || regionLoading}
          >
            {clientLoading || regionLoading ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {filteredClients.length > 0 ? (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apartment Code</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Building Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.apartment_code}</TableCell>
                    <TableCell>{client.client_name || "-"}</TableCell>
                    <TableCell>{client.building_name || "-"}</TableCell>
                    <TableCell>{client.region_name}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(client)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-gray-500">No results found</p>
      )}

      {/* Dialog for Full Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apartment Details</DialogTitle>
          </DialogHeader>
          {selectedApartment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Apartment Code</p>
                  <p className="text-base font-semibold">{selectedApartment.apartment_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Building Name</p>
                  <p className="text-base">{selectedApartment.building_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Apartment Number</p>
                  <p className="text-base">{selectedApartment.apartment_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Floor</p>
                  <p className="text-base">{selectedApartment.floor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Client Name</p>
                  <p className="text-base">{selectedApartment.client_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Client Email</p>
                  <p className="text-base">{selectedApartment.client_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region Name</p>
                  <p className="text-base">{selectedApartment.region_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region ID</p>
                  <p className="text-base">{selectedApartment.region_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Client ID</p>
                  <p className="text-base">{padMin3(selectedApartment.client)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Living Rooms</p>
                  <p className="text-base">{selectedApartment.living_rooms}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                  <p className="text-base">{selectedApartment.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Outdoor Area</p>
                  <p className="text-base">{selectedApartment.outdoor_area ? "Yes" : "No"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base">{selectedApartment.location}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
