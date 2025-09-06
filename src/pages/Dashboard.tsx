import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchUsers } from "../redux/slices/usersSlice";
import { fetchOrders } from "../redux/slices/ordersSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { fetchProducts } from "../redux/slices/productsSlice";

const revenueData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
];

//  const orderStatusData

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF0000"];

const topSellingProducts = [
  { name: "iPhone 13 Pro", value: 45 },
  { name: 'MacBook Pro 14"', value: 30 },
  { name: "Samsung Galaxy S21", value: 25 },
  { name: 'Smart LED TV 55"', value: 20 },
  { name: "Men's Classic T-Shirt", value: 15 },
];

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  // const { items: products } = useSelector((state: RootState) => state.products);
  const { totalProducts } = useSelector((state: RootState) => state.products);
  const users = useSelector((state: RootState) => state.users.items);
  const orders = useSelector((state: RootState) => state.orders.items);

  const orderStatusData = [
    "Order Placed",
    "Inprocessing",
    "Warehouse Processing",
    "Admin Stock Review",
    "Approval Pending",
    "Awaiting Invoice",
    "Invoice Verification",
    "Invoice Uploaded",
    "Confirmed",
    "Rework",
    "Packing",
    "Dispatched",
    "Delivered",
  ];

  // Count how many orders exist for each status
  const statusCounts: Record<string, number> = orders.reduce((acc, order) => {
    const status = order.status;
    if (orderStatusData.includes(status)) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Format it for chart
  const formattedStatusData = orderStatusData.map((status) => ({
    name: status,
    value: statusCounts[status] || 0,
  }));

  const pieChartData = formattedStatusData.filter((item) => item.value > 0);

  useEffect(() => {
    // Dispatch all fetch actions when component mounts
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts({})).unwrap(),
          dispatch(fetchUsers({})).unwrap(),
          dispatch(fetchOrders({})).unwrap(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  // Calculate recent orders (last 5)
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store's performance and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground"></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter((order) => order.status === "Order Placed").length}{" "}
              pending orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {/* Items below threshold */}
              Coming soon..
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-7 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                  />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3C5D87"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-7 lg:col-span-4">
          <Tabs defaultValue="orders">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Statistics</CardTitle>
                <TabsList>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="orders" className="mt-0 space-y">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} orders`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="products" className="mt-0 space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSellingProducts}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        scale="band"
                        width={100}
                        tickFormatter={(value) =>
                          value.length > 15
                            ? `${value.substring(0, 15)}...`
                            : value
                        }
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3C5D87" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-7 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Most recent orders placed in your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 space-y-1">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex w-full cursor-pointer "
                    >
                      #{order._id}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")} by{" "}
                      {order.userId.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Order Placed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Dispatched"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Confirmed"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Invoice Uploaded"
                          ? "bg-red-100 text-red-800"
                          : order.status === "Packing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Rework"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {/* ${order.totalAmount.toFixed(2)} */}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
