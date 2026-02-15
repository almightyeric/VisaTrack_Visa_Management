import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, User, DollarSign, Calendar } from 'lucide-react';

interface PaymentRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  plan_type: 'monthly' | 'yearly';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  payment_proof: string;
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
}

export const Admin: React.FC = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    const notes = prompt(t('enterNotes'));
    if (notes === null) return;

    try {
      const { error } = await supabase.rpc('approve_payment_request', {
        p_request_id: requestId,
        p_admin_notes: notes || null
      });

      if (error) throw error;

      alert('Payment approved successfully!');
      fetchPaymentRequests();
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    }
  };

  const handleReject = async (requestId: string) => {
    const notes = prompt(t('enterNotes'));
    if (!notes) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      const { error } = await supabase.rpc('reject_payment_request', {
        p_request_id: requestId,
        p_admin_notes: notes
      });

      if (error) throw error;

      alert('Payment rejected.');
      fetchPaymentRequests();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
    }
  };

  const filteredRequests = requests.filter(req => req.status === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('adminPanel')}</h1>
          <p className="text-gray-600">{t('paymentRequests')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2 p-4">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                {t('pendingRequests')}
                <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'approved'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {t('approvedRequests')}
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {requests.filter(r => r.status === 'approved').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'rejected'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                {t('rejectedRequests')}
                <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  {requests.filter(r => r.status === 'rejected').length}
                </span>
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">{t('loading')}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">{t('noRequests')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-semibold text-gray-900">{request.full_name}</div>
                              <div className="text-sm text-gray-600">{request.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-semibold text-gray-900">
                                ${request.amount}
                              </div>
                              <div className="text-sm text-gray-600">
                                {request.plan_type === 'monthly' ? t('monthlyPlan') : t('yearlyPlan')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.admin_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {t('adminNotes')}:
                          </div>
                          <div className="text-sm text-gray-600">{request.admin_notes}</div>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t('approve')}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('reject')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
