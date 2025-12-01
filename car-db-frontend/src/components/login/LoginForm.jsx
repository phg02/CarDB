import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full max-w-md space-y-6 py-12">
      <div className="space-y-2">
        <label htmlFor="email" className="text-foreground text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@mail.com"
          className="w-full h-10 px-3 py-2 rounded-md border bg-input-bg border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-foreground text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="password"
            className="w-full h-10 px-3 py-2 rounded-md border bg-input-bg border-border text-foreground placeholder:text-muted-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-border" />
          Remember me
        </label>
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-md transition-colors">
        Sign in
      </button>

      <p className="text-center text-sm text-foreground">
        Don't have an account?{" "}
        <a href="/" className="text-primary hover:underline">
          Sign up here
        </a>
      </p>
    </div>
  );
};
