function OrderForm() {
    return (       
        <form>
            <div className="bg-gray-800 mt-30 mx-20 p-4 gap-4 flex flex-col">
                <p className="text-white text-2xl font-semibold underline">Billing and Delivery Info</p>
                <div>
                    <label htmlFor="phone" className="block mb-2.5 text-sm font-medium text-heading">Phone</label>
                    <input type="text" id="phone" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="090828372" required />
                </div>
                <div>
                    <label htmlFor="address" className="block mb-2.5 text-sm font-medium text-heading">Address</label>
                    <input type="text" id="address" className="bg-gray-700 text-heading rounded-base block w-full px-3 py-2.5 shadow-xs" placeholder="Street 123" required />
                </div>
            </div>

            <div className="flex justify-center">
                <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 font-medium px-4 py-2.5 rounded">Confirm</button>
            </div>
        </form>
    );
}

export default OrderForm;