import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../redux/slices/categoriesSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageWithFallback from "../components/fallbackImage/ImageWithFallback";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus,
  Trash2Icon,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Category } from "../types";
import { useRef } from "react";

function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading } = useSelector(
    (state: RootState) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubcategoryDialogOpen, setIsDeleteSubcategoryDialogOpen] =
    useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [isEditSubcategoryDialogOpen, setIsEditSubcategoryDialogOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    categoryId: string;
    subcategoryId: string;
    subcategoryName: string;
    subcategoryDescription?: string;
    subcategoryImage?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
    imagePreview: null as string | null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const subcategoryFileInputRef = useRef<HTMLInputElement>(null);
  const editSubcategoryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    // console.log(categories);
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPEG, or JPG image.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Please upload an image smaller than 5MB.");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    if (subcategoryFileInputRef.current) {
      subcategoryFileInputRef.current.value = "";
    }
    if (editSubcategoryFileInputRef.current) {
      editSubcategoryFileInputRef.current.value = "";
    }
  };

  const triggerFileInput = (
    dialogType: "create" | "edit" | "subcategory" | "edit-subcategory"
  ) => {
    switch (dialogType) {
      case "create":
        fileInputRef.current?.click();
        break;
      case "edit":
        editFileInputRef.current?.click();
        break;
      case "subcategory":
        subcategoryFileInputRef.current?.click();
        break;
      case "edit-subcategory":
        editSubcategoryFileInputRef.current?.click();
        break;
    }
  };

  // Reset form data helper
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    if (subcategoryFileInputRef.current) {
      subcategoryFileInputRef.current.value = "";
    }
    if (editSubcategoryFileInputRef.current) {
      editSubcategoryFileInputRef.current.value = "";
    }
  };

  const handleCreateCategory = async () => {
    // Trim and validate form data
    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      toast.error("Please enter a category name.");
      return;
    }

    try {
      // Create FormData to send file properly
      const categoryData = new FormData();

      // Ensure we're not sending undefined or empty strings
      categoryData.append("name", trimmedName);
      categoryData.append("description", trimmedDescription || "");

      if (formData.image) {
        categoryData.append("image", formData.image);
      }

      await dispatch(createCategory(categoryData)).unwrap();

      toast.success("Category created successfully");

      setIsCreateDialogOpen(false);
      resetFormData();
      dispatch(fetchCategories());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create category"
      );
    }
  };

  const handleEditCategory = async () => {
    if (selectedCategory) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        await dispatch(
          updateCategory({
            id: selectedCategory._id,
            formData: formDataToSend,
          })
        ).unwrap();

        toast.success("Category updated successfully");
        dispatch(fetchCategories());
        setIsEditDialogOpen(false);
      } catch (error) {
        toast.error("Failed to update category");
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        await dispatch(deleteCategory(selectedCategory._id)).unwrap();
        toast.success("Category deleted successfully");
        setIsDeleteDialogOpen(false);
        dispatch(fetchCategories());
      } catch (error: any) {
        console.error("Delete category error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete category"
        );
      }
    }
  };

  const handleCreateSubcategory = async () => {
    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      toast.error("Please enter a subcategory name.");
      return;
    }

    if (selectedCategory) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", trimmedName);
        formDataToSend.append("description", trimmedDescription || "");
        formDataToSend.append("categories", selectedCategory._id);

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        await dispatch(
          createSubcategory({
            categoryId: selectedCategory._id,
            formData: formDataToSend,
          })
        ).unwrap();

        toast.success("Subcategory created successfully");
        setIsSubcategoryDialogOpen(false);
        resetFormData();
        dispatch(fetchCategories());
      } catch (error: any) {
        console.error("Create subcategory error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to create subcategory"
        );
      }
    }
  };

  const handleEditSubcategory = async () => {
    if (selectedSubcategory) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        await dispatch(
          updateSubcategory({
            categoryId: selectedSubcategory.categoryId,
            subcategoryId: selectedSubcategory.subcategoryId,
            formData: formDataToSend,
          })
        ).unwrap();

        toast.success("Subcategory updated successfully");
        setIsEditSubcategoryDialogOpen(false);
        resetFormData();
        dispatch(fetchCategories());
      } catch (error: any) {
        console.error("Edit subcategory error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to update subcategory"
        );
      }
    }
  };

  const handleDeleteSubcategory = async () => {
    if (selectedSubcategory) {
      try {
        await dispatch(
          deleteSubcategory({
            categoryId: selectedSubcategory?.categoryId,
            subcategoryId: selectedSubcategory?.subcategoryId,
          })
        ).unwrap();
        toast.success("Subcategory deleted successfully");
        setIsDeleteSubcategoryDialogOpen(false);
        dispatch(fetchCategories());
        setSelectedSubcategory(null);
      } catch (error: any) {
        console.error("Delete subcategory error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete subcategory"
        );
      }
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: null,
      imagePreview: category.image || null,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const openEditSubcategoryDialog = (
    categoryId: string,
    subcategoryId: string,
    subcategoryName: string,
    subcategoryDescription?: string,
    subcategoryImage?: string
  ) => {
    setSelectedSubcategory({
      categoryId,
      subcategoryId,
      subcategoryName,
      subcategoryDescription,
      subcategoryImage,
    });
    setFormData({
      name: subcategoryName || "",
      description: subcategoryDescription || "",
      image: null,
      imagePreview: subcategoryImage ? `${subcategoryImage}` : null,
    });
    setIsEditSubcategoryDialogOpen(true);
  };

  const openDeleteSubcategoryDialog = (
    categoryId: string,
    subcategoryId: string,
    subcategoryName: string
  ) => {
    setSelectedSubcategory({
      categoryId,
      subcategoryId,
      subcategoryName,
    });
    setIsDeleteSubcategoryDialogOpen(true);
  };

  const openSubcategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    resetFormData();
    setIsSubcategoryDialogOpen(true);
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFileUploadArea = (
    dialogType: "create" | "edit" | "subcategory" | "edit-subcategory"
  ) => {
    const getFileInputRef = () => {
      switch (dialogType) {
        case "create":
          return fileInputRef;
        case "edit":
          return editFileInputRef;
        case "subcategory":
          return subcategoryFileInputRef;
        case "edit-subcategory":
          return editSubcategoryFileInputRef;
        default:
          return fileInputRef;
      }
    };

    const currentFileInputRef = getFileInputRef();

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {dialogType === "subcategory" || dialogType === "edit-subcategory"
            ? "Subcategory Image"
            : "Category Image"}
        </label>

        {/* Hidden file input */}
        <input
          ref={currentFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload area */}
        {!formData.imagePreview ? (
          <div
            onClick={() => triggerFileInput(dialogType)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-50"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-primary cursor-pointer">
                Click to upload
              </span>{" "}
              or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPEG, JPG (max 5MB)
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <ImageWithFallback
                    src={`/upload/image/${formData.imagePreview}`}
                    alt={formData.name}
                    className="h-8 w-8 object-cover rounded border"
                    fallbackClassName="h-8 w-8 object-cover rounded border"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {formData.image?.name || "Current image"}
                    </span>
                  </div>
                  {formData.image && (
                    <div className="text-xs text-gray-500 mt-1">
                      {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerFileInput(dialogType)}
              className="mt-2 w-full"
            >
              Change Image
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>
        <Button
          onClick={() => {
            resetFormData();
            setIsCreateDialogOpen(true);
          }}
          className="bg-[#3C5D87] hover:bg-[#617D9E]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative w-full sm:w-auto sm:min-w-[300px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center py-8">
            Loading categories...
          </p>
        ) : filteredCategories.length === 0 ? (
          <p className="col-span-full text-center py-8">No categories found.</p>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category._id}>
              <CardHeader className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-6 top-6 z-10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openSubcategoryDialog(category)}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" /> Add Subcategory
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => openDeleteDialog(category)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {category && (
                  <div className="mb-4">
                    <ImageWithFallback
                      src={`/upload/image/${category.image}`}
                      alt={category.name || "Category"}
                      className="w-full h-40 object-cover rounded-md z-0"
                      fallbackClassName="w-full h-40 rounded-md"
                    />
                  </div>
                )}
                <CardTitle>{category.name || "Unnamed Category"}</CardTitle>
                <CardDescription>
                  {category.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Subcategories</span>
                    <span>{category.subcategories?.length || 0}</span>
                  </div>
                </div>
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Subcategories</h4>
                      <div className="space-y-1">
                        {category.subcategories.map((subcategory, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center space-x-3">
                              {subcategory && (
                                <ImageWithFallback
                                  src={`/upload/image/${subcategory.image}`}
                                  alt={subcategory.name}
                                  className="h-8 w-8 object-cover rounded border"
                                  fallbackClassName="h-8 w-8 object-cover rounded border"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {subcategory.name}
                                </p>
                                {subcategory.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {subcategory.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    openEditSubcategoryDialog(
                                      category._id,
                                      subcategory._id,
                                      subcategory.name,
                                      subcategory.description,
                                      subcategory.image
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() =>
                                    openDeleteSubcategoryDialog(
                                      category._id,
                                      subcategory._id,
                                      subcategory.name
                                    )
                                  }
                                >
                                  <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Category Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                className="min-h-[80px] resize-none"
              />
            </div>
            {renderFileUploadArea("create")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetFormData();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              className="bg-[#3C5D87] hover:bg-[#617D9E]"
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Category Name *
              </label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                className="min-h-[80px] resize-none"
              />
            </div>
            {renderFileUploadArea("edit")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetFormData();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCategory}
              className="bg-[#3C5D87] hover:bg-[#617D9E]"
            >
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <Dialog
        open={isDeleteSubcategoryDialogOpen}
        onOpenChange={setIsDeleteSubcategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {selectedSubcategory?.subcategoryName}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSubcategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog
        open={isSubcategoryDialogOpen}
        onOpenChange={setIsSubcategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory to {selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="subcategory-name" className="text-sm font-medium">
                Subcategory Name *
              </label>
              <Input
                id="subcategory-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter subcategory name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="subcategory-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <Textarea
                id="subcategory-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter subcategory description"
                className="min-h-[80px] resize-none"
              />
            </div>
            {renderFileUploadArea("subcategory")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubcategoryDialogOpen(false);
                resetFormData();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubcategory}
              className="bg-[#3C5D87] hover:bg-[#617D9E]"
            >
              Create Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog
        open={isEditSubcategoryDialogOpen}
        onOpenChange={setIsEditSubcategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update subcategory information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label
                htmlFor="edit-subcategory-name"
                className="text-sm font-medium"
              >
                Subcategory Name *
              </label>
              <Input
                id="edit-subcategory-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter subcategory name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edit-subcategory-description"
                className="text-sm font-medium"
              >
                Description
              </label>
              <Textarea
                id="edit-subcategory-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter subcategory description"
                className="min-h-[80px] resize-none"
              />
            </div>
            {renderFileUploadArea("edit-subcategory")}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditSubcategoryDialogOpen(false);
                resetFormData();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubcategory}
              className="bg-[#3C5D87] hover:bg-[#617D9E]"
            >
              Update Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Categories;
