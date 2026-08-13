import React, { useState, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const GuidedTour: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('aim_tour_completed');
    if (!isCompleted) {
      setShowPrompt(true);
    }

    const startTourListener = () => {
      setShowPrompt(false);
      startTour();
    };

    window.addEventListener('start-tour', startTourListener);
    return () => window.removeEventListener('start-tour', startTourListener);
  }, []);

  const handleSkip = () => {
    localStorage.setItem('aim_tour_completed', 'true');
    setShowPrompt(false);
  };

  const startTour = () => {
    localStorage.setItem('aim_tour_completed', 'true');
    setShowPrompt(false);

    const tourDriver = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Finish',
      steps: [
        {
          element: '#tour-dev-clock',
          popover: {
            title: 'System Time / Dev-Clock',
            description: 'Use the simulated time travel feature to advance the clock and test auto-expiry scenarios for your agents.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-telemetry-bar',
          popover: {
            title: 'Operational Telemetry Bar',
            description: 'Monitor your top-level metrics including Total, Active, Suspended, Stale, and Expiring agent identities at a glance.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-analytics',
          popover: {
            title: 'Scope & Team Analytics',
            description: 'Analyze how tool permissions and risk are distributed across your owning teams using these dynamic charts.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#tour-chart-switcher',
          popover: {
            title: 'Multi-View Chart Switcher',
            description: 'Toggle this dropdown to explore different rich visualizations of agent lifecycles, activity trends, and inactivity heatmaps.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#tour-sidebar',
          popover: {
            title: 'Sidebar Navigation',
            description: 'Quickly access the Agents Directory, Security Access Reviews, API Simulator, and immutable Audit Log from here.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-ai-support',
          popover: {
            title: 'AI Support Agent',
            description: 'Have questions? Talk to our AI-powered chatbot at any time for support managing your machine identities.',
            side: 'left',
            align: 'end'
          }
        }
      ]
    });

    tourDriver.drive();
  };

  return (
    <>
      <style>{`
        .driver-popover {
          background-color: #ffffff !important;
          border-radius: 1.5rem !important;
          padding: 1.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid #f1f5f9 !important;
          font-family: inherit !important;
        }
        .driver-popover-progress-text {
          background-color: #e0e7ff !important;
          color: #4338ca !important;
          font-weight: 700 !important;
          font-size: 0.75rem !important;
          padding: 0.25rem 0.75rem !important;
          border-radius: 9999px !important;
          margin-bottom: 0.5rem !important;
          display: inline-block !important;
        }
        .driver-popover-title {
          background: linear-gradient(to right, #4f46e5, #9333ea, #ec4899) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
          font-weight: 800 !important;
          font-size: 1.125rem !important;
          margin: 0 !important;
        }
        .driver-popover-description {
          color: #475569 !important;
          font-size: 0.875rem !important;
          line-height: 1.625 !important;
          margin-top: 0.5rem !important;
        }
        .driver-popover-footer {
          margin-top: 1.5rem !important;
        }
        .driver-popover-next-btn, .driver-popover-done-btn {
          background-color: #0f172a !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          padding: 0.5rem 1.25rem !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          text-shadow: none !important;
          transition: transform 0.2s !important;
          border: none !important;
        }
        .driver-popover-next-btn:hover, .driver-popover-done-btn:hover {
          transform: scale(1.05) !important;
        }
        .driver-popover-prev-btn,
        .driver-popover-close-btn {
          color: #64748b !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          text-shadow: none !important;
        }
        .driver-popover-prev-btn:hover,
        .driver-popover-close-btn:hover {
          text-decoration: underline !important;
          color: #0f172a !important;
        }
      `}</style>
      
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
            <div className="flex justify-center mb-4 text-4xl">🛡️</div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
              Welcome to Agent Identity Manager
            </h2>
            <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
              Would you like a quick 1-minute guided tour of our Zero-Trust Machine Identity platform?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={startTour}
                className="w-full bg-slate-900 hover:scale-105 text-white font-semibold py-2.5 rounded-full transition-transform shadow-md cursor-pointer"
              >
                Start Tour
              </button>
              <button
                onClick={handleSkip}
                className="w-full hover:underline text-slate-600 font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuidedTour;
