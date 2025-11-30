import { RegisterForm } from "../components/signin/RegisterForm";
import { WelcomeCard } from "../components/signin/WelcomeCard";

export const Signin = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto w-full px-4">
        <div className="flex justify-center lg:justify-end">
          <RegisterForm />
        </div>
        <div className="flex justify-center lg:justify-start">
          <WelcomeCard />
        </div>
      </div>
    </div>
  );
};
