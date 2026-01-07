import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

function ProductCard({ children, to, ...props }) {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showLoginNotification, setShowLoginNotification] = useState(false);
    const [showWishlistNotification, setShowWishlistNotification] = useState(false);
    const [wishlistMessage, setWishlistMessage] = useState('');
    const [searchParams] = useSearchParams();
    const isCompareMode = searchParams.get('mode') === 'compare';
    const linkTo = to || `/car/${props.id || 1}`;

    useEffect(() => {
        try {
            // If user is logged in, check server watchlist
            const check = async () => {
                if (auth?.accessToken) {
                    try {
                        const res = await api.get('/api/cars/watchlist', {
                            headers: { Authorization: `Bearer ${auth.accessToken}` }
                        });
                        const list = res.data?.data?.watchlist || [];
                        const ids = list.map(c => (c._id || c.id || c));
                        setIsWishlisted(ids.includes(props.id));
                        return;
                    } catch (err) {
                        console.debug('Could not fetch watchlist, falling back to localStorage');
                    }
                }

                const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setIsWishlisted(existingWishlist.includes(props.id));
            };
            check();
        } catch (err) {
            setIsWishlisted(false);
        }
    }, [props.id, auth]);

    const handleAddToCompare = (e) => {
        e.preventDefault();
        
        // Get existing compare list
        const existingCompare = JSON.parse(localStorage.getItem('compareList') || '[]');
        
        // Check if already added
        const isAlreadyAdded = existingCompare.some(car => car.id === props.id);
        if (isAlreadyAdded) {
            toast.info('This car is already in your comparison list');
            navigate('/compare');
            return;
        }
        
        // Check if list is full
        if (existingCompare.length >= 3) {
            toast.error('You can only compare up to 3 cars');
            navigate('/compare');
            return;
        }
        
        // Add car to compare list
        const carData = {
            id: props.id,
            name: props.name,
            year: props.year,
            make: props.make,
            model: props.model,
            heroImage: props.img,
            price: props.price,
            dealer: { location: props.location },
            overall_length: props.overall_length,
            overall_width: props.overall_width,
            overall_height: props.overall_height,
            std_seating: props.std_seating,
            specifications: {
                leftColumn: [
                    {
                        items: [
                            { label: 'Year', value: props.year },
                            { label: 'Body Type', value: props.body_type || 'N/A' },
                            { label: 'Doors', value: props.doors ? `${props.doors} doors` : 'N/A' },
                            { label: 'Fuel Type', value: props.fuel }
                        ]
                    },
                    {
                        items: [
                            { label: 'Vehicle Type', value: props.vehicle_type || 'N/A' },
                            { label: 'Drivetrain', value: props.wheel },
                            { label: 'Seats', value: props.seats },
                            { label: 'Transmission', value: props.transmission || 'N/A' }
                        ]
                    },
                    {
                        items: [
                            { label: 'Engine Type', value: props.fuel === 'Electric' ? 'Electric Motor' : 'Internal Combustion' },
                            { label: 'Engine Size', value: props.engine_size ? `${props.engine_size} L` : 'N/A' },
                            { label: 'Engine Block', value: props.engine_block || 'N/A' },
                            { label: 'Cylinders', value: props.cylinders || 'N/A' }
                        ]
                    },
                    {
                        items: [
                            { label: 'Length', value: props.overall_length ? `${props.overall_length} mm` : 'N/A' },
                            { label: 'Width', value: props.overall_width ? `${props.overall_width} mm` : 'N/A' },
                            { label: 'Height', value: props.overall_height ? `${props.overall_height} mm` : 'N/A' }
                        ]
                    },
                    {
                        items: [
                            { label: 'Highway MPG', value: props.highway_mpg ? `${props.highway_mpg} mpg` : 'N/A' },
                            { label: 'City MPG', value: props.city_mpg ? `${props.city_mpg} mpg` : 'N/A' }
                        ]
                    },
                    {
                        items: [
                            { label: 'Exterior Color', value: props.exterior_color || 'N/A' },
                            { label: 'Interior Color', value: props.interior_color || 'N/A' }
                        ]
                    },
                    {
                        items: [
                            { label: 'Clean Title', value: props.carfax_clean_title ? 'Yes' : 'No' },
                            { label: 'Inventory Type', value: props.inventory_type ? props.inventory_type.charAt(0).toUpperCase() + props.inventory_type.slice(1) : 'N/A' }
                        ]
                    }
                ]
            },
            images: props.photo_links || [props.img]
        };
        
        existingCompare.push(carData);
        localStorage.setItem('compareList', JSON.stringify(existingCompare));
        
        // Navigate to compare page
        navigate('/compare');
    };

    const handleAddToWishlist = (e) => {
        e.preventDefault();
        // Require login to add/remove wishlist
        if (!auth?.accessToken) {
            setShowLoginNotification(true);
            setTimeout(() => setShowLoginNotification(false), 3000);
            return;
        }
        // Call backend API to toggle watchlist
        (async () => {
            try {
                if (isWishlisted) {
                    await api.delete(`/api/cars/${props.id}/watchlist/me`, {
                        headers: { Authorization: `Bearer ${auth.accessToken}` }
                    });
                    setIsWishlisted(false);
                    setWishlistMessage('Removed from wishlist');
                } else {
                    await api.post(`/api/cars/${props.id}/watchlist/me`, {}, {
                        headers: { Authorization: `Bearer ${auth.accessToken}` }
                    });
                    setIsWishlisted(true);
                    setWishlistMessage('Added to wishlist');
                }
                // Update local cache for unauthenticated views
                try {
                    const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    let newList = existingWishlist.filter(Boolean);
                    if (isWishlisted) newList = newList.filter(id => id !== props.id);
                    else newList = Array.from(new Set([...newList, props.id]));
                    localStorage.setItem('wishlist', JSON.stringify(newList));
                } catch (err) {
                    // ignore
                }

                setShowWishlistNotification(true);
                setTimeout(() => setShowWishlistNotification(false), 2000);
            } catch (err) {
                console.error('Wishlist API error', err);
                setWishlistMessage(err.response?.data?.message || 'Failed to update wishlist');
                setShowWishlistNotification(true);
                setTimeout(() => setShowWishlistNotification(false), 2500);
            }
        })();
    };

    const handleCardClick = (e) => {
        if (isCompareMode) {
            e.preventDefault();
            
            // Get existing compare list
            const existingCompare = JSON.parse(localStorage.getItem('compareList') || '[]');
            
            // Check if already added
            const isAlreadyAdded = existingCompare.some(car => car.id === props.id);
            if (isAlreadyAdded) {
                alert('This car is already in your comparison list');
                navigate('/compare');
                return;
            }
            
            // Check if list is full
            if (existingCompare.length >= 3) {
                alert('You can only compare up to 3 cars');
                navigate('/compare');
                return;
            }
            
            // Add car to compare list
            const carData = {
                id: props.id,
                name: props.name,
                heroImage: props.img,
                price: props.price,
                dealer: { location: props.location },
                overall_length: props.overall_length,
                overall_width: props.overall_width,
                overall_height: props.overall_height,
                std_seating: props.std_seating,
                specifications: {
                    leftColumn: [
                        {
                            items: [
                                { label: 'Year', value: props.year },
                                { label: 'Body Type', value: 'Sedan' },
                                { label: 'Color', value: 'Black' },
                                { label: 'Doors', value: '4' },
                                { label: 'Fuel Type', value: props.fuel }
                            ]
                        },
                        {
                            items: [
                                { label: 'Roof Type', value: 'Hardtop' },
                                { label: 'Drivetrain', value: props.wheel },
                                { label: 'Seats', value: props.seats },
                                { label: 'Transmission', value: 'Automatic' }
                            ]
                        },
                        {
                            items: [
                                { label: 'Engine Type', value: props.fuel === 'Electric' ? 'Electric Motor' : 'Internal Combustion' },
                                { label: 'Horsepower', value: 'N/A' },
                                { label: 'Torque', value: 'N/A' }
                            ]
                        },
                        {
                            items: [
                                { label: 'Length', value: props.overall_length ? `${props.overall_length} mm` : 'N/A' },
                                { label: 'Width', value: props.overall_width ? `${props.overall_width} mm` : 'N/A' },
                                { label: 'Height', value: props.overall_height ? `${props.overall_height} mm` : 'N/A' }
                            ]
                        }
                    ]
                },
                images: props.photo_links || [props.img]
            };
            
            existingCompare.push(carData);
            localStorage.setItem('compareList', JSON.stringify(existingCompare));
            
            // Navigate back to compare page
            navigate('/compare');
        }
    };

    const location = useLocation();
    const showActions = location.pathname === '/carlisting' || location.pathname.startsWith('/carlisting');

    return (
        <div className="relative w-full rounded-[3px] border p-6 border-blue-300 bg-gray-900 flex flex-col h-full pb-20">
            {showLoginNotification && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
                    You need to login before adding to wishlist.
                    <button onClick={() => navigate('/login')} className="underline ml-2">Login</button>
                </div>
            )}
            {showWishlistNotification && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
                    {wishlistMessage}
                </div>
            )}
            <div className="h-[14rem] w-full flex-shrink-0">
            <Link to={linkTo}>
                <img className="mx-auto h-full w-full block rounded-[3px] object-cover" src={props.img} alt="" />
            </Link>
            </div>
            <div className="pt-2 flex-1 flex flex-col justify-between">
            <div className="mb-2 flex items-center justify-between gap-4">
                <div className="border border-blue-500 text-blue-500 px-3 py-0.5 rounded-[3px] bg-transparent text-sm">
                    {props.status}
                </div>
            </div>

            <Link to={linkTo} onClick={handleCardClick} className="text-lg sm:text-xl font-semibold leading-tight hover:underline text-white line-clamp-2">{props.name}</Link>

            <div className="mt-3 flex flex-col gap-2">
                <p className="text-lg sm:text-xl font-medium text-blue-500">{props.price}</p>
                <p className="text-sm sm:text-md text-white truncate">{props.location}</p>
            </div>

            <ul className="mt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
                <li className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2ZM1 8h18V6H1v2Zm3 3v.01h2V11H4Zm1 1.01h.01v-2H5v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H5v2h.01v-2ZM9 11v.01h2V11H9Zm1 1.01h.01v-2H10v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM9 15v.01h2V15H9Zm1 1.01h.01v-2H10v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM14 15v.01h2V15h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM14 11v.01h2V11h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM4 15v.01h2V15H4Zm1 1.01h.01v-2H5v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H5v2h.01v-2Z"/>
                </svg>
                <p className="text-sm sm:text-md text-white">{props.year}</p>
                </li>

                <li className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                </svg>
                <p className="text-sm sm:text-md text-white truncate">{props.wheel}</p>
                </li>
            </ul>

            <ul className="mt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
                <li className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.287 5H15m3.852 3H15m3.384 3H15m-9.47-.764h-.972A14.755 14.755 0 0 1 4.445 8c-.019-.747.019-1.494.113-2.236h.972a.95.95 0 0 0 .946-.856l.188-1.877a.951.951 0 0 0-.946-1.046H3.791a1.127 1.127 0 0 0-1.067.75A16.11 16.11 0 0 0 2 8a16.737 16.737 0 0 0 .743 5.242c.154.463 1.255.773 1.743.773h1.232a.95.95 0 0 0 .946-1.046l-.188-1.877a.95.95 0 0 0-.946-.856ZM19.063 2H10v12h8.273l1.716-10.847A.981.981 0 0 0 19.063 2ZM20 18H9v-2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2Z"/>
                </svg>
                <p className="text-sm sm:text-md text-white">{props.fuel}</p>
                </li>

                <li className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                <p className="text-sm sm:text-md text-white">{props.seats}</p>
                </li>
            </ul>

            {/* Action Buttons (only on public Car Listing) - moved into bottom children area so they align */}

            {/* CHILDREN EXTRA UI (admin delete button, etc.) */}
            <div className={`${children ? '' : ''} absolute left-6 right-6 bottom-6 flex gap-2 items-center`}> 
                {showActions && (
                  <>
                    <button
                        onClick={handleAddToWishlist}
                        className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-[3px] transition-colors text-sm font-medium"
                    >
                        <svg
                            className={`h-4 w-4 ${isWishlisted ? 'text-pink-600' : ''}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            fill={isWishlisted ? 'currentColor' : 'none'}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z" />
                        </svg>
                        <span className="truncate whitespace-nowrap">{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                    <button
                        onClick={handleAddToCompare}
                        className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors text-sm font-medium"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="truncate whitespace-nowrap">Add to Compare</span>
                    </button>
                  </>
                )}

                {/* Admin / custom children (Delete, Approve/Reject) */}
                {children}
            </div>
            
            </div>
        </div>
    );
}

export default ProductCard;