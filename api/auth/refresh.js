// api/auth/refresh.js
// Rafraîchit l'access_token à partir du refresh_token
export default async function handler(req, res) {
  const { refresh_token } = req.method === "POST" ? req.body : req.query;

  if (!refresh_token) {
    return res.status(400).json({ error: "refresh_token manquant" });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
      }).toString(),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.status(401).json({ error: tokens.error_description || tokens.error });
    }

    res.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in || 3600,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
