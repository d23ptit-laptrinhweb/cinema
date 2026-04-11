import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Backend maps the return URL to @GetMapping("/return"). We can just forward the query params via axios.
        const queryString = searchParams.toString();
        const response = await axiosClient.get(`/v1/vnpay/return?${queryString}`);
        
        // In VnpayController: return vnpayService.processReturnUrl(params); 
        // This usually returns a Map indicating success or fail.
        if (response && response.vnp_TransactionStatus === '00' || response.status === 'success' || searchParams.get('vnp_TransactionStatus') === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công! Chúc bạn xem phim vui vẻ.');
        } else {
          setStatus('error');
          setMessage('Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (error) {
        console.error("Lỗi xác minh thanh toán", error);
        // Fallback checks using raw URL params in case backend doesn't return properly
        if (searchParams.get('vnp_TransactionStatus') === '00') {
           setStatus('success');
           setMessage('Thanh toán thành công! Chúc bạn xem phim vui vẻ.');
        } else {
           setStatus('error');
           setMessage('Có lỗi xảy ra khi xác minh thanh toán.');
        }
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        {status === 'loading' ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-500 mb-6"></div>
            <h2 className="text-xl text-white font-semibold">Đang xác minh giao dịch...</h2>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center animate-fade-in-up">
            <CheckBadgeIcon className="w-24 h-24 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            
            <div className="flex gap-4">
              <Link to="/profile" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                Xem vé đã đặt
              </Link>
              <Link to="/" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">
                Về Trang Chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in-up">
            <XCircleIcon className="w-24 h-24 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Giao Dịch Thất Bại</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            
            <div className="flex gap-4">
              <Link to="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                Về Trang Chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
