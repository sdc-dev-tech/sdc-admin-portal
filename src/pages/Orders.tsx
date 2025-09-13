import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchOrders, updateOrderStatus } from "../redux/slices/ordersSlice";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const orderStatusOptions = [
  { value: "all", label: "All Orders" },
  { value: "Order Placed", label: "Order Placed" },
  { value: "Invoice Uploaded", label: "Invoice Uploaded" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Rework", label: "Rework" },
  { value: "Packing", label: "Packing" },
  { value: "Dispatched", label: "Dispatched" },
  { value: "Delivered", label: "Delivered" },
];

function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: orders,
    allItems: allOrders,
    loading,
    totalPages,
    totalOrders,
  } = useSelector((state: RootState) => state.orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPageState, setCurrentPageState] = useState(1);
    const [pageSize, setPageSize] = useState(10);


  // Determine if we're in search/filter mode
  const isSearchOrFilterActive =
    searchTerm.trim() !== "" || statusFilter !== "all";

  // Use allOrders when searching/filtering, otherwise use paginated orders
  const ordersToShow = isSearchOrFilterActive ? allOrders : orders;

  // Fetch orders based on whether we're searching/filtering or not
  useEffect(() => {
    if (isSearchOrFilterActive) {
      // Fetch all orders when search/filter is active
      dispatch(fetchOrders({})); // No page/limit params
    } else {
      // Fetch paginated orders when browsing normally
      dispatch(fetchOrders({ page: currentPageState, limit: pageSize }));
    }
  }, [dispatch, currentPageState, isSearchOrFilterActive, pageSize]);

  // Reset to first page when starting a search/filter
  useEffect(() => {
    if (isSearchOrFilterActive) {
      setCurrentPageState(1);
    }
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status: newStatus })
      ).unwrap();

      // Refresh the appropriate order list after status update
      if (isSearchOrFilterActive) {
        dispatch(fetchOrders({})); // Fetch all orders
      } else {
        dispatch(fetchOrders({ page: currentPageState, limit: 10 }));
      }

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPageState(page);
  };

  const handlePrevPage = () => {
    if (currentPageState > 1) {
      setCurrentPageState(currentPageState - 1);
    }
  };

  const handleNextPage = () => {
    if (totalPages && currentPageState < totalPages) {
      setCurrentPageState(currentPageState + 1);
    }
  };

  // Apply search and filter to the orders
  const filteredOrders = ordersToShow.filter((order) => {
    console.log({ order });
    const matchesSearch =
      order?._id?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      order?.status?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      order?.userId?.name.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      order?.items.some((item) =>
        item?.productName?.toLowerCase().includes(searchTerm?.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      order?.status?.toLowerCase() === statusFilter?.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Placed":
        return "bg-blue-100 text-blue-800";
      case "Invoice Uploaded":
        return "bg-purple-100 text-purple-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Rework":
        return "bg-red-100 text-red-800";
      case "Packing":
        return "bg-yellow-100 text-yellow-800";
      case "Dispatched":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate page numbers for pagination (only show when not searching/filtering)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 3;

    if (!totalPages || isSearchOrFilterActive) return pages;

    let startPage = Math.max(
      1,
      currentPageState - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Clear search and filter
  const clearSearchAndFilter = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders
          {isSearchOrFilterActive ? (
            <span className="ml-2">
              ({filteredOrders.length} filtered results)
            </span>
          ) : (
            totalOrders > 0 && (
              <span className="ml-2">({totalOrders} total orders)</span>
            )
          )}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {  (statusFilter === "all" && searchTerm === "" ) && (
  <Select
    value={String(pageSize)}
    onValueChange={(val) => setPageSize(Number(val))}
  >
    <SelectTrigger className="w-[120px]">
      <SelectValue placeholder="Items per page" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 per page</SelectItem>
      <SelectItem value="20">20 per page</SelectItem>
      <SelectItem value="50">50 per page</SelectItem>
      <SelectItem value="100">100 per page</SelectItem>
    </SelectContent>
  </Select>
)}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSearchOrFilterActive && (
            <Button
              variant="outline"
              onClick={clearSearchAndFilter}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {isSearchOrFilterActive
                    ? "No orders found matching your search criteria."
                    : "No orders found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex w-full cursor-pointer"
                    >
                      {order.orderId}
                    </Link>
                  </TableCell>
                  <TableCell>{order.userId.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`px-2 py-1 text-xs rounded-full inline-block ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/orders/${order._id}`}
                            className="flex w-full cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>

                        {![
                          "Order Placed",
                          "Warehouse Processing",
                          "Admin Stock Review",
                          "Approval Pending",
                          "Awaiting Invoice",
                          "Invoice Verification",
                          "Delivered",
                        ].includes(order.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            {[
                              "Confirmed",
                              "Packing",
                              "Dispatched",
                              "Delivered",
                            ].map((status) => {
                              const isInvoiceUploaded =
                                status === "Invoice Uploaded";

                              return isInvoiceUploaded ? (
                                <Link
                                  key={status}
                                  to={`/orders/${order._id}`}
                                  className="flex w-full cursor-pointer"
                                >
                                  <DropdownMenuItem>
                                    <div
                                      className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                                        status
                                      )}`}
                                    />
                                    {status}
                                  </DropdownMenuItem>
                                </Link>
                              ) : (
                                <DropdownMenuItem
                                  key={status}
                                  disabled={order.status === status}
                                  onClick={() =>
                                    handleStatusChange(order._id, status)
                                  }
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                                      status
                                    )}`}
                                  />
                                  {status}
                                </DropdownMenuItem>
                              );
                            })}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Show pagination only when not searching/filtering */}
      {!isSearchOrFilterActive && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 mt-4 flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPageState - 1) * 10 + 1} to{" "}
            {Math.min(currentPageState * 10, totalOrders || 0)} of {totalOrders}{" "}
            orders
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPageState === 1 || loading}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Show first page & ellipsis if needed */}
            {currentPageState > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                <span className="px-1">...</span>
              </>
            )}

            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPageState ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            ))}

            {/* Show ellipsis & last page if needed */}
            {currentPageState < totalPages - 2 && (
              <>
                <span className="px-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPageState === totalPages || loading}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
