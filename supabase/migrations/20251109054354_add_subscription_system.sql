/*
  # 订阅系统 (Subscription System)

  1. 新增表
    - `subscriptions`
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键 -> profiles)
      - `plan_type` (text) - 'free' 或 'premium'
      - `status` (text) - 'active', 'expired', 'cancelled'
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `auto_renew` (boolean)
      - `payment_method` (text) - 支付方式
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subscription_features`
      - `id` (uuid, 主键)
      - `plan_type` (text)
      - `feature_name` (text)
      - `feature_value` (jsonb)
      
  2. 更新 profiles 表
    - 添加 `subscription_plan` 字段
    - 添加 `visa_count` 字段用于快速查询
    
  3. 安全性
    - 启用 RLS
    - 用户只能查看和更新自己的订阅信息
*/

-- 创建订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT false,
  payment_method text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建订阅功能配置表
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'premium')),
  feature_name text NOT NULL,
  feature_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_type, feature_name)
);

-- 为 profiles 添加订阅相关字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'visa_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN visa_count integer DEFAULT 0;
  END IF;
END $$;

-- 插入默认的订阅功能配置
INSERT INTO subscription_features (plan_type, feature_name, feature_value) VALUES
  ('free', 'max_visas', '{"limit": 5}'::jsonb),
  ('free', 'reminders', '{"channels": ["email"]}'::jsonb),
  ('free', 'storage', '{"type": "local"}'::jsonb),
  ('free', 'support', '{"priority": "standard"}'::jsonb),
  ('premium', 'max_visas', '{"limit": -1}'::jsonb),
  ('premium', 'reminders', '{"channels": ["email", "sms", "push"]}'::jsonb),
  ('premium', 'storage', '{"type": "cloud", "encrypted": true}'::jsonb),
  ('premium', 'support', '{"priority": "premium", "dedicated": true}'::jsonb),
  ('premium', 'services', '{"one_click": true, "agents": true}'::jsonb),
  ('premium', 'team', '{"multi_user": true, "hr_dashboard": true}'::jsonb)
ON CONFLICT (plan_type, feature_name) DO NOTHING;

-- 为现有用户创建免费订阅
INSERT INTO subscriptions (user_id, plan_type, status, start_date)
SELECT id, 'free', 'active', now()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE subscriptions.user_id = auth.users.id
);

-- 启用 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;

-- 订阅表策略
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 订阅功能表策略（所有用户可读）
CREATE POLICY "Anyone can view subscription features"
  ON subscription_features FOR SELECT
  TO authenticated
  USING (true);

-- 创建函数：检查用户是否可以添加更多签证
CREATE OR REPLACE FUNCTION can_add_visa(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_plan text;
  v_current_count integer;
  v_max_visas integer;
BEGIN
  -- 获取用户的订阅计划
  SELECT subscription_plan INTO v_plan
  FROM profiles
  WHERE id = p_user_id;
  
  -- 获取当前签证数量
  SELECT COUNT(*) INTO v_current_count
  FROM visas
  WHERE user_id = p_user_id;
  
  -- 获取该计划的最大签证数量限制
  SELECT (feature_value->>'limit')::integer INTO v_max_visas
  FROM subscription_features
  WHERE plan_type = v_plan AND feature_name = 'max_visas';
  
  -- -1 表示无限制
  IF v_max_visas = -1 THEN
    RETURN true;
  END IF;
  
  -- 检查是否超过限制
  RETURN v_current_count < v_max_visas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：更新签证数量
CREATE OR REPLACE FUNCTION update_visa_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET visa_count = visa_count + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET visa_count = GREATEST(0, visa_count - 1)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定触发器到 visas 表
DROP TRIGGER IF EXISTS update_visa_count_trigger ON visas;
CREATE TRIGGER update_visa_count_trigger
  AFTER INSERT OR DELETE ON visas
  FOR EACH ROW
  EXECUTE FUNCTION update_visa_count();

-- 初始化现有用户的签证数量
UPDATE profiles p
SET visa_count = (
  SELECT COUNT(*)
  FROM visas v
  WHERE v.user_id = p.id
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_features_plan ON subscription_features(plan_type);
