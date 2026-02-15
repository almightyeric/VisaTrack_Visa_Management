-- =====================================================
-- 签证管理系统 - 数据导出脚本
-- 用于迁移到新账户时保留现有数据
-- =====================================================

-- =====================================================
-- 1. 用户资料数据 (Profiles)
-- =====================================================
INSERT INTO profiles (id, email, full_name, created_at, updated_at, language_preference, notification_email, notification_telegram, notification_wechat, notification_sms, telegram_id, wechat_id, phone_number, subscription_plan, visa_count, is_admin)
VALUES
  ('391940f8-7613-4226-9638-59d63ba0ac58', 'magneto.zhao@gmail.com', 'Shengwei', '2025-10-31 18:52:44.179965+00', '2025-11-09 05:43:55.913764+00', 'en', true, true, false, false, NULL, NULL, NULL, 'free', 1, false),
  ('3c571cc1-a2b2-441f-ba78-7e591b762510', '656381090@qq.com', '赵生伟', '2025-11-09 06:06:35.997394+00', '2025-12-15 16:29:45.175888+00', 'en', true, false, false, false, NULL, NULL, NULL, 'premium', 5, true);

-- =====================================================
-- 2. 订阅数据 (Subscriptions)
-- =====================================================
INSERT INTO subscriptions (id, user_id, plan_type, status, start_date, end_date, auto_renew, payment_method, stripe_subscription_id, created_at, updated_at)
VALUES
  ('d364e1a7-be9c-4286-847d-a5c2ed099bf4', '391940f8-7613-4226-9638-59d63ba0ac58', 'free', 'active', '2025-11-09 05:43:55.913764+00', NULL, false, NULL, NULL, '2025-11-09 05:43:55.913764+00', '2025-11-09 05:43:55.913764+00'),
  ('23b72de0-cbcc-4717-ad7f-c67e32748695', '3c571cc1-a2b2-441f-ba78-7e591b762510', 'premium', 'active', '2025-12-15 16:29:45.175888+00', '2026-12-15 16:29:45.175888+00', false, 'aba_pay', NULL, '2025-12-15 16:29:45.175888+00', '2025-12-15 16:29:45.175888+00');

-- =====================================================
-- 3. 支付请求数据 (Payment Requests)
-- =====================================================
INSERT INTO payment_requests (id, user_id, email, full_name, plan_type, amount, status, payment_proof, admin_notes, approved_by, approved_at, created_at, updated_at)
VALUES
  ('15b58c2c-d751-4cd0-823e-33d8aef30524', '3c571cc1-a2b2-441f-ba78-7e591b762510', '656381090@qq.com', '赵生伟', 'yearly', 49.00, 'approved', 'ABA Pay - $49', NULL, '3c571cc1-a2b2-441f-ba78-7e591b762510', '2025-12-15 16:29:45.175888+00', '2025-12-15 16:14:26.617252+00', '2025-12-15 16:29:45.175888+00');

-- =====================================================
-- 4. 签证记录数据 (Visas)
-- =====================================================
INSERT INTO visas (id, user_id, country, visa_type, visa_number, issue_date, expiry_date, entry_type, status, notes, document_url, created_at, updated_at, category, person_name, relationship, photo_url, ocr_data, is_encrypted, is_anonymous)
VALUES
  ('8bb346db-fb39-4695-866b-0639ebb09085', '391940f8-7613-4226-9638-59d63ba0ac58', '中国', 'business', 'EF8191113', '2024-11-30', '2025-11-13', 'multiple', 'active', '', NULL, '2025-10-31 18:53:29.786617+00', '2025-10-31 18:54:12.269306+00', 'personal', NULL, NULL, NULL, NULL, false, false),
  ('be8edb15-6ba1-488a-a5d6-a88e0d05998d', '3c571cc1-a2b2-441f-ba78-7e591b762510', '中国', 'tourist', NULL, NULL, '2025-11-11', 'single', 'active', '', NULL, '2025-11-09 06:07:48.662965+00', '2025-11-09 06:07:48.662965+00', 'personal', NULL, NULL, NULL, NULL, false, false),
  ('89ec0b1a-cd40-460e-9a38-d2785f3a641b', '3c571cc1-a2b2-441f-ba78-7e591b762510', '中国', 'tourist', NULL, NULL, '2025-11-22', 'single', 'active', '', NULL, '2025-11-09 06:08:14.619523+00', '2025-11-09 06:08:14.619523+00', 'personal', NULL, NULL, NULL, NULL, false, false),
  ('c2da1ee6-51f6-425e-a1c5-b1eec74bc87b', '3c571cc1-a2b2-441f-ba78-7e591b762510', '中国', 'tourist', NULL, NULL, '2025-12-04', 'single', 'active', '', NULL, '2025-11-09 06:08:27.007235+00', '2025-11-09 06:08:27.007235+00', 'personal', NULL, NULL, NULL, NULL, false, false),
  ('fc59b54f-f308-4290-b3ca-dc34adef9934', '3c571cc1-a2b2-441f-ba78-7e591b762510', '法国', 'tourist', NULL, NULL, '2025-11-21', 'single', 'active', '', NULL, '2025-11-09 06:08:42.26087+00', '2025-11-09 06:08:42.26087+00', 'personal', NULL, NULL, NULL, NULL, false, false),
  ('4fb506d1-f82e-4134-8d10-8c67937cf225', '3c571cc1-a2b2-441f-ba78-7e591b762510', '法国', 'tourist', NULL, NULL, '2025-11-29', 'single', 'active', '', NULL, '2025-11-09 06:09:16.820006+00', '2025-11-09 06:09:16.820006+00', 'personal', NULL, NULL, NULL, NULL, false, false);

-- =====================================================
-- 数据导入说明
-- =====================================================
-- 1. 首先确保已在新 Supabase 项目中运行所有迁移脚本
-- 2. 在新项目的 Supabase Dashboard 中：
--    - 进入 SQL Editor
--    - 复制粘贴此脚本
--    - 点击 "Run" 执行
-- 3. 验证数据导入成功：
--    SELECT COUNT(*) FROM profiles;  -- 应该返回 2
--    SELECT COUNT(*) FROM subscriptions;  -- 应该返回 2
--    SELECT COUNT(*) FROM visas;  -- 应该返回 6
--    SELECT COUNT(*) FROM payment_requests;  -- 应该返回 1
-- =====================================================

-- =====================================================
-- 注意事项
-- =====================================================
-- ⚠️ 用户认证数据 (auth.users) 需要单独导出导入
--    在 Supabase Dashboard → Authentication → Users 中操作
--
-- ⚠️ 上传的文件 (Storage) 需要手动迁移
--    在 Supabase Dashboard → Storage → visa-documents 中操作
--
-- ✅ UUID 保持不变，保证数据关联关系完整
-- ✅ 所有时间戳保持原值，保留历史记录
-- =====================================================
