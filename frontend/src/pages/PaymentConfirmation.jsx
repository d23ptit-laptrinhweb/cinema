import { Link, useSearchParams } from 'react-router-dom';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function PaymentConfirmation() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status') || 'failed';
  const message = searchParams.get('message') || 'Không thể xác định trạng thái giao dịch.';
  const txnRef = searchParams.get('txnRef') || '';
  const bankCode = searchParams.get('bankCode') || '';
  const rawAmount = searchParams.get('amount') || '';

  const isSuccess = status === 'success';
  const amountValue = Number(rawAmount);
  const amount = Number.isFinite(amountValue) && amountValue > 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountValue / 100)
    : null;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        <div className="flex flex-col items-center animate-fade-in-up">
          {isSuccess ? (
            <CheckBadgeIcon className="w-24 h-24 text-green-500 mb-6" />
          ) : (
            <XCircleIcon className="w-24 h-24 text-red-500 mb-6" />
          )}

          <h2 className="text-3xl font-bold text-white mb-2">
            {isSuccess ? 'Thanh Toán Thành Công!' : 'Giao Dịch Thất Bại'}
          </h2>
          <p className="text-slate-400 mb-6">{message}</p>

          {(txnRef || bankCode || amount) && (
            <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-left mb-8 text-sm space-y-2">
              {txnRef && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Mã đơn:</span>
                  <span className="text-white font-medium">{txnRef}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="text-white font-medium">{amount}</span>
                </div>
              )}
              {bankCode && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-white font-medium">{bankCode}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {isSuccess && (
              <Link to="/profile" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                Xem vé đã đặt
              </Link>
            )}
            <Link to="/" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
