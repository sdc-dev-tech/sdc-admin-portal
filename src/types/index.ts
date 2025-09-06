// Product Types
export interface ProductVariant {
  id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  categorySubcategoryPairs: {
    categoryId: {
      _id: string;
      name: string;
    };
    subcategoryId: {
      _id: string;
      name: string;
    };
  }[];
  // subcategoryId?: string;
  image: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  businessType: string;
  companyName: string;
  companyAddress: string;
  phone?: string;
  isVerified: boolean;
  role: string;
  addresses: Address[];
  gstNumber: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    brand: string;
    description: string;
    price: number;
    image: string[];
  };
  productName: string;
  variantId: string;
  variant: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    companyName: string;

    name: string;
    email: string;
    phone?: string;
    companyAddress?: string;
  };
  items: OrderItem[];
  status:
    | "Order Placed"
    | "Rework"
    | "Packing"
    | "Confirmed"
    | "Invoice Uploaded"
    | "Dispatched"
    | "Admin Stock Review"
    | "Approval Pending"
    | "Invoice Verification"
    | "Warehouse Processing"
    | "Inprocessing"
    | "Delivered"
    | "Awaiting Invoice"
    | "Cancelled";
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  isPartialOrder: boolean;
  orderId: string;
  originalOrder: string;
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  sku: string;
  lowStockThreshold: number;
  updatedAt: string;
}

// Category Types
export interface Subcategory {
  id: string;
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  categories: [
    {
      id: string;
      name: string;
    }
  ];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
  productCount: number;
}
