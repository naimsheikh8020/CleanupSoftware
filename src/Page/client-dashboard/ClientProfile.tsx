import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/redux/features/auth/authSlice";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Camera, User } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/redux/store";
import { useUpdateClientAvatarMutation, useUpdateClientProfileMutation } from "@/redux/features/employee/setting/profilesetting.api";

const ClientProfileSettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateClientProfile, { isLoading }] = useUpdateClientProfileMutation()
  const [updateAvatar] = useUpdateClientAvatarMutation()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.prime_phone || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatar_url
      ? `${user.avatar_url}`
      : ""
  );

  let resAvatar: string = "";
  const handlePickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    await updateAvatar({ id: user?.id, file })
      .unwrap()
      .then((result) => {
        console.log(result);
        resAvatar = result.client_profile.avatar;
        toast.success("Avatar updated successfully.");
      })
      .catch(() => toast.error("Failed to update avatar."));
    dispatch(updateUser({ avatar_url: resAvatar }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("Missing client ID.");
      return;
    }

    try {
      const response = await updateClientProfile({
        id: user.id,
        name: profileData.name,
        phone: profileData.phone,
      }).unwrap();
      console.log(response);

      dispatch(updateUser({ name: response.name, prime_phone: response.prime_phone }))

      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      const errorMessage =
        err?.data?.detail || err?.data || "Update failed. Please try again.";
      toast.error(errorMessage);
      console.error("Update failed:", err);
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your name, email, and profile picture.
          </p>
        </div>

        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border">
                <User size={24} className="text-gray-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 cursor-pointer">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickAvatar}
              />
            </label>
          </div>
          <div className="text-xs text-gray-500">JPG/PNG • ~1MB max</div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled={true}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder="+966 5X XXX XXXX."
              value={profileData.phone}
              disabled={isLoading}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileSettingsPage;
