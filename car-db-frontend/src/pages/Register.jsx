import { RegisterForm } from "../components/register/RegisterForm";
import { WelcomeCard } from "../components/register/WelcomeCard";

export const Register = () => {
  return (
    <div className="max-h-screen flex items-center justify-center bg-background overflow-hidden pt-8">
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
