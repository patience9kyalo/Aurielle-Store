'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    await api.post('/products', formData);
    router.push('/admin/products');
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-charcoal">Add Product</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  );
}
