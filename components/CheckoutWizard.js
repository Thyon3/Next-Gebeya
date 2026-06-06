import React from "react";

export default function CheckoutWizard({ activeStep = 0 }) {
  const steps = [
    { name: "Shipping Address", icon: "🚚" },
    { name: "Payment Method", icon: "💳" },
    { name: "Place Order", icon: "✓" }
  ];

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <li
              className={`flex flex-col items-center ${
                index <= activeStep ? "opacity-100" : "opacity-40"
              }`}
              aria-current={index === activeStep ? "step" : undefined}
            >
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  index < activeStep
                    ? "bg-green-500 border-green-500 text-white"
                    : index === activeStep
                    ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500"
                }`}
              >
                {index < activeStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <span className={`text-sm font-semibold ${
                  index === activeStep 
                    ? "text-blue-600 dark:text-blue-400" 
                    : index < activeStep
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {step.name}
                </span>
                <span className="sr-only">
                  Step {index + 1} of {steps.length}
                  {index < activeStep && " (completed)"}
                  {index === activeStep && " (current)"}
                </span>
              </div>
            </li>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                index < activeStep 
                  ? "bg-green-500" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`} style={{ minWidth: "60px", maxWidth: "120px" }} />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

