'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {

  const [stripeConnectionId, setStripeConnectionId] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState<boolean>(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const [quickbooksConnectionId, setQuickbooksConnectionId] = useState<string | null>(null);
  const [isQuickbooksLoading, setIsQuickbooksLoading] = useState<boolean>(false);
  const [quickbooksError, setQuickbooksError] = useState<string | null>(null);

  useEffect(() => {
    const storedStripe = localStorage.getItem('stripeConnectionId');
    if (storedStripe) {
      setStripeConnectionId(storedStripe);
    }

    const storedQuickbooks = localStorage.getItem('quickbooksConnectionId');
    if (storedQuickbooks) {
      setQuickbooksConnectionId(storedQuickbooks);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlConnectionId = urlParams.get('connectionId');
    const urlProvider = urlParams.get('provider');

    if (urlConnectionId) {
      if (urlProvider === 'stripe' && urlConnectionId !== storedStripe) {
        setStripeConnectionId(urlConnectionId);
        localStorage.setItem('stripeConnectionId', urlConnectionId);
      } else if (urlProvider === 'quickbooks' && urlConnectionId !== storedQuickbooks) {
        setQuickbooksConnectionId(urlConnectionId);
        localStorage.setItem('quickbooksConnectionId', urlConnectionId);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnectProvider = async (providerName: string, setErrorState: React.Dispatch<React.SetStateAction<string | null>>, setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsLoadingState(true);
    setErrorState(null);
    try {
      const res = await fetch(`/api/unified/connect-link?provider=${providerName}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to get connect link for ${providerName}`);
      }
      const data = await res.json();

      console.log(`Unified.to authorization URL received for ${providerName}:`, data.url);

      if (data.url) {
        window.location.assign(data.url);
      } else {
        setErrorState(`Unified.to did not return a valid authorization URL for ${providerName}.`);
      }
    } catch (err: any) {
      console.error(`Error connecting ${providerName}:`, err);
      setErrorState(err.message || `An unexpected error occurred during ${providerName} connection.`);
    } finally {
      setIsLoadingState(false);
    }
  };

  const fetchAndNavigateToProviderAccount = async (providerName: string, connectionId: string | null, setErrorState: React.Dispatch<React.SetStateAction<string | null>>, setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>, navigatePath: string) => {
    if (!connectionId) {
      setErrorState(`No ${providerName} connection ID found. Please connect ${providerName} first.`);
      return;
    }

    setIsLoadingState(true);
    setErrorState(null);
    try {
      const res = await fetch(`/api/unified/${providerName}-account?connectionId=${connectionId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch ${providerName} account data`);
      }
      const data = await res.json();
      localStorage.setItem(`${providerName}AccountData`, JSON.stringify(data));
      window.location.assign(navigatePath);
    } catch (err: any) {
      console.error(`Error fetching ${providerName} account:`, err);
      setErrorState(err.message || `An unexpected error occurred while fetching ${providerName} data.`);
    } finally {
      setIsLoadingState(false);
    }
  };


  const handleDisconnectProvider = (providerName: string, setConnectionIdState: React.Dispatch<React.SetStateAction<string | null>>, setErrorState: React.Dispatch<React.SetStateAction<string | null>>) => {
    localStorage.removeItem(`${providerName}ConnectionId`);
    localStorage.removeItem(`${providerName}AccountData`);
    setConnectionIdState(null);
    setErrorState(null);
    console.log(`${providerName} connection disconnected.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Unified Integrations</h1>

        <div className="mb-8 border-b pb-6 border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Stripe Integration</h2>
          {isStripeLoading && <p className="text-blue-600 mb-4">Loading Stripe...</p>}
          {stripeError && <p className="text-red-600 mb-4">{stripeError}</p>}

          {!stripeConnectionId ? (
            <button
              onClick={() => handleConnectProvider('stripe', setStripeError, setIsStripeLoading)}
              disabled={isStripeLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Connect Stripe Account
            </button>
          ) : (
            <div className="flex flex-col space-y-4">
              <p className="text-green-600">Stripe Connected! Connection ID: <span className="font-mono text-sm break-all">{stripeConnectionId}</span></p>
              <button
                onClick={() => fetchAndNavigateToProviderAccount('stripe', stripeConnectionId, setStripeError, setIsStripeLoading, '/stripe-data')}
                disabled={isStripeLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              >
                Fetch & View Stripe Data
              </button>
              <button
                onClick={() => handleDisconnectProvider('stripe', setStripeConnectionId, setStripeError)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              >
                Disconnect Stripe
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">QuickBooks Integration</h2>
          {isQuickbooksLoading && <p className="text-blue-600 mb-4">Loading QuickBooks...</p>}
          {quickbooksError && <p className="text-red-600 mb-4">{quickbooksError}</p>}

          {!quickbooksConnectionId ? (
            <button
              onClick={() => handleConnectProvider('quickbooks', setQuickbooksError, setIsQuickbooksLoading)}
              disabled={isQuickbooksLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
            >
              Connect QuickBooks Account
            </button>
          ) : (
            <div className="flex flex-col space-y-4">
              <p className="text-green-600">QuickBooks Connected! Connection ID: <span className="font-mono text-sm break-all">{quickbooksConnectionId}</span></p>
              <button
                onClick={() => fetchAndNavigateToProviderAccount('quickbooks', quickbooksConnectionId, setQuickbooksError, setIsQuickbooksLoading, '/quickbooks-data')}
                disabled={isQuickbooksLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
              >
                Fetch & View QuickBooks Data
              </button>
              <button
                onClick={() => handleDisconnectProvider('quickbooks', setQuickbooksConnectionId, setQuickbooksError)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              >
                Disconnect QuickBooks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
