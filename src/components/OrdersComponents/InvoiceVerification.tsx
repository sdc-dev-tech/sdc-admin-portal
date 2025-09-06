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
import { AppDispatch } from "@/redux/store";
import {
  fetchOrderById,
  handleReviewInvoice,
} from "@/redux/slices/ordersSlice";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

const InvoiceVerification = ({ selectedOrder }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [reason, setReason] = useState("");

  const handleSendToAdmin = async (dec: string) => {
    try {
      await dispatch(
        handleReviewInvoice({
          orderId: selectedOrder._id,
          decision: dec,
          reason,
        })
      ).unwrap();

      dispatch(fetchOrderById(selectedOrder._id));

      toast.success(`Invoice ${dec}ed successfully!`);
    } catch (error) {
      toast.error("Failed to send invoice decision. Please try again.");
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
                    <TableCell className="text-center">
                      {item.availableQuantity}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <div className="mr-4 w-[30%]">
          <Textarea
            className="h-6"
            value={reason}
            placeholder="Enter reason for rejection"
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end mr-2">
          <Button
            className="bg-[#3C5D87]"
            onClick={() => handleSendToAdmin("reject")}
          >
            Rejected
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            className="bg-[#3C5D87]"
            onClick={() => handleSendToAdmin("approve")}
          >
            Approve
          </Button>
        </div>
      </div>
    </>
  );
};

export default InvoiceVerification;
