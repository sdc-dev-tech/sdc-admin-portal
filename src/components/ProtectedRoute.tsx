import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect } from "react";
import { checkTokenValidity } from "../redux/slices/authSlice";

function ProtectedRoute() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Check token validity on component mount and route changes
  useEffect(() => {
    dispatch(checkTokenValidity());
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
