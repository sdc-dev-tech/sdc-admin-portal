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

  const [updatedData, setUpdateData] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();

  // Function to handle removing an original item
  const handleRemoveItem = (
    itemId: string,
    productId: string,
    variant: string
  ) => {
    setRemovedItems((prev) => new Set(prev.add(itemId)));
    setItemActions((prev) => [
      ...prev.filter(
        (action) =>
          !(action.productId === productId && action.variant === variant)
      ),
      {
        action: "remove",
        productId,
        variant,
      },
    ]);
  };

  // Function to handle adding a new item
  const handleAddItem = (
    name: string,
    productId: string,
    variant: string,
    quantity: number
  ) => {
    setItemActions((prev) => [
      ...prev,
      {
        action: "add",
        name,
        productId,
        variant,
        quantity,
      },
    ]);
  };

  const handleReplaceItem = (
    oldProductId: string,
    oldVariant: string,
    oldQuantity: number,
    newVariant: string,
    newQty: number
  ) => {
    let action: any = null;

    if (newVariant !== oldVariant) {
      action = {
        action: "replace",
        productId: oldProductId,
        variant: oldVariant,
        newVariant,
      };
    } else if (oldQuantity !== newQty) {
      action = {
        action: "replace",
        productId: oldProductId,
        variant: oldVariant,
        quantity: newQty,
      };
    }

    if (action) {
      setItemActions((prev) => {
        // Remove ANY previous action for the same product+variant combination
        const filtered = prev.filter(
          (a) => !(a.productId === oldProductId && a.variant === oldVariant)
        );
        return [...filtered, action];
      });

      setUpdateData((prev: any) => ({
        ...prev,
        [`${oldProductId}-${oldVariant}`]: {
          newVariant,
          newQty,
        },
      }));
    } else {
      // If no change (variant & qty same), remove from actions
      setItemActions((prev) =>
        prev.filter(
          (a) => !(a.productId === oldProductId && a.variant === oldVariant)
        )
      );

      setUpdateData((prev: any) => {
        const updated = { ...prev };
        delete updated[`${oldProductId}-${oldVariant}`];
        return updated;
      });
    }

    console.log("Updated itemActions:", itemActions);
  };

  // Function to handle removing an added item
  const handleRemoveAddedItem = (index: number) => {
    setRemovedActions((prev) => new Set(prev.add(index)));
  };

  // Send to warehouse
  const handleSendToWarehouse = async () => {
    if (selectedOrder?.status === "Order Placed") {
      try {
        // Filter out removed actions before sending
        const actionsToSend = itemActions.filter(
          (_, index) => !removedActions.has(index)
        );
        await dispatch(
          sendToWarehouse({
            orderId: selectedOrder._id,
            items: actionsToSend,
          })
        ).unwrap();
        dispatch(fetchOrderById(selectedOrder._id));
        toast.success("Order sent to warehouse successfully!");
        setItemActions([]);
        setRemovedItems(new Set());
        setRemovedActions(new Set());
      } catch (error) {
        toast.error("Failed to send order to warehouse. Please try again.");
        console.error("Send to warehouse error:", error);
      }
    } else {
      toast.error("Order is not in 'Order Placed' status");
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
                Select items to fulfill with provided quantities
              </CardDescription>
            </div>
            <div>
              <AddItemModal onAddItem={handleAddItem} />
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
                <TableHead>Edit</TableHead>
                <TableHead>Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.items.map((item: any) => {
                const itemId = item._id;
                if (removedItems.has(itemId)) return null; // Hide removed items
                return (
                  <TableRow key={itemId}>
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
                      {updatedData?.[`${item.productId._id}-${item.variant}`]
                        ?.newQty ?? item.quantity}
                    </TableCell>
                    <TableCell>
                      <EditItemDialog
                        item={item}
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
                            itemId,
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
                if (removedActions.has(index)) return null; // Hide removed actions

                // Only render added items here
                if (action.action !== "add") return null;

                return (
                  <TableRow key={`action-${index}`}>
                    <TableCell>
                      <div className="font-medium">{action.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{action.variant}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">{action.quantity}</div>
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
                            action.productId._id,
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
