import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getError } from "@/utils/error";
import axios from "axios";
import Head from "next/head";
import { signIn } from "next-auth/react";

export default function VerifyEmail() {
  const router = useRouter();
  const { email, password } = router.query;
  
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    // Get pasted data and clean it (remove spaces, newlines, etc.)
    const pastedData = e.clipboardData.getData("text")
      .replace(/\s/g, '') // Remove all whitespace
      .replace(/\D/g, '') // Remove all non-digits
      .slice(0, 6); // Take only first 6 digits
    
    if (!pastedData) {
      return;
    }

    const newCode = pastedData.split("");
    while (newCode.length < 6) {
      newCode.push("");
    }
    setVerificationCode(newCode);
    
    // Focus last filled input or last input if all filled
    const lastIndex = Math.min(pastedData.length - 1, 5);
    setTimeout(() => {
      document.getElementById(`code-${lastIndex}`)?.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clean the code by removing any spaces or non-digit characters
    const code = verificationCode.join("").replace(/\D/g, '');

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/auth/verify-email", {
        email,
        verificationCode: code,
      });

      toast.success(data.message);

      // Auto-login after verification
      if (password) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result.error) {
          toast.error(result.error);
          router.push("/login");
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      const error = getError(err);
      toast.error(error);
      
      if (err.response?.data?.expired) {
        // Code expired, allow resend
        setCountdown(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      await axios.post("/api/auth/resend-verification", { email });
      toast.success("Verification code sent! Check your email.");
      setCountdown(60); // 60 seconds cooldown
      setVerificationCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email - eShop</title>
        <meta name="description" content="Verify your email address" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Verify Your Email
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a 6-digit code to
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-600">
                {email}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || verificationCode.join("").length !== 6}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    The verification code expires in 10 minutes. Check your spam folder if you don't see the email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
