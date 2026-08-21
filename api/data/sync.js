// api/data/sync.js
// Route unifiée : GET = charger données / partager rapport, POST = sauvegarder / stocker rapport partagé
import { put, list, del, head } from "@vercel/blob";

const DATA_PATH = "gmb-crm/data.json";
const ARTICLES_PATH = "gmb-crm/articles.json";
const ARTICLES_PWD = process.env.ARTICLES_PASSWORD || "bto2026";
// VERCEL_URL = URL de déploiement temporaire, pas le domaine custom.
// On utilise le domaine de production fixe.
const BASE_URL = "https://app.agence-betheone.fr";

async function storeSharedHtml(html, token) {
  const path = `gmb-crm/shared/${token}.html`;
  await put(path, html, {
    access: "private",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return `${BASE_URL}/api/data/sync?action=view-shared&t=${token}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── ARTICLES BLOG (lecture publique / écriture protégée) ──
  if (req.query.action === "list-articles") {
    try {
      const existing = await list({ prefix: ARTICLES_PATH, mode: "folded" });
      let articles = [];
      if (existing.blobs && existing.blobs.length > 0) {
        const blobMeta = existing.blobs[0];
        const r = await fetch(blobMeta.downloadUrl || blobMeta.url, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
        });
        if (r.ok) articles = await r.json();
      }
      if (!Array.isArray(articles)) articles = [];
      const isAdmin = req.query.admin === "1" && req.headers["x-admin-password"] === ARTICLES_PWD;
      if (!isAdmin) {
        const now = new Date();
        articles = articles.filter(a => {
          if (a.status === "draft") return false;
          if (a.status === "scheduled" && a.scheduledAt) return new Date(a.scheduledAt) <= now;
          return true;
        });
      }
      return res.json(articles);
    } catch (e) { return res.status(500).json({ error: e.message, stack: e.stack?.slice(0,200) }); }
  }

  if (req.method === "POST" && req.query.action === "save-articles") {
    const auth = req.headers["x-admin-password"];
    if (auth !== ARTICLES_PWD) return res.status(401).json({ error: "Non autorisé" });
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const articles = JSON.parse(Buffer.concat(chunks).toString());
      try {
        const existing = await list({ prefix: ARTICLES_PATH });
        if (existing.blobs.length > 0) await del(existing.blobs.map(b => b.url));
      } catch (_) {}
      await put(ARTICLES_PATH, JSON.stringify(articles), { access: "private", contentType: "application/json", addRandomSuffix: false });
      return res.json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // ── SCAN POSITIONNEMENT via SerpAPI (vrais résultats Google Maps) ──
  if (req.method === "GET" && req.query.action === "serp-scan") {
    const { query, lat, lng, zoom = "14" } = req.query;
    const serpKey = process.env.SERPAPI_KEY;
    if (!serpKey) return res.status(500).json({ error: "SERPAPI_KEY non configurée." });
    if (!query || !lat || !lng) return res.status(400).json({ error: "Paramètres manquants." });
    try {
      const ll = `@${lat},${lng},${zoom}z`;
      const url = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&ll=${encodeURIComponent(ll)}&hl=fr&gl=fr&api_key=${serpKey}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.error) return res.status(200).json({ error: data.error, places: [] });
      const places = (data.local_results || []).slice(0, 20).map((p, i) => ({
        rank: i + 1,
        name: p.title || "?",
        address: p.address || "",
        rating: p.rating || null,
        reviews: p.reviews || 0,
        placeId: p.place_id || "",
      }));
      return res.status(200).json({ places });
    } catch (e) {
      return res.status(500).json({ error: e.message, places: [] });
    }
  }

  // ── SCAN POSITIONNEMENT (ancienne API Places — géolocalisation précise) ──
  if (req.method === "GET" && req.query.action === "scan") {
    const { query, lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GOOGLE_API_KEY non configurée." });
    if (!query || !lat || !lng) return res.status(400).json({ error: "Paramètres manquants." });
    try {
      const params = new URLSearchParams({
        key: apiKey,
        query,
        location: `${lat},${lng}`,
        radius: "500",
        language: "fr",
        region: "fr",
      });
      const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
      const data = await r.json();
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        return res.status(200).json({ error: data.error_message || data.status, places: [] });
      }
      const places = (data.results || []).slice(0, 20).map((p, i) => ({
        rank: i + 1,
        name: p.name,
        address: p.formatted_address || "",
        rating: p.rating || null,
        reviews: p.user_ratings_total || 0,
        placeId: p.place_id,
      }));
      return res.status(200).json({ places });
    } catch (e) {
      return res.status(500).json({ error: e.message, places: [] });
    }
  }

  if (req.method === "GET" && req.query.action === "places") {
    const { query } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GOOGLE_API_KEY non configurée.", results: [] });
    if (!query) return res.status(400).json({ error: "Paramètre query manquant.", results: [] });
    try {
      const params = new URLSearchParams({ key: apiKey, language: "fr", region: "fr", query });
      const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
      const searchData = await searchRes.json();
      if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
        return res.status(200).json({ error: searchData.error_message || searchData.status, results: [] });
      }
      const results = await Promise.all((searchData.results || []).slice(0, 20).map(async (place) => {
        let phone = "", website = "";
        try {
          const dp = new URLSearchParams({ place_id: place.place_id, fields: "formatted_phone_number,website", key: apiKey, language: "fr" });
          const dr = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${dp}`);
          const dd = await dr.json();
          phone = dd.result?.formatted_phone_number || "";
          website = dd.result?.website || "";
        } catch {}
        return {
          place_id: place.place_id, name: place.name, address: place.formatted_address,
          city: (place.formatted_address || "").split(",").slice(-2, -1)[0]?.trim() || "",
          rating: place.rating || null, reviewCount: place.user_ratings_total || 0,
          phone, website, types: place.types || [],
        };
      }));
      return res.status(200).json({ results, next_page_token: searchData.next_page_token || null });
    } catch (e) { return res.status(500).json({ error: e.message, results: [] }); }
  }

  // ── SERVIR UN RAPPORT PARTAGÉ (public, par token) ──
  if (req.method === "GET" && req.query.action === "view-shared") {
    const { t: token } = req.query;
    if (!token || typeof token !== "string" || !/^[a-z0-9]+$/i.test(token)) {
      return res.status(400).send("<html><body>Lien invalide.</body></html>");
    }
    try {
      const blobPath = `gmb-crm/shared/${token}.html`;
      let blobInfo;
      try {
        blobInfo = await head(blobPath);
      } catch {
        return res.status(404).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lien invalide</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#F4F5FA;color:#1E1B30;text-align:center">
  <div style="font-size:48px;margin-bottom:16px">❌</div>
  <div style="font-size:20px;font-weight:800;margin-bottom:8px">Lien invalide ou expiré</div>
  <div style="font-size:14px;color:#6B7280">Ce rapport n'est plus accessible. Contactez votre interlocuteur Be The One.</div>
</body></html>`);
      }
      const response = await fetch(blobInfo.downloadUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (!response.ok) return res.status(502).send(`Erreur fetch blob (${response.status})`);
      const html = await response.text();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.setHeader("Cache-Control", "private, max-age=3600");
      return res.send(html);
    } catch (e) {
      return res.status(500).send("Erreur serveur : " + e.message);
    }
  }

  // ── PARTAGE RAPPORT MENSUEL ──
  if (req.method === "POST" && req.query.action === "share-monthly-report") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      const { html } = body || {};
      if (!html || typeof html !== "string") {
        return res.status(400).json({ error: "HTML manquant" });
      }
      const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      const url = await storeSharedHtml(html, token);
      return res.json({ success: true, url, token });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── PARTAGE RAPPORT D'AUDIT ──
  if (req.method === "POST" && req.query.action === "share-audit-report") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      const { html } = body || {};
      if (!html || typeof html !== "string") {
        return res.status(400).json({ error: "HTML manquant" });
      }
      const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      const url = await storeSharedHtml(html, token);
      return res.json({ success: true, url, token });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── TEST ANTHROPIC KEY ──
  if (req.query.action === "ai-test" && req.method === "GET") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.json({ ok: false, error: "ANTHROPIC_API_KEY manquante" });
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": apiKey },
        body: JSON.stringify({ model: req.query.m || "claude-sonnet-4-6", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
      });
      const txt = await r.text();
      return res.json({ ok: r.ok, status: r.status, body: txt.slice(0, 300) });
    } catch (e) { return res.json({ ok: false, error: e.message }); }
  }

  // ── PROXY ANTHROPIC AI ──
  if (req.query.action === "ai" && req.method === "POST") {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Clé API Anthropic non configurée" });
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const bodyStr = Buffer.concat(chunks).toString();
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": apiKey,
        },
        body: bodyStr,
      });
      const rawText = await upstream.text();
      console.log("Anthropic status:", upstream.status, "body:", rawText.slice(0, 300));
      let data;
      try { data = JSON.parse(rawText); } catch { data = { error: { message: rawText } }; }
      // Garder la connexion active pendant la lecture
      res.setHeader("X-Accel-Buffering", "no");
      res.status(upstream.status).json(data);
    } catch (e) {
      console.error("AI proxy error:", e.message);
      res.status(500).json({ error: { message: e.message } });
    }
    return;
  }

  const auth = req.headers["x-bto-token"] || req.query.token;
  if (!auth || auth !== process.env.BTO_DATA_TOKEN) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  // ── CHARGER ──
  if (req.method === "GET") {
    try {
      const existing = await list({ prefix: DATA_PATH, mode: "folded" });
      if (!existing.blobs || existing.blobs.length === 0) {
        return res.json({ clients: [], exists: false });
      }
      const blobMeta = existing.blobs[0];
      const response = await fetch(blobMeta.downloadUrl || blobMeta.url);
      if (!response.ok) return res.json({ clients: [], exists: false });
      const text = await response.text();
      const data = JSON.parse(text);
      res.json({ clients: Array.isArray(data) ? data : (data.clients || []), exists: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  // ── SAUVEGARDER ──
  if (req.method === "POST") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString("utf-8");
      const data = JSON.parse(body);

      try {
        const existing = await list({ prefix: DATA_PATH });
        const urls = existing.blobs.map(b => b.url);
        if (urls.length > 0) await del(urls);
      } catch (_) {}

      await put(DATA_PATH, JSON.stringify(data), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
      });

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  res.status(405).json({ error: "Méthode non autorisée" });
}
