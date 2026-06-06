import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { SkeletonTable } from "@/components/skeletons";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, products: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function AdminProducts() {
  const router = useRouter();
  const [
    { loading, error, products, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: "",
    successDelete: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/products`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const createHandler = () => {
    router.push(`/admin/product/new`);
  };

  const deleteHandler = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/products/${productId}`);
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("Product deleted successfully");
    } catch (error) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(getError(error));
    }
  };

  return (
    <AdminLayout title="Products Management">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
        <div className="flex items-center gap-3">
          {loadingDelete && <div className="text-gray-600 dark:text-gray-400">Deleting...</div>}
          <button
            onClick={createHandler}
            className="primary-button"
          >
            Create Product
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={10} columns={7} />
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="px-5 text-left">ID</th>
                <th className="px-5 text-left">NAME</th>
                <th className="px-5 text-left">PRICE</th>
                <th className="px-5 text-left">CATEGORY</th>
                <th className="px-5 text-left">STOCK</th>
                <th className="px-5 text-left">RATING</th>
                <th className="px-5 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="p-5">{product._id.substring(20, 24)}</td>
                  <td className="p-5">{product.name}</td>
                  <td className="p-5">${product.price}</td>
                  <td className="p-5">{product.category}</td>
                  <td className="p-5">{product.countInStock}</td>
                  <td className="p-5">{product.rating}</td>
                  <td className="p-5">
                    <Link
                      href={`/admin/product/${product._id}`}
                      className="default-button mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteHandler(product._id)}
                      className="default-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

AdminProducts.auth = { adminOnly: true };
