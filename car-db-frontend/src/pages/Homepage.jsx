import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/homepage/Hero";
import RecommendedCars from "../components/homepage/RecommendedCars";
import Forums from "../components/homepage/Forum";
import AboutUs from "../components/homepage/AboutUs";
import Services from "../components/homepage/Services";
import Testimonials from "../components/homepage/Testimonials";
import ContactUs from "../components/homepage/ContactUs";

const Homepage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth, loading } = useAuth();

  // Check for payment redirect parameters
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    const paymentStatus = searchParams.get('payment_status');
    const redirect = searchParams.get('redirect');
    const tab = searchParams.get('tab');

    if (paymentStatus && redirect === 'settings') {
      // Redirect to settings with the parameters
      const params = new URLSearchParams();
      if (paymentStatus) params.set('payment_status', paymentStatus);
      if (tab) params.set('tab', tab);
      
      navigate(`/settings?${params.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, auth, loading]);

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
