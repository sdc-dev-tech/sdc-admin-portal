import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { checkTokenValidity } from "../redux/slices/authSlice";
import { toast } from "sonner";

function TokenRefresh() {
  const { tokenExpiration } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token validity immediately
    dispatch(checkTokenValidity());

    // Set up interval to check token validity every minute
    const interval = setInterval(() => {
      dispatch(checkTokenValidity());
    }, 60000); // Check every minute

    // Set up warning for token expiration (5 minutes before)
    let warningTimeout: NodeJS.Timeout | null = null;

    if (tokenExpiration) {
      const warningTime = tokenExpiration - 5 * 60 * 1000; // 5 minutes before expiration
      const timeUntilWarning = warningTime - Date.now();

      if (timeUntilWarning > 0) {
        warningTimeout = setTimeout(() => {
          toast.warning(
            "Your session will expire in 5 minutes. Please save your work."
          );
        }, timeUntilWarning);
      }
    }

    return () => {
      clearInterval(interval);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  }, [dispatch, tokenExpiration]);

  return null; // This component doesn't render anything
}

export default TokenRefresh;
