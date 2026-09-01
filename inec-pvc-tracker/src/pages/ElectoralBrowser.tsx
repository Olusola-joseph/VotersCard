/**
 * LGA/Ward/PU Browser Page
 * Navigate the hierarchical electoral structure
 */

import React, { useState } from 'react';
import { usePVC } from '../context/PVCContext';
import { getLGAs, getWardsByLGA, getPollingUnitsByWard } from '../data/electoralData';
import { ChevronRight, MapPin, Building, Home, Users } from 'lucide-react';

const ElectoralBrowser: React.FC = () => {
  const { distributionStatuses } = usePVC();
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  const lgas = getLGAs();

  const getStatusForPU = (lgaCode: string, wardCode: string, puCode: string) => {
    const puId = `27/${lgaCode}/${wardCode}/${puCode}`;
    return distributionStatuses.find(s => s.puId === puId);
  };

  const getLGAStats = (lgaCode: string) => {
    const wards = getWardsByLGA(lgaCode);
    const totalPUs = wards.reduce((sum, w) => sum + (w.pollingUnitsCount || 0), 0);
    
    // Get statuses for this LGA
    const lgaStatuses = distributionStatuses.filter(s => s.puId.split('/')[1] === lgaCode);
    const avgCollection = lgaStatuses.length > 0
      ? Math.round(lgaStatuses.reduce((sum, s) => sum + s.collectionPercentage, 0) / lgaStatuses.length)
      : 0;

    return { totalPUs, avgCollection, totalWards: wards.length };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Electoral Structure Browser</h1>
        <p className="text-gray-600 mt-2">
          Navigate through Ogun State's hierarchical electoral structure
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => { setSelectedLGA(null); setSelectedWard(null); }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ogun State
          </button>
          
          {selectedLGA && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setSelectedWard(null)}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                {lgas.find(l => l.code === selectedLGA)?.name}
              </button>
            </>
          )}
          
          {selectedWard && selectedLGA && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-orange-600 font-medium">
                Ward {selectedWard}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content based on selection level */}
      {!selectedLGA ? (
        /* LGA Level View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lgas.map((lga) => {
            const stats = getLGAStats(lga.code);
            return (
              <div
                key={lga.code}
                onClick={() => setSelectedLGA(lga.code)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Building className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{lga.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">Code: {lga.code}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Wards:</span>
                    <span className="font-medium">{stats.totalWards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Polling Units:</span>
                    <span className="font-medium">{stats.totalPUs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Collection:</span>
                    <span className={`font-medium ${
                      stats.avgCollection >= 75 ? 'text-green-600' :
                      stats.avgCollection >= 50 ? 'text-blue-600' :
                      stats.avgCollection >= 25 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {stats.avgCollection}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !selectedWard ? (
        /* Ward Level View */
        <div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-purple-900">
              {lgas.find(l => l.code === selectedLGA)?.name} - Wards
            </h2>
            <p className="text-sm text-purple-700 mt-1">
              Select a ward to view its polling units
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getWardsByLGA(selectedLGA).map((ward) => {
              const wardPUs = getPollingUnitsByWard(selectedLGA, ward.code);
              const wardStatuses = wardPUs.map(pu => getStatusForPU(selectedLGA, ward.code, pu.code));
              const avgCollection = wardStatuses.filter(Boolean).length > 0
                ? Math.round(wardStatuses.filter(Boolean).reduce((sum: any, s: any) => sum + s.collectionPercentage, 0) / wardStatuses.filter(Boolean).length)
                : 0;

              return (
                <div
                  key={ward.code}
                  onClick={() => setSelectedWard(ward.code)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Home className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Ward {ward.code}</h3>
                        <p className="text-sm text-gray-600">{ward.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total PUs:</span>
                      <span className="font-medium">{ward.pollingUnitsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sampled PUs:</span>
                      <span className="font-medium">{wardPUs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Collection:</span>
                      <span className={`font-medium ${
                        avgCollection >= 75 ? 'text-green-600' :
                        avgCollection >= 50 ? 'text-blue-600' :
                        avgCollection >= 25 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {avgCollection || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Polling Unit Level View */
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-orange-900">
              Ward {selectedWard} - Polling Units
            </h2>
            <p className="text-sm text-orange-700 mt-1">
              Detailed view of all polling units in this ward
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PU Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PU Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered Voters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PVC Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPollingUnitsByWard(selectedLGA, selectedWard).map((pu) => {
                  const status = getStatusForPU(selectedLGA, selectedWard, pu.code);
                  return (
                    <tr key={pu.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        27/{selectedLGA}/{selectedWard}/{pu.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pu.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pu.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {pu.registeredVoters?.toLocaleString() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {status ? `${status.pvcCollected.toLocaleString()} (${status.collectionPercentage}%)` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {status && (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${status.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            ${status.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                            ${status.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                            ${status.status === 'delayed' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {status.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {getPollingUnitsByWard(selectedLGA, selectedWard).length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>No polling unit data available for this ward yet.</p>
                <p className="text-sm mt-2">This is sample data - full data will be populated from INEC database.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectoralBrowser;
