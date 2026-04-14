import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [meta, setMeta] = useState({ txnRef: '', transactionNo: '', amount: '' });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryString = searchParams.toString();
        const response = await axiosClient.get(`/v1/vnpay/return?${queryString}`).catch(() => null);
        const result = response || {};
        const txnStatus = result.vnp_TransactionStatus || searchParams.get('vnp_TransactionStatus');
        const responseCode = result.vnp_ResponseCode || searchParams.get('vnp_ResponseCode');
        const success = txnStatus === '00' && responseCode === '00';

        setMeta({
          txnRef: result.vnp_TxnRef || searchParams.get('vnp_TxnRef') || '',
          transactionNo: result.vnp_TransactionNo || searchParams.get('vnp_TransactionNo') || '',
          amount: result.vnp_Amount || searchParams.get('vnp_Amount') || '',
        });
        
        if (success) {
          setStatus('success');
          setMessage('Thanh toán thành công. Đơn đặt vé của bạn đang được cập nhật.');
        } else {
          setStatus('error');
          setMessage(result.vnp_ResponseCodeDesc || 'Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch {
        setStatus('error');
        setMessage('Có lỗi khi xác minh giao dịch thanh toán.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center px-4">
      <div className="card-soft w-full max-w-lg p-8 text-center">
        {status === 'loading' ? (
          <div className="flex flex-col items-center">
            <div className="mb-6 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-red-600"></div>
            <h2 className="text-xl font-semibold text-zinc-900">Đang xác minh giao dịch...</h2>
          </div>
        ) : status === 'success' ? (
          <div className="animate-rise flex flex-col items-center">
            <CheckBadgeIcon className="mb-6 h-24 w-24 text-emerald-600" />
            <h2 className="mb-2 text-3xl font-black text-zinc-900">Thanh toán thành công</h2>
            <p className="mb-6 text-zinc-600">{message}</p>

            <div className="mb-8 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left text-sm text-zinc-700">
              <p>Mã đơn: <span className="font-semibold">{meta.txnRef || '--'}</span></p>
              <p>Mã giao dịch: <span className="font-semibold">{meta.transactionNo || '--'}</span></p>
            </div>

            <div className="flex gap-4">
              <Link to="/profile" className="btn-outline">
                Xem vé đã đặt
              </Link>
              <Link to="/" className="btn-primary">
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="animate-rise flex flex-col items-center">
            <XCircleIcon className="mb-6 h-24 w-24 text-red-600" />
            <h2 className="mb-2 text-3xl font-black text-zinc-900">Giao dịch thất bại</h2>
            <p className="mb-8 text-zinc-600">{message}</p>
            
            <div className="flex gap-4">
              <Link to="/" className="btn-outline">
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
