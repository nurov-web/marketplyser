export type Role = "USER" | "SELLER" | "ADMIN" | "COURIER";
export type AccountStatus = "ACTIVE" | "WARNED" | "RESTRICTED" | "SUSPENDED" | "BANNED";
export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: Role;
  accountStatus: AccountStatus;
  createdAt: string;
};

export type Seller = {
  id: string;
  userId: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  logo: string | null;
  status: SellerStatus;
  balance: number | string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  parentId: string | null;
  children?: Category[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  finalPrice: number;
  brand: string | null;
  stock: number;
  specs: Record<string, string> | null;
  rating: number;
  reviewCount: number;
  moderationStatus?: string;
  images: { id: string; url: string }[];
  category?: Category;
  seller?: { id: string; shopName: string; logo: string | null; status: string };
  reviews?: Review[];
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string | null };
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  total: number | string;
  subtotal: number | string;
  deliveryFee: number | string;
  discount?: number | string;
  couponCode?: string | null;
  createdAt: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  cancelReason?: string | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number | string;
    status: OrderStatus;
    productId: string;
    product?: Product;
  }[];
  payment?: { method: string; status: string };
};
