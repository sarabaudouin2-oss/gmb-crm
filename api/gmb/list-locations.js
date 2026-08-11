// api/gmb/list-locations.js
// Retourne tous les comptes + toutes les fiches GMB accessibles avec ce token
export default async function handler(req, res) {
  const access_token =
    req.headers.authorization?.replace("Bearer ", "") || req.query.access_token;

  if (!access_token) return res.status(401).json({ error: "Token manquant" });

  try {
    // 1. Récupère les comptes
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const accountsData = await accountsRes.json();

    if (accountsData.error) {
      return res.status(400).json({ error: accountsData.error.message || "Erreur Google API", raw: accountsData });
    }

    const accounts = accountsData.accounts || [];
    const debug = { accountCount: accounts.length, accounts: accounts.map(a => a.name), locationErrors: [] };

    // 2. Pour chaque compte, récupère les fiches
    const allLocations = [];
    await Promise.all(
      accounts.map(async (account) => {
        try {
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress,websiteUri,phoneNumbers`,
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          const locData = await locRes.json();
          if (locData.error) {
            debug.locationErrors.push({ account: account.name, error: locData.error.message });
            return;
          }
          const locations = locData.locations || [];
          locations.forEach((loc) => {
            allLocations.push({
              name: loc.name,
              title: loc.title || "Sans nom",
              address: loc.storefrontAddress
                ? [
                    loc.storefrontAddress.addressLines?.[0],
                    loc.storefrontAddress.locality,
                    loc.storefrontAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "",
              phone: loc.phoneNumbers?.primaryPhone || "",
              website: loc.websiteUri || "",
              accountName: account.name,
              accountTitle: account.accountName || account.name,
            });
          });
        } catch (e) {
          debug.locationErrors.push({ account: account.name, error: e.message });
        }
      })
    );

    res.json({ locations: allLocations, debug });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
