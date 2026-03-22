import React from "react";
import { formatMoney } from "../../../../utils/helpers";

const ProductDetailsDrawer = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-label/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:rounded-l-[2rem] overflow-y-auto border-l border-line">
        <div className="relative h-64 w-full bg-[#fcfaf6]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#fcfaf6] text-5xl font-bold text-word/20">
              {product.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-label/40 text-white backdrop-blur-md transition-colors hover:bg-label/60"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-label">{product.name}</h2>
              <span className="mt-2 inline-flex items-center rounded-full bg-[#fcfaf6] border border-line px-3 py-1 text-xs font-semibold text-word/70 shadow-sm">
                {product.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-label">{formatMoney(product.price)}</p>
              <div className="mt-2">
                 {parseInt(product.stock) === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-danger/5 border border-danger/10 py-1 px-3 text-xs font-bold uppercase tracking-wider text-danger shadow-sm">
                      Out of Stock
                    </span>
                  ) : parseInt(product.stock) < 10 ? (
                    <span className="inline-flex items-center rounded-full bg-warning/5 border border-warning/10 py-1 px-3 text-xs font-bold uppercase tracking-wider text-warning shadow-sm">
                      Low Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-success/5 border border-success/10 py-1 px-3 text-xs font-bold uppercase tracking-wider text-success shadow-sm">
                      In Stock ({product.stock})
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-word mb-3">Description</h3>
              <p className="text-sm leading-relaxed text-word/70">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            {product.seller && (
              <div className="rounded-2xl border border-line bg-[#fcfaf6] p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-word mb-4">Seller Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-word/50 font-medium">Name</span>
                    <span className="text-sm font-semibold text-label">{product.seller.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-word/50 font-medium">Contact</span>
                    <span className="text-sm font-semibold text-label">{product.seller.contactNumber}</span>
                  </div>
                  {product.seller.loyaltyCardNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-word/50 font-medium">Loyalty Card</span>
                      <span className="text-sm font-semibold text-label">{product.seller.loyaltyCardNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-word mb-3">System Details</h3>
              <div className="space-y-3 border-t border-line/30 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-word/50 font-medium">Product ID</span>
                  <span className="text-xs font-mono text-word/50 bg-[#fcfaf6] border border-line px-2 py-1 rounded truncate max-w-[150px]">{product._id || product.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-word/50 font-medium">Added On</span>
                  <span className="text-sm font-semibold text-label">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-word/50 font-medium">Status</span>
                  <span className="text-sm font-semibold text-label uppercase text-[11px] tracking-wider">{product.availabilityStatus || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsDrawer;
