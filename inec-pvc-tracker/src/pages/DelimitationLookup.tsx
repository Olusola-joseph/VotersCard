/**
 * Delimitation Code Lookup Page
 * Allows users to search and parse delimitation codes in various formats
 */

import React, { useState } from 'react';
import { usePVC } from '../context/PVCContext';
import { Search, MapPin, Building, Home, CheckCircle, XCircle } from 'lucide-react';

const DelimitationLookup: React.FC = () => {
  const { parseAndLookupCode } = usePVC();
  const [searchCode, setSearchCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!searchCode.trim()) {
      setError('Please enter a delimitation code');
      return;
    }

    const parsed = parseAndLookupCode(searchCode.trim());
    
    if (parsed) {
      setResult(parsed);
    } else {
      setError('Invalid delimitation code format. Expected format: 27/20/15/008, 27-20-15-008, or 27 20 15 008');
    }
  };

  const exampleCodes = [
    { code: '27/20/15/008', label: 'Slash-separated' },
    { code: '27-20-15-008', label: 'Hyphen-separated' },
    { code: '27 20 15 008', label: 'Space-separated' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Delimitation Code Lookup</h1>
        <p className="text-gray-600 mt-2">
          Search and verify INEC electoral delimitation codes for Ogun State
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="searchCode" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Delimitation Code
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="searchCode"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g., 27/20/15/008 or 27-20-15-008"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Example codes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Supported formats:</p>
            <div className="flex flex-wrap gap-3">
              {exampleCodes.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSearchCode(example.code)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-mono text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {example.code} <span className="text-gray-400">({example.label})</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Lookup Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">Delimitation Details</h2>
          </div>

          {/* Hierarchy Visualization */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span>Electoral Hierarchy:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  State
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  LGA
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  Ward
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Polling Unit
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* State Level */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-700">State (Tier 1)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-sm font-mono font-medium">{result.stateCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">{result.stateName}</span>
                </div>
              </div>
            </div>

            {/* LGA Level */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-700">LGA (Tier 2)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-sm font-mono font-medium">{result.lgaCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">{result.lgaName}</span>
                </div>
              </div>
            </div>

            {/* Ward Level */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-gray-700">Ward (Tier 3)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-sm font-mono font-medium">{result.wardCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">{result.wardName}</span>
                </div>
              </div>
            </div>

            {/* Polling Unit Level */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-700">Polling Unit (Tier 4)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-sm font-mono font-medium">{result.puCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium">{result.puName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Code Display */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-2">Standardized Full Code:</p>
            <p className="text-lg font-mono text-blue-900">{result.fullCode}</p>
            <p className="text-xs text-blue-600 mt-2">
              Format: {result.stateCode}/{result.lgaCode}/{result.wardCode}/{result.puCode} = 
              {result.stateName}/{result.lgaName}/{result.wardName}/{result.puName}
            </p>
          </div>

          {/* Code Parsing Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Code Structure Breakdown:</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded border">
                <p className="text-xs text-gray-500">State</p>
                <p className="text-lg font-mono font-bold text-blue-600">{result.stateCode}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-xs text-gray-500">LGA</p>
                <p className="text-lg font-mono font-bold text-purple-600">{result.lgaCode}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-xs text-gray-500">Ward</p>
                <p className="text-lg font-mono font-bold text-orange-600">{result.wardCode}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-xs text-gray-500">PU</p>
                <p className="text-lg font-mono font-bold text-green-600">{result.puCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong className="text-gray-800">1. Enter a delimitation code</strong> in any of the supported formats:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
            <li>Slash-separated: <code className="bg-gray-100 px-2 py-1 rounded font-mono">27/20/15/008</code></li>
            <li>Hyphen-separated: <code className="bg-gray-100 px-2 py-1 rounded font-mono">27-20-15-008</code></li>
            <li>Space-separated: <code className="bg-gray-100 px-2 py-1 rounded font-mono">27 20 15 008</code></li>
          </ul>
          <p>
            <strong className="text-gray-800">2. Click Search</strong> to parse and lookup the code details.
          </p>
          <p>
            <strong className="text-gray-800">3. View Results</strong> showing the complete hierarchical breakdown from State to Polling Unit level.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DelimitationLookup;
