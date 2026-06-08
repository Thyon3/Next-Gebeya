import React, { useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getError } from "@/utils/error";
import axios from "axios";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function Profile() {
  const router = useRouter();
  const { user: session, updateProfile: update } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name);
      setValue("email", session.user.email);
      setProfileImage(session.user.profileImage || "");
    }
  }, [session, setValue]);

  const uploadHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (cloudName && cloudName.trim() !== '') {
        try {
          const { data: signData } = await axios.get("/api/auth/cloudinary-sign");

          const bodyFormData = new FormData();
          bodyFormData.append("file", file);
          bodyFormData.append("signature", signData.signature);
          bodyFormData.append("timestamp", signData.timestamp);
          bodyFormData.append("api_key", signData.apiKey);
          bodyFormData.append("folder", "profile-images");

          const { data } = await axios.post(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
            bodyFormData
          );

          setProfileImage(data.secure_url);
          toast.success("Image uploaded successfully");
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          throw new Error("Cloudinary upload failed, using local storage");
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
          toast.success("Image uploaded successfully");
          setUploadingImage(false);
        };
        reader.onerror = () => {
          toast.error("Failed to read image file");
          setUploadingImage(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err) {
      console.error("Upload error:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success("Image uploaded successfully (stored locally)");
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error("Failed to upload image");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
      return;
    } finally {
      setUploadingImage(false);
    }
  };

  const submitHandler = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      await axios.put("/api/auth/update", {
        name,
        email,
        password,
        profileImage,
      });

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: password || session.user.password,
      });

      await update({
        ...session,
        user: {
          ...session.user,
          name,
          email,
          profileImage,
        },
      });

      toast.success("Profile updated successfully");

      if (result.error) {
        toast.error(result.error);
      }

      setShowPasswordFields(false);
      setValue("password", "");
      setValue("confirmPassword", "");
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Profile - eShop</title>
        <meta name="description" content="Update your profile information" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Modern Profile Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 text-center border-b">
                  <div className="relative inline-block group">
                    <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden mx-auto">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={session?.user?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        session?.user?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <label
                      htmlFor="profile-photo-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mx-auto"
                      style={{ width: '80px', height: '80px', top: 0, left: '50%', transform: 'translateX(-50%)' }}
                    >
                      {uploadingImage ? (
                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={uploadHandler}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-gray-900">
                    {session?.user?.name || "User"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {session?.user?.email}
                  </p>
                </div>

                {/* Navigation Menu */}
                <nav className="p-2">
                  <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </a>
                  <a href="/order-history" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    My Orders
                  </a>
                  <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Wishlist
                  </a>
                  <a href="/compare" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Compare
                  </a>
                </nav>

                {/* Account Status */}
                <div className="p-4 border-t">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Verified</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account Active</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b px-6 py-4">
                  <h1 className="text-xl font-bold text-gray-900">Personal Information</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your personal information and account settings</p>
                </div>

                <form onSubmit={handleSubmit(submitHandler)} className="p-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register("name", {
                          required: "Please enter name",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        id="name"
                        autoFocus
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Please enter email",
                          pattern: {
                            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                            message: "Please enter valid email",
                          },
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        id="email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="border-t pt-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showPasswordFields ? "Cancel" : "Change"}
                      </button>
                    </div>

                    {showPasswordFields && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            {...register("password", {
                              minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                              },
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            id="password"
                            placeholder="Enter new password"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            {...register("confirmPassword", {
                              validate: (value) => {
                                const password = getValues("password");
                                if (password && value !== password) {
                                  return "Passwords do not match";
                                }
                                return true;
                              },
                              minLength: {
                                value: 6,
                                message: "Confirm password must be at least 6 characters",
                              },
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            id="confirmPassword"
                            placeholder="Confirm new password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Additional Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Security Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Tip</h4>
                      <p className="text-xs text-blue-800">
                        Use a strong password with at least 8 characters, including numbers and special characters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900 mb-1">Privacy Protected</h4>
                      <p className="text-xs text-green-800">
                        Your personal information is encrypted and secure. We never share your data with third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

Profile.auth = true;
