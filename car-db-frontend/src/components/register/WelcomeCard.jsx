import { Facebook, Instagram, Youtube } from "lucide-react";

export const WelcomeCard = () => {
  return (
    <div className="w-full max-w-md border-2 border-card-border rounded-lg p-12 bg-card flex flex-col items-center justify-center text-center space-y-8">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="text-background"/>
            <circle cx="12" cy="12" r="4" fill="currentColor" className="text-background"/>
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" className="text-background"/>
          </svg>
        </div>
        <span className="text-2xl font-bold">
          Car <span className="text-primary">DB</span>
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Register</h2>
        <p className="text-muted-foreground text-lg">Welcome to Autohunt</p>
      </div>

      <div className="flex items-center gap-6">
        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
          aria-label="Facebook"
        >
          <Facebook className="w-6 h-6" />
        </a>
        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
          aria-label="Instagram"
        >
          <Instagram className="w-6 h-6" />
        </a>
        <a
          href="#"
          className="text-foreground hover:text-primary transition-colors"
          aria-label="YouTube"
        >
          <Youtube className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};
