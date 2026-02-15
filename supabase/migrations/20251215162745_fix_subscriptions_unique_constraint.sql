/*
  # 修复订阅表唯一约束 (Fix Subscriptions Unique Constraint)

  1. 更改
    - 在 subscriptions 表的 user_id 列添加唯一约束
    - 这样允许 approve_payment_request 函数中的 ON CONFLICT (user_id) 正常工作

  2. 说明
    - 每个用户只能有一个活跃的订阅记录
    - 唯一约束确保数据完整性
    - 修复批准付款请求时的错误
*/

-- 添加唯一约束到 subscriptions 表的 user_id 列
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;
