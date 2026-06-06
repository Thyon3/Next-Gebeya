import Cookies from "js-cookie";
import { createContext, useReducer } from "react";
import { getDefaultCurrency } from "./currency";

export const Store = createContext();

const initialState = {
  cart: Cookies.get("cart")
    ? JSON.parse(Cookies.get("cart"))
    : { cartItems: [], shippingAddress: {}, paymentMethod: "", coupon: null },
  wishlist: Cookies.get("wishlist")
    ? JSON.parse(Cookies.get("wishlist"))
    : { wishlistItems: [] },
  compare: Cookies.get("compare")
    ? JSON.parse(Cookies.get("compare"))
    : { compareItems: [] },
  currency: getDefaultCurrency(),
  darkMode: Cookies.get("darkMode") === "ON",
  fontSize: Cookies.get("fontSize") || "medium", // small, medium, large
};

function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item.slug === newItem.slug
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.name === existItem.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem];

      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item.slug !== action.payload.slug
      );
      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_RESET": {
      return {
        ...state,
        cart: {
          cartItems: [],
          shippingAddress: { location: {} },
          paymentMethod: "",
          coupon: null,
        },
      };
    }

    case "CART_CLEAR_ITEMS": {
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }

    case "SAVE_SHIPPING_ADDRESS": {
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            ...action.payload,
          },
        },
      };
    }

    case "SAVE_PAYMENT_METHOD": {
      return {
        ...state,
        cart: {
          ...state.cart,
          paymentMethod: action.payload,
        },
      };
    }

    case "SET_CURRENCY": {
      return {
        ...state,
        currency: action.payload,
      };
    }

    case "WISHLIST_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.wishlist.wishlistItems.find(
        (item) => item.slug === newItem.slug
      );
      
      if (existItem) {
        return state; // Item already in wishlist
      }
      
      const wishlistItems = [...state.wishlist.wishlistItems, newItem];
      Cookies.set("wishlist", JSON.stringify({ wishlistItems }));
      return { ...state, wishlist: { wishlistItems } };
    }

    case "WISHLIST_REMOVE_ITEM": {
      const wishlistItems = state.wishlist.wishlistItems.filter(
        (item) => item.slug !== action.payload.slug
      );
      Cookies.set("wishlist", JSON.stringify({ wishlistItems }));
      return { ...state, wishlist: { wishlistItems } };
    }

    case "WISHLIST_CLEAR": {
      Cookies.remove("wishlist");
      return {
        ...state,
        wishlist: { wishlistItems: [] },
      };
    }

    case "COMPARE_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.compare.compareItems.find(
        (item) => item.slug === newItem.slug
      );
      
      if (existItem) {
        return state; // Item already in comparison
      }

      // Limit to 4 products for comparison
      if (state.compare.compareItems.length >= 4) {
        return state; // Maximum comparison limit reached
      }
      
      const compareItems = [...state.compare.compareItems, newItem];
      Cookies.set("compare", JSON.stringify({ compareItems }));
      return { ...state, compare: { compareItems } };
    }

    case "COMPARE_REMOVE_ITEM": {
      const compareItems = state.compare.compareItems.filter(
        (item) => item.slug !== action.payload.slug
      );
      Cookies.set("compare", JSON.stringify({ compareItems }));
      return { ...state, compare: { compareItems } };
    }

    case "COMPARE_CLEAR": {
      Cookies.remove("compare");
      return {
        ...state,
        compare: { compareItems: [] },
      };
    }

    case "CART_APPLY_COUPON": {
      const updatedCart = {
        ...state.cart,
        coupon: action.payload,
      };
      Cookies.set("cart", JSON.stringify(updatedCart));
      return {
        ...state,
        cart: updatedCart,
      };
    }

    case "CART_REMOVE_COUPON": {
      const updatedCart = {
        ...state.cart,
        coupon: null,
      };
      Cookies.set("cart", JSON.stringify(updatedCart));
      return {
        ...state,
        cart: updatedCart,
      };
    }

    case "DARK_MODE_ON": {
      Cookies.set("darkMode", "ON");
      return { ...state, darkMode: true };
    }

    case "DARK_MODE_OFF": {
      Cookies.set("darkMode", "OFF");
      return { ...state, darkMode: false };
    }

    case "SET_FONT_SIZE": {
      Cookies.set("fontSize", action.payload);
      return { ...state, fontSize: action.payload };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
