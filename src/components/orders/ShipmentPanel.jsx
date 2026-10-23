import { Copy, ExternalLink, RefreshCw, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const GROUP_STYLE = {
  in_review: 'bg-amber-50 text-amber-800 border-amber-200',
  pending: 'bg-blue-50 text-blue-800 border-blue-200',
  hold: 'bg-violet-50 text-violet-800 border-violet-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  partial_delivered: 'bg-teal-50 text-teal-800 border-teal-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  unknown: 'bg-gray-50 text-gray-700 border-gray-200',
};

function when(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

export default function ShipmentPanel({ shipment, onRefresh, refreshing = false }) {
  if (!shipment) return null;

  const copyCode = async () => {
    if (!shipment.tracking_code) return;
    await navigator.clipboard.writeText(shipment.tracking_code);
    toast.success('Tracking code copied');
  };

  const cod = parseFloat(shipment.cod_amount);
  const showCod = !Number.isNaN(cod);

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-charcoal-800">{shipment.courier_name || 'Steadfast Courier'}</p>
            <p className="text-xs text-charcoal-500">Parcel tracking</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${GROUP_STYLE[shipment.status_group] || GROUP_STYLE.unknown}`}>
          {shipment.status_label || shipment.status}
        </span>
      </div>

      {shipment.tracking_code && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-charcoal-500">Tracking code</p>
            <p className="font-semibold text-charcoal-900">{shipment.tracking_code}</p>
          </div>
          <button type="button" onClick={copyCode} className="p-2 rounded-lg text-charcoal-500 hover:bg-cream-100" title="Copy tracking code">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}

      {shipment.status_message && (
        <p className="mt-3 text-sm text-charcoal-700 bg-cream-50 rounded-lg px-3 py-2">{shipment.status_message}</p>
      )}

      {showCod && (
        <p className="mt-3 text-sm text-charcoal-600">
          {cod > 0 ? `Cash to pay the rider: ৳${cod.toLocaleString()}` : 'Paid online. Nothing to pay the rider.'}
        </p>
      )}

      {shipment.status_updated_at && (
        <p className="mt-2 text-xs text-charcoal-400">Updated {when(shipment.status_updated_at)}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {shipment.tracking_url && (
          <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="btn btn-outline px-4 py-2 text-sm whitespace-nowrap">
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Open Steadfast
          </a>
        )}
        {onRefresh && (
          <button type="button" onClick={onRefresh} disabled={refreshing} className="btn btn-outline px-4 py-2 text-sm whitespace-nowrap">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking…' : 'Refresh status'}
          </button>
        )}
      </div>

      {shipment.events?.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">Courier updates</p>
          {shipment.events.map((event, index) => (
            <div key={event.id || `${event.created_at}-${index}`} className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-charcoal-800 capitalize">
                  {(event.status || event.source || 'update').replace(/_/g, ' ')}
                </p>
                {event.message && <p className="text-sm text-charcoal-600">{event.message}</p>}
                <p className="text-xs text-charcoal-400">{when(event.occurred_at || event.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
