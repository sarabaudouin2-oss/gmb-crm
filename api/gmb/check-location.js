// api/gmb/check-location.js
// Récupère les infos complètes de la fiche pour détecter les modifications
export default async function handler(req, res) {
  const access_token = req.headers.authorization?.replace("Bearer ", "") || req.query.access_token;
  const { location_name } = req.query;

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name) return res.status(400).json({ error: "location_name requis" });

  const readMask = [
    "name", "title", "phoneNumbers", "categories",
    "storefrontAddress", "websiteUri", "regularHours",
    "specialHours", "serviceArea", "labels",
    "adWordsLocationExtensions", "latlng", "openInfo",
    "metadata", "profile", "relationshipData"
  ].join(",");

  try {
    const r = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${location_name}?readMask=${readMask}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    // Extrait les infos clés pour comparaison
    const snapshot = {
      title: data.title || "",
      phone: data.phoneNumbers?.primaryPhone || "",
      address: data.storefrontAddress
        ? [data.storefrontAddress.addressLines?.[0], data.storefrontAddress.locality, data.storefrontAddress.postalCode].filter(Boolean).join(", ")
        : "",
      website: data.websiteUri || "",
      category: data.categories?.primaryCategory?.displayName || "",
      hours: data.regularHours?.periods?.map(p => `${p.openDay} ${p.openTime?.hours||0}h-${p.closeTime?.hours||0}h`).join(", ") || "",
      isOpen: data.openInfo?.status || "",
      checkedAt: new Date().toISOString(),
    };

    res.json({ snapshot, raw: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
