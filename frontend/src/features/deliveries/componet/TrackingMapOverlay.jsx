import React from 'react';

const generateTrackingIframeUrl = (lat, lng) => {
  const colomboLat = 6.9271;
  const colomboLng = 79.8612;
  return `https://maps.google.com/maps?saddr=${colomboLat},${colomboLng}&daddr=${lat},${lng}&output=embed`;
};

export default function TrackingMapOverlay({ delivery, onClose }) {
  if (!delivery || !delivery.deliveryLocation) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] md:px-6">
        <div className="pr-4">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600">Active Navigation</p>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">
            {delivery.deliveryLocation.address || "Destination Address"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-100 p-2 sm:px-4 sm:py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-800 focus:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Close Route</span>
        </button>
      </div>
      <div className="flex-1 w-full bg-slate-200">
        <iframe
          title={`Tracking Map for Order ${String(delivery.orderId).substring(0,8)}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={generateTrackingIframeUrl(delivery.deliveryLocation.latitude, delivery.deliveryLocation.longitude)}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
