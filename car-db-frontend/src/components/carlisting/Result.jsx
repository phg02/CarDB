function Result({ count = 0, onSortChange, sort = 'default' }) {
    const handleSort = (value) => {
        if (onSortChange) onSortChange(value);
    };

    return (
        <div>
            <div>
                <dl
                    className="
                        flex flex-wrap items-center 
                        gap-3 
                        justify-between
                    "
                >
                    <dt className="text-3xl font-medium text-white">
                        {count} Results
                    </dt>

                    <dd>
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
