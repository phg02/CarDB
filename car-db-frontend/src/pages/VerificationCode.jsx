import { useRef, useState } from "react";

export default function VerificationCode(props) {
  const [otp, setOtp] = useState(Array(6).fill("")); // Array with 6 empty strings
  const inputRefs = useRef([]); // Array of refs for each input field

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

  return (
    <section className="py-10 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 text-center flex flex-col items-center justify-center space-y-4">
        <p className="text-xl font-semibold mb-1">Verification Code</p>
        <p className="text-gray-500 mb-6">A code has been sent to {props.email}</p>

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
          className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
        >
          Verify
        </button>

        <p className="mt-3 text-sm text-gray-500">
          Don't see code?{' '}
          <button type="button" className="text-blue-600 underline">Resend code</button>
        </p>
      </div>
    </section>
  );
}
