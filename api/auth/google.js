// api/auth/google.js
// Démarre le flux OAuth Google — redirige vers la page de consentement Google
export default function handler(req, res) {
  const { clientId } = req.query;
  const base = "https://gmb-crm-seven.vercel.app";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${base}/api/auth/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/business.manage",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: clientId || "",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
