import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/utils";
import { toast } from "react-toastify";

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.accessToken;
  const [loading, setLoading] = useState(false);

  const { carData, imagePreviews, isPurchase, isPaymentForExistingPost, postingFeeId } = (location && location.state) || {};
  const { phone, address } = (location && location.state) || {};

  // Redirect back to sell car if no data
  useEffect(() => {
    if (!carData) {
      navigate('/sell-car');
    }
  }, [carData, navigate]);

  const handlePayment = async () => {
    if (!carData) {
      toast.error("Car data not found. Please go back and try again.");
      navigate(isPurchase ? '/carlisting' : '/sell-car');
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        toast.error("Please login to continue");
        navigate("/login");
        return;
      }

      if (isPurchase) {
        // For purchases, show a message that this feature is coming soon
        toast.info("Purchase functionality is coming soon!");
        setLoading(false);
        return;
      }

      let postingFeeIdToUse = postingFeeId;

      if (!isPaymentForExistingPost) {
        // Create FormData for multipart request
        const submitData = new FormData();
        Object.entries(carData).forEach(([key, value]) => {
          if (key === 'dealer' && typeof value === 'object') {
            // Handle nested dealer object
            Object.entries(value).forEach(([dealerKey, dealerValue]) => {
              if (dealerValue !== null && dealerValue !== undefined && dealerValue !== "") {
                submitData.append(`dealer[${dealerKey}]`, dealerValue);
              }
            });
          } else if (value !== null && value !== undefined && value !== "") {
            submitData.append(key, value);
          }
        });

        // Add files
        imagePreviews.forEach(preview => {
          submitData.append("photos", preview.file);
        });

        // Initiate car post
        const response = await api.post('/cars/initiate', submitData, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log('Car post initiated successfully:', response.data);
        postingFeeIdToUse = response.data.data.postingFeeId;
      }

      // Initiate VNPay payment
      console.log('Initiating payment for postingFeeId:', postingFeeIdToUse);
      const paymentResponse = await api.post('/posting-fee/pay/checkout', {
        postingFeeId: postingFeeIdToUse,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log('Payment URL received:', paymentResponse.data);

      // Redirect to VNPay payment page
      console.log('Redirecting to:', paymentResponse.data.data.url);
      window.location.href = paymentResponse.data.data.url;
    } catch (err) {
      console.error("Error initiating payment:", err);
      toast.error(err.message || "An error occurred while processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ORDER SUMMARY SECTION */}
      <section className="bg-white min-h-screen antialiased dark:bg-gray-900 py-8">
        <div className="mx-auto max-w-screen-xl 2xl:px-0 pb-6">
          <nav className="flex items-center mx-auto max-w-3xl text-sm text-gray-400 gap-2">
            <Link to="/" className="hover:text-white transition-colors">
              Homepage
            </Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            <Link to="/carlisting" className="hover:text-white transition-colors">
              Car Listing
            </Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            <Link to="/car/:id" className="hover:text-white transition-colors">
              Car Detail
            </Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            <Link to="/order" className="hover:text-white transition-colors">
              Order info
            </Link>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            <span className="text-white">Order Summary</span>
          </nav>
        </div>

        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <div className="mx-auto max-w-3xl">
            <p className="text-3xl font-semibold text-white">
              {isPurchase ? 'Purchase Summary' : isPaymentForExistingPost ? 'Payment Summary' : 'Order Summary'}
            </p>

            {/* CAR DETAILS */}
            <div className="mt-6 space-y-4 border-b border-t border-gray-200 py-8 dark:border-gray-700 sm:mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isPaymentForExistingPost ? 'Car Details' : 'Listing Details'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-white mb-2">Basic Information</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Title:</span> {carData?.heading}</p>
                    <p><span className="font-medium">Price:</span> ${carData?.price?.toLocaleString()}</p>
                    <p><span className="font-medium">Condition:</span> {carData?.condition === 'new' ? 'New' : 'Used'}</p>
                    <p><span className="font-medium">Mileage:</span> {carData?.miles?.toLocaleString()} miles</p>
                    <p><span className="font-medium">Year:</span> {carData?.year}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Vehicle Details</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Make:</span> {carData?.make}</p>
                    <p><span className="font-medium">Model:</span> {carData?.model}</p>
                    <p><span className="font-medium">Trim:</span> {carData?.trim}</p>
                    <p><span className="font-medium">Body Type:</span> {carData?.body_type}</p>
                    <p><span className="font-medium">Fuel Type:</span> {carData?.fuel_type}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Engine & Performance</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Engine:</span> {carData?.engine}</p>
                    <p><span className="font-medium">Engine Size:</span> {carData?.engine_size}L</p>
                    <p><span className="font-medium">Transmission:</span> {carData?.transmission}</p>
                    <p><span className="font-medium">Drivetrain:</span> {carData?.drivetrain}</p>
                    <p><span className="font-medium">MPG:</span> {carData?.city_mpg} city / {carData?.highway_mpg} highway</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Contact Information</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Phone:</span> {carData?.phone}</p>
                    <p><span className="font-medium">Address:</span> {carData?.dealer?.street}, {carData?.dealer?.city}, {carData?.dealer?.state}, {carData?.dealer?.country}</p>
                  </div>
                </div>
              </div>

              {/* Car Images */}
              {imagePreviews && imagePreviews.length > 0 && (
                <div className="mt-6">
                  <h5 className="font-medium text-white mb-4">Car Images</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="mt-6 space-y-4 border-b border-t border-gray-200 py-8 dark:border-gray-700 sm:mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isPurchase ? 'Purchase Summary' : 'Posting Fee Summary'}
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">{isPurchase ? 'Car Purchase' : 'Car Listing Fee'}</p>
                      <p className="text-sm text-gray-400">{isPurchase ? 'Purchase this vehicle' : 'One-time fee to publish your car listing'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{isPurchase ? `$${carData?.price?.toLocaleString()}` : '15,000 VND'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{isPurchase ? `$${carData?.price?.toLocaleString()}` : '15,000 VND'}</span>
                  </div>
                </div>
              </div>
            </div>

              {/* PRICE SUMMARY */}
              <div className="mt-4 space-y-6">
                {/* TERMS */}
                <div className="flex items-start sm:items-center">
                  <input
                    id="terms-checkbox-2"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                  />
                  <label
                    htmlFor="terms-checkbox-2"
                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    I agree with the{" "}
                    <a
                      href="#"
                      className="text-primary-700 underline hover:no-underline dark:text-primary-500"
                    >
                      Terms and Conditions
                    </a>
                    .
                  </label>
                </div>

                {/* BUTTONS */}
                <div className="gap-4 sm:flex sm:items-center">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0"
                  >
                    {loading ? "Processing..." : (isPurchase ? "Confirm Purchase" : "Confirm & Pay")}
                  </button>
                </div>
              </div>
            </div>
          </div>
      </section>
    </>
  );
}

export default OrderSummary;
