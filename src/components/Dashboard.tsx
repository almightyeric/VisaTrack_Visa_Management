import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Visa } from '../lib/supabase';
import { VisaList } from './VisaList';
import { VisaForm } from './VisaForm';
import { Plus, FileText, Zap, TrendingUp } from 'lucide-react';
import { VisaEncyclopedia } from './VisaEncyclopedia';
import { Services } from './Services';
import { Settings } from './Settings';
import { Navigation } from './Navigation';
import { UpgradeModal } from './UpgradeModal';
import { Admin } from './Admin';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [visas, setVisas] = useState<Visa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; subscription_plan?: string; visa_count?: number; is_admin?: boolean } | null>(null);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { t } = useLanguage();

  const isPremium = profile?.subscription_plan === 'premium';
  const visaLimit = isPremium ? -1 : 5;
  const canAddVisa = isPremium || (visas.length < 5);

  useEffect(() => {
    loadProfile();
    loadVisas();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, subscription_plan, visa_count, is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const loadVisas = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('visas')
      .select('*')
      .eq('user_id', user.id)
      .order('expiry_date', { ascending: true });

    if (!error && data) {
      setVisas(data);
    }
    setLoading(false);
  };

  const handleAddVisa = () => {
    if (!canAddVisa) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingVisa(null);
    setShowForm(true);
  };

  const handleEditVisa = (visa: Visa) => {
    setEditingVisa(visa);
    setShowForm(true);
  };

  const handleDeleteVisa = async (visaId: string) => {
    if (!confirm('Are you sure you want to delete this visa?')) return;

    const { error } = await supabase.from('visas').delete().eq('id', visaId);

    if (!error) {
      setVisas(visas.filter((v) => v.id !== visaId));
    }
  };

  const handleFormClose = async () => {
    setShowForm(false);
    setEditingVisa(null);
    await loadVisas();
    await createReminders();
  };

  const createReminders = async () => {
    if (!user) return;

    for (const visa of visas) {
      const expiryDate = new Date(visa.expiry_date);
      const today = new Date();

      const reminderConfigs = [
        { days: 7, type: '7days' },
        { days: 3, type: '3days' },
        { days: 0, type: 'same_day' },
      ];

      for (const config of reminderConfigs) {
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - config.days);

        if (reminderDate >= today) {
          const { data: existing } = await supabase
            .from('reminders')
            .select('id')
            .eq('visa_id', visa.id)
            .eq('days_before', config.days)
            .maybeSingle();

          if (!existing) {
            const channels = ['email'];

            const { data: profile } = await supabase
              .from('profiles')
              .select('notification_telegram, notification_wechat')
              .eq('id', user.id)
              .maybeSingle();

            if (profile?.notification_telegram) channels.push('telegram');
            if (profile?.notification_wechat) channels.push('wechat');

            for (const channel of channels) {
              await supabase.from('reminders').insert([
                {
                  visa_id: visa.id,
                  user_id: user.id,
                  reminder_date: reminderDate.toISOString().split('T')[0],
                  days_before: config.days,
                  reminder_type: config.type,
                  channel: channel,
                  is_sent: false,
                },
              ]);
            }
          }
        }
      }
    }
  };

  const filteredVisas = categoryFilter === 'all' ? visas : visas.filter(v => v.category === categoryFilter);
  const activeVisas = filteredVisas.filter((v) => v.status === 'active');
  const expiredVisas = filteredVisas.filter((v) => v.status === 'expired');
  const expiringVisas = filteredVisas.filter((v) => {
    if (v.status !== 'active') return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(v.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'encyclopedia') {
      setShowEncyclopedia(true);
    } else if (tab === 'services') {
      setShowServices(true);
    } else if (tab === 'admin') {
      setShowAdmin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navigation
        user={user}
        profile={profile}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddVisa={handleAddVisa}
        onShowEncyclopedia={() => {
          setActiveTab('encyclopedia');
          setShowEncyclopedia(true);
        }}
        onShowServices={() => {
          setActiveTab('services');
          setShowServices(true);
        }}
        onShowAdmin={() => {
          setActiveTab('admin');
          setShowAdmin(true);
        }}
        onShowSettings={() => setShowSettings(true)}
        onSignOut={signOut}
        notificationCount={0}
      />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Welcome Banner */}
        {visas.length === 0 && (
          <div className="mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('appTagline')}</h2>
                <p className="text-blue-100 mb-4">{t('appDescription')}</p>
                <button
                  onClick={handleAddVisa}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  {t('addVisa')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visa Limit Indicator - Progressive Messaging */}
        {!isPremium && visas.length >= 3 && (
          <div className={`mb-6 lg:mb-8 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            visas.length >= 5
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
              : visas.length === 4
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300'
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200'
          }`}>
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                visas.length >= 5
                  ? 'bg-white/20'
                  : visas.length === 4
                  ? 'bg-orange-200'
                  : 'bg-blue-200'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  visas.length >= 5
                    ? 'text-white'
                    : visas.length === 4
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`font-bold text-lg ${
                    visas.length >= 5
                      ? 'text-white'
                      : visas.length === 4
                      ? 'text-orange-900'
                      : 'text-gray-900'
                  }`}>
                    {visas.length} / 5 {t('visasUsed')}
                  </span>
                  {visas.length >= 5 && (
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold animate-pulse">
                      {t('visaLimit')}
                    </span>
                  )}
                  {visas.length === 4 && (
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-900 rounded text-xs font-semibold">
                      1 {t('remainingSlots')}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  visas.length >= 5
                    ? 'text-white/90'
                    : visas.length === 4
                    ? 'text-orange-800'
                    : 'text-gray-700'
                }`}>
                  {visas.length >= 5
                    ? t('visa5Message')
                    : visas.length === 4
                    ? t('visa4Message')
                    : `${5 - visas.length} ${t('remainingSlots')}`}
                </p>
              </div>
            </div>
            {visas.length >= 4 && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                  visas.length >= 5
                    ? 'bg-white text-orange-600 hover:bg-orange-50 animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">{t('upgradeToPremium')}</span>
                <span className="sm:hidden">{t('upgradeNow')}</span>
              </button>
            )}
          </div>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-5 flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">{t('premiumPlan')}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">ACTIVE</span>
              </div>
              <p className="text-sm text-blue-100">
                {t('unlimitedVisas')} • {t('allChannels')} • {t('cloudBackup')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{t('totalVisas')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{visas.length}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{t('activeVisas')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{activeVisas.length}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{t('expiringSoon')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{expiringVisas.length}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t('dashboard')}</h2>
                <button
                  onClick={handleAddVisa}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('addVisa')}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('all')}
                </button>
                <button
                  onClick={() => setCategoryFilter('personal')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === 'personal'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('personal')}
                </button>
                <button
                  onClick={() => setCategoryFilter('family')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === 'family'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('family')}
                </button>
                <button
                  onClick={() => setCategoryFilter('employee')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    categoryFilter === 'employee'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('employee')}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">{t('loading')}</div>
            ) : filteredVisas.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{t('noVisas')}</p>
                <button
                  onClick={handleAddVisa}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('addVisa')}
                </button>
              </div>
            ) : (
              <VisaList
                visas={filteredVisas}
                onEdit={handleEditVisa}
                onDelete={handleDeleteVisa}
              />
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <VisaForm
          visa={editingVisa}
          onClose={handleFormClose}
          userId={user!.id}
        />
      )}

      {showEncyclopedia && (
        <VisaEncyclopedia
          onClose={() => {
            setShowEncyclopedia(false);
            setActiveTab('dashboard');
          }}
        />
      )}

      {showServices && (
        <Services
          onClose={() => {
            setShowServices(false);
            setActiveTab('dashboard');
          }}
        />
      )}

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          currentVisaCount={visas.length}
        />
      )}

      {showAdmin && profile?.is_admin && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <h1 className="text-xl font-bold text-gray-900">{t('adminPanel')}</h1>
              <button
                onClick={() => {
                  setShowAdmin(false);
                  setActiveTab('dashboard');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
            <Admin />
          </div>
        </div>
      )}
    </div>
  );
};
