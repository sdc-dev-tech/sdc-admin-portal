import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import usersReducer from "./slices/usersSlice";
import ordersReducer from "./slices/ordersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    notifications: notificationReducer,
    users: usersReducer,
    orders: ordersReducer,
    categories: categoriesReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
