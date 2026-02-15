import React, { useEffect, useState } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, Bell, Mail, MessageCircle, Smartphone } from 'lucide-react';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<Partial<Profile>>({
    notification_email: true,
    notification_telegram: false,
    notification_wechat: false,
    notification_sms: false,
    telegram_id: '',
    wechat_id: '',
    phone_number: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({
        notification_email: profile.notification_email,
        notification_telegram: profile.notification_telegram,
        notification_wechat: profile.notification_wechat,
        notification_sms: profile.notification_sms,
        telegram_id: profile.telegram_id || null,
        wechat_id: profile.wechat_id || null,
        phone_number: profile.phone_number || null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage('保存设置失败');
    } else {
      setMessage('设置保存成功！');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('notifications')} {t('settings')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">加载中...</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                配置您希望如何接收签证到期提醒。您将在到期前7天、3天和到期当天收到通知。
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">邮件通知</h3>
                      <p className="text-sm text-gray-600">
                        通过邮件接收提醒至 {user?.email}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notification_email}
                      onChange={(e) =>
                        setProfile({ ...profile, notification_email: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Telegram通知</h3>
                      <p className="text-sm text-gray-600">
                        通过Telegram机器人获取即时提醒
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notification_telegram}
                      onChange={(e) =>
                        setProfile({ ...profile, notification_telegram: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {profile.notification_telegram && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram聊天ID
                    </label>
                    <input
                      type="text"
                      value={profile.telegram_id || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, telegram_id: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="您的Telegram聊天ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      发送 /start 给 @VisaTrackBot 获取您的聊天ID
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">微信通知</h3>
                      <p className="text-sm text-gray-600">
                        通过微信接收提醒
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notification_wechat}
                      onChange={(e) =>
                        setProfile({ ...profile, notification_wechat: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                {profile.notification_wechat && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      微信号
                    </label>
                    <input
                      type="text"
                      value={profile.wechat_id || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, wechat_id: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="您的微信OpenID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      关注VisaTrack微信公众号以关联您的账户
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">短信通知</h3>
                      <p className="text-sm text-gray-600">
                        在您的手机上接收短信提醒
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notification_sms}
                      onChange={(e) =>
                        setProfile({ ...profile, notification_sms: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                {profile.notification_sms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      手机号码
                    </label>
                    <input
                      type="tel"
                      value={profile.phone_number || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, phone_number: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+86 1234567890"
                    />
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? '保存中...' : t('save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
