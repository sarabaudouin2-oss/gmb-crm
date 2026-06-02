// api/auth/callback.js
// Reçoit le code OAuth de Google, échange contre des tokens, redirige vers l'app
export default async function handler(req, res) {
  const { code, state, error } = req.query;
  const base = "https://gmb-crm-seven.vercel.app";

  if (error) {
    return res.redirect(`${base}/#gmb-auth-error?msg=${encodeURIComponent(error)}`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${base}/api/auth/callback`,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.redirect(
        `${base}/#gmb-auth-error?msg=${encodeURIComponent(tokens.error_description || tokens.error)}`
      );
    }

    // Redirige vers l'app avec les tokens dans le hash (jamais dans l'URL visible)
    const params = new URLSearchParams({
      clientId: state || "",
      access_token: tokens.access_token || "",
      refresh_token: tokens.refresh_token || "",
      expires_in: tokens.expires_in || 3600,
    });

    res.redirect(`${base}/#gmb-auth?${params.toString()}`);
  } catch (e) {
    res.redirect(
      `${base}/#gmb-auth-error?msg=${encodeURIComponent(e.message)}`
    );
  }
}
