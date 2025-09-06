import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchProducts, deleteProduct } from "../redux/slices/productsSlice";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "../types";
import ImageWithFallback from "@/components/fallbackImage/ImageWithFallback";

function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products,
    allItems: allProducts,
    loading,
    totalPages,
    totalProducts,
  } = useSelector((state: RootState) => state.products);
  const { items: categories } = useSelector(
    (state: RootState) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPageState, setCurrentPageState] = useState(1);

  // Determine if we're in search/filter mode
  const isSearchOrFilterActive =
    searchTerm.trim() !== "" || categoryFilter !== "";

  // Use allProducts when searching/filtering, otherwise use paginated products
  const productsToShow = isSearchOrFilterActive ? allProducts : products;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products based on whether we're searching/filtering or not
  useEffect(() => {
    if (isSearchOrFilterActive) {
      // Fetch all products when search/filter is active
      dispatch(fetchProducts({})); // No page/limit params
    } else {
      // Fetch paginated products when browsing normally
      dispatch(fetchProducts({ page: currentPageState, limit: 10 }));
    }
  }, [dispatch, currentPageState, isSearchOrFilterActive]);

  // Reset to first page when starting a search/filter
  useEffect(() => {
    if (isSearchOrFilterActive) {
      setCurrentPageState(1);
    }
  }, [searchTerm, categoryFilter]);

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete._id)).unwrap();

        // Refresh the appropriate product list after deletion
        if (isSearchOrFilterActive) {
          dispatch(fetchProducts({})); // Fetch all products
        } else {
          dispatch(fetchProducts({ page: currentPageState, limit: 10 }));
        }

        toast.success("Product deleted successfully");
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPageState(page);
  };

  const handlePrevPage = () => {
    if (currentPageState > 1) {
      setCurrentPageState(currentPageState - 1);
    }
  };

  const handleNextPage = () => {
    if (totalPages && currentPageState < totalPages) {
      setCurrentPageState(currentPageState + 1);
    }
  };

  // Apply search and filter to the products
  const filteredProducts = productsToShow.filter((product) => {
    const matchesSearch =
      product?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      product?.description?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesCategory = categoryFilter
      ? product?.categorySubcategoryPairs?.[0]?.categoryId?._id ===
        categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  // Helper function to safely get category name from product
  const getProductCategoryName = (product: Product) => {
    if (
      product?.categorySubcategoryPairs &&
      product.categorySubcategoryPairs.length > 0 &&
      product.categorySubcategoryPairs[0]?.categoryId?.name
    ) {
      return product.categorySubcategoryPairs[0].categoryId.name;
    }
    return "Unknown";
  };

  // Generate page numbers for pagination (only show when not searching/filtering)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 3;

    if (!totalPages || isSearchOrFilterActive) return pages;

    let startPage = Math.max(
      1,
      currentPageState - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Clear search and filter
  const clearSearchAndFilter = () => {
    setSearchTerm("");
    setCategoryFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
            {isSearchOrFilterActive ? (
              <span className="ml-2">
                ({filteredProducts.length} filtered results)
              </span>
            ) : (
              totalProducts && (
                <span className="ml-2">({totalProducts} total products)</span>
              )
            )}
          </p>
        </div>
        <Button asChild className="bg-[#3C5D87] hover:bg-[#617D9E]">
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((data) => (
                <SelectItem key={data._id} value={data._id}>
                  {data.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSearchOrFilterActive && (
            <Button
              variant="outline"
              onClick={clearSearchAndFilter}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="hidden md:table-cell">Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {isSearchOrFilterActive
                    ? "No products found matching your search criteria."
                    : "No products found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-2">
                        {!product.image ? (
                          <ImageWithFallback
                            src={`/upload/image/${product.image}`}
                            alt={product.name || "Product"}
                            className="h-12 w-12 rounded object-cover"
                            fallbackClassName="w-12 h-12 rounded-md"
                          />
                        ) : Array.isArray(product.image) && product.image[0] ? (
                          <ImageWithFallback
                            src={`/upload/image/${product.image[0]}`}
                            alt={product.name || "Product"}
                            className="h-12 w-12 rounded object-cover"
                            fallbackClassName="w-12 h-12 rounded-md"
                          />
                        ) : null}
                      </div>

                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {product.description &&
                          product.description.length > 30
                            ? `${product.description.substring(0, 30)}...`
                            : product.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getProductCategoryName(product)}</TableCell>
                  <TableCell>{product.brand || "Unknown"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.variants ? product.variants.length : 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/products/edit/${product?._id}/${product?.categorySubcategoryPairs?.[0]?.categoryId?._id}/${product?.categorySubcategoryPairs?.[0]?.subcategoryId?._id}`}
                            className="flex w-full cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Show pagination only when not searching/filtering */}
      {!isSearchOrFilterActive && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 mt-4 flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPageState - 1) * 10 + 1} to{" "}
            {Math.min(currentPageState * 10, totalProducts || 0)} of{" "}
            {totalProducts} products
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPageState === 1 || loading}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Show first page & ellipsis if needed */}
            {currentPageState > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                <span className="px-1">...</span>
              </>
            )}

            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPageState ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            ))}

            {/* Show ellipsis & last page if needed */}
            {currentPageState < totalPages - 2 && (
              <>
                <span className="px-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPageState === totalPages || loading}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Products;
