import React, { useEffect, useState } from 'react';
import { supabase, VisaType } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Book, Clock, DollarSign, FileText, Search, X } from 'lucide-react';

interface VisaEncyclopediaProps {
  onClose: () => void;
}

export const VisaEncyclopedia: React.FC<VisaEncyclopediaProps> = ({ onClose }) => {
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    loadVisaTypes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = visaTypes.filter((vt) =>
        getName(vt).toLowerCase().includes(searchTerm.toLowerCase()) ||
        vt.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(visaTypes);
    }
  }, [searchTerm, visaTypes]);

  const loadVisaTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visa_types')
      .select('*')
      .eq('is_active', true)
      .order('country', { ascending: true })
      .order('code', { ascending: true });

    if (!error && data) {
      setVisaTypes(data);
      setFilteredTypes(data);
    }
    setLoading(false);
  };

  const getName = (vt: VisaType) => {
    if (language === 'zh' && vt.name_zh) return vt.name_zh;
    if (language === 'km' && vt.name_km) return vt.name_km;
    return vt.name_en;
  };

  const getDescription = (vt: VisaType) => {
    if (language === 'zh' && vt.description_zh) return vt.description_zh;
    if (language === 'km' && vt.description_km) return vt.description_km;
    return vt.description_en;
  };

  const getRequirements = (vt: VisaType) => {
    if (language === 'zh' && vt.requirements_zh) return vt.requirements_zh;
    if (language === 'km' && vt.requirements_km) return vt.requirements_km;
    return vt.requirements_en;
  };

  const getMaterials = (vt: VisaType): string[] => {
    let materials = vt.materials_en;
    if (language === 'zh' && vt.materials_zh) materials = vt.materials_zh;
    if (language === 'km' && vt.materials_km) materials = vt.materials_km;
    return Array.isArray(materials) ? materials : [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('visaEncyclopedia')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search visa types..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                {filteredTypes.map((vt) => (
                  <button
                    key={vt.id}
                    onClick={() => setSelectedVisa(vt)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedVisa?.id === vt.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-600">{vt.code}</span>
                      <span className="text-xs text-gray-500">{vt.country}</span>
                    </div>
                    <p className="font-medium text-gray-900">{getName(vt)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedVisa ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg">
                          {selectedVisa.code}
                        </span>
                        <span className="text-sm text-gray-500">{selectedVisa.country}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{getName(selectedVisa)}</h3>
                    </div>
                  </div>
                  {getDescription(selectedVisa) && (
                    <p className="text-gray-600">{getDescription(selectedVisa)}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {selectedVisa.duration_days && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedVisa.duration_days} days
                      </p>
                    </div>
                  )}
                  {selectedVisa.processing_time_days && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Processing</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedVisa.processing_time_days} days
                      </p>
                    </div>
                  )}
                  {selectedVisa.fee_usd && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Fee</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${selectedVisa.fee_usd}
                      </p>
                    </div>
                  )}
                </div>

                {getRequirements(selectedVisa) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {getRequirements(selectedVisa)}
                    </p>
                  </div>
                )}

                {getMaterials(selectedVisa).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-gray-700" />
                      <h4 className="font-bold text-gray-900">Required Materials</h4>
                    </div>
                    <ul className="space-y-2">
                      {getMaterials(selectedVisa).map((material, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 bg-gray-50 rounded-lg p-3"
                        >
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span className="text-gray-700">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Book className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a visa type to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
