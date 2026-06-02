// api/gmb/create-post.js
// Publie un post sur une fiche Google My Business
// Supporte : STANDARD (Actualité), EVENT (Événement), OFFER (Offre)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const access_token = req.headers.authorization?.replace("Bearer ", "");
  const {
    location_name,
    summary,             // description principale (max 1500 car.)
    topic_type,          // "STANDARD" | "EVENT" | "OFFER"
    call_to_action_type, // "BOOK" | "ORDER" | "SHOP" | "LEARN_MORE" | "SIGN_UP" | "CALL"
    call_to_action_url,
    // Événement & Offre
    event_title,
    start_date,          // "YYYY-MM-DD"
    start_time,          // "HH:MM"
    end_date,
    end_time,
    // Offre uniquement
    coupon_code,
    redeem_url,
    terms_conditions,
    // Photo
    photo_url,
  } = req.body || {};

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name || !summary) return res.status(400).json({ error: "location_name et summary requis" });

  const type = topic_type || "STANDARD";

  const post = {
    topicType: type,
    summary,
  };

  // CTA
  if (call_to_action_type) {
    post.callToAction = { actionType: call_to_action_type };
    if (call_to_action_url) post.callToAction.url = call_to_action_url;
  }

  // Photo
  if (photo_url) {
    post.media = [{ mediaFormat: "PHOTO", sourceUrl: photo_url }];
  }

  // Champs Événement
  if (type === "EVENT" && event_title) {
    post.event = {
      title: event_title,
      schedule: {},
    };
    if (start_date) {
      const [sy, sm, sd] = start_date.split("-");
      post.event.schedule.startDate = { year: parseInt(sy), month: parseInt(sm), day: parseInt(sd) };
    }
    if (start_time) {
      const [sh, smin] = start_time.split(":");
      post.event.schedule.startTime = { hours: parseInt(sh), minutes: parseInt(smin) };
    }
    if (end_date) {
      const [ey, em, ed] = end_date.split("-");
      post.event.schedule.endDate = { year: parseInt(ey), month: parseInt(em), day: parseInt(ed) };
    }
    if (end_time) {
      const [eh, emin] = end_time.split(":");
      post.event.schedule.endTime = { hours: parseInt(eh), minutes: parseInt(emin) };
    }
  }

  // Champs Offre
  if (type === "OFFER") {
    post.offer = {};
    if (coupon_code) post.offer.couponCode = coupon_code;
    if (redeem_url) post.offer.redeemOnlineUrl = redeem_url;
    if (terms_conditions) post.offer.termsConditions = terms_conditions;
    // Les offres ont aussi des dates
    if (event_title || start_date || end_date) {
      post.event = { title: event_title || "", schedule: {} };
      if (start_date) {
        const [sy, sm, sd] = start_date.split("-");
        post.event.schedule.startDate = { year: parseInt(sy), month: parseInt(sm), day: parseInt(sd) };
      }
      if (end_date) {
        const [ey, em, ed] = end_date.split("-");
        post.event.schedule.endDate = { year: parseInt(ey), month: parseInt(em), day: parseInt(ed) };
      }
    }
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
