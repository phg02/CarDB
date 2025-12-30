import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/logo.svg';

function Footer() {
  const location = useLocation();

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    
    // If not on homepage, navigate there first
    if (location.pathname !== '/') {
      window.location.href = `/#${targetId}`;
      return;
    }

    // Smooth scroll to the section
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-800 text-white rounded-base shadow-xs">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <Link to="/" className="flex items-center mb-4 sm:mb-0">
                    <img src={logo} className="h-8 mr-3" alt="CarDB Logo" />
                </Link>
                <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-body sm:mb-0">
                    <li>
                        <a href="#about-us" onClick={(e) => handleSmoothScroll(e, 'about-us')} className="hover:underline me-4 md:me-6">ABOUT US</a>
                    </li>
                    <li>
                        <Link to="/faq" className="hover:underline me-4 md:me-6">FAQ</Link>
                    
                    </li>
                    <li>
                        <a href="#contact-us" onClick={(e) => handleSmoothScroll(e, 'contact-us')} className="hover:underline">CONTACT</a>
                    </li>
                </ul>
            </div>
            <hr className="my-6 border-default sm:mx-auto lg:my-8" />
            <span className="block text-sm text-body sm:text-center">© 2025 <a href="" className="hover:underline">CarDB™</a>. All Rights Reserved.</span>
        </div>
    </footer>
  );
}

export default Footer;