import { useState } from 'react';
import toast from 'react-hot-toast';
import { ordersAPI } from '@/lib/api';
import { money } from '@/lib/delivery';

export default function CouponField({ subtotal, coupon, onApply, onClear }) {
  const [code, setCode] = useState(coupon?.code || '');
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const next = code.trim();
    if (!next) {
      toast.error('Enter a coupon code');
      return;
    }
    setBusy(true);
    try {
      const response = await ordersAPI.validateCoupon({ code: next, subtotal });
      const applied = {
        code: response.data.coupon.code,
        discount: Number(response.data.discount_amount) || 0,
      };
      onApply(applied);
      toast.success(response.data.message || 'Coupon applied');
    } catch (error) {
      toast.error(error.response?.data?.error || 'That coupon cannot be used');
    } finally {
      setBusy(false);
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
        <span className="font-medium text-green-800">
          {coupon.code} · −৳{money(coupon.discount)}
        </span>
        <button type="button" onClick={onClear} className="font-semibold text-green-900">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        className="input"
        placeholder="Coupon code"
        aria-label="Coupon code"
      />
      <button type="button" onClick={apply} disabled={busy} className="btn btn-secondary shrink-0">
        {busy ? 'Checking' : 'Apply'}
      </button>
    </div>
  );
}
