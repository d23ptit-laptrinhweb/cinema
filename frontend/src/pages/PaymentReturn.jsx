import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Đang xác minh giao dịch...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryString = searchParams.toString();
        const response = await axiosClient.get(`/v1/vnpay/return?${queryString}`);

        const responseCode = response?.vnp_ResponseCode || searchParams.get('vnp_ResponseCode');
        const transactionStatus = response?.vnp_TransactionStatus || searchParams.get('vnp_TransactionStatus');
        const isSuccess = responseCode === '00' && transactionStatus === '00';

        const params = new URLSearchParams({
          status: isSuccess ? 'success' : 'failed',
          message: response?.vnp_ResponseCodeDesc || (isSuccess
            ? 'Thanh toán thành công! Chúc bạn xem phim vui vẻ.'
            : 'Giao dịch không thành công hoặc đã bị hủy.'),
          txnRef: response?.vnp_TxnRef || searchParams.get('vnp_TxnRef') || '',
          amount: response?.vnp_Amount || searchParams.get('vnp_Amount') || '',
          bankCode: response?.vnp_BankCode || searchParams.get('vnp_BankCode') || ''
        });

        navigate(`/payment/confirmation?${params.toString()}`, { replace: true });
      } catch (error) {
        console.error("Lỗi xác minh thanh toán", error);
        const responseCode = searchParams.get('vnp_ResponseCode');
        const transactionStatus = searchParams.get('vnp_TransactionStatus');

        const fallbackSuccess = responseCode === '00' && transactionStatus === '00';
        const params = new URLSearchParams({
          status: fallbackSuccess ? 'success' : 'failed',
          message: fallbackSuccess
            ? 'Thanh toán thành công! Chúc bạn xem phim vui vẻ.'
            : 'Có lỗi xảy ra khi xác minh thanh toán.',
          txnRef: searchParams.get('vnp_TxnRef') || '',
          amount: searchParams.get('vnp_Amount') || '',
          bankCode: searchParams.get('vnp_BankCode') || ''
        });

        navigate(`/payment/confirmation?${params.toString()}`, { replace: true });
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-500 mb-6"></div>
          <h2 className="text-xl text-white font-semibold">{message}</h2>
        </div>
      </div>
    </div>
  );
}
