import { useNavigate, Link } from 'react-router-dom';

function OrderForm() {
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const phone = formData.get('phone')?.toString().trim();
        const address = formData.get('address')?.toString().trim();

        // basic validation
        if (!phone || !address) {
            // Let HTML5 required handle this, but keep a safety check
            return;
        }

        // navigate to OrderSummary (root route) and pass state
        navigate('/ordersummary', { state: { phone, address } });
    }

    return (
        <div className="min-h-full mt-10 mx-4 lg:mt-20 lg:mx-50">
            <div className="pb-6">
                <nav className="flex items-center text-sm text-gray-400 gap-2">
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

                    <span className="text-white">Order Info</span>
                </nav>
            </div>
            <form className="flex-grow" onSubmit={handleSubmit}>
                <div className="bg-gray-800 p-4 gap-4 flex flex-col">
                    <p className="text-white text-2xl font-semibold underline">Billing and Delivery Info</p>
                    <div>
                        <label htmlFor="phone" className="block mb-2.5 text-sm font-medium text-heading">Phone</label>
                        <input name="phone" type="text" id="phone" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="090828372" required />
                    </div>
                    <div>
                        <label htmlFor="address" className="block mb-2.5 text-sm font-medium text-heading">Address</label>
                        <input name="address" type="text" id="address" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="Street 123" required />
                    </div>
                </div>

                <div className="flex justify-center py-10">
                    <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 font-medium px-20 py-2.5 rounded">Confirm</button>
                </div>
            </form>
        </div>
    );
}

export default OrderForm;