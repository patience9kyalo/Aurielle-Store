'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/categories', { auth: false });
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    setError(null);
    setCreating(true);

    try {
      const categoryData = {
        name: name.trim(),
        description: description.trim(),
        parent: parent || null,
      };

      await api.post('/categories', categoryData);

      // Clear form
      setName('');
      setDescription('');
      setParent('');

      // Reload categories
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        'Delete this category? Categories with subcategories cannot be deleted.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);

      setCategories((prev) =>
        prev.filter((category) => category._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Only top-level categories can be selected as parents
  const parentCategories = categories.filter(
    (category) => !category.parent
  );

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-gold">
        Categories
      </h1>

      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="mb-10 max-w-xl rounded-sm border border-charcoal/10 bg-parchment p-6"
      >
        <h2 className="mb-6 text-xl font-medium text-charcoal">
          Add New Category
        </h2>

        {/* Category Name */}
        <div className="mb-5">
          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-medium text-charcoal"
          >
            Category Name *
          </label>

          <input
            id="category-name"
            required
            placeholder="e.g. Electronics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-charcoal/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label
            htmlFor="category-description"
            className="mb-2 block text-sm font-medium text-charcoal"
          >
            Description
          </label>

          <textarea
            id="category-description"
            placeholder="Describe this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-sm border border-charcoal/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </div>

        {/* Parent Category */}
        <div className="mb-6">
          <label
            htmlFor="category-parent"
            className="mb-2 block text-sm font-medium text-charcoal"
          >
            Parent Category
          </label>

          <select
            id="category-parent"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full rounded-sm border border-charcoal/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          >
            <option value="">
              No Parent — Top-level Category
            </option>

            {parentCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-charcoal/50">
            Leave this empty to create a top-level category.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-sm bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={creating}
          className="rounded-sm bg-emerald px-5 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-emerald-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {/* Category List */}
      <div>
        <h2 className="mb-4 text-xl font-medium text-gold">
          Existing Categories
        </h2>

        {loading ? (
          <p className="text-charcoal/50">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-charcoal/50">
            No categories have been added yet.
          </p>
        ) : (
          <div className="max-w-2xl space-y-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between rounded-sm bg-parchment px-5 py-4"
              >
                <div>
                  <p className="font-medium text-charcoal">
                    {category.name}
                  </p>

                  {category.description && (
                    <p className="mt-1 text-sm text-charcoal/60">
                      {category.description}
                    </p>
                  )}

                  {category.parent && (
                    <p className="mt-1 text-xs text-charcoal/40">
                      Subcategory
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(category._id)}
                  className="text-sm text-ember hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}