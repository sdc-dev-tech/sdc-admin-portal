import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  Tag,
  LogOut,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Users", href: "/users", icon: Users },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Categories", href: "/categories", icon: Tag },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "relative flex w-72 max-w-xs flex-1 flex-col bg-[#3C5D87] pt-5 pb-4 transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="absolute right-0 top-0 pt-2 pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-[#617D9E]"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent location={location} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#3C5D87] px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          </div>
          <SidebarContent location={location} handleLogout={handleLogout} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  location,
  handleLogout,
}: {
  location: { pathname: string };
  handleLogout: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col">
      <ul className="flex flex-1 flex-col gap-y-2">
        {navItems.map((item) => {
          const isVerified =
            location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href));

          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6",
                  isVerified
                    ? "bg-[#617D9E] text-white"
                    : "text-gray-100 hover:bg-[#617D9E] hover:text-white"
                )}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                {item.name}
              </Link>
            </li>
          );
        })}
        <li className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-100 hover:bg-[#617D9E] hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-6 w-6" />
            Log out
          </Button>
        </li>
      </ul>
    </nav>
  );
}
