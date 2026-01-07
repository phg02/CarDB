import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import { toast } from "react-toastify";

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.accessToken;
  const userId = auth?.userId;
  const [loading, setLoading] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [fetchingSellerInfo, setFetchingSellerInfo] = useState(false);

  const { carData, imagePreviews, isPurchase, isPaymentForExistingPost, postingFeeId, city, country, firstName: formFirstName, lastName: formLastName } = (location && location.state) || {};
  const { phone, address } = (location && location.state) || {};
  const [agreed, setAgreed] = useState(false);

  // Redirect if no data
  useEffect(() => {
    if (!carData) {
      navigate(isPurchase ? '/carlisting' : '/sell-car');
    }
  }, [carData, navigate, isPurchase]);

  // Fetch seller ID for purchase orders
  useEffect(() => {
    if (isPurchase && carData?._id) {
      setFetchingSellerInfo(true);
      api.get(`/api/cars/${carData._id}`)
        .then(res => {
          console.log('Car details response:', res.data);
          if (res.data.success && res.data.data) {
            const seller = res.data.data.seller;
            if (seller) {
              const sellerId = typeof seller === 'string' ? seller : seller._id;
              console.log('Seller ID extracted:', sellerId);
              setSellerId(sellerId);
            } else {
              console.error('No seller found in response');
              toast.error('Seller information not found for this car');
            }
          } else {
            console.error('Invalid response structure:', res.data);
            toast.error('Failed to load car information');
          }
        })
        .catch(err => {
          console.error('Error fetching seller info:', err.response?.data || err.message);
          toast.error(err.response?.data?.message || 'Failed to fetch seller information');
        })
        .finally(() => setFetchingSellerInfo(false));
    }
  }, [isPurchase, carData?._id]);

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
        // Handle purchase order
        console.log('Auth object:', auth);
        
        // Decode userId from JWT token if not in auth object
        let customerUserId = auth?.userId;
        if (!customerUserId && token) {
          try {
            const tokenParts = token.split('.');
            const decoded = JSON.parse(atob(tokenParts[1]));
            customerUserId = decoded.userId;
            console.log('Decoded userId from JWT:', customerUserId);
          } catch (err) {
            console.error('Failed to decode token:', err);
          }
        }
        
        if (!phone || !address || !city || !country) {
          toast.error("Please provide all delivery information");
          setLoading(false);
          return;
        }

        if (!sellerId) {
          toast.error("Seller information not found. Please try again.");
          setLoading(false);
          return;
        }
        
        if (!customerUserId) {
          toast.error("User information not found. Please login again.");
          setLoading(false);
          return;
        }
        
        // Use names from the form if provided, otherwise fallback
        const firstName = formFirstName || 'Customer';
        const lastName = formLastName || '';
        
        if (!firstName || !lastName) {
          toast.error("Please provide your first and last name.");
          setLoading(false);
          return;
        }

        const orderPayload = {
          customer: customerUserId,
          firstName,
          lastName,
          email: auth?.email || '',
          phone,
          address,
          city,
          country,
          items: [
            {
              carPost: carData._id || carData.id,
              seller: sellerId,
              quantity: 1,
            }
          ],
          notes: '',
        };

        console.log('Order payload being sent:', orderPayload);

        // Create order via API
        const orderResponse = await api.post('/api/orders/create', orderPayload, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log('Order response:', orderResponse.data);

        if (orderResponse.data.success) {
          const orderId = orderResponse.data.data.order._id;
          const orderAmount = carData.price;
          
          console.log('Order created, initiating VNPay payment:', { orderId, orderAmount });
          
          // Now create VNPay checkout session
          const vnpayResponse = await api.post('/api/payments/vnpay/create-checkout', 
            {
              orderId: orderId,
              type: 'order',
              billingInfo: {
                firstName,
                lastName,
                email: auth?.email || '',
                phone,
                address,
                city,
                country,
              }
            },
            {
              withCredentials: true,
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log('VNPay checkout response:', vnpayResponse.data);
          console.log('Full VNPay response data object:', JSON.stringify(vnpayResponse.data.data, null, 2));

          if (vnpayResponse.data.success) {
            const paymentUrl = vnpayResponse.data.data?.url || vnpayResponse.data.url;
            console.log('Payment URL extracted:', paymentUrl);
            console.log('All keys in data:', Object.keys(vnpayResponse.data.data || {}));
            
            if (paymentUrl) {
              // Redirect to VNPay payment URL
              toast.success('Redirecting to payment...');
              setTimeout(() => {
                window.location.href = paymentUrl;
              }, 500);
            } else {
              console.error('Payment URL not found in response:', vnpayResponse.data);
              toast.error('Payment URL not generated. Please try again.');
            }
          } else {
            toast.error('Failed to initiate payment. Please try again.');
          }
        } else {
          toast.error(orderResponse.data.message || 'Failed to create order');
        }
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

        // Backward-compatibility: backend expects `miles` field name
        if ((carData.km || carData.km === 0) && !submitData.has('miles')) {
          submitData.append('miles', carData.km);
        }

        // Initiate car post
        const response = await api.post('/api/cars/initiate', submitData, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log('Car post initiated successfully:', response.data);
        postingFeeIdToUse = response.data.data.postingFeeId;
      }

      // Initiate VNPay payment
      console.log('Initiating payment for postingFeeId:', postingFeeIdToUse);
      const paymentResponse = await api.post('/api/posting-fee/pay/checkout', {
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
      console.error("Full error response:", err.response);
      console.error("Error details:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred while processing payment";
      toast.error(errorMessage);
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

              {/* Delivery Information Section (for purchases) */}
              {isPurchase && (phone || address || city || country) && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <h5 className="font-medium text-white mb-3">Delivery Information</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Phone:</span> {phone || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {address || 'N/A'}</p>
                    <p><span className="font-medium">City:</span> {city || 'N/A'}</p>
                    <p><span className="font-medium">Country:</span> {country || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-white mb-2">Basic Information</h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Title:</span> {carData?.heading || carData?.name || 'Unknown Car'}</p>
                    <p><span className="font-medium">Price:</span> VND {carData?.price?.toLocaleString()}</p>
                    <p><span className="font-medium">Condition:</span> {carData?.condition === 'new' ? 'New' : 'Used'}</p>
                    <p>
                      <span className="font-medium">Mileage:</span>{' '}
                      {carData?.miles !== undefined && carData?.miles !== null && !isNaN(carData?.miles) && carData?.miles !== ''
                        ? `${Number(carData.miles).toLocaleString()} miles`
                        : carData?.km != null && carData?.km !== '' && !isNaN(carData?.km)
                        ? `${Number(carData.km).toLocaleString()} km`
                        : 'N/A'}
                    </p>
                    <p><span className="font-medium">Year:</span> {carData?.year || 'N/A'}</p>
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
                    <p><span className="font-medium">Km/L:</span> {carData?.city_mpg} city / {carData?.highway_mpg} highway</p>
                  </div>
                </div>

                {!isPurchase && (
                  <div>
                    <h5 className="font-medium text-white mb-2">Contact Information</h5>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="font-medium">Phone:</span> {carData?.phone}</p>
                      <p><span className="font-medium">Address:</span> {carData?.dealer?.street}, {carData?.dealer?.city}, {carData?.dealer?.state}, {carData?.dealer?.country}</p>
                    </div>
                  </div>
                )}
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
                    <p className="text-lg font-bold text-white">{isPurchase ? `VND ${carData?.price?.toLocaleString()}` : '15,000 VND'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{isPurchase ? `VND ${carData?.price?.toLocaleString()}` : '15,000 VND'}</span>
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
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                  />
                  <label
                    htmlFor="terms-checkbox-2"
                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    I agree with the{' '}
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
                    onClick={() => {
                      if (!agreed) {
                        toast.error('You must agree to the Terms and Conditions before paying');
                        return;
                      }
                      handlePayment();
                    }}
                    disabled={loading}
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0"
                  >
                    {loading ? 'Processing...' : (isPurchase ? 'Confirm Purchase' : 'Confirm & Pay')}
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
