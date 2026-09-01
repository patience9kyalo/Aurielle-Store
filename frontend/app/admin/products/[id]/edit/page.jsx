'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/${id}`, { auth: false })
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    await api.put(`/products/${id}`, formData);
    router.push('/admin/products');
  };

  if (loading) return <p className="text-charcoal/50">Loading…</p>;
  if (!product) return <p className="text-charcoal/50">Product not found.</p>;

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-charcoal">Edit Product</h1>
      <ProductForm initialProduct={product} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
