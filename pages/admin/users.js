import AdminLayout from "@/components/AdminLayout";
import { getError } from "@/utils/error";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import { toast } from "react-toastify";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, users: action.payload, error: "" };
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

export default function AdminUsers() {
  const [{ loading, error, users, successDelete, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      users: [],
      error: "",
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/users`);
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

  const deleteHandler = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/users/${userId}`);
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("User deleted successfully");
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(getError(err));
    }
  };

  return (
    <AdminLayout title="Users Management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        {loadingDelete && <div className="text-gray-600 dark:text-gray-400">Deleting...</div>}
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="px-5 text-left">ID</th>
                <th className="px-5 text-left">NAME</th>
                <th className="px-5 text-left">EMAIL</th>
                <th className="px-5 text-left">ADMIN</th>
                <th className="px-5 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-5">{user._id.substring(20, 24)}</td>
                  <td className="p-5">{user.name}</td>
                  <td className="p-5">{user.email}</td>
                  <td className="p-5">
                    {user.isAdmin ? (
                      <span className="text-green-600 font-semibold">YES</span>
                    ) : (
                      <span className="text-gray-600">NO</span>
                    )}
                  </td>
                  <td className="p-5">
                    <Link
                      href={`/admin/user/${user._id}`}
                      className="default-button mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteHandler(user._id)}
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

AdminUsers.auth = { adminOnly: true };
