import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
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
import { Switch } from "@/Components/ui/switch";
import { Textarea } from "@/Components/ui/textarea";
import {
  useAddServiceCategoryMutation,
  useGetServiceCategoriesQuery,
} from "@/redux/features/admin/services/services.api";
import { useAddPlanMutation } from "@/redux/features/admin/plan/plan.api";
import { toast } from "sonner";

type ServiceLineItem = {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  quantity: number;
  total: number;
};

const AddNewPlanForm = () => {
  const [services, setServices] = useState<ServiceLineItem[]>([]);
  const [addCategoryButton, setAddCategoryButton] = useState(false);

  type FormState = {
    name: string;
    plan_code: string;
    interval: string;
    amount: number;
    description: string;
    is_active: boolean;
    category: number | null;
    discount: number;
  };

  const initialFormState: FormState = {
    name: "",
    plan_code: "",
    interval: "month",
    amount: 0,
    description: "",
    is_active: true,
    category: null,
    discount: 0,
  };

  const [formData, setFormData] = useState<FormState>(initialFormState);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { data: categories, isLoading: isCategoriesLoading } =
    useGetServiceCategoriesQuery(undefined);
  const [addCategory, { isLoading: isAddingCategory }] =
    useAddServiceCategoryMutation();
  const [addPlan, { isLoading: addingPlan }] = useAddPlanMutation();

  const addService = () => {
    const newService = {
      id: Date.now(),
      name: "",
      description: "",
      unit_price: 0,
      quantity: 1,
      total: 0,
    };
    setServices([...services, newService]);
  };

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const addNewCategory = async () => {
    try {
      await toast.promise(addCategory({ name: newCategory.name }).unwrap(), {
        loading: "Creating category...",
        success: "Category created successfully",
        error: (err) =>
          `Failed to create category: ${err.data?.message || "Unknown error"}`,
      });
      setNewCategory({ name: "", description: "" });
      setAddCategoryButton(false);
    } catch (error) {
      console.error("Category creation failed:", error);
    }
  };

  const removeService = (id) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const updateService = (id, field, value) => {
    setServices(
      services.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          if (field === "unit_price" || field === "quantity") {
            updated.total = (updated.unit_price || 0) * (updated.quantity || 0);
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setServices([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    const payload = {
      name: formData.name,
      plan_code: formData.plan_code,
      interval: formData.interval,
      amount: Number(formData.amount),
      description: formData.description,
      is_active: formData.is_active,
      category: formData.category ? Number(formData.category) : null,
      discount: Number(formData.discount),
      service_line_items: services.map(({ id, total, ...rest }) => rest),
    };

    try {
      await toast.promise(addPlan(payload).unwrap(), {
        loading: "Adding plan...",
        success: "Plan added successfully",
        error: (err) => {
          if (typeof err === "object") {
            const keys = Object.keys(err.data);
            if (err.data[keys[0]][0]) {
              if (err.data[keys[0]][0] === "This field may not be blank.")
                return `Failed to add plan: ${keys[0]} can't be blank`;
            }
            return `Failed to add plan.`;
          }
        },
      });
      handleCancel();
    } catch (error) {
      console.error("Plan creation failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold mb-6">Add New Plan</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Basic Plan Information */}
        <div className="border rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">
            Basic Plan Information
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Plan Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Yearly Standard"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan_code" className="text-sm">
                Plan Code
              </Label>
              <Input
                id="plan_code"
                placeholder="e.g. 107"
                value={formData.plan_code}
                onChange={(e) => handleInputChange("plan_code", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. High-speed internet plan with 24/7 support"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">
              Category
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select
                  value={formData.category?.toString() || ""}
                  onValueChange={(value) => {
                    handleInputChange("category", Number(value));
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      categories?.map(
                        (category: { id: number; name: string }) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            <div>{category.name}</div>
                          </SelectItem>
                        )
                      )
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAddCategoryButton(true)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {addCategoryButton && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter new category name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({
                        name: e.target.value,
                        description: "",
                      })
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addNewCategory}
                    disabled={isAddingCategory}
                    size="sm"
                  >
                    {isAddingCategory ? "Adding..." : "Add"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddCategoryButton(false);
                      setNewCategory({
                        name: "",
                        description: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Pricing & Duration */}
        <div className="border rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">Pricing & Duration</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-sm">
                Interval
              </Label>
              <Select
                value={formData.interval}
                onValueChange={(value) => handleInputChange("interval", value)}
              >
                <SelectTrigger id="interval">
                  <SelectValue placeholder="Select interval..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  {/* <SelectItem value="year">Yearly</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">
                Price
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  handleInputChange("amount", Number(e.target.value))
                }
                className="flex-1"
                min="0"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-sm">
                Discount (%)
              </Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.discount}
                onChange={(e) =>
                  handleInputChange("discount", Number(e.target.value))
                }
              />
            </div>
          <div className="space-y-2 mt-4">
            <Label className="text-sm">Status</Label>
            <div className="flex items-center w-fit gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  handleInputChange("is_active", checked)
                }
              />
              <span className="text-sm text-gray-600">
                {formData.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          </div>
        </div>
      </div>
      {/* Services Included */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Service Line Items</h2>
          <Button onClick={addService} type="button" size="sm">
            <Plus size={16} className="mr-1" />
            Add Service
          </Button>
        </div>
        <div className="overflow-x-auto">
          {services.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No services added. Click "Add Service" to include services.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b grid grid-cols-2 md:grid-cols-7 gap-2">
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Service Name
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Unit Price
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Quantity
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Line Total
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b grid grid-cols-2 md:grid-cols-7 gap-2">
                    <td className="py-2 px-2">
                      <Input
                        placeholder="Name"
                        value={service.name}
                        onChange={(e) =>
                          updateService(service.id, "name", e.target.value)
                        }
                        className="w-8/12"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        placeholder="Optional description"
                        value={service.description}
                        onChange={(e) =>
                          updateService(
                            service.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-11/12"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={service.unit_price}
                        onChange={(e) =>
                          updateService(
                            service.id,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        value={service.quantity}
                        onChange={(e) =>
                          updateService(
                            service.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16"
                      />
                    </td>
                    <td className="py-2 px-2 font-medium">
                      ${service.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={addingPlan}>
            Create Plan
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddNewPlanForm;
