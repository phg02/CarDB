import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const ContactUs = () => {
  return (
    <section className="relative bg-darker py-20 mt-20">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/id/366/1920/800"
          alt="Contact Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/90 to-darker/50"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <h2 className="text-3xl font-bold mb-16">Contact Us</h2>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-12 bg-card/50 p-8 rounded-lg backdrop-blur-sm border border-slate-800">
            <div className="flex flex-col items-center text-center">
              <Phone size={24} className="text-white mb-2" />
              <h3 className="text-lg font-bold mb-1">Phone</h3>
              <p className="text-primary text-xl">240-865-3730</p>
            </div>

            <div className="w-16 h-0.5 bg-slate-700 mx-auto"></div>

            <div className="flex flex-col items-center text-center">
              <Mail size={24} className="text-white mb-2" />
              <h3 className="text-lg font-bold mb-1">Email</h3>
              <p className="text-primary">info@autohunt.com</p>
            </div>

            <div className="w-16 h-0.5 bg-slate-700 mx-auto"></div>

            <div className="flex flex-col items-center text-center">
              <MapPin size={24} className="text-white mb-2" />
              <h3 className="text-lg font-bold mb-1">Address</h3>
              <p className="text-primary max-w-xs">
                3926 Calvin Street, Baltimore, Maryland, 21201, United State
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@mail.com"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="000-000-000"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Comment
                </label>
                <textarea
                  placeholder="Leave a message here"
                  rows={4}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-sky-400 text-white font-bold py-3 rounded transition-colors shadow-lg shadow-primary/20"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
