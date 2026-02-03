import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { useAddClientMutation } from "@/redux/features/Client/client.api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ClientFormData {
  name: string;
  email: string;
  prime_phone: string;
  client_profile: {
    avatar: null;
    location: string;
    birth_date: string;
  };
}

export const AddClient = () => {
  const [addClient, { isLoading }] = useAddClientMutation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    prime_phone: "",
    client_profile: {
      avatar: null,
      location: "",
      birth_date: "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === "location" || field === "birth_date") {
      setFormData((prev) => ({
        ...prev,
        client_profile: {
          ...prev.client_profile,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      prime_phone: "",
      client_profile: {
        avatar: null,
        location: "",
        birth_date: "",
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.prime_phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await toast.promise(addClient(formData).unwrap(), {
        loading: "Creating client...",
        success: () => {
          resetForm();
          setOpen(false);
          return "Client created successfully";
        },
        error: (err) => {
          return err?.data?.message || "Failed to create client";
        },
      });
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-0 rounded-lg max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="client@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="prime_phone" className="text-sm font-medium text-gray-700">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="prime_phone"
                value={formData.prime_phone}
                onChange={(e) => handleInputChange("prime_phone", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="+8801767125623"
                required
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.client_profile.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Chittagong"
              />
            </div>

            {/* Birth Date */}
            <div className="grid grid-cols-1 gap-2 col-span-2">
              <label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
                Birth Date
              </label>
              <input
                type="date"
                id="birth_date"
                value={formData.client_profile.birth_date}
                onChange={(e) => handleInputChange("birth_date", e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
