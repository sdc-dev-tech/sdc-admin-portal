import EditItemDialog from "@/modal/UpdateOrder/Index";
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
import { fetchOrderById, sendToWarehouse } from "@/redux/slices/ordersSlice";
import { AppDispatch } from "@/redux/store";
import AddItemModal from "./AddItemModal";
import { useState } from "react";

const SendToWarehouse = ({ selectedOrder, loading }: any) => {
  const [itemActions, setItemActions] = useState<any[]>([]);
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());
  const [removedActions, setRemovedActions] = useState<Set<number>>(new Set());
  const [updatedData, setUpdatedData] = useState<
    Record<string, { newVariant: string; newQty: number }>
  >({});

  const dispatch = useDispatch<AppDispatch>();

  // Remove original item
  const handleRemoveItem = (
    itemId: string,
    productId: string,
    variant: string
  ) => {
   setRemovedItems((prev) => new Set([...prev, itemId]));
    setItemActions((prev) => [
      ...prev.filter(
        (a) => !(a.productId === productId && a.variant === variant)
      ),
      { action: "remove", productId, variant },
    ]);
  };

  // Add new item
  const handleAddItem = (
    name: string,
    productId: string,
    variant: string,
    quantity: number
  ) => {
    setItemActions((prev) => [
      ...prev,
      { action: "add", name, productId, variant, quantity },
    ]);
  };

  // Replace item variant/quantity
  const handleReplaceItem = (
    oldProductId: string,
    oldVariant: string,
    oldQuantity: number,
    newVariant: string,
    newQty: number
  ) => {
    const key = `${oldProductId}-${oldVariant}`;
    const hasChanges = newVariant !== oldVariant || oldQuantity !== newQty;

    if (hasChanges) {
      const action = {
        action: "replace",
        productId: oldProductId,
        variant: oldVariant,
        ...(newVariant !== oldVariant && { newVariant }),
        ...(oldQuantity !== newQty && { quantity: newQty }),
      };

      setItemActions((prev) => {
        const filtered = prev.filter(
          (a) => !(a.productId === oldProductId && a.variant === oldVariant)
        );
        return [...filtered, action];
      });

      setUpdatedData((prev) => ({
        ...prev,
        [key]: { newVariant, newQty },
      }));
    } else {
      // No changes: remove from actions & updatedData
      setItemActions((prev) =>
        prev.filter(
          (a) => !(a.productId === oldProductId && a.variant === oldVariant)
        )
      );
      setUpdatedData((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  // Remove added item
  const handleRemoveAddedItem = (index: number) => {
    setRemovedActions((prev) => new Set(prev.add(index)));
  };

  // Send to warehouse
  const handleSendToWarehouse = async () => {
    if (selectedOrder?.status !== "Order Placed") {
      toast.error("Order is not in 'Order Placed' status");
      return;
    }

    try {
      const actionsToSend = itemActions.filter(
        (_, index) => !removedActions.has(index)
      );
      await dispatch(
        sendToWarehouse({ orderId: selectedOrder._id, items: actionsToSend })
      ).unwrap();
      dispatch(fetchOrderById(selectedOrder._id));
      toast.success("Order sent to warehouse successfully!");
      setItemActions([]);
      setRemovedItems(new Set());
      setRemovedActions(new Set());
      setUpdatedData({});
    } catch (error) {
      toast.error("Failed to send order to warehouse. Please try again.");
      console.error("Send to warehouse error:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Select items to fulfill with provided quantities
              </CardDescription>
            </div>
            <AddItemModal onAddItem={handleAddItem} />
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
                <TableHead>Edit</TableHead>
                <TableHead>Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.items.map((item: any) => {
                if (removedItems.has(item._id)) return null;

                const key = `${item.productId._id}-${item.variant}`;
                const currentData = updatedData[key];
                const displayVariant = currentData?.newVariant || item.variant;
                const displayQty = currentData?.newQty ?? item.quantity;

                return (
                  <TableRow
                    key={`${item._id}-${
                      updatedData[`${item.productId._id}-${item.variant}`]
                        ?.newVariant || item.variant
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.productId.image?.[0] && (
                          <img
                            src={`/api/images/${item.productId.image[0]}`}
                            alt={item.productId.name}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        )}
                        <div className="font-medium">{item.productId.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{displayVariant}</TableCell>
                    <TableCell className="text-center">{displayQty}</TableCell>
                    <TableCell>
                      <EditItemDialog
                        item={{
                          ...item,
                          variant: displayVariant,
                          quantity: displayQty,
                        }}
                        orderId={selectedOrder._id}
                        disabled={loading}
                        onReplace={(newVariant: string, quantity: number) =>
                          handleReplaceItem(
                            item.productId._id,
                            item.variant,
                            item.quantity,
                            newVariant,
                            quantity
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        className="bg-red-500"
                        onClick={() =>
                          handleRemoveItem(
                            item._id,
                            item.productId._id,
                            item.variant
                          )
                        }
                      >
                        X
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {itemActions.map((action, index) => {
                if (removedActions.has(index) || action.action !== "add")
                  return null;

                return (
                  <TableRow key={`action-${index}`}>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.variant}</TableCell>
                    <TableCell className="text-center">
                      {action.quantity}
                    </TableCell>
                    <TableCell>
                      <EditItemDialog
                        item={{
                          productId: {
                            _id: action.productId,
                            name: action.name,
                          },
                          variant: action.variant,
                          quantity: action.quantity,
                        }}
                        orderId={selectedOrder._id}
                        disabled={loading}
                        onReplace={(newVariant: string, quantity: number) =>
                          handleReplaceItem(
                            action.productId,
                            action.variant,
                            action.quantity,
                            newVariant,
                            quantity
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        className="bg-red-500"
                        onClick={() => handleRemoveAddedItem(index)}
                      >
                        X
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button className="bg-[#3C5D87]" onClick={handleSendToWarehouse}>
          Send to Warehouse
        </Button>
      </div>
    </>
  );
};

export default SendToWarehouse;
