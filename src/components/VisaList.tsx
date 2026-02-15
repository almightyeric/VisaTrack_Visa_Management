import React, { useState, useEffect } from 'react';
import { supabase, Visa } from '../lib/supabase';
import { Calendar, FileText, Edit, Trash2, MapPin, AlertCircle, User, Users, Briefcase, Image as ImageIcon } from 'lucide-react';

interface VisaListProps {
  visas: Visa[];
  onEdit: (visa: Visa) => void;
  onDelete: (visaId: string) => void;
}

export const VisaList: React.FC<VisaListProps> = ({ visas, onEdit, onDelete }) => {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPhotoUrls();
  }, [visas]);

  const loadPhotoUrls = async () => {
    const urls: Record<string, string> = {};

    for (const visa of visas) {
      if (visa.photo_url) {
        const { data } = await supabase.storage
          .from('visa-photos')
          .createSignedUrl(visa.photo_url, 3600);

        if (data) {
          urls[visa.id] = data.signedUrl;
        }
      }
    }

    setPhotoUrls(urls);
  };
  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getStatusColor = (visa: Visa) => {
    if (visa.status === 'expired') return 'bg-red-100 text-red-700 border-red-200';
    const days = getDaysUntilExpiry(visa.expiry_date);
    if (days <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (days <= 30) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = (visa: Visa) => {
    if (visa.status === 'expired') return 'Expired';
    const days = getDaysUntilExpiry(visa.expiry_date);
    if (days <= 0) return 'Expired';
    if (days <= 30) return `Expires in ${days} days`;
    return 'Active';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {visas.map((visa) => {
        const daysUntilExpiry = getDaysUntilExpiry(visa.expiry_date);
        const showWarning = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

        return (
          <div
            key={visa.id}
            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
          >
            {photoUrls[visa.id] && (
              <div className="mb-4">
                <img
                  src={photoUrls[visa.id]}
                  alt={`${visa.country} visa`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{visa.country}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      visa
                    )}`}
                  >
                    {getStatusText(visa)}
                  </span>
                  {visa.category !== 'personal' && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize flex items-center gap-1">
                      {visa.category === 'family' ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                      {visa.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 capitalize">{visa.visa_type} Visa</p>
                {visa.person_name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" />
                    {visa.person_name} {visa.relationship && `(${visa.relationship})`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(visa)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit visa"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(visa.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete visa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showWarning && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  This visa is expiring soon. Please renew it before {formatDate(visa.expiry_date)}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Entry Type: <span className="font-medium text-gray-900 capitalize">{visa.entry_type}</span></span>
              </div>
              {visa.visa_number && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Number: <span className="font-medium text-gray-900">{visa.visa_number}</span></span>
                </div>
              )}
              {visa.issue_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Issued: <span className="font-medium text-gray-900">{formatDate(visa.issue_date)}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Expires: <span className="font-medium text-gray-900">{formatDate(visa.expiry_date)}</span></span>
              </div>
            </div>

            {visa.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">{visa.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
