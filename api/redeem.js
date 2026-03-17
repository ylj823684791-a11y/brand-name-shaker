const crypto = require('crypto');
const { Redis } = require('@upstash/redis');
const kv = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

// 用户兑换码接口
// POST /api/redeem  body: { code: "BNS-XXXX-XXXX" }

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.json({ success: false, message: '请输入兑换码' });
  }

  // 统一格式: 去空格, 转大写
  const cleanCode = code.trim().toUpperCase();

  // 查询码
  const codeData = await kv.get(`code:${cleanCode}`);

  if (!codeData) {
    return res.json({ success: false, message: '兑换码无效' });
  }

  if (codeData.status === 'used') {
    return res.json({ success: false, message: '该兑换码已被使用' });
  }

  // 生成 license key
  const licenseKey = crypto.randomBytes(24).toString('hex');

  // 标记码为已使用
  await kv.set(`code:${cleanCode}`, {
    status: 'used',
    used_at: Date.now(),
    license_key: licenseKey,
  }, { ex: 86400 * 365 * 3 });

  // 存储 license
  await kv.set(`license:${licenseKey}`, {
    code: cleanCode,
    activated: Date.now(),
    valid: true,
  }, { ex: 86400 * 365 * 3 }); // 三年

  res.json({
    success: true,
    license_key: licenseKey,
    message: '解锁成功！',
  });
};
