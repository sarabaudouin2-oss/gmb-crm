// api/gmb/post-reply.js
// Publie une réponse à un avis Google My Business
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const access_token = req.headers.authorization?.replace("Bearer ", "");
  const { review_name, reply_text } = req.body || {};
  // review_name ex: "accounts/xxx/locations/yyy/reviews/zzz"

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!review_name || !reply_text) return res.status(400).json({ error: "review_name et reply_text requis" });

  try {
    const r = await fetch(
      `https://mybusiness.googleapis.com/v4/${review_name}/reply`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: reply_text }),
      }
    );
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.json({ success: true, reply: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
