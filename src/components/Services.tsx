import React, { useEffect, useState } from 'react';
import { supabase, ServiceProvider } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe as GlobeIcon,
  MessageCircle,
  Shield,
  Briefcase,
  FileText as FileTextIcon,
  Languages,
} from 'lucide-react';

interface ServicesProps {
  onClose: () => void;
}

export const Services: React.FC<ServicesProps> = ({ onClose }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('is_active', true)
      .order('is_verified', { ascending: false })
      .order('rating', { ascending: false });

    if (!error && data) {
      setProviders(data);
    }
    setLoading(false);
  };

  const filteredProviders =
    selectedType === 'all'
      ? providers
      : providers.filter((p) => p.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visa_agency':
        return <Briefcase className="w-5 h-5" />;
      case 'law_firm':
        return <Shield className="w-5 h-5" />;
      case 'translation':
        return <Languages className="w-5 h-5" />;
      default:
        return <FileTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'visa_agency':
        return 'Visa Agency';
      case 'law_firm':
        return 'Law Firm';
      case 'translation':
        return 'Translation Service';
      default:
        return type;
    }
  };

  const handleContactRequest = async () => {
    if (!selectedProvider || !message.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('service_requests').insert([
      {
        user_id: user!.id,
        provider_id: selectedProvider.id,
        service_type: selectedProvider.type,
        status: 'pending',
        message: message,
      },
    ]);

    if (!error) {
      alert('Request sent successfully! The provider will contact you soon.');
      setMessage('');
      setSelectedProvider(null);
    } else {
      alert('Failed to send request. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('services')}</h2>
            <p className="text-sm text-gray-600">
              Connect with verified visa agencies and service providers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setSelectedType('visa_agency')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'visa_agency'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Visa Agencies
            </button>
            <button
              onClick={() => setSelectedType('law_firm')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'law_firm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Law Firms
            </button>
            <button
              onClick={() => setSelectedType('translation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'translation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Translation Services
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading services...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(provider.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{provider.name}</h3>
                          {provider.is_verified && (
                            <Shield className="w-4 h-4 text-blue-600" title="Verified" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{getTypeName(provider.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-900">
                        {provider.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">({provider.review_count})</span>
                    </div>
                  </div>

                  {provider.description && (
                    <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {provider.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{provider.contact_phone}</span>
                      </div>
                    )}
                    {provider.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{provider.contact_email}</span>
                      </div>
                    )}
                    {provider.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.address}</span>
                      </div>
                    )}
                    {provider.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GlobeIcon className="w-4 h-4" />
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProvider(provider)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Provider
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact {selectedProvider.name}</h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the service you need..."
                />
              </div>

              <button
                onClick={handleContactRequest}
                disabled={!message.trim() || submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
