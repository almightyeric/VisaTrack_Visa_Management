# VisaTrack Notification System

## Overview

VisaTrack provides multi-channel notifications to remind users about visa expiry dates through **Email**, **Telegram Bot**, and **WeChat**.

## Notification Channels

### 1. Email Notifications 📧

**Features:**
- Beautiful HTML email templates
- Multi-language support (English, Chinese, Khmer)
- Detailed visa information in emails
- Automatic sending via Resend API

**Configuration:**
Users can enable/disable email notifications in Settings. Emails are sent to the registered account email.

**Setup for Deployment:**
To enable email notifications, configure the `RESEND_API_KEY` environment variable in your Supabase Edge Functions.

```bash
# Get your API key from https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. Telegram Bot Notifications 🤖

**Features:**
- Instant push notifications
- Markdown-formatted messages
- Multi-language support
- Direct link to manage visas

**User Setup:**
1. Users enable Telegram notifications in Settings
2. Search for `@VisaTrackBot` on Telegram (you'll need to create this)
3. Send `/start` to the bot to get their Chat ID
4. Enter their Chat ID in VisaTrack Settings

**Bot Setup for Deployment:**
1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Configure the environment variable:

```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Bot Commands:**
- `/start` - Get your Chat ID for VisaTrack

### 3. WeChat Notifications 💬

**Features:**
- Template messages in Chinese
- Official WeChat integration
- Immediate delivery to WeChat app

**User Setup:**
1. Users enable WeChat notifications in Settings
2. Follow the VisaTrack WeChat Official Account
3. Link their account to get OpenID
4. System automatically sends notifications

**WeChat Setup for Deployment:**
1. Register a WeChat Official Account
2. Apply for Template Message permission
3. Create a message template
4. Configure environment variables:

```bash
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=1234567890abcdef1234567890abcdef
WECHAT_TEMPLATE_ID=template_id_here
```

## Reminder Schedule

Automatic reminders are sent at three intervals:

1. **7 Days Before Expiry** - Early warning
2. **3 Days Before Expiry** - Urgent reminder
3. **Day of Expiry** - Final alert

## Edge Function: send-reminders

The notification system runs via a Supabase Edge Function that:

1. Checks for pending reminders daily
2. Fetches visa and user profile information
3. Generates multi-language messages
4. Sends notifications via configured channels
5. Marks reminders as sent

**Trigger the function:**

```bash
# Manually trigger (for testing)
curl -X POST https://your-project.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Set up a daily cron job (recommended)
# Use Supabase Cron Jobs or external service like GitHub Actions
```

## Automatic Reminder Creation

When users add or update a visa, the system automatically creates reminders:

1. Calculates reminder dates (7 days, 3 days, 0 days before expiry)
2. Creates reminders for each enabled notification channel
3. Ensures no duplicate reminders are created
4. Only creates reminders for future dates

## Testing Notifications

### Test Email
```bash
# Ensure RESEND_API_KEY is set
# Add a visa expiring within 7 days
# Trigger the edge function
```

### Test Telegram
1. Set up your bot token
2. Get your Chat ID from the bot
3. Add it to your profile settings
4. Create a test visa
5. Trigger the function

### Test WeChat
1. Configure WeChat credentials
2. Follow the official account
3. Link your account
4. Create a test visa
5. Trigger the function

## Message Localization

Messages are automatically localized based on user's language preference:

- **English**: Professional business tone
- **中文 (Chinese)**: Formal Chinese with proper honorifics
- **ខ្មែរ (Khmer)**: Respectful Cambodian Khmer

## Database Schema

### Reminders Table
```sql
- id: uuid
- visa_id: uuid (FK to visas)
- user_id: uuid (FK to profiles)
- reminder_date: date
- days_before: integer (7, 3, or 0)
- reminder_type: text ('7days', '3days', 'same_day')
- channel: text ('email', 'telegram', 'wechat', 'sms')
- is_sent: boolean
- sent_at: timestamptz
- message: text
```

### Profiles Table (Notification Settings)
```sql
- notification_email: boolean
- notification_telegram: boolean
- notification_wechat: boolean
- notification_sms: boolean
- telegram_id: text
- wechat_id: text
- phone_number: text
```

## Security & Privacy

- User notification preferences are stored securely
- Contact information (phone, Telegram ID, WeChat ID) is encrypted at rest
- Users can opt-in/opt-out of any channel
- Notification credentials never exposed to frontend
- All API keys stored as environment variables

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] WhatsApp Business API integration
- [ ] Customizable reminder intervals
- [ ] Reminder acknowledgment system
- [ ] Rich push notifications
- [ ] Renewal service integration

## Troubleshooting

**Emails not sending:**
- Verify RESEND_API_KEY is set
- Check email address is valid
- Review Resend dashboard for errors

**Telegram not working:**
- Confirm TELEGRAM_BOT_TOKEN is correct
- Verify user has correct Chat ID
- Test bot manually with curl

**WeChat issues:**
- Check WeChat Official Account credentials
- Verify template ID is correct
- Ensure user is following the account

## Support

For issues or questions about the notification system, please check:
1. Supabase Edge Function logs
2. Database reminder records
3. User notification preferences
4. Third-party service status (Resend, Telegram, WeChat)
