import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  fetchNotificationsLength,
  selectNotificationCount,
} from "../redux/slices/notificationSlice";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

export function TopBar({ setSidebarOpen }: TopBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const notificationCount = useSelector(selectNotificationCount);

  // ✅ Fetch notification length on mount
  useEffect(() => {
    dispatch(fetchNotificationsLength());

    // ✅ Optional polling every 20 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotificationsLength());
    }, 20000); // adjust as needed

    return () => clearInterval(interval); // cleanup
  }, [dispatch]);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative w-full"></div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-500"
            >
              <Link to="/notification" className="relative text-gray-900">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />

                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#3C5D87] text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                    {notificationCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Separator */}
            <div
              className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
              aria-hidden="true"
            />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="sr-only">Open user menu</span>
                  <User className="h-6 w-6" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {auth.user?.name || "Admin User"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch(logout())}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
