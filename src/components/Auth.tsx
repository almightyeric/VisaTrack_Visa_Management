import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, FileText, Calendar, Shield, Link2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError.message);
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('appName')}</h1>
          <p className="text-lg text-blue-600 font-medium mb-1">{t('appTagline')}</p>
          <p className="text-sm text-gray-600">{t('appDescription')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Please wait...'
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h3 className="text-center text-sm font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <span className="text-blue-600">🇰🇭</span>
            {t('cambodiaFocus')}
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  📅 {t('featureAutoRecord')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  ⏰ {t('featureSmartReminder')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  🧾 {t('featureOneClick')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  🔒 {t('featureSecure')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 italic">
              {t('peaceOfMind')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
