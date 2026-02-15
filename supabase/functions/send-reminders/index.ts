import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Reminder {
  id: string;
  visa_id: string;
  user_id: string;
  reminder_date: string;
  days_before: number;
  reminder_type: string;
  channel: string;
  is_sent: boolean;
}

interface Visa {
  id: string;
  country: string;
  visa_type: string;
  visa_number: string | null;
  expiry_date: string;
  person_name: string | null;
  category: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  language_preference: string;
  notification_email: boolean;
  notification_telegram: boolean;
  notification_wechat: boolean;
  telegram_id: string | null;
  wechat_id: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];

    const { data: reminders, error: reminderError } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_sent', false)
      .lte('reminder_date', today);

    if (reminderError) throw reminderError;

    const results = {
      total: reminders?.length || 0,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', results }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    for (const reminder of reminders as Reminder[]) {
      try {
        const { data: visa } = await supabase
          .from('visas')
          .select('*')
          .eq('id', reminder.visa_id)
          .single();

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', reminder.user_id)
          .single();

        if (!visa || !profile) {
          results.failed++;
          continue;
        }

        const visaData = visa as Visa;
        const profileData = profile as Profile;

        const message = generateMessage(
          visaData,
          profileData,
          reminder.days_before
        );

        let sent = false;

        if (profileData.notification_email && reminder.channel === 'email') {
          sent = await sendEmail(
            profileData.email,
            profileData.full_name || 'User',
            visaData,
            reminder.days_before,
            message
          );
        }

        if (profileData.notification_telegram && profileData.telegram_id && reminder.channel === 'telegram') {
          sent = await sendTelegram(
            profileData.telegram_id,
            message
          );
        }

        if (profileData.notification_wechat && profileData.wechat_id && reminder.channel === 'wechat') {
          sent = await sendWeChat(
            profileData.wechat_id,
            message
          );
        }

        if (sent) {
          await supabase
            .from('reminders')
            .update({
              is_sent: true,
              sent_at: new Date().toISOString(),
            })
            .eq('id', reminder.id);

          results.sent++;
          results.details.push({
            reminder_id: reminder.id,
            visa_country: visaData.country,
            channel: reminder.channel,
            status: 'sent',
          });
        } else {
          results.failed++;
          results.details.push({
            reminder_id: reminder.id,
            visa_country: visaData.country,
            channel: reminder.channel,
            status: 'failed',
          });
        }
      } catch (err) {
        results.failed++;
        console.error('Error processing reminder:', err);
      }
    }

    return new Response(JSON.stringify({ message: 'Reminders processed', results }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateMessage(
  visa: Visa,
  profile: Profile,
  daysBefore: number
): string {
  const name = profile.full_name || 'User';
  const visaHolder = visa.person_name || 'your';
  const expiryDate = new Date(visa.expiry_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (profile.language_preference === 'zh') {
    if (daysBefore === 0) {
      return `您好 ${name}，${visaHolder}的${visa.country}${visa.visa_type}签证今天到期！请尽快办理续签。`;
    }
    return `您好 ${name}，${visaHolder}的${visa.country}${visa.visa_type}签证将在${daysBefore}天后（${expiryDate}）到期。请及时办理续签手续。`;
  }

  if (profile.language_preference === 'km') {
    if (daysBefore === 0) {
      return `សួស្តី ${name}! ទិដ្ឋាការ${visa.visa_type}របស់${visaHolder}សម្រាប់${visa.country}ផុតកំណត់ថ្ងៃនេះ! សូមបន្តវាឱ្យបានឆាប់។`;
    }
    return `សួស្តី ${name}! ទិដ្ឋាការ${visa.visa_type}របស់${visaHolder}សម្រាប់${visa.country}នឹងផុតកំណត់ក្នុងរយៈពេល${daysBefore}ថ្ងៃ (${expiryDate})។ សូមបន្តវាឱ្យបានទាន់ពេល។`;
  }

  if (daysBefore === 0) {
    return `Hello ${name}! ${visaHolder === 'your' ? 'Your' : visaHolder + "'s"} ${visa.country} ${visa.visa_type} visa expires TODAY! Please renew it immediately.`;
  }
  return `Hello ${name}! ${visaHolder === 'your' ? 'Your' : visaHolder + "'s"} ${visa.country} ${visa.visa_type} visa will expire in ${daysBefore} days (${expiryDate}). Please renew it soon.`;
}

async function sendEmail(
  email: string,
  name: string,
  visa: Visa,
  daysBefore: number,
  message: string
): Promise<boolean> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('Email notification skipped: RESEND_API_KEY not configured');
      return false;
    }

    const subject = daysBefore === 0 
      ? `⚠️ URGENT: ${visa.country} Visa Expires Today!`
      : `⏰ Reminder: ${visa.country} Visa Expiring in ${daysBefore} Days`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛂 VisaTrack Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">${message}</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #1f2937;">Visa Details:</h3>
            <p style="margin: 5px 0;"><strong>Country:</strong> ${visa.country}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${visa.visa_type}</p>
            ${visa.visa_number ? `<p style="margin: 5px 0;"><strong>Number:</strong> ${visa.visa_number}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${new Date(visa.expiry_date).toLocaleDateString()}</p>
            ${visa.person_name ? `<p style="margin: 5px 0;"><strong>Holder:</strong> ${visa.person_name}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Visas
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            💡 Tip: Contact our verified service providers for quick visa renewal assistance.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated reminder from VisaTrack. You can manage your notification preferences in settings.
          </p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'VisaTrack <noreply@visatrack.app>',
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

async function sendTelegram(
  telegramId: string,
  message: string
): Promise<boolean> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!botToken) {
      console.log('Telegram notification skipped: TELEGRAM_BOT_TOKEN not configured');
      return false;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramId,
          text: `🛂 *VisaTrack Reminder*\n\n${message}`,
          parse_mode: 'Markdown',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Telegram error:', error);
    return false;
  }
}

async function sendWeChat(
  wechatId: string,
  message: string
): Promise<boolean> {
  try {
    const wechatAppId = Deno.env.get('WECHAT_APP_ID');
    const wechatAppSecret = Deno.env.get('WECHAT_APP_SECRET');
    
    if (!wechatAppId || !wechatAppSecret) {
      console.log('WeChat notification skipped: WeChat credentials not configured');
      return false;
    }

    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wechatAppId}&secret=${wechatAppSecret}`
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('Failed to get WeChat access token');
      return false;
    }

    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          touser: wechatId,
          template_id: Deno.env.get('WECHAT_TEMPLATE_ID'),
          data: {
            first: {
              value: '签证到期提醒',
              color: '#173177',
            },
            keyword1: {
              value: message,
              color: '#173177',
            },
            remark: {
              value: '请及时续签以避免签证过期。',
              color: '#173177',
            },
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('WeChat error:', error);
    return false;
  }
}
