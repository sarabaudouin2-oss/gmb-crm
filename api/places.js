export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { query, pagetoken } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "GOOGLE_API_KEY non configurée sur le serveur." });
  if (!query && !pagetoken) return res.status(400).json({ error: "Paramètre query manquant." });

  try {
    // Text Search
    const params = new URLSearchParams({
      key: apiKey,
      language: "fr",
      region: "fr",
      ...(pagetoken ? { pagetoken } : { query }),
    });
    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
    const searchData = await searchRes.json();

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      return res.status(200).json({ error: searchData.error_message || searchData.status, results: [] });
    }

    // Pour chaque résultat, enrichir avec téléphone via Place Details
    const results = await Promise.all(
      (searchData.results || []).slice(0, 20).map(async (place) => {
        let phone = "";
        let website = "";
        try {
          const detailParams = new URLSearchParams({
            place_id: place.place_id,
            fields: "formatted_phone_number,website",
            key: apiKey,
            language: "fr",
          });
          const detailRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailParams}`);
          const detailData = await detailRes.json();
          phone = detailData.result?.formatted_phone_number || "";
          website = detailData.result?.website || "";
        } catch {}

        return {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          city: (place.formatted_address || "").split(",").slice(-2, -1)[0]?.trim() || "",
          rating: place.rating || null,
          reviewCount: place.user_ratings_total || 0,
          phone,
          website,
          types: place.types || [],
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        };
      })
    );

    return res.status(200).json({
      results,
      next_page_token: searchData.next_page_token || null,
      total: searchData.results?.length || 0,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, results: [] });
  }
}
