// api/auth/select-fiche.js
// Récupère les fiches GMB côté serveur avec retry si quota dépassé

export default async function handler(req, res) {
  const { access_token, refresh_token, expires_in, clientId, retry } = req.query;
  const base = "https://app.agence-betheone.fr";

  if (!access_token || !clientId) return res.redirect(base);

  // Appel API avec retry
  const locations = [];
  let error = null;
  let isQuota = false;

  const safeJson = async (response) => {
    const ct = response.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      throw new Error(`Réponse inattendue (${response.status}) — l'API Google n'est peut-être pas activée sur ce projet.`);
    }
    return response.json();
  };

  let debugInfo = [];
  const DEBUG = true;

  const tryFetch = async () => {
    try {
      // Étape 1 : userinfo pour identifier le compte (scope openid+email requis)
      const uiRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const ui = await uiRes.json();
      const sub = ui.id || ui.sub;
      debugInfo.push(`👤 ${ui.email || "?"} — sub: ${sub || "?"}`);

      // Étape 2 : API accounts — essai v1 puis v4 legacy
      let accountNames = [];
      let accData = null;

      // Tentative v1
      const accRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      accData = await accRes.json();

      if (accData.error) {
        isQuota = accData.error.status === "RESOURCE_EXHAUSTED" || (accData.error.message||"").includes("Quota");
        debugInfo.push(`⚠️ accounts v1: ${accData.error.message}`);

        // Tentative v4 legacy (quota séparé)
        const accV4Res = await fetch("https://mybusiness.googleapis.com/v4/accounts", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const accV4 = await accV4Res.json();
        if (accV4.error) {
          debugInfo.push(`⚠️ accounts v4: ${accV4.error.message}`);
        } else {
          accountNames = (accV4.accounts || []).slice(0, 10).map(a => a.name);
          debugInfo.push(`✅ v4: ${accountNames.length} compte(s): ${accountNames.join(", ")}`);
          isQuota = false;
        }
      } else {
        accountNames = (accData.accounts || []).slice(0, 10).map(a => a.name);
        debugInfo.push(`✅ ${accountNames.length} compte(s): ${accountNames.join(", ")}`);
      }

      // Dernier recours : essayer directement avec le sub comme account ID
      if (!accountNames.length && sub) {
        debugInfo.push(`🔁 Tentative directe avec sub: accounts/${sub}`);
        const directRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${sub}/locations?readMask=name,title,storefrontAddress,phoneNumbers`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const directData = await directRes.json();
        if (!directData.error) {
          const locs = directData.locations || [];
          debugInfo.push(`✅ Direct: ${locs.length} fiche(s)`);
          for (const l of locs) {
            locations.push({
              name: l.name,
              title: l.title || l.name.split("/").pop(),
              address: [l.storefrontAddress?.addressLines?.[0], l.storefrontAddress?.locality].filter(Boolean).join(", "),
              phone: l.phoneNumbers?.primaryPhone || "",
            });
          }
          isQuota = false;
        } else {
          debugInfo.push(`⚠️ Direct: ${directData.error.message}`);
        }
      }

      // Étape 3 : lister les fiches pour chaque compte
      for (const accName of accountNames) {
        debugInfo.push(`→ Recherche fiches dans ${accName}`);
        const lr = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${accName}/locations?readMask=name,title,storefrontAddress,phoneNumbers`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const ld = await lr.json();
        if (ld.error) {
          debugInfo.push(`  ⚠️ ${ld.error.message}`);
          continue;
        }
        const locs = ld.locations || [];
        debugInfo.push(`  ✅ ${locs.length} fiche(s)`);
        for (const l of locs) {
          locations.push({
            name: l.name,
            title: l.title || l.name.split("/").pop(),
            address: [l.storefrontAddress?.addressLines?.[0], l.storefrontAddress?.locality].filter(Boolean).join(", "),
            phone: l.phoneNumbers?.primaryPhone || "",
          });
        }
      }
      return true;
    } catch (e) {
      error = e.message;
      return false;
    }
  };

  // Attendre si retry=1 (2ème tentative après délai)
  if (retry === "1") {
    await new Promise(r => setTimeout(r, 5000));
  }

  const ok = await tryFetch();

  // Si une seule fiche → lier directement
  if (ok && locations.length === 1) {
    const p = new URLSearchParams({
      clientId, access_token, refresh_token: refresh_token || "",
      expires_in: expires_in || "3600", location_name: locations[0].name,
    });
    return res.redirect(`${base}/#gmb-auth-complete?${p}`);
  }

  const qp = new URLSearchParams({ clientId, access_token, refresh_token: refresh_token || "", expires_in: expires_in || "3600" });
  const retryUrl = `/api/auth/select-fiche?${qp}&retry=1`;

  const cards = locations.map(l => {
    const lp = new URLSearchParams({ ...Object.fromEntries(qp), location_name: l.name });
    return `<a class="card" href="${base}/#gmb-auth-complete?${lp}">
      <div class="ct">${esc(l.title)}</div>
      ${l.address ? `<div class="cs">📍 ${esc(l.address)}</div>` : ""}
      ${l.phone ? `<div class="cs">📞 ${esc(l.phone)}</div>` : ""}
      <div class="cid">${esc(l.name)}</div>
    </a>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sélectionner la fiche — Be The One</title>
${isQuota && !retry ? `<meta http-equiv="refresh" content="62;url=${retryUrl}">` : ""}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F3FF;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.box{background:white;border-radius:20px;padding:30px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(107,64,216,.15)}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.logo-i{width:38px;height:38px;background:linear-gradient(135deg,#6B40D8,#C03080);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:15px}
.logo-t{font-size:17px;font-weight:800;color:#1E1B30}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#059669;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:20px;padding:4px 12px;margin-bottom:18px}
.dot{width:7px;height:7px;border-radius:50%;background:#22C55E;flex-shrink:0}
h1{font-size:19px;font-weight:800;color:#1E1B30;margin-bottom:5px}
.sub{font-size:13px;color:#6B7280;margin-bottom:20px}
.card{display:block;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer;transition:all .15s;color:#1E1B30;text-decoration:none;background:white}
.card:hover{border-color:#6B40D8;background:#F5F3FF}
.ct{font-size:14px;font-weight:700;margin-bottom:3px}
.cs{font-size:12px;color:#6B7280;margin-top:2px}
.cid{font-size:10px;color:#9CA3AF;margin-top:5px;font-family:monospace}
.quota{background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:18px;margin-bottom:16px;text-align:center}
.quota-icon{font-size:28px;margin-bottom:8px}
.quota-t{font-size:14px;font-weight:700;color:#92400E;margin-bottom:4px}
.quota-s{font-size:12px;color:#B45309;margin-bottom:12px}
.progress{height:6px;background:#FEF3C7;border-radius:99px;overflow:hidden;margin-bottom:8px}
.bar{height:100%;background:#F59E0B;border-radius:99px;animation:prog 62s linear forwards}
@keyframes prog{from{width:0}to{width:100%}}
.timer{font-size:11px;color:#9CA3AF}
.btn{display:inline-block;margin-top:10px;padding:8px 18px;background:#6B40D8;color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;font-family:inherit}
.err{background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px;color:#DC2626;font-size:13px;margin-bottom:14px}
.back{display:block;text-align:center;margin-top:14px;font-size:12px;color:#9CA3AF;text-decoration:none}
.back:hover{color:#6B40D8}
.manual{background:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:18px;margin-top:16px}
.manual-t{font-size:13px;font-weight:700;color:#0369A1;margin-bottom:6px}
.manual-s{font-size:12px;color:#0284C7;margin-bottom:12px}
.manual input{width:100%;border:1.5px solid #BAE6FD;border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}
.manual input:focus{border-color:#0369A1}
.manual .btn{margin-top:10px;display:block;width:100%;text-align:center;background:#0369A1}
</style></head><body>
<div class="box">
  <div class="logo"><div class="logo-i">BTO</div><div class="logo-t">Be The One</div></div>
  <div class="badge"><div class="dot"></div> Google connecté</div>
  <h1>Sélectionner votre fiche</h1>
  <p class="sub">Choisissez la fiche Google My Business à lier à ce client.</p>

  ${isQuota && !retry ? `
    <div class="quota">
      <div class="quota-icon">⏳</div>
      <div class="quota-t">Limite Google atteinte</div>
      <div class="quota-s">Rechargement automatique dans 60 secondes…</div>
      <div class="progress"><div class="bar"></div></div>
      <div class="timer" id="t">60s</div>
      <br><a class="btn" href="${retryUrl}">🔄 Réessayer maintenant</a>
    </div>
    <script>
    let s=62;const el=document.getElementById('t');
    const iv=setInterval(()=>{s--;el.textContent=s+'s';if(s<=0)clearInterval(iv);},1000);
    </script>
  ` : ""}

  ${error && !isQuota ? `<div class="err">⚠️ ${esc(error)}<br><br><a class="btn" href="${retryUrl}">🔄 Réessayer</a></div>` : ""}

  ${cards}

  ${isQuota ? `
  <div class="manual">
    <div class="manual-t">📝 Saisie manuelle de la fiche</div>
    <div class="manual-s">Quota Google atteint. Colle le nom de ta fiche (format : <code>accounts/XXXX/locations/YYYY</code>).<br>Tu le trouves dans l'URL de <a href="https://business.google.com" target="_blank">business.google.com</a>.</div>
    <div class="manual" style="background:none;border:none;padding:0">
      <input type="text" id="loc-input" placeholder="accounts/123456789/locations/987654321" />
      <a class="btn" id="loc-btn" href="#">🔗 Lier cette fiche</a>
    </div>
  </div>
  <script>
  document.getElementById('loc-btn').addEventListener('click', function(e){
    e.preventDefault();
    var v = document.getElementById('loc-input').value.trim();
    if(!v || !v.startsWith('accounts/')) { alert('Format invalide. Ex: accounts/123/locations/456'); return; }
    var p = new URLSearchParams(${JSON.stringify(Object.fromEntries(qp))});
    p.set('location_name', v);
    window.location.href = '${base}/#gmb-auth-complete?' + p.toString();
  });
  </script>
  ` : ""}

  ${DEBUG ? `<details style="margin-top:16px;font-size:11px;color:#6B7280;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px">
    <summary style="cursor:pointer;font-weight:600;color:#374151">🔍 Debug (${debugInfo.length} étapes)</summary>
    <pre style="margin-top:8px;white-space:pre-wrap;word-break:break-all;font-family:monospace;font-size:10px">${esc(debugInfo.join("\n"))}</pre>
  </details>` : ""}

  <a href="${base}/" class="back">← Retour sans lier</a>
</div>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function esc(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
