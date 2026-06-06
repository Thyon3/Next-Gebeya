import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

export default function AdminProductEdit() {
  const { query } = useRouter();
  const productId = query.id;
  const isNewProduct = productId === "new";
  const router = useRouter();

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: !isNewProduct,
      error: "",
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const images = watch("images") || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        dispatch({ type: "FETCH_SUCCESS" });
        setValue("name", data.name);
        setValue("slug", data.slug);
        setValue("price", data.price);
        setValue("image", data.image);
        setValue("images", data.images || []);
        setValue("category", data.category);
        setValue("brand", data.brand);
        setValue("brandLogo", data.brandLogo || "");
        setValue("countInStock", data.countInStock);
        setValue("soldCount", data.soldCount || 0);
        setValue("description", data.description);
        setValue("isFeatured", data.isFeatured);
        setValue("banner", data.banner);
        setValue("isNewArrival", data.isNewArrival || false);
        setValue("isFlashSale", data.isFlashSale || false);
        setValue("flashSalePrice", data.flashSalePrice || "");
        setValue("flashSaleEndDate", data.flashSaleEndDate ? new Date(data.flashSaleEndDate).toISOString().slice(0, 16) : "");
        setValue("discountPercentage", data.discountPercentage || 0);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!isNewProduct) {
      fetchData();
    }
  }, [productId, setValue, isNewProduct]);

  const uploadHandler = async (e, imageField = "image") => {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary is not configured. Please enter image URL directly in the text field above.");
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      
      console.log('=== UPLOAD HANDLER ===');
      console.log('Requesting signature from /api/admin/cloudinary-sign');
      
      const {
        data: { signature, timestamp },
      } = await axios.get("/api/admin/cloudinary-sign");
      
      console.log('✓ Signature received');

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      
      console.log('Uploading to Cloudinary...');
      const { data } = await axios.post(url, formData);
      
      dispatch({ type: "UPLOAD_SUCCESS" });
      setValue(imageField, data.secure_url);
      toast.success("File uploaded successfully");
      console.log('✓ Upload complete:', data.secure_url);
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      console.error('=== UPLOAD ERROR ===');
      console.error('Error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(getError(err));
    }
  };

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    image,
    images,
    brand,
    brandLogo,
    countInStock,
    description,
    isFeatured,
    banner,
    isNewArrival,
    isFlashSale,
    flashSalePrice,
    flashSaleEndDate,
    discountPercentage,
  }) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('brandLogo value:', brandLogo);
      console.log('images value:', images);
      
      const payload = {
        name,
        slug,
        price,
        category,
        image,
        images: images || [],
        brand,
        brandLogo: brandLogo || "",
        countInStock,
        description,
        isFeatured,
        banner: banner || "",
        isNewArrival,
        isFlashSale,
        flashSalePrice: flashSalePrice || null,
        flashSaleEndDate: flashSaleEndDate || null,
        discountPercentage: discountPercentage || 0,
      };
      
      console.log('Payload being sent:', JSON.stringify(payload, null, 2));
      
      if (isNewProduct) {
        // Create new product
        await axios.post(`/api/admin/products`, payload);
        toast.success("Product created successfully");
      } else {
        // Update existing product
        const { data } = await axios.put(`/api/admin/products/${productId}`, payload);
        
        // Show special message if product was restocked
        if (data.restocked) {
          toast.success("Product updated and restock notifications sent!", {
            autoClose: 5000,
          });
        } else {
          toast.success("Product updated successfully");
        }
      }
      
      dispatch({ type: "UPDATE_SUCCESS" });
      router.push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const addImageUrl = () => {
    const currentImages = images || [];
    setValue("images", [...currentImages, ""]);
  };

  const removeImageUrl = (index) => {
    const currentImages = images || [];
    setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index, value) => {
    const currentImages = [...images];
    currentImages[index] = value;
    setValue("images", currentImages);
  };

  return (
    <AdminLayout title={isNewProduct ? "Create Product" : `Edit Product ${productId}`}>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-3xl font-bold">
                {isNewProduct ? "Create Product" : `Edit Product ${productId}`}
              </h1>
              
              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  autoFocus
                  {...register("name", {
                    required: "Please enter name",
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="slug">Slug</label>
                <input
                  type="text"
                  className="w-full"
                  id="slug"
                  {...register("slug", {
                    required: "Please enter slug",
                  })}
                />
                {errors.slug && (
                  <div className="text-red-500">{errors.slug.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full"
                  id="price"
                  {...register("price", {
                    required: "Please enter price",
                  })}
                />
                {errors.price && (
                  <div className="text-red-500">{errors.price.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  className="w-full"
                  id="image"
                  placeholder="Enter image URL (e.g., https://images.unsplash.com/...)"
                  {...register("image", {
                    required: "Please enter image URL",
                  })}
                />
                {errors.image && (
                  <div className="text-red-500">{errors.image.message}</div>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  You can use image URLs from Unsplash, Imgur, or any other image hosting service
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="imageFile">Upload Image (Cloudinary)</label>
                <input
                  type="file"
                  className="w-full"
                  id="imageFile"
                  onChange={uploadHandler}
                />
                {loadingUpload && <div>Uploading...</div>}
                {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Cloudinary not configured. Please enter image URL directly above.
                  </p>
                )}
              </div>

              {/* Additional Images Gallery */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold">Additional Images (for Quick View Gallery)</label>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    + Add Image
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add multiple product images to display in the quick view gallery
                </p>
                
                {images && images.length > 0 ? (
                  <div className="space-y-2">
                    {images.map((img, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          placeholder={`Image URL ${index + 1}`}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-600 hover:text-red-800 px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No additional images added. Click "Add Image" to add gallery images.
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  className="w-full"
                  id="category"
                  {...register("category", {
                    required: "Please enter category",
                  })}
                />
                {errors.category && (
                  <div className="text-red-500">{errors.category.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  className="w-full"
                  id="brand"
                  {...register("brand", {
                    required: "Please enter brand",
                  })}
                />
                {errors.brand && (
                  <div className="text-red-500">{errors.brand.message}</div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="brandLogo">Brand Logo URL (Optional)</label>
                <input
                  type="text"
                  className="w-full"
                  id="brandLogo"
                  placeholder="Enter brand logo URL (e.g., https://logo.clearbit.com/apple.com)"
                  {...register("brandLogo")}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional: Add a brand logo URL to display in the brand showcase
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="countInStock">Count In Stock</label>
                <input
                  type="number"
                  className="w-full"
                  id="countInStock"
                  {...register("countInStock", {
                    required: "Please enter count in stock",
                  })}
                />
                {errors.countInStock && (
                  <div className="text-red-500">
                    {errors.countInStock.message}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="soldCount">Sold Count</label>
                <input
                  type="number"
                  className="w-full"
                  id="soldCount"
                  {...register("soldCount", {
                    min: { value: 0, message: "Sold count cannot be negative" },
                  })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Number of units sold (auto-increments on paid orders)
                </p>
                {errors.soldCount && (
                  <div className="text-red-500">
                    {errors.soldCount.message}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <textarea
                  className="w-full"
                  id="description"
                  rows="4"
                  {...register("description", {
                    required: "Please enter description",
                  })}
                />
                {errors.description && (
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="isFeatured" className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    id="isFeatured"
                    {...register("isFeatured")}
                  />
                  Is Featured
                </label>
              </div>

              <div className="mb-4">
                <label htmlFor="banner">Banner Image URL (for featured products)</label>
                <input
                  type="text"
                  className="w-full"
                  id="banner"
                  placeholder="Enter banner image URL (optional)"
                  {...register("banner")}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Banner image for hero carousel (recommended: 1920x600px)
                </p>
              </div>

              {/* Hero Section Enhancement Fields */}
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Hero Section Settings</h3>
                
                <div className="mb-4">
                  <label htmlFor="isNewArrival" className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      id="isNewArrival"
                      {...register("isNewArrival")}
                    />
                    <span className="font-medium">Mark as New Arrival</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Shows "NEW" badge on hero carousel
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="isFlashSale" className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      id="isFlashSale"
                      {...register("isFlashSale")}
                    />
                    <span className="font-medium">Enable Flash Sale</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    Shows countdown timer and special pricing
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="flashSalePrice">Flash Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full"
                    id="flashSalePrice"
                    placeholder="Enter flash sale price (optional)"
                    {...register("flashSalePrice")}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Special price during flash sale (leave empty to use discount percentage)
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="flashSaleEndDate">Flash Sale End Date</label>
                  <input
                    type="datetime-local"
                    className="w-full"
                    id="flashSaleEndDate"
                    {...register("flashSaleEndDate")}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    When the flash sale ends (shows countdown timer)
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="discountPercentage">Discount Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full"
                    id="discountPercentage"
                    placeholder="Enter discount percentage (0-100)"
                    {...register("discountPercentage")}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Shows discount badge (e.g., "50% OFF")
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="bannerFile">Upload Banner (Cloudinary)</label>
                <input
                  type="file"
                  className="w-full"
                  id="bannerFile"
                  onChange={(e) => uploadHandler(e, "banner")}
                />
                {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Cloudinary not configured. Please enter banner URL directly above.
                  </p>
                )}
              </div>

              <div className="mb-4 flex justify-between">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? "Loading..." : isNewProduct ? "Create" : "Update"}
                </button>
                <Link href="/admin/products">
                  <button type="button" className="default-button">
                    Back
                  </button>
                </Link>
              </div>
            </form>
          )}
    </AdminLayout>
  );
}

AdminProductEdit.auth = { adminOnly: true };
