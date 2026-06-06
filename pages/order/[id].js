import Layout from "@/components/Layout";
import { getError } from "@/utils/error";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useReducer, useContext } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { Store } from "@/utils/Store";
import { formatPrice } from "@/utils/currency";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false, errorPay: action.payload };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false, errorPay: "" };
    default:
      return state;
  }
}

function OrderDetail() {
  const { state } = useContext(Store);
  const { currency } = state;
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { query } = useRouter();
  const orderId = query.id;

  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: "",
    });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get("/api/keys/paypal");
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [order, orderId, paypalDispatch, successPay]);

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(`/api/orders/${order._id}/pay`, details);
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Order is paid successfully");
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }

  function onError(err) {
    toast.error(getError(err));
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className="mb-4 text-3xl font-bold">{`Order ${orderId}`}</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5 mb-5">
              <h2 className="mb-2 text-lg font-bold">Shipping Address</h2>
              <div>
                {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </div>
              {order.isDelivered ? (
                <div className="alert-success">
                  Delivered at {order.deliveredAt}
                </div>
              ) : (
                <div className="alert-error">Not delivered</div>
              )}
            </div>

            <div className="card p-5 mb-5">
              <h2 className="mb-2 text-lg font-bold">Payment Method</h2>
              <div>{order.paymentMethod}</div>
              {order.isPaid ? (
                <div className="alert-success">Paid at {order.paidAt}</div>
              ) : (
                <div className="alert-error">Not paid</div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg font-bold">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="px-5 text-right">Quantity</th>
                    <th className="px-5 text-right">Price</th>
                    <th className="px-5 text-right">Subtotal</th>
                    {order.isPaid && order.isDelivered && (
                      <th className="px-5 text-center">Review</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={item._id || index} className="border-b">
                      <td>
                        {item.slug ? (
                          <Link href={`/product/${item.slug}`}>
                            <span className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={50}
                                height={50}
                                className="rounded-sm"
                              />
                              <span className="ml-3">{item.name}</span>
                            </span>
                          </Link>
                        ) : (
                          <span className="flex items-center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="rounded-sm"
                            />
                            <span className="ml-3">{item.name}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">{formatPrice(item.price, currency)}</td>
                      <td className="p-5 text-right">
                        {formatPrice(item.quantity * item.price, currency)}
                      </td>
                      {order.isPaid && order.isDelivered && (
                        <td className="p-5 text-center">
                          {item.slug ? (
                            <Link href={`/product/${item.slug}#reviews`}>
                              <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors">
                                Write Review
                              </button>
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Product unavailable
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {order.isPaid && order.isDelivered && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Order delivered!</strong> You can now write reviews for the products you purchased.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg font-bold">Order Summary</h2>
              <ul className="space-y-2">
                <li>
                  <div className="flex justify-between">
                    <div>Items</div>
                    <div>{formatPrice(order.itemsPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <div>Tax</div>
                    <div>{formatPrice(order.taxPrice, currency)}</div>
                  </div>
                </li>
                <li>
                  <div className="flex justify-between">
                    <div>Shipping</div>
                    <div>{formatPrice(order.shippingPrice, currency)}</div>
                  </div>
                </li>
                <li className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <div>Total</div>
                    <div className="text-blue-600">{formatPrice(order.totalPrice, currency)}</div>
                  </div>
                </li>
                {!order.isPaid && (
                  <li>
                    {isPending ? (
                      <div>Loading...</div>
                    ) : (
                      <div className="w-full">
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <div>Loading...</div>}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderDetail.auth = true;

export default OrderDetail;
