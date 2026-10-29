import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Category } from '../../types/index.js';
import {
  Tags,
  Plus,
  X,
  AlertCircle,
  Check,
  Edit2,
  Trash2,
  Power,
  Store,
  Layers,
  Sparkles,
  Shirt,
  Wrench,
  Cake,
  Utensils,
  Heart,
  Tag,
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Tag', icon: Tag },
  { name: 'Cake', icon: Cake },
  { name: 'Wrench', icon: Wrench },
  { name: 'Shirt', icon: Shirt },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Store', icon: Store },
  { name: 'Utensils', icon: Utensils },
  { name: 'Heart', icon: Heart },
];

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Tag');
  const [formActive, setFormActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    // Include all categories (active and inactive) for admin console
    const res = await api.getCategories(true);
    if (res.success && res.data) {
      setCategories(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormIcon('Tag');
    setFormActive(true);
    setFormError(null);
  };

  const openEditModal = (cat: Category) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || 'Tag');
    setFormActive(cat.isActive ?? true);
    setFormError(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    if (trimmedName.length < 2) {
      setFormError('Category name must be at least 2 characters long.');
      return;
    }

    // Check duplicate name on frontend
    const isDuplicate = categories.some(
      c =>
        c._id !== editingCategory?._id &&
        c.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setFormError(`Category "${trimmedName}" already exists.`);
      return;
    }

    setFormSaving(true);

    if (modalMode === 'create') {
      const res = await api.createCategory({
        name: trimmedName,
        description: formDescription.trim(),
        icon: formIcon,
      });
      setFormSaving(false);

      if (res.success && res.data) {
        setCategories(prev => [...prev, { ...res.data, businessCount: 0 }]);
        closeModal();
      } else {
        setFormError(res.message || 'Failed to create category.');
      }
    } else if (modalMode === 'edit' && editingCategory) {
      const res = await api.updateCategory(editingCategory._id, {
        name: trimmedName,
        description: formDescription.trim(),
        icon: formIcon,
        isActive: formActive,
      });
      setFormSaving(false);

      if (res.success && res.data) {
        setCategories(prev =>
          prev.map(c =>
            c._id === editingCategory._id ? { ...c, ...res.data } : c
          )
        );
        closeModal();
      } else {
        setFormError(res.message || 'Failed to update category.');
      }
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const res = await api.toggleCategory(cat._id);
    if (res.success && res.data) {
      setCategories(prev =>
        prev.map(c => (c._id === cat._id ? { ...c, isActive: res.data.isActive } : c))
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    if ((categoryToDelete.businessCount || 0) > 0) {
      setDeleteError(
        `Cannot delete "${categoryToDelete.name}" because ${categoryToDelete.businessCount} store(s) are assigned to it. Deactivate the category instead.`
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const res = await api.deleteCategory(categoryToDelete._id);
    setIsDeleting(false);

    if (res.success) {
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setCategoryToDelete(null);
    } else {
      setDeleteError(res.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Category Taxonomy & Governance
          </h1>
          <p className="text-xs text-neutral-500">
            Define discovery categories, verify store counts, and control marketplace classification
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading taxonomy structure...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3 bg-white dark:bg-neutral-900">
          <Layers className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No categories defined yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Create categories to allow merchant storefronts and discovery searches to be classified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const hasStores = (cat.businessCount || 0) > 0;

            return (
              <div
                key={cat._id}
                className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                  cat.isActive
                    ? 'border-neutral-200/80 dark:border-neutral-800'
                    : 'border-neutral-200/40 dark:border-neutral-800/40 opacity-75 bg-neutral-50/50 dark:bg-neutral-900/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-neutral-900 dark:text-white">
                        {cat.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                      {cat.icon || 'Tag'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed min-h-[36px] line-clamp-2">
                    {cat.description || 'No description provided for this classification.'}
                  </p>
                </div>

                {/* Bottom Row with Store Count and Controls */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {cat.businessCount || 0} {cat.businessCount === 1 ? 'Store' : 'Stores'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Toggle Active Status */}
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        cat.isActive
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title={cat.isActive ? 'Deactivate category' : 'Activate category'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Edit Category */}
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit category details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Category */}
                    <button
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setDeleteError(null);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title={
                        hasStores
                          ? 'Cannot delete: Category has registered stores'
                          : 'Delete category'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {modalMode === 'create' ? 'Add Business Category' : 'Edit Category'}
              </h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Healthcare & Pharmacy"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Icon Identifier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const IconComp = opt.icon;
                    const isSelected = formIcon === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => setFormIcon(opt.name)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[10px]">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Short description for patrons in categories directory..."
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label
                    htmlFor="catIsActive"
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Category is active and visible in public directory
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formSaving}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
                >
                  {formSaving
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Category'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Delete Category
              </h3>
              <button
                onClick={() => setCategoryToDelete(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-neutral-900 dark:text-white">
                "{categoryToDelete.name}"
              </strong>
              ?
            </p>

            {(categoryToDelete.businessCount || 0) > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Safety safeguard: {categoryToDelete.businessCount} store(s) are currently registered
                  under this category. Please reassign the businesses or deactivate the category instead.
                </span>
              </div>
            )}

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || (categoryToDelete.businessCount || 0) > 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
