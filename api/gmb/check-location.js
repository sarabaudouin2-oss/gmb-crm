// api/gmb/check-location.js
// Récupère les infos complètes de la fiche GBP + photos + posts + services + attributs
export default async function handler(req, res) {
  const access_token = req.headers.authorization?.replace("Bearer ", "") || req.query.access_token;
  const { location_name } = req.query;

  if (!access_token) return res.status(401).json({ error: "Token manquant" });
  if (!location_name) return res.status(400).json({ error: "location_name requis" });

  const readMask = [
    "name", "title", "phoneNumbers", "categories",
    "storefrontAddress", "websiteUri", "regularHours",
    "specialHours", "serviceArea", "labels",
    "latlng", "openInfo", "metadata", "profile",
    "moreHours", "serviceItems", "attributes",
    "relationshipData", "adWordsLocationExtensions",
  ].join(",");

  try {
    // 1. Infos principales de la fiche
    const [ficheRes, photosRes, postsRes] = await Promise.all([
      fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${location_name}?readMask=${readMask}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      ),
      // 2. Photos (v4 API)
      fetch(
        `https://mybusiness.googleapis.com/v4/${location_name}/media?pageSize=100`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      ).catch(() => null),
      // 3. Posts récents
      fetch(
        `https://mybusiness.googleapis.com/v4/${location_name}/localPosts?pageSize=10`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      ).catch(() => null),
    ]);

    const data = await ficheRes.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    // Traitement photos
    let photos = [], photoCount = 0, hasLogo = false, hasCover = false;
    if (photosRes?.ok) {
      const pd = await photosRes.json();
      photos = pd.mediaItems || [];
      photoCount = photos.length;
      hasLogo = photos.some(p => p.mediaFormat === "PHOTO" && p.locationAssociation?.category === "LOGO");
      hasCover = photos.some(p => p.mediaFormat === "PHOTO" && p.locationAssociation?.category === "COVER");
    }

    // Traitement posts
    let posts = [], postsCount = 0, lastPostDate = null;
    if (postsRes?.ok) {
      const pd = await postsRes.json();
      posts = pd.localPosts || [];
      postsCount = posts.length;
      if (posts.length > 0) lastPostDate = posts[0].updateTime || posts[0].createTime || null;
    }

    // Traitement services
    const serviceItems = (data.serviceItems || []).map(s => ({
      name: s.structuredServiceItem?.serviceType?.displayName || s.freeFormServiceItem?.label?.displayName || "",
      description: s.structuredServiceItem?.description || s.freeFormServiceItem?.label?.description || "",
    })).filter(s => s.name);

    // Traitement catégories
    const primaryCategory = data.categories?.primaryCategory?.displayName || "";
    const secondaryCategories = (data.categories?.additionalCategories || []).map(c => c.displayName);

    // Traitement attributs
    const attributes = (data.attributes || []).reduce((acc, attr) => {
      acc[attr.attributeId] = attr.values || attr.repeatedEnumValue?.setValues || true;
      return acc;
    }, {});

    // Traitement horaires
    const regularHours = (data.regularHours?.periods || []).map(p =>
      `${p.openDay} ${p.openTime?.hours||0}h${p.openTime?.minutes||0 ? p.openTime.minutes : ""}-${p.closeTime?.hours||0}h${p.closeTime?.minutes||0 ? p.closeTime.minutes : ""}`
    ).join(", ");
    const hasSpecialHours = !!(data.specialHours?.specialHourPeriods?.length);

    // Adresse
    const addr = data.storefrontAddress;
    const address = addr
      ? [addr.addressLines?.[0], addr.locality, addr.postalCode, addr.administrativeArea].filter(Boolean).join(", ")
      : "";
    const city = addr?.locality || "";

    // Description
    const description = data.profile?.description || "";

    // Réseaux sociaux
    const socialLinks = (data.relationshipData?.parentChain ? { parentChain: data.relationshipData.parentChain } : {});

    // Zone de service
    const serviceArea = data.serviceArea?.places?.placeInfos?.map(p => p.name) || [];

    // Snapshot pour détection de modifications
    const snapshot = {
      title: data.title || "",
      phone: data.phoneNumbers?.primaryPhone || "",
      address,
      website: data.websiteUri || "",
      category: primaryCategory,
      hours: regularHours,
      description: description.slice(0, 100),
      isOpen: data.openInfo?.status || "",
      checkedAt: new Date().toISOString(),
    };

    // Données complètes pour e.data.extracted
    const extracted = {
      name: data.title || "",
      phone: data.phoneNumbers?.primaryPhone || "",
      address,
      city,
      website: data.websiteUri || "",
      category: primaryCategory,
      secondaryCategories: { present: secondaryCategories, suggested: [] },
      description,
      hours: regularHours,
      hoursRegular: regularHours,
      hoursSpecial: hasSpecialHours,
      services: { present: serviceItems, suggested: [] },
      attributes,
      photoCount,
      photos: photoCount,
      hasLogo,
      hasCover,
      postsCount,
      lastPostDate,
      socialLinks,
      serviceArea,
      sector: primaryCategory,
      // rating et reviewCount récupérés séparément via insights
    };

    res.json({ snapshot, extracted, raw: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
