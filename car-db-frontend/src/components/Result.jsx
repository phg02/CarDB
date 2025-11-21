import { useState } from "react";

function Result({ count = 0, onSortChange }) {
    const [sort, setSort] = useState("default");

    const handleSort = (value) => {
        setSort(value);

        // If parent component wants to react to sorting
        if (onSortChange) {
            onSortChange(value);
        }
    };

    return (
        <div>
            <div>
                <dl className="flex items-center justify-between">
                    <dt className="text-3xl font-medium text-white">
                        {count} Results
                    </dt>
                    <dd className="text-base text-white">
                        <select
                            value={sort}
                            onChange={(e) => handleSort(e.target.value)}
                            className="rounded-[3px] text-white bg-gray-700 px-2 py-2"
                        >
                            <option value="default">Sort by</option>
                            <option value="price_low">Price: Low → High</option>
                            <option value="price_high">Price: High → Low</option>
                            <option value="year_new">Year: Newest first</option>
                            <option value="year_old">Year: Oldest first</option>
                        </select>
                    </dd>
                </dl>    
            </div>
        </div>
    );
}

export default Result;
