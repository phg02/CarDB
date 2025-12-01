import { useState } from "react";
import PriceRange from "../carlisting/PriceRange";

function DeliveredFilter() {
    const [status, setOpenStatus] = useState(false);

    const [statuses, setStatuses] = useState([]);

    const statusOptions = ["Delivered", "Not Delivered"];

    const toggleStatus = (value) => {
        setStatuses((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    }

    return (
        <div className="w-full lg:max-w-[360px] max-h-none lg:max-h-[150px] bg-gray-800 px-3 py-3 rounded-[3px] mb-6 lg:mb-0">
            <p className="text-xl sm:text-2xl text-white">Filters</p>
            <hr className="h-px mb-4 sm:mb-7 mt-3 bg-white border-0"></hr>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:flex lg:flex-col lg:gap-4">

                {/* STATUS FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenStatus(!status)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Status</span>
                        <span className="flex-shrink-0">{status ? "▲" : "▼"}</span>
                    </button>

                    {status && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {statusOptions.map((s) => (
                                <label key={s} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={statuses.includes(s)}
                                        onChange={() => toggleStatus(s)}
                                    />
                                    {s}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DeliveredFilter;
