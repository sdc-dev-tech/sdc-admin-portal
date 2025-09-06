import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import {
  fetchOrderById,
  handleAdminReview,
  handleStockReview,
} from "@/redux/slices/ordersSlice";
import { AppDispatch } from "@/redux/store";
import { useState } from "react";

const WarehouseUpdate = ({ selectedOrder }: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const [updateQty, setUpdateQty] = useState<Record<string, number>>({});

  const handleSendToAdmin = async () => {
    if (selectedOrder?.status === "Warehouse Processing") {
      try {
        await dispatch(
          handleAdminReview({
            orderId: selectedOrder._id,
            availableQuantities: updateQty, // ✅ send updated values
          })
        ).unwrap();

        dispatch(fetchOrderById(selectedOrder._id));

        toast.success("Order sent to admin successfully!");
      } catch (error) {
        toast.error("Failed to send order to admin. Please try again.");
      }
    } else if (selectedOrder?.status === "Admin Stock Review") {
      try {
        await dispatch(
          handleStockReview({
            orderId: selectedOrder._id,
            availableQuantities: updateQty, // ✅ send updated values
          })
        ).unwrap();

        dispatch(fetchOrderById(selectedOrder._id));

        toast.success("Order sent to admin successfully!");
      } catch (error) {
        toast.error("Failed to send order to admin. Please try again.");
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between align-items-center">
            <div>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Select items to fulfill with available quantities
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-center">
                  Requested Quantity
                </TableHead>
                <TableHead className="text-center">
                  Available Quantity
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.updatedItems.map((item: any) => {
                return (
                  <TableRow key={item.productId._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{item.productId.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.variant}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    {selectedOrder.status === "Admin Stock Review" ? (
                      <TableCell className="text-center">
                        <input
                          type="number"
                          min={0} // ✅ allow even 0 or more than requested
                          className="w-20 px-2 py-1 border border-gray-300 rounded bg-white"
                          value={
                            updateQty[item?._id] || item?.availableQuantity
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setUpdateQty((prev) => ({
                              ...prev,
                              [item._id]: isNaN(value) ? 0 : value,
                            }));
                          }}
                        />
                      </TableCell>
                    ) : (
                      <TableCell className="text-center">
                        <input
                          type="number"
                          min={0} // ✅ allow even 0 or more than requested
                          className="w-20 px-2 py-1 border border-gray-300 rounded bg-white"
                          value={updateQty[item._id] ?? ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setUpdateQty((prev) => ({
                              ...prev,
                              [item._id]: isNaN(value) ? 0 : value,
                            }));
                          }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button className="bg-[#3C5D87]" onClick={handleSendToAdmin}>
          {selectedOrder.status === "Warehouse Processing"
            ? "Send to Admin"
            : "Send to Billing"}
        </Button>
      </div>
    </>
  );
};

export default WarehouseUpdate;
