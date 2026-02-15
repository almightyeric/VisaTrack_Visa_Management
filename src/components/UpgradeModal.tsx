import React, { useState } from 'react';
import { X, Check, Zap, Shield, Cloud, Bell, Headphones, Users, FileText, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  onClose: () => void;
  currentVisaCount: number;
}

type ViewType = 'plans' | 'payment';
type PlanType = 'monthly' | 'yearly';

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, currentVisaCount }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const features = {
    free: [
      { icon: FileText, text: `5 ${t('visasUsed')}`, available: true },
      { icon: Bell, text: t('emailReminders'), available: true },
      { icon: Cloud, text: t('localOnly'), available: true },
      { icon: Headphones, text: t('standardSupport'), available: true },
    ],
    premium: [
      { icon: Zap, text: t('unlimitedVisas'), available: true },
      { icon: Bell, text: t('allChannels'), available: true },
      { icon: Shield, text: t('cloudBackup'), available: true },
      { icon: Users, text: t('oneClickService'), available: true },
      { icon: Headphones, text: t('prioritySupport'), available: true },
    ],
  };

  const planPrices = {
    monthly: { amount: 4.99, display: '$4.99', period: t('perMonth') },
    yearly: { amount: 49, display: '$49', period: t('perYear'), savings: t('savePercent') }
  };

  const handleConfirmPayment = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.email,
          plan_type: selectedPlan,
          amount: planPrices[selectedPlan].amount,
          status: 'pending',
          payment_proof: `ABA Pay - ${planPrices[selectedPlan].display}`
        });

      if (error) throw error;

      setIsConfirmed(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting payment request:', error);
      alert('Failed to submit payment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentView = () => {
    if (isConfirmed) {
      return (
        <div className="p-4 md:p-6 h-[calc(90vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {t('confirmPayment')}
            </h3>
            <p className="text-gray-600">{t('paymentConfirmed')}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 h-[calc(90vh-80px)] overflow-hidden flex flex-col">
        <button
          onClick={() => setCurrentView('plans')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">{t('backToPlans')}</span>
        </button>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-2xl grid md:grid-cols-2 gap-4 md:gap-6 items-center">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('paymentMethod')}</h3>
                <p className="text-xs md:text-sm text-gray-600">{t('scanQRCode')}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-3 md:p-4">
              <div className="mb-3">
                <div className="text-xs md:text-sm text-gray-600 mb-2">{t('selectPlan')}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`flex-1 px-3 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all ${
                      selectedPlan === 'monthly'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {t('monthlyPlan')}
                  </button>
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`flex-1 px-3 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all relative ${
                      selectedPlan === 'yearly'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {t('yearlyPlan')}
                    <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {t('savePercent')}
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-center py-2 md:py-3 border-t border-blue-100">
                <div className="text-xs text-gray-600 mb-1">{t('paymentAmount')}</div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600">
                  {planPrices[selectedPlan].display}
                </div>
                <div className="text-xs text-gray-600">{planPrices[selectedPlan].period}</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex gap-2 items-start">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="text-xs text-gray-700">
                  <p className="font-semibold mb-0.5">{t('paymentInstructions')}</p>
                  <p className="text-gray-600 text-xs">{t('contactSupport')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              {isSubmitting ? t('submitting') : t('confirmPayment')}
            </button>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border-2 border-gray-100">
            <img
              src="/weixin_image_20251215222838_544_56.jpg"
              alt="ABA Pay QR Code"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderPlansView = () => (
    <div className="p-6">
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {currentVisaCount} / 5 {t('visasUsed')}
            </h3>
            <p className="text-sm text-gray-700">{t('upgradeMessage')}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('freePlan')}</h3>
            <div className="text-4xl font-bold text-gray-900">$0</div>
            <p className="text-gray-600 text-sm mt-1">{t('currentPlan')}</p>
          </div>

          <ul className="space-y-3">
            {features.free.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-2 border-blue-500 rounded-xl p-6 relative bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full shadow-lg">
              RECOMMENDED
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('premiumPlan')}</h3>
            <div className="flex items-end justify-center gap-2">
              <div className="text-4xl font-bold text-blue-600">$4.99</div>
              <div className="text-gray-600 text-sm pb-1">{t('perMonth')}</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              or $49{t('perYear')} <span className="text-green-600 font-semibold">(Save 17%)</span>
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {features.premium.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{feature.text}</span>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => setCurrentView('payment')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {t('upgradeNow')}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-center">
          {t('pricingTitle')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{t('freePlan')}</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-600">{t('premiumPlan')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-700">{t('visaLimit')}</td>
                <td className="py-3 px-4 text-center text-gray-700">5</td>
                <td className="py-3 px-4 text-center text-blue-600 font-semibold">{t('unlimitedVisas')}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-700">{t('notifications')}</td>
                <td className="py-3 px-4 text-center text-gray-700">{t('emailReminders')}</td>
                <td className="py-3 px-4 text-center text-blue-600 font-semibold">{t('allChannels')}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-700">Storage</td>
                <td className="py-3 px-4 text-center text-gray-700">{t('localOnly')}</td>
                <td className="py-3 px-4 text-center text-blue-600 font-semibold">{t('cloudBackup')}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-700">{t('services')}</td>
                <td className="py-3 px-4 text-center text-gray-700">{t('manualService')}</td>
                <td className="py-3 px-4 text-center text-blue-600 font-semibold">{t('oneClickService')}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Support</td>
                <td className="py-3 px-4 text-center text-gray-700">{t('standardSupport')}</td>
                <td className="py-3 px-4 text-center text-blue-600 font-semibold">{t('prioritySupport')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          {t('maybeLater')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentView === 'plans' ? t('upgradeToPremium') : t('payWithABA')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentView === 'plans' ? t('pricingSubtitle') : t('scanQRCode')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentView === 'plans' ? renderPlansView() : renderPaymentView()}
      </div>
    </div>
  );
};
