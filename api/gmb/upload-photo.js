// api/gmb/upload-photo.js
// Reçoit un fichier image en multipart/form-data et le stocke dans Vercel Blob
// Retourne une URL publique utilisable par l'API GMB

import { put } from "@vercel/blob";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    // Récupérer le body raw (multipart géré manuellement via stream)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Extraire le Content-Type pour le boundary
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return res.status(400).json({ error: "Content-Type multipart requis" });

    const boundary = "--" + boundaryMatch[1];
    const parts = buffer.toString("binary").split(boundary);

    let fileBuffer = null;
    let fileName = "photo.jpg";
    let fileMime = "image/jpeg";

    for (const part of parts) {
      if (part.includes('filename=')) {
        const nameMatch = part.match(/filename="([^"]+)"/);
        const mimeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
        if (nameMatch) fileName = nameMatch[1];
        if (mimeMatch) fileMime = mimeMatch[1].trim();

        // Données binaires après \r\n\r\n
        const separatorIdx = part.indexOf("\r\n\r\n");
        if (separatorIdx !== -1) {
          const rawData = part.slice(separatorIdx + 4, part.length - 2);
          fileBuffer = Buffer.from(rawData, "binary");
        }
        break;
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const safeName = `gmb-posts/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    // Les photos GMB doivent être accessibles publiquement — Google les récupère via l'URL
    const blob = await put(safeName, fileBuffer, {
      access: "public",
      contentType: fileMime,
    });

    res.json({ url: blob.url, success: true });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ error: e.message });
  }
}
