import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateClientMutation } from "@/redux/features/admin/users/clients.api";
import { Loader2 } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Button } from '@/Components/ui/button';

interface EditClientProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClientFormData {
  name: string;
  email: string;
  prime_phone: string;
  is_active: boolean;
  location?: string;
  avatar?: string;
}

const EditClient = ({ client, open, onOpenChange }: EditClientProps) => {
  const [updateClient, { isLoading }] = useUpdateClientMutation();

  const form = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      email: '',
      prime_phone: '',
      is_active: true,
      location: '',
      avatar: '',
    },
  });

  // Update form values when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        email: client.email || '',
        prime_phone: client.prime_phone || '',
        is_active: client.is_active ?? true,
        location: client.client_profile?.location || '',
        avatar: client.client_profile?.avatar || '',
      });
    }
  }, [client, form]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        prime_phone: data.prime_phone,
        is_active: data.is_active,
      };

      // If client_profile fields are being updated, include them
      if (data.location || data.avatar) {
        updateData.client_profile = {
          ...(data.location && { location: data.location }),
          ...(data.avatar && { avatar: data.avatar }),
        };
      }

      await updateClient({
        id: client.id,
        body: updateData,
      }).unwrap();

      toast.success("Client updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update client information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="prime_phone"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Avatar URL */}
            {/* <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the URL for the client's profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this client account
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClient;
