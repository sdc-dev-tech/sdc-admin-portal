import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchUserById } from "../redux/slices/usersSlice";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Hash } from "lucide-react";

// import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";
import { format } from "date-fns";

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);
  // Filter orders for this user
  const userOrders = useSelector((state: RootState) =>
    state.orders.items.filter((order) => order.userId._id == id!)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>User not found</p>
        <Button className="mt-4" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedUser.name}
          </h1>
          <p className="text-muted-foreground">
            User details and account information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Personal details and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p>{selectedUser.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Registered
                  </p>
                  <p>
                    {format(new Date(selectedUser.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="flex items-center justify-between"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="p-2 max-w-2xl mx-auto bg-white">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Company Profile
                </h2>
                <div className="h-1 w-16 bg-[#3C5D87] rounded-full"></div>
              </div>

              <div className="bg-gradient-to-br from-[#3C5D87]/5 to-[#3C5D87]/10 border border-[#3C5D87]/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Company Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3C5D87] p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedUser.companyName}
                        </h3>
                        {selectedUser.isVerified && (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[#3C5D87] font-medium text-sm">
                        {selectedUser.businessType} Company
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                    <MapPin className="h-5 w-5 text-[#3C5D87] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Business Location
                      </p>
                      <p className="text-gray-900 font-medium">
                        {selectedUser.companyAddress}
                      </p>
                    </div>
                  </div>
                  {/* GST Number */}
                  <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                    <Hash className="h-5 w-5 text-[#3C5D87] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        GST Number
                      </p>
                      <p className="text-gray-900 font-medium font-mono text-sm">
                        {selectedUser.gstNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-[#3C5D87]/10">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Registered on{" "}
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span>Owner: {selectedUser.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                User's purchase history and order status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          #{order._id}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No orders found for this user.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                User's payment transactions and balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order) => (
                      <TableRow key={`payment-${order._id}`}>
                        <TableCell className="font-medium">
                          Payment for Order #{order._id}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.updatedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>TXN-{order._id}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              order.paymentStatus === "refunded"
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {order.paymentStatus === "refunded" ? "-" : ""}$
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No payment history found for this user.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserDetail;
