import React, { useState, useEffect } from 'react';
import {
  FileText,
  Book,
  Briefcase,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  HelpCircle,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  user: any;
  profile: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddVisa: () => void;
  onShowEncyclopedia: () => void;
  onShowServices: () => void;
  onShowAdmin?: () => void;
  onShowSettings: () => void;
  onSignOut: () => void;
  notificationCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  user,
  profile,
  activeTab,
  onTabChange,
  onAddVisa,
  onShowEncyclopedia,
  onShowServices,
  onShowAdmin,
  onShowSettings,
  onSignOut,
  notificationCount = 0,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isPremium = profile?.subscription_plan === 'premium';
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
        setShowUserMenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const isAdmin = profile?.is_admin === true;

  const navigationItems = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: Home,
      action: () => onTabChange('dashboard'),
    },
    {
      id: 'encyclopedia',
      label: t('visaEncyclopedia'),
      icon: Book,
      action: onShowEncyclopedia,
      badge: null,
    },
    {
      id: 'services',
      label: t('services'),
      icon: Briefcase,
      action: onShowServices,
    },
    ...(isAdmin && onShowAdmin ? [{
      id: 'admin',
      label: t('adminPanel'),
      icon: Shield,
      action: onShowAdmin,
      badge: null,
    }] : []),
  ];

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        {t('skipToContent')}
      </a>

      <nav
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                aria-label={t('goToHome')}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{t('appName')}</h1>
                  <p className="text-xs text-gray-500">{t('visaManagementSystem')}</p>
                </div>
              </button>

              {/* Main Navigation Tabs - Desktop */}
              <div className="hidden lg:flex items-center gap-1 ml-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onKeyPress={(e) => handleKeyPress(e, item.action)}
                      className={`
                        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Quick Add Button */}
              <button
                onClick={onAddVisa}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t('addVisa')}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden xl:inline">{t('addVisa')}</span>
              </button>

              {/* Notification Settings */}
              <button
                onClick={onShowSettings}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`${t('notifications')} ${t('settings')}${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label={t('selectLanguage')}
              >
                <option value="en">🇬🇧 EN</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="km">🇰🇭 KM</option>
              </select>

              <div className="h-8 w-px bg-gray-300 mx-2"></div>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                  aria-label={t('userMenu')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                    isPremium
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <User className="w-4 h-4 text-white" />
                    {isPremium && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-[8px] font-bold text-gray-900">P</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden xl:inline">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onShowEncyclopedia();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      {t('help')}
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={showMobileMenu}
              aria-label={showMobileMenu ? t('closeMenu') : t('openMenu')}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div
              className="lg:hidden border-t border-gray-200 py-4 space-y-2"
              role="menu"
            >
              {/* User Profile Section */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <button
                onClick={() => {
                  onAddVisa();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                role="menuitem"
              >
                <Plus className="w-5 h-5" />
                {t('addVisa')}
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Main Navigation Items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setShowMobileMenu(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    role="menuitem"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="border-t border-gray-200 my-2"></div>

              {/* Secondary Actions */}
              <button
                onClick={() => {
                  onShowSettings();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                role="menuitem"
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">{t('notifications')} {t('settings')}</span>
                {notificationCount > 0 && (
                  <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('selectLanguage')}
              >
                <option value="en">🇬🇧 English</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="km">🇰🇭 ខ្មែរ</option>
              </select>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  role="menuitem"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="hidden xl:block absolute bottom-full right-8 mb-2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Press ? for shortcuts
        </div>
      </nav>
    </>
  );
};
