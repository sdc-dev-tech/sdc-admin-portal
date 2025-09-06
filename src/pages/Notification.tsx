import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";

import {
  fetchNotifications,
  deleteNotification,
} from "@/redux/slices/notificationSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Bell, ExternalLink } from "lucide-react";
import { Cross2Icon } from "@radix-ui/react-icons";

function Notification() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: notifications, loading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleClearOne = (id: string) => {
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => toast.success("Notification cleared"))
      .catch(() => toast.error("Failed to clear notification"));
  };

  const handleClearAll = async () => {
    const results = await Promise.allSettled(
      notifications.map((n: any) =>
        dispatch(deleteNotification(n._id)).unwrap()
      )
    );

    const failed = results.filter((res) => res.status === "rejected").length;

    if (failed === 0) {
      toast.success("All notifications cleared");
    } else {
      toast.error(`Failed to clear ${failed} notification(s)`);
    }
  };

  const handleNavigate = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Manage all recent updates and alerts.
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Loading notifications...
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No notifications available.
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification._id}
              className="flex justify-between items-center border bg-white shadow-sm hover:shadow-md transition"
            >
              <CardContent
                onClick={() => handleNavigate(notification.order)}
                className="cursor-pointer w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-800 font-medium">
                    {notification.message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(notification.order);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Order
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearOne(notification._id);
                    }}
                  >
                    <Cross2Icon className="h-4 w-4 mr-1" />
                    <span className="sr-only">Clear Notification</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Notification;
