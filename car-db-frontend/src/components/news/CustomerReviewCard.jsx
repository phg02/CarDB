import React from "react";

export default function CarReviewPage() {
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white font-sans">
            {/* Header */}
            <header className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div className="text-xl font-bold">Car DB</div>
                <nav className="space-x-6 hidden md:flex">
                    <a href="#" className="hover:text-gray-300">New Cars</a>
                    <a href="#" className="hover:text-gray-300">Used Cars</a>
                    <a href="#" className="hover:text-gray-300">Compare</a>
                    <a href="#" className="hover:text-gray-300">Sell</a>
                    <a href="#" className="hover:text-gray-300">Article</a>
                </nav>
            </header>

            {/* Search Bar */}
            <div className="p-6 max-w-5xl mx-auto">
                <input
                    type="text"
                    placeholder="Search Car"
                    className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-sm"
                />
            </div>

            {/* Our Reviews */}
            <section className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-6">Our Reviews</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Review Card */}
                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        <img src="/sample1.jpg" alt="Review" className="w-full h-56 object-cover" />
                        <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2">Etiam Eget</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
                                gravida velit.
                            </p>
                            <div className="flex items-center space-x-1 text-yellow-400 mb-3">
                                <span>★★★★★</span>
                            </div>
                            <button className="text-xs bg-blue-600 px-3 py-1 rounded">June 01, 2021</button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        <img src="/sample2.jpg" alt="Review" className="w-full h-56 object-cover" />
                        <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2">Tesla Model 3</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
                                gravida velit.
                            </p>
                            <div className="flex items-center space-x-1 text-yellow-400 mb-3">
                                <span>★★★★☆</span>
                            </div>
                            <button className="text-xs bg-blue-600 px-3 py-1 rounded">June 01, 2021</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Reviews */}
            <section className="max-w-6xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        <img src="/truck.jpg" className="w-full h-56 object-cover" />
                        <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2">Ford F-250 Super Duty</h3>
                            <p className="text-xl font-bold text-blue-400">$82,098 - $92,050</p>
                            <p className="text-sm text-gray-300 mt-1">2021 · Four-wheel Drive · Diesel · 5</p>
                            <p className="text-yellow-400 mt-3">★★★★★ (12 Reviews)</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        <img src="/honda.jpg" className="w-full h-56 object-cover" />
                        <div className="p-5">
                            <h3 className="text-lg font-semibold mb-2">Honda Pilot Touring 7-Passenger</h3>
                            <p className="text-xl font-bold text-blue-400">$43,735 - $44,560</p>
                            <p className="text-sm text-gray-300 mt-1">2021 · All-wheel Drive · Gasoline · 7</p>
                            <p className="text-yellow-400 mt-3">★★★★★ (12 Reviews)</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="p-6 border-t border-gray-700 text-center text-gray-400 text-sm">
                © 2025 Car DB. All Rights Reserved.
            </footer>
        </div>
    );
}
