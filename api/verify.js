const { Redis } = require('@upstash/redis');
const kv = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

// 验证 license 是否有效
// GET /api/verify?key=xxx

module.exports = async (req, res) => {
  const key = req.query.key;
  if (!key) return res.json({ valid: false });

  try {
    const license = await kv.get(`license:${key}`);
    if (license && license.valid) {
      return res.json({ valid: true });
    }
  } catch (e) {}

  res.json({ valid: false });
};
