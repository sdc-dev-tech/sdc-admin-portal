import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchUsers, deleteUser } from "../redux/slices/usersSlice";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { User } from "../types";

function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: paginatedUsers, // Renamed for clarity: these are for normal paginated display
    allUsers, // This will hold all users for client-side searching
    loading,
    totalPages,
  } = useSelector((state: RootState) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPageState, setCurrentPageState] = useState(1); // Local state for pagination

  // Determine if we are in search mode (based on local searchTerm)
  const isSearchActive = debouncedSearchTerm.trim() !== "";

  // Users to display: filtered (if search active) or paginated (if not searching)
  const usersToRender = isSearchActive
    ? allUsers.filter(
        (
          user // Perform client-side filtering on allUsers
        ) =>
          user.name
            .toString()
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.email
            .toString()
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.companyName
            .toString()
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.gstNumber
            .toString()
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      )
    : paginatedUsers;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Main data fetching effect
  useEffect(() => {
    if (isSearchActive) {
      // If a search term is present, fetch ALL users from the backend
      dispatch(fetchUsers({ fetchPaginated: false }));
    } else {
      // If no search term, fetch paginated users as normal
      dispatch(
        fetchUsers({ page: currentPageState, limit: 10, fetchPaginated: true })
      );
    }
  }, [dispatch, currentPageState, isSearchActive]);

  // Reset currentPageState to 1 when a new search term is entered
  useEffect(() => {
    if (isSearchActive && currentPageState !== 1) {
      setCurrentPageState(1);
    }
  }, [isSearchActive, currentPageState]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Number of page buttons to show

    // Total pages for pagination comes from Redux for non-search mode
    const totalPagesForPagination = totalPages || 1;

    let startPage = Math.max(
      1,
      currentPageState - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(
      totalPagesForPagination,
      startPage + maxPagesToShow - 1
    );

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPageState(newPage);
  };

  const handleNextPage = () => {
    if (totalPages && currentPageState < totalPages) {
      setCurrentPageState((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageState > 1) {
      setCurrentPageState((prev) => prev - 1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    // debouncedSearchTerm will clear via the useEffect debounce
    setCurrentPageState(1); // Reset to page 1 on clearing search
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete._id)).unwrap();

        // After deletion, refresh the data based on current mode
        if (isSearchActive) {
          dispatch(fetchUsers({ fetchPaginated: false })); // Re-fetch all to re-filter
        } else {
          dispatch(
            fetchUsers({
              page: currentPageState,
              limit: 10,
              fetchPaginated: true,
            })
          );
        }

        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Only show pagination when not in search mode and there are multiple pages
  const showPagination = !isSearchActive && totalPages && totalPages > 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
            {isSearchActive ? (
              <span className="ml-2">
                ({usersToRender.length} filtered results)
              </span>
            ) : (
              totalPages &&
              totalPages > 0 && ( // Display total products if available and not searching
                <span className="ml-2">
                  ({totalPages * 10} total users - Approximation)
                </span>
              )
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8 pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isSearchActive && ( // Use isSearchActive from local state for message
          <div className="text-sm text-muted-foreground">
            {loading
              ? "Fetching all users for search..."
              : `Showing ${usersToRender.length} result(s)`}
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Registered</TableHead>
              <TableHead className="hidden md:table-cell">GST Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (!isSearchActive || allUsers.length === 0) ? ( // Show loading if fetching paginated or initial all users for search
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : usersToRender.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {isSearchActive
                    ? "No users found matching your search."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              usersToRender.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {user.gstNumber}
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
                            to={`/users/${user._id}`}
                            className="flex w-full cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => openDeleteDialog(user)}
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

        {/* Pagination - only show when not in search mode */}
        {showPagination && (
          <div className="flex items-center gap-2 mt-4 justify-end mb-2 flex-wrap">
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

            <div className="flex items-center gap-1">
              {currentPageState > 3 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
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

              {totalPages &&
                currentPageState < totalPages - 2 && ( // Check totalPages for ellipsis
                  <>
                    <span className="px-1">...</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={
                totalPages === null ||
                currentPageState === totalPages ||
                loading
              }
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account for "
              {userToDelete?.name}"? This action cannot be undone.
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

export default Users;
