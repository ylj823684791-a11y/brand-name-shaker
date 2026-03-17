# 摇个品牌名 - 小红书薯店兑换码版

## 赚钱流程

```
你在小红书发笔记展示工具
  → 用户想解锁完整版
  → 去你的薯店下单 ¥9.9
  → 你发一个兑换码给他
  → 他在网页里输入兑换码
  → 后端验证通过，解锁完成
```

## 项目结构

```
brand-shaker-v2/
├── api/
│   ├── generate-codes.js  # 批量生成兑换码（你自己用）
│   ├── redeem.js          # 用户输入码兑换
│   └── verify.js          # 验证 license 有效性
├── public/
│   └── index.html         # 前端页面
├── package.json
└── vercel.json
```

## 部署步骤

### 1. 推到 GitHub
在 GitHub 新建仓库，把 brand-shaker-v2 文件夹内容推上去。

### 2. Vercel 导入
Vercel 首页 → Add New Project → 选你的 GitHub 仓库 → Deploy

### 3. 启用 KV 存储
项目部署后，进入 Storage 页面 → Create KV Database → 绑定到项目

### 4. 设置环境变量
在 Settings → Environment Variables 加一个：
- `ADMIN_SECRET` → 随便设一个密码（比如 mySecretKey123），用来保护生成兑换码的接口

### 5. 重新部署
加完环境变量后点 Redeploy

## 日常操作

### 批量生成兑换码
浏览器打开：
```
https://你的域名/api/generate-codes?secret=你的ADMIN_SECRET&count=20
```
会返回 20 个兑换码，每个格式 BNS-XXXX-XXXX，复制下来备用。

### 小红书薯店发货
用户下单后，从你的码库里取一个，在薯店里发货（直接发兑换码文本）。

### 日常补码
码快用完了就再调一次接口生成，建议每次生成 20-50 个备着。

## 安全性

- 兑换码由后端生成，存在 Vercel KV（Redis）中
- 每个码只能用一次，用过就标记为 used
- License key 也存在后端，前端无法伪造
- 用户清除浏览器缓存后，页面会自动调后端重新验证 license
- generate-codes 接口有密码保护，别人调不了

## 绑定域名

Vercel 项目 Settings → Domains → 加你的域名
Cloudflare 买的域名把 DNS 指向 Vercel 就行

## 费用

- Vercel: 免费（个人版够用）
- Vercel KV: 免费额度 256MB，存几千个码绰绰有余
- 域名: 一年 50-80 块
- 小红书薯店: 平台抽成约 5%
