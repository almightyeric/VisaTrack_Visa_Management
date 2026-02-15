#!/bin/bash

# =====================================================
# Git 仓库初始化和推送脚本
# 用于准备项目迁移到新 bolt.new 账户
# =====================================================

echo "🚀 开始准备项目迁移..."
echo ""

# 检查是否已经是 Git 仓库
if [ -d ".git" ]; then
  echo "⚠️  检测到现有 Git 仓库"
  read -p "是否要重新初始化？(y/N): " reinit
  if [ "$reinit" != "y" ] && [ "$reinit" != "Y" ]; then
    echo "✅ 保留现有 Git 仓库"
  else
    echo "🗑️  删除现有 .git 目录..."
    rm -rf .git
    echo "✅ 初始化新 Git 仓库..."
    git init
  fi
else
  echo "✅ 初始化 Git 仓库..."
  git init
fi

echo ""
echo "📝 添加所有文件到 Git..."
git add .

echo ""
echo "💾 创建初始提交..."
git commit -m "Initial commit - Visa Management System

Features:
- 签证管理系统完整功能
- 用户认证和授权
- 订阅和支付系统
- 多语言支持 (中文/英文/高棉语)
- 提醒通知功能
- 管理员面板
- Supabase 数据库集成
- Edge Functions (OCR & Reminders)
"

echo ""
echo "📊 当前项目统计："
echo "   - 前端组件: $(find src/components -name '*.tsx' | wc -l) 个"
echo "   - 数据库迁移: $(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l) 个"
echo "   - Edge Functions: $(ls -1d supabase/functions/*/ 2>/dev/null | wc -l) 个"
echo ""

echo "======================================"
echo "🎯 下一步操作指南"
echo "======================================"
echo ""
echo "1️⃣  在 GitHub 上创建新仓库："
echo "   访问: https://github.com/new"
echo "   仓库名建议: visa-management-system"
echo "   设置为: Private (私有) 或 Public (公开)"
echo ""
echo "2️⃣  复制 GitHub 仓库地址，然后运行："
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  推送成功后，在新的 bolt.new 账户中："
echo "   - 点击 'Import from GitHub'"
echo "   - 选择刚才创建的仓库"
echo "   - bolt.new 会自动设置所有内容"
echo ""
echo "======================================"
echo "📖 详细迁移指南: MIGRATION_GUIDE.md"
echo "======================================"
echo ""
echo "✅ Git 仓库准备完成！"
