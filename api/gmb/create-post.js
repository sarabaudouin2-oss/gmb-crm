// api/gmb/create-post.js
// Publie un post sur une fiche Google My Business
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const access_token = req.headers.authorization?.replace("Bearer ", "");
  const { location_name, summary, call_to_action_type, call_to_action_url, topic_type } = req.body || {};
  // location_name ex: "accounts/xxx/locations/yyy"
  // topic_type: "STANDARD" | "EVENT" | "OFFER"
  // call_to_action_type: "LEARN_MORE" | "BOOK" | "ORDER" | "SHOP" | "SIGN_UP" | "CALL"

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name || !summary) return res.status(400).json({ error: "location_name et summary requis" });

  const post = {
    topicType: topic_type || "STANDARD",
    summary,
  };

  if (call_to_action_type) {
    post.callToAction = { actionType: call_to_action_type };
    if (call_to_action_url) post.callToAction.url = call_to_action_url;
  }

  try {
    const r = await fetch(
      `https://mybusiness.googleapis.com/v4/${location_name}/localPosts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      }
    );
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.json({ success: true, post: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
