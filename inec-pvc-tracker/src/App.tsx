import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PVCProvider } from './context/PVCContext';
import Dashboard from './pages/Dashboard';
import DelimitationLookup from './pages/DelimitationLookup';
import ElectoralBrowser from './pages/ElectoralBrowser';
import { MapPin, Search, Layers } from 'lucide-react';

function App() {
  return (
    <PVCProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">INEC Ogun State</h1>
                    <p className="text-xs text-green-100">PVC Distribution Tracking System</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-500 transition-colors"
                  >
                    <Layers className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/lookup" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-500 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    <span>Code Lookup</span>
                  </Link>
                  <Link 
                    to="/browser" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-500 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Browse Structure</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lookup" element={<DelimitationLookup />} />
              <Route path="/browser" element={<ElectoralBrowser />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PVCProvider>
  );
}

export default App;
