import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define all steps with their routes and icons
  const steps = [
    {
      id: 1,
      name: 'Category',
      shortName: 'Category',
      route: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Select Plan',
      shortName: 'Plan',
      route: '/choose-plan',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 3,
      name: 'Add-ons',
      shortName: 'Add-ons',
      route: '/addons',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 4,
      name: 'Personal Details',
      shortName: 'Details',
      route: '/traveler-details',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 5,
      name: 'Review Summary',
      shortName: 'Review',
      route: '/review-summary',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 6,
      name: 'Payment',
      shortName: 'Payment',
      route: '/review-summary', // Payment happens on review page
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 7,
      name: 'Policy Created',
      shortName: 'Success',
      route: '/policy-success',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Determine current step based on route
  const getCurrentStep = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') return 1;
    if (currentPath === '/choose-plan') return 2;
    if (currentPath === '/addons') return 3;
    if (currentPath === '/traveler-details') return 4;
    if (currentPath === '/review-summary') return 5;
    if (currentPath === '/policy-success') return 7;
    return 0;
  };

  const currentStep = getCurrentStep();

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
            >
              <img
                src="/Postmyvisa-LOGO-PNG-scaled.png"
                alt="Postmyvisa Logo"
                className="h-12 w-auto object-contain drop-shadow-lg"
              />
            </button>
          </div>

          {/* Desktop Steps Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isAccessible = step.id <= currentStep;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isAccessible && navigate(step.route)}
                    disabled={!isAccessible}
                    className={`
                      group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40' 
                        : isCompleted
                        ? 'hover:bg-white/5 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {/* Step Number/Icon */}
                    <div
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                        ${isActive
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50'
                          : isCompleted
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : 'bg-white/5 text-white/40 border border-white/10'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <span className="text-xs font-bold">{step.id}</span>
                      ) : (
                        <span className="text-xs font-medium">{step.id}</span>
                      )}
                    </div>

                    {/* Step Name */}
                    <div className="flex flex-col items-start">
                      <span
                        className={`
                          text-xs font-semibold transition-colors duration-300
                          ${isActive
                            ? 'text-amber-400'
                            : isCompleted
                            ? 'text-white/80'
                            : 'text-white/40'
                          }
                        `}
                      >
                        {step.shortName}
                      </span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Progress Indicator */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30">
                {currentStep}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/50 font-medium">Step</span>
                <span className="text-sm text-amber-400 font-semibold">{currentStep} of 7</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Steps (Collapsed) */}
        <div className="lg:hidden pb-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`
                    flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium transition-all duration-300
                    ${isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : isCompleted
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-white/5 text-white/30'
                    }
                  `}
                >
                  {step.shortName}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ambient Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </nav>
  );
};

export default Navbar;
