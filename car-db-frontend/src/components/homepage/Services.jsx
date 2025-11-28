import React from "react";
import { Car, Tag, BadgeDollarSign, Code } from "lucide-react";

const Services = () => {
  const services = [
    { icon: <Car size={32} />, title: "Buy a new car" },
    {
      icon: <Car size={32} className="opacity-70" />,
      title: "Buy an used car",
    },
    { icon: <BadgeDollarSign size={32} />, title: "Sell my car" },
    { icon: <Code size={32} />, title: "VIN Decoder" },
  ];

  return (
    <section className="container mx-auto px-4 md:px-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-10">Our Service</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="group border border-primary text-white p-8 rounded flex flex-col items-center justify-center gap-4 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer min-h-[180px]"
          >
            <div className="mb-2 text-white group-hover:scale-110 transition-transform duration-300">
              {service.icon}
            </div>
            <h3 className="font-semibold text-lg">{service.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
