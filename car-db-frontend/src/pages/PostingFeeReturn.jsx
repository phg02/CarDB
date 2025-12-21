import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PostingFeeReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    
    if (vnp_ResponseCode === '00') {
      toast.success('Payment successful! Your car listing has been published.');
    } else {
      toast.error('Payment failed. Please try again.');
    }

    // Redirect to settings page after showing the message
    setTimeout(() => {
      navigate('/settings');
    }, 3000);
  }, [searchParams, navigate]);

  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const paymentStatus = vnp_ResponseCode === '00' ? 'success' : 'failed';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md mx-auto bg-gray-900 rounded-lg p-8 text-center">
        {searchParams.get('vnp_ResponseCode') === '00' ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-white text-2xl font-bold mb-4">Post Car Success!</h1>
            <p className="text-gray-300 mb-6">
              Your car has been successfully posted and is now live on our platform.
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting to your settings page...
            </p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h1 className="text-white text-2xl font-bold mb-4">Payment Failed</h1>
            <p className="text-gray-300 mb-6">
              There was an issue processing your payment. Please try again.
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting to your settings page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PostingFeeReturn;