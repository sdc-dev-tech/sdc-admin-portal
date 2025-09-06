import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Product {
  _id: string;
  name: string;
  brand: string;
  image: string[];
  variants: string[];
  categorySubcategoryPairs: Array<{
    categoryId: { name: string };
    subcategoryId: { name: string };
  }>;
}

interface AddItemModalProps {
  onAddItem: (
    name: string,
    productId: string,
    variant: string,
    quantity: number
  ) => void;
  trigger?: React.ReactNode;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onAddItem, trigger }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search function
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(
        `/product/search?query=${encodeURIComponent(query)}`
      );
      const products = await response.data;
      setSearchResults(products);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0] || "default");
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      onAddItem(
        selectedProduct.name,
        selectedProduct._id,
        selectedVariant,
        quantity
      );
      toast.success("Item added successfully");

      // Reset form
      setSelectedProduct(null);
      setSelectedVariant("");
      setQuantity(1);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedProduct(null);
    setSelectedVariant("");
    setQuantity(1);
  };

  const defaultTrigger = (
    <Button className="bg-[#3C5D87]">
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Search for a product and specify variant and quantity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by product name, brand, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#3C5D87]"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((product) => (
                  <Card
                    key={product._id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image?.length > 0 && (
                          <img
                            src={`/api/images/${product.image[0]}`}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {product.brand}
                          </p>
                          {product.categorySubcategoryPairs?.[0] && (
                            <p className="text-xs text-gray-400">
                              {
                                product.categorySubcategoryPairs[0].categoryId
                                  ?.name
                              }{" "}
                              →{" "}
                              {
                                product.categorySubcategoryPairs[0]
                                  .subcategoryId?.name
                              }
                            </p>
                          )}
                        </div>
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Product */}
          {selectedProduct && (
            <Card className="border-[#3C5D87]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  {selectedProduct.image?.length > 0 && (
                    <img
                      src={`/api/images/${selectedProduct.image[0]}`}
                      alt={selectedProduct.name}
                      className="h-16 w-16 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-gray-600">{selectedProduct.brand}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Change
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Variant Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="variant">Variant</Label>
                    <Select
                      value={selectedVariant}
                      onValueChange={setSelectedVariant}
                    >
                      <SelectTrigger id="variant">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct.variants &&
                        selectedProduct.variants.length > 0 ? (
                          selectedProduct.variants.map((variant) => (
                            <SelectItem key={variant} value={variant}>
                              {variant}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="default">Default</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#3C5D87]"
              onClick={handleSubmit}
              disabled={!selectedProduct || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
