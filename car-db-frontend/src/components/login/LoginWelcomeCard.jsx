import React from 'react'
import { Facebook, Instagram, Youtube } from "lucide-react";

export const LoginWelcomeCard = () => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-card border-2 border-primary/60 rounded-lg p-12 flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-foreground rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="text-background"/>
              <circle cx="12" cy="12" r="4" fill="currentColor" className="text-background"/>
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" className="text-background"/>
            </svg>
          </div>
          <span className="text-3xl font-bold">
            Car <span className="text-primary">DB</span>
          </span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-foreground">Login</h2>
          <p className="text-lg text-muted-foreground">Welcome to Autohunt</p>
        </div>

        <div className="flex items-center gap-6 pt-4">
          <a 
            href="#" 
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-7 h-7" />
          </a>
          <a 
            href="#" 
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-7 h-7" />
          </a>
          <a 
            href="#" 
            className="text-foreground hover:text-primary transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="w-7 h-7" />
          </a>
        </div>
      </div>
    </div>
  )
}
