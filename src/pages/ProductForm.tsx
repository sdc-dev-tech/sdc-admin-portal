import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import {
  fetchProductById,
  createProduct,
  updateProduct,
} from "../redux/slices/productsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Product, ProductVariant } from "../types";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import ImageWithFallback from "@/components/fallbackImage/ImageWithFallback";

interface ImageItem {
  type: "url" | "file" | "existing";
  url?: string;
  file?: File;
  preview: string;
  id: string;
  imageId?: string; // For existing images from backend
}

function ProductForm() {
  const { id, categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  );
  const { selectedProduct, loading } = useSelector(
    (state: RootState) => state.products
  );

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    brand: "",
    price: 0,
    categorySubcategoryPairs: [],
    image: [],
    variants: [],
  });

  // Track original data for comparison
  const [originalData, setOriginalData] = useState<Partial<Product>>({});
  const [originalImages, setOriginalImages] = useState<ImageItem[]>([]);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [isCreating] = useState(!id);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [imageUploadMode] = useState<"url" | "file">("file");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  // Reset form when component mounts or when switching products
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      brand: "",
      price: 0,
      categorySubcategoryPairs: [],
      image: [],
      variants: [],
    });
    setOriginalData({});
    setImages([]);
    setOriginalImages([]);
    setIsDataLoaded(false);
    setSubcategories([]);
  };

  // Effect to handle route parameter changes and reset form
  useEffect(() => {
    if (currentProductId !== id) {
      resetForm();
      setCurrentProductId(id || null);
    }

    dispatch(fetchCategories());

    if (id && categoryId && subcategoryId) {
      dispatch(fetchProductById({ id, categoryId, subcategoryId }));
    } else {
      setIsDataLoaded(true);
    }
  }, [dispatch, id, categoryId, subcategoryId, currentProductId]);

  // Populate form data when editing existing product
  useEffect(() => {
    if (id && selectedProduct && !isDataLoaded && selectedProduct._id === id) {
      const productData = {
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        brand: selectedProduct.brand || "",
        categorySubcategoryPairs:
          selectedProduct.categorySubcategoryPairs || [],
        image: selectedProduct.image || [],
        variants: selectedProduct.variants || [],
      };

      setFormData(productData);
      setOriginalData(JSON.parse(JSON.stringify(productData))); // Deep copy

      // Convert existing URLs to ImageItem format - FIXED THIS PART
      if (selectedProduct.image && selectedProduct.image.length > 0) {
        const existingImages: ImageItem[] = selectedProduct.image.map(
          (imageData: any, index) => {
            // Handle both string URLs and objects with _id
            const imageId =
              typeof imageData === "string"
                ? imageData
                : imageData._id || imageData.id;
            const imageUrl =
              typeof imageData === "string"
                ? imageData
                : imageData.url || (imageData as { path?: string }).path;

            return {
              type: "existing", // Changed from "url" to "existing"
              url: imageUrl,
              preview: imageUrl,
              id: `existing-${index}`,
              imageId: imageId, // Store the actual backend image ID
            };
          }
        );
        setImages(existingImages);
        setOriginalImages(JSON.parse(JSON.stringify(existingImages))); // Deep copy
      }

      setIsDataLoaded(true);
    } else if (id && selectedProduct && selectedProduct._id !== id) {
      setIsDataLoaded(false);
    } else if (!id && !isDataLoaded) {
      setIsDataLoaded(true);
    }
  }, [id, selectedProduct, isDataLoaded]);

  // Update subcategories when category changes
  useEffect(() => {
    const firstPair = formData.categorySubcategoryPairs?.[0];
    if (firstPair?.categoryId?._id) {
      const category = categories.find(
        (cat) => cat._id === firstPair.categoryId._id
      );
      setSubcategories(category?.subcategories || []);
    } else if (firstPair?.categoryId?.name) {
      const category = categories.find(
        (cat) => cat.name === firstPair.categoryId.name
      );
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [formData.categorySubcategoryPairs, categories]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (categoryName: string) => {
    const selectedCategory = categories.find(
      (cat) => cat.name === categoryName
    );

    setFormData((prev) => ({
      ...prev,
      categorySubcategoryPairs: [
        {
          categoryId: {
            _id: selectedCategory?._id || "",
            name: categoryName,
          },
          subcategoryId: {
            _id: "",
            name: "",
          },
        },
      ],
    }));
  };

  const handleSubcategoryChange = (subcategoryName: string) => {
    const selectedSubcategory = subcategories.find(
      (sub) => sub.name === subcategoryName
    );

    setFormData((prev) => {
      const currentPairs = prev.categorySubcategoryPairs || [];
      const updatedPairs = [...currentPairs];

      if (updatedPairs.length === 0) {
        updatedPairs.push({
          categoryId: { _id: "", name: "" },
          subcategoryId: { _id: "", name: "" },
        });
      }

      updatedPairs[0] = {
        ...updatedPairs[0],
        subcategoryId: {
          _id: selectedSubcategory?._id || "",
          name: subcategoryName,
        },
      };

      return {
        ...prev,
        categorySubcategoryPairs: updatedPairs,
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: ImageItem = {
            type: "file",
            file,
            preview: event.target?.result as string,
            id: `file-${Date.now()}-${Math.random()}`,
          };

          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `new-${Date.now()}`,
      name: `${formData.name || "Product"} - New Variant`,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedVariants = [...(prev.variants || [])];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  // Helper function to detect changes
  const getChangedFields = () => {
    const changes: any = {};
    const hasImageChanges =
      JSON.stringify(images) !== JSON.stringify(originalImages);

    // Check basic fields
    if (formData.name !== originalData.name && formData.name?.trim()) {
      changes.name = formData.name;
    }
    if (
      formData.description !== originalData.description &&
      formData.description?.trim()
    ) {
      changes.description = formData.description;
    }
    if (formData.brand !== originalData.brand && formData.brand?.trim()) {
      changes.brand = formData.brand;
    }

    // Check category/subcategory changes
    const currentPair = formData.categorySubcategoryPairs?.[0];
    const originalPair = originalData.categorySubcategoryPairs?.[0];

    if (
      currentPair &&
      (currentPair.categoryId?._id !== originalPair?.categoryId?._id ||
        currentPair.subcategoryId?._id !== originalPair?.subcategoryId?._id)
    ) {
      changes.categorySubcategoryPairs = [
        {
          categoryId: currentPair.categoryId?._id,
          subcategoryId: currentPair.subcategoryId?._id,
        },
      ];
    }

    // Check variants changes
    const currentVariants = formData.variants || [];
    const originalVariants = originalData.variants || [];

    if (JSON.stringify(currentVariants) !== JSON.stringify(originalVariants)) {
      changes.variants = currentVariants
        .map((variant) =>
          typeof variant === "object" ? variant.name : variant
        )
        .filter((name) => name && name.trim());
    }

    return { changes, hasImageChanges };
  };

  const validateForCreate = () => {
    if (!formData.name || !formData.description) {
      toast.error("Product name and description are required for new products");
      return false;
    }

    if (
      !formData.categorySubcategoryPairs ||
      formData.categorySubcategoryPairs.length === 0 ||
      !formData.categorySubcategoryPairs[0]?.categoryId._id
    ) {
      toast.error("Please select a category for new products");
      return false;
    }

    if (!formData.variants || formData.variants.length === 0) {
      toast.error("Please add at least one product variant for new products");
      return false;
    }

    return true;
  };

  const validateForUpdate = () => {
    const { changes, hasImageChanges } = getChangedFields();

    if (Object.keys(changes).length === 0 && !hasImageChanges) {
      toast.error("No changes detected. Please modify at least one field.");
      return false;
    }

    if (changes.variants && changes.variants.length > 0) {
      const hasEmptyVariantName = changes.variants.some(
        (name: string) => !name || name.trim() === ""
      );
      if (hasEmptyVariantName) {
        toast.error("Variant names cannot be empty");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      if (!validateForCreate()) return;
    } else {
      if (!validateForUpdate()) return;
    }

    try {
      if (isCreating) {
        // For creating, use the existing logic
        const hasFiles = images.some((img) => img.type === "file");

        if (hasFiles || images.length > 0) {
          const formDataToSend = new FormData();

          if (formData.name) formDataToSend.append("name", formData.name);
          if (formData.description)
            formDataToSend.append("description", formData.description);
          if (formData.brand) formDataToSend.append("brand", formData.brand);

          if (
            formData.categorySubcategoryPairs &&
            formData.categorySubcategoryPairs.length > 0
          ) {
            formData.categorySubcategoryPairs.forEach((pair, index) => {
              const categoryId =
                typeof pair.categoryId === "string"
                  ? pair.categoryId
                  : pair.categoryId?._id;
              const subcategoryId =
                typeof pair.subcategoryId === "string"
                  ? pair.subcategoryId
                  : pair.subcategoryId?._id;

              if (categoryId) {
                formDataToSend.append(
                  `categorySubcategoryPairs[${index}][categoryId]`,
                  categoryId
                );
              }
              if (subcategoryId) {
                formDataToSend.append(
                  `categorySubcategoryPairs[${index}][subcategoryId]`,
                  subcategoryId
                );
              }
            });
          }

          if (formData.variants && formData.variants.length > 0) {
            formData.variants.forEach((variant, index) => {
              const variantName =
                typeof variant === "object" ? variant.name : variant;
              if (variantName) {
                formDataToSend.append(`variants[${index}]`, variantName);
              }
            });
          }

          images.forEach((image) => {
            if (image.type === "url" && image.url) {
              formDataToSend.append("images", image.url);
            } else if (image.file) {
              formDataToSend.append("images", image.file);
            }
          });

          await dispatch(createProduct(formDataToSend as any)).unwrap();
          toast.success("Product created successfully");
        }
      } else {
        // For updating, handle both field changes and image changes
        const { changes, hasImageChanges } = getChangedFields();

        console.log("Changes detected:", changes);
        console.log("Image changes:", hasImageChanges);

        // Always prepare data for update
        const hasNewFiles = images.some((img) => img.type === "file");
        const needsFormData = hasImageChanges || hasNewFiles;

        if (needsFormData) {
          // Use FormData if there are image changes or new files
          const formDataToSend = new FormData();

          // Add only changed fields (excluding images)
          Object.keys(changes).forEach((key) => {
            if (key === "categorySubcategoryPairs" && changes[key]) {
              changes[key].forEach((pair: any, index: number) => {
                if (pair.categoryId) {
                  formDataToSend.append(
                    `categorySubcategoryPairs[${index}][categoryId]`,
                    pair.categoryId
                  );
                }
                if (pair.subcategoryId) {
                  formDataToSend.append(
                    `categorySubcategoryPairs[${index}][subcategoryId]`,
                    pair.subcategoryId
                  );
                }
              });
            } else if (key === "variants" && changes[key]) {
              changes[key].forEach((variant: string, index: number) => {
                formDataToSend.append(`variants[${index}]`, variant);
              });
            } else if (key !== "image") {
              // Don't add image field here
              formDataToSend.append(key, changes[key]);
            }
          });

          // Handle existing images (for removal/keeping) - FIXED THIS PART
          const existingImages = images
            .filter((img) => img.type === "existing" && img.imageId)
            .map((img) => img.imageId);

          console.log("Existing images to keep:", existingImages);

          if (existingImages.length > 0) {
            existingImages.forEach((imageId, index) => {
              if (imageId) {
                formDataToSend.append(`image[${index}]`, imageId);
              }
            });
          } else {
            // If no existing images, send empty string to indicate all should be removed
            formDataToSend.append("image", "");
          }

          // Add new uploaded files
          const newFiles = images.filter(
            (img) => img.type === "file" && img.file
          );
          newFiles.forEach((image) => {
            if (image.file) {
              formDataToSend.append("images", image.file);
            }
          });

          // Add new image URLs (if any)
          const newUrls = images.filter((img) => img.type === "url" && img.url);
          newUrls.forEach((image) => {
            if (image.url) {
              formDataToSend.append("images", image.url);
            }
          });

          console.log("FormData being sent:");
          for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value);
          }

          await dispatch(
            updateProduct({ id: id!, data: formDataToSend })
          ).unwrap();
          toast.success("Product updated successfully");
        } else {
          // Use JSON if no image changes and no new files
          // Still need to handle image removals in JSON mode
          const jsonData = { ...changes };

          if (hasImageChanges) {
            const existingImages = images
              .filter((img) => img.type === "existing" && img.imageId)
              .map((img) => img.imageId);
            jsonData.image = existingImages;
          }

          console.log("JSON data being sent:", jsonData);
          await dispatch(updateProduct({ id: id!, data: jsonData })).unwrap();
          toast.success("Product updated successfully");
        }
      }

      navigate("/products");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(
        `Failed to ${isCreating ? "create" : "update"} product: ${
          error.message || error
        }`
      );
    }
  };

  const firstPair = formData.categorySubcategoryPairs?.[0];

  if (
    id &&
    (!isDataLoaded || (selectedProduct && selectedProduct._id !== id))
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
          <p className="text-muted-foreground">Fetching product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isCreating ? "Create New Product" : "Edit Product"}
        </h1>
        <p className="text-muted-foreground">
          {isCreating
            ? "Add a new product to your catalog"
            : "Update any field you want to change. Only modified fields will be updated."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              {isCreating
                ? "Enter the main details for this product"
                : "Update any of these fields. Only modified fields will be updated."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name {isCreating && "*"}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required={isCreating}
                  placeholder={
                    !isCreating ? "Leave empty to keep current value" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand {isCreating && "*"}</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand || ""}
                  onChange={handleInputChange}
                  required={isCreating}
                  placeholder={
                    !isCreating ? "Leave empty to keep current value" : ""
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description {isCreating && "*"}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={4}
                required={isCreating}
                placeholder={
                  !isCreating ? "Leave empty to keep current value" : ""
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category {isCreating && "*"}</Label>
                <Select
                  value={firstPair?.categoryId?.name || ""}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isCreating
                          ? "Select category"
                          : "Leave empty to keep current category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={firstPair?.subcategoryId?.name || ""}
                  onValueChange={handleSubcategoryChange}
                  disabled={
                    !firstPair?.categoryId?._id || subcategories.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !firstPair?.categoryId?._id
                          ? "Select category first"
                          : subcategories.length === 0
                          ? "No subcategories available"
                          : isCreating
                          ? "Select subcategory"
                          : "Leave empty to keep current subcategory"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem
                        key={subcategory._id}
                        value={subcategory.name}
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              {isCreating
                ? "Add images for this product upload from your device"
                : "Add new images or remove existing ones. Current images will be preserved unless removed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUploadMode === "file" && (
              <div className="space-y-2">
                <Label htmlFor="imageFiles">Upload Images</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="imageFiles"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="imageFiles"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <ImageWithFallback
                      src={`/upload/image/${image.preview}`}
                      alt="Product"
                      className="aspect-square w-full rounded-md"
                    />
                    <div className="absolute top-1 left-1">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          image.type === "url"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {image.type === "url" ? "URL" : "File"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                {isCreating
                  ? "Add different versions of this product (size, color, etc.)"
                  : "Modify existing variants or add new ones. Empty variants will be ignored."}
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleAddVariant}
              className="bg-[#3C5D87] hover:bg-[#617D9E]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Variant
            </Button>
          </CardHeader>
          <CardContent>
            {formData.variants && formData.variants.length > 0 ? (
              <div className="space-y-6">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="rounded-md border p-4 space-y-4 relative"
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`variant-name-${index}`}>
                          Variant Name
                        </Label>
                        <Input
                          id={`variant-name-${index}`}
                          value={
                            typeof variant === "object"
                              ? variant.name || ""
                              : variant || ""
                          }
                          onChange={(e) =>
                            handleVariantChange(index, "name", e.target.value)
                          }
                          required={isCreating}
                          placeholder={
                            !isCreating
                              ? "Leave empty to remove this variant"
                              : ""
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isCreating
                  ? 'No variants added. Click "Add Variant" to create one.'
                  : 'No variants found. Click "Add Variant" to add new ones.'}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#3C5D87] hover:bg-[#617D9E]"
          >
            {loading
              ? isCreating
                ? "Creating..."
                : "Updating..."
              : isCreating
              ? "Create Product"
              : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
