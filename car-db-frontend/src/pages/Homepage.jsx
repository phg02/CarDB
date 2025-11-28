import React from "react";
import Hero from "../components/homepage/Hero";
import RecommendedCars from "../components/homepage/RecommendedCars";
import Forums from "../components/homepage/Forum";
import AboutUs from "../components/homepage/AboutUs";
import Services from "../components/homepage/Services";
import Testimonials from "../components/homepage/Testimonials";
import ContactUs from "../components/homepage/ContactUs";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-primary selection:text-white">
      <Hero />
      <div className="space-y-24 pb-24">
        <RecommendedCars />
        <Forums />
        <AboutUs />
        <Services />
        <Testimonials />
        <ContactUs />
      </div>
    </div>
  );
};

export default Homepage;
