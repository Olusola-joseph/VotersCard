import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { PVCProvider } from './context/PVCContext';
import Dashboard from './pages/Dashboard';
import DelimitationLookup from './pages/DelimitationLookup';
import ElectoralBrowser from './pages/ElectoralBrowser';
import Login from './pages/Login';
import { MapPin, Search, Layers, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                
                {isLoggedIn ? (
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
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-md hover:bg-green-50 transition-colors font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/lookup" element={isLoggedIn ? <DelimitationLookup /> : <Navigate to="/login" />} />
              <Route path="/browser" element={isLoggedIn ? <ElectoralBrowser /> : <Navigate to="/login" />} />
              <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PVCProvider>
  );
}

export default App;
