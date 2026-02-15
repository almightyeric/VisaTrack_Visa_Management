import React, { useState, useEffect } from 'react';
import { supabase, Visa } from '../lib/supabase';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { useLanguage } from '../contexts/LanguageContext';

interface VisaFormProps {
  visa: Visa | null;
  onClose: () => void;
  userId: string;
}

export const VisaForm: React.FC<VisaFormProps> = ({ visa, onClose, userId }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    country: '',
    visa_type: 'tourist',
    visa_number: '',
    issue_date: '',
    expiry_date: '',
    entry_type: 'single',
    status: 'active',
    notes: '',
    category: 'personal',
    person_name: '',
    relationship: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (visa) {
      setFormData({
        country: visa.country,
        visa_type: visa.visa_type,
        visa_number: visa.visa_number || '',
        issue_date: visa.issue_date || '',
        expiry_date: visa.expiry_date,
        entry_type: visa.entry_type,
        status: visa.status,
        notes: visa.notes,
        category: visa.category,
        person_name: visa.person_name || '',
        relationship: visa.relationship || '',
      });

      if (visa.photo_url) {
        loadPhotoUrl(visa.photo_url);
      }
    }
  }, [visa]);

  const loadPhotoUrl = async (photoPath: string) => {
    const { data } = await supabase.storage
      .from('visa-photos')
      .createSignedUrl(photoPath, 3600);

    if (data) {
      setCurrentPhotoUrl(data.signedUrl);
    }
  };

  const handleOCRComplete = (data: any) => {
    setExtractedData(data);
    setShowConfirmation(true);
  };

  const acceptExtractedData = () => {
    if (extractedData) {
      setFormData({
        ...formData,
        country: extractedData.country || formData.country,
        visa_type: extractedData.visa_type || formData.visa_type,
        visa_number: extractedData.visa_number || formData.visa_number,
        issue_date: extractedData.issue_date || formData.issue_date,
        expiry_date: extractedData.expiry_date || formData.expiry_date,
        entry_type: extractedData.entry_type || formData.entry_type,
        person_name: extractedData.person_name || formData.person_name,
      });
    }
    setShowConfirmation(false);
    setExtractedData(null);
  };

  const rejectExtractedData = () => {
    setShowConfirmation(false);
    setExtractedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let photoUrl = visa?.photo_url || null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('visa-photos')
          .upload(fileName, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        if (visa?.photo_url) {
          await supabase.storage
            .from('visa-photos')
            .remove([visa.photo_url]);
        }

        photoUrl = fileName;
      }

      const dataToSave = {
        ...formData,
        user_id: userId,
        visa_number: formData.visa_number || null,
        issue_date: formData.issue_date || null,
        person_name: formData.person_name || null,
        relationship: formData.relationship || null,
        photo_url: photoUrl,
      };

      if (visa) {
        const { error: updateError } = await supabase
          .from('visas')
          .update(dataToSave)
          .eq('id', visa.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('visas')
          .insert([dataToSave]);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelected = (file: File) => {
    setPhotoFile(file);
  };

  const handlePhotoRemoved = async () => {
    setPhotoFile(null);
    setCurrentPhotoUrl(null);

    if (visa?.photo_url) {
      try {
        await supabase.storage
          .from('visa-photos')
          .remove([visa.photo_url]);

        await supabase
          .from('visas')
          .update({ photo_url: null })
          .eq('id', visa.id);
      } catch (err) {
        console.error('Error removing photo:', err);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {visa ? t('editVisa') : t('addNewVisa')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <PhotoUpload
            currentPhotoUrl={currentPhotoUrl}
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            onOCRComplete={handleOCRComplete}
          />

          {showConfirmation && extractedData && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 space-y-4 animate-in slide-in-from-top">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-bold text-blue-900">
                    {t('extractedInfo')}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {t('confirmInfo')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4">
                {extractedData.country && (
                  <div>
                    <p className="text-xs text-gray-500">{t('country')}</p>
                    <p className="font-semibold text-gray-900">{extractedData.country}</p>
                  </div>
                )}
                {extractedData.visa_type && (
                  <div>
                    <p className="text-xs text-gray-500">{t('visaType')}</p>
                    <p className="font-semibold text-gray-900 capitalize">{extractedData.visa_type}</p>
                  </div>
                )}
                {extractedData.visa_number && (
                  <div>
                    <p className="text-xs text-gray-500">{t('visaNumber')}</p>
                    <p className="font-semibold text-gray-900">{extractedData.visa_number}</p>
                  </div>
                )}
                {extractedData.issue_date && (
                  <div>
                    <p className="text-xs text-gray-500">{t('issueDate')}</p>
                    <p className="font-semibold text-gray-900">{extractedData.issue_date}</p>
                  </div>
                )}
                {extractedData.expiry_date && (
                  <div>
                    <p className="text-xs text-gray-500">{t('expiryDate')}</p>
                    <p className="font-semibold text-gray-900">{extractedData.expiry_date}</p>
                  </div>
                )}
                {extractedData.entry_type && (
                  <div>
                    <p className="text-xs text-gray-500">{t('entryType')}</p>
                    <p className="font-semibold text-gray-900 capitalize">{extractedData.entry_type}</p>
                  </div>
                )}
                {extractedData.person_name && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">{t('holderName')}</p>
                    <p className="font-semibold text-gray-900">{extractedData.person_name}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={acceptExtractedData}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('confirmFill')}
                </button>
                <button
                  type="button"
                  onClick={rejectExtractedData}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('manualFill')}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="personal">{t('personal')}</option>
                <option value="family">{t('family')}</option>
                <option value="employee">{t('employee')}</option>
              </select>
            </div>

            {formData.category !== 'personal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('personName')}
                  </label>
                  <input
                    type="text"
                    name="person_name"
                    value={formData.person_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('relationship')}
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Spouse, Child, Employee"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('country')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., United States"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visaType')} <span className="text-red-500">*</span>
              </label>
              <select
                name="visa_type"
                value={formData.visa_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="tourist">{t('tourist')}</option>
                <option value="business">{t('business')}</option>
                <option value="student">{t('student')}</option>
                <option value="work">{t('work')}</option>
                <option value="transit">{t('transit')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('visaNumber')}
              </label>
              <input
                type="text"
                name="visa_number"
                value={formData.visa_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('optional')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('entryType')} <span className="text-red-500">*</span>
              </label>
              <select
                name="entry_type"
                value={formData.entry_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="single">{t('singleEntry')}</option>
                <option value="multiple">{t('multipleEntry')}</option>
                <option value="transit">{t('transit')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('issueDate')}
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('expiryDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('status')} <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">{t('active')}</option>
                <option value="expired">{t('expired')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes about this visa..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? t('saving') : visa ? t('updateVisa') : t('addVisa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
