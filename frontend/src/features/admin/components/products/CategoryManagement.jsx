import { useState } from "react";

const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-label outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-word/40";

const labelClass = "text-[10px] font-semibold uppercase tracking-[0.2em] text-word";

function CategoryDrawer({ isOpen, onClose, title, subtitle, form, setForm, onSubmit, submitLabel, actionKey, actionLoading, indicatorVariant }) {
  if (!isOpen) return null;

  const isEdit = indicatorVariant === "edit";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-label/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-line shadow-2xl">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="border-b border-line bg-[#f0f7ff] px-6 py-5 text-primary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 text-primary">Categories</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-label">{title}</h2>
            <p className="mt-1 text-sm text-word/60">{subtitle}</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl border border-line bg-white p-2 text-word transition hover:bg-[#f0f7ff] hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Category Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Fruits & Vegetables"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Description <span className="normal-case tracking-normal text-word/40">(optional)</span>
              </label>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description..."
                className={inputClass}
              />
            </div>

            {/* Status indicator */}
            {form.name.trim() && (
              <div className={`rounded-[22px] border px-4 py-3.5 ${
                isEdit
                  ? "border-warning/20 bg-warning/5"
                  : "border-success/20 bg-success/5"
              }`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isEdit ? "text-warning" : "text-success"}`}>
                  {isEdit ? "Editing" : "Ready to create"}
                </p>
                <p className="mt-1 text-sm text-label">
                  {isEdit ? "Saving changes to" : "New category:"}{" "}
                  <span className="font-semibold">{form.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line bg-[#fcfaf6] px-6 py-5">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!form.name.trim() || actionLoading === actionKey}
              className="w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === actionKey ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CategoryManagement = ({
  categories,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  actionLoading,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, description: cat.description || "" });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    await onCategoryCreate(addForm);
    setAddForm({ name: "", description: "" });
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    await onCategoryUpdate(editingId, editForm);
    setEditOpen(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-sm">

        {/* Table Header */}
        <div className="bg-[#f0f7ff] border-b border-line px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Catalogue</p>
            <h3 className="mt-0.5 text-base font-black text-label">
              All Categories
              <span className="ml-2 rounded-xl border border-line bg-white px-2.5 py-0.5 text-xs font-bold text-primary/70">
                {categories.length}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => { setAddForm({ name: "", description: "" }); setAddOpen(true); }}
            className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            + Add Category
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-line">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-word">#</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Category Name</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-word">Description</th>
                <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-word text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/30">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-sm text-word/50">
                    No categories yet. Click <span className="font-semibold text-word/70">+ Add Category</span> to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat._id} className="transition-colors hover:bg-[#fcfaf6]">
                    <td className="px-6 py-4 text-sm text-word/60">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-label">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-word/70">{cat.description || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-word transition hover:border-primary hover:text-primary hover:bg-primary/5"
                          title="Edit"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onCategoryDelete(cat._id)}
                          disabled={actionLoading === `delete-category:${cat._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-word transition hover:border-danger hover:text-danger hover:bg-danger/5 disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Drawer */}
      <CategoryDrawer
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Category"
        subtitle="Create a new product category."
        form={addForm}
        setForm={setAddForm}
        onSubmit={handleAdd}
        submitLabel="Add Category"
        actionKey="create-category"
        actionLoading={actionLoading}
        indicatorVariant="add"
      />

      {/* Edit Drawer */}
      <CategoryDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Category"
        subtitle="Update the details for this category."
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        actionKey={`update-category:${editingId}`}
        actionLoading={actionLoading}
        indicatorVariant="edit"
      />
    </>
  );
};

export default CategoryManagement;
