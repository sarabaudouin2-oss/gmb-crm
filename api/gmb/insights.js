// api/gmb/insights.js
// Récupère les stats GMB pour un mois donné (format YYYY-MM)
// Utilise la Business Profile Performance API (v1)
export default async function handler(req, res) {
  const access_token = req.headers.authorization?.replace("Bearer ", "") || req.query.access_token;
  const { location_name, month } = req.query;
  // location_name ex: "locations/123456789"
  // month ex: "2026-06"

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name || !month) return res.status(400).json({ error: "location_name et month requis" });

  const [year, monthNum] = month.split("-").map(Number);

  // Premier et dernier jour du mois
  const startDate = { year, month: monthNum, day: 1 };
  const lastDay = new Date(year, monthNum, 0).getDate();
  const endDate = { year, month: monthNum, day: lastDay };

  // Métriques disponibles dans la Performance API
  const metrics = [
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "CALL_CLICKS",
    "WEBSITE_CLICKS",
    "BUSINESS_DIRECTION_REQUESTS",
    "BUSINESS_BOOKINGS",
    "BUSINESS_FOOD_ORDERS",
  ];

  try {
    const results = {};

    // On récupère chaque métrique en parallèle
    await Promise.all(
      metrics.map(async (metric) => {
        const url = new URL(
          `https://businessprofileperformance.googleapis.com/v1/${location_name}:getDailyMetricsTimeSeries`
        );
        url.searchParams.set("dailyMetric", metric);
        url.searchParams.set("dailyRange.start_date.year", startDate.year);
        url.searchParams.set("dailyRange.start_date.month", startDate.month);
        url.searchParams.set("dailyRange.start_date.day", startDate.day);
        url.searchParams.set("dailyRange.end_date.year", endDate.year);
        url.searchParams.set("dailyRange.end_date.month", endDate.month);
        url.searchParams.set("dailyRange.end_date.day", endDate.day);

        const r = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = await r.json();

        // Somme tous les jours du mois
        const values = data.timeSeries?.datedValues || [];
        const total = values.reduce((sum, v) => sum + (v.value || 0), 0);
        results[metric] = total;
      })
    );

    // On récupère aussi le nombre d'avis et la note (via Business Information API)
    let reviewCount = null;
    let avgRating = null;
    try {
      const rInfo = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${location_name}?readMask=name,title,rating,userRatingCount`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const infoData = await rInfo.json();
      reviewCount = infoData.userRatingCount ?? null;
      avgRating = infoData.rating ?? null;
    } catch (_) {}

    // Nombre de photos (optionnel, activé via ?photos=1)
    let totalPhotos = 0;
    if (req.query.photos === "1") {
      try {
        const rPhotos = await fetch(
          `https://mybusiness.googleapis.com/v4/${location_name}/media?pageSize=100`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (rPhotos.ok) {
          const pd = await rPhotos.json();
          totalPhotos = (pd.mediaItems || []).length;
        }
      } catch (_) {}
    }

    // Formatage final des stats
    res.json({
      vuesRecherche: (results.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH || 0) + (results.BUSINESS_IMPRESSIONS_MOBILE_SEARCH || 0),
      vuesMaps: (results.BUSINESS_IMPRESSIONS_DESKTOP_MAPS || 0) + (results.BUSINESS_IMPRESSIONS_MOBILE_MAPS || 0),
      appels: results.CALL_CLICKS || 0,
      clicsWeb: results.WEBSITE_CLICKS || 0,
      itineraires: results.BUSINESS_DIRECTION_REQUESTS || 0,
      vuesPhotos: 0, // La Business Profile Performance API ne fournit pas cette métrique — valeur manuelle
      totalPhotos,
      reviewCount,
      avgRating,
      raw: results,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
