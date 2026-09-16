import React, { useState, useEffect } from 'react';
import { usePhaseB } from '../../context/PhaseBContext';
import type { Caregiver } from '../../types';

interface Props {
  elderId: string;
  onSelectCaregiverForInterview: (caregiver: Caregiver) => void;
  onProceedToPayment?: (caregiver: Caregiver) => void;
  onBack?: () => void;
}

export const CaregiverMatchingWizard: React.FC<Props> = ({
  elderId,
  onSelectCaregiverForInterview,
  onBack
}) => {
  const {
    recommendations,
    shortlist,
    loading,
    error,
    fetchRecommendations,
    toggleShortlist
  } = usePhaseB();

  const [selectedCaregiverModal, setSelectedCaregiverModal] = useState<Caregiver | null>(null);
  const [filterLocality, setFilterLocality] = useState<string>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'SHORTLIST'>('MATCHES');

  useEffect(() => {
    fetchRecommendations(elderId);
  }, [elderId]);

  const filteredMatches = recommendations.filter(match => {
    if (filterLocality !== 'ALL' && !match.caregiver.serviceLocalities.includes(filterLocality)) {
      return false;
    }
    if (filterLanguage !== 'ALL' && !match.caregiver.languages.includes(filterLanguage)) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full">
            Phase B1 — Curated Caregiver Matching
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            Recommended Caregivers
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Caregivers matched based on your elder's medical conditions, language, and Chennai locality.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 border rounded-xl"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'MATCHES'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Best Matches ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('SHORTLIST')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'SHORTLIST'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shortlist ({shortlist.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={filterLocality}
            onChange={(e) => setFilterLocality(e.target.value)}
            className="text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Localities (Chennai)</option>
            <option value="Adyar">Adyar</option>
            <option value="Mylapore">Mylapore</option>
            <option value="Velachery">Velachery</option>
            <option value="T. Nagar">T. Nagar</option>
            <option value="Anna Nagar">Anna Nagar</option>
          </select>

          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Languages</option>
            <option value="Tamil">Tamil</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm mb-6 border border-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          Calculating match compatibility scores...
        </div>
      ) : activeTab === 'MATCHES' ? (
        filteredMatches.length === 0 ? (
          <div className="py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
            No caregivers found matching current filters. Try changing locality or language filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(({ caregiver, matchScore, matchReasons }) => {
              const isShortlisted = shortlist.some(c => c.id === caregiver.id);
              return (
                <div
                  key={caregiver.id}
                  className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Photo & Match Score */}
                    <div className="flex items-start justify-between">
                      <img
                        src={caregiver.profilePhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'}
                        alt={caregiver.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20"
                      />
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {matchScore}% Match
                        </span>
                        <div className="text-xs text-gray-400 mt-1 font-medium">
                          {caregiver.rating} ★ ({caregiver.reviewCount} reviews)
                        </div>
                      </div>
                    </div>

                    {/* Name & Basic Info */}
                    <h3 className="font-bold text-gray-900 text-lg mt-3">
                      {caregiver.fullName}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {caregiver.gender}, {caregiver.age} yrs • {caregiver.primaryLanguage}
                    </p>

                    {/* Service Localities */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {caregiver.serviceLocalities.slice(0, 3).map(loc => (
                        <span key={loc} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          📍 {loc}
                        </span>
                      ))}
                    </div>

                    {/* Top Match Reasons */}
                    <ul className="mt-4 space-y-1">
                      {matchReasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx} className="text-xs text-emerald-700 flex items-center font-medium">
                          <span className="mr-1">✓</span> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center space-x-2">
                    <button
                      onClick={() => toggleShortlist(caregiver)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isShortlisted
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      {isShortlisted ? '♥ Saved' : '♡ Save'}
                    </button>

                    <button
                      onClick={() => setSelectedCaregiverModal(caregiver)}
                      className="flex-1 py-2.5 px-3 border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 text-center"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => onSelectCaregiverForInterview(caregiver)}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 text-center shadow-sm"
                    >
                      Book 10m Call
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Shortlist View */
        shortlist.length === 0 ? (
          <div className="py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
            Your shortlist is empty. Click "♡ Save" on caregiver cards to add them to your shortlist.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortlist.map(caregiver => (
              <div key={caregiver.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={caregiver.profilePhoto || ''} alt={caregiver.fullName} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900">{caregiver.fullName}</h4>
                    <p className="text-xs text-gray-500">₹{caregiver.dailyRate}/day • {caregiver.primaryLanguage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectCaregiverForInterview(caregiver)}
                    className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Schedule Call
                  </button>
                  <button
                    onClick={() => toggleShortlist(caregiver)}
                    className="text-rose-600 text-xs font-bold px-2 py-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Detailed Caregiver Modal */}
      {selectedCaregiverModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCaregiverModal.profilePhoto || ''}
                  alt={selectedCaregiverModal.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCaregiverModal.fullName}</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✔ Government Verified Caregiver
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaregiverModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Languages Fluency</h4>
                <p className="text-sm font-semibold text-gray-800 mt-1">{selectedCaregiverModal.languages.join(', ')}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clinical Skills & Specializations</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCaregiverModal.skills.map(skill => (
                    <span key={skill} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience Highlights</h4>
                {selectedCaregiverModal.experiences && selectedCaregiverModal.experiences.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {selectedCaregiverModal.experiences.map(exp => (
                      <div key={exp.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-900">
                          <span>{exp.category}</span>
                          <span className="text-emerald-600">{exp.yearsExperience} Years Exp</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Experienced in elderly home care & vitals logging.</p>
                )}
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl">
                <div>
                  <span className="text-xs text-gray-500">Estimated Daily Rate</span>
                  <p className="text-xl font-bold text-emerald-900">₹{selectedCaregiverModal.dailyRate} / day</p>
                </div>
                <button
                  onClick={() => {
                    const cg = selectedCaregiverModal;
                    setSelectedCaregiverModal(null);
                    onSelectCaregiverForInterview(cg);
                  }}
                  className="bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-700 shadow-md"
                >
                  Schedule 10m Intro Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
