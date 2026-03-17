const crypto = require('crypto');
const { Redis } = require('@upstash/redis');
const kv = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

// 生成兑换码的管理接口
// 调用方式: GET /api/generate-codes?secret=你的密钥&count=20
// 环境变量: ADMIN_SECRET (你自己设的管理密码)

module.exports = async (req, res) => {
  const { secret, count = 20 } = req.query;

  // 验证管理密码
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: '无权限' });
  }

  const num = Math.min(parseInt(count), 100); // 单次最多100个
  const codes = [];

  for (let i = 0; i < num; i++) {
    // 生成格式: BNS-XXXX-XXXX (好读好抄)
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `BNS-${part1}-${part2}`;

    // 存入 KV, 标记为未使用
    await kv.set(`code:${code}`, {
      status: 'unused',
      created: Date.now(),
    }, { ex: 86400 * 365 }); // 一年有效

    codes.push(code);
  }

  // 同时返回纯文本方便你直接复制到薯店发货
  const text = codes.join('\n');

  res.json({
    count: codes.length,
    codes,
    text,
    tip: '每个码只能用一次，复制到小红书薯店作为发货内容',
  });
};
