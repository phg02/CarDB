import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function VerificationCode(props) {
  const [otp, setOtp] = useState(Array(6).fill("")); // Array with 6 empty strings
  const inputRefs = useRef([]); // Array of refs for each input field
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from props or location state
  const registrationData = location.state;
  const email = (auth?.email || props?.email || registrationData?.email)?.trim();
  const isRegistration = registrationData?.isRegistration;

  const handleKeyDown = (e) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      const index = inputRefs.current.indexOf(e.target);
      // If current slot has a value, clear it; otherwise move to previous and clear that
      if (otp[index]) {
        setOtp((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        // keep focus on current
        inputRefs.current[index]?.focus();
      } else if (index > 0) {
        setOtp((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1),
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\s+/g, "");
    // If pasted text contains digits, fill up to otp length
    const digits = text.split("").filter((c) => /[0-9]/.test(c)).slice(0, otp.length);
    if (!digits.length) return;
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length; i++) {
        next[i] = digits[i];
      }
      return next;
    });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      let requestData = { email, otp: otpCode };
      
      // If this is registration verification, include registration data
      if (isRegistration && registrationData) {
        requestData = {
          ...requestData,
          name: registrationData.name,
          phone: registrationData.phone,
          password: registrationData.password
        };
      }

      const res = await api.post(
        "/api/auth/verify-otp",
        requestData
      );

      if (res.data.success) {
        toast.success(isRegistration ? "Registration completed successfully!" : "Email verified successfully!");
        
        if (isRegistration) {
          // For registration, set auth context and navigate to home
          // Note: The backend doesn't return tokens on verify-otp, so user needs to login
          navigate("/login");
        } else {
          // For other verifications, redirect to home or dashboard
          navigate("/");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    setIsResending(true);
    try {
      // For registration, use /register endpoint; for authenticated users, use /send-otp
      const endpoint = isRegistration ? "/auth/register" : "/auth/send-otp";
      const requestData = isRegistration ? { email } : { email }; // both endpoints expect email in body
      
      await api.post(endpoint, requestData);
      toast.success("OTP resent to your email");
      setOtp(Array(6).fill("")); // Clear the OTP inputs
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="py-10 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 text-center flex flex-col items-center justify-center space-y-4">
        <p className="text-xl font-semibold mb-1">Verification Code</p>
        <p className="text-gray-500 mb-6">A code has been sent to {email}</p>

        <form id="otp-form" className="flex gap-3 justify-center mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              aria-label={`Digit ${index + 1}`}
              className="shadow-xs flex items-center justify-center rounded-lg border border-stroke bg-white p-2 text-center text-2xl font-medium text-gray-900 outline-none w-12 h-12 sm:w-14 sm:h-14"
            />
          ))}
        </form>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>

        <p className="mt-3 text-sm text-gray-500">
          Don't see code?{' '}
          <button 
            type="button" 
            onClick={handleResendCode}
            disabled={isResending}
            className="text-blue-600 underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </div>
    </section>
  );
}
