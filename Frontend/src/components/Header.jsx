import React from 'react';

const Header = ({ currentStep = 1, totalSteps = 4, showProgress = true }) => {
  return (
    <header className="border-b border-[rgba(0,41,98,0.12)] bg-white sticky top-0 z-20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img 
            src="/Postmyvisa-LOGO-PNG-scaled.png" 
            alt="Postmyvisa Logo" 
            className="h-8 sm:h-10 w-auto object-contain cursor-pointer"
            onClick={() => window.location.href = '/'}
          />
        </div>
        
        {showProgress && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <span 
                  key={step} 
                  className={`h-1 w-5 rounded-full sm:w-6 transition-colors duration-300 ${
                    step === currentStep ? 'bg-gold' : step < currentStep ? 'bg-gold/60' : 'bg-[rgba(0,41,98,0.12)]'
                  }`} 
                />
              ))}
            </div>
            <span className="hidden text-[rgba(0,41,98,0.65)] text-xs font-medium sm:inline">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
