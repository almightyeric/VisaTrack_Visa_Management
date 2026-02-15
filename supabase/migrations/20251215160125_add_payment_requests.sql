/*
  # 支付请求系统 (Payment Request System)

  1. 新增表
    - `payment_requests`
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键 -> auth.users)
      - `email` (text) - 用户邮箱
      - `full_name` (text) - 用户全名
      - `plan_type` (text) - 'monthly' 或 'yearly'
      - `amount` (numeric) - 支付金额
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `payment_proof` (text) - 支付凭证说明
      - `admin_notes` (text) - 管理员备注
      - `approved_by` (uuid) - 批准的管理员ID
      - `approved_at` (timestamptz) - 批准时间
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. 更新 profiles 表
    - 添加 `is_admin` 字段用于标识管理员

  3. 安全性
    - 启用 RLS
    - 用户可以查看和创建自己的支付请求
    - 管理员可以查看所有支付请求并批准/拒绝
*/

-- 为 profiles 添加管理员标识字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- 创建支付请求表
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_proof text,
  admin_notes text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的支付请求
CREATE POLICY "Users can view own payment requests"
  ON payment_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户可以创建自己的支付请求
CREATE POLICY "Users can create own payment requests"
  ON payment_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有支付请求
CREATE POLICY "Admins can view all payment requests"
  ON payment_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 管理员可以更新所有支付请求
CREATE POLICY "Admins can update all payment requests"
  ON payment_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 创建函数：批准支付请求并升级用户订阅
CREATE OR REPLACE FUNCTION approve_payment_request(
  p_request_id uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
  v_plan_type text;
  v_end_date timestamptz;
BEGIN
  -- 获取支付请求信息
  SELECT user_id, plan_type INTO v_user_id, v_plan_type
  FROM payment_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- 计算订阅结束日期
  IF v_plan_type = 'monthly' THEN
    v_end_date := now() + INTERVAL '1 month';
  ELSIF v_plan_type = 'yearly' THEN
    v_end_date := now() + INTERVAL '1 year';
  END IF;
  
  -- 更新支付请求状态
  UPDATE payment_requests
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = p_request_id;
  
  -- 更新用户订阅状态
  UPDATE profiles
  SET subscription_plan = 'premium'
  WHERE id = v_user_id;
  
  -- 更新或创建订阅记录
  INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, payment_method)
  VALUES (v_user_id, 'premium', 'active', now(), v_end_date, 'aba_pay')
  ON CONFLICT (user_id) DO UPDATE
  SET 
    plan_type = 'premium',
    status = 'active',
    start_date = now(),
    end_date = v_end_date,
    payment_method = 'aba_pay',
    updated_at = now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：拒绝支付请求
CREATE OR REPLACE FUNCTION reject_payment_request(
  p_request_id uuid,
  p_admin_notes text
)
RETURNS boolean AS $$
BEGIN
  UPDATE payment_requests
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = p_request_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;