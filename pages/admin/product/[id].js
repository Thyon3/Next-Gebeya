import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Image from "next/image";

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

  const uploadHandler = async (e, imageField = "image", index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary is not configured.");
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    console.log('Uploading to Cloudinary:', url);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });

      const { data: signData } = await axios.get("/api/admin/cloudinary-sign");
      const { signature, timestamp } = signData;

      const formData = new FormData();
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("file", file);

      const { data } = await axios.post(url, formData);

      dispatch({ type: "UPLOAD_SUCCESS" });

      if (index !== null && imageField === "images") {
        updateImageUrl(index, data.secure_url);
      } else {
        setValue(imageField, data.secure_url);
      }

      toast.success("File uploaded successfully");
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      toast.error(getError(err));
      console.error("Upload error:", err);
    }
  };

  const images = watch("images") || [];
  const mainImage = watch("image");
  const bannerImage = watch("banner");

  const addImageUrl = () => {
    setValue("images", [...images, ""]);
  };

  const removeImageUrl = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setValue("images", newImages);
  };

  const updateImageUrl = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setValue("images", newImages);
  };

  const submitHandler = async (formData) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      if (isNewProduct) {
        await axios.post(`/api/admin/products`, formData);
        toast.success("Product created successfully");
      } else {
        await axios.put(`/api/admin/products/${productId}`, formData);
        toast.success("Product updated successfully");
      }
      dispatch({ type: "UPDATE_SUCCESS" });
      router.push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
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
          className="mx-auto max-w-screen-md pb-20"
          onSubmit={handleSubmit(submitHandler)}
        >
          <h1 className="mb-6 text-3xl font-black tracking-tight text-gray-900 border-b pb-4">
            {isNewProduct ? "Create New Product" : `Edit Product: ${productId}`}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  autoFocus
                  {...register("name", { required: "Please enter name" })}
                />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name.message}</div>}
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  className="w-full"
                  id="slug"
                  {...register("slug", { required: "Please enter slug" })}
                />
                {errors.slug && <div className="text-red-500 text-xs mt-1">{errors.slug.message}</div>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-bold mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full"
                  id="price"
                  {...register("price", { required: "Please enter price" })}
                />
                {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price.message}</div>}
              </div>

              <div>
                <label htmlFor="countInStock" className="block text-sm font-bold mb-1">Stock Quantity</label>
                <input
                  type="number"
                  className="w-full"
                  id="countInStock"
                  {...register("countInStock", { required: "Please enter count in stock" })}
                />
                {errors.countInStock && <div className="text-red-500 text-xs mt-1">{errors.countInStock.message}</div>}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Product Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="image" className="block text-sm font-bold mb-1">Main Image URL</label>
                <input
                  type="text"
                  className="w-full mb-3"
                  id="image"
                  {...register("image", { required: "Please enter image URL" })}
                />

                <label className="block text-sm font-bold mb-1">Upload to Cloudinary</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    onChange={(e) => uploadHandler(e, "image")}
                  />
                  {loadingUpload && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-200 rounded-xl bg-white overflow-hidden aspect-square">
                {mainImage ? (
                  <div className="relative w-full h-full">
                    <Image src={mainImage} alt="Preview" fill className="object-contain" unoptimized />
                  </div>
                ) : (
                  <div className="text-gray-300 text-center">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] uppercase font-bold mt-2 block">No Preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images Gallery */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold">Gallery Images</label>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm"
                >
                  + Add Image
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-xl flex gap-3 shadow-sm group">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                      {img ? <Image src={img} alt={`Gallery ${index}`} fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-gray-200 text-lg">🖼️</div>}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="Image URL"
                        className="w-full text-xs py-1"
                      />
                      <div className="flex items-center justify-between">
                        <input
                          type="file"
                          className="text-[10px] w-24"
                          onChange={(e) => uploadHandler(e, "images", index)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="category" className="block text-sm font-bold mb-1">Category</label>
              <input
                type="text"
                className="w-full"
                id="category"
                {...register("category", { required: "Please enter category" })}
              />
              {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category.message}</div>}
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-bold mb-1">Brand</label>
              <input
                type="text"
                className="w-full"
                id="brand"
                {...register("brand", { required: "Please enter brand" })}
              />
              {errors.brand && <div className="text-red-500 text-xs mt-1">{errors.brand.message}</div>}
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="description" className="block text-sm font-bold mb-1">Description</label>
            <textarea
              className="w-full"
              id="description"
              rows="4"
              {...register("description", { required: "Please enter description" })}
            />
            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description.message}</div>}
          </div>

          {/* Banner Section */}
          <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="isFeatured" {...register("isFeatured")} />
              <label htmlFor="isFeatured" className="text-sm font-bold cursor-pointer">Feature on Hero Carousel</label>
            </div>

            {watch("isFeatured") && (
              <div className="animate-slideDown">
                <label htmlFor="banner" className="block text-sm font-bold mb-1">Banner Image URL</label>
                <input type="text" className="w-full mb-3" id="banner" {...register("banner")} />

                <div className="flex gap-6 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">Upload Banner</label>
                    <input
                      type="file"
                      className="w-full text-sm"
                      onChange={(e) => uploadHandler(e, "banner")}
                    />
                  </div>
                  <div className="w-48 h-20 relative border border-gray-200 rounded-lg bg-white overflow-hidden flex-shrink-0">
                    {bannerImage ? <Image src={bannerImage} alt="Banner Preview" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-gray-200">No Banner</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flash Sale Section */}
          <div className="mb-8 p-6 bg-red-50/50 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <input type="checkbox" id="isFlashSale" {...register("isFlashSale")} />
              <label htmlFor="isFlashSale" className="text-sm font-bold cursor-pointer">Enable Flash Sale</label>
            </div>

            {watch("isFlashSale") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideDown">
                <div>
                  <label htmlFor="flashSalePrice" className="block text-sm font-bold mb-1">Flash Sale Price</label>
                  <input type="number" step="0.01" className="w-full" id="flashSalePrice" {...register("flashSalePrice")} />
                </div>
                <div>
                  <label htmlFor="flashSaleEndDate" className="block text-sm font-bold mb-1">Flash Sale End Date</label>
                  <input type="datetime-local" className="w-full" id="flashSaleEndDate" {...register("flashSaleEndDate")} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/admin/products" className="px-6 py-2 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors">
              Cancel
            </Link>
            <button
              disabled={loadingUpdate}
              className="px-8 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loadingUpdate ? "Saving..." : isNewProduct ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

AdminProductEdit.auth = { adminOnly: true };
