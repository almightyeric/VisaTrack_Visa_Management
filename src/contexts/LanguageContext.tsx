import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh' | 'km';

interface Translations {
  [key: string]: {
    en: string;
    zh: string;
    km: string;
  };
}

const translations: Translations = {
  appName: {
    en: 'VisaTrack',
    zh: 'VisaTrack',
    km: 'VisaTrack',
  },
  appTagline: {
    en: 'Smart Visa Assistant for Cambodia',
    zh: '柬埔寨智能签证管理助手',
    km: 'ជំនួយការទិដ្ឋាការឆ្លាតវៃសម្រាប់កម្ពុជា',
  },
  appDescription: {
    en: 'For global workers, expats, and free travelers',
    zh: '为跨国工作者、企业外籍员工和自由旅行者打造',
    km: 'សម្រាប់អ្នកធ្វើការអន្តរជាតិ និងអ្នកធ្វើដំណើរសេរី',
  },
  signIn: {
    en: 'Sign In',
    zh: '登录',
    km: 'ចូល',
  },
  signUp: {
    en: 'Sign Up',
    zh: '注册',
    km: 'ចុះឈ្មោះ',
  },
  email: {
    en: 'Email',
    zh: '邮箱',
    km: 'អ៊ីមែល',
  },
  password: {
    en: 'Password',
    zh: '密码',
    km: 'ពាក្យសម្ងាត់',
  },
  fullName: {
    en: 'Full Name',
    zh: '全名',
    km: 'ឈ្មោះពេញ',
  },
  signOut: {
    en: 'Sign Out',
    zh: '退出',
    km: 'ចាកចេញ',
  },
  dashboard: {
    en: 'Dashboard',
    zh: '仪表板',
    km: 'ផ្ទាំងគ្រប់គ្រង',
  },
  totalVisas: {
    en: 'Total Visas',
    zh: '签证总数',
    km: 'ទិដ្ឋាការសរុប',
  },
  activeVisas: {
    en: 'Active Visas',
    zh: '有效签证',
    km: 'ទិដ្ឋាការសកម្ម',
  },
  expiringSoon: {
    en: 'Expiring Soon',
    zh: '即将到期',
    km: 'ជិតផុតកំណត់',
  },
  addVisa: {
    en: 'Add Visa',
    zh: '添加签证',
    km: 'បន្ថែមទិដ្ឋាការ',
  },
  editVisa: {
    en: 'Edit Visa',
    zh: '编辑签证',
    km: 'កែសម្រួលទិដ្ឋាការ',
  },
  country: {
    en: 'Country',
    zh: '国家',
    km: 'ប្រទេស',
  },
  visaType: {
    en: 'Visa Type',
    zh: '签证类型',
    km: 'ប្រភេទទិដ្ឋាការ',
  },
  category: {
    en: 'Category',
    zh: '类别',
    km: 'ប្រភេទ',
  },
  personal: {
    en: 'Personal',
    zh: '个人',
    km: 'ផ្ទាល់ខ្លួន',
  },
  family: {
    en: 'Family',
    zh: '家人',
    km: 'គ្រួសារ',
  },
  employee: {
    en: 'Employee',
    zh: '员工',
    km: 'និយោជិត',
  },
  personName: {
    en: 'Person Name',
    zh: '姓名',
    km: 'ឈ្មោះ',
  },
  relationship: {
    en: 'Relationship',
    zh: '关系',
    km: 'ទំនាក់ទំនង',
  },
  expiryDate: {
    en: 'Expiry Date',
    zh: '到期日期',
    km: 'កាលបរិច្ឆេទផុតកំណត់',
  },
  issueDate: {
    en: 'Issue Date',
    zh: '签发日期',
    km: 'កាលបរិច្ឆេទចេញ',
  },
  visaNumber: {
    en: 'Visa Number',
    zh: '签证号码',
    km: 'លេខទិដ្ឋាការ',
  },
  entryType: {
    en: 'Entry Type',
    zh: '入境类型',
    km: 'ប្រភេទចូល',
  },
  singleEntry: {
    en: 'Single Entry',
    zh: '单次入境',
    km: 'ចូលតែមួយដង',
  },
  multipleEntry: {
    en: 'Multiple Entry',
    zh: '多次入境',
    km: 'ចូលច្រើនដង',
  },
  status: {
    en: 'Status',
    zh: '状态',
    km: 'ស្ថានភាព',
  },
  active: {
    en: 'Active',
    zh: '有效',
    km: 'សកម្ម',
  },
  expired: {
    en: 'Expired',
    zh: '已过期',
    km: 'ផុតកំណត់',
  },
  pending: {
    en: 'Pending',
    zh: '待处理',
    km: 'រង់ចាំ',
  },
  cancelled: {
    en: 'Cancelled',
    zh: '已取消',
    km: 'បានលុបចោល',
  },
  notes: {
    en: 'Notes',
    zh: '备注',
    km: 'កំណត់ចំណាំ',
  },
  save: {
    en: 'Save',
    zh: '保存',
    km: 'រក្សាទុក',
  },
  cancel: {
    en: 'Cancel',
    zh: '取消',
    km: 'បោះបង់',
  },
  delete: {
    en: 'Delete',
    zh: '删除',
    km: 'លុប',
  },
  edit: {
    en: 'Edit',
    zh: '编辑',
    km: 'កែសម្រួល',
  },
  visaEncyclopedia: {
    en: 'Visa Encyclopedia',
    zh: '签证百科',
    km: 'សព្វាធិប្បាយទិដ្ឋាការ',
  },
  services: {
    en: 'Services',
    zh: '服务',
    km: 'សេវាកម្ម',
  },
  settings: {
    en: 'Settings',
    zh: '设置',
    km: 'ការកំណត់',
  },
  featureAutoRecord: {
    en: 'Auto-record visa & residence information',
    zh: '自动记录签证与居留信息',
    km: 'កត់ត្រាព័ត៌មានទិដ្ឋាការដោយស្វ័យប្រវត្តិ',
  },
  featureSmartReminder: {
    en: 'Smart expiry calculation and reminders',
    zh: '智能计算到期日并提前提醒',
    km: 'គណនាកាលបរិច្ឆេទផុតកំណត់ឆ្លាតវៃ',
  },
  featureOneClick: {
    en: 'One-click access to agencies & services',
    zh: '一键对接签证中介、律师或政府窗口',
    km: 'ភ្ជាប់ទៅកាន់ភ្នាក់ងារនិងសេវាកម្ម',
  },
  featureSecure: {
    en: 'Secure data, avoid fines & overstay risks',
    zh: '保障资料安全，避免过期罚款与滞留风险',
    km: 'ទិន្នន័យសុវត្ថិភាព បញ្ចៀសពិន័យ',
  },
  peaceOfMind: {
    en: 'Your visa is no longer a burden, but peace of mind',
    zh: '从此，你的签证不再是负担，而是一种安心',
    km: 'ទិដ្ឋាការរបស់អ្នកមិនមែនជាបន្ទុកទៀតទេ',
  },
  cambodiaFocus: {
    en: 'Specialized for Cambodia',
    zh: '专注柬埔寨市场',
    km: 'ឯកទេសសម្រាប់កម្ពុជា',
  },
  freePlan: {
    en: 'Free',
    zh: '免费版',
    km: 'ឥតគិតថ្លៃ',
  },
  premiumPlan: {
    en: 'Premium',
    zh: '高级版',
    km: 'ពិសេស',
  },
  upgradeToPremium: {
    en: 'Upgrade to Premium',
    zh: '升级到高级版',
    km: 'ធ្វើឱ្យប្រសើរទៅពិសេស',
  },
  visaLimit: {
    en: 'Visa Limit',
    zh: '签证数量',
    km: 'ចំនួនទិដ្ឋាការ',
  },
  visasUsed: {
    en: 'visas',
    zh: '个签证',
    km: 'ទិដ្ឋាការ',
  },
  unlimitedVisas: {
    en: 'Unlimited',
    zh: '无限制',
    km: 'គ្មានដែនកំណត់',
  },
  upgradeMessage: {
    en: 'You have reached the free plan limit. Upgrade to Premium for unlimited visas and more features.',
    zh: '您已达到免费版上限。升级到高级版享受无限签证和更多功能。',
    km: 'អ្នកបានដល់ដែនកំណត់។ ធ្វើឱ្យប្រសើរសម្រាប់មុខងារច្រើនទៀត។',
  },
  upgradeNow: {
    en: 'Upgrade Now',
    zh: '立即升级',
    km: 'ធ្វើឱ្យប្រសើរឥឡូវ',
  },
  maybeLater: {
    en: 'Maybe Later',
    zh: '以后再说',
    km: 'ពេលក្រោយ',
  },
  perMonth: {
    en: '/month',
    zh: '/月',
    km: '/ខែ',
  },
  perYear: {
    en: '/year',
    zh: '/年',
    km: '/ឆ្នាំ',
  },
  currentPlan: {
    en: 'Current Plan',
    zh: '当前计划',
    km: 'ផែនការបច្ចុប្បន្ន',
  },
  emailReminders: {
    en: 'Email reminders',
    zh: '邮件提醒',
    km: 'ការរំឭកអ៊ីមែល',
  },
  allChannels: {
    en: 'Email + SMS + Push',
    zh: '邮件+短信+推送',
    km: 'អ៊ីមែល+សារ+ជូនដំណឹង',
  },
  localOnly: {
    en: 'Local storage',
    zh: '本地存储',
    km: 'ការរក្សាទុកក្នុងស្រុក',
  },
  cloudBackup: {
    en: 'Cloud backup',
    zh: '云端备份',
    km: 'ការបម្រុងទុកពពក',
  },
  manualService: {
    en: 'Manual',
    zh: '手动',
    km: 'ដោយដៃ',
  },
  oneClickService: {
    en: 'One-click',
    zh: '一键对接',
    km: 'ចុចតែម្តង',
  },
  standardSupport: {
    en: 'Standard',
    zh: '标准',
    km: 'ស្តង់ដារ',
  },
  prioritySupport: {
    en: 'Priority',
    zh: '优先',
    km: 'អាទិភាព',
  },
  pricingTitle: {
    en: 'Choose Your Plan',
    zh: '选择您的计划',
    km: 'ជ្រើសរើសផែនការ',
  },
  pricingSubtitle: {
    en: 'Start free, upgrade when you need more',
    zh: '免费开始，需要时再升级',
    km: 'ចាប់ផ្តើមឥតគិតថ្លៃ',
  },
  visa4Message: {
    en: 'Great! 1 slot left. Consider Premium for unlimited.',
    zh: '还剩1个名额。升级Premium享无限签证。',
    km: 'នៅសល់ ១ កន្លែង។',
  },
  visa5Message: {
    en: 'Free quota complete! Upgrade to continue.',
    zh: '免费额度已用完！升级继续使用。',
    km: 'អស់កន្លែង! ធ្វើឱ្យប្រសើរ។',
  },
  remainingSlots: {
    en: 'remaining',
    zh: '个剩余',
    km: 'នៅសល់',
  },
  congratsPremium: {
    en: 'Congratulations! You are Premium',
    zh: '恭喜成为Premium会员',
    km: 'សូមអបអរសាទរ',
  },
  premiumActive: {
    en: 'Premium Active',
    zh: 'Premium激活',
    km: 'Premium សកម្ម',
  },
  notifications: {
    en: 'Notifications',
    zh: '通知',
    km: 'ការជូនដំណឹង',
  },
  language: {
    en: 'Language',
    zh: '语言',
    km: 'ភាសា',
  },
  tourist: {
    en: 'Tourist',
    zh: '旅游',
    km: 'ទេសចរណ៍',
  },
  business: {
    en: 'Business',
    zh: '商务',
    km: 'អាជីវកម្ម',
  },
  student: {
    en: 'Student',
    zh: '学生',
    km: 'សិស្ស',
  },
  work: {
    en: 'Work',
    zh: '工作',
    km: 'ការងារ',
  },
  uploadPhoto: {
    en: 'Upload Photo',
    zh: '上传照片',
    km: 'ផ្ទុកឡើងរូបភាព',
  },
  takePhoto: {
    en: 'Take Photo',
    zh: '拍照',
    km: 'ថតរូប',
  },
  capturePhoto: {
    en: 'Capture Photo',
    zh: '拍摄照片',
    km: 'ថតរូបភាព',
  },
  visaPhoto: {
    en: 'Visa Photo',
    zh: '签证照片',
    km: 'រូបភាពទិដ្ឋាការ',
  },
  smartRecognition: {
    en: 'Smart Visa Recognition',
    zh: '智能识别签证信息',
    km: 'ការសម្គាល់ទិដ្ឋាការឆ្លាត',
  },
  uploadOrCapture: {
    en: 'Upload or capture visa photo for automatic extraction',
    zh: '上传或拍摄签证照片，自动提取信息',
    km: 'ផ្ទុកឡើងឬថតរូបទិដ្ឋាការសម្រាប់ការស្រង់ស្វ័យប្រវត្តិ',
  },
  analyzing: {
    en: 'Analyzing visa...',
    zh: '正在识别签证信息...',
    km: 'កំពុងវិភាគទិដ្ឋាការ...',
  },
  extracted: {
    en: 'Information extracted!',
    zh: '签证信息已提取！',
    km: 'បានស្រង់ព័ត៌មាន!',
  },
  fillManually: {
    en: 'Please fill manually',
    zh: '请手动填写',
    km: 'សូមបំពេញដោយដៃ',
  },
  extractionFailed: {
    en: 'Extraction failed, please fill manually',
    zh: '识别失败，请手动填写信息',
    km: 'ការស្រង់បានបរាជ័យ សូមបំពេញដោយដៃ',
  },
  extractedInfo: {
    en: 'Extracted Visa Information',
    zh: '识别到的签证信息',
    km: 'ព័ត៌មានទិដ្ឋាការដែលបានស្រង់',
  },
  confirmInfo: {
    en: 'Please confirm the information below',
    zh: '请确认以下信息是否正确',
    km: 'សូមបញ្ជាក់ព័ត៌មានខាងក្រោម',
  },
  confirmFill: {
    en: 'Confirm & Fill',
    zh: '确认填写',
    km: 'បញ្ជាក់និងបំពេញ',
  },
  manualFill: {
    en: 'Fill Manually',
    zh: '手动填写',
    km: 'បំពេញដោយដៃ',
  },
  positionVisa: {
    en: 'Position visa page and capture',
    zh: '对准签证页拍照',
    km: 'ដាក់ទីតាំងទំព័រទិដ្ឋាការហើយថត',
  },
  supported: {
    en: 'Supported',
    zh: '支持格式',
    km: 'គាំទ្រ',
  },
  addNewVisa: {
    en: 'Add New Visa',
    zh: '添加新签证',
    km: 'បន្ថែមទិដ្ឋាការថ្មី',
  },
  saving: {
    en: 'Saving...',
    zh: '保存中...',
    km: 'កំពុងរក្សាទុក...',
  },
  updateVisa: {
    en: 'Update Visa',
    zh: '更新签证',
    km: 'ធ្វើបច្ចុប្បន្នភាពទិដ្ឋាការ',
  },
  holderName: {
    en: 'Holder Name',
    zh: '持有人姓名',
    km: 'ឈ្មោះម្ចាស់',
  },
  optional: {
    en: 'Optional',
    zh: '可选',
    km: 'ស្រេចចិត្ត',
  },
  required: {
    en: 'Required',
    zh: '必填',
    km: 'ត្រូវការ',
  },
  loading: {
    en: 'Loading visas...',
    zh: '加载中...',
    km: 'កំពុងផ្ទុក...',
  },
  noVisas: {
    en: 'No visas found. Click "Add Visa" to get started.',
    zh: '未找到签证。点击"添加签证"开始使用。',
    km: 'រកមិនឃើញទិដ្ឋាការ។ចុច "បន្ថែមទិដ្ឋាការ" ដើម្បីចាប់ផ្តើម។',
  },
  visaManagementSystem: {
    en: 'Smart Visa Assistant',
    zh: '智能签证助手',
    km: 'ជំនួយការទិដ្ឋាការឆ្លាតវៃ',
  },
  skipToContent: {
    en: 'Skip to main content',
    zh: '跳转到主要内容',
    km: 'រំលងទៅមាតិកាសំខាន់',
  },
  goToHome: {
    en: 'Go to home',
    zh: '返回首页',
    km: 'ទៅទំព័រដើម',
  },
  selectLanguage: {
    en: 'Select language',
    zh: '选择语言',
    km: 'ជ្រើសរើសភាសា',
  },
  userMenu: {
    en: 'User menu',
    zh: '用户菜单',
    km: 'ម៉ឺនុយអ្នកប្រើប្រាស់',
  },
  help: {
    en: 'Help & Support',
    zh: '帮助与支持',
    km: 'ជំនួយ',
  },
  closeMenu: {
    en: 'Close menu',
    zh: '关闭菜单',
    km: 'បិទម៉ឺនុយ',
  },
  openMenu: {
    en: 'Open menu',
    zh: '打开菜单',
    km: 'បើកម៉ឺនុយ',
  },
  paymentMethod: {
    en: 'Payment Method',
    zh: '支付方式',
    km: 'វិធីសាស្ត្របង់ប្រាក់',
  },
  scanQRCode: {
    en: 'Scan QR Code to Pay',
    zh: '扫描二维码支付',
    km: 'ស្កេនលេខកូដ QR ដើម្បីបង់ប្រាក់',
  },
  monthlyPlan: {
    en: 'Monthly Plan',
    zh: '月度计划',
    km: 'ផែនការប្រចាំខែ',
  },
  yearlyPlan: {
    en: 'Yearly Plan',
    zh: '年度计划',
    km: 'ផែនការប្រចាំឆ្នាំ',
  },
  savePercent: {
    en: 'Save 17%',
    zh: '节省17%',
    km: 'សន្សំ 17%',
  },
  paymentInstructions: {
    en: 'Please scan the QR code with ABA Mobile app to complete the payment',
    zh: '请使用 ABA Mobile 扫描二维码完成支付',
    km: 'សូមស្កេនលេខកូដ QR ជាមួយកម្មវិធី ABA Mobile ដើម្បីបញ្ចប់ការទូទាត់',
  },
  paymentAmount: {
    en: 'Payment Amount',
    zh: '支付金额',
    km: 'ចំនួនទឹកប្រាក់',
  },
  proceedToPayment: {
    en: 'Proceed to Payment',
    zh: '前往支付',
    km: 'បន្តទៅការទូទាត់',
  },
  backToPlans: {
    en: 'Back to Plans',
    zh: '返回计划选择',
    km: 'ត្រលប់ទៅផែនការ',
  },
  paymentComplete: {
    en: 'After payment, please wait for account upgrade',
    zh: '支付完成后，请等待账户升级',
    km: 'បន្ទាប់ពីបង់ប្រាក់ សូមរង់ចាំការធ្វើឱ្យប្រសើរគណនី',
  },
  contactSupport: {
    en: 'Need help? Contact support',
    zh: '需要帮助？联系客服',
    km: 'ត្រូវការជំនួយ? ទាក់ទងជំនួយ',
  },
  payWithABA: {
    en: 'Pay with ABA',
    zh: '使用 ABA 支付',
    km: 'បង់ជាមួយ ABA',
  },
  selectPlan: {
    en: 'Select Plan',
    zh: '选择计划',
    km: 'ជ្រើសរើសផែនការ',
  },
  confirmPayment: {
    en: 'Confirm Payment',
    zh: '确认支付',
    km: 'បញ្ជាក់ការទូទាត់',
  },
  paymentConfirmed: {
    en: 'Payment request submitted! Please wait for admin approval.',
    zh: '支付请求已提交！请等待管理员审核。',
    km: 'សំណើទូទាត់បានដាក់ស្នើ! សូមរង់ចាំការអនុម័ត។',
  },
  adminPanel: {
    en: 'Admin Panel',
    zh: '管理后台',
    km: 'ផ្ទាំងគ្រប់គ្រង',
  },
  paymentRequests: {
    en: 'Payment Requests',
    zh: '支付请求',
    km: 'សំណើទូទាត់',
  },
  pendingRequests: {
    en: 'Pending Requests',
    zh: '待审核',
    km: 'រង់ចាំ',
  },
  approvedRequests: {
    en: 'Approved',
    zh: '已批准',
    km: 'បានអនុម័ត',
  },
  rejectedRequests: {
    en: 'Rejected',
    zh: '已拒绝',
    km: 'បានបដិសេធ',
  },
  approve: {
    en: 'Approve',
    zh: '批准',
    km: 'អនុម័ត',
  },
  reject: {
    en: 'Reject',
    zh: '拒绝',
    km: 'បដិសេធ',
  },
  adminNotes: {
    en: 'Admin Notes',
    zh: '管理员备注',
    km: 'កំណត់ចំណាំអ្នកគ្រប់គ្រង',
  },
  requestDate: {
    en: 'Request Date',
    zh: '请求日期',
    km: 'កាលបរិច្ឆេទស្នើសុំ',
  },
  userName: {
    en: 'User Name',
    zh: '用户名',
    km: 'ឈ្មោះអ្នកប្រើ',
  },
  plan: {
    en: 'Plan',
    zh: '计划',
    km: 'ផែនការ',
  },
  amount: {
    en: 'Amount',
    zh: '金额',
    km: 'ចំនួនទឹកប្រាក់',
  },
  actions: {
    en: 'Actions',
    zh: '操作',
    km: 'សកម្មភាព',
  },
  noRequests: {
    en: 'No payment requests',
    zh: '暂无支付请求',
    km: 'គ្មានសំណើទូទាត់',
  },
  confirmApprove: {
    en: 'Are you sure you want to approve this payment request?',
    zh: '确定要批准这个支付请求吗？',
    km: 'តើអ្នកប្រាកដថាចង់អនុម័តសំណើទូទាត់នេះទេ?',
  },
  confirmReject: {
    en: 'Are you sure you want to reject this payment request?',
    zh: '确定要拒绝这个支付请求吗？',
    km: 'តើអ្នកប្រាកដថាចង់បដិសេធសំណើទូទាត់នេះទេ?',
  },
  enterNotes: {
    en: 'Enter notes (optional)',
    zh: '输入备注（可选）',
    km: 'បញ្ចូលកំណត់ចំណាំ (ស្រេចចិត្ត)',
  },
  submitting: {
    en: 'Submitting...',
    zh: '提交中...',
    km: 'កំពុងដាក់ស្នើ...',
  },
  paymentProof: {
    en: 'Payment Proof',
    zh: '支付凭证',
    km: 'ភស្តុតាងទូទាត់',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'zh', 'km'].includes(saved)) {
      setLanguageState(saved);
    } else {
      setLanguageState('zh');
      localStorage.setItem('language', 'zh');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
