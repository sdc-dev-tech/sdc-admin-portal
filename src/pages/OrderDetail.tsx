import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchOrderById,
  updateOrderStatus,
  uploadInvoiceWithQuantities,
} from "../redux/slices/ordersSlice";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowLeft, Truck, MapPin, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import InvoiceDialog from "@/modal/InvoiceModal/Index";
import SendToWarehouse from "@/components/OrdersComponents/SendToWarehouse";
import WarehouseUpdate from "@/components/OrdersComponents/WarehouseUpdate";
import InvoiceUpload from "@/components/OrdersComponents/InvoiceUpload";
import InvoiceVerification from "@/components/OrdersComponents/InvoiceVerification";
import ItemComponent from "@/components/OrdersComponents/ItemComponent";

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedOrder, loading } = useSelector(
    (state: RootState) => state.orders
  );

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [providedQuantities, setProvidedQuantities] = useState<{
    [key: string]: number;
  }>({});

  // Invoice upload state
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceUploaded, setInvoiceUploaded] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [formData, setFormData] = useState({
    invoice: null as File | null,
    availableQuantities: {} as { [key: string]: number },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  // Check if invoice is already uploaded (based on order status)
  useEffect(() => {
    if (selectedOrder) {
      const statusesRequiringInvoice = [
        "Invoice Uploaded",
        "Confirmed",
        "Rework",
        "Packing",
        "Dispatched",
        "Delivered",
      ];
      setInvoiceUploaded(
        statusesRequiringInvoice.includes(selectedOrder.status)
      );
    }
  }, [selectedOrder]);

  const handleStatusChange = async (newStatus: string) => {
    if (selectedOrder) {
      try {
        await dispatch(
          updateOrderStatus({
            id: selectedOrder._id,
            status: newStatus,
          })
        ).unwrap();
        dispatch(fetchOrderById(selectedOrder._id));
        toast.success("Order status updated successfully");
      } catch (error: any) {
        toast.error(
          `Invalid status transition: cannot change status from '${selectedOrder.status}' to '${newStatus}'.`
        );
      }
    }
  };

  const handleInvoiceUpload = async () => {
    if (!invoiceFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Update formData with the selected invoice file
    setFormData((prev) => ({
      ...prev,
      invoice: invoiceFile,
    }));

    setUploadingInvoice(true);
    try {
      setInvoiceUploaded(true);
      toast.success("Invoice uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload invoice. Please try again.");
      console.error("Invoice upload error:", error);
    } finally {
      setUploadingInvoice(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/xml",
        "text/xml",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid file (XML, JPG, PNG, PDF)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }

      setInvoiceFile(file);
    }
  };

  const handleSaveProvidedQuantities = async () => {
    const validProvided = Object.entries(providedQuantities).reduce(
      (acc: { [key: string]: number }, [id, qty]) => {
        if (typeof qty === "number" && qty > 0) {
          acc[id] = qty;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(validProvided).length === 0) {
      toast.error("Please select at least one item and quantity");
      return;
    }

    // Update formData with available quantities
    const updatedFormData = {
      ...formData,
      availableQuantities: validProvided,
    };

    setFormData(updatedFormData);

    // If we have both invoice and quantities, submit to API
    if (
      updatedFormData.invoice &&
      Object.keys(validProvided).length > 0 &&
      selectedOrder
    ) {
      try {
        await dispatch(
          uploadInvoiceWithQuantities({
            orderId: selectedOrder._id,
            formData: updatedFormData,
          })
        ).unwrap();

        toast.success("Invoice and quantities uploaded successfully!");
        // Refresh order data
        dispatch(fetchOrderById(selectedOrder._id));
      } catch (error) {
        toast.error("Failed to upload data. Please try again.");
        console.error("Upload error:", error);
      }
    } else {
      toast.success("Provided quantities saved!");
    }
  };

  // Helper function to check if all items are selected
  const isAllItemsSelected = () => {
    if (!selectedOrder?.items || selectedOrder.items.length === 0) return false;

    const selectedItemIds = Object.keys(providedQuantities);
    return selectedOrder.items.every((item) =>
      selectedItemIds.includes(item._id)
    );
  };

  // Handle select all checkbox
  const handleSelectAllChange = (checked: boolean) => {
    if (!selectedOrder?.items) return;

    setProvidedQuantities(() => {
      if (checked) {
        // Select all items with their requested quantities
        const allSelected = selectedOrder.items.reduce((acc, item) => {
          acc[item._id] = item.quantity;
          return acc;
        }, {} as { [key: string]: number });
        return allSelected;
      } else {
        // Deselect all items
        return {};
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Dispatched":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "Rework":
        return "bg-red-100 text-red-800";
      case "Order Placed":
        return "bg-purple-100 text-purple-800";
      case "Invoice Uploaded":
        return "bg-indigo-100 text-indigo-800";
      case "Packing":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Order not found</p>
        <Button className="mt-4" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/orders")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{selectedOrder.orderId}
          </h1>
          <p className="text-muted-foreground">
            Order details and tracking information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current status and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrder.originalOrder && (
              <div>
                <div className="flex">
                  <p>Original Order ID </p>
                  <Link
                    to={`/orders/${selectedOrder.originalOrder}`}
                    className="flex ml-1 cursor-pointer text-black no-underline hover:text-blue-500"
                  >
                    #{selectedOrder.originalOrder}
                  </Link>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Current Status
                </p>
                <div
                  className={`px-2 py-1 cursor-pointer text-xs font-medium
                  rounded-full inline-block ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </div>
                {selectedOrder.isPartialOrder && (
                  <div
                    className={`px-2 py-1 ml-2 text-xs  font-medium cursor-pointer
                    rounded-full inline-block bg-blue-100 text-blue-800`}
                  >
                    {selectedOrder.isPartialOrder && "Partial Order"}
                  </div>
                )}
                {selectedOrder.originalOrder && (
                  <div
                    className={`px-2 py-1 ml-2 text-xs font-medium cursor-pointer
                    rounded-full inline-block bg-blue-100 text-blue-800`}
                  >
                    {selectedOrder.originalOrder && "Back Order"}
                  </div>
                )}
              </div>

              {![
                "Order Placed",
                "Inprocessing",
                "Warehouse Processing",
                "Admin Stock Review",
                "Approval Pending",
                "Awaiting Invoice",
                "Invoice Verification",
              ].includes(selectedOrder.status) && (
                <Select
                  value={
                    [
                      "Invoice Uploaded",
                      "Confirmed",
                      "Packing",
                      "Dispatched",
                      "Delivered",
                    ].includes(selectedOrder.status)
                      ? selectedOrder.status
                      : "status"
                  }
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status" disabled>
                      Select Status
                    </SelectItem>
                    <SelectItem value="Invoice Uploaded">
                      Invoice Uploaded
                    </SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Packing">Packing</SelectItem>
                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex  items-center gap-4 pt-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Order Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              {[
                "Invoice Uploaded",
                "Invoice Verification",
                "Delivered",
                "Confirmed",
                "Packing",
                "Dispatched",
              ].includes(selectedOrder.status) && (
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => setIsInvoiceOpen(true)}
                  >
                    <Eye className="mr-2" />
                    Invoice
                  </Button>
                </div>
              )}

              <InvoiceDialog
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                selectedOrder={selectedOrder}
              />
            </div>

            {selectedOrder.trackingNumber && (
              <div className="flex items-center gap-4">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tracking Number</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.trackingNumber}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Shipping and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{selectedOrder.userId.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedOrder.userId.companyName}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedOrder.userId.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedOrder.userId.phone}
              </p>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Shipping Address</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.userId.companyAddress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOrder.status !== "Cancelled" ? (
        <>
          {selectedOrder.status === "Invoice Verification" && (
            <InvoiceVerification selectedOrder={selectedOrder} />
          )}
          {(selectedOrder.status === "Invoice Uploaded" ||
            selectedOrder.status === "Awaiting Invoice" ||
            selectedOrder.status === "Confirmed" ||
            selectedOrder.status === "Packing" ||
            selectedOrder.status === "Dispatched" ||
            selectedOrder.status === "Delivered") && (
            <ItemComponent selectedOrder={selectedOrder} />
          )}

          {selectedOrder.status === "Awaiting Invoice" && (
            <InvoiceUpload
              selectedOrder={selectedOrder}
              invoiceUploaded={invoiceUploaded}
              handleFileChange={handleFileChange}
              handleInvoiceUpload={handleInvoiceUpload}
              uploadingInvoice={uploadingInvoice}
              invoiceFile={invoiceFile}
              setUploadingInvoice={setUploadingInvoice}
              setInvoiceUploaded={setInvoiceUploaded}
            />
          )}
          {selectedOrder.status === "Order Placed" && (
            <SendToWarehouse
              selectedOrder={selectedOrder}
              invoiceUploaded={invoiceUploaded}
              providedQuantities={providedQuantities}
              setProvidedQuantities={setProvidedQuantities}
              handleSaveProvidedQuantities={handleSaveProvidedQuantities}
              isAllItemsSelected={isAllItemsSelected}
              handleSelectAllChange={handleSelectAllChange}
              loading={loading}
            />
          )}
          {selectedOrder.status === "Admin Stock Review" && (
            <WarehouseUpdate
              selectedOrder={selectedOrder}
              providedQuantities={providedQuantities}
              setProvidedQuantities={setProvidedQuantities}
              loading={loading}
            />
          )}
          {selectedOrder.status === "Warehouse Processing" && (
            <WarehouseUpdate
              selectedOrder={selectedOrder}
              providedQuantities={providedQuantities}
              setProvidedQuantities={setProvidedQuantities}
              loading={loading}
            />
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Products included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-center">Requested Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOrder.items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.productId.image?.length > 0 && (
                          <img
                            src={`/api/images/${item.productId.image[0]}`}
                            alt={item.productId.name}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <div className="font-medium">{item.productId.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.variant}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OrderDetail;
