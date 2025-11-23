import { useState } from "react";
import PriceRange from "./PriceRange";

function Filter() {
    const [openYear, setOpenYear] = useState(false);
    const [openBrand, setOpenBrand] = useState(false);
    const [openModel, setOpenModel] = useState(false);
    const [openBodyType, setOpenBodyType] = useState(false);
    const [openTransmission, setOpenTransmission] = useState(false);
    const [openFuelType, setOpenFuelType] = useState(false);
    const [openDrivetrain, setOpenDrivetrain] = useState(false);
    const [openSeats, setOpenSeats] = useState(false);
    const [openCity, setOpenCity] = useState(false);

    const [years, setYears] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [transmissions, setTransmissions] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [drivetrains, setDrivetrains] = useState([]);
    const [seats, setSeats] = useState([]);
    const [cities, setCities] = useState([]);

    const yearOptions = ["2025", "2024", "2023", "2022"];
    const brandOptions = ["Tesla", "BMW", "Toyota", "Ford"];
    const modelOptions = ["Model S", "Model 3", "X5", "Camry"];
    const bodyTypeOptions = ["Sedan", "SUV", "Truck", "Coupe"];
    const transmissionOptions = ["Automatic", "Manual"];
    const fuelTypeOptions = ["Gasoline", "Diesel", "Electric", "Hybrid"];
    const drivetrainOptions = ["FWD", "RWD", "AWD"];
    const seatsOptions = ["2", "4", "5", "7"];
    const cityOptions = ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco"];

    const toggleYear = (value) => {
        setYears((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleBrand = (value) => {
        setBrands((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleModel = (value) => {
        setModels((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleBodyType = (value) => {
        setBodyTypes((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleTransmission = (value) => {
        setTransmissions((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleFuelType = (value) => {
        setFuelTypes((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleDrivetrain = (value) => {
        setDrivetrains((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleSeats = (value) => {
        setSeats((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleCity = (value) => {
        setCities((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    return (
        <div className="w-full lg:max-w-[360px] max-h-none lg:max-h-[760px] bg-gray-800 px-3 py-3 rounded-[3px] mb-6 lg:mb-0">
            <p className="text-xl sm:text-2xl text-white">Filters</p>
            <hr className="h-px mb-4 sm:mb-7 mt-3 bg-white border-0"></hr>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:flex lg:flex-col lg:gap-4">

                {/* YEAR FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenYear(!openYear)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Year</span>
                        <span className="flex-shrink-0">{openYear ? "▲" : "▼"}</span>
                    </button>

                    {openYear && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {yearOptions.map((y) => (
                                <label key={y} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={years.includes(y)}
                                        onChange={() => toggleYear(y)}
                                    />
                                    {y}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* BRAND FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenBrand(!openBrand)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Brand</span>
                        <span className="flex-shrink-0">{openBrand ? "▲" : "▼"}</span>
                    </button>

                    {openBrand && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {brandOptions.map((b) => (
                                <label key={b} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={brands.includes(b)}
                                        onChange={() => toggleBrand(b)}
                                    />
                                    {b}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODEL FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenModel(!openModel)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Model</span>
                        <span className="flex-shrink-0">{openModel ? "▲" : "▼"}</span>
                    </button>

                    {openModel && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {modelOptions.map((m) => (
                                <label key={m} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={models.includes(m)}
                                        onChange={() => toggleModel(m)}
                                    />
                                    {m}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* BODY TYPE FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenBodyType(!openBodyType)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Body type</span>
                        <span className="flex-shrink-0">{openBodyType ? "▲" : "▼"}</span>
                    </button>

                    {openBodyType && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {bodyTypeOptions.map((bt) => (
                                <label key={bt} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={bodyTypes.includes(bt)}
                                        onChange={() => toggleBodyType(bt)}
                                    />
                                    {bt}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* TRANSMISSION FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenTransmission(!openTransmission)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Transmission</span>
                        <span className="flex-shrink-0">{openTransmission ? "▲" : "▼"}</span>
                    </button>

                    {openTransmission && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {transmissionOptions.map((t) => (
                                <label key={t} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={transmissions.includes(t)}
                                        onChange={() => toggleTransmission(t)}
                                    />
                                    {t}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* FUEL TYPE FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenFuelType(!openFuelType)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Fuel type</span>
                        <span className="flex-shrink-0">{openFuelType ? "▲" : "▼"}</span>
                    </button>

                    {openFuelType && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {fuelTypeOptions.map((ft) => (
                                <label key={ft} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={fuelTypes.includes(ft)}
                                        onChange={() => toggleFuelType(ft)}
                                    />
                                    {ft}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* DRIVETRAIN FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenDrivetrain(!openDrivetrain)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Drivetrain</span>
                        <span className="flex-shrink-0">{openDrivetrain ? "▲" : "▼"}</span>
                    </button>
                    {openDrivetrain && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {drivetrainOptions.map((dt) => (
                                <label key={dt} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={drivetrains.includes(dt)}
                                        onChange={() => toggleDrivetrain(dt)}
                                    />
                                    {dt}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* SEATS FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenSeats(!openSeats)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">Seats</span>
                        <span className="flex-shrink-0">{openSeats ? "▲" : "▼"}</span>
                    </button>

                    {openSeats && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {seatsOptions.map((s) => (
                                <label key={s} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={seats.includes(s)}
                                        onChange={() => toggleSeats(s)}
                                    />
                                    {s}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* CITY FILTER */}
                <div className="relative">
                    <button
                        onClick={() => setOpenCity(!openCity)}
                        className="w-full flex items-center justify-between gap-2 rounded-[3px] p-3.5 text-sm bg-gray-700 text-white whitespace-nowrap"
                    >
                        <span className="truncate">City</span>
                        <span className="flex-shrink-0">{openCity ? "▲" : "▼"}</span>
                    </button>

                    {openCity && (
                        <div className="absolute left-0 right-0 mt-1 rounded shadow-lg bg-gray-700 p-3 z-20">
                            {cityOptions.map((c) => (
                                <label key={c} className="flex items-center gap-2 py-1 text-sm text-gray-900 text-white">
                                    <input
                                        type="checkbox"
                                        checked={cities.includes(c)}
                                        onChange={() => toggleCity(c)}
                                    />
                                    {c}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <PriceRange className="col-span-2 sm:col-span-3 lg:col-span-1" />

            </div>
        </div>
    );
}

export default Filter;
