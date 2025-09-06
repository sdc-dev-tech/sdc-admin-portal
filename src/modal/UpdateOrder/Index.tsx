import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Select } from "@radix-ui/react-select";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

// Add this EditItemDialog component inside your OrderDetail function component
const EditItemDialog = ({
  item,
  disabled = false,
  onReplace,
}: {
  item: any;
  onReplace: any;
  orderId: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: item.productId.name,
    quantity: item.quantity,
    variants: item.variant,
  });
  const [isSubmitting] = useState(false);
  // const dispatch = useDispatch<AppDispatch>();
  // const { product } = useSelector((state: any) => state.orders);
  const [product, setProduct] = useState<any>(null);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (open && item.productId._id) {
        try {
          const response = await api.get(`/product/${item.productId._id}`);
          setProduct(response.data);
        } catch (err) {
          toast.error("Failed to fetch product");
        }
      }
    };
    fetchProduct();
  }, [open, item.productId._id]);

  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
  };

  const handleSubmit = (newVariant: any, newQty: any) => {
    console.log("Submitting new variant:", newVariant, "and quantity:", newQty);
    setOpen(false);
    onReplace(newVariant, newQty);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          type="button"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Order Item</DialogTitle>
          <DialogDescription>
            Update the product details. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Item</p>
              <p className="text-xs text-gray-600">
                {item?.productId.name} • {item?.variant} • Qty: {item?.quantity}
              </p>
            </div>
          </div>

          {/* Product Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              disabled={true}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          {/* Variant */}
          <div className="grid gap-2">
            <Label htmlFor="variant">Variant</Label>
            <Select
              value={formData?.variants}
              onValueChange={(value) => handleInputChange("variants", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {product?.variants.map((variant: any) => (
                  <SelectItem value={variant}>{variant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="text"
              value={formData?.quantity}
              onChange={(e) =>
                handleInputChange("quantity", parseInt(e.target.value) || 0)
              }
              placeholder="Enter quantity"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(item.variant, formData.quantity)}
            className="bg-[#3C5D87] hover:bg-[#2A4766]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Update Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
