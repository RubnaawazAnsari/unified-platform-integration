'use client';

import { useState, useEffect } from 'react';

export default function StripeDataPage() {
  const [stripeAccountData, setStripeAccountData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('stripeAccountData');
    if (storedData) {
      try {
        setStripeAccountData(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse Stripe data from localStorage:", e);
        setError("Failed to load Stripe data. Data might be corrupted.");
      }
    } else {
      setError("No Stripe account data found. Please go back and fetch data first.");
    }
  }, []);

  const handleGoBack = () => {
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Stripe Account Data</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {stripeAccountData ? (
          <div className="mt-6 text-left">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Fetched Data:</h2>
            <pre className="text-sm text-black bg-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-300">
              {JSON.stringify(stripeAccountData, null, 2)}
            </pre>
          </div>
        ) : (
          !error && <p className="text-gray-600">Loading Stripe data...</p>
        )}

        <button
          onClick={handleGoBack}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
