// api/gmb/check-reviews.js
// Récupère les avis depuis une date donnée (pour détecter les nouveaux)
export default async function handler(req, res) {
  const access_token = req.headers.authorization?.replace("Bearer ", "") || req.query.access_token;
  const { location_name, since } = req.query;
  // since = ISO date string, ex: "2026-05-01T00:00:00Z"

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name) return res.status(400).json({ error: "location_name requis" });

  try {
    const r = await fetch(
      `https://mybusiness.googleapis.com/v4/${location_name}/reviews?pageSize=50&orderBy=updateTime+desc`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const allReviews = (data.reviews || []).map((rv) => ({
      name: rv.reviewId ? `${location_name}/reviews/${rv.reviewId}` : null,
      reviewId: rv.reviewId,
      author: rv.reviewer?.displayName || "Anonyme",
      profilePhoto: rv.reviewer?.profilePhotoUrl || null,
      rating: { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[rv.starRating] || 0,
      text: rv.comment || "",
      date: rv.updateTime || rv.createTime || "",
      reply: rv.reviewReply?.comment || null,
      replyDate: rv.reviewReply?.updateTime || null,
    }));

    // Filtre les nouveaux si "since" est fourni
    const sinceDate = since ? new Date(since) : null;
    const newReviews = sinceDate
      ? allReviews.filter((rv) => rv.date && new Date(rv.date) > sinceDate)
      : allReviews;

    res.json({
      reviews: allReviews,
      newReviews,
      newCount: newReviews.length,
      totalReviewCount: data.totalReviewCount || allReviews.length,
      averageRating: data.averageRating || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
