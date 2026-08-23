"use client";

import ProductForm from "@/components/seller/ProductForm";

export default function AdminEditProduct() {
  return <ProductForm mode="edit" redirectTo="/admin/products" />;
}
