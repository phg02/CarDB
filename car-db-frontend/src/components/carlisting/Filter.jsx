import { useState, useEffect } from "react";
import axios from "axios";
import PriceRange from "./PriceRange";

function Filter({ onFilterChange }) {
    // Dropdown toggle states
    const [openDropdowns, setOpenDropdowns] = useState({
        status: false,
        year: false,
        brand: false,
        model: false,
        bodyType: false,
        transmission: false,
        fuelType: false,
        drivetrain: false,
        seats: false,
        color: false,
        city: false
    });

    // Selected filters
    const [selectedFilters, setSelectedFilters] = useState({
        statuses: [],
        years: [],
        brands: [],
        models: [],
        bodyTypes: [],
        transmissions: [],
        fuelTypes: [],
        drivetrains: [],
        seats: [],
        colors: [],
        cities: [],
        priceRange: { min: 0, max: 1000000 }
    });

    // Filter options from API
    const [filterOptions, setFilterOptions] = useState({
        statusOptions: [],
        yearOptions: [],
        brandOptions: [],
        modelOptions: [],
        bodyTypeOptions: [],
        transmissionOptions: [],
        fuelTypeOptions: [],
        drivetrainOptions: [],
        seatsOptions: [],
        colorOptions: [],
        cityOptions: []
    });

    const [selectedBrand, setSelectedBrand] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toggle dropdown visibility
    const toggleDropdown = (dropdownName) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdownName]: !prev[dropdownName]
        }));
    };

    // Fetch all filter options on component mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/filters/all");
                
                setFilterOptions({
                    statusOptions: ["New", "Used"],
                    yearOptions: response.data.data.years || [],
                    brandOptions: response.data.data.brands || [],
                    modelOptions: [],
                    bodyTypeOptions: response.data.data.bodyTypes || [],
                    transmissionOptions: response.data.data.transmissions || [],
                    fuelTypeOptions: response.data.data.fuelTypes || [],
                    drivetrainOptions: response.data.data.drivetrains || [],
                    seatsOptions: response.data.data.seats || [],
                    colorOptions: response.data.data.colors || [],
                    cityOptions: response.data.data.cities || []
                });
                setError(null);
            } catch (err) {
                console.error("Error fetching filters:", err);
                setError(err.message || "Failed to load filters");
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, []);

    // Fetch models when brand is selected
    useEffect(() => {
        if (!selectedBrand) {
            setFilterOptions(prev => ({
                ...prev,
                modelOptions: []
            }));
            setSelectedFilters(prev => ({
                ...prev,
                models: []
            }));
            return;
        }

        const fetchModels = async () => {
            try {
                const response = await axios.get(`/api/filters/models/${selectedBrand}`);
                setFilterOptions(prev => ({
                    ...prev,
                    modelOptions: response.data.data || []
                }));
            } catch (err) {
                console.error("Error fetching models:", err);
            }
        };

        fetchModels();
    }, [selectedBrand]);

    // Notify parent component of filter changes
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(selectedFilters);
        }
    }, [selectedFilters, onFilterChange]);

    // Toggle filter function
    const toggleFilter = (filterType, value) => {
        setSelectedFilters(prev => {
            const filterArray = prev[filterType];
            const updatedArray = filterArray.includes(value)
                ? filterArray.filter(v => v !== value)
                : [...filterArray, value];
            
            return {
                ...prev,
                [filterType]: updatedArray
            };
        });

        // Handle brand selection to fetch models
        if (filterType === "brands") {
            if (!selectedFilters.brands.includes(value)) {
                setSelectedBrand(value);
            } else {
                setSelectedBrand("");
            }
        }
    };

    // Calculate total active filters
    const activeFiltersCount = Object.values(selectedFilters).reduce((count, filter) => {
        if (Array.isArray(filter)) return count + filter.length;
        return count;
    }, 0);

    // Render dropdown with options
    const renderDropdown = (title, dropdownKey, options) => {
        const isOpen = openDropdowns[dropdownKey];
        
        // Map title to filter type
        const filterTypeMap = {
            "Status": "statuses",
            "Year": "years",
            "Brand": "brands",
            "Model": "models",
            "Body type": "bodyTypes",
            "Transmission": "transmissions",
            "Fuel type": "fuelTypes",
            "Drivetrain": "drivetrains",
            "Seats": "seats",
            "Color": "colors",
            "City": "cities"
        };
        const filterType = filterTypeMap[title];

        return (
            <div className="relative" key={dropdownKey}>
                <button
                    onClick={() => toggleDropdown(dropdownKey)}
                    className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap hover:bg-gray-600 transition"
                >
                    <span className="truncate">{title}</span>
                    <span className="flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                    <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20 max-h-48 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <label key={option} className="flex items-center gap-2 py-1 text-sm text-white cursor-pointer hover:bg-gray-600 px-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filterType && selectedFilters[filterType].includes(option)}
                                        onChange={() => {
                                            if (filterType) toggleFilter(filterType, option);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {option}
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-2">No options available</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full lg:max-w-[360px] max-h-none lg:max-h-[880px] bg-gray-800 px-3 py-3 rounded-[3px] mb-6 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xl sm:text-2xl text-white">Filters</p>
                {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </div>
            <hr className="h-px mb-4 sm:mb-7 mt-3 bg-white border-0"></hr>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : error ? (
                <div className="bg-red-600 text-white p-3 rounded text-sm mb-4">
                    Error loading filters: {error}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:flex lg:flex-col lg:gap-4">
                    {renderDropdown("Status", "status", filterOptions.statusOptions)}
                    {renderDropdown("Year", "year", filterOptions.yearOptions)}
                    {renderDropdown("Brand", "brand", filterOptions.brandOptions)}
                    {renderDropdown("Model", "model", filterOptions.modelOptions)}
                    {renderDropdown("Body type", "bodyType", filterOptions.bodyTypeOptions)}
                    {renderDropdown("Transmission", "transmission", filterOptions.transmissionOptions)}
                    {renderDropdown("Fuel type", "fuelType", filterOptions.fuelTypeOptions)}
                    {renderDropdown("Drivetrain", "drivetrain", filterOptions.drivetrainOptions)}
                    {renderDropdown("Seats", "seats", filterOptions.seatsOptions)}
                    {renderDropdown("Color", "color", filterOptions.colorOptions)}
                    {renderDropdown("City", "city", filterOptions.cityOptions)}

                    <PriceRange className="col-span-2 sm:col-span-3 lg:col-span-1" onPriceChange={(min, max) => {
                        setSelectedFilters(prev => ({
                            ...prev,
                            priceRange: { min, max }
                        }));
                    }} />
                </div>
            )}

            {activeFiltersCount > 0 && (
                <button
                    onClick={() => {
                        setSelectedFilters({
                            statuses: [],
                            years: [],
                            brands: [],
                            models: [],
                            bodyTypes: [],
                            transmissions: [],
                            fuelTypes: [],
                            drivetrains: [],
                            seats: [],
                            colors: [],
                            cities: [],
                            priceRange: { min: 0, max: 1000000 }
                        });
                        setSelectedBrand("");
                    }}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded transition text-sm truncate"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );
}

export default Filter;
