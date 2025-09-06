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

const ItemComponent = ({ selectedOrder }: any) => {
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
              {(selectedOrder.status === "Invoice Uploaded" ||
              selectedOrder.status === "Confirmed" ||
              selectedOrder.status === "Packing" ||
              selectedOrder.status === "Dispatched" ||
              selectedOrder.status === "Delivered"
                ? selectedOrder.items
                : selectedOrder.updatedItems
              ).map((item: any) => {
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
    </>
  );
};

export default ItemComponent;
