"use client";

import ProductForm from "@/components/seller/ProductForm";

export default function AdminNewProduct() {
  return <ProductForm mode="new" redirectTo="/admin/products" />;
}
