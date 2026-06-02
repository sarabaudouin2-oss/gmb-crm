import React, { useState, useEffect, useRef } from "react";


// ─── CRITÈRES ─────────────────────────────────────────────────────────────────
const CATS = [
  // ── STATIQUES (configurables une fois, acquis définitivement) ─────────────
  { id:"identity",    label:"Identité",               icon:"🏢", type:"static", criteria:[
    {id:"business_name",      label:"Nom exact sans mots-clés",           points:3, action:"Mettre le nom exact sans mots-clés supplémentaires", static:true},
    {id:"category_primary",   label:"Catégorie principale précise",       points:5, action:"Choisir la catégorie principale la plus précise", static:true},
    {id:"category_secondary", label:"Catégories secondaires (max 9)",     points:4, action:"Ajouter jusqu'à 9 catégories secondaires pertinentes", static:true},
    {id:"service_area",       label:"Zone de service définie",            points:3, action:"Configurer la zone de chalandise (jusqu'à 20 zones)", static:true},
    {id:"social_links",       label:"Réseaux sociaux liés (FB, Insta...)",points:4, action:"Lier Facebook, Instagram, YouTube depuis la fiche GMB", static:true},
  ]},
  { id:"contact",     label:"Coordonnées & Horaires", icon:"📞", type:"static", criteria:[
    {id:"phone",         label:"Téléphone renseigné",            points:4, action:"Ajouter un numéro local valide", static:true},
    {id:"website",       label:"Site web renseigné",             points:4, action:"Ajouter l URL du site web", static:true},
    {id:"address",       label:"Adresse complète et exacte",     points:2, action:"Vérifier et compléter l adresse postale", static:true},
    {id:"hours_regular", label:"Horaires complets 7j/7",         points:4, action:"Renseigner les horaires de chaque jour", static:true},
    {id:"hours_special", label:"Horaires exceptionnels/fériés",  points:3, action:"Ajouter les fermetures exceptionnelles et jours fériés", static:true},
  ]},
  { id:"description", label:"Description & Présence", icon:"✍️", type:"static", criteria:[
    {id:"desc_length",       label:"Description 700+ caractères",     points:4, action:"Rédiger une description proche des 750 caractères", static:true},
    {id:"desc_keywords",     label:"Mots-clés locaux dans la description", points:4, action:"Intégrer les mots-clés locaux et métier dans la description", static:true},
    {id:"attributes",        label:"Attributs complétés",             points:3, action:"Compléter tous les attributs disponibles (Wi-Fi, accessibilité, etc.)", static:true},
    {id:"services_listed",    label:"Services renseignés dans la fiche",  points:3, action:"Lister tous les services proposés dans la section Services de GBP avec nom et description", static:true},
    {id:"products_listed",    label:"Produits renseignés dans la fiche",   points:2, action:"Lister les produits phares avec nom, prix et description dans GBP", static:true},
    {id:"booking_link",      label:"Lien réservation/commande",       points:2, action:"Ajouter un bouton Réserver ou Commander en ligne", static:true},
    {id:"photo_cover",       label:"Photo de couverture optimisée",   points:2, action:"Mettre une image pro et représentative en couverture", static:true},
    {id:"photo_logo",        label:"Logo haute qualité",              points:2, action:"Uploader le logo en haute résolution", static:true},
    {id:"chat_link",         label:"Lien WhatsApp ou message",        points:3, action:"Ajouter un lien WhatsApp ou SMS pour réduire la friction contact", static:true},
  ]},
  // ── DYNAMIQUES (à maintenir en continu) ────────────────────────────────────
  { id:"photos",      label:"Photos",                 icon:"📸", type:"dynamic", criteria:[
    {id:"photo_count",    label:"20+ photos publiées",           points:4, action:"Publier 20+ photos (90% plus de visites avec des photos)"},
    {id:"photo_interior", label:"Photos intérieur/réalisations", points:3, action:"Ajouter des photos des locaux ou réalisations"},
    {id:"photo_team",     label:"Photos équipe/produits",        points:2, action:"Ajouter photos équipe ou produits"},
    {id:"photo_recent",   label:"Photos récentes (< 3 mois)",   points:2, action:"Publier de nouvelles photos ce mois-ci"},
  ]},
  { id:"reviews",     label:"Avis & Réputation",      icon:"⭐", type:"dynamic", criteria:[
    {id:"rating",           label:"Note globale ≥ 4.0",         points:5, action:"Mettre en place une stratégie de collecte d avis 5 étoiles"},
    {id:"review_count",     label:"50+ avis",                   points:4, action:"Atteindre 50 avis minimum (91% des consommateurs lisent les avis)"},
    {id:"response_rate",    label:"Taux de réponse ≥ 80%",      points:4, action:"Répondre à tous les avis — 65% choisissent le commerce qui répond"},
    {id:"response_quality", label:"Réponses personnalisées",    points:3, action:"Personnaliser chaque réponse avec le prénom et le contexte"},
    {id:"recent_reviews",   label:"Avis récents (< 1 mois)",   points:3, action:"Créer un QR code avis et le placer en caisse, sur factures, devis"},
    {id:"qr_reviews",       label:"QR code avis configuré",    points:1, action:"Créer et utiliser le QR code Google pour collecter des avis"},
  ]},
  { id:"posts",       label:"Publications GMB",        icon:"📢", type:"dynamic", criteria:[
    {id:"posts_frequency", label:"1+ publication/semaine",       points:4, action:"Publier au minimum 1 post par semaine (5x plus de vues)"},
    {id:"posts_cta",       label:"CTA dans les publications",    points:2, action:"Ajouter un bouton d appel à l action dans chaque post"},
    {id:"posts_offers",    label:"Offres/Événements publiés",    points:2, action:"Créer une offre ou événement (62% motivés par les offres limitées)"},
    {id:"posts_variety",   label:"3 types de posts différents",  points:0, action:"Varier : Updates + Offres + Événements"},
  ]},
];

const ALL   = CATS.flatMap(c => c.criteria);
const TOTAL = ALL.reduce((s,c) => s+c.points, 0);

const LEVELS = [
  {min:90, label:"Excellent", color:"#059669", bg:"#ecfdf5", border:"#a7f3d0", desc:"Fiche parfaitement optimisée"},
  {min:75, label:"Bon",       color:"#059669", bg:"#ffffff", border:"#e8e0ff", desc:"Quelques améliorations mineures"},
  {min:55, label:"Moyen",     color:"#d97706", bg:"#fffbeb", border:"#fde68a", desc:"Optimisations importantes requises"},
  {min:35, label:"Faible",    color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", desc:"Nombreux points à corriger"},
  {min:0,  label:"Critique",  color:"#dc2626", bg:"#fef2f2", border:"#fecaca", desc:"Fiche à reconstruire entièrement"},
];
const getLvl    = s => LEVELS.find(l => s>=l.min)||LEVELS[4];
const initScores= () => Object.fromEntries(ALL.map(c=>[c.id,null]));
const calcScore = scores => Math.round((ALL.reduce((s,c)=>scores[c.id]===true?s+c.points:s, 0)/TOTAL)*100);

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
const LIBRARY = [
  { cat:"Réalisation", color:"var(--indigo2)", bg:"#ffffff", b:"#FBCFE8", templates:[
    { title:"Chantier terminé", content:"Nouveau chantier terminé !\n\n[Description du projet en 2-3 phrases. Précisez le type de travaux, les matériaux utilisés, la durée.]\n\nMerci à [Prénom] pour sa confiance.\n\nVous avez un projet similaire ? Contactez-nous au [Téléphone] ou via notre site [Site web].\n\n#[VotreVille] #[VotreMétier] #Réalisation #[Secteur]"},
    { title:"Avant / Après", content:"Transformation réussie !\n\nAvant : [Description de l état initial]\nAprès : [Description du résultat obtenu]\n\nCe type de projet prend en moyenne [durée]. Résultat garanti.\n\nContactez-nous pour un devis gratuit : [Téléphone]\n\n#AvantAprès #[VotreMétier] #[VotreVille] #Transformation"},
  ]},
  { cat:"Conseil", color:"#0891b2", bg:"#ecfeff", b:"#a5f3fc", templates:[
    { title:"Conseil pratique", content:"Le conseil de la semaine\n\n[Titre du conseil accrocheur]\n\n[Explication en 3-4 points clés, sans jargon technique.]\n- [Point 1]\n- [Point 2]\n- [Point 3]\n\nDes questions ? Nous sommes disponibles : [Téléphone]\n\n#Conseil #[VotreMétier] #Expertise"},
    { title:"Erreur à éviter", content:"L erreur que font 80% des clients\n\n[Description de l erreur courante dans votre secteur]\n\nPourquoi c est problématique : [Explication courte]\n\nLa bonne solution : [Votre recommandation professionnelle]\n\nContactez-nous : [Téléphone]\n\n#[VotreMétier] #Conseil #[VotreVille]"},
  ]},
  { cat:"Offre", color:"#059669", bg:"#ecfdf5", b:"#a7f3d0", templates:[
    { title:"Offre limitée", content:"Offre spéciale — jusqu au [Date]\n\n[Nom de l offre] : [Description claire et concise]\n\nAvantages inclus :\n- [Avantage 1]\n- [Avantage 2]\n- [Avantage 3]\n\nPlaces limitées — Appelez vite : [Téléphone]\n\n#Offre #[VotreVille] #[VotreMétier]"},
    { title:"Pack découverte", content:"Nouveau : Pack Découverte\n\n[Description du pack en 2 phrases]\n\nInclus :\n- [Service ou produit 1]\n- [Service ou produit 2]\n- [Service ou produit 3]\n\nPrix : [Prix] — Disponible jusqu au [Date]\n\nRéservez maintenant : [Téléphone]\n\n#Pack #[VotreMétier] #[VotreVille]"},
  ]},
  { cat:"Témoignage", color:"#d97706", bg:"#fffbeb", b:"#fde68a", templates:[
    { title:"Avis client", content:"Ce que nos clients disent de nous\n\n\"[Copier le vrai avis client ici]\"\n— [Prénom], [Ville]\n\nMerci [Prénom] pour ce retour.\n\nVous aussi, partagez votre expérience sur Google : [Lien avis]\n\n#Avis #[VotreMétier] #Satisfaction #[VotreVille]"},
    { title:"Référence client", content:"[Prénom] nous a confié son projet de [type de projet].\n\n[Courte description du projet et du résultat obtenu]\n\nRetour de notre client : \"[Citation courte]\"\n\nMerci pour votre confiance.\n\nProjet similaire ? Parlons-en : [Téléphone]\n\n#[VotreMétier] #[VotreVille] #Client #Confiance"},
  ]},
  { cat:"Actualité", color:"var(--violet)", bg:"#ffffff", b:"#FBCFE8", templates:[
    { title:"Nouveauté", content:"Nous sommes heureux de vous annoncer :\n\n[Description de la nouveauté ou du nouveau service]\n\nPourquoi c est important pour vous :\n- [Bénéfice client 1]\n- [Bénéfice client 2]\n\nEn savoir plus : [Téléphone] | [Site web]\n\n#Nouveauté #[VotreMétier] #[VotreVille]"},
    { title:"Événement", content:"Rendez-vous le [Date] !\n\n[Nom de l événement]\nLieu : [Adresse]\nHoraires : [Heures]\n\nAu programme :\n- [Point 1]\n- [Point 2]\n\nEntrée libre — venez nombreux.\n\n#Événement #[VotreVille] #[VotreMétier]"},
  ]},
];

// ─── BEST PRACTICES SECTORIELLES (Google GBP Playbooks 2026) ─────────────────
const GBP_SECTOR_TIPS = {
  restaurant: {
    label: "Restaurant / Alimentation", icon: "🍽️",
    keywords: ["restaurant","brasserie","café","bar","traiteur","pizzeria","sushi","food","cuisine","boulangerie","pâtisserie","crêperie"],
    stats: ["84% consultent le menu avant de choisir","43% décident après le menu","62% motivés par une offre limitée","32% + de clics avec photo du plat"],
    top3Tips: [
      "Menu structuré complet = facteur n°1 pour apparaître dans 'restaurants près de moi'",
      "Répondre à 100% des avis sous 24h = +65% de conversions vs concurrents silencieux",
      "Posts hebdo avec mots-clés locaux = 5x plus de vues selon Google",
    ],
    mustDo: [
      {priority:"🔴 CRITIQUE", action:"Menu structuré : sections + noms plats + descriptions + PRIX", detail:"84% consultent le menu avant de choisir — sans menu vous perdez la moitié de votre audience"},
      {priority:"🔴 CRITIQUE", action:"Photos des plats haute qualité (min. 1 photo par plat vedette)", detail:"32% plus de clics avec photo — 82% commandent visuellement"},
      {priority:"🔴 CRITIQUE", action:"Lien commande en ligne (Uber Eats, Deliveroo, site propre)", detail:"80% s'attendent à commander depuis Google — vos concurrents captent ces clients sinon"},
      {priority:"🟠 URGENT",   action:"Lien réservation de table (LaFourchette, Resy, lien propre)", detail:"80% veulent réserver depuis Maps — bouton 'Réserver une table' visible"},
      {priority:"🟠 URGENT",   action:"Attributs : terrasse, chiens admis, Wi-Fi, parking, végétarien", detail:"Ces filtres déclenchent la décision de visite dans Maps"},
      {priority:"🟡 IMPORTANT",action:"Posts 'Offre du moment' + 'Événement' + 'Nouveau plat' chaque semaine", detail:"50% cherchent des promos — 3 types de posts = best practice Google 2026"},
      {priority:"🟡 IMPORTANT",action:"Horaires livraison/plats à emporter séparés des horaires salle", detail:"Créneaux pickup/delivery = visibilité dans les recherches spécifiques"},
      {priority:"🟡 IMPORTANT",action:"Lier Instagram/Facebook (+9% impressions, +14% découverte)", detail:"20% vérifient les réseaux avant de visiter — posts Instagram apparaissent sur Google"},
      {priority:"🟢 BONUS",    action:"QR code avis sur tables, additions, vitrine", detail:"65% choisissent le resto qui répond — volume + réactivité = position TOP 3"},
    ]
  },
  hotel: {
    label: "Hôtel / Hébergement", icon: "🏨",
    keywords: ["hôtel","hotel","chambre","hébergement","gîte","airbnb","résidence","lodge","resort","auberge","chambres d'hôtes","camping"],
    stats: ["+30% réservations directes via Free Booking Links","12+ réservations/mois supplémentaires avec 100+ clics","Recherches 'things to do near me' +100% YoY","50% cherchent des promos séjour"],
    top3Tips: [
      "Free Booking Links activés = accès direct au prix hôtel vs OTA — facteur de conversion n°1",
      "Équipements complets (Wi-Fi, piscine, parking, spa) = icônes highlights dans Maps = clics +42%",
      "Posts packages & offres saisonnières = 5x plus de vues + référencement dynamique",
    ],
    mustDo: [
      {priority:"🔴 CRITIQUE", action:"Free Booking Links via partenaire OTA ou site direct", detail:"+30% de réservations directes — gratuit à configurer via Google Hotel Center"},
      {priority:"🔴 CRITIQUE", action:"Horaires check-in / check-out renseignés explicitement", detail:"Information première que les voyageurs recherchent — absence = frustration = perte"},
      {priority:"🔴 CRITIQUE", action:"Tous les équipements (Wi-Fi, piscine, spa, parking, petit-déjeuner, accessibilité)", detail:"Highlights équipements = icônes colorées dans Maps — filtrés par les voyageurs"},
      {priority:"🟠 URGENT",   action:"Photos par type de chambre + espaces communs + extérieur + restaurant", detail:"90% plus de visites avec photos — montrer chaque type de chambre et ambiance"},
      {priority:"🟠 URGENT",   action:"Fiches séparées pour restaurant/bar/spa de l'hôtel", detail:"Chaque sous-activité apparaît dans ses propres recherches = visites supplémentaires"},
      {priority:"🟡 IMPORTANT",action:"Posts 'Weekend package', 'Offre saisonnière', 'Événement' hebdomadaires", detail:"50% cherchent des promos — recherches 'unique things' +100% YoY = opportunité"},
      {priority:"🟡 IMPORTANT",action:"WhatsApp pour demandes de réservation et questions pré-séjour", detail:"60% préfèrent WhatsApp — réduire la friction = + de conversions"},
      {priority:"🟡 IMPORTANT",action:"Lier YouTube/Instagram (vidéos hôtel dans Maps)", detail:"+9% impressions, +14% découverte selon étude Soci 2025"},
      {priority:"🟢 BONUS",    action:"QR code avis en chambre et réception post-séjour", detail:"Volume d'avis + taux de réponse = facteur TOP 3 le plus actionnable rapidement"},
    ]
  },
  service: {
    label: "Artisan / Service à domicile", icon: "🔧",
    keywords: ["plombier","électricien","menuisier","maçon","peintre","carreleur","couvreur","serrurier","jardinier","nettoyage","déménagement","chauffagiste","climatisation","vitrerie","toiture","électroménager","fumiste","isolation","rénovation"],
    stats: ["7x plus de clics pour les fiches complètes","91% cherchent en ligne avant de contacter","77% s'attendent à réserver en ligne","96% visitent si les horaires sont affichés"],
    top3Tips: [
      "Zone de service précise par commune = signal local n°1 pour 'plombier à [ville]'",
      "Liste de services en catégories avec descriptions + prix = 3x plus de conversions qu'une fiche sans",
      "Local Service Ads (Annonces Services Locaux) = position n°1 absolu au-dessus de tout, payé au lead",
    ],
    mustDo: [
      {priority:"🔴 CRITIQUE", action:"Zone de service : toutes les communes couvertes (jusqu'à 20)", detail:"Sans zone définie, Google ne vous propose pas dans 'plombier à [ville]' — priorité absolue"},
      {priority:"🔴 CRITIQUE", action:"Liste de services organisée en catégories avec descriptions et prix indicatifs", detail:"Utilisez 'Modifier les services' : choisissez dans les suggestions Google OU ajoutez des services personnalisés (sans prix ni téléphone dans le titre)"},
      {priority:"🔴 CRITIQUE", action:"20+ photos de réalisations avec mention de la ville dans le titre", detail:"42% plus de demandes d'itinéraire = plus d'appels — chaque photo = opportunité SEO local"},
      {priority:"🟠 URGENT",   action:"Bouton 'Réserver en ligne' via partenaire agréé Google (Reserve with Google)", detail:"77% s'attendent à réserver depuis Google — le bouton 'Réserver' est 3x plus visible qu'un simple lien"},
      {priority:"🟠 URGENT",   action:"Attributs : certifications RGE, labels QualiPAC/QualiRGE, garantie décennale", detail:"Ces badges rassurent et différencient — filtrés activement par les clients exigeants"},
      {priority:"🟠 URGENT",   action:"Local Service Ads : activer les Annonces Services Locaux Google (paiement au lead)", detail:"Position n°1 absolu en haut de Google Search — badge 'Google Guaranteed' — vous payez uniquement pour les appels et messages reçus. Vérifier l'éligibilité sur Google."},
      {priority:"🟡 IMPORTANT",action:"Posts 'Réalisation avant/après + nom de commune' chaque semaine", detail:"Vrai nom de la commune dans le post = signal géographique fort — +31% de vues Maps (étude Crate & Barrel)"},
      {priority:"🟡 IMPORTANT",action:"Répondre à 100% des avis avec le prénom du client sous 24h", detail:"65% choisissent l'artisan qui répond — dans ce secteur la majorité ne répond pas = avantage immédiat"},
      {priority:"🟡 IMPORTANT",action:"WhatsApp pour devis rapide (numéro dans la fiche GMB)", detail:"67% préfèrent un message à un appel — réduire la friction contact = +X% de leads qualifiés"},
      {priority:"🟡 IMPORTANT",action:"Lier Facebook/Instagram pour afficher les posts dans Maps (+9% impressions)", detail:"20% vérifient les réseaux sociaux avant de contacter — vos réalisations Instagram dans Google Maps"},
      {priority:"🟢 BONUS",    action:"QR code avis à remettre après chaque chantier terminé", detail:"Le meilleur moment = juste après la fin du chantier satisfait — carte QR = stratégie la plus simple"},
    ],
    localServiceAds: {
      title: "Local Service Ads — Position n°1 Garantie",
      description: "Les Annonces Services Locaux apparaissent EN HAUT de Google Search, avant les annonces classiques et les résultats organiques. Badge 'Google Garanti' affiché. Paiement uniquement pour les leads (appels ou messages reçus).",
      steps: ["Vérifier l'éligibilité de votre catégorie de service","Créer un compte Local Services Ads","Passer la vérification Google (identité + assurance + licence)","Définir votre budget hebdomadaire","Aller live et être découvert en premier"],
      stat: "77% des consommateurs s'attendent à pouvoir réserver en ligne"
    }
  },
  beauty: {
    label: "Beauté / Bien-être", icon: "💅",
    keywords: ["coiffeur","salon","esthétique","spa","massage","manucure","barbier","beauté","soins","onglerie","institut","épilation"],
    stats: ["Reserve with Google dans 88+ pays","77% s'attendent à réserver en ligne","91% lisent les avis avant de choisir","65% choisissent le salon qui répond aux avis"],
    top3Tips: [
      "Bouton Réserver en ligne = facteur n°1 — sans ça vous perdez les clients mobiles pressés",
      "Photos before/after des prestations = déclencheur de réservation n°1 dans ce secteur",
      "Offre nouveaux clients en post GMB = acquisition gratuite + visibilité hebdomadaire",
    ],
    mustDo: [
      {priority:"🔴 CRITIQUE", action:"Système réservation en ligne (Planity, Treatwell, Vagaro, Fresha...)", detail:"77% s'attendent à réserver depuis Google — sans bouton vous perdez les clients mobiles"},
      {priority:"🔴 CRITIQUE", action:"Liste complète des soins avec durées et prix", detail:"Les clients comparent TOUJOURS les tarifs avant de réserver — absence = perte immédiate"},
      {priority:"🔴 CRITIQUE", action:"Photos avant/après (coiffure, colorations, soins, ongles)", detail:"Le résultat visible est le premier déclencheur de réservation — 1 photo = dizaines de requêtes"},
      {priority:"🟠 URGENT",   action:"Offre nouveaux clients -X% ou prestation découverte en post GMB", detail:"48% reviendront pour une offre spéciale — acquérir de nouveaux clients via Google gratuitement"},
      {priority:"🟠 URGENT",   action:"Attributs : parking, accessibilité, Wi-Fi, paiement CB, chèques-cadeaux", detail:"Filtres Maps utilisés par les clients — chaque attribut coché = visibilité supplémentaire"},
      {priority:"🟡 IMPORTANT",action:"Répondre à 100% des avis (surtout négatifs) sous 24h", detail:"Un salon qui répond aux avis négatifs avec professionnalisme rassure plus qu'un sans avis négatifs"},
      {priority:"🟡 IMPORTANT",action:"Posts hebdo : résultat prestation + avis client + offre du moment", detail:"Instagram lié = posts qui apparaissent dans Maps — double exposition"},
      {priority:"🟢 BONUS",    action:"WhatsApp pour confirmations RDV et rappels automatiques", detail:"Réduire les no-shows améliore le CA et la satisfaction client"},
    ]
  },
  tours: {
    label: "Tours & Attractions / Loisirs", icon: "🎡",
    keywords: ["tour","attraction","musée","parc","escape game","karting","laser","accrobranche","visite","guide","activité","bowling","cinéma","théâtre","concert","zoo","aquarium","casino","kart","loisir","paintball","golf","tennis","piscine","patinoire"],
    stats: ["Recherches 'things to do near me' +100% YoY","7x plus de clics pour les fiches complètes","90% plus de visites avec photos","50% cherchent des promos avant de réserver"],
    top3Tips: [
      "Activités et billets via Ticket Editor Google = onglet 'Tickets' dans la fiche = conversion directe",
      "Photos et vidéos d'ambiance avec participants en action = déclencheur émotionnel n°1",
      "Posts 'Événement' avec date = visibilité dans Maps Events + urgence d'achat",
    ],
    mustDo: [
      {priority:"🔴 CRITIQUE", action:"Activités et billets listés via Google Ticket Editor (gratuit, 5 min)", detail:"Onglet 'Tickets' dans la fiche — les voyageurs viennent sur Google pour trouver quoi faire"},
      {priority:"🔴 CRITIQUE", action:"Ou activer via partenaire connecté (Evendo, GetYourGuide, Viator...)", detail:"Prix + disponibilités en temps réel + annulation gratuite = conversion sans quitter Google"},
      {priority:"🔴 CRITIQUE", action:"Photos/vidéos d'ambiance avec vrais participants en action", detail:"90% plus de visites avec photos — le 'story telling' visuel est le premier déclencheur loisirs"},
      {priority:"🟠 URGENT",   action:"Lien de réservation en ligne (site propre ou OTA partenaire)", detail:"77% s'attendent à réserver depuis Google — 'things to do' +100% de recherches cette année"},
      {priority:"🟠 URGENT",   action:"Attributs complets : famille-friendly, accessibilité, durée, groupes", detail:"Filtres clés pour familles et groupes — chaque attribut = apparition dans plus de recherches"},
      {priority:"🟠 URGENT",   action:"Horaires saisonniers et jours fériés parfaitement à jour", detail:"96% abandonnent si les horaires sont incorrects — critique pour ce secteur saisonnier"},
      {priority:"🟡 IMPORTANT",action:"Posts 'Événement' avec date pour chaque animation/soirée spéciale", detail:"Posts avec date apparaissent dans l'onglet Events Maps — visibilité gratuite supplémentaire"},
      {priority:"🟡 IMPORTANT",action:"Lier YouTube (vidéos ambiance) et Instagram (expériences clients)", detail:"Les vidéos de l'activité dans Maps = argument de vente le plus puissant pour les loisirs"},
      {priority:"🟡 IMPORTANT",action:"WhatsApp pour réservations de groupes et événementiels", detail:"Les groupes se négocient encore par message — 60% préfèrent WhatsApp"},
      {priority:"🟢 BONUS",    action:"QR code avis à la sortie de l'activité (moment émotionnel fort)", detail:"Juste après l'expérience positive = meilleur moment pour demander un avis 5★"},
    ]
  },
};

// Detecteur de secteur automatique
const detectSector = (category="", city="") => {
  const cat = category.toLowerCase();
  for(const [key, tips] of Object.entries(GBP_SECTOR_TIPS)){
    if(tips.keywords.some(kw => cat.includes(kw))) return {key, ...tips};
  }
  return null;
};

// ─── DONNÉES MARCHÉ (Geolid 2026 + Étude Algorithme GBP) ─────────────────────
const MARKET_DATA = {
  national: {
    noteAvg: 4.2,
    reviewsAvg: 420,
    reviewsGrowth: "+31% vs 2025",
    completionAvg: 71,
    reviewsPerMonth: 6,
    responseRate: 67,
    ctr: 14.19,
    ctrGrowth: "+3.29pts vs 2025",
    sources: { search: 69.21, maps: 30.79 },
    devices: { mobile: 85.25, desktop: 14.75 },
    actions: { phone: 36.23, website: 35.64, directions: 29.13 },
    categoriesAvg: 5,
    noteDistrib: [
      {label:"< 2.5",  pct:7,  color:"#dc2626"},
      {label:"2.5–3.5",pct:7,  color:"#ea580c"},
      {label:"3.5–4",  pct:16, color:"#d97706"},
      {label:"4–4.5",  pct:32, color:"#65a30d"},
      {label:"> 4.5",  pct:38, color:"#059669"},
    ],
    reviewDistrib: [
      {label:"5 ★",pct:75,color:"#059669"},
      {label:"4 ★",pct:11,color:"#65a30d"},
      {label:"3 ★",pct:3, color:"#d97706"},
      {label:"2 ★",pct:2, color:"#ea580c"},
      {label:"1 ★",pct:9, color:"#dc2626"},
    ],
    completionFields: [
      {field:"Adresse",        pct:100,color:"#059669"},
      {field:"Site web",       pct:96, color:"#059669"},
      {field:"Téléphone",      pct:93, color:"#059669"},
      {field:"Horaires",       pct:92, color:"#059669"},
      {field:"Photo couverture",pct:83,color:"#65a30d"},
      {field:"Page Facebook",  pct:47, color:"#d97706"},
      {field:"Page Instagram", pct:41, color:"#ea580c"},
      {field:"Lien réservation",pct:30,color:"#dc2626"},
      {field:"Description",    pct:18, color:"#dc2626"},
    ],
  },
  algorithm: {
    highImpact: [
      {factor:"Note moyenne",            impact:"Élevé", pct:95, tip:"Viser > 4.2 (moyenne nationale) — chaque dixième de point compte"},
      {factor:"Note 30 derniers jours",  impact:"Élevé", pct:90, tip:"Les avis récents pèsent plus que le volume total — priorité à la régularité"},
      {factor:"Mots-clés dans le titre", impact:"Élevé", pct:85, tip:"Le nom du métier dans le nom de la fiche booste la pertinence (sans suroptimisation)"},
      {factor:"Champs complétés",        impact:"Élevé", pct:85, tip:"Compléter TOUS les champs — même ceux qui semblent secondaires"},
      {factor:"Taux de réponse aux avis",impact:"Élevé", pct:82, tip:"Répondre à 100% des avis — seulement 67% des établissements le font"},
      {factor:"Avis 30 derniers jours",  impact:"Élevé", pct:80, tip:"6 avis/mois = moyenne nationale — viser 10+ pour dominer le classement"},
    ],
    moderateImpact: [
      {factor:"Nombre de photos",   impact:"Modéré", tip:"Plus une fiche est bien positionnée, plus les photos s'accumulent — corrélation bidirectionnelle"},
      {factor:"Nombre total d'avis",impact:"Modéré", tip:"Impact moins fort qu'attendu — la régularité des nouveaux avis prime sur le volume total"},
    ],
    lowImpact: [
      {factor:"Mots-clés en description",impact:"Faible", tip:"Peu d'effet sur le classement — écrire pour les clients, pas pour l'algorithme"},
      {factor:"Distance au centre-ville", impact:"Faible", tip:"Google utilise surtout le code postal (êtes-vous dans la ville ?) plutôt que la distance exacte"},
    ],
    keyInsights: [
      "Ces critères expliquent 91% de la variation des positions — étude Geolid sur 30 000+ fiches",
      "Les positions fluctuent plusieurs fois par jour — ne jamais évaluer sa position ponctuellement",
      "Google priorise d'abord : établissement ouvert + code postal correspondant à la ville recherchée",
      "10 avis continus/mois > 100 avis d'un coup puis rien — la régularité prime sur la quantité",
      "85% des visites de fiches viennent du mobile — optimiser la fiche pour mobile en priorité",
      "Le bouton Appel est l'action n°1 (36%) — le numéro de téléphone est critique (7% des fiches n'en ont pas)",
    ]
  },
  sectors: [
    {name:"Restauration",         icon:"🍽️",  note:3.8, reviews:1572, completion:86, alert:"Note la plus basse — avis très nombreux mais difficiles à gérer"},
    {name:"Grande distribution",  icon:"🛒",  note:3.9, reviews:625,  completion:70, alert:"Note faible — priorité à la collecte d'avis 5★"},
    {name:"Habillement",          icon:"👕",  note:4.0, reviews:404,  completion:76, alert:"Note moyenne — fort volume d'avis"},
    {name:"Banque",               icon:"🏦",  note:4.1, reviews:68,   completion:72, alert:"Peu d'avis — opportunité de se démarquer facilement"},
    {name:"Hôtellerie",           icon:"🏨",  note:4.1, reviews:919,  completion:74, alert:"Fort volume d'avis — taux de réponse crucial"},
    {name:"Ameublement",          icon:"🛋️",  note:4.2, reviews:1170, completion:83, alert:"Bon équilibre note/volume"},
    {name:"Cosmétique",           icon:"💄",  note:4.2, reviews:261,  completion:69, alert:"Complétion faible — marge d'amélioration importante"},
    {name:"Immobilier",           icon:"🏠",  note:4.2, reviews:106,  completion:73, alert:"Peu d'avis — facile de dominer avec 20+ avis récents"},
    {name:"Loisirs & Culture",    icon:"🎡",  note:4.2, reviews:1015, completion:81, alert:"Fort volume — qualité des avis déterminante"},
    {name:"Assurance",            icon:"🛡️",  note:4.3, reviews:101,  completion:70, alert:"Secteur peu optimisé — forte opportunité"},
    {name:"Pharmaceutique",       icon:"💊",  note:4.3, reviews:112,  completion:61, alert:"Complétion la plus faible — champs vides = positions perdues"},
    {name:"Constructeurs auto",   icon:"🚗",  note:4.3, reviews:229,  completion:63, alert:"Complétion critique — 37% des champs vides en moyenne"},
    {name:"Services automobile",  icon:"🔧",  note:4.4, reviews:271,  completion:71, alert:"Bonne note — volume d'avis à augmenter"},
    {name:"Salons beauté/Coiffure",icon:"💅", note:4.5, reviews:174,  completion:78, alert:"Excellente note — réservation en ligne = levier majeur"},
    {name:"Salles de sport",      icon:"💪",  note:4.5, reviews:302,  completion:85, alert:"Très bon profil — maintenir la régularité des avis"},
    {name:"Bâtiment & Construction",icon:"🏗️",note:4.5, reviews:43,  completion:73, alert:"Très peu d'avis — 10 avis frais suffisent pour dominer"},
    {name:"Services à la personne",icon:"🤝", note:4.7, reviews:40,   completion:73, alert:"Note excellente, volume très faible — niche facile à dominer"},
    {name:"Optique & Audition",   icon:"👓",  note:4.8, reviews:116,  completion:79, alert:"Meilleur secteur — référence à atteindre"},
  ]
};

// ─── PIPELINE STAGES ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  {id:"nouveau",   label:"Nouveau",     icon:"🆕", color:"#6B40D8", bg:"#F5F3FF", b:"#C4B5FD"},
  {id:"contacte",  label:"Contacté",    icon:"📞", color:"#0891b2", bg:"#ecfeff", b:"#a5f3fc"},
  {id:"relance",   label:"Relancé",     icon:"🔄", color:"#d97706", bg:"#fffbeb", b:"#fde68a"},
  {id:"negocie",   label:"Négociation", icon:"🤝", color:"#ea580c", bg:"#fff7ed", b:"#fed7aa"},
  {id:"signe",     label:"Signé",       icon:"✅", color:"#059669", bg:"#f0fdf4", b:"#bbf7d0"},
];
const loadProspects = () => { try{ return JSON.parse(localStorage.getItem("bto_prospects")||"[]"); }catch{ return []; } };

// ─── TEMPLATES POSTS PAR SECTEUR ──────────────────────────────────────────────
const TEMPLATE_VARS = ["[VILLE]","[NOM]","[TEL]","[DATE]","[ANNÉES]"];
const POST_TEMPLATES = {
  "Restauration":[
    {type:"Réalisation",title:"Nouveau plat du jour",content:"Découvrez notre plat du jour !\n\nAujourd hui en cuisine : [Description du plat — ingrédients, origine, accord boisson]\n\nDisponible uniquement ce midi — places limitées.\n\nRéservez votre table : [TEL]\n\n#Restaurant #[VILLE] #CuisineFaite Maison",keywords:["restaurant [VILLE]","plat du jour [VILLE]"]},
    {type:"Offre",title:"Menu spécial weekend",content:"Ce weekend, on se fait plaisir !\n\nMenu spécial : [Description du menu — entrée, plat, dessert]\nPrix : [Prix] par personne\n\nDisponible samedi et dimanche midi et soir.\n\nRéservation au [TEL] — tables disponibles jusqu au [DATE]\n\n#Restaurant #[VILLE] #Weekend",keywords:["restaurant [VILLE]","réservation restaurant [VILLE]"]},
    {type:"Conseil",title:"Le bon accord mets-vins",content:"Le conseil de notre sommelier\n\n[Conseil pratique sur les accords mets-vins, les saisons, les produits locaux]\n\nPassez nous voir pour en discuter autour d un verre !\n\n[NOM] — [TEL]\n\n#Gastronomie #[VILLE] #VinsFrançais",keywords:["restaurant gastronomique [VILLE]"]},
  ],
  "Plomberie":[
    {type:"Réalisation",title:"Intervention terminée",content:"Chantier terminé chez un client à [VILLE] !\n\n[Description de l intervention : type de panne, solution apportée, durée]\n\nIntervention réalisée en [durée]. Garantie incluse.\n\nUne urgence plomberie ? Appelez le [TEL] — intervention sous 2h.\n\n#Plombier #[VILLE] #PlomberieMorbihan",keywords:["plombier [VILLE]","urgence plomberie [VILLE]"]},
    {type:"Conseil",title:"Prévenir les pannes cet hiver",content:"Conseil plomberie du mois\n\nAvant les grands froids, pensez à :\n- [Conseil 1 — ex: calorifuger les tuyaux]\n- [Conseil 2 — ex: couper l arrivée d eau en cas d absence]\n- [Conseil 3 — ex: purger les radiateurs]\n\nBesoin d un diagnostic ? [TEL]\n\n#Plomberie #[VILLE] #Entretien",keywords:["plombier chauffagiste [VILLE]","entretien plomberie"]},
    {type:"Offre",title:"Diagnostic gratuit",content:"Offre spéciale — valable jusqu au [DATE]\n\nDiagnostic plomberie GRATUIT pour tout nouveau client à [VILLE] et environs.\n\nOn intervient sur : fuites, canalisations, chauffe-eau, sanitaires.\n\nAppellez maintenant : [TEL]\n\n#Plombier #[VILLE] #Devis Gratuit",keywords:["plombier pas cher [VILLE]","devis plomberie [VILLE]"]},
  ],
  "Coiffure & Beauté":[
    {type:"Réalisation",title:"Transformation du jour",content:"Résultat du jour !\n\n[Description de la prestation — coupe, couleur, soin]\n\nMerci à notre cliente pour sa confiance.\n\nVous souhaitez un relooking ? Prenez RDV au [TEL] ou en ligne.\n\n#Coiffeur #[VILLE] #Beauté #Transformation",keywords:["coiffeur [VILLE]","salon de coiffure [VILLE]"]},
    {type:"Offre",title:"Offre nouveaux clients",content:"Bienvenue chez [NOM] !\n\nOffre spéciale nouveaux clients :\n[Description de l offre — ex: -20% sur la 1ère visite, soin offert...]\n\nValable jusqu au [DATE]\n\nRéservez votre place : [TEL]\n\n#Coiffeur #[VILLE] #NouveauxClients",keywords:["coiffeur pas cher [VILLE]","prix coiffeur [VILLE]"]},
    {type:"Conseil",title:"Routine cheveux de l automne",content:"Le conseil de notre équipe\n\n[Conseil saison — ex: comment protéger ses cheveux l hiver, les bons gestes]\n\nProduits recommandés disponibles au salon.\n\n[NOM] — [TEL]\n\n#Cheveux #[VILLE] #ConseilBeauté",keywords:["soin cheveux [VILLE]","coiffeur [VILLE]"]},
  ],
  "Immobilier":[
    {type:"Actualité",title:"Nouveau bien en vente",content:"Nouvelle exclusivité !\n\n[Type de bien] — [Surface] m² — [VILLE]\n\nCaractéristiques :\n- [Point fort 1]\n- [Point fort 2]\n- [Point fort 3]\n\nPrix : [Prix]\n\nContactez-nous : [TEL]\n\n#Immobilier #[VILLE] #AchatImmobilier",keywords:["agence immobilière [VILLE]","vente maison [VILLE]"]},
    {type:"Conseil",title:"Les clés pour bien acheter",content:"Nos conseils pour acheter sereinement à [VILLE]\n\n[Conseil 1 — ex: bien définir son budget]\n[Conseil 2 — ex: vérifier le DPE]\n[Conseil 3 — ex: anticiper les frais de notaire]\n\nBesoin d un accompagnement ? [TEL]\n\n#Immobilier #[VILLE] #ConseilsAchat",keywords:["conseil immobilier [VILLE]","achat immobilier [VILLE]"]},
  ],
  "Artisan":[
    {type:"Réalisation",title:"Chantier livré",content:"Nouveau chantier livré à [VILLE] !\n\n[Description du projet — type, superficie, matériaux, durée]\n\nMerci à nos clients pour leur confiance.\n\nVous avez un projet ? Demandez votre devis gratuit : [TEL]\n\n#Artisan #[VILLE] #Rénovation #Bâtiment",keywords:["artisan [VILLE]","entreprise rénovation [VILLE]"]},
    {type:"Conseil",title:"L astuce du professionnel",content:"L astuce de la semaine\n\n[Conseil pratique dans votre domaine — entretien, prévention, bon geste]\n\nDes questions sur votre projet ? [NOM] — [TEL]\n\n#Artisan #[VILLE] #ConseilPro",keywords:["artisan qualifié [VILLE]"]},
    {type:"Offre",title:"Devis gratuit",content:"Besoin d un artisan à [VILLE] ?\n\nNous intervenons dans un rayon de [distance] km autour de [VILLE].\n\nDevis gratuit et sans engagement sous 48h.\n\nAppellez le [TEL] ou laissez-nous un message.\n\n#Artisan #[VILLE] #DevisGratuit",keywords:["devis artisan [VILLE]","artisan [VILLE]"]},
  ],
  "Autre":[
    {type:"Réalisation",title:"Mission accomplie",content:"Nouvelle prestation réalisée !\n\n[Description du projet ou de l intervention en 2-3 phrases]\n\nMerci à [Prénom du client] pour sa confiance.\n\nUn projet similaire ? Contactez-nous : [TEL]\n\n#[VILLE] #Professionnel #[Secteur]",keywords:["[NOM] [VILLE]"]},
    {type:"Conseil",title:"Le conseil de l expert",content:"Notre conseil de la semaine\n\n[Titre accrocheur]\n\n[Explication en 2-3 points simples et pratiques]\n\nDes questions ? [NOM] — [TEL]\n\n#Conseil #[VILLE] #Expertise",keywords:["expert [VILLE]"]},
    {type:"Offre",title:"Offre du moment",content:"Offre spéciale — valable jusqu au [DATE]\n\n[Description de l offre]\n\nAvantages :\n- [Avantage 1]\n- [Avantage 2]\n\nContactez-nous vite : [TEL]\n\n#Offre #[VILLE]",keywords:["[NOM] [VILLE]"]},
    {type:"Témoignage",title:"Avis client",content:"Ce que disent nos clients\n\n\"[Copier l avis Google ici]\"\n— [Prénom], [Ville]\n\nMerci [Prénom] pour ce retour !\n\nVotre avis compte : [Lien Google]\n\n#Avis #[VILLE] #Satisfaction",keywords:["[NOM] [VILLE] avis"]},
    {type:"Actualité",title:"Nouveauté",content:"Nous avons le plaisir de vous annoncer :\n\n[Description de la nouveauté — nouveau service, nouveau produit, nouveau local]\n\nPourquoi c est une bonne nouvelle pour vous :\n- [Bénéfice 1]\n- [Bénéfice 2]\n\nPlus d infos : [TEL] | [NOM]\n\n#Nouveauté #[VILLE]",keywords:["[NOM] [VILLE]"]},
  ],
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SK = "gmb_crm_v10";
const load = ()=>{ try{ return JSON.parse(localStorage.getItem(SK)||"[]"); }catch{ return []; }};
const save = c => localStorage.setItem(SK, JSON.stringify(c));

// ─── API ──────────────────────────────────────────────────────────────────────
async function callAI(prompt, apiKey, attempt=0){
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey;
  if(!key) throw new Error("Clé API manquante — entrez votre clé Anthropic.");
  let res;
  try{
    res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:16000,
        system:"Tu es un expert SEO local Google Business Profile. Retourne UNIQUEMENT du JSON valide, sans aucun texte avant ni après, sans backticks, sans markdown. Commence directement par { et termine par }. AUCUN emoji dans les posts, Q&R, services ni produits.",
        messages:[
          {role:"user",   content: prompt},
          {role:"assistant", content: "{"}
        ]
      })
    });
  } catch(e){
    if(attempt<2) return callAI(prompt,apiKey,attempt+1);
    throw new Error("Impossible de contacter l'API Anthropic. Vérifiez votre connexion.");
  }
  if(!res.ok){
    const e=await res.json().catch(()=>({}));
    const msg=e?.error?.message||`Erreur ${res.status}`;
    if(res.status===529&&attempt<2){await new Promise(r=>setTimeout(r,3000));return callAI(prompt,apiKey,attempt+1);}
    if(res.status===401) throw new Error("Clé API invalide — vérifiez votre clé Anthropic.");
    if(res.status===429) throw new Error("Limite de requêtes atteinte — patientez quelques secondes et réessayez.");
    throw new Error(msg);
  }
  const d=await res.json();
  const raw=(d.content||[]).map(b=>b.text||"").join("").trim();

  // Prepend the { we used as prefill
  const withBrace = "{" + raw;

  // Aggressive cleaning pipeline
  const clean = withBrace
    .replace(/^```json\s*/i,"").replace(/^```\s*/,"").replace(/```\s*$/,"")
    .replace(/[\u0000-\u001F\u007F]/g, m => m==="\n"||m==="\r"||m==="\t" ? m : "") // remove control chars except newlines
    .trim();

  // Attempt 1: direct parse
  try{ return JSON.parse(clean); } catch{}

  // Attempt 2: extract first complete JSON object
  try{
    const m = clean.match(/\{[\s\S]*\}/);
    if(m) return JSON.parse(m[0]);
  } catch{}

  // Attempt 3: try to fix truncated JSON by closing open structures
  try{
    let fixed = clean;
    // Count unclosed braces/brackets
    let braces=0, brackets=0, inStr=false, escape=false;
    for(const c of fixed){
      if(escape){escape=false;continue;}
      if(c==='\\'&&inStr){escape=true;continue;}
      if(c==='"') inStr=!inStr;
      if(!inStr){
        if(c==='{')braces++;else if(c==='}')braces--;
        if(c==='[')brackets++;else if(c===']')brackets--;
      }
    }
    // Close truncated JSON
    if(inStr) fixed+='"';
    while(brackets>0){fixed+=']';brackets--;}
    while(braces>0){fixed+='}';braces--;}
    return JSON.parse(fixed);
  } catch{}

  // Attempt 4: retry with explicit instruction
  if(attempt<2){
    await new Promise(r=>setTimeout(r,2000));
    return callAI(prompt,apiKey,attempt+1);
  }
  throw new Error("La réponse IA n'est pas du JSON valide après 3 tentatives. Réessayez dans quelques secondes.");
}

async function runAudit(name, text, apiKey, extraKeywords=[]){
  const kwsNote = extraKeywords.length > 0
    ? "\n\nMOTS-CLÉS SUIVIS PAR LE CLIENT (inclure dans keywords.primary/secondary) : " + extraKeywords.join(", ")
    : "";
  return callAI(`Analyse cette fiche Google Business Profile. Utilise toujours les vraies données. AUCUN emoji dans les posts, Q&R, services, produits.

FICHE :
"""${text}"""

JSON complet :
{"scores":{"business_name":true,"category_primary":false,"category_secondary":false,"address":true,"service_area":false,"social_links":false,"phone":true,"website":false,"hours_regular":false,"hours_special":false,"desc_length":false,"desc_keywords":false,"attributes":false,"services_listed":false,"products_listed":false,"booking_link":false,"photo_cover":false,"photo_logo":false,"chat_link":false,"photo_count":false,"photo_interior":false,"photo_team":false,"photo_recent":false,"rating":true,"review_count":false,"response_rate":false,"response_quality":false,"recent_reviews":false,"qr_reviews":false,"posts_frequency":false,"posts_cta":false,"posts_offers":false,"posts_variety":false},"pillars":{"pertinence":{"score":42,"label":"Moyen","details":"Explication concrète basée sur la fiche"},"proximite":{"score":65,"label":"Bon","details":"Explication proximité"},"prominence":{"score":38,"label":"Faible","details":"Explication proéminence"},"avis":{"score":55,"label":"Moyen","details":"Explication avis"},"completion":{"score":70,"label":"Bon","details":"Explication complétion"}},"extracted":{"name":"NOM RÉEL","category":"CATÉGORIE","address":"ADRESSE","phone":"TEL","website":"SITE","rating":"NOTE/5","reviewCount":"NB","photoCount":"NB","postsCount":"NB","city":"VILLE","sector":"SECTEUR","secondaryCategories":{"present":["catégorie secondaire réelle si présente"],"suggested":["suggestion 1","suggestion 2","suggestion 3"]},"services":{"present":[{"name":"Service réel","description":"Description"}],"suggested":[{"name":"Service suggéré","description":"Pourquoi l ajouter"}]},"products":{"present":[{"name":"Produit réel","description":"Description","price":"Prix"}],"suggested":[{"name":"Produit suggéré","description":"Pourquoi l ajouter","price":""}]}},"competitorRanking":{"estimatedPosition":"3-5","marketShareEstimate":"15%","rankingFactors":[{"factor":"Note","ourValue":"4.2","avgCompetitor":"4.6","gap":"-0.4","impact":"Fort"},{"factor":"Avis","ourValue":"28","avgCompetitor":"45","gap":"-17","impact":"Fort"},{"factor":"Photos","ourValue":"12","avgCompetitor":"30","gap":"-18","impact":"Moyen"},{"factor":"Posts","ourValue":"Non","avgCompetitor":"Oui","gap":"Absent","impact":"Fort"}],"rankingOpportunity":"Comment passer TOP 3 concrètement"},"insights":{"summary":"Synthèse 2-3 phrases concrètes","strengths":["force 1","force 2","force 3"],"weaknesses":["faiblesse 1","faiblesse 2","faiblesse 3"],"quickWins":["action 1","action 2","action 3"]},"keywords":{"primary":[{"kw":"mot-clé ville+métier","volume":"500-1000/mois","competition":"Forte","priority":"TOP","currentPosition":"Hors TOP 10","trend":"↑","zones":["ville","commune"]},{"kw":"2e mot-clé","volume":"200-500/mois","competition":"Moyenne","priority":"TOP","currentPosition":"Non classé","trend":"→","zones":["ville"]},{"kw":"3e mot-clé","volume":"200-500/mois","competition":"Forte","priority":"Haute","currentPosition":"Hors TOP 10","trend":"↑","zones":["ville"]}],"secondary":[{"kw":"secondaire 1","volume":"50-200/mois","competition":"Faible","priority":"Rapide","currentPosition":"Non classé","trend":"↑","zones":["ville"]},{"kw":"secondaire 2","volume":"50-100/mois","competition":"Faible","priority":"Rapide","currentPosition":"TOP 3 possible","trend":"→","zones":["commune"]},{"kw":"secondaire 3","volume":"<50/mois","competition":"Très faible","priority":"Rapide","currentPosition":"Non classé","trend":"↑","zones":["secteur"]}],"longTail":["requête 1","requête 2","requête 3","requête 4","requête 5"],"geoZones":["ville","commune 1","commune 2","commune 3","zone élargie"]},"competitors":[{"name":"Concurrent 1","rating":"4.8","reviews":45,"strengths":"Point fort principal du concurrent en une phrase","threat":"Haute"},{"name":"Concurrent 2","rating":"4.6","reviews":28,"strengths":"Point fort principal du concurrent en une phrase","threat":"Moyenne"},{"name":"Concurrent 3","rating":"4.4","reviews":19,"strengths":"Point fort principal du concurrent en une phrase","threat":"Faible"}],"competitorSummary":"Analyse marché 2-3 phrases","competitorOpportunities":["opportunité 1","opportunité 2","opportunité 3"],"reviews":{"analysis":"Analyse 3 phrases","score":"note","totalReviews":"nb","responseRate":"%","positiveThemes":["thème 1","thème 2","thème 3"],"negativeThemes":["point 1","point 2"],"sentimentScore":75,"responseTemplates":[{"type":"Avis positif 5 étoiles","template":"Bonjour [Prénom], merci..."},{"type":"Avis négatif","template":"Bonjour [Prénom], nous sommes navrés..."},{"type":"Avis neutre","template":"Bonjour [Prénom], merci pour ce retour..."}],"acquisitionTips":["conseil 1","conseil 2","conseil 3","conseil 4"]},"postIdeas":[{"type":"Realisation","title":"Titre sans emoji","content":"Contenu sans emoji. 3-4 phrases. Appel à l action. Hashtags.","bestDay":"Lundi","bestTime":"10h"},{"type":"Conseil","title":"Titre sans emoji","content":"Contenu sans emoji.","bestDay":"Jeudi","bestTime":"14h"},{"type":"Offre","title":"Titre sans emoji","content":"Contenu sans emoji.","bestDay":"Lundi","bestTime":"9h"},{"type":"Temoignage","title":"Titre sans emoji","content":"Contenu sans emoji.","bestDay":"Mercredi","bestTime":"10h"},{"type":"Actualite","title":"Titre sans emoji","content":"Contenu sans emoji.","bestDay":"Vendredi","bestTime":"11h"},{"type":"Realisation","title":"2e idée sans emoji","content":"Contenu sans emoji.","bestDay":"Mardi","bestTime":"10h"},{"type":"Conseil","title":"2e conseil sans emoji","content":"Contenu sans emoji.","bestDay":"Jeudi","bestTime":"14h"},{"type":"Offre","title":"2e offre sans emoji","content":"Contenu sans emoji.","bestDay":"Lundi","bestTime":"9h"},{"type":"Question","title":"Question sans emoji","content":"Contenu sans emoji.","bestDay":"Mercredi","bestTime":"12h"},{"type":"Coulisses","title":"Coulisses sans emoji","content":"Contenu sans emoji.","bestDay":"Vendredi","bestTime":"10h"}],"roadmap":{"month1":{"title":"Fondations","objective":"Fiche à 80%","actions":["action 1","action 2","action 3","action 4","action 5"],"kpis":["KPI 1","KPI 2","KPI 3"]},"month2":{"title":"Notoriété","objective":"TOP 5","actions":["action 1","action 2","action 3","action 4"],"kpis":["KPI 1","KPI 2","KPI 3"]},"month3":{"title":"TOP 3","objective":"TOP 3","actions":["action 1","action 2","action 3","action 4"],"kpis":["KPI 1","KPI 2","KPI 3"]},"beyond":{"title":"Consolidation","actions":["stratégie 1","stratégie 2","stratégie 3"],"expectedResults":{"visibilité":"+300%","appels":"+200%","position":"TOP 1-3"}}}}`, apiKey);
}// ─── STYLES (BeTheOne DNA) ────────────────────────────────────────────────────
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || "gmb2024";
const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;overflow:hidden;font-family:'DM Sans',sans-serif;color:#1E1B30;background:#F4F5FA}
  :root{
    --ink:#1E1B30; --ink2:#374151; --ink3:#6B7280; --ink4:#94A3B8;
    --surface:#FFFFFF; --bg:#F4F5FA; --sidebar:#F0ECFF;
    --border:#E5E7EB; --border2:#DDD6FE;
    --indigo:#3B5BDB; --indigo2:#6B40D8; --violet:#4730F8;
    --mauve:#C4B5FD; --lime:#C8F31F;
    --ground:#F4F5FA;
    --shadow-sm:0 1px 3px rgba(30,27,48,.06),0 1px 2px rgba(30,27,48,.04);
    --shadow:0 4px 16px rgba(30,27,48,.08);
    --shadow-lg:0 12px 40px rgba(30,27,48,.14);
    --r-sm:8px; --r:12px; --r-lg:16px; --r-xl:24px;
    --serif:'DM Sans',sans-serif;
  }
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#DDD6FE;border-radius:3px}
  .inp{background:#F9F7FF;border:1.5px solid var(--border2);color:var(--ink);border-radius:var(--r);padding:10px 14px;width:100%;font-family:inherit;font-size:14px;outline:none;transition:border-color .18s}
  .inp:focus{border-color:var(--indigo2);background:#fff;box-shadow:0 0 0 3px rgba(107,64,216,.1)}
  .inp::placeholder{color:var(--ink4)}
  .ta{background:#F9F7FF;border:1.5px solid var(--border2);color:var(--ink);border-radius:var(--r);padding:10px 14px;width:100%;font-family:inherit;font-size:14px;outline:none;transition:border-color .18s;resize:vertical}
  .ta:focus{border-color:var(--indigo2);background:#fff;box-shadow:0 0 0 3px rgba(107,64,216,.1)}
  .card{background:var(--surface);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow-sm);border:1px solid var(--border)}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:var(--r);border:none;background:linear-gradient(135deg,#3B5BDB,#6B40D8);color:#fff;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .18s}
  .btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(107,64,216,.35)}
  .btn:disabled{opacity:.4;cursor:not-allowed}
  .btn-sm{background:#fff;color:var(--indigo2);border:1.5px solid var(--border2);padding:6px 14px;border-radius:var(--r-sm);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
  .btn-sm:hover{background:var(--sidebar);border-color:var(--indigo2)}
  .btn-ghost{background:transparent;border:1.5px solid var(--border);color:var(--ink3);padding:8px 16px;border-radius:var(--r);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
  .btn-ghost:hover{background:#F4F5FA;border-color:var(--ink4)}
  .check-row{display:flex;align-items:flex-start;gap:11px;padding:10px 12px;border-radius:var(--r);border:1.5px solid var(--border);margin-bottom:6px;transition:all .15s;background:white}
  .check-row:hover{border-color:var(--mauve);background:#FDFCFF}
  .check-row.done{background:#F0FDF4;border-color:#86efac;opacity:.8}
  .check-box{width:20px;height:20px;border-radius:6px;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;background:white}
  .check-box.done{background:linear-gradient(135deg,#059669,#16a34a);border-color:#059669}
  .tr{border-bottom:1px solid #f1f5f9;transition:background .12s;cursor:pointer}
  .tr:hover{background:#FDFCFF}
  .tr:last-child{border-bottom:none}
  .chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:600;background:var(--sidebar);color:var(--indigo2);border:1px solid var(--border2)}
  .fade{animation:fadeUp .25s ease forwards}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .section-title{font-size:22px;font-weight:800;color:var(--ink);margin-bottom:4px}
  .section-sub{font-size:12.5px;color:var(--ink4);font-weight:500;margin-bottom:16px}
  .kw-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;background:var(--sidebar);color:var(--indigo2);border:1px solid var(--border2)}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  .spin{animation:spin 1s linear infinite}
  @media print{.no-print{display:none!important}}
  .nav-item{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:9px;border:none;background:transparent;color:var(--ink3);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;width:100%;text-align:left;transition:all .15s;margin-bottom:2px}
  .nav-item:hover{background:#F0ECFF;color:var(--indigo2)}
  .nav-item.active{background:#F0ECFF;color:var(--indigo2);font-weight:700}
  .tab{padding:9px 16px;border:none;background:transparent;color:var(--ink4);font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;border-bottom:2.5px solid transparent;transition:all .15s;white-space:nowrap;margin-bottom:-1px}
  .tab:hover{color:var(--ink)}
  .tab.on{color:var(--indigo2);border-bottom-color:var(--indigo2)}
  .bar{height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;margin-top:4px}
  .bar-f{height:100%;border-radius:3px;transition:width .8s ease}
  .card-flush{background:var(--surface);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);border:1px solid var(--border);overflow:hidden}
  .btn-danger{background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca;padding:5px 12px;border-radius:var(--r-sm);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
  .btn-danger:hover{background:#fee2e2;border-color:#dc2626}
`;
const serif={fontFamily:"'DM Sans',sans-serif"};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [auth,       setAuth]       = useState(()=>sessionStorage.getItem("bto_auth")==="1");
  const [code,       setCode]       = useState("");
  const [authErr,    setAuthErr]    = useState("");
  const [page,       setPage]       = useState("dashboard");
  const [active,     setActive]     = useState(null);
  const [clients,    setClients]    = useState(()=>{ try{ return JSON.parse(localStorage.getItem("bto_clients")||"[]"); }catch{ return []; } });
  const [prospects,  setProspects]  = useState(()=>{ try{ return JSON.parse(localStorage.getItem("bto_prospects")||"[]"); }catch{ return []; } });
  const [apiKey,     setApiKey_]    = useState(()=>localStorage.getItem("bto_apikey")||"");
  const setApiKey    = v => { localStorage.setItem("bto_apikey", v); setApiKey_(v); };
  const [googleApiKey, setGoogleApiKey_] = useState(()=>localStorage.getItem("bto_google_key")||"");
  const setGoogleApiKey = v => { localStorage.setItem("bto_google_key", v); setGoogleApiKey_(v); };
  const [notifDelay, setNotifDelay] = useState(()=>parseInt(localStorage.getItem("bto_notif_delay")||"30"));
  const hasEnvKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  const save = list => { setClients(list); localStorage.setItem("bto_clients", JSON.stringify(list)); };
  const saveProspects = list => { setProspects(list); localStorage.setItem("bto_prospects", JSON.stringify(list)); };
  const upd  = list => { setClients(list); save(list); };
  const go   = (pg, client=null) => { setPage(pg); setActive(client); window.scrollTo(0,0); };

  const login = () => {
    if(code.trim()===ADMIN_CODE){ setAuth(true); sessionStorage.setItem("bto_auth","1"); setAuthErr(""); }
    else setAuthErr("Code incorrect");
  };

  const calcScore = scores => {
    if(!scores) return 0;
    return Math.round((ALL.reduce((s,c)=>scores[c.id]===true?s+c.points:s, 0)/TOTAL)*100);
  };

  const getLvl = score => LEVELS.find(l=>score>=l.min)||LEVELS[LEVELS.length-1];

  const sectorBenchmark = clients.reduce((acc,c)=>{
    const cat = (c.category||"Autre").split(",")[0].trim();
    if(!acc[cat]) acc[cat]={scores:[],count:0};
    acc[cat].scores.push(calcScore({...(c.scores||{}),...(c.manualOverrides||{})}));
    acc[cat].count++;
    return acc;
  },{});

  const notifCount = clients.filter(c=>{
    const last = c.history?.length>0?c.history[c.history.length-1].date:c.date;
    return Math.floor((Date.now()-new Date(last||0).getTime())/86400000) >= notifDelay;
  }).length;

  if(!auth) return <Login code={code} setCode={setCode} err={authErr} login={login}/>;

  const urgentTasks = clients.flatMap(c=>{
    const td=c.tasksDone||{};
    return ALL.filter(cr=>(c.scores||{})[cr.id]===false&&!td[cr.id])
      .slice(0,2).map(cr=>({clientName:c.name,clientId:c.id,client:c,task:cr.action,points:cr.points}));
  }).sort((a,b)=>b.points-a.points).slice(0,8);

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
      <style>{G}</style>
      <ErrorBoundary>
        <Sidebar page={page} active={active} clients={clients} go={go} getLvl={getLvl} calcScore={calcScore} notifCount={notifCount}/>
        <main style={{flex:1,overflowY:"auto",background:"#F4F5FA"}}>
          {active
            ? <ClientDetail client={active} clients={clients} upd={upd} go={go} getLvl={getLvl} calcScore={calcScore} hasEnvKey={hasEnvKey} apiKey={apiKey} sectorBenchmark={sectorBenchmark} googleApiKey={googleApiKey}/>
            : page==="dashboard"     ? <Dashboard clients={clients} urgentTasks={urgentTasks} go={go} getLvl={getLvl} calcScore={calcScore}/>
            : page==="clients"       ? <ClientsList clients={clients} upd={upd} go={go} getLvl={getLvl} calcScore={calcScore}/>
            : page==="audit"         ? <AuditForm clients={clients} upd={upd} go={go} hasEnvKey={hasEnvKey} apiKey={apiKey} setApiKey={setApiKey}/>
            : page==="prospects"     ? <ProspectionPage prospects={prospects} upd={p=>{setProspects(p);saveProspects(p);}} go={go} getLvl={getLvl} calcScore={calcScore} apiKey={apiKey}/>
            : page==="notifications" ? <NotificationsPage clients={clients} go={go} notifDelay={notifDelay} setNotifDelay={setNotifDelay} getLvl={getLvl} calcScore={calcScore}/>
            : page==="contenu"       ? <ContenuGMB clients={clients} upd={upd} go={go} getLvl={getLvl} calcScore={calcScore} apiKey={apiKey}/>
            : page==="mon_espace"    ? <MonEspacePage clients={clients} go={go} getLvl={getLvl} calcScore={calcScore} setAuth={setAuth} setGoogleApiKey={setGoogleApiKey}/>
            : page==="marche"        ? <MarchePage clients={clients}/>
            : page==="library"       ? <div style={{padding:"28px 32px",background:"#F4F5FA",minHeight:"100%"}} className="fade"><BibliothequeTab/></div>
            : null}
        </main>
      </ErrorBoundary>
    </div>
  );
}


function Login({code,setCode,err,login}){
  return(
    <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{G}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:58,height:58,borderRadius:16,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",boxShadow:"0 8px 28px rgba(99,102,241,.35)"}}>📍</div>
          <div style={{...serif,fontSize:28,color:"#0f172a",marginBottom:4}}>GMB Audit Pro</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>Plateforme SEO Local — Accès sécurisé</div>
        </div>
        <div className="card" style={{boxShadow:"0 4px 24px rgba(99,102,241,.1)",border:"1.5px solid #e0e7ff"}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}}>Code d accès</div>
          <input className="inp" type="password" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" autoFocus style={{marginBottom:err?8:16}}/>
          {err&&<div style={{fontSize:12.5,color:"#dc2626",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><span>⚠</span>{err}</div>}
          <button className="btn" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={login}>Accéder à la plateforme</button>
        </div>
        <div style={{textAlign:"center",marginTop:18,fontSize:12,color:"#94a3b8"}}>GMB Audit Pro · Expert SEO Local</div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({page,active,clients,go,getLvl,calcScore}){
  const NAV=[
    {id:"dashboard",label:"Tableau de bord",icon:"◈"},
    {id:"audit",    label:"Nouvel audit",   icon:"＋"},
    {id:"clients",  label:"Clients",        icon:"◻",count:clients.length},
    {id:"library",  label:"Bibliothèque",   icon:"◧"},
  ];
  const cur=active?"client":page;
  return(
    <aside style={{width:230,background:"#fff",display:"flex",flexDirection:"column",flexShrink:0,borderRight:"1px solid #e8edf5",boxShadow:"1px 0 4px rgba(0,0,0,.04)"}}>
      {/* Logo */}
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 4px 12px rgba(99,102,241,.3)"}}>📍</div>
          <div>
            <div style={{...serif,fontSize:15.5,color:"#0f172a",lineHeight:1.2}}>GMB Audit Pro</div>
            <div style={{fontSize:9.5,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:".7px"}}>SEO Local Expert</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:"10px 10px",overflowY:"auto"}}>
        <div style={{fontSize:9,color:"#cbd5e1",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"4px 12px 8px"}}>Menu</div>
        {NAV.map(n=>(
          <button key={n.id} className={`nav-item ${(cur===n.id&&!active)||(n.id==="clients"&&cur==="client")?"active":""}`} onClick={()=>go(n.id)}>
            <span style={{fontSize:14,opacity:.7}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.count>0&&<span style={{background:"#ede9fe",color:"#6366f1",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{n.count}</span>}
          </button>
        ))}
        {clients.length>0&&<>
          <div style={{fontSize:9,color:"#cbd5e1",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",padding:"14px 12px 8px"}}>Clients récents</div>
          {clients.slice(-5).reverse().map(c=>{
            const sc=calcScore(c.scores||{}); const ll=getLvl(sc);
            const done=Object.values(c.tasksDone||{}).filter(Boolean).length;
            const total=ALL.filter(cr=>(c.scores||{})[cr.id]===false).length;
            return(
              <button key={c.id} className={`nav-item ${active?.id===c.id?"active":""}`} onClick={()=>go("client",c)} style={{padding:"7px 12px",alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:7,background:(c.color||"#6366f1")+"18",border:`1px solid ${(c.color||"#6366f1")}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:1}}>{c.icon||"📍"}</div>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{fontSize:12.5,fontWeight:600,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                  {total>0&&<div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{done}/{total} tâches</div>}
                </div>
              </button>
            );
          })}
        </>}
      </nav>
      {/* Footer */}
      <div style={{padding:"12px 14px",borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>👤</div>
        <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:700,color:"#1e293b"}}>Admin</div><div style={{fontSize:10,color:"#94a3b8"}}>Accès complet</div></div>
      </div>
    </aside>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({clients,urgentTasks,go,getLvl,calcScore}){
  const scores=clients.map(c=>calcScore(c.scores||{}));
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  const ll=getLvl(avg);
  return(
    <div style={{padding:"28px 32px"}} className="fade">
      <div style={{marginBottom:24}}>
        <div style={{...serif,fontSize:30,color:"#0f172a",marginBottom:2}}>Tableau de bord</div>
        <div style={{fontSize:13,color:"#94a3b8"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      </div>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {[
          {label:"Clients",         value:clients.length,                              sub:"fiches actives",    bg:"#ede9fe",bc:"#c4b5fd",vc:"#6366f1"},
          {label:"Score moyen",     value:avg?`${avg}%`:"—",                          sub:ll.label||"—",       bg:ll.bg,    bc:ll.border, vc:ll.color},
          {label:"Tâches urgentes", value:urgentTasks.length,                         sub:"à réaliser",        bg:"#fff7ed",bc:"#fed7aa",  vc:"#ea580c"},
          {label:"Fiches critiques",value:scores.filter(s=>s<55).length,              sub:"score < 55",        bg:"#fef2f2",bc:"#fecaca",  vc:"#dc2626"},
        ].map(s=>(
          <div key={s.label} className="card" style={{border:`1.5px solid ${s.bc}`,background:s.bg}}>
            <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:32,fontWeight:800,color:s.vc,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:5}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16}}>
        {/* Tâches urgentes */}
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{...serif,fontSize:19}}>Prochaines tâches</div>
            <button className="btn-sm" onClick={()=>go("clients")}>Voir les clients</button>
          </div>
          {urgentTasks.length===0?(
            <div style={{textAlign:"center",padding:"32px 0",color:"#94a3b8"}}>
              <div style={{fontSize:28,marginBottom:8}}>✓</div>
              <div style={{fontSize:13.5,fontWeight:600,color:"#16a34a"}}>Tout est à jour !</div>
            </div>
          ):urgentTasks.map((t,i)=>(
            <div key={i} onClick={()=>go("client",t.client)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,background:"#fafbff",border:"1px solid #e8edf5",marginBottom:7,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#c7d2fe";e.currentTarget.style.background="#f5f3ff";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e8edf5";e.currentTarget.style.background="#fafbff";}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#6366f1",flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:600,color:"#1e293b",marginBottom:1}}>{t.task}</div>
                <div style={{fontSize:11.5,color:"#6366f1",fontWeight:600}}>{t.clientName}</div>
              </div>
              <span style={{fontSize:10.5,background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:6,padding:"2px 7px",fontWeight:700,flexShrink:0}}>−{t.points}pts</span>
            </div>
          ))}
        </div>
        {/* Clients récents */}
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{...serif,fontSize:19}}>Clients récents</div>
            <button className="btn-sm" onClick={()=>go("clients")}>Tout voir</button>
          </div>
          {clients.length===0?(
            <div style={{textAlign:"center",padding:"28px 0"}}>
              <div style={{fontSize:36,marginBottom:10}}>📋</div>
              <div style={{...serif,fontSize:18,marginBottom:10}}>Aucun client</div>
              <button className="btn" style={{justifyContent:"center"}} onClick={()=>go("audit")}>Lancer un audit</button>
            </div>
          ):clients.slice(-5).reverse().map(c=>{
            const sc=calcScore(c.scores||{}); const ll=getLvl(sc);
            const done=Object.values(c.tasksDone||{}).filter(Boolean).length;
            const total=ALL.filter(cr=>(c.scores||{})[cr.id]===false).length;
            const pct=total>0?Math.round((done/total)*100):100;
            return(
              <div key={c.id} onClick={()=>go("client",c)} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer",transition:"opacity .12s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=".75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                <div style={{width:36,height:36,borderRadius:9,background:ll.bg,border:`1.5px solid ${ll.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:ll.color,flexShrink:0}}>{sc}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{c.name}</div>
                  <div style={{height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#16a34a":"#6366f1",borderRadius:2,transition:"width .6s"}}/>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{pct}%</div>
              </div>
            );
          })}
          {clients.length>0&&<button className="btn" style={{marginTop:16,width:"100%",justifyContent:"center"}} onClick={()=>go("audit")}>+ Nouvel audit</button>}
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT FORM ───────────────────────────────────────────────────────────────
const ICONS  = ["📍","🏠","🍕","💇","🔧","🪵","💧","🏋️","🛒","🏥","🎓","🚗","🌿","🍽️","💼"];
const COLORS = ["#6366f1","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#ea580c","#0d9488","#1d4ed8"];

function AuditForm({clients,upd,go,hasEnvKey,apiKey,setApiKey}){
  const [name,    setName]    = useState("");
  const [category,setCategory]= useState("");
  const [city,    setCity]    = useState("");
  const [email,   setEmail]   = useState("");
  const [icon,    setIcon]    = useState("📍");
  const [color,   setColor]   = useState("#6366f1");
  const [text,    setText]    = useState("");
  const [phase,   setPhase]   = useState("form");
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState("");
  const STEPS=["Lecture de la fiche…","Extraction des données…","Analyse des critères…","Mots-clés & concurrence…","Génération du rapport…"];
  useEffect(()=>{if(phase!=="loading")return;const t=setInterval(()=>setStep(s=>Math.min(s+1,STEPS.length-1)),1200);return()=>clearInterval(t);},[phase]);
  useEffect(()=>{
    const p=window._prospectToAudit;
    if(p){
      if(p.name) setName(p.name);
      if(p.category) setCategory(p.category);
      if(p.city) setCity(p.city);
      if(p.email) setEmail(p.email||"");
      window._prospectToAudit=null;
    }
  },[]);

  const submit=async()=>{
    if(!text.trim()||(!hasEnvKey&&!apiKey.trim()))return;
    setError("");setPhase("loading");setStep(0);
    try{
      const r=await runAudit(name,text,apiKey);
      const nx={...initScores()};
      Object.entries(r.scores||{}).forEach(([k,v])=>{if(k in nx)nx[k]=v;});
      const clientName=name||r.extracted?.name||"Client";
      const nc={id:Date.now().toString(),name:clientName,category:category||r.extracted?.category||"",city:city||r.extracted?.city||"",email,icon,color,date:new Date().toISOString(),scores:nx,data:r,tasksDone:{},history:[],perf:null,weeklyNotes:""};
      upd([...clients,nc]);
      go("client",nc);
    }catch(e){setError(e.message);setPhase("form");}
  };

  if(phase==="loading") return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:28,background:"#f1f5f9"}} className="fade">
      <div style={{width:64,height:64,borderRadius:"50%",border:"3px solid #e2e8f0",borderTop:"3px solid #6366f1",animation:"spin 1s linear infinite"}} className="spin"/>
      <div style={{textAlign:"center"}}>
        <div style={{...serif,fontSize:24,color:"#0f172a",marginBottom:8}}>Analyse en cours…</div>
        <div style={{fontSize:14,color:"#64748b",minHeight:22}}>{STEPS[step]}</div>
        <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>Mots-clés · Concurrence · Roadmap</div>
      </div>
      <div style={{width:280,height:3,background:"#e2e8f0",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)",backgroundSize:"200%",animation:"shimmer 1.4s infinite linear",borderRadius:2}}/>
      </div>
      <div style={{display:"flex",gap:6}}>
        {STEPS.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<=step?"#6366f1":"#e2e8f0",transition:"background .3s"}}/>)}
      </div>
    </div>
  );

  return(
    <div style={{background:"#f1f5f9",minHeight:"100%",overflowY:"auto"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"40px 20px"}} className="fade">

        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:20,padding:"5px 14px",fontSize:12,color:"#7c3aed",fontWeight:600,marginBottom:16}}>
            ✨ Propulsé par Claude IA
          </div>
          <div style={{...serif,fontSize:34,lineHeight:1.25,marginBottom:10,color:"#0f172a"}}>
            Auditez votre fiche GMB<br/><span style={{color:"#6366f1",fontStyle:"italic"}}>en quelques secondes</span>
          </div>
          <p style={{color:"#64748b",fontSize:14,lineHeight:1.75}}>
            Collez le contenu de votre fiche — l IA génère un rapport complet :<br/>
            audit {ALL.length} critères · mots-clés · concurrence · avis · posts · roadmap 3 mois
          </p>
        </div>

        <div className="card" style={{boxShadow:"0 4px 24px rgba(99,102,241,.1)",border:"1.5px solid #e0e7ff"}}>

          {/* API key */}
          {!hasEnvKey&&(
            <div style={{marginBottom:20,padding:"12px 14px",background:"#fffbeb",borderRadius:10,border:"1px solid #fde68a"}}>
              <div style={{fontSize:11,color:"#92400e",marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Clé API Anthropic</div>
              <input className="inp" type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-ant-api03-…"/>
            </div>
          )}

          {/* Infos client — ligne 1 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Nom de l établissement <span style={{color:"#6366f1"}}>*</span></div>
              <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex : Menuiserie Dupont"/>
            </div>
            <div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Catégorie métier</div>
              <input className="inp" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex : Menuisier, Plombier…"/>
            </div>
          </div>

          {/* Infos client — ligne 2 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
            <div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Ville</div>
              <input className="inp" value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex : Vannes, Rennes…"/>
            </div>
            <div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Email client</div>
              <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@email.com"/>
            </div>
          </div>

          {/* Icône + Couleur — ligne compacte */}
          <div style={{background:"#f8fafc",borderRadius:11,padding:"14px 16px",marginBottom:18,border:"1px solid #e8edf5"}}>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              {/* Icône */}
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Icône</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {ICONS.map(ic=>(
                    <button key={ic} onClick={()=>setIcon(ic)} style={{width:32,height:32,borderRadius:8,fontSize:16,border:`2px solid ${icon===ic?color:"#e2e8f0"}`,background:icon===ic?color+"18":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .12s"}}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {/* Séparateur */}
              <div style={{width:1,height:60,background:"#e2e8f0",flexShrink:0}}/>
              {/* Couleur */}
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Couleur</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setColor(c)} style={{width:24,height:24,borderRadius:6,background:c,border:`2.5px solid ${color===c?"#0f172a":"transparent"}`,cursor:"pointer",transition:"all .12s"}}/>
                  ))}
                </div>
              </div>
              {/* Séparateur */}
              <div style={{width:1,height:60,background:"#e2e8f0",flexShrink:0}}/>
              {/* Preview */}
              <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderRadius:10,background:color+"14",border:`1.5px solid ${color}33`,flexShrink:0}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:12.5,color,lineHeight:1.2}}>{name||"Client"}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{city||"Ville"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fiche GMB */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",display:"flex",justifyContent:"space-between"}}>
              <span>Contenu de la fiche GMB <span style={{color:"#6366f1"}}>*</span></span>
              {text.length>0&&<span style={{color:"#6366f1",fontFamily:"monospace",fontWeight:600}}>{text.length} car.</span>}
            </div>
            <textarea className="ta" rows={14} value={text} onChange={e=>setText(e.target.value)}
              placeholder={`Collez ici TOUTES les informations de la fiche Google My Business :\n\nNom : Menuiserie Dupont\nCatégorie : Woodworker\nAdresse : 12 rue des Artisans, 56000 Vannes\nTéléphone : 06 XX XX XX XX\nSite web : https://…\nHoraires : Lun-Ven 8h–18h\nDescription : texte de la description…\nNote : 4.3/5 — 47 avis\nPhotos : 15 photos\nGoogle Posts : actifs / absents\nQ&R : présentes / absentes\nCatégories secondaires : …\nServices : …\nConcurrents connus : [noms si connus]`}/>
          </div>

          {/* Ce rapport inclut */}
          <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:18,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:11,color:"#94a3b8",fontWeight:700,marginBottom:8,letterSpacing:".4px",textTransform:"uppercase"}}>Ce rapport inclut</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["📊 Score audit","🔍 Mots-clés","⚔️ Concurrence","⭐ Analyse avis","📢 Posts GMB","🗓️ Roadmap 3 mois"].map(t=>(
                <span key={t} className="chip" style={{fontSize:12}}>{t}</span>
              ))}
            </div>
          </div>

          {error&&<div style={{marginBottom:16,background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"11px 14px",fontSize:13,color:"#dc2626",display:"flex",gap:8}}><span>⚠️</span><span>{error}</span></div>}

          <button className="btn" onClick={submit} disabled={!text.trim()||(!hasEnvKey&&!apiKey.trim())} style={{fontSize:14}}>
            ✨ Générer l audit complet →
          </button>
          {!text.trim()&&<div style={{textAlign:"center",fontSize:12,color:"#cbd5e1",marginTop:7}}>Collez le contenu de la fiche pour démarrer</div>}
        </div>
      </div>
    </div>
  );
}


// ─── CLIENTS LIST ─────────────────────────────────────────────────────────────
function ClientsList({clients,upd,go,getLvl,calcScore}){
  const [search,setSearch]=useState("");
  const del=id=>{if(!confirm("Supprimer ce client ?"))return;upd(clients.filter(c=>c.id!==id));};
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.city?.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{padding:"28px 32px"}} className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <div style={{...serif,fontSize:30,color:"#0f172a",marginBottom:2}}>Clients</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{clients.length} fiche{clients.length>1?"s":""} enregistrée{clients.length>1?"s":""}</div>
        </div>
        <button className="btn" onClick={()=>go("audit")}>+ Nouvel audit</button>
      </div>
      {clients.length>0&&<div style={{marginBottom:14}}>
        <input className="inp" style={{maxWidth:300,background:"#fff"}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou ville…"/>
      </div>}
      {filtered.length===0?(
        <div className="card" style={{textAlign:"center",padding:"56px 24px",border:"2px dashed #e8edf5"}}>
          <div style={{fontSize:36,marginBottom:12}}>📋</div>
          <div style={{...serif,fontSize:20,marginBottom:10}}>Aucun client</div>
          <button className="btn" style={{justifyContent:"center"}} onClick={()=>go("audit")}>Lancer un audit</button>
        </div>
      ):(
        <div className="card-flush">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e8edf5"}}>
              {["Client","Ville","Score","Progression","Dernier suivi",""].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".4px"}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(c=>{
                const sc=calcScore(c.scores||{}); const ll=getLvl(sc);
                const done=Object.values(c.tasksDone||{}).filter(Boolean).length;
                const total=ALL.filter(cr=>(c.scores||{})[cr.id]===false).length;
                const pct=total>0?Math.round((done/total)*100):100;
                const h=c.history||[];
                const prevSc=h.length>0?calcScore(h[h.length-1].scores||{}):null;
                const diff=prevSc!==null?sc-prevSc:null;
                return(
                  <tr key={c.id} className="tr" onClick={()=>go("client",c)}>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{fontWeight:700,fontSize:13.5,color:"#0f172a"}}>{c.name}</div>
                      {c.category&&<div style={{fontSize:11.5,color:"#94a3b8",marginTop:1}}>{c.category}</div>}
                    </td>
                    <td style={{padding:"13px 16px",fontSize:13,color:"#64748b"}}>{c.city||"—"}</td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:36,height:36,borderRadius:9,background:ll.bg,border:`1.5px solid ${ll.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:ll.color}}>{sc}</div>
                        <div>
                          <div style={{fontSize:12,color:ll.color,fontWeight:600}}>{ll.label}</div>
                          {diff!==null&&<div style={{fontSize:11,fontWeight:700,color:diff>0?"#16a34a":diff<0?"#dc2626":"#94a3b8"}}>{diff>0?"+":""}{diff} pts</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"13px 16px",minWidth:130}}>
                      <div style={{fontSize:11.5,color:pct===100?"#16a34a":"#64748b",fontWeight:600,marginBottom:4}}>{done}/{total} tâches</div>
                      <div style={{width:90,height:4,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#16a34a":"#6366f1",borderRadius:2}}/>
                      </div>
                    </td>
                    <td style={{padding:"13px 16px",fontSize:12,color:"#94a3b8"}}>{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                    <td style={{padding:"13px 16px"}} onClick={e=>e.stopPropagation()}>
                      <button className="btn-danger" onClick={()=>del(c.id)}>Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({client,clients,upd,go,getLvl,calcScore,hasEnvKey,apiKey,sectorBenchmark,googleApiKey}){
  const [tab,       setTab]      = useState("overview");
  const [anim,      setAnim]     = useState(0);
  const [expC,      setExpC]     = useState(null);
  const [copyId,    setCopyId]   = useState(null);
  const [showReport,setShowReport]=useState(false);
  const [showUpdate,setShowUpdate]=useState(false);
  const [showEdit,  setShowEdit] = useState(false);

  const scores   = client.scores||{};
  const data     = client.data||{};
  const tasksDone= client.tasksDone||{};
  const score    = calcScore(scores);
  const ll       = getLvl(score);
  const failed   = ALL.filter(c=>scores[c.id]===false).sort((a,b)=>b.points-a.points);
  const doneCount= Object.values(tasksDone).filter(Boolean).length;
  const pct      = failed.length>0?Math.round((doneCount/failed.length)*100):100;
  const ext      = data.extracted||{};
  const insights = data.insights||{};
  const kw       = data.keywords||{};
  const reviews  = data.reviews||{};
  const qa       = data.qa||{};
  const roadmap  = data.roadmap||{};
  const history  = client.history||[];
  const prevScore= history.length>0?calcScore(history[history.length-1].scores||{}):null;
  const diff     = prevScore!==null?score-prevScore:null;

  useEffect(()=>{let v=0;const t=setInterval(()=>{v+=score/60;if(v>=score){setAnim(score);clearInterval(t);}else setAnim(Math.round(v));},16);return()=>clearInterval(t);},[score]);

  const toggleTask=id=>{
    const nd={...tasksDone,[id]:!tasksDone[id]};
    const updated=clients.map(c=>c.id===client.id?{...c,tasksDone:nd}:c);
    upd(updated); client.tasksDone=nd;
  };

  const TABS=[
    {id:"overview",    label:"Vue d ensemble"},
    {id:"performance", label:"Performance"},
    {id:"tasks",       label:`Taches · ${doneCount}/${failed.length}`},
    {id:"categories",  label:"Catégories & Services"},
    {id:"keywords",    label:"Mots-clés"},
    {id:"competitors", label:"Concurrence"},
    {id:"reviews",     label:"Avis"},
    {id:"posts",       label:"Idées posts"},
    {id:"roadmap",     label:"Roadmap"},
    {id:"visibilite",  label:"Visibilité"},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      {/* ── HEADER ── */}
      <div className="no-print" style={{background:"#fff",borderBottom:"1px solid #e8edf5",padding:"0 24px",flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0 8px",borderBottom:"1px solid #f1f5f9"}}>
          <button className="btn-ghost" onClick={()=>go("clients")} style={{fontSize:12}}>← Clients</button>
          <div style={{width:1,height:18,background:"#e2e8f0"}}/>
          {(client.icon||client.color)&&<div style={{width:30,height:30,borderRadius:8,background:(client.color||"#6366f1")+"18",border:`1.5px solid ${(client.color||"#6366f1")}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{client.icon||"📍"}</div>}
          <div style={{...serif,fontSize:17,color:"#0f172a"}}>{client.name}</div>
          {client.city&&<span style={{fontSize:12,color:"#94a3b8"}}>· {client.city}</span>}
          {client.category&&<span className="chip" style={{marginLeft:2}}>{client.category}</span>}
          <div style={{marginLeft:"auto",display:"flex",gap:7,alignItems:"center"}}>
            {diff!==null&&<span style={{fontSize:11.5,fontWeight:700,color:diff>0?"#16a34a":diff<0?"#dc2626":"#94a3b8",background:diff>0?"#f0fdf4":diff<0?"#fef2f2":"#f8fafc",border:`1px solid ${diff>0?"#bbf7d0":diff<0?"#fecaca":"#e2e8f0"}`,borderRadius:20,padding:"3px 10px"}}>{diff>0?"+":""}{diff} pts</span>}
            <span style={{background:ll.bg,border:`1.5px solid ${ll.border}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:ll.color}}>{score}/100 · {ll.label}</span>
            <button className="btn-sm" onClick={()=>setShowEdit(true)}>✏️ Modifier</button>
            <button className="btn-sm" onClick={()=>setShowUpdate(true)}>↺ Mettre à jour</button>
            <button className="btn-sm" onClick={()=>setShowReport(true)}>Rapport</button>
            <button className="btn-sm" onClick={()=>window.print()}>PDF</button>
          </div>
        </div>
        {/* Tabs + progress */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,paddingRight:10,borderRight:"1px solid #e8edf5"}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:600}}>{pct}%</div>
            <div style={{width:60,height:4,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#16a34a":"#6366f1",borderRadius:2,transition:"width .5s"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:2,overflowX:"auto",flex:1}}>
            {TABS.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}} className="fade">

        {/* OVERVIEW */}
        {tab==="overview"&&<div className="fade">
          {/* ── HERO — style BeTheOne exact ── */}
          <div style={{background:`linear-gradient(135deg,${ll.bg},#fff)`,border:`1.5px solid ${ll.border}`,borderRadius:16,padding:"28px",marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,.05)"}}>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:14,fontWeight:500}}>
              Audit GMB · <strong style={{color:"#1e293b"}}>{client.name}</strong>
              {client.city&&<> · <strong style={{color:"#1e293b"}}>{client.city}</strong></>}
              {" · "}{new Date(client.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
            </div>

            {/* Chips infos extraites */}
            {Object.keys(ext).length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:22}}>
                {ext.category    &&<span className="chip">🏷️ {ext.category}</span>}
                {ext.address     &&<span className="chip">📍 {ext.address}</span>}
                {ext.phone       &&<span className="chip">📞 {ext.phone}</span>}
                {ext.website&&ext.website!=="Absent"&&<span className="chip">🌐 {ext.website}</span>}
                {ext.rating      &&<span className="chip">⭐ {ext.rating}</span>}
                {ext.reviewCount &&(()=>{
                  const prev=history.length>0?history[history.length-1]:null;
                  const rd=prev?parseInt(ext.reviewCount||0)-parseInt(prev.data?.extracted?.reviewCount||0):null;
                  return<span className="chip">💬 {ext.reviewCount} avis{rd!==null&&rd!==0&&<span style={{fontWeight:700,color:rd>0?"#16a34a":"#dc2626",marginLeft:4}}>{rd>0?"+":""}{rd}</span>}</span>;
                })()}
                {ext.photoCount&&ext.photoCount!=="Non renseigné"&&<span className="chip">📸 {ext.photoCount} photos</span>}
                {ext.postsCount  &&<span className="chip">📢 {ext.postsCount} posts</span>}

              </div>
            )}

            <div style={{display:"flex",alignItems:"center",gap:44,flexWrap:"wrap"}}>
              {/* Score SVG */}
              <svg width="144" height="144" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#e2e8f0" strokeWidth="11"/>
                <circle cx="72" cy="72" r="60" fill="none" stroke={ll.color} strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*60}`}
                  strokeDashoffset={`${2*Math.PI*60*(1-anim/100)}`}
                  transform="rotate(-90 72 72)"
                  style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
                <text x="72" y="67" textAnchor="middle" fill={ll.color} fontSize="34" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">{anim}</text>
                <text x="72" y="86" textAnchor="middle" fill="#94a3b8" fontSize="12">/100</text>
              </svg>

              {/* Label + évolution */}
              <div>
                <div style={{...serif,fontSize:38,color:ll.color,marginBottom:4}}>{ll.label}</div>
                <div style={{fontSize:14,color:"#64748b",marginBottom:20}}>{ll.desc}</div>
                {diff!==null&&<div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:`1px solid ${ll.border}`,borderRadius:20,padding:"5px 14px",marginBottom:16}}>
                  <span style={{fontSize:13,fontWeight:800,color:diff>0?"#16a34a":diff<0?"#dc2626":"#64748b"}}>{diff>0?"+":""}{diff} pts</span>
                  <span style={{fontSize:12,color:"#64748b"}}>vs audit précédent</span>
                  <span style={{fontSize:14}}>{diff>0?"📈":diff<0?"📉":"→"}</span>
                </div>}
                <div style={{display:"flex",gap:14}}>
                  {[
                    {v:ALL.reduce((s,c)=>scores[c.id]===true?s+c.points:s,0), c:"#059669",bg:"#ecfdf5",b:"#a7f3d0",l:"pts gagnés"},
                    {v:TOTAL-ALL.reduce((s,c)=>scores[c.id]===true?s+c.points:s,0), c:"#dc2626",bg:"#fef2f2",b:"#fecaca",l:"pts manquants"},
                    {v:failed.length, c:"#6366f1",bg:"#f5f3ff",b:"#ddd6fe",l:"à améliorer"},
                  ].map(({v,c,bg,b,l})=>(
                    <div key={l} style={{background:bg,border:`1px solid ${b}`,borderRadius:12,padding:"10px 18px",textAlign:"center"}}>
                      <div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:2,fontWeight:500}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 3 PILIERS — style BeTheOne exact ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
            {[
              {label:"Pertinence", icon:"🎯", cats:["identity","description"], desc:"Catégorie, description, mots-clés", col:"#6366f1",bg:"#f5f3ff",b:"#ddd6fe"},
              {label:"Proximité",  icon:"📍", cats:["contact"],               desc:"Adresse, zone, horaires, NAP",   col:"#0891b2",bg:"#ecfeff",b:"#a5f3fc"},
              {label:"Notoriété",  icon:"⭐", cats:["reviews","photos","posts"], desc:"Avis, photos, publications", col:"#d97706",bg:"#fffbeb",b:"#fde68a"},
            ].map(({label,icon,cats,desc,col,bg,b})=>{
              const rel=CATS.filter(c=>cats.includes(c.id));
              const tot=rel.flatMap(c=>c.criteria).reduce((s,c)=>s+c.points,0);
              const got=rel.flatMap(c=>c.criteria).reduce((s,c)=>scores[c.id]===true?s+c.points:s,0);
              const pct=Math.round((got/tot)*100);
              const lv=getLvl(pct);
              // Évolution vs audit précédent
              const prev=history.length>0?history[history.length-1]:null;
              const prevPct=prev?(()=>{
                const prevScores=prev.scores||{};
                const pg=rel.flatMap(c=>c.criteria).reduce((s,c)=>prevScores[c.id]===true?s+c.points:s,0);
                return Math.round((pg/tot)*100);
              })():null;
              const pillarDiff=prevPct!==null?pct-prevPct:null;
              return(
                <div key={label} className="card" style={{borderTop:`3px solid ${col}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <div style={{width:36,height:36,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
                    <div style={{fontWeight:700,fontSize:14}}>{label}</div>
                    <span style={{marginLeft:"auto",fontSize:22,fontWeight:800,color:lv.color}}>{pct}%</span>
                    {pillarDiff!==null&&pillarDiff!==0&&<span style={{fontSize:11,fontWeight:700,color:pillarDiff>0?"#16a34a":"#dc2626",marginLeft:2}}>{pillarDiff>0?"+":""}{pillarDiff}</span>}
                  </div>
                  <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,fontWeight:500}}>{desc}</div>
                  <div className="bar"><div className="bar-f" style={{width:`${pct}%`,background:lv.color}}/></div>
                </div>
              );
            })}
          </div>

          {/* ── ANALYSE IA — style BeTheOne exact ── */}
          {insights.summary&&(
            <div className="card" style={{borderTop:"3px solid #6366f1",marginBottom:16}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
                <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>✨</div>
                <div style={{...serif,fontSize:19}}>Analyse IA</div>
              </div>
              <p style={{fontSize:14,color:"#475569",lineHeight:1.75,marginBottom:18,background:"#f8faff",borderLeft:"3px solid #6366f1",padding:"12px 14px",borderRadius:"0 8px 8px 0"}}>{insights.summary}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                {[
                  {title:"✅ Points forts",  items:insights.strengths,  c:"#059669",bg:"#ecfdf5",b:"#a7f3d0"},
                  {title:"⚠️ Faiblesses",   items:insights.weaknesses, c:"#dc2626",bg:"#fef2f2",b:"#fecaca"},
                  {title:"⚡ Quick wins",    items:insights.quickWins,  c:"#d97706",bg:"#fffbeb",b:"#fde68a"},
                ].map(({title,items,c,bg,b})=>items?.length>0&&(
                  <div key={title} style={{background:bg,borderRadius:10,padding:"14px",border:`1px solid ${b}`}}>
                    <div style={{fontSize:12,color:c,fontWeight:700,marginBottom:10}}>{title}</div>
                    {items.map((s,i)=>(
                      <div key={i} style={{fontSize:12.5,color:"#374151",marginBottom:6,display:"flex",gap:7,lineHeight:1.5}}>
                        <span style={{color:c,fontSize:9,marginTop:4,flexShrink:0}}>●</span>{s}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIONS PRIORITAIRES — style BeTheOne exact ── */}
          {failed.length>0&&(
            <div className="card" style={{borderTop:"3px solid #ea580c"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{...serif,fontSize:19}}>🎯 Actions prioritaires</div>
                <button className="btn-sm" onClick={()=>setTab("tasks")}>Voir toutes les tâches →</button>
              </div>
              <div style={{display:"grid",gap:8}}>
                {failed.slice(0,5).map((c,i)=>{
                  const u=c.points>=5?{c:"#dc2626",bg:"#fef2f2",b:"#fecaca"}:c.points>=4?{c:"#ea580c",bg:"#fff7ed",b:"#fed7aa"}:{c:"#d97706",bg:"#fffbeb",b:"#fde68a"};
                  return(
                    <div key={c.id} style={{background:u.bg,borderRadius:9,padding:"11px 14px",display:"flex",gap:11,border:`1px solid ${u.b}`,borderLeft:`4px solid ${u.c}`}}>
                      <div style={{width:24,height:24,borderRadius:6,background:"#fff",border:`1.5px solid ${u.b}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:u.c,flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:2}}>{c.label} <span style={{fontSize:11,color:u.c,fontWeight:600}}>−{c.points}pts</span></div>
                        <div style={{fontSize:12.5,color:"#64748b"}}>{c.desc||c.action}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>}

        {/* PERFORMANCE */}
        {tab==="performance"&&<PerformanceTab client={client} clients={clients} upd={upd} calcScore={calcScore} getLvl={getLvl}/>}

        {/* TÂCHES */}
        {tab==="tasks"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
            <div>
              <div style={{...serif,fontSize:24,marginBottom:2}}>Suivi des tâches & Critères</div>
              <div style={{fontSize:12.5,color:"#94a3b8"}}>Vert = critère OK · Cases à cocher = actions à réaliser</div>
            </div>
            <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:12,padding:"10px 18px",textAlign:"center",color:"#fff"}}>
              <div style={{fontSize:22,fontWeight:800}}>{pct}%</div>
              <div style={{fontSize:10.5,opacity:.8}}>progression</div>
            </div>
          </div>
          <div style={{height:5,background:"#e8edf5",borderRadius:3,overflow:"hidden",marginBottom:20}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#6366f1,#16a34a)",borderRadius:3,transition:"width .6s"}}/>
          </div>
          {CATS.map(cat=>{
            const catFailed=cat.criteria.filter(c=>scores[c.id]===false);
            const catOk=cat.criteria.filter(c=>scores[c.id]===true);
            const catNull=cat.criteria.filter(c=>scores[c.id]===null);
            if(!catFailed.length&&!catOk.length&&!catNull.length)return null;
            const catDone=catFailed.filter(c=>tasksDone[c.id]).length;
            return(
              <div key={cat.id} className="card" style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <span style={{fontSize:18}}>{cat.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13.5}}>{cat.label}</div>
                    <div style={{fontSize:10.5,color:"#94a3b8"}}>{cat.type==="static"?"Statique":"Dynamique"}</div>
                  </div>
                  <span style={{fontSize:11.5,color:"#16a34a",fontWeight:700}}>{catOk.length} OK</span>
                  <span style={{fontSize:11,color:"#94a3b8"}}>·</span>
                  <span style={{fontSize:11.5,color:"#6366f1",fontWeight:700}}>{catDone}/{catFailed.length} faites</span>
                </div>
                {catOk.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,background:"#f0fdf4",border:"1px solid #bbf7d0",marginBottom:5}}>
                    <div style={{width:18,height:18,borderRadius:5,background:"#22c55e",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span></div>
                    <span style={{flex:1,fontSize:12.5,fontWeight:600,color:"#15803d"}}>{c.label}</span>
                    <span style={{fontSize:10.5,color:"#16a34a",fontWeight:700}}>+{c.points}pts</span>
                  </div>
                ))}
                {catFailed.map(c=>(
                  <div key={c.id} className={`check-row ${tasksDone[c.id]?"done":""}`} onClick={()=>toggleTask(c.id)}>
                    <div className={`check-box ${tasksDone[c.id]?"done":""}`}>{tasksDone[c.id]&&<span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span>}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:tasksDone[c.id]?"#15803d":"#1e293b",textDecoration:tasksDone[c.id]?"line-through":"none",marginBottom:2}}>{c.label} <span style={{fontSize:10,color:tasksDone[c.id]?"#16a34a":"#dc2626",fontWeight:700}}>−{c.points}pts</span></div>
                      <div style={{fontSize:11.5,color:"#64748b"}}>{c.action}</div>
                    </div>
                  </div>
                ))}
                {catNull.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,background:"#f8fafc",border:"1px solid #e8edf5",marginBottom:5,opacity:.55}}>
                    <div style={{width:18,height:18,borderRadius:5,background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:9,color:"#94a3b8"}}>?</span></div>
                    <span style={{flex:1,fontSize:12,color:"#94a3b8"}}>{c.label}</span>
                    <span style={{fontSize:10,color:"#94a3b8"}}>+{c.points}pts</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>}

        {/* CATÉGORIES */}
        {tab==="categories"&&<CategoriesTab data={data} client={client} clients={clients} upd={upd} apiKey={apiKey}/>}

        {/* MOTS-CLÉS */}
        {tab==="keywords"&&<div className="fade">
          <div className="section-title">🔍 Stratégie mots-clés</div>
          <div className="section-sub">Positionnement actuel et mots-clés cibles pour le TOP 3 local</div>

          {/* Zones géo */}
          {(kw.geoZones||[]).length>0&&<div className="card" style={{marginBottom:16,borderTop:"3px solid #6366f1"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"#0f172a"}}>Zones géographiques prioritaires</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {kw.geoZones.map((z,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,background:i===0?"#f5f3ff":"#f8fafc",border:`1.5px solid ${i===0?"#6366f1":"#e2e8f0"}`,borderRadius:20,padding:"6px 14px"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ede9fe"][i]||"#e2e8f0",flexShrink:0}}/>
                  <span style={{fontSize:12.5,fontWeight:600,color:i===0?"#4338ca":"#374151"}}>{z}</span>
                  {i===0&&<span style={{fontSize:9,background:"#6366f1",color:"#fff",borderRadius:4,padding:"1px 6px",fontWeight:700}}>PRIORITÉ 1</span>}
                </div>
              ))}
            </div>
          </div>}

          {/* Principaux */}
          <div className="card" style={{marginBottom:16,borderTop:"3px solid #6366f1"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#0f172a"}}>Mots-clés principaux — Fort volume</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["MOT-CLÉ","VOLUME/MOIS","CONCURRENCE","PRIORITÉ","POSITION ACTUELLE"].map(h=>(
                      <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:".3px",borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(kw.primary||[]).map((k,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"10px 12px",fontWeight:600,color:"#0f172a"}}>{k.kw}</td>
                      <td style={{padding:"10px 12px",color:"#475569"}}>{k.volume}</td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:k.competition==="Forte"?"#fef2f2":k.competition==="Moyenne"?"#fffbeb":"#f0fdf4",color:k.competition==="Forte"?"#dc2626":k.competition==="Moyenne"?"#d97706":"#059669"}}>{k.competition}</span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:k.priority==="TOP"?"#eff6ff":"#f8fafc",color:k.priority==="TOP"?"#2563eb":"#475569"}}>{k.priority}</span>
                      </td>
                      <td style={{padding:"10px 12px",color:k.currentPosition==="Hors TOP 10"?"#ea580c":k.currentPosition==="Non classé"?"#dc2626":"#059669",fontWeight:600,fontSize:12}}>{k.currentPosition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secondaires */}
          {(kw.secondary||[]).length>0&&<div className="card" style={{marginBottom:16,borderTop:"3px solid #0891b2"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#0f172a"}}>Mots-clés secondaires — Gains rapides</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc"}}>
                    {["MOT-CLÉ","VOLUME/MOIS","CONCURRENCE","PRIORITÉ","POSITION ACTUELLE"].map(h=>(
                      <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:".3px",borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(kw.secondary||[]).map((k,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"10px 12px",fontWeight:600,color:"#0f172a"}}>{k.kw}</td>
                      <td style={{padding:"10px 12px",color:"#475569"}}>{k.volume}</td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#f0fdf4",color:"#059669"}}>{k.competition}</span>
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#ecfdf5",color:"#059669"}}>{k.priority}</span>
                      </td>
                      <td style={{padding:"10px 12px",color:"#059669",fontWeight:600,fontSize:12}}>{k.currentPosition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

          {/* Longue traîne */}
          {(kw.longTail||[]).length>0&&<div className="card" style={{borderTop:"3px solid #d97706"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"#0f172a"}}>💡 Requêtes longue traîne à exploiter dans les Posts</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {kw.longTail.map((k,i)=>(
                <span key={i} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:20,padding:"5px 14px",fontSize:12.5,color:"#92400e",fontWeight:500}}>{k}</span>
              ))}
            </div>
          </div>}
        </div>}

        {/* CONCURRENCE */}
        {tab==="competitors"&&(
          <div>
            <div className="section-title">⚔️ Analyse concurrentielle</div>
            <div className="section-sub">Positionnement face aux principaux concurrents locaux</div>

            <div style={{display:"grid",gap:12,marginBottom:16}}>
              {(data.competitors||[]).map((c,i)=>{
                const threat=c.threat==="Haute"?{c:"#dc2626",bg:"#fef2f2",b:"#fecaca"}:c.threat==="Moyenne"?{c:"#d97706",bg:"#fffbeb",b:"#fde68a"}:{c:"#059669",bg:"#ecfdf5",b:"#a7f3d0"};
                return(
                  <div key={i} className="card" style={{borderLeft:`4px solid ${threat.c}`,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                    <div style={{width:44,height:44,borderRadius:12,background:threat.bg,border:`1.5px solid ${threat.b}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏆</div>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{fontWeight:700,fontSize:15,color:"#0f172a",marginBottom:3}}>{c.name}</div>
                      <div style={{fontSize:13,color:"#64748b"}}>{Array.isArray(c.strengths)?c.strengths.join(" · "):c.strengths}</div>
                    </div>
                    <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:20,fontWeight:800,color:"#d97706"}}>⭐ {c.rating}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>Note</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:20,fontWeight:800,color:"#6366f1"}}>{c.reviews}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>Avis</div>
                      </div>
                      <span style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:threat.bg,color:threat.c,border:`1px solid ${threat.b}`}}>
                        Menace {c.threat}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {(data.competitorOpportunities||[]).length>0&&(
              <div className="card" style={{borderTop:"3px solid #059669"}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:"#0f172a"}}>🚀 Opportunités identifiées face à la concurrence</div>
                <div style={{display:"grid",gap:10}}>
                  {data.competitorOpportunities.map((o,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:"#ecfdf5",borderRadius:9,border:"1px solid #a7f3d0"}}>
                      <span style={{color:"#059669",fontWeight:800,fontSize:16,flexShrink:0}}>→</span>
                      <span style={{fontSize:13.5,color:"#065f46",fontWeight:500}}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AVIS */}
        {tab==="reviews"&&<div>
          <div style={{...serif,fontSize:24,marginBottom:2}}>Avis & Réputation</div>
          <div style={{fontSize:12.5,color:"#94a3b8",marginBottom:16}}>Analyse et stratégie de collecte</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[{l:"Note",v:reviews.score||ext.rating||"—",c:"#d97706",bg:"#fffbeb",b:"#fde68a"},{l:"Avis",v:reviews.totalReviews||ext.reviewCount||"—",c:"#6366f1",bg:"#f5f3ff",b:"#ddd6fe"},{l:"Réponses",v:reviews.responseRate||"—",c:"#16a34a",bg:"#f0fdf4",b:"#bbf7d0"},{l:"Sentiment",v:reviews.sentimentScore?`${reviews.sentimentScore}%`:"—",c:"#0891b2",bg:"#ecfeff",b:"#a5f3fc"}].map(({l,v,c,bg,b})=>(
              <div key={l} className="card" style={{textAlign:"center",borderTop:`3px solid ${c}`,background:bg,border:`1.5px solid ${b}`}}>
                <div style={{fontSize:26,fontWeight:800,color:c,margin:"4px 0"}}>{v}</div>
                <div style={{fontSize:11.5,color:"#64748b"}}>{l}</div>
              </div>
            ))}
          </div>
          {reviews.analysis&&<div className="card" style={{marginBottom:12,borderTop:"3px solid #d97706"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Analyse qualitative</div>
            <p style={{fontSize:13.5,color:"#475569",lineHeight:1.8,borderLeft:"3px solid #d97706",paddingLeft:12}}>{reviews.analysis}</p>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {reviews.positiveThemes?.length>0&&<div className="card" style={{borderTop:"3px solid #16a34a"}}>
              <div style={{fontWeight:700,fontSize:12.5,marginBottom:9,color:"#15803d"}}>Ce qu ils apprécient</div>
              {reviews.positiveThemes.map((t,i)=><div key={i} style={{display:"flex",gap:6,padding:"7px 10px",background:"#f0fdf4",borderRadius:8,marginBottom:5,border:"1px solid #bbf7d0",fontSize:12.5,color:"#166534"}}><span style={{fontWeight:700,color:"#16a34a"}}>+</span>{t}</div>)}
            </div>}
            {reviews.negativeThemes?.length>0&&<div className="card" style={{borderTop:"3px solid #dc2626"}}>
              <div style={{fontWeight:700,fontSize:12.5,marginBottom:9,color:"#dc2626"}}>Points de friction</div>
              {reviews.negativeThemes.map((t,i)=><div key={i} style={{display:"flex",gap:6,padding:"7px 10px",background:"#fef2f2",borderRadius:8,marginBottom:5,border:"1px solid #fecaca",fontSize:12.5,color:"#7f1d1d"}}><span style={{fontWeight:700,color:"#dc2626"}}>!</span>{t}</div>)}
            </div>}
          </div>
          {(reviews.responseTemplates||[]).length>0&&<div className="card" style={{marginBottom:12,borderTop:"3px solid #6366f1"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Modèles de réponse</div>
            <div style={{display:"grid",gap:9}}>
              {reviews.responseTemplates.map((tpl,i)=>{
                const cols=[{c:"#16a34a",bg:"#f0fdf4",b:"#bbf7d0"},{c:"#dc2626",bg:"#fef2f2",b:"#fecaca"},{c:"#d97706",bg:"#fffbeb",b:"#fde68a"}];
                const col=cols[i%3];
                return <div key={i} style={{background:col.bg,borderRadius:10,padding:"12px",border:`1px solid ${col.b}`}}>
                  <span style={{background:col.c,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700}}>{tpl.type}</span>
                  <p style={{fontSize:12.5,color:"#374151",lineHeight:1.8,marginTop:8,fontStyle:"italic"}}>"{tpl.template}"</p>
                </div>;
              })}
            </div>
          </div>}
          {reviews.acquisitionTips?.length>0&&<div className="card" style={{borderTop:"3px solid #16a34a"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Stratégie de collecte d avis</div>
            {reviews.acquisitionTips.map((t,i)=><div key={i} style={{display:"flex",gap:9,padding:"9px 12px",background:"#f5f3ff",borderRadius:9,marginBottom:7,border:"1px solid #ddd6fe"}}>
              <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:12.5,color:"#374151"}}>{t}</span>
            </div>)}
          </div>}
        </div>}

        {/* POSTS */}
        {tab==="posts"&&<div>
          <div style={{...serif,fontSize:24,marginBottom:2}}>10 Idées de publications GMB</div>
          <div style={{fontSize:12.5,color:"#94a3b8",marginBottom:16}}>Adaptées au secteur et à la ville · aucun emoji</div>
          {(data.postIdeas||[]).length===0?<div className="card" style={{textAlign:"center",padding:"48px",color:"#94a3b8",fontSize:13}}>Aucune idée disponible — relancez un audit.</div>:(
            <div style={{display:"grid",gap:10}}>
              {(data.postIdeas||[]).map((p,i)=>{
                const typeCol={Realisation:"#6366f1",Conseil:"#0891b2",Offre:"#059669",Temoignage:"#d97706",Actualite:"#7c3aed",Question:"#dc2626",Coulisses:"#0891b2"}[p.type]||"#6366f1";
                const pid=`p${i}`;
                return(
                  <div key={i} className="card" style={{borderLeft:`4px solid ${typeCol}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:22,height:22,borderRadius:6,background:typeCol,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10.5,color:"#fff",flexShrink:0}}>{i+1}</div>
                      <span style={{background:typeCol,color:"#fff",borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700}}>{p.type}</span>
                      <span style={{fontSize:13.5,fontWeight:700,flex:1,color:"#1e293b"}}>{p.title}</span>
                      <span style={{fontSize:11,color:"#94a3b8",flexShrink:0}}>{p.bestDay} · {p.bestTime}</span>
                      <button onClick={()=>{navigator.clipboard.writeText(p.content);setCopyId(pid);setTimeout(()=>setCopyId(null),2000);}}
                        style={{background:copyId===pid?"#16a34a":typeCol,color:"#fff",border:"none",borderRadius:7,padding:"5px 13px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"background .2s",flexShrink:0}}>
                        {copyId===pid?"Copié !":"Copier"}
                      </button>
                    </div>
                    <div style={{background:"#f8fafc",borderRadius:9,padding:"12px 14px",border:"1px solid #e8edf5"}}>
                      <p style={{fontSize:12.5,color:"#374151",lineHeight:1.8,whiteSpace:"pre-line",margin:0}}>{p.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>}

        {/* ROADMAP */}
        {tab==="roadmap"&&<div>
          <div style={{...serif,fontSize:24,marginBottom:2}}>Roadmap 3 mois</div>
          <div style={{fontSize:12.5,color:"#94a3b8",marginBottom:16}}>Plan d action pour atteindre le TOP 3</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
            {[{k:"month1",n:"01",c:"#dc2626",bg:"#fef2f2",b:"#fecaca"},{k:"month2",n:"02",c:"#d97706",bg:"#fffbeb",b:"#fde68a"},{k:"month3",n:"03",c:"#16a34a",bg:"#f0fdf4",b:"#bbf7d0"}].map(({k,n,c,bg,b})=>{
              const m=roadmap[k]||{};
              return <div key={k} className="card" style={{borderTop:`4px solid ${c}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:bg,border:`1px solid ${b}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:c}}>{n}</div>
                  <div><div style={{fontSize:9.5,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>Mois {n}</div><div style={{fontWeight:700,fontSize:13}}>{m.title||"—"}</div></div>
                </div>
                <div style={{background:bg,borderRadius:8,padding:"7px 10px",marginBottom:10,border:`1px solid ${b}`}}>
                  <div style={{fontSize:9.5,fontWeight:700,color:c,textTransform:"uppercase",marginBottom:1}}>Objectif</div>
                  <div style={{fontSize:12.5,fontWeight:600}}>{m.objective||"—"}</div>
                </div>
                {(m.actions||[]).map((a,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:5,fontSize:12.5,color:"#374151",lineHeight:1.5}}><span style={{color:c,fontWeight:700,flexShrink:0}}>→</span>{a}</div>)}
                {m.kpis?.length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9"}}>
                  {m.kpis.map((kp,i)=><div key={i} style={{fontSize:11.5,color:"#6366f1",marginBottom:3}}>📈 {kp}</div>)}
                </div>}
              </div>;
            })}
          </div>
          {roadmap.beyond&&<div className="card" style={{background:"#fafbff",border:"1.5px solid #e0e7ff"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:"#1e293b"}}>{roadmap.beyond.title}</div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
              <div style={{flex:1}}>{(roadmap.beyond.actions||[]).map((a,i)=><div key={i} style={{display:"flex",gap:6,fontSize:13,color:"#374151",marginBottom:6}}><span style={{color:"#6366f1",fontWeight:700}}>→</span>{a}</div>)}</div>
              {roadmap.beyond.expectedResults&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {Object.entries(roadmap.beyond.expectedResults).map(([k,v])=>(
                  <div key={k} style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#6366f1"}}>{v}</div>
                    <div style={{fontSize:10.5,color:"#64748b",marginTop:2,textTransform:"capitalize"}}>{k}</div>
                  </div>
                ))}
              </div>}
            </div>
          </div>}
        </div>}

        {/* VISIBILITÉ */}
        {tab==="visibilite"&&<VisibiliteTab client={client} clients={clients} upd={upd} kw={kw} googleApiKey={googleApiKey} data={data} ext={ext} score={score}/>}

      </div>

      {/* Modals */}
      {showEdit  &&<ManualEditModal client={client} clients={clients} upd={upd} onClose={()=>setShowEdit(false)} onSaved={updated=>{setShowEdit(false);go("client",updated);}} getLvl={getLvl} calcScore={calcScore}/>}
      {showUpdate&&<UpdateModal client={client} clients={clients} upd={upd} hasEnvKey={hasEnvKey} apiKey={apiKey} onClose={()=>setShowUpdate(false)} onUpdated={updated=>{setShowUpdate(false);go("client",updated);}} calcScore={calcScore}/>}
      {showReport&&<WeeklyReport client={client} score={score} ll={ll} failed={failed} tasksDone={tasksDone} pct={pct} doneCount={doneCount} clients={clients} upd={upd} onClose={()=>setShowReport(false)}/>}
    </div>
  );
}

// ─── MANUAL EDIT MODAL ────────────────────────────────────────────────────────
function ManualEditModal({client,clients,upd,onClose,onSaved,getLvl,calcScore}){
  const [scores,  setScores]  = useState({...client.scores||{}});
  const [ext,     setExt]     = useState({...(client.data?.extracted||{})});
  const [note,    setNote]    = useState("");
  const [saved,   setSaved]   = useState(false);
  const [section, setSection] = useState("criteria");

  const newScore = calcScore(scores);
  const oldScore = calcScore(client.scores||{});
  const diff     = newScore - oldScore;
  const ll       = getLvl(newScore);

  const save=()=>{
    const snapshot={date:client.date,score:oldScore,scores:{...client.scores},data:client.data,perf:client.perf||null,type:"manual",note:note||"Mise à jour manuelle"};
    const history=[...(client.history||[]),snapshot];
    const newData={...client.data,extracted:{...(client.data?.extracted||{}),...ext}};
    const updated={...client,scores,data:newData,date:new Date().toISOString(),history,tasksDone:{}};
    upd(clients.map(c=>c.id===client.id?updated:c));
    setSaved(true);
    setTimeout(()=>onSaved(updated),600);
  };

  const EDIT_FIELDS=[
    {key:"rating",      label:"Note Google",         placeholder:"4.3"},
    {key:"reviewCount", label:"Nombre d avis",        placeholder:"47"},
    {key:"photoCount",  label:"Nombre de photos",     placeholder:"25"},
    {key:"postsCount",  label:"Publications actives", placeholder:"12"},
    {key:"phone",       label:"Téléphone",            placeholder:"06 XX XX XX XX"},
    {key:"website",     label:"Site web",             placeholder:"https://…"},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.4)",backdropFilter:"blur(3px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:680,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.18)",border:"1px solid #e8edf5"}}>
        {/* Header */}
        <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{...serif,fontSize:20,color:"#0f172a"}}>Modifier la fiche</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{client.name} · sans relancer un audit IA</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {diff!==0&&<span style={{fontSize:12.5,fontWeight:700,color:diff>0?"#16a34a":"#dc2626",background:diff>0?"#f0fdf4":"#fef2f2",border:`1px solid ${diff>0?"#bbf7d0":"#fecaca"}`,borderRadius:20,padding:"3px 11px"}}>{diff>0?"+":""}{diff} pts</span>}
            <span style={{background:ll.bg,border:`1.5px solid ${ll.border}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:ll.color}}>{newScore}/100</span>
            <button className="btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:"10px 24px 0",borderBottom:"1px solid #f1f5f9"}}>
          {[{id:"criteria",label:"Critères"},{id:"infos",label:"Infos clés"},{id:"note",label:"Note de suivi"}].map(t=>(
            <button key={t.id} className={`tab ${section===t.id?"on":""}`} onClick={()=>setSection(t.id)}>{t.label}</button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {/* CRITÈRES */}
          {section==="criteria"&&<div>
            <div style={{fontSize:12.5,color:"#64748b",marginBottom:16,background:"#f5f3ff",borderRadius:9,padding:"10px 13px",border:"1px solid #ddd6fe"}}>
              Cochez les critères que vous avez mis à jour dans la fiche réelle. Le score se recalcule immédiatement.
            </div>
            {CATS.map(cat=>(
              <div key={cat.id} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                  <span style={{fontSize:15}}>{cat.icon}</span>
                  <div style={{fontWeight:700,fontSize:13}}>{cat.label}</div>
                  <span style={{fontSize:11,color:"#94a3b8"}}>{cat.type==="static"?"Statique":"Dynamique"}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {cat.criteria.map(c=>{
                    const val=scores[c.id];
                    const isOk=val===true;
                    const isFail=val===false;
                    return(
                      <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",borderRadius:9,border:`1.5px solid ${isOk?"#bbf7d0":isFail?"#fecaca":"#e8edf5"}`,background:isOk?"#f0fdf4":isFail?"#fef2f2":"#f8fafc",cursor:"pointer",transition:"all .15s"}}
                        onClick={()=>setScores(prev=>({...prev,[c.id]:isOk?false:true}))}>
                        <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${isOk?"#22c55e":"#e2e8f0"}`,background:isOk?"#22c55e":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                          {isOk&&<span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11.5,fontWeight:600,color:isOk?"#15803d":isFail?"#dc2626":"#374151",lineHeight:1.3}}>{c.label}</div>
                        </div>
                        <span style={{fontSize:10,color:isOk?"#16a34a":"#94a3b8",fontWeight:700,flexShrink:0}}>{isOk?"+":""}{isOk?c.points:-c.points}pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>}

          {/* INFOS CLÉS */}
          {section==="infos"&&<div>
            <div style={{fontSize:12.5,color:"#64748b",marginBottom:16,background:"#fffbeb",borderRadius:9,padding:"10px 13px",border:"1px solid #fde68a"}}>
              Mettez à jour les chiffres clés directement depuis votre tableau de bord GMB. Ces données apparaîtront dans la vue d ensemble et les rapports.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {EDIT_FIELDS.map(f=>(
                <div key={f.key}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>{f.label}</div>
                  <input className="inp" value={ext[f.key]||""} onChange={e=>setExt({...ext,[f.key]:e.target.value})} placeholder={f.placeholder}/>
                </div>
              ))}
            </div>
          </div>}

          {/* NOTE DE SUIVI */}
          {section==="note"&&<div>
            <div style={{fontSize:12.5,color:"#64748b",marginBottom:14,background:"#f5f3ff",borderRadius:9,padding:"10px 13px",border:"1px solid #ddd6fe"}}>
              Ajoutez une note décrivant les modifications réalisées. Elle sera conservée dans l historique de la fiche.
            </div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Note de modification</div>
            <textarea className="ta" rows={6} value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex : Ajout de 8 nouvelles photos, mise à jour de la description avec les mots-clés, réponse aux 3 derniers avis…"/>
          </div>}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 24px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafbff"}}>
          <div style={{fontSize:12.5,color:"#64748b"}}>
            Score : <strong style={{color:oldScore!==newScore?ll.color:"#1e293b"}}>{oldScore}</strong> → <strong style={{color:ll.color}}>{newScore}</strong>
            {diff!==0&&<span style={{fontWeight:700,color:diff>0?"#16a34a":"#dc2626",marginLeft:6}}>{diff>0?"+":""}{diff} pts</span>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn" style={{justifyContent:"center"}} onClick={save} disabled={saved}>
              {saved?"Sauvegardé ✓":"Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
// ── SvcCard ──────────────────────────────────────────────────────────────────
function SvcCard({item,color,bg,border,dashed,client,clients,upd,ext,onDelete,onAdd}){
  const [desc,setDesc]=useState(item.description||"");
  const [busy,setBusy]=useState(false);
  const [ok,setOk]=useState(false);
  const gen=()=>{
    if(busy)return; setBusy(true);
    const prompt="Description SEO 50-80 mots pour ce service GBP.\nEtablissement : "+(client.name||"")+" / "+(ext.category||"")+" / "+(ext.city||client.city||"")+"\nService : "+item.name+"\nRegles : mots-cles locaux, benefice client, ton pro, sans emoji, sans liste.";
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":localStorage.getItem("bto_apikey")||""},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})})
      .then(r=>r.json()).then(d=>{setDesc(d.content?.[0]?.text||"");setBusy(false);}).catch(()=>setBusy(false));
  };
  const copy=()=>{navigator.clipboard.writeText(desc);setOk(true);setTimeout(()=>setOk(false),1500);};
  return(
    <div style={{background:bg,borderRadius:10,padding:"12px",border:(dashed?"1.5px dashed ":"1px solid ")+border}}>
      <div style={{fontWeight:700,fontSize:13,color,marginBottom:4}}>{dashed?"+ ":""}{item.name}</div>
      <div style={{fontSize:11.5,color:desc?"#374151":"#9CA3AF",fontStyle:desc?"normal":"italic",lineHeight:1.6,marginBottom:8,minHeight:20}}>{desc||"Pas de description"}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <button onClick={gen} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"none",background:busy?"#E5E7EB":"linear-gradient(135deg,#6B40D8,#3B5BDB)",color:busy?"#9CA3AF":"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{busy?"...":"✨ IA"}</button>
        {desc&&<button onClick={copy} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"1px solid #E5E7EB",background:"white",cursor:"pointer",fontFamily:"inherit",color:ok?"#059669":"#6B7280",fontWeight:600}}>{ok?"✓":"Copier"}</button>}
        {onAdd&&<button onClick={onAdd} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"none",background:color,color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Ajouter</button>}
        {onDelete&&<button onClick={onDelete} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"1px solid #FECACA",background:"#FEF2F2",cursor:"pointer",fontFamily:"inherit",color:"#dc2626",fontWeight:600}}>Supprimer</button>}
      </div>
    </div>
  );
}

// ── PrdCard ──────────────────────────────────────────────────────────────────
function PrdCard({item,color,bg,border,dashed,client,clients,upd,ext,onDelete,onAdd}){
  const [desc,setDesc]=useState(item.description||"");
  const [busy,setBusy]=useState(false);
  const [ok,setOk]=useState(false);
  const gen=()=>{
    if(busy)return; setBusy(true);
    const prompt="Description SEO 50-80 mots pour ce produit GBP.\nEtablissement : "+(client.name||"")+" / "+(ext.category||"")+" / "+(ext.city||client.city||"")+"\nProduit : "+item.name+(item.price?" / "+item.price:"")+"\nRegles : mots-cles locaux, avantages concrets, ton pro, sans emoji, sans liste.";
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":localStorage.getItem("bto_apikey")||""},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})})
      .then(r=>r.json()).then(d=>{setDesc(d.content?.[0]?.text||"");setBusy(false);}).catch(()=>setBusy(false));
  };
  const copy=()=>{navigator.clipboard.writeText(desc);setOk(true);setTimeout(()=>setOk(false),1500);};
  return(
    <div style={{background:bg,borderRadius:10,padding:"11px",border:(dashed?"1.5px dashed ":"1px solid ")+border}}>
      <div style={{fontWeight:700,fontSize:12.5,color,marginBottom:2}}>{dashed?"+ ":""}{item.name}</div>
      {item.price&&<div style={{fontSize:12,color:"#d97706",fontWeight:700,marginBottom:4}}>{item.price}</div>}
      <div style={{fontSize:11,color:desc?"#374151":"#9CA3AF",fontStyle:desc?"normal":"italic",lineHeight:1.5,marginBottom:8,minHeight:16}}>{desc||"Pas de description"}</div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        <button onClick={gen} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"none",background:busy?"#E5E7EB":"linear-gradient(135deg,#6B40D8,#3B5BDB)",color:busy?"#9CA3AF":"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{busy?"...":"✨ IA"}</button>
        {desc&&<button onClick={copy} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"1px solid #E5E7EB",background:"white",cursor:"pointer",fontFamily:"inherit",color:ok?"#059669":"#6B7280",fontWeight:600}}>{ok?"✓":"Copier"}</button>}
        {onAdd&&<button onClick={onAdd} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"none",background:color,color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Ajouter</button>}
        {onDelete&&<button onClick={onDelete} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"1px solid #FECACA",background:"#FEF2F2",cursor:"pointer",fontFamily:"inherit",color:"#dc2626",fontWeight:600}}>×</button>}
      </div>
    </div>
  );
}

// ── CATEGORIES TAB ────────────────────────────────────────────────────────────
function CategoriesTab({data, client, clients, upd, apiKey}){
  const ext  = data?.extracted||{};
  const cats = ext.secondaryCategories||{};
  const svcs = ext.services||{};
  const prds = ext.products||{};
  const [newCat,setNewCat] = useState("");
  const [addCat,setAddCat] = useState(false);
  const [newSvcName,setNewSvcName] = useState("");
  const [newSvcDesc,setNewSvcDesc] = useState("");
  const [addSvc,setAddSvc] = useState(false);
  const [svcBusy,setSvcBusy] = useState(false);
  const [newPrdName,setNewPrdName] = useState("");
  const [newPrdPrice,setNewPrdPrice] = useState("");
  const [newPrdDesc,setNewPrdDesc] = useState("");
  const [addPrd,setAddPrd] = useState(false);
  const [prdBusy,setPrdBusy] = useState(false);

  const manualCats = client?.manualCategories||[];
  const manualSvcs = client?.manualServices||[];
  const manualPrds = client?.manualProducts||[];
  const save = patch => upd(clients.map(c=>c.id===client.id?{...c,...patch}:c));

  const genSvcDesc=()=>{
    if(!newSvcName.trim()||svcBusy)return; setSvcBusy(true);
    const p="Description SEO 50-80 mots pour ce service GBP.\nEtablissement : "+(client.name||"")+" / "+(ext.category||"")+" / "+(ext.city||client.city||"")+"\nService : "+newSvcName+"\nRegles : mots-cles locaux, benefice client, ton pro, sans emoji, sans liste.";
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":localStorage.getItem("bto_apikey")||""},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:p}]})})
      .then(r=>r.json()).then(d=>{setNewSvcDesc(d.content?.[0]?.text||"");setSvcBusy(false);}).catch(()=>setSvcBusy(false));
  };
  const genPrdDesc=()=>{
    if(!newPrdName.trim()||prdBusy)return; setPrdBusy(true);
    const p="Description SEO 50-80 mots pour ce produit GBP.\nEtablissement : "+(client.name||"")+" / "+(ext.category||"")+" / "+(ext.city||client.city||"")+"\nProduit : "+newPrdName+(newPrdPrice?" / "+newPrdPrice:"")+"\nRegles : mots-cles locaux, avantages concrets, ton pro, sans emoji, sans liste.";
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":localStorage.getItem("bto_apikey")||""},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:p}]})})
      .then(r=>r.json()).then(d=>{setNewPrdDesc(d.content?.[0]?.text||"");setPrdBusy(false);}).catch(()=>setPrdBusy(false));
  };

  return(
    <div className="fade">
      <div style={{...serif,fontSize:24,marginBottom:2}}>Catégories, Services & Produits</div>
      <div style={{fontSize:12.5,color:"#94a3b8",marginBottom:16}}>Extrait de la fiche + ajouts manuels + descriptions IA</div>

      {/* CATEGORIE PRINCIPALE */}
      <div className="card" style={{borderTop:"3px solid #6366f1",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Catégorie principale</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"#f5f3ff",border:"1.5px solid #6366f1",borderRadius:12,padding:"10px 18px"}}>
          <span style={{fontWeight:700,fontSize:14,color:"#4338ca"}}>{ext.category||"Non renseignée"}</span>
        </div>
      </div>

      {/* CATEGORIES SECONDAIRES */}
      <div className="card" style={{borderTop:"3px solid #0891b2",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:13}}>Catégories secondaires</div>
          <button onClick={()=>setAddCat(v=>!v)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Ajouter</button>
        </div>
        {addCat&&(
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={newCat} onChange={e=>setNewCat(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newCat.trim()){save({manualCategories:[...manualCats,newCat.trim()]});setNewCat("");setAddCat(false);}}}
              placeholder="Ex: Magasin d'inserts de cheminée" autoFocus
              style={{flex:1,padding:"8px 12px",border:"1.5px solid #6B40D8",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
            <button onClick={()=>{if(newCat.trim()){save({manualCategories:[...manualCats,newCat.trim()]});setNewCat("");setAddCat(false);}}}
              style={{padding:"8px 14px",borderRadius:9,border:"none",background:"#6B40D8",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✓</button>
            <button onClick={()=>{setAddCat(false);setNewCat("");}}
              style={{padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",cursor:"pointer",fontFamily:"inherit",color:"#6B7280"}}>Annuler</button>
          </div>
        )}
        {[...(cats.present||[]),...manualCats].length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Présentes</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {(cats.present||[]).map((c,i)=><div key={"cp"+i} style={{display:"flex",alignItems:"center",gap:6,background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"6px 14px"}}><span style={{color:"#059669",fontWeight:700}}>✓</span><span style={{fontSize:12.5,fontWeight:600,color:"#166534"}}>{c}</span></div>)}
              {manualCats.map((c,i)=><div key={"cm"+i} style={{display:"flex",alignItems:"center",gap:6,background:"#F5F3FF",border:"1.5px solid #C4B5FD",borderRadius:10,padding:"6px 14px"}}><span style={{color:"#6B40D8",fontWeight:700}}>✓</span><span style={{fontSize:12.5,fontWeight:600,color:"#6B40D8"}}>{c}</span><button onClick={()=>save({manualCategories:manualCats.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:14,padding:"0 0 0 4px",lineHeight:1}}>×</button></div>)}
            </div>
          </div>
        )}
        {(cats.suggested||[]).length>0&&(
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Suggérées</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {cats.suggested.map((c,i)=><div key={"cs"+i} onClick={()=>save({manualCategories:[...manualCats,c]})} style={{display:"flex",alignItems:"center",gap:6,background:"#f5f3ff",border:"1.5px dashed #6366f1",borderRadius:10,padding:"6px 14px",cursor:"pointer"}}><span style={{color:"#6366f1",fontWeight:700}}>+</span><span style={{fontSize:12.5,fontWeight:600,color:"#4338ca"}}>{c}</span></div>)}
            </div>
          </div>
        )}
      </div>

      {/* SERVICES */}
      <div className="card" style={{borderTop:"3px solid #16a34a",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13}}>Services</div>
          <button onClick={()=>setAddSvc(v=>!v)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#059669,#16a34a)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Ajouter</button>
        </div>
        {addSvc&&(
          <div style={{background:"#F0FDF4",borderRadius:12,padding:"14px",border:"1px solid #BBF7D0",marginBottom:14}}>
            <input value={newSvcName} onChange={e=>setNewSvcName(e.target.value)}
              placeholder="Nom du service (ex: Installation poêles à bois)"
              style={{width:"100%",padding:"8px 12px",border:"1.5px solid #BBF7D0",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",background:"white",marginBottom:8}}/>
            <textarea value={newSvcDesc} onChange={e=>setNewSvcDesc(e.target.value)}
              placeholder="Description — ou cliquez ✨ IA" rows={2}
              style={{width:"100%",padding:"8px 12px",border:"1.5px solid #BBF7D0",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",background:"white",resize:"vertical",marginBottom:8}}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={genSvcDesc} disabled={!newSvcName.trim()||svcBusy} style={{padding:"7px 14px",borderRadius:9,border:"none",background:newSvcName.trim()&&!svcBusy?"linear-gradient(135deg,#6B40D8,#3B5BDB)":"#E5E7EB",color:newSvcName.trim()&&!svcBusy?"white":"#9CA3AF",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12}}>{svcBusy?"⏳ Génération...":"✨ Description IA"}</button>
              <button onClick={()=>{if(!newSvcName.trim())return;save({manualServices:[...manualSvcs,{name:newSvcName.trim(),description:newSvcDesc.trim()}]});setNewSvcName("");setNewSvcDesc("");setAddSvc(false);}} style={{padding:"7px 14px",borderRadius:9,border:"none",background:"#059669",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13}}>✓ Ajouter</button>
              <button onClick={()=>{setAddSvc(false);setNewSvcName("");setNewSvcDesc("");}} style={{padding:"7px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:"#6B7280"}}>Annuler</button>
            </div>
          </div>
        )}
        {(svcs.present||[]).length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Détectés</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{svcs.present.map((s,i)=><SvcCard key={"sp"+i} item={s} color="#059669" bg="#F0FDF4" border="#BBF7D0" client={client} clients={clients} upd={upd} ext={ext}/>)}</div></div>}
        {manualSvcs.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:"#6B40D8",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Ajoutés manuellement</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{manualSvcs.map((s,i)=><SvcCard key={"sm"+i} item={s} color="#6B40D8" bg="#F5F3FF" border="#C4B5FD" client={client} clients={clients} upd={upd} ext={ext} onDelete={()=>save({manualServices:manualSvcs.filter((_,j)=>j!==i)})}/>)}</div></div>}
        {(svcs.suggested||[]).length>0&&<div><div style={{fontSize:10,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Suggérés</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{svcs.suggested.map((s,i)=><SvcCard key={"ss"+i} item={s} color="#4338ca" bg="#EFF6FF" border="#BFDBFE" dashed client={client} clients={clients} upd={upd} ext={ext} onAdd={()=>save({manualServices:[...manualSvcs,{name:s.name,description:s.description||""}]})}/>)}</div></div>}
        {!svcs.present?.length&&!manualSvcs.length&&!svcs.suggested?.length&&<div style={{fontSize:12.5,color:"#9CA3AF",fontStyle:"italic",padding:"8px"}}>Aucun service. Cliquez sur "+ Ajouter".</div>}
      </div>

      {/* PRODUITS */}
      <div className="card" style={{borderTop:"3px solid #d97706"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13}}>Produits</div>
          <button onClick={()=>setAddPrd(v=>!v)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#d97706,#b45309)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Ajouter</button>
        </div>
        {addPrd&&(
          <div style={{background:"#FFFBEB",borderRadius:12,padding:"14px",border:"1px solid #FDE68A",marginBottom:14}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={newPrdName} onChange={e=>setNewPrdName(e.target.value)} placeholder="Nom du produit" style={{flex:"1 1 60%",padding:"8px 12px",border:"1.5px solid #FDE68A",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",background:"white"}}/>
              <input value={newPrdPrice} onChange={e=>setNewPrdPrice(e.target.value)} placeholder="Prix" style={{flex:"1 1 30%",padding:"8px 12px",border:"1.5px solid #FDE68A",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",background:"white"}}/>
            </div>
            <textarea value={newPrdDesc} onChange={e=>setNewPrdDesc(e.target.value)} placeholder="Description — ou cliquez ✨ IA" rows={2} style={{width:"100%",padding:"8px 12px",border:"1.5px solid #FDE68A",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",background:"white",resize:"vertical",marginBottom:8}}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={genPrdDesc} disabled={!newPrdName.trim()||prdBusy} style={{padding:"7px 14px",borderRadius:9,border:"none",background:newPrdName.trim()&&!prdBusy?"linear-gradient(135deg,#6B40D8,#3B5BDB)":"#E5E7EB",color:newPrdName.trim()&&!prdBusy?"white":"#9CA3AF",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12}}>{prdBusy?"⏳ Génération...":"✨ Description IA"}</button>
              <button onClick={()=>{if(!newPrdName.trim())return;save({manualProducts:[...manualPrds,{name:newPrdName.trim(),price:newPrdPrice.trim(),description:newPrdDesc.trim()}]});setNewPrdName("");setNewPrdPrice("");setNewPrdDesc("");setAddPrd(false);}} style={{padding:"7px 14px",borderRadius:9,border:"none",background:"#d97706",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13}}>✓ Ajouter</button>
              <button onClick={()=>{setAddPrd(false);setNewPrdName("");setNewPrdPrice("");setNewPrdDesc("");}} style={{padding:"7px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:"#6B7280"}}>Annuler</button>
            </div>
          </div>
        )}
        {(prds.present||[]).length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Détectés</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{prds.present.map((p,i)=><PrdCard key={"pp"+i} item={p} color="#92400e" bg="#FFFBEB" border="#FDE68A" client={client} clients={clients} upd={upd} ext={ext}/>)}</div></div>}
        {manualPrds.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:"#6B40D8",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Ajoutés manuellement</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{manualPrds.map((p,i)=><PrdCard key={"pm"+i} item={p} color="#6B40D8" bg="#F5F3FF" border="#C4B5FD" client={client} clients={clients} upd={upd} ext={ext} onDelete={()=>save({manualProducts:manualPrds.filter((_,j)=>j!==i)})}/>)}</div></div>}
        {(prds.suggested||[]).length>0&&<div><div style={{fontSize:10,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Suggérés</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{prds.suggested.map((p,i)=><PrdCard key={"ps"+i} item={p} color="#4338ca" bg="#EFF6FF" border="#BFDBFE" dashed client={client} clients={clients} upd={upd} ext={ext} onAdd={()=>save({manualProducts:[...manualPrds,{name:p.name,price:p.price||"",description:p.description||""}]})}/>)}</div></div>}
        {!prds.present?.length&&!manualPrds.length&&!prds.suggested?.length&&<div style={{fontSize:12.5,color:"#9CA3AF",fontStyle:"italic",padding:"8px"}}>Aucun produit. Cliquez sur "+ Ajouter".</div>}
      </div>
    </div>
  );
}

// ─── PERFORMANCE TAB ──────────────────────────────────────────────────────────
function PerformanceTab({client,clients,upd,calcScore,getLvl}){
  const history   = client.history||[];
  const allPoints = [...history.map(h=>({date:h.date,score:calcScore(h.scores||{}),pillars:h.data?.pillars||null,perf:h.perf||null,type:h.type||"audit",note:h.note||""})),
                     {date:client.date,score:calcScore(client.scores||{}),pillars:client.data?.pillars||null,perf:client.perf||null,type:"current",note:""}];
  const data      = client.data||{};
  const ranking   = data.competitorRanking||{};
  const curPerf   = client.perf||{};
  const [editing, setEditing]=useState(false);
  const [form,    setForm]   =useState({vues:"",clics:"",appels:"",itineraires:"",avis:"",periode:"",...curPerf});

  const savePerf=()=>{const u=clients.map(c=>c.id===client.id?{...c,perf:form}:c);upd(u);client.perf=form;setEditing(false);};

  const PILLARS=[{k:"pertinence",l:"Pertinence",c:"#6366f1"},{k:"proximite",l:"Proximité",c:"#0891b2"},{k:"prominence",l:"Proéminence",c:"#d97706"},{k:"avis",l:"Avis",c:"#16a34a"},{k:"completion",l:"Complétion",c:"#7c3aed"}];
  const PF=[{key:"vues",l:"Vues",c:"#6366f1"},{key:"clics",l:"Clics site",c:"#0891b2"},{key:"appels",l:"Appels",c:"#16a34a"},{key:"itineraires",l:"Itinéraires",c:"#d97706"},{key:"avis",l:"Nouveaux avis",c:"#7c3aed"}];
  const currentScore=calcScore(client.scores||{});
  const ll=getLvl(currentScore);
  const prevScore=allPoints.length>=2?allPoints[allPoints.length-2].score:null;
  const diff=prevScore!==null?currentScore-prevScore:null;

  const ScoreChart=()=>{
    if(allPoints.length<2)return null;
    const vals=allPoints.map(p=>p.score),W=500,H=80,pad=20;
    const xs=vals.map((_,i)=>pad+i*((W-2*pad)/Math.max(vals.length-1,1)));
    const ys=vals.map(v=>H-pad-(v/100)*(H-2*pad));
    const path=xs.map((x,i)=>`${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
    const area=`${path} L${xs[xs.length-1]},${H-pad} L${xs[0]},${H-pad} Z`;
    return <svg width="100%" viewBox={`0 0 ${W} ${H+24}`} style={{overflow:"visible"}}>
      <defs><linearGradient id="gsc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".12"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
      {[25,50,75].map(v=>{const y=H-pad-(v/100)*(H-2*pad);return<g key={v}><line x1={pad} y1={y} x2={W-pad} y2={y} stroke="#f1f5f9" strokeWidth="1"/><text x={pad-4} y={y+3} textAnchor="end" fontSize="8" fill="#cbd5e1" fontFamily="'Plus Jakarta Sans',sans-serif">{v}</text></g>;})}
      <path d={area} fill="url(#gsc)"/>
      <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i)=>{const lv=getLvl(vals[i]);return(<g key={i}><circle cx={x} cy={ys[i]} r={5} fill="#fff" stroke={lv.color} strokeWidth="2.5"/><text x={x} y={ys[i]-10} textAnchor="middle" fontSize="10" fontWeight="700" fill={lv.color} fontFamily="'Plus Jakarta Sans',sans-serif">{vals[i]}</text><text x={x} y={H+16} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="'Plus Jakarta Sans',sans-serif">{new Date(allPoints[i].date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</text></g>);})}
    </svg>;
  };

  return(
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{...serif,fontSize:24,marginBottom:2}}>Performance GMB</div><div style={{fontSize:12.5,color:"#94a3b8"}}>Vue globale exportable pour votre client</div></div>
        <button className="btn no-print" onClick={()=>window.print()}>Exporter PDF</button>
      </div>

      {/* Score + évolution */}
      <div className="card" style={{borderTop:"3px solid #6366f1",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:allPoints.length>=2?14:0,flexWrap:"wrap"}}>
          <div style={{width:66,height:66,borderRadius:14,background:ll.bg,border:`2px solid ${ll.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <div style={{fontSize:24,fontWeight:800,color:ll.color}}>{currentScore}</div>
            <div style={{fontSize:9,color:"#94a3b8"}}>/100</div>
          </div>
          <div style={{flex:1}}>
            <div style={{...serif,fontSize:20,color:ll.color,marginBottom:5}}>{ll.label}</div>
            {diff!==null&&<span style={{fontSize:12,fontWeight:700,color:diff>0?"#16a34a":diff<0?"#dc2626":"#94a3b8",background:diff>0?"#f0fdf4":diff<0?"#fef2f2":"#f8fafc",border:`1px solid ${diff>0?"#bbf7d0":diff<0?"#fecaca":"#e2e8f0"}`,borderRadius:20,padding:"3px 10px"}}>{diff>0?"+":""}{diff} pts {diff>0?"↑":diff<0?"↓":"→"}</span>}
          </div>
          {allPoints.length>=2&&<div style={{flex:2,minWidth:200}}><ScoreChart/></div>}
        </div>

        {/* Historique enrichi */}
        {allPoints.length>=2&&<div style={{borderTop:"1px solid #f1f5f9",paddingTop:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Historique des mises à jour</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[...allPoints].reverse().map((p,i)=>{
              const lv=getLvl(p.score);const prev2=[...allPoints].reverse()[i+1];const d2=prev2?p.score-prev2.score:null;
              const isManual=p.type==="manual";
              return(
                <div key={i} style={{background:i===0?"#f5f3ff":"#f8fafc",borderRadius:10,padding:"9px 13px",border:`1px solid ${i===0?"#ddd6fe":"#e8edf5"}`,textAlign:"center",minWidth:90}}>
                  <div style={{fontSize:8,color:isManual?"#0891b2":"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{isManual?"Modif.":"Audit"}</div>
                  <div style={{fontSize:19,fontWeight:800,color:lv.color}}>{p.score}</div>
                  <div style={{fontSize:9,color:"#94a3b8",marginBottom:2}}>{new Date(p.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"2-digit"})}</div>
                  {d2!==null&&<span style={{fontSize:10.5,fontWeight:700,color:d2>0?"#16a34a":d2<0?"#dc2626":"#64748b"}}>{d2>0?"+":""}{d2}</span>}
                  {p.note&&<div style={{fontSize:9,color:"#94a3b8",marginTop:3,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.note}</div>}
                </div>
              );
            })}
          </div>
        </div>}
      </div>

      {/* 5 Piliers */}
      {data.pillars&&<div className="card" style={{borderTop:"3px solid #7c3aed",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:16}}>Les 5 piliers de la visibilité Google Maps</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:14}}>
          {PILLARS.map(p=>{const val=data.pillars[p.k];const sc=val?.score||0;const lv=getLvl(sc);return(
            <div key={p.k} style={{textAlign:"center"}}>
              <div style={{position:"relative",width:58,height:58,margin:"0 auto 8px"}}>
                <svg width={58} height={58} viewBox="0 0 58 58">
                  <circle cx={29} cy={29} r={23} fill="none" stroke="#e8edf5" strokeWidth="5"/>
                  <circle cx={29} cy={29} r={23} fill="none" stroke={lv.color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*23}`} strokeDashoffset={`${2*Math.PI*23*(1-sc/100)}`}
                    transform="rotate(-90 29 29)" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:lv.color}}>{sc}</div>
              </div>
              <div style={{fontWeight:700,fontSize:11.5,marginBottom:1}}>{p.l}</div>
              <div style={{fontSize:10,color:lv.color,fontWeight:600}}>{val?.label||"—"}</div>
            </div>
          );})}
        </div>
        <div style={{display:"grid",gap:6}}>
          {PILLARS.map(p=>{const val=data.pillars[p.k];if(!val?.details)return null;const lv=getLvl(val.score||0);return(
            <div key={p.k} style={{display:"flex",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:9,border:"1px solid #e8edf5"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:12.5}}>{p.l}</span>
                  <div style={{flex:1,height:4,background:"#e8edf5",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${val.score||0}%`,background:lv.color,borderRadius:2,transition:"width 1s"}}/></div>
                  <span style={{fontSize:12,fontWeight:800,color:lv.color,flexShrink:0}}>{val.score||0}/100</span>
                </div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{val.details}</div>
              </div>
            </div>
          );})}
        </div>
      </div>}

      {/* Positionnement */}
      {Object.keys(ranking).length>0&&<div className="card" style={{borderTop:"3px solid #dc2626",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>Positionnement concurrentiel</div>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
          <div style={{background:"#fef2f2",borderRadius:12,padding:"14px 22px",textAlign:"center",border:"1px solid #fecaca",flexShrink:0}}>
            <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Position estimée</div>
            <div style={{fontSize:30,fontWeight:800,color:"#dc2626"}}>{ranking.estimatedPosition||"—"}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>sur Google Maps</div>
          </div>
          <div style={{flex:1,minWidth:200}}>
            <p style={{fontSize:13,color:"#374151",lineHeight:1.7,marginBottom:8}}>{ranking.rankingOpportunity||""}</p>
            {ranking.marketShareEstimate&&<span style={{fontSize:12,fontWeight:700,color:"#6366f1",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:20,padding:"4px 12px"}}>Part de marché estimée : {ranking.marketShareEstimate}</span>}
          </div>
        </div>
        {(ranking.rankingFactors||[]).length>0&&<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
          <thead><tr style={{background:"#f8fafc"}}>{["Facteur","Votre fiche","Concurrents","Écart","Impact"].map(h=><th key={h} style={{padding:"8px 11px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e8edf5"}}>{h}</th>)}</tr></thead>
          <tbody>{(ranking.rankingFactors||[]).map((f,i)=>(
            <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
              <td style={{padding:"9px 11px",fontWeight:600}}>{f.factor}</td>
              <td style={{padding:"9px 11px",color:"#374151"}}>{f.ourValue}</td>
              <td style={{padding:"9px 11px",color:"#64748b"}}>{f.avgCompetitor}</td>
              <td style={{padding:"9px 11px",fontWeight:700,color:f.gap?.startsWith("-")||f.gap==="Absent"?"#dc2626":"#16a34a"}}>{f.gap}</td>
              <td style={{padding:"9px 11px"}}><span style={{padding:"2px 8px",borderRadius:20,fontSize:10.5,fontWeight:700,background:f.impact==="Fort"?"#fef2f2":f.impact==="Moyen"?"#fffbeb":"#f0fdf4",color:f.impact==="Fort"?"#dc2626":f.impact==="Moyen"?"#d97706":"#16a34a"}}>{f.impact}</span></td>
            </tr>
          ))}</tbody>
        </table></div>}
      </div>}

      {/* Stats GMB */}
      <div className="card" style={{borderTop:"3px solid #16a34a",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontWeight:700,fontSize:13}}>Statistiques GMB</div><div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>Depuis votre tableau de bord Google Business</div></div>
          <button className="btn-sm no-print" onClick={()=>setEditing(!editing)}>{editing?"Annuler":"+ Saisir"}</button>
        </div>
        {editing&&<div style={{background:"#f8fafc",borderRadius:10,padding:"14px",border:"1px solid #e8edf5",marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:10,color:"#64748b",marginBottom:4,fontWeight:600}}>Période</div><input className="inp" value={form.periode} onChange={e=>setForm({...form,periode:e.target.value})} placeholder="ex: Mars 2025"/></div>
            {PF.map(f=><div key={f.key}><div style={{fontSize:10,color:"#64748b",marginBottom:4,fontWeight:600}}>{f.l}</div><input className="inp" type="number" value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder="0"/></div>)}
          </div>
          <button className="btn" style={{width:"100%",justifyContent:"center"}} onClick={savePerf}>Enregistrer</button>
        </div>}
        {!editing&&curPerf&&Object.values(curPerf).some(v=>v&&v!=="")?(
          <div>
            {curPerf.periode&&<div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:10}}>Période : {curPerf.periode}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
              {PF.map(f=>curPerf[f.key]?<div key={f.key} style={{background:"#f8fafc",borderRadius:10,padding:"12px",textAlign:"center",border:`1.5px solid ${f.c}22`,borderTop:`3px solid ${f.c}`}}>
                <div style={{fontSize:22,fontWeight:800,color:f.c}}>{curPerf[f.key]}</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{f.l}</div>
              </div>:null)}
            </div>
          </div>
        ):(!editing&&<div style={{textAlign:"center",padding:"22px 0",color:"#94a3b8",fontSize:13}}>Saisissez les données GMB pour visualiser les performances.</div>)}
      </div>

      {/* Guide */}
      <div style={{background:"#fffbeb",borderRadius:12,padding:"14px 16px",border:"1px solid #fde68a"}}>
        <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:"#92400e"}}>Où trouver ces données dans GMB ?</div>
        {["Connectez-vous sur business.google.com","Cliquez sur votre fiche puis Statistiques","Sélectionnez la période souhaitée","Notez : Vues, Clics, Appels, Itinéraires, Avis reçus"].map((t,i)=>(
          <div key={i} style={{display:"flex",gap:7,fontSize:12,color:"#92400e",marginBottom:4}}><span style={{fontWeight:700}}>{i+1}.</span>{t}</div>
        ))}
      </div>
    </div>
  );
}

// ─── UPDATE MODAL ─────────────────────────────────────────────────────────────
function UpdateModal({client,clients,upd,hasEnvKey,apiKey,onClose,onUpdated,calcScore}){
  const [text, setText] =useState("");
  const [phase,setPhase]=useState("form");
  const [step, setStep] =useState(0);
  const [error,setError]=useState("");
  const STEPS=["Lecture de la nouvelle fiche…","Comparaison des données…","Calcul de l évolution…","Mise à jour du rapport…"];
  useEffect(()=>{if(phase!=="loading")return;const t=setInterval(()=>setStep(s=>Math.min(s+1,STEPS.length-1)),1100);return()=>clearInterval(t);},[phase]);
  const oldScore=calcScore(client.scores||{});

  const submit=async()=>{
    if(!text.trim())return;
    setError("");setPhase("loading");setStep(0);
    try{
      const r=await runAudit(client.name,text,apiKey);
      const nx={...initScores()};
      Object.entries(r.scores||{}).forEach(([k,v])=>{if(k in nx)nx[k]=v;});
      const history=[...(client.history||[]),{date:client.date,score:oldScore,scores:client.scores,data:client.data,perf:client.perf||null,type:"audit"}];
      const updated={...client,scores:nx,data:r,date:new Date().toISOString(),history,tasksDone:{},perf:client.perf||null};
      upd(clients.map(c=>c.id===client.id?updated:c));
      onUpdated(updated);
    }catch(e){setError(e.message);setPhase("form");}
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.4)",backdropFilter:"blur(3px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.18)",border:"1px solid #e8edf5"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{...serif,fontSize:20}}>Mettre à jour via IA</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{client.name} · Score actuel : <strong style={{color:"#6366f1"}}>{oldScore}/100</strong></div>
          </div>
          {phase==="form"&&<button className="btn-ghost" onClick={onClose}>Annuler</button>}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>
          {phase==="loading"?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:18}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid #e2e8f0",borderTop:"3px solid #6366f1",animation:"spin 1s linear infinite"}}/>
              <div style={{textAlign:"center"}}><div style={{...serif,fontSize:18,marginBottom:5}}>Analyse en cours…</div><div style={{fontSize:13.5,color:"#64748b"}}>{STEPS[step]}</div></div>
            </div>
          ):(
            <>
              <div style={{background:"#f5f3ff",borderRadius:10,padding:"12px 14px",marginBottom:16,border:"1px solid #ddd6fe"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"#6366f1",marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Audit IA complet</div>
                <div style={{fontSize:13,color:"#374151",lineHeight:1.7}}>Recollez la fiche mise à jour. L IA recalcule tous les scores et l historique est conservé.</div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Contenu actualisé de la fiche *</div>
                  {text.length>0&&<span style={{fontSize:11.5,color:"#6366f1",fontFamily:"monospace",fontWeight:600}}>{text.length} car.</span>}
                </div>
                <textarea className="ta" rows={10} value={text} onChange={e=>setText(e.target.value)} placeholder="Collez ici le contenu mis à jour de la fiche Google Maps…"/>
              </div>
              {error&&<div style={{marginBottom:12,background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#dc2626"}}>{error}</div>}
              <button className="btn" style={{width:"100%",justifyContent:"center"}} onClick={submit} disabled={!text.trim()||(!hasEnvKey&&!apiKey.trim())}>Lancer la mise à jour →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RAPPORT HEBDO ────────────────────────────────────────────────────────────
function WeeklyReport({client,score,ll,failed,tasksDone,pct,doneCount,clients,upd,onClose}){
  const [notes,setNotes]=useState(client.weeklyNotes||"");
  const data=client.data||{},ext=data.extracted||{};
  const week=Math.ceil((new Date()-new Date(client.date))/(7*24*3600*1000))+1;
  const nextTasks=failed.filter(c=>!tasksDone[c.id]).slice(0,4);
  const saveNotes=()=>{const u=clients.map(c=>c.id===client.id?{...c,weeklyNotes:notes}:c);upd(u);client.weeklyNotes=notes;};

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.4)",backdropFilter:"blur(3px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.18)",border:"1px solid #e8edf5"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{...serif,fontSize:20}}>Rapport hebdomadaire</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{client.name} · Semaine {week}</div></div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn" style={{justifyContent:"center"}} onClick={()=>{saveNotes();window.print();}}>Imprimer PDF</button>
            <button className="btn-ghost" onClick={onClose}>Fermer</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"24px"}}>
          <div style={{background:`linear-gradient(135deg,${ll.bg},#fff)`,border:`1.5px solid ${ll.border}`,borderRadius:14,padding:"20px",marginBottom:20}}>
            <div style={{fontSize:10.5,color:"#94a3b8",marginBottom:4,textTransform:"uppercase",letterSpacing:".6px"}}>Rapport · Semaine {week}</div>
            <div style={{...serif,fontSize:24,color:"#0f172a",marginBottom:2}}>{client.name}</div>
            <div style={{fontSize:12.5,color:"#64748b"}}>{ext.category} · {ext.city} · {new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[{l:"Score",v:`${score}/100`,c:ll.color,bg:ll.bg,b:ll.border},{l:"Progression",v:`${pct}%`,c:"#6366f1",bg:"#f5f3ff",b:"#ddd6fe"},{l:"Tâches faites",v:`${doneCount}/${failed.length}`,c:"#16a34a",bg:"#f0fdf4",b:"#bbf7d0"}].map(({l,v,c,bg,b})=>(
              <div key={l} style={{background:bg,borderRadius:12,padding:"14px",textAlign:"center",border:`1px solid ${b}`}}>
                <div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:11.5,color:"#64748b",marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Actions prioritaires</div>
            {nextTasks.length===0?<div style={{background:"#f0fdf4",borderRadius:10,padding:"14px",textAlign:"center",fontSize:13.5,color:"#16a34a",fontWeight:600,border:"1px solid #bbf7d0"}}>Toutes les tâches sont complètes !</div>
            :nextTasks.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"11px 13px",background:"#f8fafc",borderRadius:10,marginBottom:8,border:"1px solid #e8edf5"}}>
                <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</div>
                <div><div style={{fontSize:13,fontWeight:700,marginBottom:1}}>{c.label}</div><div style={{fontSize:12,color:"#64748b"}}>{c.action}</div></div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Notes & observations</div>
            <textarea className="ta" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} onBlur={saveNotes} placeholder="Actions réalisées, résultats observés, prochaines étapes…" style={{minHeight:"auto"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
function Library(){
  const [cat,   setCat]   = useState(0);
  const [copyId,setCopyId]= useState(null);
  const [search,setSearch]= useState("");
  const copy=(content,id)=>{navigator.clipboard.writeText(content).then(()=>{setCopyId(id);setTimeout(()=>setCopyId(null),2000);});};
  const filtered=search?LIBRARY.map(c=>({...c,templates:c.templates.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())||t.content.toLowerCase().includes(search.toLowerCase()))})).filter(c=>c.templates.length>0):[LIBRARY[cat]];

  return(
    <div style={{padding:"28px 32px"}} className="fade">
      <div style={{marginBottom:22}}>
        <div style={{...serif,fontSize:30,color:"#0f172a",marginBottom:2}}>Bibliothèque de ressources</div>
        <div style={{fontSize:13,color:"#94a3b8"}}>Modèles de posts prêts à l emploi · sans emoji</div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:18,flexWrap:"wrap"}}>
        <input className="inp" style={{maxWidth:280,background:"#fff"}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un modèle…"/>
        {!search&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {LIBRARY.map((c,i)=>(
            <button key={i} onClick={()=>setCat(i)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${cat===i?c.color:"#e2e8f0"}`,background:cat===i?c.bg:"#fff",color:cat===i?c.color:"#64748b",fontWeight:cat===i?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12.5,transition:"all .2s"}}>{c.cat}</button>
          ))}
        </div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {filtered.flatMap(catItem=>catItem.templates.map((tpl,i)=>{
          const libCat=search?LIBRARY.find(c=>c.templates.includes(tpl))||LIBRARY[0]:LIBRARY[cat];
          const tid=`${libCat.cat}-${i}`;
          return(
            <div key={tid} className="card" style={{borderTop:`3px solid ${libCat.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{background:libCat.color,color:"#fff",borderRadius:7,padding:"3px 12px",fontSize:11.5,fontWeight:700}}>{tpl.title}</span>
                <button onClick={()=>copy(tpl.content,tid)} style={{background:copyId===tid?"#16a34a":libCat.color,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12.5,cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"background .2s"}}>
                  {copyId===tid?"Copié !":"Copier"}
                </button>
              </div>
              <pre style={{fontSize:12.5,color:"#374151",lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"inherit",background:libCat.bg,borderRadius:9,padding:"12px",border:`1px solid ${libCat.b}`,maxHeight:200,overflowY:"auto",margin:0}}>{tpl.content}</pre>
            </div>
          );
        }))}
      </div>
      <div className="card" style={{marginTop:20,background:"#fafbff",border:"1.5px solid #e0e7ff",textAlign:"center",padding:"22px"}}>
        <div style={{...serif,fontSize:18,color:"#1e293b",marginBottom:8}}>Personnalisez les modèles</div>
        <div style={{fontSize:13,color:"#64748b",lineHeight:1.8}}>
          Remplacez <strong style={{color:"#6366f1"}}>[VotreVille]</strong>, <strong style={{color:"#6366f1"}}>[VotreMétier]</strong>, <strong style={{color:"#6366f1"}}>[Téléphone]</strong> par les informations réelles du client avant de publier.
        </div>
      </div>
    </div>
  );
}
function autoSchedulePosts(postIdeas, auditDate){
  const calPosts={};
  const DAYMAP={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5,Samedi:6,Dimanche:0};
  const start=new Date(auditDate);
  const dow=start.getDay();
  const toMon=dow===1?0:dow===0?1:8-dow;
  start.setDate(start.getDate()+toMon);
  (postIdeas||[]).slice(0,12).forEach((post,i)=>{
    const ws=new Date(start);ws.setDate(start.getDate()+i*7);
    const td=DAYMAP[post.bestDay]??1;
    const cd=ws.getDay()===0?7:ws.getDay();
    const diff=td-cd;
    const pd=new Date(ws);pd.setDate(ws.getDate()+(diff>=0?diff:diff+7));
    const key=`${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,"0")}-${String(pd.getDate()).padStart(2,"0")}`;
    if(!calPosts[key])calPosts[key]=[];
    calPosts[key].push({id:Date.now()+i,type:post.type,title:post.title,content:post.content||"",keywords:post.keywords||[],cta:post.cta||"",week:post.week||i+1,done:false,fromAudit:true});
  });
  return calPosts;
}
// ─── LOGIN ────────────────────────────────────────────────────────────────────
function ProspectionPage({apiKey, hasEnvKey, go, upd: updClients, clients: allClients}){
  const [prospects, setProspects] = useState(loadProspects);
  const [view,      setView]      = useState("pipeline");
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [showAdd,   setShowAdd]   = useState(false);
  const [showImport,setShowImport]= useState(false);
  const [importText,setImportText]= useState("");
  const [importErr, setImportErr] = useState("");
  const [newP,      setNewP]      = useState({name:"",city:"",category:"",phone:"",email:"",website:"",address:"",type:"",note:"",reviewCount:""});
  const [sortBy,    setSortBy]    = useState("dateAdded");
  const [sortDir,   setSortDir]   = useState("desc");
  const [catFilter, setCatFilter] = useState("all");

  // Drag & drop pour réorganiser les prospects
  const [dragIdx,   setDragIdx]   = useState(null);
  const [dragOver,  setDragOver]  = useState(null);

  const onDragStart = (e,id) => { setDragIdx(id); e.dataTransfer.effectAllowed="move"; };
  const onDragOver  = (e,id) => { e.preventDefault(); setDragOver(id); };
  const onDragEnd   = () => { setDragIdx(null); setDragOver(null); };
  const onDrop      = (e, targetId, stageId) => {
    e.preventDefault();
    if(!dragIdx||dragIdx===targetId) return;
    const list = stageId
      ? prospects.filter(p=>p.status===stageId)
      : displayed;
    const fromIdx = list.findIndex(p=>p.id===dragIdx);
    const toIdx   = list.findIndex(p=>p.id===targetId);
    if(fromIdx<0||toIdx<0) return;
    // Déplacer dans le tableau global
    const newList = [...prospects];
    const fromGlobal = newList.findIndex(p=>p.id===dragIdx);
    const toGlobal   = newList.findIndex(p=>p.id===targetId);
    const [moved]    = newList.splice(fromGlobal,1);
    newList.splice(toGlobal,0,moved);
    upd(newList);
    setDragIdx(null); setDragOver(null);
  };

  const upd = (next) => { setProspects(next); saveProspects(next); };
  const del = (id) => { upd(prospects.filter(p=>p.id!==id)); if(selected?.id===id) setSelected(null); };
  const updateStatus = (id, status) => {
    const next = prospects.map(p=>p.id===id?{...p,status,dateLastContact:new Date().toISOString()}:p);
    upd(next); if(selected?.id===id) setSelected({...selected,status,dateLastContact:new Date().toISOString()});
  };
  const updateNote = (id, notes) => { const next = prospects.map(p=>p.id===id?{...p,notes}:p); upd(next); };
  const addEmail = (id, email) => {
    const next = prospects.map(p=>p.id===id?{...p,emails:[...(p.emails||[]),email]}:p);
    upd(next); if(selected?.id===id) setSelected({...selected,emails:[...(selected.emails||[]),email]});
  };
  const addProspect = () => {
    if(!newP.name.trim()) return;
    const p={...newP,id:Date.now(),status:"nouveau",emails:[],dateAdded:new Date().toISOString()};
    upd([...prospects,p]); setNewP({name:"",city:"",category:"",phone:"",email:"",note:"",reviewCount:""}); setShowAdd(false);
  };

  // Import CSV/Excel collé
  const parseImport = () => {
    setImportErr("");
    const lines = importText.trim().split("\n").filter(l=>l.trim());
    if(!lines.length){ setImportErr("Aucune donnée détectée"); return; }
    const added = [];
    lines.forEach((line,i)=>{
      const sep = line.includes("\t")?"\t":line.includes(";")?";":","
      const cols = line.split(sep).map(c=>c.trim().replace(/^"|"$/g,""));
      if(!cols[0]) return;

      // Format Sara : Nom · Adresse · Téléphone · Email · Site · Note · Avis · Flag · Statut · Type · Ville
      const rawName    = cols[0]||"";
      const rawAddress = cols[1]||"";
      const rawPhone   = cols[2]||"";
      const rawEmail   = cols[3]||"";
      const rawWebsite = cols[4]||"";
      const rawNote    = cols[5]||"";
      const rawAvis    = cols[6]||"";
      // cols[7] = flag ignoré
      const rawType    = cols[9]||"";
      const rawCity    = cols[10]||"";

      // Nettoyer l'adresse : supprimer le nom s'il est préfixé
      const address = rawAddress.startsWith(rawName)
        ? rawAddress.slice(rawName.length).replace(/^[\s,]+/,"").trim()
        : rawAddress;

      // Extraire ville depuis code postal si colonne vide
      const city = rawCity || (address.match(/\d{5}\s+([A-Za-zÀ-ÿ\s]+)/)?.[1]?.trim()) || "";

      // Formater téléphone (33... → 0...)
      const phone = rawPhone
        ? (rawPhone.startsWith("33")&&!rawPhone.startsWith("+")?"0"+rawPhone.slice(2):rawPhone)
        : "";

      added.push({
        id: Date.now()+i,
        name: rawName, address, city,
        category: rawType,
        phone, email: rawEmail, website: rawWebsite,
        note: rawNote, reviewCount: rawAvis,
        status: "nouveau", icon: "🏢",
        emails: [], notes: "",
        dateAdded: new Date().toISOString(),
      });
    });
    if(!added.length){ setImportErr("Format non reconnu"); return; }
    upd([...prospects,...added]);
    setShowImport(false); setImportText("");
    setImportErr(`✅ ${added.length} prospect(s) importé(s)`);
  };

  const stageCount = (id) => prospects.filter(p=>p.status===id).length;
  const totalSigned = prospects.filter(p=>p.status==="signe").length;
  const convRate = prospects.length>0?Math.round((totalSigned/prospects.length)*100):0;
  const cats=[...new Set(prospects.map(p=>p.category||"").filter(Boolean))].sort();
  const displayed = (filter==="all"?prospects:prospects.filter(p=>p.status===filter))
    .filter(p=>catFilter==="all"||p.category===catFilter)
    .sort((a,b)=>{
      const dir=sortDir==="asc"?1:-1;
      if(sortBy==="note") return (parseFloat(a.note)||0)>(parseFloat(b.note)||0)?dir:-dir;
      if(sortBy==="reviewCount") return (parseInt(a.reviewCount)||0)>(parseInt(b.reviewCount)||0)?dir:-dir;
      if(sortBy==="name") return a.name.localeCompare(b.name)*dir;
      return (new Date(b.dateAdded||0)-new Date(a.dateAdded||0))*dir;
    });
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(col);setSortDir("desc");}};

  return(
    <div style={{display:"flex",height:"100%",background:"#F4F5FA",overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ── HEADER ── */}
        <div style={{background:"white",borderBottom:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#1E1B30",letterSpacing:"-.02em"}}>◉ Prospection</div>
            <div style={{fontSize:12.5,color:"#6B7280",marginTop:2}}>
              {prospects.length} prospects · {totalSigned} signés · {convRate}% conversion
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* Vue toggle */}
            <div style={{display:"flex",background:"#F4F5FA",borderRadius:9,padding:3,border:"1px solid #E5E7EB"}}>
              {[{id:"pipeline",l:"Pipeline"},{id:"list",l:"Liste"}].map(v=>(
                <button key={v.id} onClick={()=>setView(v.id)}
                  style={{padding:"6px 14px",borderRadius:7,border:"none",background:view===v.id?"white":"transparent",color:view===v.id?"#1E1B30":"#6B7280",fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12.5,boxShadow:view===v.id?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .15s"}}>
                  {v.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowImport(!showImport)}
              style={{padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12.5,display:"flex",alignItems:"center",gap:6}}>
              📥 Importer
            </button>
            <button onClick={()=>setShowAdd(!showAdd)}
              style={{padding:"8px 16px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
              + Ajouter
            </button>
          </div>
        </div>

        {/* ── IMPORT CSV ── */}
        {showImport&&(
          <div style={{background:"#FDF2F8",borderBottom:"1px solid #FBCFE8",padding:"16px 24px",flexShrink:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#3B5BDB",marginBottom:8}}>📥 Importer depuis Excel / CSV</div>
            <div style={{fontSize:12,color:"#6B40D8",marginBottom:10,lineHeight:1.6}}>
              Copiez vos colonnes depuis Excel et collez ici. Format attendu (une ligne par prospect) :<br/>
              <strong>Nom · Ville · Catégorie · Téléphone · Email · Note Google · Nb avis</strong>
            </div>
            <textarea className="ta" rows={6} value={importText} onChange={e=>setImportText(e.target.value)}
              placeholder={"Plomberie Dupont\tVannes\tPlombier\t06 12 34 56 78\tcontact@dupont.fr\t4.2\t38\nRestaurant Le Port\tAuray\tRestaurant\t02 97 XX XX XX\t\t4.8\t142"}
              style={{margin:"0 0 10px",fontSize:12,fontFamily:"monospace"}}/>
            {importErr&&<div style={{fontSize:12.5,color:"#dc2626",marginBottom:8}}>{importErr}</div>}
            <div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={parseImport}>Importer {importText.trim().split("\n").filter(l=>l.trim()).length} ligne(s)</button>
              <button className="btn-ghost" onClick={()=>{setShowImport(false);setImportText("");setImportErr("");}}>Annuler</button>
            </div>
          </div>
        )}

        {/* ── AJOUT RAPIDE ── */}
        {showAdd&&(
          <div style={{background:"white",borderBottom:"1px solid #E5E7EB",padding:"16px 24px",flexShrink:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1E1B30",marginBottom:12}}>+ Nouveau prospect</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
              {[{k:"name",l:"Nom *",ph:"Plomberie Dupont"},{k:"city",l:"Ville",ph:"Vannes"},{k:"category",l:"Secteur",ph:"Plombier"},{k:"phone",l:"Téléphone",ph:"06 12 34 56 78"},{k:"email",l:"Email",ph:"contact@..."},{k:"website",l:"Site web",ph:"www.dupont.fr"},{k:"note",l:"Note Google",ph:"4.2",type:"number"},{k:"reviewCount",l:"Nb avis",ph:"38",type:"number"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>{f.l}</div>
                  <input className="inp" type={f.type||"text"} value={newP[f.k]} onChange={e=>setNewP({...newP,[f.k]:e.target.value})} placeholder={f.ph} style={{margin:0,fontSize:12.5}}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={addProspect} disabled={!newP.name.trim()}>Ajouter</button>
              <button className="btn-ghost" onClick={()=>setShowAdd(false)}>Annuler</button>
            </div>
          </div>
        )}

        {/* ── KPIs stages cliquables ── */}
        <div style={{display:"flex",gap:10,padding:"14px 24px",flexShrink:0,overflowX:"auto",background:"white",borderBottom:"1px solid #E5E7EB"}}>
          {PIPELINE_STAGES.map(s=>(
            <div key={s.id} onClick={()=>setFilter(filter===s.id?"all":s.id)}
              style={{background:filter===s.id?s.bg:"#F4F5FA",borderRadius:10,padding:"10px 14px",border:`1.5px solid ${filter===s.id?s.b:"#E5E7EB"}`,cursor:"pointer",flexShrink:0,minWidth:100,transition:"all .15s",textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:900,color:filter===s.id?s.color:"#1E1B30"}}>{stageCount(s.id)}</div>
              <div style={{fontSize:10.5,color:filter===s.id?s.color:"#6B7280",fontWeight:600,marginTop:2}}>{s.label}</div>
            </div>
          ))}
          {/* Taux de conversion */}
          <div style={{marginLeft:"auto",padding:"10px 16px",background:"#F0FDF4",borderRadius:10,border:"1px solid #BBF7D0",textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:20,fontWeight:900,color:"#059669"}}>{convRate}%</div>
            <div style={{fontSize:10.5,color:"#059669",fontWeight:600,marginTop:2}}>Conversion</div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>

          {/* Pipeline */}
          {view==="pipeline"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,alignItems:"start"}}>
              {PIPELINE_STAGES.map(stage=>{
                const cards=prospects.filter(p=>p.status===stage.id);
                return(
                  <div key={stage.id}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"7px 10px",borderRadius:9,background:stage.bg,border:`1px solid ${stage.b}`}}>
                      <span style={{fontSize:13}}>{stage.icon}</span>
                      <span style={{fontSize:11.5,fontWeight:700,color:stage.color}}>{stage.label}</span>
                      <span style={{marginLeft:"auto",fontSize:11,fontWeight:800,color:stage.color,background:"rgba(255,255,255,.7)",borderRadius:20,padding:"1px 7px"}}>{cards.length}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {cards.map(p=>(
                        <div key={p.id}
                          draggable
                          onDragStart={e=>onDragStart(e,p.id)}
                          onDragOver={e=>onDragOver(e,p.id)}
                          onDrop={e=>onDrop(e,p.id,stage.id)}
                          onDragEnd={onDragEnd}
                          style={{opacity:(dragIdx===p.id)?0.5:1,outline:dragOver===p.id?"2px solid #6B40D8":"none",borderRadius:12,transition:"opacity .15s"}}>
                          <ProspectCard prospect={p} stage={stage} onSelect={()=>setSelected(p)} onStatusChange={updateStatus} isSelected={selected?.id===p.id}/>
                        </div>
                      ))}
                      {!cards.length&&<div style={{padding:"18px",textAlign:"center",fontSize:12,color:"#9CA3AF",background:"white",borderRadius:10,border:"1px dashed #E5E7EB"}}>—</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Liste */}
          {view==="list"&&(
            <div style={{background:"white",borderRadius:14,border:"1px solid #E5E7EB",overflow:"hidden"}}>
              {/* En-tête */}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",padding:"10px 16px",background:"#F4F5FA",borderBottom:"1px solid #E5E7EB",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px"}}>
                {[
                  {l:"Établissement",k:null},
                  {l:"Ville",k:"name"},
                  {l:"Type",k:null},
                  {l:"Note",k:"note"},
                  {l:"Avis",k:"reviewCount"},
                  {l:"Statut",k:null},
                  {l:"Audit",k:null},
                  {l:"Action",k:null},
                ].map(({l,k})=>(
                  <div key={l} onClick={k?()=>toggleSort(k):undefined}
                    style={{cursor:k?"pointer":"default",display:"flex",alignItems:"center",gap:4,userSelect:"none"}}
                    onMouseEnter={e=>{if(k)e.currentTarget.style.color="#6B40D8";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#9CA3AF";}}>
                    {l}
                    {k&&sortBy===k&&<span style={{fontSize:10}}>{sortDir==="desc"?"↓":"↑"}</span>}
                  </div>
                ))}
              </div>
              {displayed.length===0?(
                <div style={{padding:"48px",textAlign:"center",color:"#9CA3AF",fontSize:13}}>
                  <div style={{fontSize:32,marginBottom:8}}>🎯</div>Aucun prospect
                </div>
              ):displayed.map((p,i)=>{
                const stage=PIPELINE_STAGES.find(s=>s.id===p.status)||PIPELINE_STAGES[0];
                const hasAudit=!!(p.auditData||p.gmb_score);
                const auditDate=p.auditDate?new Date(p.auditDate).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}):"";
                const noteVal=parseFloat(p.note)||0;
                return(
                  <div key={p.id} onClick={()=>setSelected(p)}
                    draggable
                    onDragStart={e=>onDragStart(e,p.id)}
                    onDragOver={e=>onDragOver(e,p.id)}
                    onDrop={e=>onDrop(e,p.id,null)}
                    onDragEnd={onDragEnd}
                    style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 16px",borderBottom:i<displayed.length-1?"1px solid #F3F4F6":"none",alignItems:"center",cursor:"pointer",transition:"background .12s",
                      opacity:dragIdx===p.id?.4:1,
                      background:dragOver===p.id?"#FDF2F8":"white"}}
                    onMouseEnter={e=>{if(dragIdx!==p.id)e.currentTarget.style.background="#F4F5FA";}}
                    onMouseLeave={e=>{if(dragIdx!==p.id)e.currentTarget.style.background=dragOver===p.id?"#FDF2F8":"white";}}>

                    {/* Établissement + emoji éditable */}
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div
                        onClick={e=>{e.stopPropagation();const em=prompt("Choisir un emoji :",p.icon||"🏢");if(em){const next=prospects.map(pr=>pr.id===p.id?{...pr,icon:em}:pr);upd(next);}}}
                        title="Cliquer pour changer l'emoji"
                        style={{width:34,height:34,borderRadius:9,background:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,cursor:"pointer",border:"1px solid #E5E7EB",transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#E5E7EB"}
                        onMouseLeave={e=>e.currentTarget.style.background="#F3F4F6"}>
                        {p.icon||"🏢"}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:"#1E1B30",lineHeight:1.2}}>{p.name}</div>
                      </div>
                    </div>

                    {/* Ville */}
                    <div style={{fontSize:12.5,color:"#374151"}}>{p.city||"—"}</div>

                    {/* Type */}
                    <div style={{fontSize:12.5,color:"#374151",fontWeight:500}}>{p.category||"—"}</div>

                    {/* Note */}
                    <div style={{fontWeight:800,fontSize:13.5,color:noteVal>=4?"#059669":noteVal>0?"#dc2626":"#D1D5DB"}}>
                      {noteVal?`★ ${noteVal}`:"—"}
                    </div>

                    {/* Avis */}
                    <div style={{fontSize:13,color:"#374151",fontWeight:600}}>{p.reviewCount||"—"}</div>

                    {/* Statut */}
                    <div>
                      <span style={{fontSize:11,padding:"4px 10px",borderRadius:20,fontWeight:700,background:stage.bg,color:stage.color,border:`1px solid ${stage.b}`,whiteSpace:"nowrap"}}>
                        {stage.label}
                      </span>
                    </div>

                    {/* Audit */}
                    <div onClick={e=>e.stopPropagation()}>
                      {hasAudit?(
                        <span style={{fontSize:11,fontWeight:700,color:"#059669",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:20,padding:"4px 10px",whiteSpace:"nowrap"}}>
                          ✓ {auditDate}
                        </span>
                      ):(
                        <span style={{fontSize:11,fontWeight:600,color:"#9CA3AF",background:"#F4F5FA",border:"1px solid #E5E7EB",borderRadius:20,padding:"4px 10px",whiteSpace:"nowrap"}}>
                          Non fait
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div onClick={e=>e.stopPropagation()}>
                      {!hasAudit?(
                        <button onClick={()=>{ window._prospectToAudit=p; go&&go("audit"); }}
                          style={{fontSize:11.5,padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap"}}>
                          + Audit
                        </button>
                      ):(
                        <button onClick={()=>setSelected(p)}
                          style={{fontSize:11.5,padding:"5px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#6B40D8",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                          Voir →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panneau prospect sélectionné */}
      {selected&&(
        <ProspectPanel
          prospect={selected}
          onClose={()=>setSelected(null)}
          onStatusChange={updateStatus}
          onNoteChange={updateNote}
          onEmailAdd={addEmail}
          onDelete={del}
          onConvert={(p)=>{
            if(!p.clientRef) return;
            // Marquer comme converti
            const next=prospects.map(pr=>pr.id===p.id?{...pr,status:"signe",converted:true}:pr);
            upd(next); setSelected(null);
          }}
          apiKey={apiKey} hasEnvKey={hasEnvKey}
        />
      )}
    </div>
  );
}

// ─── PROSPECT CARD (Pipeline) ─────────────────────────────────────────────────
function ProspectCard({prospect:p, stage, onSelect, onStatusChange, isSelected}){
  return(
    <div onClick={onSelect}
      style={{background:isSelected?"#ffffff":"var(--surface)",borderRadius:12,padding:"12px 14px",border:`1.5px solid ${isSelected?"var(--indigo)":stage.b}`,cursor:"pointer",transition:"all .15s",boxShadow:isSelected?"0 0 0 2px #b8b8f8":"none"}}>
      <div style={{fontWeight:700,fontSize:12.5,color:"var(--ink)",marginBottom:4,lineHeight:1.3}}>{p.name}</div>
      <div style={{fontSize:11.5,color:"var(--ink4)",marginBottom:8}}>{p.category||""}{p.city?` · ${p.city}`:""}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:p.weakPoints?.length?8:0}}>
        {p.note&&<span style={{fontSize:10.5,padding:"1px 7px",borderRadius:20,fontWeight:700,background:parseFloat(p.note)<4?"#fef2f2":"#ffffff",color:parseFloat(p.note)<4?"#dc2626":"#059669"}}>★ {p.note}</span>}
        {p.reviewCount!==undefined&&<span style={{fontSize:10.5,padding:"1px 7px",borderRadius:20,background:"#F4F5FA",color:"#6B40D8",fontWeight:600}}>{p.reviewCount} avis</span>}
      </div>
      {(p.weakPoints||[]).slice(0,2).map((w,i)=>(
        <div key={i} style={{fontSize:10.5,color:"#dc2626",display:"flex",gap:4,alignItems:"flex-start",marginBottom:2}}>
          <span style={{flexShrink:0}}>⚠</span><span style={{lineHeight:1.3}}>{w}</span>
        </div>
      ))}
      {p.dateLastContact&&<div style={{fontSize:10,color:"var(--ink4)",marginTop:6}}>Dernier contact : {new Date(p.dateLastContact).toLocaleDateString("fr-FR")}</div>}
    </div>
  );
}

// ─── ADD PROSPECT FORM ────────────────────────────────────────────────────────
function AddProspectForm({onAdd, onCancel, apiKey:apiKeyProp, hasEnvKey}){
  // Flow : 1=fiche  2=analyse  3=email+envoi
  const [step,       setStep]      = useState(1);
  const [fiche,      setFiche]     = useState("");
  const [name,       setName]      = useState("");
  const [category,   setCategory]  = useState("");
  const [city,       setCity]      = useState("");
  const [phone,      setPhone]     = useState("");
  const [email,      setEmail]     = useState("");
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [analysis,   setAnalysis]  = useState(null);
  const [genEmail,   setGenEmail]  = useState(null);
  const [emailLoading,setEmailLoading] = useState(false);
  const [copied,     setCopied]    = useState(null);
  const [localApiKey,setLocalApiKey] = useState(apiKeyProp||"");
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localApiKey || apiKeyProp || "";
  const hasKey = hasEnvKey || !!apiKey.trim();

  // ── ÉTAPE 2 : Analyser la fiche ──────────────────────────────────────────────
  const analyze = async () => {
    if(!fiche.trim()) return;
    setLoading(true); setError("");
    const key = apiKey;
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:2500,
          system:"Tu es expert GMB et SEO local. Tu analyses des fiches Google Business Profile avec le meme systeme de scoring qu un audit complet. Reponds UNIQUEMENT en JSON valide.",
          messages:[
            {role:"user", content:`Analyse cette fiche Google Business Profile comme un audit GMB complet.

FICHE :
${fiche}

Evalue chaque critere a true (present/OK), false (absent/insuffisant) ou null (impossible a determiner).

JSON attendu :
{
  "name": "nom extrait",
  "category": "categorie principale",
  "city": "ville",
  "phone": "tel ou null",
  "website": "url ou null",
  "note": "ex: 3.8 ou null",
  "reviewCount": "ex: 12 ou null",
  "scores": {
    "business_name": true, "category_primary": true, "category_secondary": false,
    "address": true, "service_area": null, "phone": true, "website": false,
    "hours_regular": false, "hours_special": false, "chat_link": false,
    "desc_length": false, "desc_keywords": false, "attributes": false,
    "services_listed": false, "products_listed": false, "social_links": false,
    "photo_count": false, "photo_cover": null, "photo_logo": null,
    "photo_interior": null, "photo_team": null, "photo_recent": null,
    "rating": false, "review_count": false, "response_rate": false,
    "response_quality": false, "recent_reviews": false,
    "posts_frequency": false, "posts_cta": false, "posts_offers": false, "posts_variety": false,
    "booking_link": false, "menu_or_services": false, "qr_reviews": false
  },
  "potentialReason": "Pourquoi ce prospect est interessant commercialement (1 phrase)",
  "quickWins": ["Action prioritaire 1", "Action 2", "Action 3"]
}`},
            {role:"assistant", content:"{"}
          ]
        })
      });
      const d = await res.json();
      const raw = "{" + (d.content||[]).map(b=>b.text||"").join("").trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||raw);
      const scores = parsed.scores || {};
      const realScore = calcScore(scores);
      const lvl = getLvl(realScore);
      const potential = realScore < 30 ? "Tres eleve" : realScore < 50 ? "Eleve" : realScore < 70 ? "Moyen" : "Faible";
      const failedCriteria = ALL.filter(c => scores[c.id] === false);
      const okCriteria = ALL.filter(c => scores[c.id] === true);
      const analysis = {
        ...parsed, scores, realScore, lvl, potential,
        failedCriteria, okCriteria,
        weakPoints: failedCriteria.slice(0,5).map(c => c.action),
        strengths: okCriteria.slice(0,4).map(c => c.label),
      };
      setAnalysis(analysis);
      if(!name && parsed.name)         setName(parsed.name);
      if(!category && parsed.category) setCategory(parsed.category);
      if(!city && parsed.city)         setCity(parsed.city);
      if(!phone && parsed.phone)       setPhone(parsed.phone);
      setStep(2);
    }catch(e){
      setError("Erreur d analyse. Verifiez la cle API ou le contenu colle.");
    }
    setLoading(false);
  };

  // ── ÉTAPE 3 : Générer l'email de prospection ─────────────────────────────────
  const generateEmail = async () => {
    setEmailLoading(true); setError("");
    const key = apiKey;
    const n = name || analysis?.name || "cet établissement";
    const c = category || analysis?.category || "";
    const ci = city || analysis?.city || "";
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1500,
          system:"Tu es Sara Baudouin, expert SEO local à Vannes, fondatrice de BeTheOne. Tu écris des emails de prospection courts, personnalisés et percutants. Réponds UNIQUEMENT en JSON.",
          messages:[
            {role:"user", content:`Rédige un email de prospection commerciale pour ce prospect.

Établissement : "${n}" — ${c} à ${ci}
Note Google : ${analysis?.note||"?"}/5 · ${analysis?.reviewCount||"?"} avis
Points faibles identifiés :
${(analysis?.failedCriteria||analysis?.weakPoints||[]).slice(0,3).map((c,i)=>`${i+1}. ${c.action||c}`).join("\n")}

Quick wins à proposer :
${(analysis?.quickWins||[]).map((w,i)=>`- ${w}`).join("\n")}

RÈGLES :
- Email court (120-160 mots max), percutant, humain — PAS de formule corporate
- Commencer directement par une accroche sur leur problème spécifique
- Mentionner 1-2 points faibles concrets comme preuve que tu as regardé leur fiche
- Proposer un appel découverte de 15 minutes
- Signature : Sara Baudouin — BeTheOne, Vannes — 06 51 17 69 10

JSON : {"subject": "...", "body": "...", "whatsapp": "Message WhatsApp court (50 mots max) avec le même angle"}`},
            {role:"assistant", content:"{"}
          ]
        })
      });
      const d = await res.json();
      const raw = "{" + (d.content||[]).map(b=>b.text||"").join("").trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||raw);
      setGenEmail(parsed);
      setStep(3);
    }catch(e){
      setError("Erreur génération email. Réessayez.");
    }
    setEmailLoading(false);
  };

  // ── Sauvegarder et terminer ───────────────────────────────────────────────────
  const save = () => {
    const prospect = {
      id: Date.now().toString(),
      name:     name || analysis?.name || "Prospect",
      category: category || analysis?.category || "",
      city:     city || analysis?.city || "",
      phone:    phone || analysis?.phone || null,
      email:    email || null,
      website:  analysis?.website || null,
      note:     analysis?.note || null,
      reviewCount: analysis?.reviewCount || null,
      ficheContent: fiche,
      weakPoints:   analysis?.weakPoints || [],
      strengths:    analysis?.strengths || [],
      score:        analysis?.realScore || 0,
      potential:    analysis?.potential || "Moyen",
      potentialReason: analysis?.potentialReason || "",
      quickWins:    analysis?.quickWins || [],
      emails: genEmail ? [{
        subject: genEmail.subject,
        body:    genEmail.body,
        whatsapp:genEmail.whatsapp,
        date:    new Date().toISOString(),
        sent:    false
      }] : [],
      status: "prospect",
      notes: "",
      dateAdded: new Date().toISOString(),
      dateLastContact: null,
    };
    onAdd(prospect);
  };

  const STEPS = [
    {n:1, label:"Coller la fiche", icon:"📋"},
    {n:2, label:"Analyse",         icon:"🔍"},
    {n:3, label:"Email & Envoi",   icon:"📧"},
  ];

  const Stepper = () => (
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28}}>
      {STEPS.map((s,i)=>(
        <div key={s.n} style={{display:"contents"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,
            background:step===s.n?"#ffffff":step>s.n?"#ffffff":"transparent",
            border:`1.5px solid ${step===s.n?"var(--indigo)":step>s.n?"#e8e0ff":"var(--border)"}`,
            cursor:step>s.n?"pointer":"default",transition:"all .2s"}}
            onClick={()=>step>s.n&&setStep(s.n)}>
            <div style={{width:24,height:24,borderRadius:"50%",
              background:step>s.n?"#059669":step===s.n?"var(--indigo)":"var(--border)",
              color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:step>s.n?12:11,fontWeight:800,flexShrink:0}}>
              {step>s.n?"✓":s.n}
            </div>
            <span style={{fontSize:12.5,fontWeight:700,
              color:step===s.n?"var(--indigo)":step>s.n?"#059669":"var(--ink4)",
              whiteSpace:"nowrap"}}>{s.icon} {s.label}</span>
          </div>
          {i<2&&<div style={{flex:1,height:2,background:step>s.n?"#e8e0ff":"var(--border)",margin:"0 4px",transition:"background .3s"}}/>}
        </div>
      ))}
    </div>
  );

  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"4px 0"}} className="fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{...serif,fontSize:22,color:"var(--ink)"}}>Nouveau prospect</div>
          <div style={{fontSize:12.5,color:"var(--ink4)",marginTop:2}}>
            {step===1?"Collez la fiche Google Maps du prospect":step===2?"Vérifiez l'analyse et complétez les infos":"Email prêt — choisissez comment l'envoyer"}
          </div>
        </div>
        <button className="btn-ghost" onClick={onCancel}>✕ Annuler</button>
      </div>

      <Stepper/>

      {/* ── ÉTAPE 1 : Coller la fiche ─────────────────────────────────────── */}
      {step===1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
          {/* Gauche : textarea fiche */}
          <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"22px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>
              📋 Fiche Google Maps du prospect
            </div>
            <div style={{background:"#F4F5FA",borderRadius:10,padding:"10px 13px",border:"1px solid #b8b8f8",marginBottom:14,fontSize:12,color:"#4338ca",lineHeight:1.6}}>
              Sur Google Maps, cherchez le prospect, cliquez sur sa fiche et copiez tout le texte visible (nom, adresse, note, avis, horaires, description…)
            </div>
            <textarea className="ta" rows={14} value={fiche} onChange={e=>setFiche(e.target.value)}
              style={{fontSize:13,lineHeight:1.7,resize:"vertical"}}
              placeholder={"Collez ici le contenu brut de la fiche Google Maps...\n\nEx :\nRestaurant Le Port\n★ 3.7 (23 avis) · Restaurant\n12 quai des Indes, 56000 Vannes\n02 97 XX XX XX\nFermé · Ouvre à 12:00\n\nDescription : Cuisine traditionnelle bretonne...\nServices : Sur place · À emporter\nAvis : \"Service lent...\" \"Cadre agréable mais...\""}/>
            {error&&<div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"#dc2626"}}>{error}</div>}
          </div>

          {/* Droite : infos complémentaires + action */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"22px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>
                ✏️ Infos optionnelles (pré-remplies par l'IA)
              </div>
              {[
                {label:"Nom",      val:name,     set:setName,     ph:"Auto-détecté"},
                {label:"Secteur",  val:category, set:setCategory, ph:"Auto-détecté"},
                {label:"Ville",    val:city,     set:setCity,     ph:"Auto-détecté"},
                {label:"Téléphone",val:phone,    set:setPhone,    ph:"Auto-détecté"},
                {label:"Email",    val:email,    set:setEmail,    ph:"contact@…"},
              ].map(f=>(
                <div key={f.label} style={{marginBottom:10}}>
                  <label style={{fontSize:11.5,color:"var(--ink3)",fontWeight:600,display:"block",marginBottom:4}}>{f.label}</label>
                  <input className="inp" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{margin:0}}/>
                </div>
              ))}
            </div>

            <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:16,padding:"18px 20px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.8)",marginBottom:8}}>L'IA va identifier</div>
              {["Nom, ville, note extraits auto","Points faibles de la fiche","Score de potentiel commercial","Quick wins à proposer"].map((t,i)=>(
                <div key={i} style={{fontSize:12,color:"rgba(255,255,255,.9)",display:"flex",gap:7,marginBottom:5}}>
                  <span style={{color:"#a5f3fc",fontWeight:700}}>✓</span>{t}
                </div>
              ))}
            </div>

            {!hasEnvKey&&(
              <div style={{background:"#fffbeb",borderRadius:12,padding:"12px 14px",border:"1px solid #fde68a"}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#92400e",marginBottom:6}}>🔑 Clé API Anthropic</div>
                <input className="inp" type="password" value={localApiKey} onChange={e=>setLocalApiKey(e.target.value)}
                  placeholder="sk-ant-api03-…" style={{margin:0}}/>
              </div>
            )}

            <button className="btn" onClick={analyze}
              disabled={!fiche.trim()||loading||!hasKey}
              style={{fontSize:14,padding:"14px 20px",justifyContent:"center",opacity:(fiche.trim()&&hasKey&&!loading)?1:.4}}>
              {loading?(
                <><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin 1s linear infinite"}}/>Analyse en cours…</>
              ):!hasKey?"🔑 Clé API requise":"🔍 Analyser la fiche →"}
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Résultats analyse ──────────────────────────────────── */}
      {step===2&&analysis&&(
        <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:16,alignItems:"start"}}>
          {/* Gauche : score + critères par catégorie */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Score identique au vrai audit */}
            <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"20px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <div style={{width:64,height:64,borderRadius:14,background:analysis.lvl?.bg||"#fef2f2",border:`2px solid ${analysis.lvl?.border||"#fecaca"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:22,fontWeight:900,color:analysis.lvl?.color||"#dc2626",lineHeight:1}}>{analysis.realScore}</span>
                  <span style={{fontSize:9,color:analysis.lvl?.color||"#dc2626",fontWeight:700,marginTop:1}}>/ 100</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:"var(--ink)",marginBottom:2}}>{analysis.name||name}</div>
                  <div style={{fontSize:12,color:"var(--ink4)",marginBottom:6}}>{analysis.category||category}{analysis.city?` · ${analysis.city}`:""}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,padding:"2px 9px",borderRadius:20,fontWeight:700,background:analysis.lvl?.bg,color:analysis.lvl?.color,border:`1px solid ${analysis.lvl?.border}`}}>{analysis.lvl?.label}</span>
                    {analysis.note&&<span style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:parseFloat(analysis.note)<4?"#fef2f2":"#ffffff",color:parseFloat(analysis.note)<4?"#dc2626":"#059669",fontWeight:700}}>★ {analysis.note}/5</span>}
                    {analysis.reviewCount&&<span style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:"#F4F5FA",color:"#6B40D8",fontWeight:600}}>{analysis.reviewCount} avis</span>}
                  </div>
                </div>
              </div>
              {/* Barre de score */}
              <div style={{height:8,background:"#F4F5FA",borderRadius:4,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${analysis.realScore}%`,background:`linear-gradient(90deg,${analysis.lvl?.color||"#dc2626"},${analysis.lvl?.color||"#dc2626"}88)`,borderRadius:4,transition:"width 1s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--ink4)"}}>
                <span>{analysis.failedCriteria?.length||0} critères à corriger</span>
                <span>{analysis.okCriteria?.length||0} critères OK</span>
              </div>
              {analysis.potentialReason&&<div style={{marginTop:12,background:"#ffffff",borderRadius:9,padding:"9px 12px",fontSize:12.5,color:"#6B40D8",lineHeight:1.5,border:"1px solid #bbf7d0"}}>💡 {analysis.potentialReason}</div>}
            </div>

            {/* Critères échoués par catégorie CATS */}
            {CATS.map(cat=>{
              const failed = (analysis.failedCriteria||[]).filter(c=>cat.criteria.some(cc=>cc.id===c.id));
              const ok     = (analysis.okCriteria||[]).filter(c=>cat.criteria.some(cc=>cc.id===c.id));
              if(failed.length===0&&ok.length===0) return null;
              return(
                <div key={cat.id} style={{background:"var(--surface)",borderRadius:14,border:"1px solid var(--border)",padding:"14px 16px",boxShadow:"var(--shadow-sm)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                    <span style={{fontSize:15}}>{cat.icon}</span>
                    <span style={{fontSize:12.5,fontWeight:700,color:"var(--ink)"}}>{cat.label}</span>
                    <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:failed.length===0?"#059669":"#dc2626"}}>
                      {ok.length}/{ok.length+failed.length} OK
                    </span>
                  </div>
                  {failed.slice(0,3).map((c,i)=>(
                    <div key={c.id} style={{display:"flex",gap:7,padding:"6px 9px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca",marginBottom:5,alignItems:"flex-start"}}>
                      <span style={{color:"#dc2626",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>✗</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:"#7f1d1d"}}>{c.label}</div>
                        <div style={{fontSize:11,color:"#991b1b",marginTop:1}}>{c.action}</div>
                      </div>
                    </div>
                  ))}
                  {ok.slice(0,2).map((c,i)=>(
                    <div key={c.id} style={{display:"flex",gap:7,padding:"5px 9px",background:"#ffffff",borderRadius:8,border:"1px solid #bbf7d0",marginBottom:4,alignItems:"center"}}>
                      <span style={{color:"#059669",fontSize:11,fontWeight:700,flexShrink:0}}>✓</span>
                      <span style={{fontSize:12,color:"#6B40D8"}}>{c.label}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Droite : opportunité + contact + actions */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Potentiel commercial */}
            <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:16,padding:"18px 20px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>🎯 Potentiel commercial</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>
                {analysis.realScore < 30 ? "Très élevé 🔥" : analysis.realScore < 50 ? "Élevé ✅" : analysis.realScore < 70 ? "Moyen 📊" : "Faible 💤"}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.6,marginBottom:12}}>
                Fiche à <strong style={{color:"#f59e0b"}}>{analysis.realScore}%</strong> — {analysis.failedCriteria?.length||0} critères à optimiser = autant d'arguments de vente concrets
              </div>
              {(analysis.quickWins||[]).length>0&&(
                <div>
                  <div style={{fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Quick wins à proposer</div>
                  {analysis.quickWins.map((w,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:5}}>
                      <span style={{color:"#a5f3fc",fontWeight:700,flexShrink:0}}>→</span>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.85)",lineHeight:1.4}}>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infos contact */}
            <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"18px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>📞 Contact prospect</div>
              {[
                {label:"Téléphone", val:phone||analysis.phone||"",  set:setPhone, ph:"06 XX XX XX XX"},
                {label:"Email",     val:email,                       set:setEmail, ph:"contact@…"},
              ].map(f=>(
                <div key={f.label} style={{marginBottom:10}}>
                  <label style={{fontSize:11.5,color:"var(--ink3)",fontWeight:600,display:"block",marginBottom:4}}>{f.label}</label>
                  <input className="inp" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{margin:0}}/>
                </div>
              ))}
            </div>

            {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"#dc2626"}}>{error}</div>}

            <button className="btn" onClick={generateEmail}
              disabled={emailLoading||!hasKey}
              style={{fontSize:14,padding:"14px 20px",justifyContent:"center",opacity:emailLoading?.6:1}}>
              {emailLoading?(
                <><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin 1s linear infinite"}}/>Génération email…</>
              ):"✉️ Générer l'email de prospection →"}
            </button>
            <button className="btn-ghost" onClick={()=>setStep(1)} style={{justifyContent:"center",fontSize:12.5}}>← Modifier la fiche</button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : Email + Étapes d'envoi ─────────────────────────────── */}
      {step===3&&genEmail&&(
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,alignItems:"start"}}>
          {/* Email généré */}
          <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"22px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px"}}>📧 Email de prospection</div>
              <button onClick={()=>{navigator.clipboard.writeText(`Objet : ${genEmail.subject}\n\n${genEmail.body}`);setCopied("email");setTimeout(()=>setCopied(null),2500);}}
                style={{fontSize:12,padding:"5px 13px",borderRadius:8,border:"1px solid var(--border)",background:copied==="email"?"#059669":"var(--ground)",color:copied==="email"?"#fff":"var(--ink3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>
                {copied==="email"?"✓ Copié !":"📋 Copier tout"}
              </button>
            </div>

            {/* Objet */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Objet</div>
              <div style={{background:"#F4F5FA",borderRadius:9,padding:"10px 13px",border:"1px solid var(--border)",fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{genEmail.subject}</div>
            </div>

            {/* Corps */}
            <div>
              <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Corps de l'email</div>
              <div style={{background:"#F4F5FA",borderRadius:9,padding:"13px 15px",border:"1px solid var(--border)",fontSize:13,lineHeight:1.8,color:"var(--ink2)",whiteSpace:"pre-line",minHeight:180}}>
                {genEmail.body}
              </div>
            </div>

            {/* WhatsApp */}
            {genEmail.whatsapp&&(
              <div style={{marginTop:14}}>
                <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>💬 Version WhatsApp</div>
                <div style={{background:"#ffffff",borderRadius:9,padding:"11px 13px",border:"1px solid #bbf7d0",fontSize:12.5,color:"#6B40D8",lineHeight:1.7,whiteSpace:"pre-line"}}>
                  {genEmail.whatsapp}
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(genEmail.whatsapp);setCopied("whatsapp");setTimeout(()=>setCopied(null),2500);}}
                  style={{marginTop:7,fontSize:11.5,padding:"5px 12px",borderRadius:8,border:"1px solid #bbf7d0",background:copied==="whatsapp"?"#059669":"var(--surface)",color:copied==="whatsapp"?"#fff":"#059669",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>
                  {copied==="whatsapp"?"✓ Copié !":"📋 Copier WhatsApp"}
                </button>
              </div>
            )}
          </div>

          {/* Étapes d'envoi */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",padding:"20px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",marginBottom:16}}>🚀 Comment envoyer</div>
              {[
                {
                  n:"1", icon:"📋", label:"Copier l'email",
                  desc:"Cliquez 'Copier tout' ci-contre pour copier objet + corps",
                  action:()=>{navigator.clipboard.writeText(`Objet : ${genEmail.subject}\n\n${genEmail.body}`);setCopied("step1");setTimeout(()=>setCopied(null),2500);},
                  btnLabel: copied==="step1"?"✓ Copié !":"Copier",
                  done: copied==="step1"
                },
                {
                  n:"2", icon:"📧", label:"Ouvrir votre messagerie",
                  desc:`Ouvrez Gmail, Outlook ou Mail — collez l'email et envoyez à${email?" "+email:" l'adresse du prospect"}`,
                  action: email?()=>window.open(`mailto:${email}?subject=${encodeURIComponent(genEmail.subject)}&body=${encodeURIComponent(genEmail.body)}`):null,
                  btnLabel: email?"Ouvrir Mail →":"Adresse non renseignée",
                  done: false
                },
                {
                  n:"3", icon:"💬", label:"WhatsApp (optionnel)",
                  desc:(phone||analysis?.phone)?`Envoyez le message WhatsApp à ${phone||analysis?.phone}`:"Ajoutez un téléphone à l'étape 2",
                  action: (phone||analysis?.phone)?()=>window.open(`https://wa.me/${(phone||analysis?.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(genEmail.whatsapp||"")}`):null,
                  btnLabel: (phone||analysis?.phone)?"Ouvrir WhatsApp →":"Téléphone manquant",
                  done: false
                },
                {
                  n:"4", icon:"✅", label:"Sauvegarder + marquer envoyé",
                  desc:"Enregistrez ce prospect dans le pipeline avec statut 'Contacté'",
                  action: null, isSubmit: true
                },
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:11,padding:"12px 14px",borderRadius:12,background:s.done?"#ffffff":"var(--ground)",border:`1px solid ${s.done?"#e8e0ff":"var(--border)"}`,marginBottom:8,transition:"all .2s"}}>
                  <div style={{width:28,height:28,borderRadius:8,background:s.done?"#059669":s.isSubmit?"var(--indigo)":"#F4F5FA",color:s.done||s.isSubmit?"#fff":"var(--indigo)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:s.done?13:11,fontWeight:800,flexShrink:0}}>
                    {s.done?"✓":s.n}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{s.icon} {s.label}</div>
                    <div style={{fontSize:11.5,color:"var(--ink4)",lineHeight:1.4,marginBottom:s.action||s.isSubmit?7:0}}>{s.desc}</div>
                    {s.action&&<button onClick={s.action} style={{fontSize:11.5,padding:"4px 11px",borderRadius:7,border:"1px solid var(--border)",background:s.done?"#059669":"var(--surface)",color:s.done?"#fff":"var(--indigo)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>{s.btnLabel}</button>}
                    {s.isSubmit&&(
                      <div style={{display:"flex",gap:7}}>
                        <button className="btn" onClick={save} style={{fontSize:12,padding:"6px 14px"}}>✅ Sauvegarder → Contacté</button>
                        <button className="btn-ghost" onClick={()=>{const p={id:Date.now().toString(),name:name||analysis?.name||"Prospect",category:category||analysis?.category||"",city:city||analysis?.city||"",phone:phone||analysis?.phone||null,email:email||null,website:analysis?.website||null,note:analysis?.note||null,reviewCount:analysis?.reviewCount||null,ficheContent:fiche,weakPoints:(analysis?.failedCriteria||[]).slice(0,5).map(c=>c.action),strengths:(analysis?.okCriteria||[]).slice(0,4).map(c=>c.label),score:analysis?.realScore||0,potential:analysis?.potential||"Moyen",potentialReason:analysis?.potentialReason||"",quickWins:analysis?.quickWins||[],emails:[],status:"prospect",notes:"",dateAdded:new Date().toISOString(),dateLastContact:null};onAdd(p);}} style={{fontSize:12}}>Sauvegarder</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-ghost" onClick={()=>setStep(2)} style={{justifyContent:"center",fontSize:12.5}}>← Retour à l'analyse</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROSPECT PANEL (détail latéral) ─────────────────────────────────────────
function ProspectPanel({prospect:p, onClose, onStatusChange, onNoteChange, onEmailAdd, onDelete, onConvert, apiKey, hasEnvKey}){
  const [tab,         setTab]        = useState("analyse");
  const [notes,       setNotes]      = useState(p.notes||"");
  const [genLoading,  setGenLoading] = useState(false);
  const [copied,      setCopied]     = useState(null);
  const stage = PIPELINE_STAGES.find(s=>s.id===p.status)||PIPELINE_STAGES[0];

  const generateEmail = async () => {
    setGenLoading(true);
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey;
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Sara Baudouin, BeTheOne Vannes. Expert SEO local. Email de relance court et percutant. JSON uniquement.",
          messages:[
            {role:"user",content:`Email de relance pour "${p.name}" (${p.category||""}, ${p.city||""}).
Points faibles : ${(p.weakPoints||[]).slice(0,2).join(", ")||"fiche incomplète"}.
Statut actuel : ${stage.label}. ${(p.emails||[]).length>0?"Ceci est une relance — angle différent du premier contact.":"Premier contact."}
JSON: {"subject":"...","body":"...","whatsapp":"..."}`},
            {role:"assistant",content:"{"}
          ]
        })
      });
      const d = await res.json();
      const raw = "{" + (d.content||[]).map(b=>b.text||"").join("").trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||raw);
      onEmailAdd(p.id, {subject:parsed.subject,body:parsed.body,whatsapp:parsed.whatsapp,date:new Date().toISOString(),sent:false});
      setTab("envoi");
    }catch(e){}
    setGenLoading(false);
  };

  const potentialColor = {"Très élevé":"#059669","Élevé":"#65a30d","Moyen":"#d97706","Faible":"#94a3b8"}[p.potential||"Moyen"]||"#94a3b8";
  const lastEmail = (p.emails||[])[(p.emails||[]).length-1];

  return(
    <div style={{width:400,background:"var(--surface)",borderLeft:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
      {/* Header */}
      <div style={{padding:"16px 18px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"#F4F5FA"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--ink)",marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</div>
            <div style={{fontSize:12,color:"var(--ink4)"}}>{p.category||""}{p.city?` · ${p.city}`:""}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--ink4)",fontSize:20,lineHeight:1,flexShrink:0,padding:"0 0 0 8px"}}>×</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {p.note&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700,background:parseFloat(p.note)<4?"#fef2f2":"#ffffff",color:parseFloat(p.note)<4?"#dc2626":"#059669"}}>★ {p.note}/5</span>}
          {p.reviewCount&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"#F4F5FA",color:"#6B40D8",fontWeight:600}}>{p.reviewCount} avis</span>}
          {p.potential&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700,background:potentialColor+"15",color:potentialColor}}>Potentiel {p.potential}</span>}
          {p.score>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"#F4F5FA",color:"var(--ink3)",fontWeight:600}}>Score {p.score}/100</span>}
        </div>
        {/* Statut pipeline */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
          {PIPELINE_STAGES.map(s=>(
            <button key={s.id} onClick={()=>onStatusChange(p.id,s.id)}
              style={{fontSize:10,padding:"3px 8px",borderRadius:20,border:`1.5px solid ${p.status===s.id?s.color:s.b}`,background:p.status===s.id?s.bg:"transparent",color:p.status===s.id?s.color:"var(--ink3)",cursor:"pointer",fontFamily:"inherit",fontWeight:700,transition:"all .15s"}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {/* Convertir en client */}
        {p.status==="signe"&&p.clientRef&&(
          <div style={{padding:"8px 12px",background:"#F0FDF4",borderRadius:9,border:"1px solid #BBF7D0",fontSize:12,color:"#059669",fontWeight:600}}>
            ✓ Converti en client — accédez au rapport complet dans Clients
          </div>
        )}
        {p.status==="signe"&&!p.clientRef&&onConvert&&(
          <button onClick={()=>onConvert(p)}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            🚀 Convertir en client actif
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        {[
          {id:"analyse",l:"🔍 Analyse"},
          {id:"envoi",  l:`📧 Envoi (${(p.emails||[]).length})`},
          {id:"notes",  l:"📝 Notes"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"9px 6px",border:"none",background:"none",fontFamily:"inherit",fontSize:11.5,fontWeight:600,cursor:"pointer",
              color:tab===t.id?"var(--indigo)":"var(--ink4)",
              borderBottom:tab===t.id?"2px solid #6B40D8":"2px solid transparent",transition:"all .15s"}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>

        {/* ── ANALYSE ── */}
        {tab==="analyse"&&(
          <div>
            {/* Infos de contact — EN PREMIER, bien visibles */}
            <div style={{background:"white",borderRadius:12,padding:"14px",border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8",marginBottom:14}}>
              <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Coordonnées</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(()=>{
                  // Détecter les inversions fréquentes de champs
                  const isEmail = v => v&&v.includes("@");
                  const isUrl   = v => v&&(v.startsWith("http")||v.startsWith("www.")||v.includes(".fr")||v.includes(".com"));
                  const isPhone = v => v&&!isEmail(v)&&!isUrl(v);

                  const phone   = isPhone(p.phone)?p.phone : isPhone(p.email)?p.email : null;
                  const email   = isEmail(p.email)?p.email : isEmail(p.phone)?p.phone : null;
                  const website = p.website || (isUrl(p.email)?p.email : isUrl(p.phone)?p.phone : null);

                  return(<>
                    {phone?(
                      <a href={`tel:${phone}`} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB",textDecoration:"none"}}>
                        <span style={{fontSize:16,flexShrink:0}}>📞</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#1E1B30"}}>{phone}</div>
                          <div style={{fontSize:10.5,color:"#6B7280"}}>Appeler</div>
                        </div>
                        <span style={{marginLeft:"auto",fontSize:11,color:"#6B40D8",fontWeight:600}}>→</span>
                      </a>
                    ):<div style={{padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px dashed #E5E7EB",fontSize:12,color:"#9CA3AF"}}>📞 Téléphone non renseigné</div>}

                    {email?(
                      <a href={`mailto:${email}`} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB",textDecoration:"none"}}>
                        <span style={{fontSize:16,flexShrink:0}}>📧</span>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#1E1B30",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</div>
                          <div style={{fontSize:10.5,color:"#6B7280"}}>Envoyer un email</div>
                        </div>
                        <span style={{marginLeft:"auto",fontSize:11,color:"#6B40D8",fontWeight:600,flexShrink:0}}>→</span>
                      </a>
                    ):<div style={{padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px dashed #E5E7EB",fontSize:12,color:"#9CA3AF"}}>📧 Email non renseigné</div>}

                    {website?(
                      <a href={website.startsWith("http")?website:`https://${website}`} target="_blank" rel="noreferrer"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB",textDecoration:"none"}}>
                        <span style={{fontSize:16,flexShrink:0}}>🌐</span>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#6B40D8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{website}</div>
                          <div style={{fontSize:10.5,color:"#6B7280"}}>Visiter le site</div>
                        </div>
                        <span style={{marginLeft:"auto",fontSize:11,color:"#6B40D8",fontWeight:600,flexShrink:0}}>↗</span>
                      </a>
                    ):<div style={{padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px dashed #E5E7EB",fontSize:12,color:"#9CA3AF"}}>🌐 Site web non renseigné</div>}

                    {p.address&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB"}}>
                      <span style={{fontSize:16,flexShrink:0}}>📍</span>
                      <div style={{fontSize:13,color:"#374151"}}>{p.address}</div>
                    </div>}
                  </>);
                })()}
              </div>
            </div>

            {/* Score audit si disponible */}
            {p.score>0&&(
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"white",borderRadius:12,border:"1px solid #E5E7EB",marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:p.score>=70?"#F0FDF4":p.score>=50?"#FFF7ED":"#FEF2F2",border:`2px solid ${p.score>=70?"#BBF7D0":p.score>=50?"#FED7AA":"#FECACA"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:p.score>=70?"#059669":p.score>=50?"#E85A30":"#DC2626",flexShrink:0}}>
                  {p.score}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#1E1B30"}}>Score GMB</div>
                  <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{p.score>=70?"Bonne fiche":"Potentiel d'amélioration important"}</div>
                </div>
              </div>
            )}

            {/* Note + potentiel */}
            {p.potentialReason&&<div style={{background:"#FDF2F8",borderRadius:9,padding:"9px 12px",border:"1px solid #FBCFE8",marginBottom:12,fontSize:12.5,color:"#3B5BDB",lineHeight:1.5}}>💡 {p.potentialReason}</div>}

            {/* Points faibles */}
            {(p.weakPoints||[]).length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"#dc2626",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>⚠ Points faibles</div>
                {p.weakPoints.map((w,i)=>(
                  <div key={i} style={{display:"flex",gap:7,padding:"7px 10px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca",marginBottom:5}}>
                    <span style={{color:"#dc2626",fontWeight:700,flexShrink:0,fontSize:11}}>{i+1}.</span>
                    <span style={{fontSize:12,color:"#7f1d1d",lineHeight:1.4}}>{w}</span>
                  </div>
                ))}
              </div>
            )}
            {(p.quickWins||[]).length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"#6B40D8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>→ Quick wins</div>
                {p.quickWins.map((w,i)=>(
                  <div key={i} style={{display:"flex",gap:7,padding:"7px 10px",background:"#FDF2F8",borderRadius:8,border:"1px solid #FBCFE8",marginBottom:5}}>
                    <span style={{color:"#6B40D8",flexShrink:0}}>→</span>
                    <span style={{fontSize:12,color:"#3B5BDB",lineHeight:1.4}}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ENVOI ── */}
        {tab==="envoi"&&(
          <div>
            <button onClick={generateEmail} disabled={genLoading||(!(hasEnvKey||apiKey))} className="btn"
              style={{width:"100%",justifyContent:"center",marginBottom:14,fontSize:12.5}}>
              {genLoading?(
                <><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin 1s linear infinite"}}/>Génération…</>
              ):(p.emails||[]).length>0?"✨ Nouvelle relance":"✨ Générer l'email"}
            </button>

            {lastEmail&&(
              <div>
                {/* Email */}
                <div style={{background:"#F4F5FA",borderRadius:12,padding:"14px",border:"1px solid var(--border)",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink)",lineHeight:1.3,flex:1}}>{lastEmail.subject}</div>
                    <button onClick={()=>{navigator.clipboard.writeText(`Objet : ${lastEmail.subject}\n\n${lastEmail.body}`);setCopied("email");setTimeout(()=>setCopied(null),2000);}}
                      style={{fontSize:11,padding:"3px 9px",borderRadius:6,border:"1px solid var(--border)",background:copied==="email"?"#059669":"var(--surface)",color:copied==="email"?"#fff":"var(--ink3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s",flexShrink:0}}>
                      {copied==="email"?"✓":"Copier"}
                    </button>
                  </div>
                  <p style={{fontSize:12,color:"var(--ink2)",lineHeight:1.7,margin:0,whiteSpace:"pre-line"}}>{lastEmail.body}</p>
                </div>

                {/* Étapes envoi rapides */}
                <div style={{background:"#F4F5FA",borderRadius:12,padding:"12px 14px",border:"1px solid #b8b8f8",marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6B40D8",marginBottom:10}}>🚀 Envoyer maintenant</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {p.email&&(
                      <button onClick={()=>window.open(`mailto:${p.email}?subject=${encodeURIComponent(lastEmail.subject)}&body=${encodeURIComponent(lastEmail.body)}`)}
                        style={{fontSize:12,padding:"6px 13px",borderRadius:8,border:"1px solid #b8b8f8",background:"var(--surface)",color:"#6B40D8",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                        📧 Ouvrir Mail
                      </button>
                    )}
                    {(p.phone||p.phone)&&lastEmail.whatsapp&&(
                      <button onClick={()=>window.open(`https://wa.me/${(p.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(lastEmail.whatsapp||"")}`)}
                        style={{fontSize:12,padding:"6px 13px",borderRadius:8,border:"1px solid #bbf7d0",background:"var(--surface)",color:"#059669",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                        💬 WhatsApp
                      </button>
                    )}
                    <button onClick={()=>onStatusChange(p.id,"contacte")}
                      style={{fontSize:12,padding:"6px 13px",borderRadius:8,border:"1px solid #fde68a",background:"var(--surface)",color:"#d97706",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                      ✓ Marquer envoyé
                    </button>
                  </div>
                </div>

                {/* WhatsApp version */}
                {lastEmail.whatsapp&&(
                  <div style={{background:"#ffffff",borderRadius:10,padding:"11px 13px",border:"1px solid #bbf7d0",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#059669"}}>💬 Version WhatsApp</span>
                      <button onClick={()=>{navigator.clipboard.writeText(lastEmail.whatsapp);setCopied("wa");setTimeout(()=>setCopied(null),2000);}}
                        style={{fontSize:10.5,padding:"2px 8px",borderRadius:6,border:"1px solid #bbf7d0",background:copied==="wa"?"#059669":"var(--surface)",color:copied==="wa"?"#fff":"#059669",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>
                        {copied==="wa"?"✓":"Copier"}
                      </button>
                    </div>
                    <p style={{fontSize:12,color:"#6B40D8",lineHeight:1.6,margin:0,whiteSpace:"pre-line"}}>{lastEmail.whatsapp}</p>
                  </div>
                )}

                <div style={{fontSize:10,color:"var(--ink4)",textAlign:"right"}}>Généré le {new Date(lastEmail.date).toLocaleDateString("fr-FR")}</div>
              </div>
            )}
          </div>
        )}

        {/* ── NOTES ── */}
        {tab==="notes"&&(
          <div>
            <textarea className="ta" rows={10} value={notes} onChange={e=>{setNotes(e.target.value);onNoteChange(p.id,e.target.value);}}
              placeholder="Notes de suivi, compte-rendu d'appel, prochaine action, budget évoqué…"
              style={{marginBottom:14}}/>
            <div style={{fontSize:10.5,color:"var(--ink4)",marginBottom:12}}>Ajouté le {new Date(p.dateAdded).toLocaleDateString("fr-FR")}</div>
            <button className="btn-danger" onClick={()=>onDelete(p.id)} style={{width:"100%",justifyContent:"center",fontSize:12}}>
              Supprimer ce prospect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── MARCHÉ GBP PAGE ──────────────────────────────────────────────────────────
function MarchePage({clients, getLvl, calcScore}){
  const [activeTab, setActiveTab] = useState("overview");
  const MD = MARKET_DATA;
  const nat = MD.national;

  // Comparer les clients avec les moyennes nationales
  const myScores = clients.map(c=>calcScore({...(c.scores||{}),...(c.manualOverrides||{})}));
  const myAvg = myScores.length ? Math.round(myScores.reduce((a,b)=>a+b,0)/myScores.length) : null;
  const myNotes = clients.map(c=>parseFloat(c.data?.extracted?.rating||c.data?.reviews?.score||0)).filter(n=>n>0);
  const myAvgNote = myNotes.length ? (myNotes.reduce((a,b)=>a+b,0)/myNotes.length).toFixed(1) : null;
  const myReviews = clients.map(c=>parseInt(c.data?.extracted?.reviewCount||c.data?.reviews?.totalReviews||0)).filter(n=>n>0);
  const myAvgReviews = myReviews.length ? Math.round(myReviews.reduce((a,b)=>a+b,0)/myReviews.length) : null;

  const KPICard = ({label, value, benchmark, unit="", sub, color="#6B40D8", up=true})=>{
    const val = parseFloat(value);
    const bench = parseFloat(benchmark);
    const diff = !isNaN(val)&&!isNaN(bench) ? (val-bench).toFixed(1) : null;
    const isGood = diff!==null ? (up ? diff>=0 : diff<=0) : null;
    return(
      <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>{label}</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:6}}>
          <div style={{fontSize:32,fontWeight:800,color,lineHeight:1}}>{value!==null?value:"—"}{unit}</div>
          {diff!==null&&<span style={{fontSize:12,fontWeight:700,padding:"2px 8px",borderRadius:20,background:isGood?"#ffffff":"#fef2f2",color:isGood?"#059669":"#dc2626",marginBottom:4}}>
            {diff>0?"+":""}{diff} vs marché
          </span>}
        </div>
        <div style={{fontSize:11.5,color:"var(--ink4)"}}>Marché : <strong style={{color:"var(--ink2)"}}>{benchmark}{unit}</strong>{sub&&<span> · {sub}</span>}</div>
      </div>
    );
  };

  const TABS=[
    {id:"overview",     label:"Vue d'ensemble"},
    {id:"secteurs",     label:"Par secteur"},
    {id:"algorithme",   label:"Algorithme"},
    {id:"bibliotheque", label:"📚 Bibliothèque"},
  ];

  return(
    <div style={{padding:"32px 36px",background:"#F4F5FA",minHeight:"100%",overflowY:"auto"}} className="fade">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,color:"var(--ink4)",marginBottom:6}}>Source : Geolid 2026 · 144 446 fiches · 547 284 avis · Étude Algorithme GBP</div>
        <div style={{...serif,fontSize:30,color:"var(--ink)",letterSpacing:"-.02em",marginBottom:4}}>Marché Google Business Profile</div>
        <div style={{fontSize:13.5,color:"var(--ink3)"}}>Benchmarks nationaux France 2026 · Comparez vos clients à la moyenne du marché</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:24,borderBottom:"2px solid var(--border)",paddingBottom:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{padding:"8px 18px",borderRadius:"8px 8px 0 0",border:"none",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",
              background:activeTab===t.id?"var(--surface)":"transparent",
              color:activeTab===t.id?"var(--indigo)":"var(--ink4)",
              borderBottom:activeTab===t.id?"2px solid var(--indigo)":"2px solid transparent",
              marginBottom:"-2px",transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ VUE D'ENSEMBLE ══ */}
      {activeTab==="overview"&&(
        <div>
          {/* Vos clients vs marché */}
          {clients.length>0&&(
            <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:20,padding:"20px 24px",marginBottom:20,color:"#fff"}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",opacity:.7,marginBottom:10}}>📊 Vos clients vs la moyenne nationale</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                {[
                  {label:"Score moyen fiche",val:myAvg?`${myAvg}%`:null,bench:"—",tip:"Score optimisation global"},
                  {label:"Note Google moyenne",val:myAvgNote,bench:"4.2",tip:"Moyenne nationale toutes fiches"},
                  {label:"Avis moyen",val:myAvgReviews,bench:"420",tip:"Moyenne nationale 2026"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.1)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:10.5,opacity:.7,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
                    <div style={{fontSize:28,fontWeight:800,lineHeight:1}}>{s.val||"—"}</div>
                    <div style={{fontSize:11,opacity:.6,marginTop:4}}>Marché : {s.bench} · {s.tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs nationaux */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            <KPICard label="Note moyenne" value="4.2" benchmark="4.2" unit="/5" sub="stable vs 2025" color="#d97706"/>
            <KPICard label="Avis moyens/fiche" value="420" benchmark="320" unit="" sub="+31% en 1 an" color="#6B40D8"/>
            <KPICard label="Taux de complétion" value="71" benchmark="100" unit="%" sub="29% de champs vides" color="#059669" up={false}/>
            <KPICard label="Nouveaux avis/mois" value="6" benchmark="10" unit="" sub="viser 10+ pour dominer" color="#3B5BDB" up={false}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            {/* Actions sur les fiches */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontWeight:700,fontSize:13.5,marginBottom:4}}>Actions les plus réalisées sur une fiche</div>
              <div style={{fontSize:11.5,color:"var(--ink4)",marginBottom:14}}>Sur 33 millions de visites analysées · France 2026</div>
              {[
                {label:"📞 Clic téléphone", pct:36.23, color:"#6B40D8", note:"Action n°1 — numéro obligatoire"},
                {label:"🌐 Clic site web",  pct:35.64, color:"#0891b2", note:""},
                {label:"🗺️ Itinéraire",     pct:29.13, color:"#d97706", note:"Était n°1 en 2025"},
              ].map((a,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12.5,fontWeight:600,color:"var(--ink)"}}>{a.label}</span>
                    <span style={{fontSize:12.5,fontWeight:800,color:a.color}}>{a.pct}%</span>
                  </div>
                  <div style={{height:6,background:"var(--border)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${a.pct}%`,background:a.color,borderRadius:4,transition:"width 1s"}}/>
                  </div>
                  {a.note&&<div style={{fontSize:10.5,color:"var(--ink4)",marginTop:2}}>{a.note}</div>}
                </div>
              ))}
            </div>

            {/* Sources de trafic */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontWeight:700,fontSize:13.5,marginBottom:4}}>D'où viennent les visiteurs</div>
              <div style={{fontSize:11.5,color:"var(--ink4)",marginBottom:14}}>Sources de trafic vers les fiches GMB</div>
              <div style={{display:"grid",gap:10}}>
                {[
                  {label:"🔍 Google Search",     pct:69.21, color:"#6B40D8", note:"Local Pack — 7 visites sur 10"},
                  {label:"🗺️ Google Maps",        pct:30.79, color:"#0891b2", note:"Était 48% en 2025 — chute significative"},
                  {label:"📱 Mobile",             pct:85.25, color:"#3B5BDB", note:"Priorité absolue"},
                  {label:"💻 Desktop",            pct:14.75, color:"#94a3b8", note:""},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:12.5,flex:1,color:"var(--ink)"}}>{s.label}</span>
                    <div style={{width:100,height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${s.pct}%`,background:s.color,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:12.5,fontWeight:800,color:s.color,width:44,textAlign:"right"}}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Complétion des champs */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontWeight:700,fontSize:13.5,marginBottom:4}}>Complétion des champs — Moyenne nationale</div>
              <div style={{fontSize:11.5,color:"var(--ink4)",marginBottom:14}}>Opportunités d'optimisation vs les autres fiches</div>
              {nat.completionFields.map((f,i)=>(
                <div key={i} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,color:"var(--ink)"}}>{f.field}</span>
                    <span style={{fontSize:12,fontWeight:700,color:f.color}}>{f.pct}%</span>
                  </div>
                  <div style={{height:4,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${f.pct}%`,background:f.color,borderRadius:3,transition:"width 1s"}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:12,padding:"8px 12px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca",fontSize:11.5,color:"#dc2626"}}>
                🚨 Description (18%) et réseaux sociaux (41-47%) = les plus sous-exploités = opportunité facile
              </div>
            </div>

            {/* Stats avis */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
                <div style={{fontWeight:700,fontSize:13.5,marginBottom:12}}>Répartition des nouvelles notes</div>
                <div style={{fontSize:11.5,color:"var(--ink4)",marginBottom:12}}>Sur 547 284 nouveaux avis récents</div>
                {nat.reviewDistrib.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--ink)",width:28}}>{r.label}</span>
                    <div style={{flex:1,height:14,background:"var(--border)",borderRadius:7,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${r.pct}%`,background:r.color,borderRadius:7,transition:"width 1s"}}/>
                    </div>
                    <span style={{fontSize:12.5,fontWeight:800,color:r.color,width:34,textAlign:"right"}}>{r.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--surface)",borderRadius:16,padding:"16px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Chiffres clés à retenir</div>
                {[
                  {icon:"💬",val:"67%",label:"Taux de réponse moyen — 33% des avis sans réponse"},
                  {icon:"📈",val:"14.19%",label:"CTR moyen 2026 (+3.29pts vs 2025)"},
                  {icon:"📱",val:"85%",label:"Des visites viennent du mobile"},
                  {icon:"🗓️",val:"6",label:"Nouveaux avis/mois en moyenne"},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:i<3?"1px solid var(--border)":"none",alignItems:"center"}}>
                    <span style={{fontSize:16}}>{s.icon}</span>
                    <span style={{fontSize:14,fontWeight:800,color:"#6B40D8",width:54,flexShrink:0}}>{s.val}</span>
                    <span style={{fontSize:11.5,color:"var(--ink3)"}}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAR SECTEUR ══ */}
      {activeTab==="secteurs"&&(
        <div>
          <div style={{background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>18 secteurs analysés — France 2026</div>
                <div style={{fontSize:12,color:"var(--ink4)",marginTop:2}}>Source : Geolid · 144 446 fiches · triés par note croissante</div>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#F4F5FA"}}>
                    {["Secteur","Note ★","vs marché","Avis moy.","vs marché","Complétion","Analyse"].map(h=>(
                      <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:700,color:"var(--ink3)",borderBottom:"1px solid var(--border)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MD.sectors.map((s,i)=>{
                    const noteDiff = (s.note - 4.2).toFixed(1);
                    const revDiff  = s.reviews - 420;
                    const noteGood = s.note >= 4.2;
                    const revGood  = s.reviews >= 420;
                    const compColor = s.completion>=80?"#059669":s.completion>=70?"#d97706":"#dc2626";
                    return(
                      <tr key={i} style={{borderBottom:"1px solid var(--ground)",transition:"background .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--ground)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:16}}>{s.icon}</span>
                            <span style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{fontSize:14,fontWeight:800,color:s.note>=4.5?"#059669":s.note>=4.2?"#65a30d":s.note>=4?"#d97706":"#dc2626"}}>{s.note}</span>
                          <span style={{fontSize:10,color:"var(--ink4)"}}>/5</span>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{fontSize:12,fontWeight:700,padding:"2px 7px",borderRadius:20,
                            background:noteGood?"#ffffff":"#fef2f2",
                            color:noteGood?"#059669":"#dc2626"}}>
                            {noteDiff>0?"+":""}{noteDiff}
                          </span>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{s.reviews.toLocaleString("fr-FR")}</span>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{fontSize:12,fontWeight:700,padding:"2px 7px",borderRadius:20,
                            background:revGood?"#ffffff":"#fef2f2",
                            color:revGood?"#059669":"#dc2626"}}>
                            {revDiff>=0?"+":""}{revDiff.toLocaleString("fr-FR")}
                          </span>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:60,height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${s.completion}%`,background:compColor,borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:12,fontWeight:700,color:compColor}}>{s.completion}%</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:11.5,color:"var(--ink3)",maxWidth:220}}>{s.alert}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{marginTop:12,padding:"12px 16px",background:"#F4F5FA",borderRadius:12,border:"1px solid #b8b8f8",fontSize:12,color:"#4338ca"}}>
            💡 <strong>Comment lire ce tableau :</strong> "vs marché" = écart par rapport à la moyenne nationale (note : 4.2 / avis : 420). 
            En vert = au-dessus de la moyenne, en rouge = en dessous. Un secteur avec peu d'avis mais une bonne note est plus facile à dominer.
          </div>
        </div>
      )}

      {/* ══ ALGORITHME ══ */}
      {activeTab==="algorithme"&&(
        <div>
          {/* Key insights banner */}
          <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:20,padding:"20px 24px",marginBottom:20,color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#94a3b8",marginBottom:12}}>
              🔬 Étude Algorithme — 30 000+ fiches analysées — ces critères expliquent 91% de la variation des positions
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:8}}>
              {MD.algorithm.keyInsights.map((insight,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.06)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#F4F5FA",lineHeight:1.5,borderLeft:"3px solid #5a5aee"}}>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Critères à fort impact */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1.5px solid #bbf7d0",boxShadow:"var(--shadow-sm)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:20}}>🟢</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13.5,color:"var(--ink)"}}>Critères à impact ÉLEVÉ</div>
                  <div style={{fontSize:11.5,color:"var(--ink4)"}}>Agir en priorité sur ces 6 leviers</div>
                </div>
              </div>
              {MD.algorithm.highImpact.map((c,i)=>(
                <div key={i} style={{padding:"10px 12px",borderRadius:10,background:"#ffffff",border:"1px solid #bbf7d0",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12.5,fontWeight:700,color:"var(--ink)"}}>{c.factor}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:60,height:4,background:"#dcfce7",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${c.pct}%`,background:"#10B981",borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:"#059669",minWidth:28}}>{c.pct}%</span>
                    </div>
                  </div>
                  <div style={{fontSize:11.5,color:"#6B40D8",lineHeight:1.4}}>→ {c.tip}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Critères modérés */}
              <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1.5px solid #fde68a",boxShadow:"var(--shadow-sm)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>🟡</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13.5}}>Impact MODÉRÉ</div>
                    <div style={{fontSize:11.5,color:"var(--ink4)"}}>Bonne pratique, effet moins direct</div>
                  </div>
                </div>
                {MD.algorithm.moderateImpact.map((c,i)=>(
                  <div key={i} style={{padding:"9px 12px",borderRadius:10,background:"#fffbeb",border:"1px solid #fde68a",marginBottom:7}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{c.factor}</div>
                    <div style={{fontSize:11.5,color:"#92400e"}}>{c.tip}</div>
                  </div>
                ))}
              </div>
              {/* Critères faibles */}
              <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>🔴</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13.5}}>Impact FAIBLE — à ne pas suroptimiser</div>
                    <div style={{fontSize:11.5,color:"var(--ink4)"}}>Ne perdez pas de temps sur ces points</div>
                  </div>
                </div>
                {MD.algorithm.lowImpact.map((c,i)=>(
                  <div key={i} style={{padding:"9px 12px",borderRadius:10,background:"#F4F5FA",border:"1px solid var(--border)",marginBottom:7}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{c.factor}</div>
                    <div style={{fontSize:11.5,color:"var(--ink3)"}}>{c.tip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BIBLIOTHÈQUE ── */}
      {activeTab==="bibliotheque"&&<BibliothequeTab/>}
    </div>
  );
}

// ─── BIBLIOTHÈQUE ─────────────────────────────────────────────────────────────
const SECTEURS = [
  {id:"restauration",   label:"Restauration",     icon:"🍽️"},
  {id:"plomberie",      label:"Plomberie",         icon:"🔧"},
  {id:"coiffure",       label:"Coiffure & Beauté", icon:"💇"},
  {id:"immobilier",     label:"Immobilier",        icon:"🏠"},
  {id:"sante",          label:"Santé & Bien-être", icon:"🏥"},
  {id:"sport",          label:"Sport & Fitness",   icon:"🏋️"},
  {id:"commerce",       label:"Commerce & Retail", icon:"🛒"},
  {id:"artisan",        label:"Artisanat",         icon:"🪵"},
  {id:"auto",           label:"Automobile",        icon:"🚗"},
  {id:"education",      label:"Éducation",         icon:"🎓"},
  {id:"autre",          label:"Autre",             icon:"📁"},
];

// ── IndexedDB helpers pour la bibliothèque ──────────────────────────────────
const DB_NAME = "bto_biblio_db", DB_STORE = "files", DB_VER = 1;
const openBiblioDB = () => new Promise((res,rej)=>{
  const r = indexedDB.open(DB_NAME, DB_VER);
  r.onupgradeneeded = e => e.target.result.createObjectStore(DB_STORE, {keyPath:"id"});
  r.onsuccess = e => res(e.target.result);
  r.onerror   = e => rej(e.target.error);
});
const idbGet = async (secteurId) => {
  const db = await openBiblioDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction(DB_STORE,"readonly");
    const req = tx.objectStore(DB_STORE).index ? tx.objectStore(DB_STORE).getAll() : tx.objectStore(DB_STORE).getAll();
    // getAll then filter by secteur
    req.onsuccess = e => res((e.target.result||[]).filter(f=>f.secteur===secteurId));
    req.onerror   = e => rej(e.target.error);
  });
};
const idbGetAll = async () => {
  const db = await openBiblioDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction(DB_STORE,"readonly");
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = e => res(e.target.result||[]);
    req.onerror   = e => rej(e.target.error);
  });
};
const idbPut = async (doc) => {
  const db = await openBiblioDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction(DB_STORE,"readwrite");
    const req = tx.objectStore(DB_STORE).put(doc);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
};
const idbDel = async (id) => {
  const db = await openBiblioDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction(DB_STORE,"readwrite");
    const req = tx.objectStore(DB_STORE).delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
};

function BibliothequeTab(){
  const [activeSecteur, setActiveSecteur] = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Charger tous les docs depuis IndexedDB
  const loadDocs = async () => {
    try{ const d = await idbGetAll(); setAllDocs(d); }catch(e){ console.error(e); }
  };
  useEffect(()=>{ loadDocs(); },[]);

  const sectionDocs = (secteurId) => allDocs.filter(d=>d.secteur===secteurId);
  const countBySecteur = (id) => allDocs.filter(d=>d.secteur===id).length;

  const handleFiles = async (files, secteurId) => {
    if(!files.length) return;
    setUploading(true);
    for(const file of Array.from(files)){
      await new Promise((res)=>{
        const reader = new FileReader();
        reader.onload = async (e) => {
          try{
            await idbPut({
              id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
              secteur: secteurId,
              name: file.name,
              type: file.type||"application/octet-stream",
              size: file.size,
              date: new Date().toISOString(),
              data: e.target.result,
            });
          }catch(err){ console.error("IndexedDB write error:", err); }
          res();
        };
        reader.onerror = () => res();
        reader.readAsDataURL(file);
      });
    }
    await loadDocs();
    setUploading(false);
  };

  const deleteDoc = async (id) => {
    await idbDel(id);
    await loadDocs();
  };

  const openDoc = (doc) => {
    const a = document.createElement("a");
    a.href = doc.data;
    a.target = "_blank";
    a.download = doc.name;
    a.click();
  };

  const formatSize = (bytes) => bytes<1024*1024?`${Math.round(bytes/1024)} Ko`:`${(bytes/(1024*1024)).toFixed(1)} Mo`;
  const totalDocs = allDocs.length;

  return(
    <div className="fade">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
        <div style={{width:4,height:28,borderRadius:2,background:"linear-gradient(135deg,#6B40D8,#C03080)",marginRight:14,flexShrink:0}}/>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"#1E1B30",letterSpacing:"-.01em"}}>📚 Bibliothèque par secteur</div>
          <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{totalDocs} document{totalDocs>1?"s":""} · Cliquez sur un secteur pour ajouter ou consulter vos fichiers</div>
        </div>
      </div>

      {!activeSecteur?(
        /* Grille des secteurs */
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {SECTEURS.map(s=>{
            const count = countBySecteur(s.id);
            return(
              <div key={s.id} onClick={()=>setActiveSecteur(s.id)}
                style={{background:"white",borderRadius:14,padding:"20px 16px",border:"1px solid #E5E7EB",cursor:"pointer",textAlign:"center",transition:"all .18s",position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#6B40D8";e.currentTarget.style.boxShadow="0 4px 16px rgba(37,99,235,.1)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
                {count>0&&(
                  <div style={{position:"absolute",top:10,right:10,width:20,height:20,borderRadius:"50%",background:"#6B40D8",color:"white",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {count}
                  </div>
                )}
                <div style={{fontSize:32,marginBottom:10}}>{s.icon}</div>
                <div style={{fontSize:13.5,fontWeight:700,color:"#1E1B30",marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:11,color:count?"#6B40D8":"#9CA3AF",fontWeight:count?600:400}}>
                  {count?`${count} fichier${count>1?"s":""}` : "Aucun fichier"}
                </div>
              </div>
            );
          })}
        </div>
      ):(
        /* Détail d'un secteur */
        <div>
          {/* Breadcrumb */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <button onClick={()=>setActiveSecteur(null)}
              style={{fontSize:13,color:"#6B7280",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500,padding:0,display:"flex",alignItems:"center",gap:5}}>
              ← Tous les secteurs
            </button>
            <span style={{color:"#D1D5DB"}}>/</span>
            <span style={{fontSize:13,fontWeight:700,color:"#1E1B30"}}>
              {SECTEURS.find(s=>s.id===activeSecteur)?.icon} {SECTEURS.find(s=>s.id===activeSecteur)?.label}
            </span>
          </div>

          {/* Zone de dépôt */}
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files,activeSecteur);}}
            style={{border:`2px dashed ${dragOver?"#6B40D8":"#E5E7EB"}`,borderRadius:14,padding:"28px",textAlign:"center",marginBottom:16,background:dragOver?"#FDF2F8":"#F4F5FA",transition:"all .18s"}}>
            <div style={{fontSize:28,marginBottom:8}}>📂</div>
            <div style={{fontSize:14,fontWeight:600,color:"#374151",marginBottom:6}}>
              Glissez vos fichiers ici
            </div>
            <div style={{fontSize:12.5,color:"#9CA3AF",marginBottom:14}}>PDF, Word, Images · Stockés dans votre navigateur</div>
            <label style={{padding:"9px 22px",borderRadius:9,border:"none",background:uploading?"#9CA3AF":"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontSize:13,fontWeight:700,display:"inline-flex",alignItems:"center",gap:8}}>
              {uploading?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",animation:"spin 1s linear infinite"}}/>Importation…</>:"📁 Choisir des fichiers"}
              <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx,.ppt,.pptx" onChange={e=>handleFiles(e.target.files,activeSecteur)} style={{display:"none"}} disabled={uploading}/>
            </label>
          </div>

          {/* Liste des fichiers */}
          {sectionDocs(activeSecteur).length===0?(
            <div style={{textAlign:"center",padding:"32px",color:"#9CA3AF",fontSize:13}}>
              Aucun fichier dans ce secteur — importez vos premiers documents
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {sectionDocs(activeSecteur).map(doc=>(
                <div key={doc.id} style={{background:"white",borderRadius:12,padding:"16px",border:"1px solid #E5E7EB",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                      {doc.name.endsWith(".pdf")?"📄":doc.type.includes("image")?"🖼️":"📝"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:"#1E1B30",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
                      <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{formatSize(doc.size)} · {new Date(doc.date).toLocaleDateString("fr-FR")}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>openDoc(doc)}
                      style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:"#6B40D8",color:"white",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
                      Ouvrir
                    </button>
                    <button onClick={()=>deleteDoc(doc.id)}
                      style={{padding:"7px 10px",borderRadius:8,border:"1px solid #FECACA",background:"#FEF2F2",color:"#dc2626",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FacturationTab({clients, getContract}){
  const [paiements,setPaiements]=useState(()=>{try{return JSON.parse(localStorage.getItem("bto_paiements")||"{}");}catch{return {};}});
  const savePaiements=(next)=>{setPaiements(next);localStorage.setItem("bto_paiements",JSON.stringify(next));};
  const moisOptions=Array.from({length:12},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-i);return{value:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,label:d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})};});
  const [selectedMois,setSelectedMois]=useState(moisOptions[0].value);

  const genFacture=(client,ct,mois)=>{
    const [year,month]=mois.split("-");
    const moisLabel=new Date(parseInt(year),parseInt(month)-1).toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
    const numFact=`BTO-${year}${month}-${String(clients.indexOf(client)+1).padStart(3,"0")}`;
    const ag=localStorage.getItem("ag_name")||"BeTheOne";
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Facture ${numFact}</title>
    <style>body{font-family:system-ui,sans-serif;padding:40px;max-width:700px;margin:0 auto;color:#111}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;border-bottom:3px solid #3B5BDB;padding-bottom:20px}
    .logo{font-size:22px;font-weight:900;color:#3B5BDB}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}
    .box{background:#F4F5FA;border-radius:10px;padding:16px;border:1px solid #E5E7EB}.box h3{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9CA3AF;margin:0 0 8px}
    .box p{margin:3px 0;font-size:13px}table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#F4F5FA;padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:#6B7280;border-bottom:1px solid #E5E7EB}
    td{padding:12px 14px;border-bottom:1px solid #F3F4F6;font-size:13px}
    .tot{font-weight:700;font-size:15px;border-top:2px solid #111!important;border-bottom:none!important}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;text-align:center}</style></head>
    <body><div class="hdr"><div><div class="logo">${ag}</div><div style="font-size:11px;color:#6B7280">Agence GMB · Vannes</div></div>
    <div style="text-align:right"><div style="font-size:11px;color:#6B7280">Date d'émission</div><div style="font-weight:600">${new Date().toLocaleDateString("fr-FR")}</div>
    <div style="font-size:11px;color:#6B7280;margin-top:6px">N°</div><div style="font-weight:700;color:#3B5BDB">${numFact}</div></div></div>
    <div style="font-size:26px;font-weight:900;margin-bottom:4px">Facture</div><div style="font-size:13px;color:#6B7280">Période : ${moisLabel}</div>
    <div class="grid"><div class="box"><h3>Émetteur</h3><p><strong>${ag}</strong></p><p>${localStorage.getItem("ag_email")||""}</p><p>${localStorage.getItem("ag_phone")||""}</p></div>
    <div class="box"><h3>Client</h3><p><strong>${client.name}</strong></p><p>${ct.interlocuteur||""}</p><p>${ct.email||""}</p></div></div>
    <table><thead><tr><th>Description</th><th>Montant HT</th><th>TVA</th><th>TTC</th></tr></thead>
    <tbody><tr><td>Optimisation Google Business Profile<br/><small style="color:#6B7280">${client.name} · ${moisLabel}</small></td>
    <td>${parseFloat(ct.montant||99).toFixed(2)} €</td><td>0 %</td><td>${parseFloat(ct.montant||99).toFixed(2)} €</td></tr></tbody>
    <tfoot><tr class="tot"><td colspan="3">Total TTC</td><td>${parseFloat(ct.montant||99).toFixed(2)} €</td></tr></tfoot></table>
    <p style="font-size:12px;color:#6B7280;background:#F4F5FA;padding:10px;border-radius:8px">Auto-entrepreneur — TVA non applicable, art. 293 B du CGI</p>
    <div class="footer">Merci pour votre confiance · ${ag}</div></body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);
  };

  const payesAmount=clients.filter(c=>paiements[`${c.id}_${selectedMois}`]==="paye").reduce((s,c)=>s+parseFloat(getContract(c.id).montant||99),0);
  const totalAmount=clients.reduce((s,c)=>s+parseFloat(getContract(c.id).montant||99),0);

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <select value={selectedMois} onChange={e=>setSelectedMois(e.target.value)}
          style={{padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",fontFamily:"inherit",fontSize:13,fontWeight:600,background:"white"}}>
          {moisOptions.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        {[
          {l:"Total",v:`${totalAmount.toFixed(0)} €`,c:"#6B40D8"},
          {l:"Encaissé",v:`${payesAmount.toFixed(0)} €`,c:"#059669"},
          {l:"Restant",v:`${(totalAmount-payesAmount).toFixed(0)} €`,c:"#E85A30"},
        ].map(({l,v,c})=>(
          <div key={l} style={{padding:"8px 14px",background:"white",borderRadius:9,border:"1px solid #E5E7EB",fontSize:12.5,fontWeight:600,color:c}}>
            <span style={{fontWeight:900,marginRight:4}}>{v}</span>{l}
          </div>
        ))}
      </div>

      <div style={{background:"white",borderRadius:14,border:"1px solid #E5E7EB",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1.2fr",padding:"10px 16px",background:"#F4F5FA",borderBottom:"1px solid #E5E7EB",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px"}}>
          {["Client","Interlocuteur","Montant","Statut","Actions"].map(h=><div key={h}>{h}</div>)}
        </div>
        {clients.map((c,i)=>{
          const ct=getContract(c.id);
          const key=`${c.id}_${selectedMois}`;
          const s=paiements[key]||"attente";
          const st={paye:{bg:"#F0FDF4",c:"#059669",b:"#BBF7D0",l:"✓ Payé"},attente:{bg:"#FFF7ED",c:"#E85A30",b:"#FED7AA",l:"⏳ Attente"},retard:{bg:"#FEF2F2",c:"#dc2626",b:"#FECACA",l:"⚠ Retard"}}[s]||{};
          return(
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1.2fr",padding:"12px 16px",borderBottom:i<clients.length-1?"1px solid #F3F4F6":"none",alignItems:"center"}}>
              <div><div style={{fontWeight:600,fontSize:13,color:"#1E1B30"}}>{c.name}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{c.city||""}</div></div>
              <div style={{fontSize:12.5,color:"#374151"}}>{ct.interlocuteur||"—"}</div>
              <div style={{fontSize:14,fontWeight:800,color:"#059669"}}>{parseFloat(ct.montant||99).toFixed(0)} €</div>
              <div><span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:st.bg,color:st.c,border:`1px solid ${st.b}`}}>{st.l}</span></div>
              <div style={{display:"flex",gap:5}}>
                {["paye","attente","retard"].map(v=>(
                  <button key={v} onClick={()=>savePaiements({...paiements,[key]:v})}
                    style={{padding:"4px 8px",borderRadius:7,border:`1.5px solid ${s===v?"#6B40D8":"#E5E7EB"}`,background:s===v?"#FDF2F8":"white",color:s===v?"#6B40D8":"#6B7280",cursor:"pointer",fontSize:10.5,fontFamily:"inherit",fontWeight:600}}>
                    {v==="paye"?"✓":v==="retard"?"⚠":"⏳"}
                  </button>
                ))}
                <button onClick={()=>genFacture(c,ct,selectedMois)}
                  style={{padding:"4px 10px",borderRadius:7,border:"none",background:"#3B5BDB",color:"white",cursor:"pointer",fontSize:10.5,fontFamily:"inherit",fontWeight:600}}>
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnboardingTab({clients,getContract}){
  const [selId,setSelId]=useState(clients[0]?.id||null);
  const client=clients.find(c=>c.id===selId)||clients[0];
  const ct=client?getContract(client.id):{};

  const gen=()=>{
    if(!client) return;
    const ag=localStorage.getItem("ag_name")||"BeTheOne";
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Onboarding ${client.name}</title>
    <style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#F4F5FA;padding:0;margin:0}
    .page{max-width:660px;margin:0 auto;padding:32px 16px}
    .hdr{background:linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30);border-radius:14px;padding:24px;color:white;margin-bottom:20px;text-align:center}
    .card{background:white;border-radius:12px;padding:20px;margin-bottom:14px;border:1px solid #E5E7EB}
    .card h2{font-size:14px;font-weight:700;margin:0 0 14px}
    label{display:block;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin:12px 0 4px}
    input,textarea,select{width:100%;padding:9px 12px;border:1.5px solid #E5E7EB;border-radius:8px;font-size:13.5px;font-family:inherit;background:#F4F5FA}
    textarea{min-height:70px;resize:vertical}
    .btn{width:100%;padding:13px;background:linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30);color:white;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:16px}
    .footer{text-align:center;font-size:11px;color:#9CA3AF;margin-top:20px}</style></head>
    <body><div class="page">
    <div class="hdr"><div style="font-size:20px;font-weight:900">${ag}</div><div style="font-size:12px;opacity:.7;margin-top:4px">Formulaire d'onboarding</div><div style="font-size:17px;font-weight:800;margin-top:8px">${client.name}</div></div>
    <p style="text-align:center;color:#6B7280;font-size:13px;margin-bottom:20px">Merci de remplir ce formulaire pour démarrer votre accompagnement GMB.</p>
    <div class="card"><h2>📍 Accès Google Business</h2>
    <label>Email du compte Google (fiche)</label><input type="email" placeholder="email@gmail.com"/>
    <label>Avez-vous accès à votre fiche ?</label>
    <select><option>Oui, j'ai accès</option><option>Non, je n'ai pas accès</option><option>Je ne sais pas</option></select>
    <label>Lien de votre fiche (si connu)</label><input type="url" placeholder="https://maps.google.com/..."/></div>
    <div class="card"><h2>🏢 Informations établissement</h2>
    <label>Nom affiché sur Google</label><input type="text" value="${client.name}"/>
    <label>Adresse complète</label><input type="text"/>
    <label>Téléphone</label><input type="tel"/>
    <label>Site web</label><input type="url"/>
    <label>Horaires d'ouverture</label><textarea placeholder="Lundi 9h-18h&#10;Mardi 9h-18h&#10;..."></textarea></div>
    <div class="card"><h2>📝 Activité & Services</h2>
    <label>Description de votre activité</label><textarea placeholder="Ce que vous faites, votre spécialité, votre zone d'intervention…"></textarea>
    <label>Services ou produits principaux</label><textarea placeholder="Service 1&#10;Service 2&#10;..."></textarea>
    <label>Avez-vous des photos à nous fournir ?</label>
    <select><option>Oui, je vais vous les envoyer</option><option>Non, pas pour l'instant</option></select></div>
    <div class="card"><h2>⭐ Préférences avis</h2>
    <label>Souhaitez-vous qu'on réponde aux avis en votre nom ?</label>
    <select><option>Oui</option><option>Non</option></select>
    <label>Signature pour les réponses</label><input type="text" placeholder="Ex : L'équipe ${client.name}"/>
    <label>Consignes (ton, sujets à éviter…)</label><textarea placeholder="Ex : toujours vouvoyer, ne pas mentionner les prix…"></textarea></div>
    <div class="card"><h2>👤 Interlocuteur principal</h2>
    <label>Prénom et nom</label><input type="text" value="${ct.interlocuteur||""}"/>
    <label>Poste</label><input type="text" value="${ct.poste||""}"/>
    <label>Email direct</label><input type="email" value="${ct.email||""}"/>
    <label>Téléphone direct</label><input type="tel" value="${ct.telephone||""}"/></div>
    <button class="btn" onclick="alert('Merci ! Nous reviendrons vers vous rapidement.')">✓ Envoyer le formulaire</button>
    <div class="footer">${ag} · Vannes · Ce formulaire est confidentiel</div>
    </div></body></html>`;
    const blob=new Blob([html],{type:"text/html;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download=`onboarding_${(client.name||"client").replace(/\s+/g,"_")}.html`;a.click();
  };

  return(
    <div style={{maxWidth:560}}>
      <div style={{background:"white",borderRadius:14,padding:"22px 24px",border:"1px solid #E5E7EB",borderTop:"3px solid #C03080",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:15,color:"#1E1B30",marginBottom:6}}>🚀 Formulaire d'onboarding</div>
        <div style={{fontSize:13,color:"#6B7280",marginBottom:16,lineHeight:1.7}}>Génère un fichier HTML à envoyer à ton client. Il remplit ses infos, tu récupères tout pour démarrer.</div>
        {clients.length>0?(
          <>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:6}}>Client</div>
              <select value={selId||""} onChange={e=>setSelId(e.target.value)}
                style={{padding:"9px 14px",borderRadius:9,border:"1px solid #E5E7EB",fontFamily:"inherit",fontSize:13,background:"white",width:"100%"}}>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {client&&ct.interlocuteur&&(
              <div style={{padding:"10px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB",fontSize:12.5,color:"#374151",marginBottom:14}}>
                👤 {ct.interlocuteur}{ct.email?` · ${ct.email}`:""}
              </div>
            )}
            <button onClick={gen}
              style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6B40D8,#C03080)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14}}>
              ⬇️ Télécharger le formulaire
            </button>
            <div style={{fontSize:11.5,color:"#9CA3AF",marginTop:8,textAlign:"center"}}>Fichier HTML · À envoyer par email ou WeTransfer</div>
          </>
        ):<div style={{padding:"24px",textAlign:"center",color:"#9CA3AF",fontSize:13}}>Aucun client</div>}
      </div>
      <div style={{background:"#FDF2F8",borderRadius:12,padding:"14px 16px",border:"1px solid #FBCFE8",fontSize:12.5,color:"#3B5BDB",lineHeight:1.7}}>
        <div style={{fontWeight:700,marginBottom:6}}>📋 Contenu du formulaire</div>
        {["Accès Google Business (email, lien fiche)","Adresse, téléphone, site web, horaires","Description activité + services","Préférences réponses aux avis","Interlocuteur principal"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:6,marginBottom:3}}><span>→</span>{s}</div>
        ))}
      </div>
    </div>
  );
}

function TempsTab({client, clients, upd}){
  const key = `bto_temps_${client.id}`;
  const [sessions, setSessions] = useState(()=>{try{return JSON.parse(localStorage.getItem(key)||"[]");}catch{return [];}});
  const [desc, setDesc]   = useState("");
  const [mins, setMins]   = useState("");
  const [timer, setTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerStart, setTimerStart] = useState(null);

  const save = (next) => { setSessions(next); localStorage.setItem(key, JSON.stringify(next)); };

  const addManual = () => {
    if(!mins||!desc.trim()) return;
    save([...sessions,{id:Date.now(),date:new Date().toISOString(),desc:desc.trim(),mins:parseInt(mins)}]);
    setDesc(""); setMins("");
  };

  const startTimer = () => {
    const start=Date.now(); setTimerStart(start);
    const t=setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),1000);
    setTimer(t);
  };
  const stopTimer = () => {
    clearInterval(timer); setTimer(null);
    const m=Math.ceil(elapsed/60);
    if(m>0&&desc.trim()){
      save([...sessions,{id:Date.now(),date:new Date().toISOString(),desc:desc.trim(),mins:m,fromTimer:true}]);
      setDesc(""); setElapsed(0); setTimerStart(null);
    }
  };

  // Stats
  const now = new Date();
  const thisMonth = now.getMonth(); const thisYear = now.getFullYear();
  const totalMins = sessions.reduce((s,x)=>s+x.mins,0);
  const monthMins = sessions.filter(x=>{ const d=new Date(x.date); return d.getMonth()===thisMonth&&d.getFullYear()===thisYear; }).reduce((s,x)=>s+x.mins,0);
  const ct = JSON.parse(localStorage.getItem("bto_contracts")||"{}")[client.id]||{};
  const hourlyRate = monthMins>0?Math.round((parseFloat(ct.montant||99)/(monthMins/60))):0;
  const fmt = m => m>=60?`${Math.floor(m/60)}h${m%60?""+m%60:""}`:`${m}min`;

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
        <div style={{width:4,height:28,borderRadius:2,background:"linear-gradient(135deg,#E85A30,#E85A30)",marginRight:14,flexShrink:0}}/>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"#1E1B30"}}>⏱ Suivi du temps</div>
          <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>Temps passé sur ce client · rentabilité</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Ce mois",        v:fmt(monthMins), c:"#6B40D8"},
          {l:"Total cumulé",   v:fmt(totalMins), c:"#C03080"},
          {l:"Taux horaire",   v:hourlyRate?`${hourlyRate}€/h`:"—", c:hourlyRate>=50?"#059669":hourlyRate>0?"#E85A30":"#9CA3AF"},
          {l:"Contrat/mois",   v:ct.montant?`${ct.montant} €`:"—", c:"#059669"},
        ].map(({l,v,c})=>(
          <div key={l} style={{background:"white",borderRadius:12,padding:"14px",border:"1px solid #E5E7EB",borderTop:`3px solid ${c}`,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
            <div style={{fontSize:11,color:"#6B7280"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Saisie + timer */}
      <div style={{background:"white",borderRadius:14,padding:"18px",border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:13.5,color:"#1E1B30",marginBottom:12}}>Ajouter une session</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input className="inp" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description (audit, avis, publication, appel…)" style={{flex:1,margin:0,fontSize:13}}/>
          <input className="inp" type="number" value={mins} onChange={e=>setMins(e.target.value)} placeholder="min" style={{width:70,margin:0,fontSize:13}} onKeyDown={e=>e.key==="Enter"&&addManual()}/>
          <button onClick={addManual} disabled={!desc.trim()||!mins}
            style={{padding:"9px 16px",borderRadius:9,border:"none",background:"#6B40D8",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,opacity:desc.trim()&&mins?1:.5}}>
            + Ajouter
          </button>
        </div>
        {/* Timer */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!timer?(
            <button onClick={startTimer} disabled={!desc.trim()}
              style={{padding:"8px 16px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,opacity:desc.trim()?1:.5,display:"flex",alignItems:"center",gap:6}}>
              ▶ Démarrer le chrono
            </button>
          ):(
            <>
              <div style={{padding:"8px 16px",borderRadius:9,background:"#FEF2F2",border:"1px solid #FECACA",fontFamily:"monospace",fontSize:15,fontWeight:800,color:"#DC2626"}}>
                {Math.floor(elapsed/3600)>0?`${Math.floor(elapsed/3600)}:`:""}
                {String(Math.floor((elapsed%3600)/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}
              </div>
              <button onClick={stopTimer}
                style={{padding:"8px 16px",borderRadius:9,border:"none",background:"#DC2626",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13}}>
                ⏹ Arrêter et sauvegarder
              </button>
            </>
          )}
        </div>
      </div>

      {/* Historique */}
      {sessions.length>0&&(
        <div style={{background:"white",borderRadius:14,border:"1px solid #E5E7EB",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 3fr 1fr 1fr",padding:"8px 14px",background:"#F4F5FA",borderBottom:"1px solid #E5E7EB",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px"}}>
            {["Date","Description","Durée",""].map(h=><div key={h}>{h}</div>)}
          </div>
          {sessions.slice().reverse().map((s,i)=>(
            <div key={s.id} style={{display:"grid",gridTemplateColumns:"1fr 3fr 1fr 1fr",padding:"10px 14px",borderBottom:i<sessions.length-1?"1px solid #F3F4F6":"none",alignItems:"center"}}>
              <div style={{fontSize:12,color:"#6B7280"}}>{new Date(s.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}</div>
              <div style={{fontSize:13,color:"#1E1B30",fontWeight:500}}>{s.desc}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#6B40D8"}}>{fmt(s.mins)}</div>
              <button onClick={()=>save(sessions.filter(x=>x.id!==s.id))}
                style={{fontSize:11,color:"#dc2626",background:"none",border:"none",cursor:"pointer",padding:"2px 6px"}}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────
function NotificationsPage({clients, go, notifDelay, setNotifDelay, getLvl, calcScore}){
  const now = Date.now();
  const dayMs = 86400000;
  const [filter, setFilter] = useState("all"); // all | critical | high | medium

  const alerts = [];

  clients.forEach(c => {
    try{
      const sc = calcScore({...(c.scores||{}),...(c.manualOverrides||{})});
      const ext = c.data?.extracted||{};
      const avisEnAttente = (c.avisData?.recentAvis||[]).filter(a=>!a.reponse).length;
      const daysSinceAudit = c.date ? Math.floor((now - new Date(c.date).getTime())/dayMs) : 999;
      const posts = c.calPosts||[];
      const donePosts = posts.filter(p=>p.done);
      const lastPost = donePosts.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))[0];
      const daysSincePost = lastPost?.date ? Math.floor((now - new Date(lastPost.date).getTime())/dayMs) : null;
      const note = parseFloat(c.avisData?.note||ext.rating||0);
      const nbAvis = parseInt(c.avisData?.totalAvis||ext.reviewCount||0);
      const taux = parseInt(c.avisData?.responseRate||0);

      // Score critique
      if(sc<50)
        alerts.push({clientId:c.id,client:c,type:"score",prio:"critical",icon:"📉",
          label:`Score critique — ${sc}/100`,
          detail:"La fiche nécessite une intervention urgente",
          action:"Lancer un audit"});

      // Avis sans réponse
      if(avisEnAttente>0)
        alerts.push({clientId:c.id,client:c,type:"avis",prio:"high",icon:"💬",
          label:`${avisEnAttente} avis sans réponse`,
          detail:"Répond vite pour maintenir ton taux",
          action:"Onglet Avis"});

      // Taux de réponse faible
      if(taux>0&&taux<80)
        alerts.push({clientId:c.id,client:c,type:"taux",prio:"high",icon:"⭐",
          label:`Taux de réponse ${taux}% — sous les 80%`,
          detail:"Google pénalise les fiches peu réactives",
          action:"Répondre aux avis"});

      // Note faible
      if(note>0&&note<4)
        alerts.push({clientId:c.id,client:c,type:"note",prio:note<3?"critical":"high",icon:"⚠️",
          label:`Note ${note}/5 — à améliorer`,
          detail:"Déclenche une campagne de collecte d'avis positifs",
          action:"Stratégie avis"});

      // Audit en retard
      if(daysSinceAudit>=notifDelay)
        alerts.push({clientId:c.id,client:c,type:"audit",prio:daysSinceAudit>90?"critical":"medium",icon:"🔄",
          label:`Audit en retard — ${daysSinceAudit}j sans mise à jour`,
          detail:`Dernier audit : ${new Date(c.date).toLocaleDateString("fr-FR")}`,
          action:"Mettre à jour"});

      // Post manquant
      if(daysSincePost!==null&&daysSincePost>14)
        alerts.push({clientId:c.id,client:c,type:"post",prio:daysSincePost>30?"high":"medium",icon:"📝",
          label:`Dernier post il y a ${daysSincePost} jours`,
          detail:"1 post/semaine = critère GMB pour le TOP 3",
          action:"Onglet Posts"});
      else if(daysSincePost===null&&posts.length>0)
        alerts.push({clientId:c.id,client:c,type:"post",prio:"medium",icon:"📝",
          label:"Aucun post publié encore",
          detail:"Publie le premier post pour activer la fiche",
          action:"Onglet Posts"});

      // Peu d'avis
      if(nbAvis>0&&nbAvis<20)
        alerts.push({clientId:c.id,client:c,type:"avis_count",prio:"medium",icon:"🌟",
          label:`Seulement ${nbAvis} avis Google`,
          detail:"Objectif minimum : 20 avis pour apparaître en TOP 3",
          action:"Stratégie avis"});

      // Score en régression
      if(c.history?.length>0){
        const prevSc = calcScore(c.history[c.history.length-1].scores||{});
        if(sc<prevSc-5)
          alerts.push({clientId:c.id,client:c,type:"regression",prio:"high",icon:"📊",
            label:`Score en baisse — ${prevSc} → ${sc} pts`,
            detail:"Identifier ce qui a changé ce mois-ci",
            action:"Voir le rapport"});
      }

    }catch(e){ console.warn("Alert error", c?.name, e); }
  });

  const prioOrder = {critical:0, high:1, medium:2};
  alerts.sort((a,b)=>(prioOrder[a.prio]||3)-(prioOrder[b.prio]||3));

  const prioStyle = {
    critical:{bg:"#FEF2F2",border:"#FECACA",dot:"#DC2626",badge:"#DC2626",label:"Critique"},
    high:    {bg:"#FFF7ED",border:"#FED7AA",dot:"#EA580C",badge:"#EA580C",label:"Urgent"},
    medium:  {bg:"#F4F5FA",border:"#E5E7EB",dot:"#6B7280",badge:"#6B40D8",label:"À planifier"},
  };

  const counts = {
    critical: alerts.filter(a=>a.prio==="critical").length,
    high:     alerts.filter(a=>a.prio==="high").length,
    medium:   alerts.filter(a=>a.prio==="medium").length,
  };

  const displayed = filter==="all" ? alerts : alerts.filter(a=>a.prio===filter);

  // Grouper par client pour la vue "Par client"
  const byClient = {};
  displayed.forEach(a=>{
    if(!byClient[a.clientId]) byClient[a.clientId]={client:a.client,alerts:[]};
    byClient[a.clientId].alerts.push(a);
  });

  return(
    <div style={{padding:"28px 32px",background:"#F4F5FA",minHeight:"100%",overflowY:"auto"}} className="fade">

      {/* Header */}
      <div style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:"#1E1B30",letterSpacing:"-.02em",marginBottom:4}}>◆ Rappels & Alertes</div>
          <div style={{fontSize:13,color:"#6B7280"}}>{alerts.length} alerte{alerts.length>1?"s":""} sur {clients.length} client{clients.length>1?"s":""}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:"#6B7280",fontWeight:500}}>Audit après</span>
          {[14,30,60,90].map(d=>(
            <button key={d} onClick={()=>setNotifDelay(d)}
              style={{padding:"5px 11px",borderRadius:7,background:notifDelay===d?"#6B40D8":"white",color:notifDelay===d?"white":"#6B7280",fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:12,border:`1px solid ${notifDelay===d?"#6B40D8":"#E5E7EB"}`}}>
              {d}j
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {l:"Clients suivis",    v:clients.length,   c:"#6B40D8",icon:"👥", f:null},
          {l:"Critiques",         v:counts.critical,  c:counts.critical?"#DC2626":"#059669", icon:"🔴", f:"critical"},
          {l:"Urgentes",          v:counts.high,      c:counts.high?"#EA580C":"#059669",    icon:"🟠", f:"high"},
          {l:"À planifier",       v:counts.medium,    c:counts.medium?"#6B40D8":"#059669",  icon:"🟡", f:"medium"},
        ].map(({l,v,c,icon,f})=>(
          <div key={l} onClick={()=>f&&setFilter(filter===f?"all":f)}
            style={{background:filter===f?"#1E1B30":"white",borderRadius:12,padding:"14px 16px",border:`1px solid ${filter===f?"#1E1B30":"#E5E7EB"}`,borderTop:`3px solid ${c}`,textAlign:"center",cursor:f?"pointer":"default",transition:"all .15s"}}>
            <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:26,fontWeight:900,color:filter===f?"white":c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:filter===f?"rgba(255,255,255,.6)":"#6B7280",marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtres type */}
      {alerts.length>0&&(
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>setFilter("all")}
            style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${filter==="all"?"#6B40D8":"#E5E7EB"}`,background:filter==="all"?"#6B40D8":"white",color:filter==="all"?"white":"#6B7280",fontFamily:"inherit",fontWeight:600,fontSize:12,cursor:"pointer"}}>
            Tout ({alerts.length})
          </button>
          {["critical","high","medium"].map(p=>{
            const n=counts[p];
            if(!n) return null;
            const st=prioStyle[p];
            return <button key={p} onClick={()=>setFilter(filter===p?"all":p)}
              style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${filter===p?st.badge:"#E5E7EB"}`,background:filter===p?st.badge:"white",color:filter===p?"white":"#6B7280",fontFamily:"inherit",fontWeight:600,fontSize:12,cursor:"pointer"}}>
              {st.label} ({n})
            </button>;
          })}
        </div>
      )}

      {/* Liste */}
      {displayed.length===0?(
        <div style={{background:"white",borderRadius:14,textAlign:"center",padding:"60px 24px",border:"1px solid #E5E7EB"}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:18,fontWeight:800,color:"#1E1B30",marginBottom:6}}>
            {alerts.length===0?"Tout est à jour !":"Aucune alerte dans cette catégorie"}
          </div>
          <div style={{fontSize:13,color:"#6B7280"}}>
            {alerts.length===0?"Aucune alerte pour l'instant. Tes clients sont bien suivis.":"Sélectionne une autre catégorie pour voir les alertes."}
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.values(byClient).map(({client:c,alerts:cAlerts})=>{
            const sc = calcScore({...(c.scores||{}),...(c.manualOverrides||{})});
            const ll = getLvl(sc);
            const hasCritical = cAlerts.some(a=>a.prio==="critical");
            const hasHigh = cAlerts.some(a=>a.prio==="high");
            const borderColor = hasCritical?"#DC2626":hasHigh?"#EA580C":"#6B40D8";
            return(
              <div key={c.id} style={{background:"white",borderRadius:14,border:`1px solid #E5E7EB`,borderLeft:`4px solid ${borderColor}`,overflow:"hidden"}}>
                {/* Client header */}
                <div onClick={()=>go("client",c)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer",borderBottom:"1px solid #F3F4F6"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:36,height:36,borderRadius:9,background:(c.color||"#6B40D8")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                    {c.icon||"📍"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#1E1B30"}}>{c.name}</div>
                    <div style={{fontSize:12,color:"#6B7280"}}>{c.category||""}{c.city?` · ${c.city}`:""}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <div style={{textAlign:"center",background:ll.bg,borderRadius:8,padding:"4px 12px",border:`1px solid ${ll.border}`}}>
                      <div style={{fontSize:16,fontWeight:900,color:ll.color,lineHeight:1}}>{sc}</div>
                      <div style={{fontSize:9,color:"#9CA3AF"}}>score</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      {hasCritical&&<span style={{fontSize:11,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:6,padding:"2px 7px",fontWeight:700}}>Critique</span>}
                      {!hasCritical&&hasHigh&&<span style={{fontSize:11,background:"#FFF7ED",color:"#EA580C",border:"1px solid #FED7AA",borderRadius:6,padding:"2px 7px",fontWeight:700}}>Urgent</span>}
                    </div>
                    <span style={{fontSize:12,color:"#6B40D8",fontWeight:600}}>Ouvrir →</span>
                  </div>
                </div>
                {/* Alertes du client */}
                <div style={{padding:"10px 18px 12px",display:"flex",flexDirection:"column",gap:6}}>
                  {cAlerts.map((alert,i)=>{
                    const st=prioStyle[alert.prio];
                    return(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 12px",background:st.bg,borderRadius:9,border:`1px solid ${st.border}`}}>
                        <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{alert.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12.5,fontWeight:700,color:"#1E1B30"}}>{alert.label}</div>
                          <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{alert.detail}</div>
                        </div>
                        <div style={{fontSize:11,color:st.badge,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{alert.action} →</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={err:null,info:null}; }
  static getDerivedStateFromError(e){ return {err:e}; }
  componentDidCatch(e,info){ this.setState({info}); }
  render(){
    if(this.state.err) return(
      <div style={{padding:40,fontFamily:"monospace",background:"#fef2f2",minHeight:"100vh"}}>
        <div style={{fontSize:18,fontWeight:700,color:"#dc2626",marginBottom:16}}>⚠️ Erreur de rendu</div>
        <pre style={{fontSize:12,color:"#7f1d1d",whiteSpace:"pre-wrap",background:"white",padding:20,borderRadius:12,border:"1px solid #fecaca"}}>
          {this.state.err.toString()}{"\n\n"}{this.state.err.stack?.slice(0,800)}
        </pre>
        <button onClick={()=>this.setState({err:null})} style={{marginTop:16,padding:"8px 20px",background:"#dc2626",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>Réessayer</button>
      </div>
    );
    return this.props.children;
  }
}


// ─── AI ASSISTANT FLOTTANT ────────────────────────────────────────────────────
function AIAssistant({apiKey, clients, page, activeClient, calcScore, getLvl}){
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([{role:"assistant",text:"Bonjour Sara 👋 Je suis votre assistant BeTheOne. Posez-moi n'importe quelle question sur vos clients, vos scores, votre stratégie GMB ou la plateforme."}]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const bottomRef = useRef(null);

  useEffect(()=>{ if(open){ bottomRef.current?.scrollIntoView({behavior:"smooth"}); setUnread(0); } },[msgs,open]);

  const ctxSummary = ()=>{
    const total = clients.length;
    const scores = clients.map(c=>calcScore({...(c.scores||{}),...(c.manualOverrides||{})}));
    const avgScore = total ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    const avisAttente = clients.reduce((s,c)=>s+(c.avisData?.recentAvis||[]).filter(a=>!a.reponse).length, 0);
    const sansAudit = clients.filter(c=>!c.date||(Date.now()-new Date(c.date).getTime())>2592000000).length;

    // Contexte de la fiche active si disponible
    let clientCtx = "";
    if(activeClient){
      const sc = calcScore({...(activeClient.scores||{}),...(activeClient.manualOverrides||{})});
      const lv = getLvl(sc);
      const failed = Object.entries(activeClient.scores||{}).filter(([,v])=>v===false).length;
      const avis = (activeClient.avisData?.recentAvis||[]).filter(a=>!a.reponse).length;
      const data = activeClient.data||{};
      clientCtx = `

=== FICHE ACTIVE : ${activeClient.name} ===
- Score GMB : ${sc}/100 (${lv.label})
- Ville : ${activeClient.city||"—"} · Catégorie : ${activeClient.category||"—"}
- Critères échoués : ${failed}
- Avis sans réponse : ${avis}
- Note Google : ${data.extracted?.rating||"—"}/5 · ${data.extracted?.reviewCount||"—"} avis
- Dernier audit : ${activeClient.date ? new Date(activeClient.date).toLocaleDateString("fr-FR") : "jamais"}
${data.insights?.summary ? `- Synthèse IA : ${data.insights.summary.slice(0,200)}…` : ""}
${(data.insights?.quickWins||[]).length ? `- Quick wins : ${data.insights.quickWins.slice(0,3).join(" · ")}` : ""}
${(()=>{const geoKws=[...new Set([...(data.keywords?.primary||[]).map(k=>k.kw),...(data.keywords?.secondary||[]).map(k=>k.kw),...(activeClient.geoGrid?.keywords||[])])].filter(Boolean);return geoKws.length?`- Mots-clés suivis : ${geoKws.join(", ")}`:"";})()} `;
    }

    return `Tu es l'assistant expert de Sara Baudouin, fondatrice de l'agence BeTheOne (Vannes), spécialisée en optimisation Google Business Profile (GMB).

=== CONTEXTE AGENCE ===
- ${total} client(s) en portefeuille
- Score moyen du portefeuille : ${avgScore}/100
- Avis sans réponse : ${avisAttente}
- Clients sans audit depuis +30j : ${sansAudit}
- Page active : ${page}
${clientCtx}

=== TES CAPACITÉS ===
Tu peux aider Sara à :
- Analyser une fiche GMB et prioriser les actions
- Rédiger des réponses aux avis, des posts Google, des emails de prospection
- Expliquer les algorithmes Google Maps et le SEO local
- Suggérer des stratégies d'optimisation par secteur
- Interpréter les scores et KPIs de ses clients

Réponds en français, de façon concise et actionnable. Si Sara parle d'un client spécifique, utilise les données de la fiche active ci-dessus.`;
  };

  const send = async() => {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey || localStorage.getItem("bto_apikey") || "";
    if(!input.trim()||!key) return;
    const userMsg = {role:"user",text:input};
    setMsgs(m=>[...m,userMsg]);
    setInput("");
    setLoading(true);
    try{
      const history = msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          system:ctxSummary(),
          messages:[...history,{role:"user",content:input}]
        })
      });
      const d = await res.json();
      const reply = (d.content||[]).map(b=>b.text||"").join("").trim();
      setMsgs(m=>[...m,{role:"assistant",text:reply}]);
      if(!open) setUnread(n=>n+1);
    }catch(e){
      setMsgs(m=>[...m,{role:"assistant",text:"Désolée, une erreur est survenue. Vérifiez votre clé API dans Mon Espace."}]);
    }
    setLoading(false);
  };

  return(
    <>
      {/* Fenêtre chat */}
      {open&&(
        <div style={{position:"fixed",bottom:80,right:20,width:360,height:500,background:"white",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,.18)",display:"flex",flexDirection:"column",zIndex:9999,border:"1px solid #E5E7EB",overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",padding:"14px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✨</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:700,color:"white"}}>Assistant BeTheOne</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)"}}>Powered by Claude</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(255,255,255,.15)",color:"white",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  background:m.role==="user"?"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)":"#F3F4F6",
                  color:m.role==="user"?"white":"#1E1B30",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",justifyContent:"flex-start"}}>
                <div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:"#F3F4F6",display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#9CA3AF",animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{padding:"12px",borderTop:"1px solid #E5E7EB",display:"flex",gap:8,flexShrink:0,background:"white"}}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
              placeholder="Posez votre question…"
              style={{flex:1,padding:"9px 13px",borderRadius:10,border:"1px solid #E5E7EB",fontSize:13,fontFamily:"inherit",outline:"none",background:"#F4F5FA"}}/>
            <button onClick={send} disabled={!input.trim()||loading}
              style={{width:38,height:38,borderRadius:10,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",opacity:input.trim()?1:.4,flexShrink:0}}>
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Bulle flottante */}
      <button onClick={()=>setOpen(!open)}
        style={{position:"fixed",bottom:20,right:20,width:52,height:52,borderRadius:"50%",border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontSize:22,boxShadow:"0 8px 24px rgba(37,99,235,.4)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s",transform:open?"scale(.9)":"scale(1)"}}>
        {open?"×":"✨"}
        {!open&&unread>0&&(
          <div style={{position:"absolute",top:-2,right:-2,width:18,height:18,borderRadius:"50%",background:"#dc2626",color:"white",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white"}}>{unread}</div>
        )}
      </button>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  );
}

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
function GlobalSearch({clients, go}){
  const [q,    setQ]    = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const handler=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[]);

  const results = q.trim().length<2?[]:clients.filter(c=>
    c.name?.toLowerCase().includes(q.toLowerCase())||
    c.city?.toLowerCase().includes(q.toLowerCase())||
    c.category?.toLowerCase().includes(q.toLowerCase())
  ).slice(0,6);

  return(
    <div ref={ref} style={{position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,background:"#F4F5FA",borderRadius:9,border:"1px solid #E5E7EB",padding:"7px 11px"}}>
        <span style={{fontSize:12,color:"#9CA3AF",flexShrink:0}}>🔍</span>
        <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}}
          onFocus={()=>q.length>1&&setOpen(true)}
          placeholder="Rechercher un client…"
          style={{border:"none",background:"transparent",fontSize:12.5,outline:"none",flex:1,fontFamily:"inherit",color:"#1E1B30"}}/>
        {q&&<button onClick={()=>{setQ("");setOpen(false);}} style={{border:"none",background:"none",cursor:"pointer",color:"#9CA3AF",fontSize:13,padding:0}}>✕</button>}
      </div>
      {open&&results.length>0&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"white",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,.12)",border:"1px solid #E5E7EB",zIndex:999,overflow:"hidden"}}>
          {results.map(c=>{
            const sc=c.scores?Object.values(c.scores).filter(v=>v===true).length:0;
            return(
              <div key={c.id} onClick={()=>{go("client",c);setQ("");setOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",cursor:"pointer",borderBottom:"1px solid #F3F4F6",transition:"background .1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F4F5FA"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{width:28,height:28,borderRadius:7,background:(c.color||"#6B40D8")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.icon||"📍"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#1E1B30",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>{c.city||""}{c.category?` · ${c.category}`:""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

// ─── AVIS GLOBAL PAGE ─────────────────────────────────────────────────────────
function AvisGlobalPage({clients, go, getLvl, calcScore}){
  const clientsWithScore = clients.map(c=>({
    ...c,
    score: calcScore({...(c.scores||{}),...(c.manualOverrides||{})}),
    note: parseFloat(c.avisData?.note||c.data?.extracted?.rating||0),
    nbAvis: parseInt(c.avisData?.totalAvis||c.data?.extracted?.reviewCount||0),
    tauxRep: parseInt(c.avisData?.responseRate||c.data?.reviews?.responseRate||0),
    avisEnAttente: (c.avisData?.recentAvis||[]).filter(a=>!a.reponse).length,
  })).sort((a,b)=>a.avisEnAttente>b.avisEnAttente?-1:a.note<b.note?-1:0);

  const totalAvis = clientsWithScore.reduce((s,c)=>s+c.nbAvis,0);
  const avgNote   = clientsWithScore.filter(c=>c.note).length
    ? (clientsWithScore.filter(c=>c.note).reduce((s,c)=>s+c.note,0)/clientsWithScore.filter(c=>c.note).length).toFixed(1)
    : "—";
  const enAttente = clientsWithScore.reduce((s,c)=>s+c.avisEnAttente,0);

  return(
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}} className="fade">
      <div style={{marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:800,color:"#1E1B30",marginBottom:4}}>Gestion des avis clients</div>
        <div style={{fontSize:13.5,color:"#6B7280"}}>Suivi de la réputation de tous vos clients</div>
      </div>

      {/* KPIs globaux */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          {l:"Clients suivis", v:clients.length, c:"#6B40D8", icon:"👥"},
          {l:"Total avis", v:totalAvis||"—", c:"#C03080", icon:"💬"},
          {l:"Note moyenne", v:avgNote, c:"#d97706", icon:"⭐"},
          {l:"Réponses en attente", v:enAttente||"0", c:enAttente>0?"#dc2626":"#059669", icon:"↩️"},
        ].map(({l,v,c,icon})=>(
          <div key={l} style={{background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #E5E7EB",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${c}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau clients */}
      <div style={{background:"white",borderRadius:14,border:"1px solid #E5E7EB",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 18px",background:"#F4F5FA",borderBottom:"1px solid #E5E7EB",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:".5px"}}>
          <div>Client</div>
          <div style={{textAlign:"center"}}>Note</div>
          <div style={{textAlign:"center"}}>Nb avis</div>
          <div style={{textAlign:"center"}}>Réponses</div>
          <div style={{textAlign:"center"}}>À traiter</div>
          <div style={{textAlign:"center"}}>Action</div>
        </div>
        {clients.length===0?(
          <div style={{textAlign:"center",padding:"40px",color:"#6B7280",fontSize:14}}>Aucun client — commencez par créer un audit</div>
        ):clientsWithScore.map(c=>{
          const noteColor = c.note>=4.5?"#059669":c.note>=4?"#d97706":c.note>=3.5?"#f97316":c.note?"#dc2626":"#9CA3AF";
          const tauxColor = c.tauxRep>=80?"#059669":c.tauxRep>=50?"#d97706":c.tauxRep?"#dc2626":"#9CA3AF";
          return(
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:"14px 18px",borderBottom:"1px solid #F3F4F6",alignItems:"center",transition:"background .12s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F4F5FA"}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:(c.color||"#6B40D8")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.icon||"📍"}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:13.5,color:"#1E1B30"}}>{c.name}</div>
                  <div style={{fontSize:11.5,color:"#9CA3AF"}}>{c.city||c.category||""}</div>
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <span style={{fontWeight:700,fontSize:14,color:noteColor}}>{c.note||"—"}{c.note?" ★":""}</span>
              </div>
              <div style={{textAlign:"center",fontWeight:600,fontSize:14,color:"#374151"}}>{c.nbAvis||"—"}</div>
              <div style={{textAlign:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:tauxColor}}>{c.tauxRep?`${c.tauxRep}%`:"—"}</span>
              </div>
              <div style={{textAlign:"center"}}>
                {c.avisEnAttente>0?(
                  <span style={{fontSize:12,fontWeight:700,color:"#dc2626",background:"#FEF2F2",padding:"3px 10px",borderRadius:20}}>{c.avisEnAttente} avis</span>
                ):(
                  <span style={{fontSize:12,color:"#059669",fontWeight:600}}>✓ À jour</span>
                )}
              </div>
              <div style={{textAlign:"center"}}>
                <button onClick={()=>go("client",c)} style={{fontSize:12,padding:"5px 14px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#6B40D8",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .18s"}}>
                  Gérer →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonEspacePage({clients,go,getLvl,calcScore,setAuth,setGoogleApiKey}){
  const now=new Date();
  const scores=clients.map(c=>calcScore({...(c.scores||{}),...(c.manualOverrides||{})}));
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  const thisMonth=now.getMonth(), thisYear=now.getFullYear();
  const auditsMonth=clients.filter(c=>{const d=new Date(c.date);return d.getMonth()===thisMonth&&d.getFullYear()===thisYear;}).length;
  const [objective,setObjective]=useState(()=>parseInt(localStorage.getItem('gmb_monthly_obj')||'4'));
  const [editObj,setEditObj]=useState(false);
  const [notes,setNotes]=useState(()=>localStorage.getItem('bto_sara_notes')||'');
  const [activeTab,setActiveTab]=useState("tableau_bord");

  // Données contrats/clients enrichies (stockées séparément)
  const [contracts,setContracts]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem("bto_contracts")||"{}"); }catch{ return {}; }
  });
  const [editingId,setEditingId]=useState(null);
  const [editForm,setEditForm]=useState({});

  const saveContracts=(next)=>{ setContracts(next); localStorage.setItem("bto_contracts",JSON.stringify(next)); };
  const getContract=(id)=>contracts[id]||{interlocuteur:"",poste:"",telephone:"",email:"",typeContrat:"abonnement",montant:"99",dateSignature:"",dateRenouvellement:"",statut:"actif",notes:""};
  const updateContract=(id,data)=>{ saveContracts({...contracts,[id]:{...getContract(id),...data}}); };

  const hour=now.getHours();
  const greet=hour<12?"Bonjour":hour<18?"Bon après-midi":"Bonsoir";
  const revenueTotal=clients.reduce((s,c)=>{const ct=getContract(c.id);return s+parseFloat(ct.montant||99);},0);

  const CONTRAT_TYPES=[{v:"abonnement",l:"Abonnement mensuel"},{v:"pack",l:"Pack 6 mois"},{v:"annuel",l:"Annuel"},{v:"ponctuel",l:"Prestation ponctuelle"}];
  const STATUTS=[{v:"actif",l:"Actif",c:"#059669"},{v:"pause",l:"En pause",c:"#E85A30"},{v:"resilie",l:"Résilié",c:"#dc2626"},{v:"prospect",l:"Prospect",c:"#6B7280"}];

  const TabBtn=({id,label})=>(
    <button onClick={()=>setActiveTab(id)}
      style={{padding:"8px 18px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",
        background:activeTab===id?"white":"transparent",color:activeTab===id?"#1E1B30":"#6B7280",
        boxShadow:activeTab===id?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
      {label}
    </button>
  );

  return(
    <div style={{padding:"28px 32px",background:"#F4F5FA",minHeight:"100%",overflowY:"auto"}} className="fade">

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:4}}>{greet} · {now.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
          <div style={{fontSize:24,fontWeight:900,color:"#1E1B30",letterSpacing:"-.02em"}}>Mon espace</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {/* Import backup */}
          <button onClick={()=>{
            const input=document.createElement("input"); input.type="file"; input.accept=".json";
            input.onchange=(e)=>{
              const file=e.target.files[0]; if(!file) return;
              const reader=new FileReader();
              reader.onload=(ev)=>{
                try{
                  const data=JSON.parse(ev.target.result);
                  if(!data.clients&&!data.prospects) throw new Error("Format non reconnu");
                  if(data.clients?.length) localStorage.setItem("gmb_crm_v10",JSON.stringify(data.clients));
                  if(data.prospects?.length) localStorage.setItem("gmb_prosp_v2",JSON.stringify(data.prospects));
                  if(data.contracts) localStorage.setItem("bto_contracts",JSON.stringify(data.contracts));
                  window.location.reload();
                }catch(err){ window.alert("Fichier invalide — utilisez un backup BeTheOne .json"); }
              };
              reader.readAsText(file);
            };
            input.click();
          }} style={{fontSize:12.5,padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#C03080",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            ⬆️ Importer
          </button>
          {/* Export JSON */}
          <button onClick={()=>{
            const data={clients,prospects:JSON.parse(localStorage.getItem("gmb_prosp_v2")||"[]"),contracts,exportDate:new Date().toISOString()};
            const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
            const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
            a.download=`betheone_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
          }} style={{fontSize:12.5,padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#059669",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            ⬇️ Export JSON
          </button>
          {/* CSV Contrats */}
          <button onClick={()=>{
            const rows=[["Nom","Interlocuteur","Tél","Email","Contrat","Montant","Signature","Statut"],...clients.map(c=>{const ct=getContract(c.id);return[c.name,ct.interlocuteur,ct.telephone,ct.email,ct.typeContrat,ct.montant,ct.dateSignature,ct.statut];})];
            const csv=rows.map(r=>r.map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(";")).join("\n");
            const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
            const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
            a.download=`contrats_${new Date().toISOString().slice(0,10)}.csv`; a.click();
          }} style={{fontSize:12.5,padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#6B40D8",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            📊 CSV
          </button>
          {/* Déconnexion */}
          <button onClick={()=>setAuth(false)} style={{fontSize:12.5,padding:"8px 14px",borderRadius:9,border:"1px solid #E5E7EB",background:"white",color:"#6B7280",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            Déconnexion →
          </button>
        </div>
      </div>

      {/* Navigation onglets */}
      <div style={{display:"flex",gap:4,marginBottom:20,background:"#F3F4F6",borderRadius:11,padding:4,width:"fit-content"}}>
        <TabBtn id="tableau_bord" label="📊 Tableau de bord"/>
        <TabBtn id="contrats"     label="📋 Contrats"/>
        <TabBtn id="facturation"  label="💶 Facturation"/>
        <TabBtn id="onboarding"   label="🚀 Onboarding"/>
        <TabBtn id="parametres"   label="⚙️ Paramètres"/>
      </div>

      {/* ── TABLEAU DE BORD ── */}
      {activeTab==="tableau_bord"&&(
        <div>
          {/* KPIs revenus */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[
              {l:"Clients actifs", v:clients.filter(c=>getContract(c.id).statut!=="resilie").length, c:"#6B40D8", icon:"👥"},
              {l:"MRR estimé",     v:`${Math.round(revenueTotal).toLocaleString("fr-FR")} €`, c:"#059669", icon:"💶"},
              {l:"Score moyen",    v:avg?`${avg}/100`:"—",  c:"#C03080", icon:"📊"},
              {l:"Audits ce mois", v:auditsMonth, c:"#E85A30", icon:"🔄"},
            ].map(({l,v,c,icon})=>(
              <div key={l} style={{background:"white",borderRadius:12,padding:"16px",border:"1px solid #E5E7EB",borderTop:`3px solid ${c}`,textAlign:"center"}}>
                <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:24,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-.02em"}}>{v}</div>
                <div style={{fontSize:11,color:"#6B7280",marginTop:5}}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {/* Objectif mensuel */}
            <div style={{background:"white",borderRadius:14,padding:"20px 22px",border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:14,color:"#1E1B30"}}>Objectif mensuel</div>
                {editObj?(<div style={{display:"flex",gap:6}}><input type="number" className="inp" value={objective} style={{width:55,margin:0,fontSize:13}} onChange={e=>{const v=Math.max(1,parseInt(e.target.value)||1);setObjective(v);localStorage.setItem('gmb_monthly_obj',v);}}/><button className="btn-sm" onClick={()=>setEditObj(false)}>OK</button></div>):<button className="btn-ghost" style={{fontSize:11}} onClick={()=>setEditObj(true)}>Modifier</button>}
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:10}}>
                <span style={{fontSize:38,fontWeight:900,color:"#6B40D8",lineHeight:1}}>{auditsMonth}</span>
                <span style={{fontSize:14,color:"#9CA3AF",marginBottom:4}}>/ {objective} audits</span>
              </div>
              <div style={{height:8,background:"#F3F4F6",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(Math.round((auditsMonth/objective)*100),100)}%`,background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:4}}/>
              </div>
              {auditsMonth>=objective&&<div style={{fontSize:12,color:"#059669",fontWeight:700,marginTop:8}}>🏆 Objectif atteint !</div>}
            </div>

            {/* Notes rapides */}
            <div style={{background:"white",borderRadius:14,padding:"20px 22px",border:"1px solid #E5E7EB",borderTop:"3px solid #E85A30"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:10}}>📝 Notes rapides</div>
              <textarea className="ta" rows={4} value={notes}
                onChange={e=>{setNotes(e.target.value);localStorage.setItem('bto_sara_notes',e.target.value);}}
                placeholder="Idées, actions, rappels…" style={{fontSize:13,lineHeight:1.7,margin:0}}/>
            </div>
          </div>

          {/* Renouvellements à venir */}
          {(()=>{
            const soon=clients.filter(c=>{
              const ct=getContract(c.id);
              if(!ct.dateRenouvellement) return false;
              const diff=Math.floor((new Date(ct.dateRenouvellement)-now)/(86400000));
              return diff>=0&&diff<=30;
            }).map(c=>({c,ct:getContract(c.id),diff:Math.floor((new Date(getContract(c.id).dateRenouvellement)-now)/86400000)}));
            if(!soon.length) return null;
            return(
              <div style={{background:"white",borderRadius:14,padding:"20px 22px",border:"1px solid #FED7AA",borderTop:"3px solid #E85A30",marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:14,color:"#E85A30",marginBottom:12}}>⚡ Renouvellements dans les 30 jours</div>
                {soon.map(({c,ct,diff})=>(
                  <div key={c.id} onClick={()=>go("client",c)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#FFF7ED",borderRadius:10,marginBottom:8,cursor:"pointer",border:"1px solid #FED7AA"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#1E1B30"}}>{c.name}</div>
                      <div style={{fontSize:11.5,color:"#6B7280"}}>{ct.typeContrat} · {ct.montant}€/mois</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:diff<=7?"#dc2626":"#E85A30",background:diff<=7?"#FEF2F2":"#FFF7ED",padding:"3px 10px",borderRadius:20,border:`1px solid ${diff<=7?"#FECACA":"#FED7AA"}`}}>
                      {diff===0?"Aujourd'hui":diff===1?"Demain":`Dans ${diff}j`}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── CONTRATS CLIENTS ── */}
      {activeTab==="contrats"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"#1E1B30"}}>Gestion des contrats — {clients.length} client{clients.length>1?"s":""}</div>
            <div style={{fontSize:12,color:"#6B7280"}}>Cliquez sur ✏️ pour modifier les informations</div>
          </div>

          {clients.length===0?(
            <div style={{textAlign:"center",padding:"48px",color:"#9CA3AF",background:"white",borderRadius:14,border:"1px solid #E5E7EB"}}>
              <div style={{fontSize:32,marginBottom:8}}>📋</div>Aucun client — créez d'abord des audits
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {clients.map(c=>{
                const ct=getContract(c.id);
                const statut=STATUTS.find(s=>s.v===ct.statut)||STATUTS[0];
                const isEditing=editingId===c.id;
                return(
                  <div key={c.id} style={{background:"white",borderRadius:14,border:"1px solid #E5E7EB",overflow:"hidden",borderLeft:`4px solid ${statut.c}`}}>
                    {/* Header client */}
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:isEditing?"1px solid #E5E7EB":"none"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:(c.color||"#6B40D8")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon||"📍"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#1E1B30"}}>{c.name}</div>
                        <div style={{fontSize:12,color:"#6B7280"}}>{c.city||""}{c.category?` · ${c.category}`:""}</div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:11.5,fontWeight:700,color:statut.c,background:`${statut.c}15`,padding:"3px 10px",borderRadius:20}}>{statut.l}</span>
                        {ct.montant&&<span style={{fontSize:13,fontWeight:800,color:"#059669"}}>{ct.montant} €/mois</span>}
                        <button onClick={()=>{if(isEditing){setEditingId(null);}else{setEditingId(c.id);setEditForm(ct);}}}
                          style={{padding:"6px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:isEditing?"#6B40D8":"white",color:isEditing?"white":"#374151",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                          {isEditing?"✓ Fermer":"✏️ Modifier"}
                        </button>
                      </div>
                    </div>

                    {/* Infos résumées (mode fermé) */}
                    {!isEditing&&(ct.interlocuteur||ct.telephone||ct.dateSignature)&&(
                      <div style={{display:"flex",gap:20,padding:"10px 18px",fontSize:12,color:"#6B7280"}}>
                        {ct.interlocuteur&&<span>👤 {ct.interlocuteur}{ct.poste?` — ${ct.poste}`:""}</span>}
                        {ct.telephone&&<span>📞 {ct.telephone}</span>}
                        {ct.email&&<span>📧 {ct.email}</span>}
                        {ct.dateSignature&&<span>📝 Signé le {new Date(ct.dateSignature).toLocaleDateString("fr-FR")}</span>}
                        {ct.dateRenouvellement&&<span>🔄 Renouvellement {new Date(ct.dateRenouvellement).toLocaleDateString("fr-FR")}</span>}
                      </div>
                    )}

                    {/* Formulaire édition */}
                    {isEditing&&(
                      <div style={{padding:"16px 18px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
                          {[
                            {k:"interlocuteur",l:"Interlocuteur",ph:"Prénom Nom"},
                            {k:"poste",l:"Poste",ph:"Gérant, Responsable…"},
                            {k:"telephone",l:"Téléphone",ph:"06 12 34 56 78"},
                            {k:"email",l:"Email",ph:"contact@client.fr"},
                            {k:"montant",l:"Montant (€/mois)",ph:"99",type:"number"},
                          ].map(f=>(
                            <div key={f.k}>
                              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>{f.l}</div>
                              <input className="inp" type={f.type||"text"} value={editForm[f.k]||""} onChange={e=>setEditForm({...editForm,[f.k]:e.target.value})} placeholder={f.ph} style={{margin:0,fontSize:12.5}}/>
                            </div>
                          ))}
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>Type de contrat</div>
                            <select className="inp" value={editForm.typeContrat||"abonnement"} onChange={e=>setEditForm({...editForm,typeContrat:e.target.value})} style={{margin:0,fontSize:12.5}}>
                              {CONTRAT_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>Statut</div>
                            <select className="inp" value={editForm.statut||"actif"} onChange={e=>setEditForm({...editForm,statut:e.target.value})} style={{margin:0,fontSize:12.5}}>
                              {STATUTS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>Date de signature</div>
                            <input className="inp" type="date" value={editForm.dateSignature||""} onChange={e=>setEditForm({...editForm,dateSignature:e.target.value})} style={{margin:0,fontSize:12.5}}/>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>Date de renouvellement</div>
                            <input className="inp" type="date" value={editForm.dateRenouvellement||""} onChange={e=>setEditForm({...editForm,dateRenouvellement:e.target.value})} style={{margin:0,fontSize:12.5}}/>
                          </div>
                        </div>
                        <div style={{marginBottom:10}}>
                          <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:4}}>Notes internes</div>
                          <textarea className="ta" rows={2} value={editForm.notes||""} onChange={e=>setEditForm({...editForm,notes:e.target.value})} placeholder="Notes privées sur ce client…" style={{margin:0,fontSize:12.5}}/>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button className="btn" onClick={()=>{updateContract(c.id,editForm);setEditingId(null);}} style={{padding:"8px 20px",fontSize:13}}>Enregistrer</button>
                          <button className="btn-ghost" onClick={()=>setEditingId(null)}>Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── FACTURATION ── */}
      {activeTab==="facturation"&&<FacturationTab clients={clients} getContract={getContract}/>}

      {/* ── ONBOARDING ── */}
      {activeTab==="onboarding"&&<OnboardingTab clients={clients} getContract={getContract}/>}

      {/* ── PARAMÈTRES ── */}
      {activeTab==="parametres"&&(
        <div style={{maxWidth:560}}>
          <div style={{background:"white",borderRadius:14,padding:"22px 24px",border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:14}}>🔑 Clés API</div>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:12.5,fontWeight:600,color:"#374151"}}>Clé API Anthropic</div>
                {localStorage.getItem("bto_apikey")&&<span style={{fontSize:11,color:"#059669",fontWeight:700,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:20,padding:"2px 8px"}}>✓ Active</span>}
              </div>
              <input className="inp" type="password" defaultValue={localStorage.getItem("bto_apikey")||""}
                onChange={e=>localStorage.setItem("bto_apikey",e.target.value)}
                placeholder="sk-ant-..."/>
            </div>

            {/* Google Maps API Key */}
            <div style={{marginTop:16}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                🗺️ Clé Google Maps API
                {localStorage.getItem("bto_google_key")&&<span style={{fontSize:11,color:"#059669",fontWeight:700,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:20,padding:"2px 8px"}}>✓ Active</span>}
              </div>
              <input className="inp" type="password" defaultValue={localStorage.getItem("bto_google_key")||""}
                onChange={e=>{localStorage.setItem("bto_google_key",e.target.value);if(setGoogleApiKey)setGoogleApiKey(e.target.value);}}
                placeholder="AIzaSy..."
                style={{margin:0,fontFamily:"monospace",fontSize:13}}/>
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:5}}>Créer dans <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{color:"#6B40D8"}}>Google Cloud Console</a> → API et services → Identifiants</div>
            </div>
          </div>

          <div style={{background:"white",borderRadius:14,padding:"22px 24px",border:"1px solid #E5E7EB",borderTop:"3px solid #E85A30"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:14}}>🎯 Objectif mensuel</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="number" className="inp" value={objective} style={{width:80,margin:0}}
                onChange={e=>{const v=Math.max(1,parseInt(e.target.value)||1);setObjective(v);localStorage.setItem('gmb_monthly_obj',v);}}/>
              <div style={{fontSize:13,color:"#6B7280"}}>audits par mois</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocalHeatMap({kw}){
  const allZoneKws=(kw.primary||[]).filter(k=>(k.zoneRankings||[]).length>0);
  const [activeKwIdx,setActiveKwIdx]=useState(0);
  if(!allZoneKws.length) return null;

  const activeKw=allZoneKws[Math.min(activeKwIdx,allZoneKws.length-1)];
  const zones=activeKw.zoneRankings||[];
  const cols=Math.min(zones.length,5);
  const rankColor=r=>r<=3?"#059669":r<=10?"#E85A30":r<=20?"#EA580C":"#dc2626";
  const rankBg=r=>r<=3?"#F0FDF4":r<=10?"#FFF7ED":r<=20?"#FFF7ED":"#FEF2F2";
  const rankLabel=r=>r<=3?"TOP 3":r<=10?"TOP 10":r<=20?"TOP 20":"Hors 20";

  return(
    <div style={{background:"white",borderRadius:14,padding:"20px 22px",border:"1px solid #E5E7EB",borderTop:"3px solid #C03080",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:14,color:"#1E1B30"}}>🗺️ Classements locaux par zone</div>
        <div style={{fontSize:11,color:"#9CA3AF"}}>Données issues de l'analyse IA</div>
      </div>
      {/* Sélecteur mot-clé */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {allZoneKws.map((k,i)=>(
          <button key={i} onClick={()=>setActiveKwIdx(i)}
            style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${i===activeKwIdx?"#C03080":"#E5E7EB"}`,background:i===activeKwIdx?"#C03080":"white",color:i===activeKwIdx?"white":"#374151",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",transition:"all .15s"}}>
            {k.kw}
          </button>
        ))}
      </div>
      {/* Grille */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8,marginBottom:14}}>
        {zones.map((z,i)=>(
          <div key={i} style={{background:rankBg(z.rank),borderRadius:12,padding:"14px 10px",textAlign:"center",border:`1px solid ${rankColor(z.rank)}33`}}>
            <div style={{fontSize:22,fontWeight:900,color:rankColor(z.rank),lineHeight:1,marginBottom:4}}>{z.rank<=20?`#${z.rank}`:"—"}</div>
            <div style={{fontSize:10,fontWeight:700,color:rankColor(z.rank),marginBottom:5}}>{rankLabel(z.rank)}</div>
            <div style={{fontSize:10.5,color:"#374151",lineHeight:1.4}}>{z.zone}</div>
          </div>
        ))}
      </div>
      {/* Légende */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:activeKw.zoneRecos?.length?14:0}}>
        {[{l:"TOP 3",c:"#059669",bg:"#F0FDF4"},{l:"TOP 10",c:"#E85A30",bg:"#FFF7ED"},{l:"TOP 20",c:"#EA580C",bg:"#FFF7ED"},{l:"Hors 20",c:"#dc2626",bg:"#FEF2F2"}].map(({l,c,bg})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:c,fontWeight:600}}>
            <div style={{width:10,height:10,borderRadius:3,background:bg,border:`1.5px solid ${c}`}}/>{l}
          </div>
        ))}
      </div>
      {/* Recommandations */}
      {(activeKw.zoneRecos||[]).length>0&&(
        <div style={{paddingTop:12,borderTop:"1px solid #E5E7EB"}}>
          <div style={{fontSize:10.5,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Actions par zone</div>
          {activeKw.zoneRecos.slice(0,3).map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",background:"#F4F5FA",borderRadius:9,marginBottom:6,border:"1px solid #E5E7EB",alignItems:"flex-start"}}>
              <span style={{fontSize:11,fontWeight:800,color:rankColor(r.rank),flexShrink:0,width:36}}>{r.rank<=20?`#${r.rank}`:"—"}</span>
              <div>
                <div style={{fontSize:11.5,fontWeight:600,color:"#1E1B30",marginBottom:2}}>{r.zone}</div>
                <div style={{fontSize:11.5,color:"#374151"}}>→ {r.reco}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GEO GRID TAB ────────────────────────────────────────────────────────────
function GeoGridTab({client, clients, upd, kw, googleApiKey}){
  // Source de vérité : data.keywords (audit IA) + geoGrid.keywords (ajouts manuels)
  const allKwsFromAudit = [...(kw?.primary||[]),...(kw?.secondary||[])].map(k=>k.kw).filter(Boolean);
  const gridData = client?.geoGrid || {};
  const storedKws = gridData.keywords || [];
  const allKws = [...new Set([...allKwsFromAudit,...storedKws])];

  const [selKw,    setSelKw]    = useState(allKws[0]||"");
  const [newKw,    setNewKw]    = useState("");
  const [addKwMode,setAddKwMode]= useState(false);
  const [gridSize, setGridSize] = useState(7);
  const [spacing,  setSpacing]  = useState(10000); // 10km default
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanLog,  setScanLog]  = useState("");
  const [selCell,  setSelCell]  = useState(null); // cellule sélectionnée pour popup
  const [leafletReady, setLeafletReady] = useState(!!window.L);
  const mapRef     = useRef(null);
  const mapInst    = useRef(null);
  const markersRef = useRef([]);
  const popupRef   = useRef(null);

  const save = patch => upd(clients.map(c=>c.id===client.id?{...c,...patch}:c));
  const kwGrid  = gridData[selKw] || {};
  const scans   = kwGrid.scans || [];
  const latest  = scans[scans.length-1] || null;
  // cells stocke {rank, competitors:[{name,pos}]} ou juste un entier (legacy)
  const cells   = latest?.cells || [];
  const getRank = cell => typeof cell==="object" ? cell?.rank : cell;
  const getComps= cell => typeof cell==="object" ? (cell?.competitors||[]) : [];
  const total   = gridSize*gridSize;

  const filled  = cells.map(getRank).filter(v=>v!==null&&v!==undefined&&v>0&&v<=20);
  const scanned = cells.filter(c=>c!==null&&c!==undefined).length;
  const top3    = filled.filter(v=>v<=3).length;
  const top10   = filled.filter(v=>v<=10).length;
  const hors20  = cells.map(getRank).filter(v=>v!==null&&v!==undefined&&v>20).length;
  const avgRk   = filled.length ? Math.round(filled.reduce((a,b)=>a+b,0)/filled.length*10)/10 : null;

  const posColor = p => {
    if(!p||p===0)  return "#94A3B8";
    if(p<=3)       return "#059669";
    if(p<=10)      return "#E85A30";
    if(p<=20)      return "#DC2626";
    return "#6B7280";
  };
  const posLabel = p => (!p||p===0)?"?":p>20?"20+":String(p);

  const addKeyword = kwText => {
    if(!kwText.trim()) return;
    const kw = kwText.trim();
    // 1. Mettre à jour geoGrid.keywords
    const updGeo = [...new Set([...storedKws, kw])];
    // 2. Ajouter dans data.keywords.primary (source de vérité pour tout le reste)
    const currentData = client?.data || {};
    const currentKws = currentData.keywords || {primary:[], secondary:[]};
    const alreadyInPrimary = (currentKws.primary||[]).some(k=>k.kw===kw);
    const alreadyInSecondary = (currentKws.secondary||[]).some(k=>k.kw===kw);
    let updData = currentData;
    if(!alreadyInPrimary && !alreadyInSecondary){
      updData = {...currentData, keywords:{
        ...currentKws,
        primary:[...(currentKws.primary||[]), {kw, position:null, positionLabel:"?", volume:"—", competition:"—", priority:"MEDIUM", evolution:"", evolutionDir:"stable"}]
      }};
    }
    save({geoGrid:{...gridData, keywords:updGeo}, data:updData});
    setSelKw(kw); setAddKwMode(false); setNewKw("");
  };

  const removeKeyword = kw => {
    // 1. Retirer de geoGrid
    const updGeo = storedKws.filter(k=>k!==kw);
    const ng = {...gridData, keywords:updGeo}; delete ng[kw];
    // 2. Retirer de data.keywords
    const currentData = client?.data || {};
    const currentKws = currentData.keywords || {};
    const updData = {...currentData, keywords:{
      ...currentKws,
      primary:(currentKws.primary||[]).filter(k=>k.kw!==kw),
      secondary:(currentKws.secondary||[]).filter(k=>k.kw!==kw),
    }};
    save({geoGrid:ng, data:updData});
    if(selKw===kw) setSelKw(allKws.filter(k=>k!==kw)[0]||"");
  };

  // Leaflet
  useEffect(()=>{
    if(window.L){setLeafletReady(true);return;}
    const css=document.createElement("link"); css.rel="stylesheet";
    css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const s=document.createElement("script");
    s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload=()=>setLeafletReady(true); document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    if(!leafletReady||!mapRef.current||mapInst.current) return;
    const lat=gridData?.center?.lat||47.658, lng=gridData?.center?.lng||-2.760;
    const m=window.L.map(mapRef.current,{zoomControl:true,scrollWheelZoom:true});
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© OpenStreetMap',maxZoom:18}).addTo(m);
    m.setView([lat,lng],spacing>=10000?9:spacing>=5000?10:spacing>=2000?11:12);
    mapInst.current=m;
  },[leafletReady]);

  // Redraw markers when cells change
  useEffect(()=>{
    if(!mapInst.current||!window.L) return;
    markersRef.current.forEach(m=>m.remove()); markersRef.current=[];
    const center=gridData?.center; if(!center) return;
    const {lat:cLat,lng:cLng}=center;
    const zoom=spacing>=10000?9:spacing>=5000?10:spacing>=2000?11:12;
    mapInst.current.setView([cLat,cLng],zoom);
    const half=Math.floor(gridSize/2), mPerDeg=111320;
    // Générer toutes les positions de la grille
    const gridPositions = [];
    for(let row=0;row<gridSize;row++){
      for(let col=0;col<gridSize;col++){
        const dLat=(half-row)*spacing/mPerDeg;
        const dLng=(col-half)*spacing/(mPerDeg*Math.cos(cLat*Math.PI/180));
        gridPositions.push({row,col,lat:cLat+dLat,lng:cLng+dLng});
      }
    }
    // Toujours afficher tous les points de la grille (même sans données)
    gridPositions.forEach(({row,col,lat,lng},i)=>{
      const isCenter=row===half&&col===half;
      const cell=cells[i]; // peut être undefined/null
      const rank=getRank(cell);
      const color=isCenter?"#1E1B30":posColor(rank);
      const label=isCenter?"📍":posLabel(rank);
      const sz=spacing>=10000?30:34;
      const icon=window.L.divIcon({
        className:"",
        html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:${isCenter?11:12}px;font-weight:800;color:white;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer">${label}</div>`,
        iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]
      });
      const marker=window.L.marker([lat,lng],{icon}).addTo(mapInst.current);
      if(!isCenter&&cell){
        const comps=getComps(cell);
        const rows=comps.length>0
          ? comps.slice(0,12).map((c,j)=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:${j<Math.min(comps.length,12)-1?"1px solid #F3F4F6":"none"}"><span style="min-width:22px;height:22px;border-radius:50%;background:${posColor(j+1)};color:white;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${j+1}</span><span style="font-size:12px;color:${c.isYou?"#6B40D8":"#374151"};font-weight:${c.isYou?700:400};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px">${c.name}${c.isYou?" ← vous":""}</span></div>`).join("")
          : `<div style="font-size:12px;color:#9CA3AF;padding:8px 0">Aucun résultat à ce point</div>`;
        const popup=window.L.popup({maxWidth:300,maxHeight:400}).setContent(
          `<div style="font-family:system-ui,sans-serif;padding:2px;max-height:350px;overflow-y:auto">
            <div style="font-weight:800;font-size:14px;color:${posColor(rank)};margin-bottom:2px">Classé #${rank>20?"20+":rank}</div>
            <div style="font-size:11px;color:#9CA3AF;margin-bottom:10px">Ligne ${row+1} · Col ${col+1} · ${selKw}</div>
            <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Résultats à ce point</div>
            ${rows}
          </div>`
        );
        marker.bindPopup(popup);
      }
      markersRef.current.push(marker);
    });
  },[cells,gridSize,spacing,leafletReady,gridData?.center,selKw]);

  const geocode = async addr => {
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`,{headers:{"User-Agent":"BeTheOne-CRM/1.0"}});
    const d=await r.json(); return d?.[0]?{lat:parseFloat(d[0].lat),lng:parseFloat(d[0].lon)}:null;
  };

  const norm = s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();

  const searchAtPoint = async (lat,lng,keyword) => {
    const key = googleApiKey || localStorage.getItem("bto_google_key") || "";
    if(!key) return null;
    try{
      const res=await fetch("https://places.googleapis.com/v1/places:searchText",{
        method:"POST",
        headers:{"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":"places.displayName,places.formattedAddress,places.id"},
        body:JSON.stringify({
          textQuery:keyword,
          locationBias:{circle:{center:{latitude:lat,longitude:lng},radius:Math.max(spacing*3, 15000)}},
          maxResultCount:20,languageCode:"fr"
        })
      });
      if(!res.ok){const e=await res.text();console.warn("Places",res.status,e.slice(0,200));return null;}
      const data=await res.json();
      return data.places||[];
    }catch(e){console.warn("Places error:",e.message);return null;}
  };

  const findRank = (places,clientName,clientCity) => {
    if(!places||places.length===0) return {rank:21,competitors:[]};
    const cName=norm(clientName||"");
    const cCity=norm(clientCity||"");
    const cWords=cName.split(" ").filter(w=>w.length>=4);
    const idx=places.findIndex(p=>{
      const pn=norm(p.displayName?.text||"");
      const pa=norm(p.formattedAddress||"");
      return cWords.some(w=>pn.includes(w))||(cCity&&pa.includes(cCity)&&cWords.some(w=>pa.includes(w)));
    });
    const competitors=places.slice(0,15).map((p,i)=>({
      name:p.displayName?.text||"?",
      pos:i+1,
      isYou:i===idx
    }));
    return {rank:idx>=0?idx+1:21, competitors};
  };

  const testApi = async () => {
    const key = googleApiKey || localStorage.getItem("bto_google_key") || "";
    if(!key){ setScanLog("❌ Clé manquante — Mon Espace → Paramètres → Clé Google Maps API"); return; }
    setScanLog("⏳ Test de l'API en cours…");
    try{
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method:"POST",
        headers:{"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":"places.displayName"},
        body: JSON.stringify({textQuery:"poêle à bois Vannes",maxResultCount:3,languageCode:"fr"})
      });
      const txt = await res.text();
      if(!res.ok){
        setScanLog(`❌ Erreur ${res.status} — ${txt.slice(0,200)}\n\n→ Va dans Google Cloud Console → Bibliothèque → cherche "Places API (New)" → Activer`);
        return;
      }
      const data = JSON.parse(txt);
      const places = data.places||[];
      if(places.length===0){ setScanLog("⚠️ API OK mais 0 résultats — essaie un autre mot-clé"); return; }
      setScanLog(`✅ API fonctionnelle — ${places.length} résultats trouvés : ${places.map(p=>p.displayName?.text).join(", ")}`);
    }catch(e){
      setScanLog(`❌ Erreur réseau : ${e.message} — vérifie que la clé est valide et que Places API (New) est activée`);
    }
  };

  const runScan = async () => {
    const key = googleApiKey || localStorage.getItem("bto_google_key") || "";
    if(!key){alert("Clé Google Maps API manquante.\nMon Espace → Paramètres");return;}
    if(!selKw){alert("Sélectionne un mot-clé.");return;}
    setScanning(true); setProgress(0); setScanLog("⏳ Géocodage…");

    let center=gridData?.center;
    if(!center){
      const addr=client?.data?.extracted?.address||(client?.name&&client?.city?`${client.name} ${client.city}`:"") ||client?.city||"";
      setScanLog(`🔍 Géocodage : "${addr}"…`);
      if(!addr){alert("Adresse introuvable. Lance un audit d'abord.");setScanning(false);return;}
      center=await geocode(addr);
      if(!center){alert("Géocodage impossible : "+addr);setScanning(false);return;}
      save({geoGrid:{...gridData,center}});
    }
    setScanLog(`✅ Centre : ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);

    const {lat:cLat,lng:cLng}=center;
    const half=Math.floor(gridSize/2), mPerDeg=111320;
    const newCells=[];
    let nullCount=0;

    for(let row=0;row<gridSize;row++){
      for(let col=0;col<gridSize;col++){
        const idx=row*gridSize+col;
        const isCenter=row===half&&col===half;
        if(isCenter){
          newCells.push({rank:1,competitors:[{name:client?.name||"Votre établissement",pos:1,isYou:true}]});
          setProgress(Math.round((idx+1)/total*100)); continue;
        }
        const dLat=(half-row)*spacing/mPerDeg;
        const dLng=(col-half)*spacing/(mPerDeg*Math.cos(cLat*Math.PI/180));
        setScanLog(`🔍 Point ${idx+1}/${total} — ligne ${row+1} col ${col+1}…`);
        const places=await searchAtPoint(cLat+dLat,cLng+dLng,selKw);
        if(places===null){nullCount++;newCells.push(null);}
        else {
          const result=findRank(places,client?.name||"",client?.city||"");
          newCells.push(result);
          setScanLog(`✅ Point ${idx+1}/${total} → #${result.rank>20?"20+":result.rank} (${places.length} résultats)`);
        }
        setProgress(Math.round((idx+1)/total*100));
        await new Promise(r=>setTimeout(r,300));
      }
    }

    const newScan={date:new Date().toISOString().slice(0,10),cells:newCells,keyword:selKw};
    const updScans=[...scans,newScan].slice(-12);
    const ng={...gridData,center,[selKw]:{...kwGrid,scans:updScans}};
    // Mettre à jour les positions dans data.keywords (alimente KeywordsTab)
    const kwCenterCell = newCells[Math.floor(gridSize/2)*gridSize + Math.floor(gridSize/2)];
    const centerRank = getRank(kwCenterCell) || null;
    const currentData = client?.data || {};
    const currentKws = currentData.keywords || {};
    const updPrimary = (currentKws.primary||[]).map(k =>
      k.kw===selKw ? {...k, position:centerRank, positionLabel:centerRank?`#${centerRank}`:"?"} : k
    );
    const updSecondary = (currentKws.secondary||[]).map(k =>
      k.kw===selKw ? {...k, position:centerRank, positionLabel:centerRank?`#${centerRank}`:"?"} : k
    );
    const updData = {...currentData, keywords:{...currentKws, primary:updPrimary, secondary:updSecondary}};
    save({geoGrid:ng, data:updData});
    setScanning(false); setProgress(0);
    const found=newCells.filter(c=>c!==null).length;
    if(nullCount>total/2)
      setScanLog(`⚠️ ${nullCount} erreurs API. Vérifie que "Places API (New)" est activée dans Google Cloud Console → Bibliothèque.`);
    else
      setScanLog(`✅ Scan terminé — ${found}/${total} points · #${avgRk||"?"} rang moyen`);
  };

  return(
    <div className="card" style={{marginBottom:12}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#3B5BDB,#6B40D8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🗺️</div>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:"#1E1B30"}}>Carte de positionnement local</div>
            <div style={{fontSize:12,color:"#6B7280"}}>
              Grille {gridSize}×{gridSize} · {spacing>=1000?spacing/1000+"km":spacing+"m"}/point
              {latest&&` · ${new Date(latest.date).toLocaleDateString("fr-FR")}`}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <select value={gridSize} onChange={e=>setGridSize(parseInt(e.target.value))}
            style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:"1.5px solid #E5E7EB",fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
            <option value={3}>3×3 — 9 pts</option><option value={5}>5×5 — 25 pts</option><option value={7}>7×7 — 49 pts</option>
          </select>
          <select value={spacing} onChange={e=>setSpacing(parseInt(e.target.value))}
            style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:"1.5px solid #E5E7EB",fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
            <option value={1000}>1km — Ultra local</option>
            <option value={3000}>3km — Urbain</option>
            <option value={5000}>5km — Ville élargie</option>
            <option value={10000}>10km — Département</option>
            <option value={15000}>15km — Région</option>
          </select>
          <button onClick={testApi}
            style={{fontSize:12,padding:"7px 14px",borderRadius:8,border:"1.5px solid #E5E7EB",background:"white",color:"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            🔧 Tester l'API
          </button>
          <button onClick={runScan} disabled={scanning||!(googleApiKey||localStorage.getItem("bto_google_key"))}
            style={{fontSize:13,padding:"7px 18px",borderRadius:8,border:"none",fontFamily:"inherit",fontWeight:700,cursor:scanning||!googleApiKey?"default":"pointer",
              background:scanning?"#E5E7EB":!googleApiKey?"#F3F4F6":"linear-gradient(135deg,#059669,#16a34a)",
              color:scanning||!googleApiKey?"#9CA3AF":"white"}}>
            {scanning?`⏳ ${progress}%`:"🔍 Scanner"}
          </button>
        </div>
      </div>

      {/* Log */}
      {scanLog&&<div style={{background:scanLog.startsWith("⚠️")?"#FFFBEB":scanLog.startsWith("✅")?"#F0FDF4":"#EFF6FF",border:`1px solid ${scanLog.startsWith("⚠️")?"#FDE68A":scanLog.startsWith("✅")?"#BBF7D0":"#BFDBFE"}`,borderRadius:10,padding:"8px 14px",marginBottom:10,fontSize:12,color:scanLog.startsWith("⚠️")?"#92400E":scanLog.startsWith("✅")?"#065F46":"#1D4ED8"}}>
        {scanLog}
        {scanning&&<div style={{marginTop:6,background:"#E5E7EB",borderRadius:4,height:4,overflow:"hidden"}}><div style={{width:`${progress}%`,height:"100%",background:"#3B5BDB",transition:"width .3s"}}/></div>}
      </div>}

      {!googleApiKey&&<div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12.5,color:"#92400E"}}>
        ⚠️ <strong>Mon Espace → Paramètres → Clé Google Maps API</strong> · Activer <strong>Places API (New)</strong> dans Google Cloud Console
      </div>}

      {/* Mots-clés */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Mots-clés suivis</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
          {allKws.map(k=>(
            <div key={k} style={{display:"flex",alignItems:"center",borderRadius:7,border:`1.5px solid ${selKw===k?"#6B40D8":"#E5E7EB"}`,overflow:"hidden",background:selKw===k?"#6B40D8":"white"}}>
              <button onClick={()=>setSelKw(k)} style={{fontSize:12,padding:"5px 10px",border:"none",background:"transparent",color:selKw===k?"white":"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{k}</button>
              {storedKws.includes(k)&&<button onClick={()=>removeKeyword(k)} style={{fontSize:13,padding:"3px 8px 3px 0",border:"none",background:"transparent",color:selKw===k?"rgba(255,255,255,.6)":"#9CA3AF",cursor:"pointer",fontFamily:"inherit"}}>×</button>}
            </div>
          ))}
          {addKwMode?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input value={newKw} onChange={e=>setNewKw(e.target.value)} autoFocus
                onKeyDown={e=>{if(e.key==="Enter")addKeyword(newKw);if(e.key==="Escape"){setAddKwMode(false);setNewKw("");}}}
                placeholder="poêle à granulés…"
                style={{fontSize:12,padding:"5px 10px",border:"1.5px solid #6B40D8",borderRadius:7,fontFamily:"inherit",outline:"none",width:170}}/>
              <button onClick={()=>addKeyword(newKw)} style={{fontSize:12,padding:"5px 10px",borderRadius:7,border:"none",background:"#6B40D8",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✓</button>
              <button onClick={()=>{setAddKwMode(false);setNewKw("");}} style={{fontSize:12,padding:"5px 10px",borderRadius:7,border:"1px solid #E5E7EB",background:"white",color:"#6B7280",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
            </div>
          ):(
            <button onClick={()=>setAddKwMode(true)} style={{fontSize:12,padding:"5px 12px",borderRadius:7,border:"1.5px dashed #C4B5FD",background:"#F5F3FF",color:"#6B40D8",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Mot-clé</button>
          )}
        </div>
      </div>

      {/* Stats */}
      {scanned>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
        {[
          {l:"Scannés",    v:`${scanned}/${total}`,  c:"#6B40D8"},
          {l:"Rang moyen", v:avgRk?"#"+avgRk:"—",    c:avgRk&&avgRk<=3?"#059669":avgRk&&avgRk<=10?"#E85A30":"#DC2626"},
          {l:"TOP 3",      v:`${top3}/${scanned}`,   c:"#059669"},
          {l:"TOP 10",     v:`${top10}/${scanned}`,  c:"#E85A30"},
          {l:"Hors 20",    v:`${hors20}/${scanned}`, c:"#6B7280"},
        ].map(({l,v,c})=>(
          <div key={l} style={{textAlign:"center",background:"#F4F5FA",borderRadius:10,padding:"10px 6px",border:"1px solid #E5E7EB"}}>
            <div style={{fontSize:17,fontWeight:900,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:10.5,color:"#6B7280",marginTop:4,fontWeight:600}}>{l}</div>
          </div>
        ))}
      </div>}

      {/* Légende */}
      <div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        {[{l:"#1–3",c:"#059669"},{l:"#4–10",c:"#E85A30"},{l:"#11–20",c:"#DC2626"},{l:"Hors 20",c:"#6B7280"},{l:"?",c:"#94A3B8"}].map(({l,c})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:13,height:13,borderRadius:"50%",background:c}}/>
            <span style={{fontSize:11,color:"#374151",fontWeight:600}}>{l}</span>
          </div>
        ))}
        <span style={{fontSize:11,color:"#9CA3AF",marginLeft:"auto"}}>💡 Cliquez sur un point pour voir les concurrents</span>
      </div>

      {/* Carte */}
      {leafletReady
        ?<div ref={mapRef} style={{height:460,borderRadius:12,overflow:"hidden",border:"1px solid #E5E7EB",marginBottom:12}}/>
        :<div style={{height:460,background:"#F4F5FA",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #E5E7EB",marginBottom:12}}><span style={{color:"#6B7280"}}>⏳ Chargement…</span></div>
      }

      {/* Grille numérique */}
      {cells.length>0&&<div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Vue grille · {selKw}</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${gridSize},1fr)`,gap:3,maxWidth:Math.min(gridSize*38,320)}}>
          {cells.map((cell,i)=>{
            const row=Math.floor(i/gridSize),col=i%gridSize,half=Math.floor(gridSize/2);
            const isCenter=row===half&&col===half;
            const rank=getRank(cell);
            return<div key={i} style={{aspectRatio:"1",borderRadius:5,background:isCenter?"#1E1B30":posColor(rank),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"white",border:"1.5px solid white"}}>{isCenter?"📍":posLabel(rank)}</div>;
          })}
        </div>
      </div>}

      {/* Historique */}
      {scans.length>1&&<div style={{background:"#F4F5FA",borderRadius:12,padding:"12px 16px",border:"1px solid #E5E7EB"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>📅 Historique · {selKw}</div>
        {scans.slice().reverse().map((scan,i)=>{
          const f=scan.cells.map(getRank).filter(v=>v!==null&&v>0);
          const a=f.length?Math.round(f.reduce((a,b)=>a+b,0)/f.length*10)/10:null;
          return<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"6px 10px",background:i===0?"#F5F3FF":"white",borderRadius:8,border:`1px solid ${i===0?"#C4B5FD":"#E5E7EB"}`,marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:600,color:"#374151",width:90}}>{new Date(scan.date).toLocaleDateString("fr-FR")}</span>
            <span style={{fontSize:12,color:"#6B7280"}}>Rang moy. <strong style={{color:"#1E1B30"}}>#{a||"?"}</strong></span>
            <span style={{fontSize:12,color:"#6B7280"}}>TOP 3 <strong style={{color:"#059669"}}>{f.filter(v=>v<=3).length}/{scan.cells.length}</strong></span>
            {i===0&&<span style={{fontSize:11,background:"#6B40D8",color:"white",padding:"1px 8px",borderRadius:20,fontWeight:700,marginLeft:"auto"}}>Actuel</span>}
          </div>;
        })}
      </div>}

      {!scanning&&cells.length===0&&selKw&&<div style={{textAlign:"center",padding:"28px",color:"#9CA3AF",border:"1px dashed #E5E7EB",borderRadius:12}}>
        <div style={{fontSize:28,marginBottom:10}}>🔍</div>
        <div style={{fontSize:14,fontWeight:700,color:"#374151",marginBottom:6}}>Aucun scan pour "{selKw}"</div>
        {googleApiKey
          ?<button onClick={runScan} style={{padding:"9px 20px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#059669,#16a34a)",color:"white",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔍 Lancer le scan</button>
          :<div style={{fontSize:12}}>Ajoute ta clé Google Maps dans Mon Espace → Paramètres</div>}
      </div>}
    </div>
  );
}


function KeywordsTab({kw, city, client, clients, upd}){
  const allKws=[...(kw.primary||[]),...(kw.secondary||[])];
  const [selKw,  setSelKw]  = useState(allKws[0]||null);
  const [view,   setView]   = useState("tableau"); // "tableau" | "carte" | "evolution"

  // Historique des positions par mot-clé (stocké dans client.kwHistory)
  const kwHistory = client?.kwHistory || [];
  // Construire la timeline pour un mot-clé donné
  const getKwTimeline = (kwText) => {
    const points = [];
    // Ajouter les données historiques
    kwHistory.forEach(snap => {
      const found = [...(snap.primary||[]),...(snap.secondary||[])].find(k=>k.kw===kwText);
      if(found) points.push({date:snap.date, position:found.position});
    });
    // Ajouter position actuelle
    const curr = allKws.find(k=>k.kw===kwText);
    if(curr?.position) points.push({date:client?.date||new Date().toISOString(), position:curr.position});
    // Dédupliquer par date
    const seen = new Set();
    return points.filter(p=>{const k=p.date?.slice(0,10); if(seen.has(k))return false;seen.add(k);return true;}).slice(-6);
  };

  /* ── helpers couleur position ── */
  const posColor=(rank)=>{
    if(!rank||rank===0)  return{bg:"#F4F5FA",c:"#94a3b8",border:"#F4F5FA",circle:"#94a3b8"};
    if(rank===1)         return{bg:"#ffffff",c:"#6B40D8",border:"#86efac",circle:"#059669"};
    if(rank<=3)          return{bg:"#ffffff",c:"#059669",border:"#86efac",circle:"#22c55e"};
    if(rank<=6)          return{bg:"#fffbeb",c:"#d97706",border:"#fde68a",circle:"#f59e0b"};
    if(rank<=10)         return{bg:"#fff7ed",c:"#ea580c",border:"#fdba74",circle:"#f97316"};
    if(rank<=20)         return{bg:"#fef2f2",c:"#dc2626",border:"#fecaca",circle:"#ef4444"};
    return{bg:"#fef2f2",c:"#dc2626",border:"#fee2e2",circle:"#dc2626"};
  };

  const posLabel=(rank)=>{
    if(!rank)    return"—";
    if(rank===1) return"🏆 TOP 1";
    if(rank<=3)  return`🏆 TOP ${rank}`;
    if(rank<=10) return`TOP ${rank}`;
    return`#${rank}`;
  };

  const cardLabel=(rank)=>{
    if(!rank)    return"—";
    if(rank===1) return"Leader ✓";
    if(rank<=3)  return"Leader ✓";
    if(rank<=6)  return"Bonne visib.";
    if(rank<=10) return"Bonne visib.";
    if(rank<=15) return"À optimiser";
    if(rank<=20) return"À travailler";
    return"Non visible";
  };

  const evoStyle=(dir)=>{
    if(dir==="up")   return{c:"#059669",icon:"▲"};
    if(dir==="down") return{c:"#dc2626",icon:"▼"};
    return{c:"#64748b",icon:"="};
  };

  const priorityStyle=(p)=>({
    "TOP":      {bg:"#eff6ff",c:"#2563eb"},
    "Maintenir":{bg:"#ffffff",c:"#059669"},
    "Rapide":   {bg:"#ecfdf5",c:"#059669"},
    "Urgent":   {bg:"#fef2f2",c:"#dc2626"},
  }[p]||{bg:"#F4F5FA",c:"#64748b"});

  const compStyle=(c)=>({
    "Forte":       {bg:"#fef2f2",c:"#dc2626"},
    "Moyenne":     {bg:"#fffbeb",c:"#d97706"},
    "Faible":      {bg:"#ffffff",c:"#059669"},
    "Très faible": {bg:"#ecfdf5",c:"#059669"},
  }[c]||{bg:"#F4F5FA",c:"#64748b"});

  const selKwData=allKws.find(k=>k.kw===selKw?.kw)||selKw;

  return(
    <div>
      {/* ── HEADER + SWITCH VUE ── */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          
          <div style={{fontSize:12.5,color:"var(--ink4)"}}>{allKws.length} mots-clés · Local Pack Google · Mise à jour hebdomadaire</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setView("tableau")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1.5px solid ${view==="tableau"?"var(--indigo2)":"#F4F5FA"}`,background:view==="tableau"?"#ffffff":"#fff",color:view==="tableau"?"var(--indigo2)":"#64748b",fontWeight:view==="tableau"?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12.5,transition:"all .15s"}}>
            <span>📊</span> Tableau
          </button>
          <button onClick={()=>setView("evolution")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1.5px solid ${view==="evolution"?"#059669":"#F4F5FA"}`,background:view==="evolution"?"#ffffff":"#fff",color:view==="evolution"?"#059669":"#64748b",fontWeight:view==="evolution"?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12.5,transition:"all .15s"}}>
            <span>📈</span> Évolution
          </button>
          <button onClick={()=>setView("carte")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:`1.5px solid ${view==="carte"?"var(--violet)":"#F4F5FA"}`,background:view==="carte"?"#ffffff":"#fff",color:view==="carte"?"var(--violet)":"#64748b",fontWeight:view==="carte"?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12.5,transition:"all .15s"}}>
            <span>🗺️</span> Zones
          </button>
        </div>
      </div>

      {/* ── VUE ÉVOLUTION POSITIONS ── */}
      {view==="evolution"&&(
        <div>
          <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12.5,color:"#1D4ED8",lineHeight:1.6}}>
            📈 <strong>Évolution des positions estimées par l'IA</strong> — à chaque audit, Claude analyse la fiche et estime les positions dans le Pack Local. La courbe se construit audit après audit. Plus tu audites régulièrement, plus la tendance est fiable.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {allKws.map(k=>{
              const timeline = getKwTimeline(k.kw);
              const hasHistory = timeline.length >= 2;
              const first = timeline[0]?.position;
              const last = timeline[timeline.length-1]?.position;
              const gain = hasHistory ? first - last : 0; // positif = amélioration (position plus basse = mieux)
              const pc = k.position;
              const pstyle = posColor(pc||20);
              return(
                <div key={k.kw} style={{background:"white",borderRadius:14,padding:"18px 20px",border:"1px solid #E5E7EB",borderLeft:`4px solid ${gain>0?"#059669":gain<0?"#dc2626":"#E5E7EB"}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:hasHistory?14:0}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13.5,color:"#1E1B30"}}>{k.kw}</div>
                      <div style={{fontSize:11.5,color:"#6B7280",marginTop:2}}>{k.volume||"—"} recherches/mois · {k.competition||"—"}</div>
                    </div>
                    <div style={{textAlign:"center",padding:"8px 14px",background:pstyle.bg,borderRadius:10,border:`1px solid ${pstyle.border}`}}>
                      <div style={{fontSize:18,fontWeight:900,color:pstyle.c}}>#{pc||"—"}</div>
                      <div style={{fontSize:10,color:pstyle.c,fontWeight:600}}>actuel</div>
                    </div>
                    {hasHistory&&gain!==0&&(
                      <div style={{textAlign:"center",padding:"8px 14px",background:gain>0?"#F0FDF4":"#FEF2F2",borderRadius:10,border:`1px solid ${gain>0?"#BBF7D0":"#FECACA"}`}}>
                        <div style={{fontSize:18,fontWeight:900,color:gain>0?"#059669":"#dc2626"}}>{gain>0?"+":""}{gain}</div>
                        <div style={{fontSize:10,color:gain>0?"#059669":"#dc2626",fontWeight:600}}>places</div>
                      </div>
                    )}
                  </div>
                  {hasHistory?(
                    <div>
                      {/* Graphique barres positions */}
                      <div style={{display:"flex",gap:6,alignItems:"flex-end",height:80}}>
                        {timeline.map((pt,i)=>{
                          const maxPos=Math.max(...timeline.map(t=>t.position||1),1);
                          const h=Math.max(Math.round(((maxPos+1-pt.position)/maxPos)*100),8);
                          const pstyle2=posColor(pt.position||20);
                          const prev=i>0?timeline[i-1].position:null;
                          const diff=prev?prev-pt.position:null; // positif = gagné des places
                          return(
                            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                              {diff!==null&&diff!==0&&(
                                <div style={{fontSize:9,fontWeight:700,color:diff>0?"#059669":"#dc2626"}}>
                                  {diff>0?`+${diff}`:diff}
                                </div>
                              )}
                              <div style={{width:"100%",background:pstyle2.c,borderRadius:"4px 4px 0 0",height:`${h}%`,minHeight:8,opacity:i===timeline.length-1?1:.6,position:"relative"}}>
                                <div style={{position:"absolute",bottom:"calc(100% + 2px)",left:"50%",transform:"translateX(-50%)",fontSize:9,fontWeight:800,color:pstyle2.c,whiteSpace:"nowrap"}}>#{pt.position}</div>
                              </div>
                              <div style={{fontSize:8,color:"#9CA3AF",textAlign:"center",lineHeight:1.2}}>
                                {new Date(pt.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ):(
                    <div style={{fontSize:12,color:"#9CA3AF",fontStyle:"italic",marginTop:8}}>
                      Historique disponible après le prochain audit — position actuelle : #{pc||"—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BANDEAU INFO ── */}
      {view!=="evolution"&&<div style={{background:"#F4F5FA",border:"1px solid #b8b8f8",borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:8}}>
        <span style={{flexShrink:0,marginTop:1}}>📍</span>
        <div style={{fontSize:12.5,color:"#3730a3",lineHeight:1.6}}>
          <strong>Votre classement varie selon la position géographique</strong> de l'internaute. Passez en vue "Zones" pour voir votre position réelle zone par zone autour de {city||"votre ville"}.
        </div>
      </div>}

      {/* ══════════ VUE TABLEAU ══════════ */}
      {view==="tableau"&&(
        <>
          {/* Principaux */}
          <div className="card" style={{marginBottom:16,padding:0,overflow:"hidden",border:"1px solid var(--border)"}}>
            <div style={{padding:"14px 18px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:"var(--ink4)",letterSpacing:".5px",textTransform:"uppercase"}}>🔍 {allKws.length} MOTS-CLÉS — DEPUIS {(city||"").toUpperCase()} CENTRE</span>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid #f1f5f9"}}>
                  {["MOT-CLÉ","VOLUME","POSITION","ÉVOLUTION","ACTION"].map(h=>(
                    <th key={h} style={{padding:"9px 16px",textAlign:"left",fontSize:10,fontWeight:600,color:"#94A3B8",letterSpacing:".5px",background:"#F4F5FA"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allKws.map((k,i)=>{
                  const pc=posColor(k.position);
                  const evo=evoStyle(k.evolutionDir);
                  const isPrimary=i<(kw.primary||[]).length;
                  return(
                    <tr key={i} onClick={()=>{setSelKw(k);setView("carte");}} className="tr" style={{cursor:"pointer"}}>
                      <td style={{padding:"13px 16px"}}>
                        <div style={{fontWeight:700,color:"var(--ink)",fontSize:13}}>{k.kw}</div>
                        {!isPrimary&&<span style={{fontSize:9.5,background:"#ecfeff",color:"#0891b2",borderRadius:4,padding:"1px 5px",fontWeight:600}}>secondaire</span>}
                      </td>
                      <td style={{padding:"13px 16px",color:"var(--ink2)",fontWeight:600}}>{k.volume}</td>
                      <td style={{padding:"13px 16px"}}>
                        {(() => {
                          const rank = k.position;
                          const pc = posColor(rank);
                          if(!rank) return <span style={{color:"var(--ink4)",fontSize:12}}>N/C</span>;
                          return(
                            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,fontSize:13,fontWeight:800,background:pc.bg,color:pc.c,border:`1.5px solid ${pc.border}`,whiteSpace:"nowrap"}}>
                              {rank<=3?"🏆 ":""}{rank<=3?`TOP ${rank}`:rank<=10?`TOP ${rank}`:`#${rank}`}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{padding:"13px 16px"}}>
                        {k.evolution&&k.evolution!=="0"?(
                          <span style={{fontWeight:800,color:evo.c,fontSize:13.5}}>{evo.icon} {k.evolution}</span>
                        ):(
                          <span style={{fontWeight:700,color:"var(--ink3)",fontSize:12.5}}>= stable</span>
                        )}
                      </td>
                      <td style={{padding:"13px 16px",color:"var(--ink2)",fontSize:12.5,lineHeight:1.5,maxWidth:240}}>{k.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Longue traîne */}
          {(kw.longTail||[]).length>0&&<div className="card" style={{borderTop:"3px solid #d97706",marginBottom:0}}>
            <div style={{fontWeight:700,fontSize:13.5,marginBottom:4,color:"var(--ink)"}}>💡 Requêtes longue traîne</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginBottom:11}}>À exploiter dans les posts GMB et la description</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {kw.longTail.map((k,i)=>(
                <span key={i} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:20,padding:"5px 14px",fontSize:12.5,color:"#92400e",fontWeight:500}}>{k}</span>
              ))}
            </div>
          </div>}
        </>
      )}

      {/* ══════════ VUE CARTE PAR ZONE ══════════ */}
      {view==="carte"&&(
        <>
          {/* Sélecteur mots-clés */}
          <div style={{background:"var(--surface)",borderRadius:12,border:"1px solid var(--border)",padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Sélectionnez un mot-clé</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {allKws.map((k,i)=>{
                const isSel=selKwData?.kw===k.kw;
                const pc=posColor(k.position);
                return(
                  <button key={i} onClick={()=>setSelKw(k)}
                    style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${isSel?"var(--violet)":"#F4F5FA"}`,background:isSel?"#ffffff":"#ffffff",color:isSel?"var(--violet)":"#475569",fontWeight:isSel?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12,transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
                    {k.position&&k.position<=3&&<span>🏆</span>}
                    {k.kw}
                  </button>
                );
              })}
            </div>
          </div>

          {selKwData&&(selKwData.zoneRankings||[]).length===0&&(
            <div style={{textAlign:"center",padding:"32px 20px",background:"#F4F5FA",borderRadius:12,border:"1px dashed #e0e7ff",marginBottom:14}}>
              <div style={{fontSize:28,marginBottom:8}}>🗺️</div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--ink)",marginBottom:4}}>Pas de données de zones pour ce mot-clé</div>
              <div style={{fontSize:12.5,color:"var(--ink3)"}}>Ce mot-clé ne contient pas de données de positionnement par zone.<br/>Relancez un audit pour obtenir ces données.</div>
            </div>
          )}

          {/* Grille zones */}
          {selKwData&&(selKwData.zoneRankings||[]).length>0&&(
            <>
              <div style={{background:"var(--surface)",borderRadius:12,border:"1px solid var(--border)",padding:"16px 18px",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--violet)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
                  <span>🗺️</span> CLASSEMENT PAR ZONE — <span style={{color:"var(--ink)"}}>{selKwData.kw.toUpperCase()}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min((selKwData.zoneRankings||[]).length,5)},1fr)`,gap:10}}>
                  {(selKwData.zoneRankings||[]).map((z,i)=>{
                    const pc=posColor(z.rank);
                    const isFirst=i===0;
                    const isLeader=z.rank<=3;
                    return(
                      <div key={i} style={{background:isFirst?"#ffffff":"#F4F5FA",border:`1.5px solid ${isFirst?"#FBCFE8":"#F4F5FA"}`,borderRadius:14,padding:"20px 12px 16px",textAlign:"center",transition:"all .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                        {/* Cercle rang */}
                        <div style={{width:58,height:58,borderRadius:"50%",background:pc.circle,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",boxShadow:`0 4px 14px ${pc.circle}55`}}>
                          {isLeader?(
                            <div style={{textAlign:"center",lineHeight:1}}>
                              <div style={{fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:700}}>TOP</div>
                              <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{z.rank}</div>
                            </div>
                          ):(
                            <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>#{z.rank}</span>
                          )}
                        </div>
                        {isLeader&&<div style={{fontSize:11,fontWeight:800,color:pc.c,marginBottom:2,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>🏆</div>}
                        <div style={{fontSize:13,fontWeight:700,color:isFirst?"#4338ca":"#1e293b",marginBottom:4}}>{z.zone}</div>
                        <div style={{fontSize:11.5,color:pc.c,fontWeight:600}}>{cardLabel(z.rank)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommandations */}
              {(selKwData.zoneRecos||[]).length>0&&(
                <div style={{background:"#F4F5FA",borderRadius:12,border:"1px solid #e9d5ff",padding:"16px 18px"}}>
                  <div style={{fontSize:10.5,fontWeight:700,color:"var(--violet)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:12,display:"flex",alignItems:"center",gap:5}}>
                    <span>💡</span> RECOMMANDATIONS PAR ZONE
                  </div>
                  <div style={{display:"grid",gap:8}}>
                    {(selKwData.zoneRecos||[]).map((r,i)=>{
                      const pc=posColor(r.rank);
                      const isLeader=r.rank<=3;
                      return(
                        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"10px 14px",background:"var(--surface)",borderRadius:10,border:`1px solid ${pc.border}`}}>
                          <div style={{width:34,height:34,borderRadius:9,background:pc.circle,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 6px ${pc.circle}33`}}>
                            <span style={{fontSize:11.5,fontWeight:800,color:"#fff"}}>{r.rank}</span>
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",marginBottom:2}}>{r.zone}</div>
                            <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55}}>
                              {isLeader&&<span style={{color:"#059669",fontWeight:700}}>✓ Leader — </span>}
                              {r.reco}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Longue traîne */}
          {(kw.longTail||[]).length>0&&<div className="card" style={{borderTop:"3px solid #d97706",marginTop:14}}>
            <div style={{fontWeight:700,fontSize:13.5,marginBottom:4,color:"var(--ink)"}}>💡 Requêtes longue traîne</div>
            <div style={{fontSize:12,color:"var(--ink4)",marginBottom:11}}>À exploiter dans les posts GMB et la description</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {kw.longTail.map((k,i)=>(
                <span key={i} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:20,padding:"5px 14px",fontSize:12.5,color:"#92400e",fontWeight:500}}>{k}</span>
              ))}
            </div>
          </div>}
        </>
      )}
    </div>
  );
}

// ─── COMPETITORS TAB ──────────────────────────────────────────────────────────
function CompetitorsTab({data, client, ext, score}){
  const [sel, setSel] = useState(null);
  const competitors = data.competitors||[];
  const me = {
    name: client.name,
    rating: ext.rating||"—",
    reviews: ext.reviewCount||"—",
    photos: ext.photoCount||"—",
    posts: (ext.postsCount&&parseInt(ext.postsCount)>0)||false,
    responseRate: data.reviews?.responseRate||"—",
    mainKeywords: (data.keywords?.primary||[]).slice(0,3).map(k=>k.kw),
    topPosition: data.competitorRanking?.estimatedPosition||"—",
    score: score,
    isMe: true,
  };
  const allRows = [me, ...competitors];

  const threatStyle = t => ({
    "Haute":   {c:"#dc2626",bg:"#fef2f2",b:"#fecaca"},
    "Moyenne": {c:"#d97706",bg:"#fffbeb",b:"#fde68a"},
    "Faible":  {c:"#059669",bg:"#ffffff",b:"#e8e0ff"},
  }[t]||{c:"#94a3b8",bg:"#F4F5FA",b:"#F4F5FA"});

  const ratingColor = r => {
    const n = parseFloat(r);
    if(isNaN(n)) return "#94a3b8";
    if(n>=4.5) return "#059669"; if(n>=4.0) return "#d97706"; return "#dc2626";
  };

  const selData = sel!=null ? competitors[sel] : null;

  return(
    <div>
      <div style={{fontWeight:800,fontSize:18,color:"var(--ink)",marginBottom:2}}>Analyse concurrentielle</div>
      <div style={{fontSize:12.5,color:"var(--ink4)",marginBottom:16}}>Comparaison avec les 5 principaux concurrents locaux</div>

      {/* ── TABLEAU COMPARATIF ── */}
      <div className="card" style={{padding:0,overflow:"hidden",marginBottom:14,border:"1px solid var(--border)"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5,minWidth:680}}>
            <thead>
              <tr style={{background:"#F4F5FA",borderBottom:"2px solid #e8edf5"}}>
                {["","NOTE","AVIS","PHOTOS","POSTS","RÉP. AVIS","POSITION EST.","MENACE"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:"var(--ink4)",letterSpacing:".5px",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRows.map((c,i)=>{
                const isMe = c.isMe;
                const th = threatStyle(c.threat);
                return(
                  <tr key={i}
                    onClick={()=>!isMe&&setSel(sel===i-1?null:i-1)}
                    style={{borderBottom:"1px solid #f1f5f9",background:isMe?"#ffffff":sel===i-1?"#fffbeb":"transparent",cursor:isMe?"default":"pointer",transition:"background .12s"}}>
                    <td style={{padding:"13px 14px",minWidth:160}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {isMe&&<span style={{width:8,height:8,borderRadius:"50%",background:"var(--indigo2)",flexShrink:0,display:"inline-block"}}/>}
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:isMe?"#4338ca":"#0f172a"}}>{c.name}</div>
                          {isMe&&<div style={{fontSize:10,color:"var(--indigo2)",fontWeight:600}}>VOTRE FICHE</div>}
                          {!isMe&&c.mainKeywords?.length>0&&<div style={{fontSize:10.5,color:"var(--ink4)",marginTop:1}}>{c.mainKeywords.slice(0,2).join(" · ")}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontWeight:800,fontSize:14,color:ratingColor(c.rating)}}>⭐ {c.rating}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontWeight:700,color:"var(--ink2)"}}>{c.reviews}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontWeight:600,color:"var(--ink2)"}}>{c.photos||"—"}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      {c.posts
                        ? <span style={{color:"#059669",fontWeight:700,fontSize:12}}>✓ Actif</span>
                        : <span style={{color:"#dc2626",fontWeight:600,fontSize:12}}>✗ Non</span>}
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontWeight:600,color:c.responseRate==="—"?"#94a3b8":"#374151"}}>{c.responseRate}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontWeight:700,color:"var(--ink2)"}}>{c.topPosition||"—"}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      {!isMe&&<span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:th.bg,color:th.c,border:`1px solid ${th.b}`}}>{c.threat||"—"}</span>}
                      {isMe&&<span style={{fontSize:11,color:"var(--ink4)",fontStyle:"italic"}}>Vous</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FICHE DÉTAILLÉE CONCURRENT ── */}
      {selData&&(
        <div className="card" style={{marginBottom:14,border:"1.5px solid #fde68a",borderTop:"3px solid #d97706"}} key={sel}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:"var(--ink)",marginBottom:2}}>{selData.name}</div>
              <div style={{fontSize:12,color:"var(--ink4)"}}>Analyse détaillée · cliquez à nouveau pour masquer</div>
            </div>
            <span style={{...threatStyle(selData.threat),padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:threatStyle(selData.threat).bg,color:threatStyle(selData.threat).c,border:`1.5px solid ${threatStyle(selData.threat).b}`}}>Menace {selData.threat}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {(selData.strengths||[]).length>0&&(
              <div style={{background:"#ffffff",borderRadius:10,padding:"12px 14px",border:"1px solid #bbf7d0"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>✓ Points forts</div>
                {selData.strengths.map((s,i)=>(
                  <div key={i} style={{fontSize:12.5,color:"#6B40D8",padding:"4px 0",borderBottom:i<selData.strengths.length-1?"1px solid #dcfce7":"none"}}>{s}</div>
                ))}
              </div>
            )}
            {(selData.weaknesses||[]).length>0&&(
              <div style={{background:"#fef2f2",borderRadius:10,padding:"12px 14px",border:"1px solid #fecaca"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#dc2626",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>✗ Faiblesses</div>
                {selData.weaknesses.map((w,i)=>(
                  <div key={i} style={{fontSize:12.5,color:"#7f1d1d",padding:"4px 0",borderBottom:i<selData.weaknesses.length-1?"1px solid #fee2e2":"none"}}>{w}</div>
                ))}
              </div>
            )}
          </div>
          {(selData.mainKeywords||[]).length>0&&(
            <div style={{marginTop:10,padding:"10px 12px",background:"#F4F5FA",borderRadius:9,border:"1px solid var(--border)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>Mots-clés ciblés</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {selData.mainKeywords.map((k,i)=>(
                  <span key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"3px 12px",fontSize:12,color:"var(--ink2)",fontWeight:500}}>{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OPPORTUNITÉS ── */}
      {(data.competitorOpportunities||[]).length>0&&(
        <div className="card" style={{borderTop:"3px solid #059669"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"var(--ink)"}}>🚀 Opportunités face à la concurrence</div>
          <div style={{display:"grid",gap:8}}>
            {data.competitorOpportunities.map((o,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:"#ecfdf5",borderRadius:9,border:"1px solid #a7f3d0"}}>
                <span style={{color:"#059669",fontWeight:800,fontSize:15,flexShrink:0}}>→</span>
                <span style={{fontSize:13,color:"#065f46",fontWeight:500,lineHeight:1.6}}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
// ─── ROADMAP TAB ─────────────────────────────────────────────────────────────
const NON_GMB_KW = ["backlink","partenariat","annuaire","citation","netlinking","blog","contenu web","publicité","ads","on-page","seo classique","pagesjaunes","yelp","tripadvisor","pages jaunes"];
const isGMBAction = (text) => !NON_GMB_KW.some(kw => (text||"").toLowerCase().includes(kw));

function RoadmapTab({roadmap, client, clients, upd}){
  const rm0 = {
    month1:{title:roadmap.month1?.title||"",objective:roadmap.month1?.objective||"",actions:[...(roadmap.month1?.actions||[])],kpis:[...(roadmap.month1?.kpis||[])]},
    month2:{title:roadmap.month2?.title||"",objective:roadmap.month2?.objective||"",actions:[...(roadmap.month2?.actions||[])],kpis:[...(roadmap.month2?.kpis||[])]},
    month3:{title:roadmap.month3?.title||"",objective:roadmap.month3?.objective||"",actions:[...(roadmap.month3?.actions||[])],kpis:[...(roadmap.month3?.kpis||[])]},
  };
  const [editMode, setEditMode] = useState(false);
  const [rm, setRm] = useState(rm0);

  const saveRm = () => {
    const newData = {...(client.data||{}), roadmap:{...(client.data?.roadmap||{}), ...rm}};
    upd(clients.map(c=>c.id===client.id?{...c,data:newData}:c));
    setEditMode(false);
  };

  const MONTHS = [
    {k:"month1",n:"01",label:"Mois 1",c:"#dc2626",bg:"#fef2f2",b:"#fecaca"},
    {k:"month2",n:"02",label:"Mois 2",c:"#d97706",bg:"#fffbeb",b:"#fde68a"},
    {k:"month3",n:"03",label:"Mois 3",c:"#059669",bg:"#f0fdf4",b:"#bbf7d0"},
  ];

  if(!roadmap.month1&&!roadmap.month2&&!roadmap.month3) return(
    <div style={{textAlign:"center",padding:"48px 24px",color:"var(--ink4)"}}>
      <div style={{fontSize:32,marginBottom:12}}>🗺️</div>
      <div style={{fontSize:15,fontWeight:700,marginBottom:8,color:"var(--ink)"}}>Aucune roadmap générée</div>
      <div style={{fontSize:13}}>Lancez un audit IA pour générer la roadmap 3 mois.</div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontFamily:"var(--serif)",fontSize:24,fontWeight:800,marginBottom:2}}>Roadmap 3 mois</div>
          <div style={{fontSize:12.5,color:"var(--ink4)"}}>Plan d'action GMB pour atteindre le TOP 3</div>
        </div>
        <button onClick={()=>editMode?saveRm():setEditMode(true)}
          style={{padding:"8px 18px",borderRadius:9,border:"none",background:editMode?"#059669":"linear-gradient(135deg,#3B5BDB,#6B40D8)",color:"white",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          {editMode?"✓ Enregistrer":"✏️ Modifier"}
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
        {MONTHS.map(({k,n,label,c,bg,b})=>{
          const m = editMode ? rm[k] : (roadmap[k]||{});
          const actions = editMode ? rm[k].actions : (m.actions||[]).filter(isGMBAction);
          const hidden = editMode ? 0 : (m.actions||[]).length - actions.length;
          return(
            <div key={k} className="card" style={{borderTop:`4px solid ${c}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:bg,border:`1px solid ${b}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:c,flexShrink:0}}>{n}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:9.5,color:"var(--ink4)",fontWeight:700,textTransform:"uppercase"}}>{label}</div>
                  {editMode
                    ? <input value={rm[k].title} onChange={e=>setRm(r=>({...r,[k]:{...r[k],title:e.target.value}}))}
                        style={{fontWeight:700,fontSize:13,border:"1.5px solid #6B40D8",borderRadius:6,padding:"2px 7px",width:"100%",fontFamily:"inherit",outline:"none"}}/>
                    : <div style={{fontWeight:700,fontSize:13}}>{m.title||"—"}</div>
                  }
                </div>
              </div>

              <div style={{background:bg,borderRadius:8,padding:"7px 10px",marginBottom:10,border:`1px solid ${b}`}}>
                <div style={{fontSize:9.5,fontWeight:700,color:c,textTransform:"uppercase",marginBottom:4}}>Objectif</div>
                {editMode
                  ? <input value={rm[k].objective} onChange={e=>setRm(r=>({...r,[k]:{...r[k],objective:e.target.value}}))}
                      style={{fontSize:12.5,fontWeight:600,border:"1.5px solid "+b,borderRadius:6,padding:"2px 7px",width:"100%",fontFamily:"inherit",outline:"none",background:"white"}}/>
                  : <div style={{fontSize:12.5,fontWeight:600}}>{m.objective||"—"}</div>
                }
              </div>

              <div style={{marginBottom:8}}>
                <div style={{fontSize:9.5,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",marginBottom:6}}>Actions GMB</div>
                {actions.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:5,marginBottom:6,alignItems:"flex-start"}}>
                    <span style={{color:c,fontWeight:700,flexShrink:0,marginTop:1}}>→</span>
                    {editMode
                      ? <div style={{flex:1,display:"flex",gap:4}}>
                          <input value={a} onChange={e=>setRm(r=>({...r,[k]:{...r[k],actions:r[k].actions.map((x,j)=>j===i?e.target.value:x)}}))}
                            style={{flex:1,fontSize:12,border:"1.5px solid #E5E7EB",borderRadius:6,padding:"3px 7px",fontFamily:"inherit",outline:"none"}}/>
                          <button onClick={()=>setRm(r=>({...r,[k]:{...r[k],actions:r[k].actions.filter((_,j)=>j!==i)}}))}
                            style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:14,padding:"0 4px",flexShrink:0}}>×</button>
                        </div>
                      : <span style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5}}>{a}</span>
                    }
                  </div>
                ))}
                {hidden>0&&<div style={{fontSize:10.5,color:"#9CA3AF",fontStyle:"italic",paddingLeft:14}}>{hidden} action(s) hors GMB masquée(s)</div>}
                {editMode&&<button onClick={()=>setRm(r=>({...r,[k]:{...r[k],actions:[...r[k].actions,"Nouvelle action GMB..."]}})) }
                  style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:`1.5px dashed ${b}`,background:bg,color:c,cursor:"pointer",fontFamily:"inherit",fontWeight:600,marginTop:4}}>
                  + Ajouter une action
                </button>}
              </div>

              {(editMode?rm[k].kpis:(m.kpis||[])).length>0&&(
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
                  {(editMode?rm[k].kpis:m.kpis||[]).map((kp,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                      <span style={{fontSize:11.5,color:"var(--indigo2)",flexShrink:0}}>📈</span>
                      {editMode
                        ? <input value={kp} onChange={e=>setRm(r=>({...r,[k]:{...r[k],kpis:r[k].kpis.map((x,j)=>j===i?e.target.value:x)}}))}
                            style={{flex:1,fontSize:11,border:"1.5px solid #E5E7EB",borderRadius:6,padding:"2px 6px",fontFamily:"inherit",outline:"none"}}/>
                        : <span style={{fontSize:11.5,color:"var(--indigo2)"}}>{kp}</span>
                      }
                      {editMode&&<button onClick={()=>setRm(r=>({...r,[k]:{...r[k],kpis:r[k].kpis.filter((_,j)=>j!==i)}}))}
                        style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:13,padding:"0 2px",flexShrink:0}}>×</button>}
                    </div>
                  ))}
                  {editMode&&<button onClick={()=>setRm(r=>({...r,[k]:{...r[k],kpis:[...r[k].kpis,"Nouveau KPI..."]}}))}
                    style={{fontSize:11,padding:"3px 9px",borderRadius:6,border:"1.5px dashed #ddd6fe",background:"#f5f3ff",color:"var(--indigo2)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,marginTop:2}}>
                    + KPI
                  </button>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {roadmap.beyond&&<div className="card" style={{background:"#F4F5FA",border:"1.5px solid #e0e7ff"}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:"var(--ink)"}}>{roadmap.beyond.title||"Au-delà de 3 mois"}</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            {(roadmap.beyond.actions||[]).filter(isGMBAction).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:6,fontSize:13,color:"var(--ink2)",marginBottom:6}}>
                <span style={{color:"var(--indigo2)",fontWeight:700,flexShrink:0}}>→</span>{a}
              </div>
            ))}
          </div>
          {roadmap.beyond.expectedResults&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(roadmap.beyond.expectedResults).map(([k,v])=>(
              <div key={k} style={{background:"#F4F5FA",border:"1px solid #ddd6fe",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:"var(--indigo2)"}}>{v}</div>
                <div style={{fontSize:10.5,color:"var(--ink3)",marginTop:2,textTransform:"capitalize"}}>{k}</div>
              </div>
            ))}
          </div>}
        </div>
      </div>}
    </div>
  );
}

// ─── VISIBILITE TAB ──────────────────────────────────────────────────────────
function VisibiliteTab({client, clients, upd, kw, googleApiKey, data, ext, score}){
  const [viTab, setViTab] = useState("carte");

  // Agréger les concurrents depuis tous les scans géo
  const geoGrid = client?.geoGrid || {};
  const geoCompetitors = (() => {
    const compMap = {};
    Object.entries(geoGrid).forEach(([kwKey, kwData]) => {
      if(kwKey==="center"||kwKey==="keywords"||typeof kwData!=="object"||!kwData.scans) return;
      const lastScan = kwData.scans[kwData.scans.length-1];
      if(!lastScan) return;
      (lastScan.cells||[]).forEach(cell => {
        if(!cell||typeof cell!=="object") return;
        (cell.competitors||[]).forEach(c => {
          if(c.isYou) return;
          if(!compMap[c.name]) compMap[c.name] = {name:c.name, appearances:0, positions:[], keywords:new Set()};
          compMap[c.name].appearances++;
          compMap[c.name].positions.push(c.pos||c.position||1);
          compMap[c.name].keywords.add(kwKey);
        });
      });
    });
    return Object.values(compMap)
      .map(c=>({
        ...c,
        avgPos: Math.round(c.positions.reduce((a,b)=>a+b,0)/c.positions.length*10)/10,
        keywords: [...c.keywords]
      }))
      .sort((a,b)=>a.avgPos-b.avgPos)
      .slice(0,15);
  })();

  const TABS = [
    {k:"carte",       icon:"🗺️", label:"Carte"},
    {k:"keywords",    icon:"🔑", label:"Mots-clés"},
    {k:"concurrence", icon:"🏆", label:"Concurrence"},
  ];

  return(
    <div className="fade">
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:16}}>
        <div style={{width:4,height:28,borderRadius:2,background:"linear-gradient(135deg,#6B40D8,#C03080)",marginRight:14,flexShrink:0}}/>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"#1E1B30",letterSpacing:"-.01em"}}>Visibilité & Positionnement</div>
          <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>Carte locale · Mots-clés · Analyse concurrentielle</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:3,background:"#F4F5FA",borderRadius:12,padding:4,border:"1px solid #E5E7EB",marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setViTab(t.k)}
            style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px 14px",borderRadius:9,border:"none",fontFamily:"inherit",fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .15s",
              background:viTab===t.k?"white":"transparent",
              color:viTab===t.k?"#3B5BDB":"#6B7280",
              boxShadow:viTab===t.k?"0 2px 8px rgba(0,0,0,.08)":"none"}}>
            <span style={{fontSize:16}}>{t.icon}</span>
            <span>{t.label}</span>
            {t.k==="concurrence"&&geoCompetitors.length>0&&(
              <span style={{fontSize:10,background:"#DC2626",color:"white",borderRadius:10,padding:"1px 6px",fontWeight:700}}>{geoCompetitors.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* CARTE */}
      {viTab==="carte"&&<GeoGridTab client={client} clients={clients} upd={upd} kw={kw} googleApiKey={googleApiKey}/>}

      {/* MOTS-CLÉS */}
      {viTab==="keywords"&&<KeywordsTab kw={kw} city={ext?.city||client?.city||""} client={client} clients={clients} upd={upd}/>}

      {/* CONCURRENCE */}
      {viTab==="concurrence"&&(
        <div>
          {geoCompetitors.length>0?(
            <div className="card" style={{marginBottom:16,borderTop:"3px solid #DC2626"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:14,color:"#1E1B30"}}>🏆 Concurrents détectés par la carte géo</div>
                <span style={{fontSize:11,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:20,padding:"2px 8px",fontWeight:700,marginLeft:"auto"}}>{geoCompetitors.length} concurrents</span>
              </div>
              <div style={{background:"white",borderRadius:12,border:"1px solid #E5E7EB",overflow:"hidden",marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1.5fr",padding:"8px 16px",background:"#F4F5FA",borderBottom:"1px solid #E5E7EB",fontSize:10,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".5px"}}>
                  <div>Concurrent</div>
                  <div style={{textAlign:"center"}}>Position moy.</div>
                  <div style={{textAlign:"center"}}>Présences</div>
                  <div>Mots-clés</div>
                </div>
                {geoCompetitors.map((c,i)=>{
                  const posColor = c.avgPos<=3?"#059669":c.avgPos<=10?"#E85A30":"#DC2626";
                  const posBg   = c.avgPos<=3?"#F0FDF4":c.avgPos<=10?"#FFF7ED":"#FEF2F2";
                  return(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1.5fr",padding:"11px 16px",borderBottom:i<geoCompetitors.length-1?"1px solid #F3F4F6":"none",alignItems:"center"}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#1E1B30"}}>{c.name}</div>
                      <div style={{textAlign:"center"}}>
                        <span style={{fontSize:12,fontWeight:800,background:posBg,color:posColor,padding:"3px 10px",borderRadius:6}}>#{c.avgPos}</span>
                      </div>
                      <div style={{textAlign:"center",fontSize:12,color:"#6B7280",fontWeight:600}}>{c.appearances} pts</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {c.keywords.slice(0,2).map((kw,j)=>(
                          <span key={j} style={{fontSize:10,background:"#F5F3FF",color:"#6B40D8",padding:"2px 7px",borderRadius:20,fontWeight:600,whiteSpace:"nowrap"}}>
                            {kw.length>18?kw.slice(0,18)+"…":kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11.5,color:"#6B7280",padding:"8px 4px",display:"flex",gap:6,alignItems:"center"}}>
                <span>💡</span>
                <span>Concurrents agrégés depuis le dernier scan de chaque mot-clé. Lance un scan pour mettre à jour.</span>
              </div>
            </div>
          ):(
            <div style={{background:"#F4F5FA",borderRadius:14,padding:"32px",textAlign:"center",border:"1px dashed #E5E7EB",marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:10}}>🗺️</div>
              <div style={{fontSize:14,fontWeight:700,color:"#374151",marginBottom:6}}>Aucun concurrent détecté</div>
              <div style={{fontSize:12,color:"#6B7280"}}>Lance un scan carte (onglet Carte) pour identifier les concurrents par zone géographique.</div>
            </div>
          )}
          <CompetitorsTab data={data} client={client} ext={ext} score={score}/>
        </div>
      )}
    </div>
  );
}

function AvisTab({client, clients, upd, hasEnvKey, apiKey, score}){
  const data      = client.data||{};
  const ext       = data.extracted||{};
  const reviews   = data.reviews||{};
  const avisData  = client.avisData||{note:"", totalAvis:"", responseRate:"", objectif:"", lienGoogle:"", recentAvis:[]};
  const [form,    setForm]      = useState(avisData);
  const [editing, setEditing]   = useState(false);
  const [newAvis, setNewAvis]   = useState({note:5, texte:""});
  const [genLoading, setGenLoading] = useState(false);
  const [copiedIdx, setCopiedIdx]   = useState(null);
  const [activeSection, setActiveSection] = useState("suivi");

  // Préférences de génération IA
  const [tutoiement,  setTutoiement]  = useState(false);
  const [signature,   setSignature]   = useState(()=>localStorage.getItem(`avis_sig_${client.id}`)||`${client.name||""}`);
  const [consignes,   setConsignes]   = useState(()=>localStorage.getItem(`avis_consignes_${client.id}`)||"");

  const note    = parseFloat(form.note||ext.rating||0);
  const nbAvis  = parseInt(form.totalAvis||ext.reviewCount||0);
  const tauxRep = parseInt(form.responseRate||reviews.responseRate||0);
  const lien    = form.lienGoogle||"";

  const saveData = () => {
    const u = clients.map(c=>c.id===client.id?{...c,avisData:form}:c);
    upd(u); client.avisData=form; setEditing(false);
  };

  const buildSystem = (noteVal) => {
    const tutoie = tutoiement;
    const tonNote = noteVal>=4
      ? "Ton : remerciement sincère, rebondis sur un élément positif précis du commentaire."
      : noteVal===3
      ? "Ton : remercie pour l'honnêteté, montre que le retour est pris en compte, reste positif sans être sur la défensive."
      : "Ton : empathie sincère, excuses mesurées, propose un contact direct pour résoudre le problème.";

    return `Tu es le gérant de la fiche Google de "${client.name}", ${client.category||ext.category||"établissement"} situé ${client.city||ext.city||""}.
Tu réponds personnellement aux avis publiés par tes clients.

Règles strictes :
- Commence par une salutation chaleureuse avec le prénom (ex : "Bonjour Marie,", "Merci Sophie,"). Si pas de prénom, commence par "Bonjour,".
- ${tutoie?"Tutoie le client tout au long de la réponse.":"Vouvoie le client tout au long de la réponse."}
- Ne mentionne JAMAIS la note, les étoiles ou le nombre d'étoiles.
- Aucun markdown : pas de gras, pas d'italique, pas de listes, pas de titres.
- Évite absolument : "Votre avis compte", "N'hésitez pas à revenir", "Votre satisfaction est notre priorité", "Ravi de lire votre commentaire".
- Ne recopie jamais le commentaire mot pour mot, reformule avec tes propres mots.

Structure :
1. Ouverture personnalisée avec le prénom.
2. Corps : rebondis sur un élément précis du commentaire (produit, service, personne, moment, ambiance). Si l'avis est vide ou sans détail, fais une réponse courte (2 phrases) sans inventer.
3. Fermeture chaleureuse et variée : "À très bientôt", "Au plaisir de vous revoir", "Belle continuation à vous", etc.

${tonNote}

Informations sur l'établissement :
- Nom : ${client.name||""}
- Activité : ${client.category||ext.category||""}
- Adresse : ${ext.address||""}
- Téléphone : ${ext.phone||""}
- Site web : ${ext.website||""}
${consignes?`\nConsignes spécifiques : ${consignes}`:""}

Signature à ajouter à la fin (sur une nouvelle ligne) : ${signature||client.name||""}

Réponds UNIQUEMENT avec le texte de la réponse, sans commentaire ni explication.`;
  };

  const genReponse = async (avis, idx) => {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey || localStorage.getItem("bto_apikey") || "";
    if(!key||!avis.texte.trim()) return;
    setGenLoading(idx);
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:500,
          system:buildSystem(avis.note),
          messages:[{role:"user",content:`Avis de ${avis.auteur||"un client"} :\n\n"${avis.texte}"\n\nRédige la réponse.`}]
        })
      });
      const d = await res.json();
      const text = (d.content||[]).map(b=>b.text||"").join("").trim();
      const updated = {...form, recentAvis: (form.recentAvis||[]).map((a,i)=>i===idx?{...a,reponse:text}:a)};
      setForm(updated);
      const u = clients.map(c=>c.id===client.id?{...c,avisData:updated}:c);
      upd(u); client.avisData=updated;
    }catch(e){}
    setGenLoading(null);
  };

  const genFromNew = async () => {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey || localStorage.getItem("bto_apikey") || "";
    if(!key||!newAvis.texte.trim()) return;
    setGenLoading("new");
    try{
      const kwList=(newAvis.selKw||[]);
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:500,
          system:buildSystem(newAvis.note) + (kwList.length>0?`\n\nIntègre naturellement ces mots-clés SEO dans la réponse : ${kwList.join(", ")}.`:""),
          messages:[{role:"user",content:`Avis de ${newAvis.auteur||"un client"} :\n\n"${newAvis.texte||"(aucun commentaire)"}"${newAvis.auteur?`\n\nPrénom du client : ${newAvis.auteur}`:""}\n\nRédige la réponse.`}]
        })
      });
      const d = await res.json();
      const text = (d.content||[]).map(b=>b.text||"").join("").trim();
      setNewAvis(p=>({...p,reponseGeneree:text}));
    }catch(e){}
    setGenLoading(null);
  };

  const saveToHistory = () => {
    const updated={...form,recentAvis:[...(form.recentAvis||[]),{auteur:newAvis.auteur,note:newAvis.note,texte:newAvis.texte,id:Date.now(),reponse:newAvis.reponseGeneree}]};
    setForm(updated);
    const u=clients.map(c=>c.id===client.id?{...c,avisData:updated}:c);
    upd(u);client.avisData=updated;
    setNewAvis({note:5,texte:""});
  };

  const noteColor = note>=4.5?"#059669":note>=4?"#d97706":note>=3.5?"#f97316":"#dc2626";
  const noteLabel = note>=4.5?"Excellent":note>=4?"Bon":note>=3.5?"Moyen":"À améliorer";

  return(
    <div style={{padding:"0 2px"}}>
      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
        <div style={{width:4,height:28,borderRadius:2,background:"linear-gradient(135deg,#E85A30,#E85A30)",marginRight:14,flexShrink:0}}/>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"#1E1B30",letterSpacing:"-.01em"}}>⭐ Avis & Réputation</div>
          <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>Gestion et réponses aux avis Google</div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"Note Google",       v:note?`${note}/5`:"—", sub:noteLabel,  c:noteColor,  icon:"⭐"},
          {l:"Nombre d'avis",    v:nbAvis||"—",            sub:"total",    c:"#6B40D8",  icon:"💬"},
          {l:"Taux de réponse",  v:tauxRep?`${tauxRep}%`:"—", sub:tauxRep>=80?"Bon":tauxRep>=50?"Moyen":"À améliorer", c:tauxRep>=80?"#059669":tauxRep>=50?"#d97706":"#dc2626", icon:"↩️"},
          {l:"Objectif/mois",    v:form.objectif||"—",     sub:"avis cibles", c:"#C03080", icon:"🎯"},
        ].map(({l,v,sub,c,icon})=>(
          <div key={l} style={{background:"white",borderRadius:12,padding:"16px",border:"1px solid #E5E7EB",borderTop:`3px solid ${c}`,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:24,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-.02em"}}>{v}</div>
            <div style={{fontSize:11,color:"#6B7280",marginTop:5,fontWeight:500}}>{l}</div>
            {sub&&<div style={{fontSize:10.5,color:c,fontWeight:700,marginTop:2}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── NAVIGATION SECTIONS ── */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"#F4F5FA",borderRadius:10,padding:4,width:"fit-content",border:"1px solid #E5E7EB"}}>
        {[{id:"suivi",l:"💬 Répondre aux avis"},{id:"collecter",l:"🔗 Collecter"},{id:"analyse",l:"📊 Analyse"}].map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{padding:"7px 16px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer",transition:"all .15s",
              background:activeSection===s.id?"white":"transparent",
              color:activeSection===s.id?"#1E1B30":"#6B7280",
              boxShadow:activeSection===s.id?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
            {s.l}
          </button>
        ))}
      </div>

      {/* ══ RÉPONDRE AUX AVIS ══ */}
      {activeSection==="suivi"&&(
        <div>
          {/* ── PARAMÈTRES IA ── */}
          <div style={{background:"white",borderRadius:12,padding:"16px 18px",marginBottom:14,border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#1E1B30",marginBottom:12}}>⚙️ Paramètres de génération IA</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {/* Tutoiement */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:8}}>Mode d'adresse</div>
                <div style={{display:"flex",gap:6}}>
                  {[{v:false,l:"Vouvoiement"},{v:true,l:"Tutoiement"}].map(opt=>(
                    <button key={String(opt.v)} onClick={()=>setTutoiement(opt.v)}
                      style={{flex:1,padding:"8px",borderRadius:8,border:tutoiement===opt.v?"none":"1.5px solid #E5E7EB",background:tutoiement===opt.v?"#6B40D8":"white",color:tutoiement===opt.v?"white":"#374151",cursor:"pointer",fontSize:12.5,fontWeight:600,fontFamily:"inherit",transition:"all .15s"}}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Signature */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:6}}>Signature</div>
                <input className="inp" value={signature} onChange={e=>{setSignature(e.target.value);localStorage.setItem(`avis_sig_${client.id}`,e.target.value);}}
                  placeholder={`${client.name||"Nom établissement"}`}
                  style={{margin:0,fontSize:13}}/>
              </div>
            </div>
            {/* Consignes spécifiques */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:6}}>Consignes spécifiques <span style={{fontWeight:400,color:"#9CA3AF"}}>(optionnel — ex : "ne pas mentionner les prix", "utiliser le tutoiement avec les jeunes")</span></div>
              <textarea className="ta" rows={2} value={consignes} onChange={e=>{setConsignes(e.target.value);localStorage.setItem(`avis_consignes_${client.id}`,e.target.value);}}
                placeholder="Ajoutez ici vos consignes personnalisées pour ce client…"
                style={{margin:0,fontSize:12.5}}/>
            </div>
          </div>

          {/* ── ZONE COLLER UN AVIS ── */}
          <div style={{background:"white",borderRadius:14,padding:"20px",marginBottom:16,border:"1px solid #E5E7EB",borderTop:"3px solid #E85A30"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:4}}>✍️ Générer une réponse</div>
            <div style={{fontSize:12,color:"#6B7280",marginBottom:14}}>Collez l'avis Google → sélectionnez les mots-clés → générez</div>

            {/* Auteur optionnel */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:5}}>Prénom du client <span style={{fontWeight:400,color:"#9CA3AF"}}>(optionnel)</span></div>
              <input className="inp" value={newAvis.auteur||""} onChange={e=>setNewAvis({...newAvis,auteur:e.target.value})}
                placeholder="Marie, Pierre…" style={{margin:0,fontSize:13,maxWidth:200}}/>
            </div>

            {/* Note en boutons */}
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",marginRight:4}}>Note :</div>
              {[5,4,3,2,1].map(n=>(
                <button key={n} onClick={()=>setNewAvis({...newAvis,note:n})}
                  style={{padding:"5px 14px",borderRadius:20,border:newAvis.note===n?"none":"1.5px solid #E5E7EB",
                    background:newAvis.note===n?n>=4?"#059669":n===3?"#E85A30":"#dc2626":"white",
                    color:newAvis.note===n?"white":"#374151",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all .15s"}}>
                  {n}★
                </button>
              ))}
            </div>

            {/* Texte avis */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:5}}>Texte de l'avis</div>
              <textarea className="ta" rows={3} value={newAvis.texte||""} onChange={e=>setNewAvis({...newAvis,texte:e.target.value})}
                placeholder={"Collez ici le texte de l'avis Google…\n(Si l'avis n'a pas de commentaire, laissez vide)"}
                style={{margin:0}}/>
            </div>

            {/* Mots-clés SEO */}
            {(()=>{
              const kws=[...(data.keywords?.primary||[]).filter(k=>k.kw&&!k.kw.includes("métier")).map(k=>k.kw),
                         ...(data.keywords?.secondary||[]).filter(k=>k.kw&&!k.kw.includes("secondaire")).map(k=>k.kw),
                         ...(client.city?[client.city]:[])]
                         .slice(0,10);
              if(!kws.length) return null;
              return(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:7}}>Mots-clés SEO à intégrer <span style={{fontWeight:400,color:"#9CA3AF"}}>(cliquez pour sélectionner)</span></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {kws.map(kw=>{
                      const sel=(newAvis.selKw||[]).includes(kw);
                      return(
                        <button key={kw} onClick={()=>{const arr=newAvis.selKw||[];setNewAvis({...newAvis,selKw:sel?arr.filter(k=>k!==kw):[...arr,kw]});}}
                          style={{padding:"5px 12px",borderRadius:20,border:sel?"none":"1.5px solid #E5E7EB",
                            background:sel?"#6B40D8":"white",color:sel?"white":"#374151",
                            cursor:"pointer",fontSize:12,fontWeight:sel?700:500,fontFamily:"inherit",transition:"all .15s"}}>
                          {sel?"✓ ":""}{kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Bouton générer */}
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button onClick={genFromNew} disabled={genLoading==="new"}
                style={{padding:"10px 24px",borderRadius:10,border:"none",
                  background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",
                  color:"white",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:8,transition:"all .18s"}}>
                {genLoading==="new"?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",animation:"spin 1s linear infinite"}}/>Génération…</>:"✨ Générer la réponse"}
              </button>
              {(newAvis.selKw||[]).length>0&&<span style={{fontSize:12,color:"#6B40D8",fontWeight:600}}>{(newAvis.selKw||[]).length} mot(s)-clé(s)</span>}
            </div>

            {/* Réponse générée */}
            {newAvis.reponseGeneree&&(
              <div style={{marginTop:16,background:"#F0FDF4",borderRadius:10,padding:"14px 16px",border:"1px solid #BBF7D0"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"#059669",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>✓ Réponse générée</div>
                <div style={{fontSize:14,color:"#1E1B30",lineHeight:1.8,marginBottom:12,whiteSpace:"pre-line"}}>{newAvis.reponseGeneree}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(newAvis.reponseGeneree);setCopiedIdx("gen");setTimeout(()=>setCopiedIdx(null),2000);}}
                    style={{fontSize:12.5,padding:"6px 16px",borderRadius:8,border:"none",background:copiedIdx==="gen"?"#059669":"#1E1B30",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .18s"}}>
                    {copiedIdx==="gen"?"✓ Copié !":"📋 Copier"}
                  </button>
                  {lien&&<a href={lien} target="_blank" rel="noreferrer"
                    style={{fontSize:12.5,padding:"6px 16px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#6B40D8",textDecoration:"none",fontWeight:600}}>
                    Répondre sur Google →
                  </a>}
                  <button onClick={saveToHistory}
                    style={{fontSize:12.5,padding:"6px 16px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                    Sauvegarder
                  </button>
                  <button onClick={genFromNew} disabled={genLoading==="new"}
                    style={{fontSize:12.5,padding:"6px 16px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                    🔄 Regénérer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── HISTORIQUE ── */}
          {(form.recentAvis||[]).length>0&&(
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>Historique des réponses</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {(form.recentAvis||[]).slice().reverse().map((avis,i)=>{
                  const realIdx=(form.recentAvis||[]).length-1-i;
                  const sc=avis.note>=4?"#059669":avis.note>=3?"#d97706":"#dc2626";
                  return(
                    <div key={avis.id} style={{background:"white",borderRadius:12,padding:"16px",border:"1px solid #E5E7EB",borderLeft:`3px solid ${sc}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{color:sc,fontSize:13,fontWeight:700}}>{"★".repeat(avis.note)}{"☆".repeat(5-avis.note)}</span>
                          {avis.auteur&&<span style={{fontWeight:600,fontSize:13,color:"#1E1B30"}}>{avis.auteur}</span>}
                          {avis.reponse&&<span style={{fontSize:10.5,fontWeight:700,color:"#059669",background:"#D1FAE5",padding:"2px 8px",borderRadius:20}}>✓ Répondu</span>}
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          {!avis.reponse&&<button onClick={()=>genReponse(avis,realIdx)} disabled={genLoading===realIdx}
                            style={{fontSize:11.5,padding:"4px 12px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                            {genLoading===realIdx?"…":"✨ Générer"}
                          </button>}
                          <button onClick={()=>{const u={...form,recentAvis:(form.recentAvis||[]).filter((_,idx)=>idx!==realIdx)};setForm(u);upd(clients.map(c=>c.id===client.id?{...c,avisData:u}:c));}}
                            style={{fontSize:11,color:"#dc2626",background:"none",border:"none",cursor:"pointer",padding:"4px 6px"}}>✕</button>
                        </div>
                      </div>
                      {avis.texte&&<div style={{fontSize:13,color:"#374151",fontStyle:"italic",marginBottom:avis.reponse?10:0,lineHeight:1.6,background:"#F4F5FA",padding:"10px 12px",borderRadius:8}}>"{avis.texte}"</div>}
                      {avis.reponse&&(
                        <div style={{marginTop:8,fontSize:13,color:"#374151",background:"#F0FDF4",borderRadius:8,padding:"12px",borderLeft:"3px solid #059669",lineHeight:1.8,whiteSpace:"pre-line"}}>
                          {avis.reponse}
                          <div style={{marginTop:8,display:"flex",gap:8}}>
                            <button onClick={()=>{navigator.clipboard.writeText(avis.reponse);setCopiedIdx(realIdx);setTimeout(()=>setCopiedIdx(null),2000);}}
                              style={{fontSize:11.5,color:copiedIdx===realIdx?"#059669":"#6B7280",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                              {copiedIdx===realIdx?"✓ Copié !":"📋 Copier"}
                            </button>
                            {lien&&<a href={lien} target="_blank" rel="noreferrer" style={{fontSize:11.5,color:"#6B40D8",textDecoration:"none",fontWeight:600}}>Répondre sur Google →</a>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Config KPIs */}
          {editing&&(
            <div style={{background:"#F4F5FA",borderRadius:12,padding:"16px",marginTop:16,border:"1px solid #E5E7EB"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Configuration</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:12}}>
                {[{k:"lienGoogle",l:"Lien Google direct",placeholder:"https://g.page/r/…"},
                  {k:"note",l:"Note actuelle",placeholder:"4.7",type:"number"},
                  {k:"totalAvis",l:"Nb total d'avis",placeholder:"418",type:"number"},
                  {k:"responseRate",l:"Taux de réponse %",placeholder:"80",type:"number"},
                  {k:"objectif",l:"Objectif avis/mois",placeholder:"10",type:"number"},
                ].map(f=>(
                  <div key={f.k}>
                    <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:5}}>{f.l}</div>
                    <input className="inp" type={f.type||"text"} value={form[f.k]||""} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.placeholder} style={{margin:0}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn" onClick={saveData}>Enregistrer</button>
                <button className="btn-ghost" onClick={()=>setEditing(false)}>Annuler</button>
              </div>
            </div>
          )}
          {!editing&&<button className="btn-ghost" onClick={()=>setEditing(true)} style={{fontSize:12,marginTop:12}}>⚙️ Configurer les KPIs</button>}
        </div>
      )}

      {/* ══ COLLECTER DES AVIS ══ */}
      {activeSection==="collecter"&&(
        <div>
          {/* Lien + QR */}
          <div style={{background:"white",borderRadius:12,padding:"20px",marginBottom:14,border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:12}}>🔗 Lien direct vers vos avis Google</div>
            {lien?(
              <div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <input className="inp" value={lien} readOnly style={{flex:1,fontSize:12,color:"#6B7280",margin:0}}/>
                  <button onClick={()=>{navigator.clipboard.writeText(lien);setCopiedIdx("lien");setTimeout(()=>setCopiedIdx(null),2000);}}
                    style={{padding:"9px 16px",borderRadius:8,border:"1px solid #E5E7EB",background:copiedIdx==="lien"?"#059669":"white",color:copiedIdx==="lien"?"white":"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,transition:"all .18s",flexShrink:0}}>
                    {copiedIdx==="lien"?"✓ Copié !":"📋 Copier"}
                  </button>
                  <a href={lien} target="_blank" rel="noreferrer"
                    style={{padding:"9px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",color:"white",textDecoration:"none",fontSize:13,fontWeight:600,flexShrink:0}}>
                    Ouvrir →
                  </a>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(lien)}`} alt="QR Code" style={{width:100,height:100,borderRadius:8,border:"1px solid #E5E7EB"}}/>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:"#1E1B30",marginBottom:6}}>QR Code à imprimer</div>
                    <div style={{fontSize:12.5,color:"#6B7280",lineHeight:1.7,marginBottom:8}}>Caisse, factures, cartes de visite — vos clients scannent et laissent un avis.</div>
                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(lien)}`} target="_blank" rel="noreferrer"
                      style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"1px solid #E5E7EB",background:"white",color:"#6B40D8",textDecoration:"none",fontWeight:600}}>
                      ⬇️ HD
                    </a>
                  </div>
                </div>
              </div>
            ):(
              <div style={{background:"#FFF7ED",borderRadius:10,padding:"14px",border:"1px solid #FED7AA",fontSize:13,color:"#92400e"}}>
                Configurez d'abord le lien Google dans <strong>Configurer les KPIs</strong> (onglet Répondre aux avis).
              </div>
            )}
          </div>

          {/* Templates */}
          <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:12}}>📨 Templates de collecte</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {icon:"💬",label:"SMS",text:`Bonjour [Prénom] 👋\n\nMerci pour votre confiance !\nVotre avis nous aiderait beaucoup 🙏\n\n👉 ${lien||"[lien]"}\n\n1 minute suffit — merci !`},
              {icon:"📧",label:"Email",text:`Objet : Votre avis compte beaucoup pour nous ⭐\n\nBonjour [Prénom],\n\nNous espérons que vous êtes satisfait(e) de nos services. Un avis Google nous aiderait enormément à nous faire connaître.\n\n👉 ${lien||"[lien]"}\n\nMerci !`},
              {icon:"💚",label:"WhatsApp",text:`Bonjour [Prénom] 😊 Merci de nous avoir fait confiance ! Un petit avis Google ferait vraiment la différence 🙏 → ${lien||"[lien]"}`},
              {icon:"🧾",label:"Facture / Carte de visite",text:`Vous êtes satisfait(e) ?\nLaissez-nous un avis Google ⭐\n\n[QR Code]\n\nMerci de votre confiance !`},
            ].map((tpl,i)=>(
              <div key={i} style={{background:"white",borderRadius:12,padding:"16px",border:"1px solid #E5E7EB"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#1E1B30"}}>{tpl.icon} {tpl.label}</div>
                  <button onClick={()=>{navigator.clipboard.writeText(tpl.text);setCopiedIdx(`tpl${i}`);setTimeout(()=>setCopiedIdx(null),2000);}}
                    style={{fontSize:11.5,padding:"4px 10px",borderRadius:7,border:"1px solid #E5E7EB",background:copiedIdx===`tpl${i}`?"#059669":"white",color:copiedIdx===`tpl${i}`?"white":"#374151",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .18s"}}>
                    {copiedIdx===`tpl${i}`?"✓ Copié":"Copier"}
                  </button>
                </div>
                <div style={{fontSize:12,color:"#374151",lineHeight:1.7,background:"#F4F5FA",borderRadius:8,padding:"10px",whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{tpl.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ANALYSE ══ */}
      {activeSection==="analyse"&&(
        <div>
          {/* Analyse IA */}
          {data.reviews?.analysis&&!data.reviews.analysis.includes("3 phrases")&&(
            <div style={{background:"white",borderRadius:12,padding:"20px",marginBottom:14,border:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#1E1B30",marginBottom:10}}>📊 Analyse qualitative</div>
              <p style={{fontSize:13.5,color:"#374151",lineHeight:1.8,borderLeft:"3px solid #6B40D8",paddingLeft:14,margin:0}}>{data.reviews.analysis}</p>
            </div>
          )}

          {/* Thèmes */}
          {(data.reviews?.positiveThemes?.filter(t=>!t.includes("thème")).length>0||data.reviews?.negativeThemes?.filter(t=>!t.includes("point")).length>0)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {data.reviews?.positiveThemes?.filter(t=>!t.includes("thème")).length>0&&(
                <div style={{background:"white",borderRadius:12,padding:"18px",border:"1px solid #D1FAE5"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#059669",marginBottom:10}}>👍 Ce qu'ils apprécient</div>
                  {data.reviews.positiveThemes.filter(t=>!t.includes("thème")).map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",background:"#F0FDF4",borderRadius:8,marginBottom:6,fontSize:13,color:"#374151"}}>
                      <span style={{color:"#059669",fontWeight:700}}>+</span>{t}
                    </div>
                  ))}
                </div>
              )}
              {data.reviews?.negativeThemes?.filter(t=>!t.includes("point")).length>0&&(
                <div style={{background:"white",borderRadius:12,padding:"18px",border:"1px solid #FECACA"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#DC2626",marginBottom:10}}>⚠️ Points à améliorer</div>
                  {data.reviews.negativeThemes.filter(t=>!t.includes("point")).map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",background:"#FEF2F2",borderRadius:8,marginBottom:6,fontSize:13,color:"#374151"}}>
                      <span style={{color:"#DC2626",fontWeight:700}}>!</span>{t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats avis saisis */}
          {(form.recentAvis||[]).length>0&&(
            <div style={{background:"white",borderRadius:12,padding:"18px",border:"1px solid #E5E7EB"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#1E1B30",marginBottom:14}}>Statistiques des avis enregistrés</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  {l:"Total saisis",v:(form.recentAvis||[]).length,c:"#6B40D8"},
                  {l:"Réponses générées",v:(form.recentAvis||[]).filter(a=>a.reponse).length,c:"#059669"},
                  {l:"Note moyenne",v:(()=>{const notes=(form.recentAvis||[]).map(a=>a.note);return notes.length?(notes.reduce((s,n)=>s+n,0)/notes.length).toFixed(1):"—";})(),c:"#d97706"},
                ].map(({l,v,c})=>(
                  <div key={l} style={{textAlign:"center",padding:"14px",background:"#F4F5FA",borderRadius:10,border:"1px solid #E5E7EB",borderTop:`3px solid ${c}`}}>
                    <div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div>
                    <div style={{fontSize:11.5,color:"#6B7280",marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!data.reviews?.analysis&&(form.recentAvis||[]).length===0&&(
            <div style={{background:"#F4F5FA",borderRadius:12,padding:"32px",textAlign:"center",border:"1px dashed #E5E7EB"}}>
              <div style={{fontSize:32,marginBottom:12}}>📈</div>
              <div style={{fontWeight:700,fontSize:15,color:"#1E1B30",marginBottom:6}}>Analyse disponible après audit</div>
              <div style={{fontSize:13,color:"#6B7280"}}>Lancez un audit complet pour générer l'analyse qualitative des avis et les thèmes positifs/négatifs.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AvisGeneratorWidget({client, hasEnvKey, apiKey}){
  const [avis,      setAvis]      = useState("");
  const [note,      setNote]      = useState(5);
  const [loading,   setLoading]   = useState(false);
  const [responses, setResponses] = useState([]);
  const [copied,    setCopied]    = useState(null);
  const [error,     setError]     = useState("");
  const [open,      setOpen]      = useState(false);
  const [showSeoTip, setShowSeoTip] = useState(false);

  // Extraire les mots-clés et infos SEO du client
  const city      = client?.city || client?.data?.extracted?.city || "";
  const category  = client?.category || client?.data?.extracted?.category || "";
  const mainKws   = (client?.data?.keywords?.primary||[]).slice(0,3).map(k=>k.kw).filter(Boolean);
  const secKws    = (client?.data?.keywords?.secondary||[]).slice(0,2).map(k=>k.kw).filter(Boolean);
  const allKws    = [...mainKws, ...secKws];
  const hasKws    = allKws.length > 0;

  const generate = async () => {
    if(!avis.trim()) return;
    setLoading(true); setError(""); setResponses([]);
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey;

    // Contexte SEO enrichi
    const seoContext = hasKws
      ? `\n\nCONTEXTE SEO À INTÉGRER NATURELLEMENT :\n- Établissement : "${client?.name}" — ${category} à ${city}\n- Mots-clés prioritaires à glisser naturellement dans les réponses : ${allKws.join(", ")}\n- Ville : ${city}`
      : `\n\nCONTEXTE : "${client?.name||"l'établissement"}" — ${category}${city ? ` à ${city}` : ""}`;

    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2500,
          system:`Tu es expert en gestion de réputation Google My Business et SEO local. 
Génère des réponses aux avis optimisées pour le référencement Google Maps.

RÈGLES SEO CRITIQUES :
- Intègre NATURELLEMENT 1-2 mots-clés locaux (métier + ville) dans chaque réponse, sans forcer
- Mentionne le nom de l'établissement au moins une fois
- Pour les avis positifs : remercie, renforce avec un mot-clé local, invite à revenir
- Pour les avis négatifs : excuse, propose une solution concrète, invite à recontacter — JAMAIS de mot-clé forcé si le contexte est délicat
- Les réponses doivent sonner humaines et authentiques, PAS comme du texte généré
- Longueur : Chaleureuse = 4-5 phrases, Professionnelle = 3-4 phrases, Concise = 2-3 phrases
- Commence chaque réponse par "Bonjour [Prénom]," si un prénom est mentionné dans l'avis
- Réponds UNIQUEMENT en JSON valide, aucun texte avant ou après`,
          messages:[
            {role:"user", content:`Avis client (${note} étoile${note>1?"s":""}) :
"${avis}"
${seoContext}

Génère 3 variantes de réponse. Pour chaque variante, indique aussi les mots-clés SEO utilisés.

JSON exact :
{"responses":[
  {"label":"Chaleureuse","tone":"warm","text":"...","seoKeywords":["kw1","kw2"]},
  {"label":"Professionnelle","tone":"pro","text":"...","seoKeywords":["kw1"]},
  {"label":"Concise","tone":"brief","text":"...","seoKeywords":["kw1"]}
]}`},
            {role:"assistant", content:"{"}
          ]
        })
      });
      const d = await res.json();
      const raw = "{" + (d.content||[]).map(b=>b.text||"").join("").trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||raw);
      setResponses(parsed.responses||[]);
    } catch(e){
      setError("Impossible de générer les réponses. Vérifiez votre clé API.");
    }
    setLoading(false);
  };

  const toneStyle = t => ({
    warm: {bg:"#fff7ed",c:"#d97706",b:"#fde68a"},
    pro:  {bg:"#ffffff",c:"#6B40D8",b:"#FBCFE8"},
    brief:{bg:"#ffffff",c:"#059669",b:"#e8e0ff"},
  }[t]||{bg:"var(--ground)",c:"var(--ink3)",b:"var(--border)"});

  return(
    <div style={{background:"var(--surface)",borderRadius:20,border:"1px solid var(--border)",marginBottom:16,boxShadow:"var(--shadow-sm)",overflow:"hidden"}}>
      {/* Header toggle */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",background:open?"#F4F5FA":"var(--surface)",transition:"background .15s"}}>
        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6d28d9,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✨</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--ink)"}}>Générateur de réponses aux avis — SEO optimisé</div>
          <div style={{fontSize:12,color:"var(--ink4)",marginTop:1}}>
            {hasKws
              ? <span>Mots-clés détectés : <strong style={{color:"#6B40D8"}}>{allKws.slice(0,2).join(", ")}</strong>{allKws.length>2?` +${allKws.length-2}`:""} · intégrés automatiquement</span>
              : "Collez un avis → 3 variantes optimisées pour Google Maps"}
          </div>
        </div>
        <div style={{fontSize:18,color:"var(--ink4)",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▾</div>
      </div>

      {open&&(
        <div style={{padding:"0 20px 20px",borderTop:"1px solid var(--border)"}}>
          <div style={{paddingTop:16}}>

            {/* Mots-clés SEO utilisés */}
            {hasKws&&(
              <div style={{background:"#F4F5FA",borderRadius:12,padding:"10px 14px",marginBottom:14,border:"1px solid #b8b8f8"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11.5,fontWeight:700,color:"#6B40D8"}}>🔍 Mots-clés SEO intégrés automatiquement</span>
                  <button onClick={()=>setShowSeoTip(s=>!s)} style={{fontSize:10,color:"#6B40D8",background:"none",border:"none",cursor:"pointer"}}>pourquoi ?</button>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {allKws.map((k,i)=>(
                    <span key={i} style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:i<mainKws.length?"var(--indigo)":"#818cf8",color:"#fff",fontWeight:600}}>{k}</span>
                  ))}
                  {city&&<span style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:"#F4F5FA",color:"#6B40D8",fontWeight:600}}>📍 {city}</span>}
                </div>
                {showSeoTip&&(
                  <div style={{marginTop:8,fontSize:11.5,color:"#4338ca",lineHeight:1.5,borderTop:"1px solid #b8b8f8",paddingTop:8}}>
                    Google indexe les réponses aux avis. Glisser naturellement le nom du métier + la ville dans une réponse renforce le positionnement local — sans suroptimisation.
                  </div>
                )}
              </div>
            )}

            {/* Note étoiles */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <span style={{fontSize:12.5,fontWeight:600,color:"var(--ink3)"}}>Note de l'avis :</span>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setNote(n)}
                  style={{fontSize:22,background:"none",border:"none",cursor:"pointer",opacity:n<=note?1:.25,transition:"opacity .15s",padding:"0 2px"}}>
                  ⭐
                </button>
              ))}
              <span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>{note}/5</span>
              {note<=2&&<span style={{fontSize:11,background:"#fef2f2",color:"#dc2626",borderRadius:20,padding:"2px 8px",fontWeight:600}}>Avis négatif — ton adapté</span>}
            </div>

            {/* Avis input */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:600,color:"var(--ink3)",display:"block",marginBottom:6}}>Contenu de l'avis client</label>
              <textarea className="ta" rows={4} value={avis} onChange={e=>setAvis(e.target.value)}
                placeholder={note>=4
                  ? `Ex : "Super service, très réactifs et professionnels. Mon problème a été résolu en moins d'une heure. Je recommande !"`
                  : `Ex : "Déçu par le service, attente trop longue et pas de retour de votre part..."`}
                style={{fontSize:13.5}}/>
            </div>

            {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",fontSize:12.5,color:"#dc2626",marginBottom:12}}>{error}</div>}

            <button className="btn" onClick={generate} disabled={!avis.trim()||loading||(!(hasEnvKey||apiKey))}
              style={{fontSize:13,marginBottom:responses.length?16:0,opacity:avis.trim()&&!loading?1:.4}}>
              {loading?(
                <><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin 1s linear infinite"}}/>Génération SEO…</>
              ):`✨ Générer 3 réponses${hasKws?" avec mots-clés":""}`}
            </button>

            {/* Réponses générées */}
            {responses.length>0&&(
              <div style={{display:"grid",gap:12}}>
                {responses.map((r,i)=>{
                  const ts = toneStyle(r.tone);
                  const isCopied = copied===i;
                  return(
                    <div key={i} style={{background:ts.bg,borderRadius:14,padding:"16px 18px",border:`1px solid ${ts.b}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.6)",color:ts.c,border:`1px solid ${ts.b}`}}>{r.label}</span>
                          {/* Mots-clés SEO utilisés dans cette variante */}
                          {(r.seoKeywords||[]).length>0&&(
                            <div style={{display:"flex",gap:4}}>
                              {r.seoKeywords.map((k,j)=>(
                                <span key={j} style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:"rgba(37,99,235,.12)",color:"#6B40D8",fontWeight:600}}>🔍 {k}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={()=>{navigator.clipboard.writeText(r.text);setCopied(i);setTimeout(()=>setCopied(null),2000);}}
                          style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:8,border:`1px solid ${ts.b}`,background:isCopied?"#059669":"rgba(255,255,255,.7)",color:isCopied?"#fff":ts.c,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
                          {isCopied?"✓ Copié !":"📋 Copier"}
                        </button>
                      </div>
                      <p style={{fontSize:13,color:"var(--ink2)",lineHeight:1.75,margin:0}}>{r.text}</p>
                    </div>
                  );
                })}
                <div style={{fontSize:11.5,color:"var(--ink4)",textAlign:"center",padding:"4px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <span>💡</span>
                  <span>Personnalisez avec le prénom du client si vous le connaissez · Google indexe les réponses aux avis</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UPDATE MODAL ─────────────────────────────────────────────────────────────
function ProspectEmailModal({client, score, failed, apiKey, hasEnvKey, onClose}){
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY || apiKey || "";
  const lvl = getLvl(score);

  // Scores éditables — initialiser depuis les scores du client
  const [editScores, setEditScores] = useState({...client.scores});
  const [editMode,   setEditMode]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [emails,     setEmails]     = useState([]);
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(null);

  // Score courant basé sur les critères éditables
  const currentScore = calcScore(editScores);
  const currentLvl   = getLvl(currentScore);
  const currentFailed = ALL.filter(c => editScores[c.id] === false).sort((a,b)=>b.points-a.points);
  const currentOk     = ALL.filter(c => editScores[c.id] === true);

  // Projection score à 3 mois (si on corrige tous les critères CRITIQUE + URGENT)
  const criticalIds = currentFailed.filter(c=>c.points>=4).map(c=>c.id);
  const projectedScores = {...editScores};
  criticalIds.forEach(id=>projectedScores[id]=true);
  const projectedScore = calcScore(projectedScores);
  const projectedLvl   = getLvl(projectedScore);
  const gainPoints     = projectedScore - currentScore;

  const toggleCritere = (id) => {
    setEditScores(prev => ({
      ...prev,
      [id]: prev[id]===true ? false : prev[id]===false ? null : false
    }));
  };

  const generate = async () => {
    setLoading(true); setError(""); setEmails([]);
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"content-type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":key},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:2500,
          system:"Tu es Sara Baudouin, experte SEO local a Vannes, fondatrice de BeTheOne. Tu rediges des emails de prospection percutants bases sur un vrai audit GMB avec une promesse chiffree de progression. Reponds UNIQUEMENT en JSON valide.",
          messages:[
            {role:"user", content:`Redige 2 emails de prospection bases sur cet audit GMB reel + projection 3 mois.

ETABLISSEMENT : "${client.name}" — ${client.category||""} a ${client.city||""}
SCORE ACTUEL : ${currentScore}/100 (${currentLvl.label})
NOTE GOOGLE : ${client.data?.extracted?.rating||"?"}/5 . ${client.data?.extracted?.reviewCount||"?"} avis

TOP 3 PROBLEMES CRITIQUES (arguments de vente) :
${currentFailed.slice(0,3).map((c,i)=>`${i+1}. ${c.label} — ${c.action}`).join("\n")}

PROJECTION 3 MOIS avec BeTheOne :
- Score actuel : ${currentScore}/100
- Score projete en 3 mois : ${projectedScore}/100 (+${gainPoints} points)
- Niveau atteint : ${projectedLvl.label}
- Criteres a corriger en priorite : ${criticalIds.length} actions a impact fort

QUICK WINS PROPOSES :
${(client.data?.insights?.quickWins||[]).slice(0,3).join("\n")||"Optimisation fiche complete"}

REGLES ABSOLUES :
- L email DOIT mentionner le score actuel (${currentScore}/100) et la projection (${projectedScore}/100 en 3 mois)
- L evolution chiffree est l argument principal : "+${gainPoints} points en 90 jours"
- Email 1 "Impact" : commencer par le score, montrer l ecart avec la concurrence, la projection 3 mois, CTA appel 15 min
- Email 2 "Curiosite" : commencer par une question sur leur visibilite, le score comme revelation, la promesse chiffree en conclusion
- WhatsApp : 60 mots max avec le score et la projection
- Ton direct, humain, pas corporate - signer Sara Baudouin, BeTheOne Vannes 06 51 17 69 10

JSON : {"emails":[{"label":"Impact","subject":"...","body":"..."},{"label":"Curiosite","subject":"...","body":"..."}],"whatsapp":"..."}`},
            {role:"assistant", content:"{"}
          ]
        })
      });
      const d = await res.json();
      const raw = "{" + (d.content||[]).map(b=>b.text||"").join("").trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]||raw);
      const all = [...(parsed.emails||[])];
      if(parsed.whatsapp) all.push({label:"WhatsApp",isWhatsapp:true,body:parsed.whatsapp});
      setEmails(all);
    }catch(e){
      setError("Erreur generation. Verifiez la cle API.");
    }
    setLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"var(--surface)",borderRadius:20,width:"100%",maxWidth:980,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>

        {/* Header */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fffbeb",flexShrink:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:"#92400e"}}>🎯 Emails de prospection — {client.name}</div>
            <div style={{fontSize:12,color:"#b45309",marginTop:2}}>
              Score actuel <strong>{currentScore}/100</strong> → Projection 3 mois <strong style={{color:"#059669"}}>{projectedScore}/100</strong> (+{gainPoints} pts)
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setEditMode(m=>!m)}
              style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"1px solid var(--border)",
                background:editMode?"var(--indigo)":"var(--surface)",color:editMode?"#fff":"var(--ink3)",
                cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .15s"}}>
              ✏️ {editMode?"Modifier le score":"Modifier le score"}
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--ink4)",fontSize:22,lineHeight:1}}>×</button>
          </div>
        </div>

        <div style={{display:"flex",flex:1,overflow:"hidden"}}>

          {/* ── PANNEAU GAUCHE : score + critères éditables ── */}
          <div style={{width:editMode?340:260,flexShrink:0,borderRight:"1px solid #E2E8F0",overflowY:"auto",transition:"width .2s",padding:"16px"}}>

            {/* Score actuel / projeté */}
            <div style={{background:"#F4F5FA",borderRadius:14,padding:"14px",marginBottom:12}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                {/* Score actuel */}
                <div style={{flex:1,textAlign:"center",padding:"12px 8px",borderRadius:12,background:currentLvl.bg,border:`2px solid ${currentLvl.border}`}}>
                  <div style={{fontSize:28,fontWeight:900,color:currentLvl.color,lineHeight:1}}>{currentScore}</div>
                  <div style={{fontSize:9.5,color:currentLvl.color,fontWeight:700,marginTop:2}}>ACTUEL</div>
                  <div style={{fontSize:10,color:currentLvl.color,marginTop:1}}>{currentLvl.label}</div>
                </div>
                <div style={{fontSize:18,color:"var(--ink4)"}}>→</div>
                {/* Score projeté */}
                <div style={{flex:1,textAlign:"center",padding:"12px 8px",borderRadius:12,background:"#ffffff",border:"2px solid #86efac"}}>
                  <div style={{fontSize:28,fontWeight:900,color:"#059669",lineHeight:1}}>{projectedScore}</div>
                  <div style={{fontSize:9.5,color:"#059669",fontWeight:700,marginTop:2}}>3 MOIS</div>
                  <div style={{fontSize:10,color:"#059669",marginTop:1}}>{projectedLvl.label}</div>
                </div>
              </div>
              <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:"#059669",padding:"6px",background:"#ffffff",borderRadius:8}}>
                📈 +{gainPoints} points en 3 mois
              </div>
              {editMode&&<div style={{marginTop:8,fontSize:11,color:"var(--ink4)",textAlign:"center",lineHeight:1.4}}>
                Coche/décoche les critères pour simuler différents scénarios
              </div>}
            </div>

            {/* Barre de progression */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--ink4)",marginBottom:4}}>
                <span>Score actuel</span><span style={{fontWeight:700,color:currentLvl.color}}>{currentScore}%</span>
              </div>
              <div style={{height:6,background:"#F4F5FA",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",width:`${currentScore}%`,background:currentLvl.color,borderRadius:3,transition:"width .5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--ink4)",marginBottom:4}}>
                <span>Projection 3 mois</span><span style={{fontWeight:700,color:"#059669"}}>{projectedScore}%</span>
              </div>
              <div style={{height:6,background:"#F4F5FA",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${projectedScore}%`,background:"#10B981",borderRadius:3,transition:"width .5s"}}/>
              </div>
            </div>

            {/* Critères éditables par catégorie */}
            {CATS.map(cat=>{
              const catCriteria = cat.criteria;
              const failedHere = catCriteria.filter(c=>editScores[c.id]===false);
              const okHere = catCriteria.filter(c=>editScores[c.id]===true);
              if(!editMode && failedHere.length===0) return null;
              return(
                <div key={cat.id} style={{marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 8px",borderRadius:8,background:failedHere.length>0?"#fef2f2":"#ffffff",border:`1px solid ${failedHere.length>0?"#fecaca":"#e8e0ff"}`,marginBottom:5}}>
                    <span style={{fontSize:13}}>{cat.icon}</span>
                    <span style={{fontSize:11.5,fontWeight:700,color:failedHere.length>0?"#dc2626":"#059669",flex:1}}>{cat.label}</span>
                    <span style={{fontSize:10,fontWeight:700,color:failedHere.length>0?"#dc2626":"#059669"}}>{okHere.length}/{catCriteria.length}</span>
                  </div>
                  {catCriteria.map(c=>{
                    const val = editScores[c.id];
                    if(!editMode && val!==false) return null;
                    return(
                      <div key={c.id}
                        onClick={editMode?()=>toggleCritere(c.id):undefined}
                        style={{display:"flex",gap:8,padding:"6px 10px",borderRadius:8,marginBottom:3,
                          background:val===true?"#ffffff":val===false?"#fef2f2":"var(--ground)",
                          border:`1px solid ${val===true?"#e8e0ff":val===false?"#fecaca":"var(--border)"}`,
                          cursor:editMode?"pointer":"default",transition:"all .1s",alignItems:"flex-start"}}>
                        {editMode&&(
                          <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${val===true?"#059669":val===false?"#dc2626":"#cbd5e1"}`,
                            background:val===true?"#059669":val===false?"#fef2f2":"transparent",
                            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                            {val===true&&<span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>}
                            {val===false&&<span style={{color:"#dc2626",fontSize:9,fontWeight:800}}>✗</span>}
                          </div>
                        )}
                        {!editMode&&<span style={{color:"#dc2626",fontSize:11,flexShrink:0,marginTop:1}}>✗</span>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:"var(--ink)",lineHeight:1.3}}>{c.label}</div>
                          {!editMode&&<div style={{fontSize:10.5,color:"var(--ink4)",marginTop:1,lineHeight:1.3}}>{c.action}</div>}
                        </div>
                        <span style={{fontSize:10,fontWeight:700,color:val===true?"#059669":"#dc2626",flexShrink:0}}>{val===true?"+":"-"}{c.points}pts</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── PANNEAU DROIT : génération emails ── */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F4F5FA"}}>
              <div style={{fontSize:12.5,color:"var(--ink3)"}}>
                Emails générés avec score <strong>{currentScore}/100</strong> → <strong style={{color:"#059669"}}>{projectedScore}/100</strong> en 3 mois
              </div>
              <button className="btn" onClick={generate} disabled={loading||!key}
                style={{fontSize:12.5,padding:"7px 18px"}}>
                {loading?(
                  <><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin 1s linear infinite"}}/>Génération…</>
                ):emails.length>0?"🔄 Regénérer":"✨ Générer les emails"}
              </button>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              {loading&&(
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid #F5F5F5",borderTopColor:"#6B40D8",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
                  <div style={{fontSize:13.5,color:"var(--ink)",fontWeight:600,marginBottom:4}}>Génération des emails…</div>
                  <div style={{fontSize:12,color:"var(--ink4)"}}>L'IA intègre le score et la projection 3 mois</div>
                </div>
              )}

              {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px",color:"#dc2626",fontSize:13,marginBottom:16}}>{error}</div>}

              {!loading&&emails.length===0&&!error&&(
                <div style={{textAlign:"center",padding:"60px 20px",color:"var(--ink4)"}}>
                  <div style={{fontSize:40,marginBottom:12}}>✉️</div>
                  <div style={{...serif,fontSize:18,color:"var(--ink)",marginBottom:8}}>Prêt à générer</div>
                  <div style={{fontSize:13,lineHeight:1.6,marginBottom:20,maxWidth:320,margin:"0 auto 20px"}}>
                    Les emails seront personnalisés avec le score actuel <strong>{currentScore}/100</strong> et la projection <strong style={{color:"#059669"}}>{projectedScore}/100 en 3 mois</strong>.
                    <br/><br/>
                    Modifie les critères à gauche pour affiner la projection avant de générer.
                  </div>
                  <button className="btn" onClick={generate} disabled={!key} style={{fontSize:14,padding:"12px 28px"}}>✨ Générer les emails</button>
                </div>
              )}

              {emails.length>0&&(
                <div style={{display:"grid",gap:14}}>
                  {emails.map((e,i)=>{
                    const isWA = e.isWhatsapp;
                    const colors = [{bg:"var(--indigo)",b:"#FBCFE8",light:"#ffffff"},{bg:"#3B5BDB",b:"#ddd6fe",light:"#ffffff"},{bg:"#059669",b:"#e8e0ff",light:"#ffffff"}][i]||{bg:"var(--ink3)",b:"var(--border)",light:"var(--ground)"};
                    return(
                      <div key={i} style={{background:colors.light,borderRadius:14,padding:"16px 18px",border:`1px solid ${colors.b}`}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                          <span style={{fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,background:colors.bg,color:"#fff"}}>{isWA?"💬 WhatsApp":e.label}</span>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>{navigator.clipboard.writeText(isWA?e.body:`Objet : ${e.subject}\n\n${e.body}`);setCopied(i);setTimeout(()=>setCopied(null),2500);}}
                              style={{fontSize:11.5,padding:"5px 11px",borderRadius:7,border:`1px solid ${colors.b}`,background:copied===i?"#059669":"rgba(255,255,255,.8)",color:copied===i?"#fff":colors.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>
                              {copied===i?"✓ Copié !":"📋 Copier"}
                            </button>
                            {!isWA&&client.email&&<button onClick={()=>window.open(`mailto:${client.email}?subject=${encodeURIComponent(e.subject||"")}&body=${encodeURIComponent(e.body||"")}`)}
                              style={{fontSize:11.5,padding:"5px 11px",borderRadius:7,border:`1px solid ${colors.b}`,background:"rgba(255,255,255,.8)",color:colors.bg,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>📧 Mail</button>}
                            {isWA&&client.data?.extracted?.phone&&<button onClick={()=>window.open(`https://wa.me/${(client.data.extracted.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(e.body||"")}`)}
                              style={{fontSize:11.5,padding:"5px 11px",borderRadius:7,border:"1px solid #bbf7d0",background:"rgba(255,255,255,.8)",color:"#059669",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>💬 WA</button>}
                          </div>
                        </div>
                        {!isWA&&e.subject&&<div style={{background:"rgba(255,255,255,.8)",borderRadius:8,padding:"8px 11px",fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:10,border:`1px solid ${colors.b}`}}>{e.subject}</div>}
                        <div style={{background:"rgba(255,255,255,.8)",borderRadius:8,padding:"12px 14px",fontSize:12.5,lineHeight:1.85,color:"var(--ink2)",whiteSpace:"pre-line",border:`1px solid ${colors.b}`}}>{e.body}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RAPPORT PDF PROFESSIONNEL ────────────────────────────────────────────────
function RapportDropdown({client,history,score,ll,ok,failed,calcScore,setShowReport}){
  return(
    <button className="btn-ghost" onClick={()=>setShowReport(true)} style={{fontSize:12,padding:"6px 12px"}}>
      📄 Rapport
    </button>
  );
}


// ─── CONTENU GMB (Calendrier + Posts IA + Bibliothèque) ──────────────────────
const POST_TYPES=[
  {id:"Realisation", label:"Réalisation", color:"var(--indigo2)", bg:"#ffffff"},
  {id:"Conseil",     label:"Conseil",     color:"#0891b2", bg:"#ecfeff"},
  {id:"Offre",       label:"Offre",       color:"#059669", bg:"#ecfdf5"},
  {id:"Temoignage",  label:"Témoignage",  color:"#d97706", bg:"#fffbeb"},
  {id:"Actualite",   label:"Actualité",   color:"var(--violet)", bg:"#ffffff"},
  {id:"Question",    label:"Question",    color:"#dc2626", bg:"#fef2f2"},
];

// ── Modale de visualisation d'un post complet ──────────────────────────────
function PostModal({post, client, onClose, onToggle}){
  const t=POST_TYPES.find(x=>x.id===post.type)||POST_TYPES[0];
  const [copied,setCopied]=useState(false);
  const copy=()=>{
    const full=`${post.title}\n\n${post.content}`;
    navigator.clipboard.writeText(full).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",backdropFilter:"blur(4px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:18,width:"100%",maxWidth:640,maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.22)",border:`2px solid ${t.color}22`}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:t.bg}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{background:t.color,color:"#fff",borderRadius:8,padding:"4px 12px",fontSize:11.5,fontWeight:700}}>{t.label}</span>
            {post.week&&<span style={{fontSize:11.5,color:"var(--ink4)",fontWeight:600}}>Semaine {post.week}</span>}
            {post.bestDay&&<span style={{fontSize:11.5,color:"var(--ink3)"}}>· {post.bestDay} {post.bestTime||""}</span>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={copy} className="btn-sm" style={{background:copied?"#059669":"#fff",color:copied?"#fff":t.color,borderColor:t.color+"44"}}>{copied?"✓ Copié !":"Copier"}</button>
            <button onClick={onToggle} className="btn-sm" style={{background:post.done?"#ffffff":"#fff",color:post.done?"#059669":"#64748b",borderColor:post.done?"#86efac":"#F4F5FA"}}>{post.done?"✓ Publié":"Marquer publié"}</button>
            <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--ink4)",fontSize:20,lineHeight:1}}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"20px 24px",flex:1}}>
          <div style={{fontWeight:800,fontSize:17,color:"var(--ink)",marginBottom:14,lineHeight:1.4}}>{post.title}</div>
          {(post.keywords||[]).length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {post.keywords.map((k,i)=>(
                <span key={i} style={{background:"#F4F5FA",color:"var(--indigo2)",borderRadius:6,padding:"3px 10px",fontSize:11.5,fontWeight:600}}>🔍 {k}</span>
              ))}
            </div>
          )}
          <div style={{background:"#F4F5FA",borderRadius:12,padding:"16px",border:"1px solid var(--border)",marginBottom:post.cta?16:0}}>
            <pre style={{fontSize:13.5,color:"var(--ink2)",lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{post.content}</pre>
          </div>
          {post.cta&&(
            <div style={{background:t.bg,border:`1.5px solid ${t.color}33`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>📣</span>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:t.color,textTransform:"uppercase",letterSpacing:".5px",marginBottom:3}}>CTA</div>
                <div style={{fontSize:13.5,fontWeight:600,color:"var(--ink)"}}>{post.cta}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostsIATab({client, upd, clients}){
  const [selPost, setSelPost]=useState(null);
  const [libCat, setLibCat]=useState(0);
  const [libSearch, setLibSearch]=useState("");
  const [libCopied, setLibCopied]=useState(null);
  const postIdeas=(client?.data?.postIdeas)||[];

  const getPosts=c=>(c?.calPosts||{});

  const togglePost=(post)=>{
    if(!client)return;
    const calPosts=getPosts(client);
    // Trouver la clé du post dans le calendrier
    let found=false;
    const newCalPosts={};
    Object.entries(calPosts).forEach(([k,arr])=>{
      newCalPosts[k]=arr.map(p=>{
        if(p.id===post.id){found=true;return{...p,done:!p.done};}
        return p;
      });
    });
    if(found){
      const updated={...client,calPosts:newCalPosts};
      upd(clients.map(c=>c.id===client.id?updated:c));
      if(selPost?.id===post.id)setSelPost({...selPost,done:!selPost.done});
    }
  };

  // Cherche le post dans le calendrier pour avoir l'état done
  const getCalPost=(post)=>{
    const calPosts=getPosts(client);
    for(const arr of Object.values(calPosts)){
      const found=arr.find(p=>p.id===post.id||(p.fromAudit&&p.week===post.week&&p.type===post.type));
      if(found)return found;
    }
    return post;
  };

  const libCopy=(content,id)=>{navigator.clipboard.writeText(content).then(()=>{setLibCopied(id);setTimeout(()=>setLibCopied(null),2000);});};
  const libFiltered=libSearch?LIBRARY.map(c=>({...c,templates:c.templates.filter(t=>t.title.toLowerCase().includes(libSearch.toLowerCase())||t.content.toLowerCase().includes(libSearch.toLowerCase()))})).filter(c=>c.templates.length>0):[LIBRARY[libCat]];

  if(!client)return(
    <div style={{textAlign:"center",padding:"80px 0",color:"var(--ink4)"}}>Sélectionnez un client dans la liste de gauche</div>
  );

  const doneCount=postIdeas.filter(p=>getCalPost(p).done).length;

  return(
    <div style={{flex:1,overflowY:"auto",background:"#F4F5FA"}}>
      {/* Header stats */}
      <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"14px 24px",display:"flex",alignItems:"center",gap:16,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{...serif,fontSize:18,color:"var(--ink)"}}>{client.icon||"📍"} {client.name}</div>
        <div style={{display:"flex",gap:12,marginLeft:"auto",alignItems:"center"}}>
          {[{l:"Posts générés",v:postIdeas.length,c:"var(--indigo2)"},{l:"Publiés",v:doneCount,c:"#059669"},{l:"Restants",v:postIdeas.length-doneCount,c:"#d97706"}].map(({l,v,c})=>(
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:10,color:"var(--ink4)"}}>{l}</div></div>
          ))}
          {postIdeas.length>0&&<div style={{width:44,height:44,borderRadius:12,background:"#F4F5FA",border:"1.5px solid #ddd6fe",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:13,fontWeight:800,color:"var(--indigo2)"}}>{postIdeas.length?Math.round((doneCount/postIdeas.length)*100):0}%</div>
            <div style={{fontSize:9,color:"var(--ink4)"}}>fait</div>
          </div>}
        </div>
      </div>

      <div style={{padding:"20px 24px"}}>
        {postIdeas.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",background:"var(--surface)",borderRadius:16,border:"2px dashed #e0e7ff"}}>
            <div style={{fontSize:40,marginBottom:12}}>🤖</div>
            <div style={{...serif,fontSize:22,color:"var(--ink)",marginBottom:8}}>Aucun post généré</div>
            <div style={{fontSize:13.5,color:"var(--ink3)",marginBottom:20}}>Lancez un audit IA pour générer automatiquement 12 posts SEO optimisés pour ce client.</div>
            <div style={{fontSize:12,color:"var(--ink4)"}}>Les posts seront planifiés sur 12 semaines dans le calendrier</div>
          </div>
        ):(
          <>
            {/* Barre de progression */}
            <div style={{background:"var(--surface)",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:12.5,fontWeight:600,color:"var(--ink3)",flexShrink:0}}>Progression · 12 semaines</div>
              <div style={{flex:1,height:8,background:"#F4F5FA",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${postIdeas.length?Math.round((doneCount/postIdeas.length)*100):0}%`,background:"linear-gradient(90deg,#5a5aee,#8b5cf6)",borderRadius:4,transition:"width .5s"}}/>
              </div>
              <div style={{fontSize:12,color:"var(--indigo2)",fontWeight:700,flexShrink:0}}>{doneCount}/{postIdeas.length}</div>
            </div>

            {/* Grille des 12 posts */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12,marginBottom:24}}>
              {postIdeas.map((post,i)=>{
                const calPost=getCalPost(post);
                const t=POST_TYPES.find(x=>x.id===post.type)||POST_TYPES[0];
                return(
                  <div key={i} onClick={()=>setSelPost({...post,...calPost})}
                    style={{background:"var(--surface)",borderRadius:13,border:`1.5px solid ${calPost.done?"#86efac":t.color+"33"}`,padding:"14px 16px",cursor:"pointer",transition:"all .15s",boxShadow:calPost.done?"none":"0 2px 8px rgba(0,0,0,.04)",opacity:calPost.done?.7:1}}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                    {/* Badge type + semaine */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{background:t.color,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:10.5,fontWeight:700}}>{t.label}</span>
                        <span style={{fontSize:11,color:"var(--ink4)",fontWeight:600}}>S{post.week||i+1}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {post.bestDay&&<span style={{fontSize:10.5,color:"var(--ink4)"}}>{post.bestDay}</span>}
                        {calPost.done&&<span style={{background:"#dcfce7",color:"#059669",borderRadius:5,padding:"2px 8px",fontSize:10.5,fontWeight:700}}>✓ Publié</span>}
                      </div>
                    </div>
                    {/* Titre */}
                    <div style={{fontWeight:700,fontSize:13,color:"var(--ink)",marginBottom:8,lineHeight:1.4}}>{post.title}</div>
                    {/* Aperçu contenu */}
                    <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.content?.replace(/\n/g," ")}</div>
                    {/* Mots-clés */}
                    {post.keywords?.length>0&&(
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                        {post.keywords.slice(0,3).map((k,j)=>(
                          <span key={j} style={{background:"#F4F5FA",color:"var(--indigo2)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{k}</span>
                        ))}
                      </div>
                    )}
                    {/* CTA preview */}
                    {post.cta&&<div style={{fontSize:11,color:t.color,fontWeight:600,background:t.bg,borderRadius:7,padding:"4px 9px",display:"inline-flex",alignItems:"center",gap:4}}>
                      <span>📣</span>{post.cta.slice(0,55)}{post.cta.length>55?"…":""}
                    </div>}
                  </div>
                );
              })}
            </div>

            {/* ── BIBLIOTHÈQUE DE MODÈLES ── */}
            <div style={{borderTop:"2px solid #e8edf5",paddingTop:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{...serif,fontSize:22,color:"var(--ink)",marginBottom:2}}>Bibliothèque de modèles</div>
                  <div style={{fontSize:12.5,color:"var(--ink4)"}}>Templates génériques à personnaliser par client</div>
                </div>
                <input className="inp" style={{maxWidth:220,background:"var(--surface)"}} value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="Rechercher…"/>
              </div>
              {!libSearch&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  {LIBRARY.map((c,i)=>(
                    <button key={i} onClick={()=>setLibCat(i)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${libCat===i?c.color:"#F4F5FA"}`,background:libCat===i?c.bg:"#fff",color:libCat===i?c.color:"var(--ink3)",fontWeight:libCat===i?700:500,cursor:"pointer",fontFamily:"inherit",fontSize:12,transition:"all .2s"}}>{c.cat}</button>
                  ))}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                {libFiltered.flatMap(catItem=>catItem.templates.map((tpl,i)=>{
                  const lc=libSearch?LIBRARY.find(c=>c.templates.includes(tpl))||LIBRARY[0]:LIBRARY[libCat];
                  const tid=`lib-${lc.cat}-${i}`;
                  return(
                    <div key={tid} style={{background:"var(--surface)",borderRadius:12,border:"1px solid var(--border)",borderTop:`3px solid ${lc.color}`,overflow:"hidden"}}>
                      <div style={{padding:"10px 14px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",background:lc.bg}}>
                        <span style={{background:lc.color,color:"#fff",borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700}}>{tpl.title}</span>
                        <button onClick={()=>libCopy(tpl.content,tid)} style={{background:libCopied===tid?"#059669":lc.color,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"background .2s"}}>
                          {libCopied===tid?"Copié !":"Copier"}
                        </button>
                      </div>
                      <div style={{padding:"10px 14px"}}>
                        <pre style={{fontSize:12,color:"var(--ink2)",lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit",maxHeight:160,overflowY:"auto",margin:0}}>{tpl.content}</pre>
                      </div>
                    </div>
                  );
                }))}
              </div>
              <div style={{marginTop:16,background:"#F4F5FA",border:"1.5px solid #e0e7ff",borderRadius:12,padding:"16px 20px",textAlign:"center"}}>
                <div style={{fontSize:13,color:"var(--ink3)",lineHeight:1.8}}>
                  Remplacez <strong style={{color:"var(--indigo2)"}}>[VotreVille]</strong>, <strong style={{color:"var(--indigo2)"}}>[VotreMétier]</strong>, <strong style={{color:"var(--indigo2)"}}>[Téléphone]</strong> avant de publier.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modale post complet */}
      {selPost&&<PostModal post={selPost} client={client} onClose={()=>setSelPost(null)} onToggle={()=>{togglePost(selPost);}}/>}
    </div>
  );
}

// ── Onglet : Calendrier ────────────────────────────────────────────────────
// ─── TEMPLATES TAB ────────────────────────────────────────────────────────────
function TemplatesTab({client, clients, upd}){
  const [sector,    setSector]    = useState("Autre");
  const [selTpl,    setSelTpl]    = useState(null);
  const [vars,      setVars]      = useState({});
  const [selClient, setSelClient] = useState(client?.id||null);
  const [copied,    setCopied]    = useState(false);

  // Auto-detect sector from client category
  useEffect(()=>{
    if(!client) return;
    const cat = client.category||"";
    const found = Object.keys(POST_TEMPLATES).find(k=> cat.toLowerCase().includes(k.toLowerCase()) );
    if(found) setSector(found);
    setVars({
      "[VILLE]": client.city||"",
      "[NOM]":   client.name||"",
      "[TEL]":   client.data?.extracted?.phone||"",
      "[DATE]":  "",
      "[ANNÉES]":"",
    });
  },[client]);

  const templates = POST_TEMPLATES[sector] || POST_TEMPLATES["Autre"];
  const sectors   = Object.keys(POST_TEMPLATES);

  const resolve = (text) => {
    let t = text;
    Object.entries(vars).forEach(([k,v])=>{ if(v) t = t.replaceAll(k, v); });
    return t;
  };

  const addToCalendar = () => {
    if(!selTpl || !selClient) return;
    const c = clients.find(x=>x.id===selClient);
    if(!c) return;
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() + (8 - today.getDay())%7 || 7);
    const key = monday.toISOString().slice(0,10);
    const post = {
      id: Date.now().toString(),
      type: selTpl.type,
      title: resolve(selTpl.title),
      content: resolve(selTpl.content),
      keywords: selTpl.keywords.map(k=>resolve(k)),
      cta: "",
      done: false,
      fromTemplate: true,
    };
    const calPosts = {...(c.calPosts||{})};
    calPosts[key] = [...(calPosts[key]||[]), post];
    upd(clients.map(x=>x.id===c.id?{...x,calPosts}:x));
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const typeColor = t => ({
    "Réalisation":{bg:"#ffffff",c:"var(--indigo)"},
    "Conseil":    {bg:"#ffffff",c:"#059669"},
    "Offre":      {bg:"#fffbeb",c:"#d97706"},
    "Témoignage": {bg:"#fdf4ff",c:"#9333ea"},
    "Actualité":  {bg:"#F4F5FA",c:"#0891b2"},
  }[t]||{bg:"var(--ground)",c:"var(--ink3)"});

  return(
    <div style={{display:"flex",height:"100%",overflow:"hidden"}}>
      {/* ── Colonne gauche : sélection secteur + liste ── */}
      <div style={{width:300,flexShrink:0,borderRight:"1px solid #E2E8F0",overflowY:"auto",background:"var(--surface)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>Secteur</div>
          <select className="inp" value={sector} onChange={e=>setSector(e.target.value)} style={{fontSize:12.5,padding:"7px 10px"}}>
            {sectors.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"10px 10px"}}>
          {templates.map((t,i)=>{
            const tc = typeColor(t.type);
            const isSel = selTpl?.title===t.title;
            return(
              <div key={i} onClick={()=>setSelTpl(t)}
                style={{padding:"12px 14px",borderRadius:12,marginBottom:6,cursor:"pointer",background:isSel?"#ffffff":"var(--ground)",border:`1.5px solid ${isSel?"var(--indigo)":"transparent"}`,transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:tc.bg,color:tc.c}}>{t.type}</span>
                </div>
                <div style={{fontSize:12.5,fontWeight:600,color:isSel?"var(--indigo)":"var(--ink)",lineHeight:1.4}}>{t.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Colonne droite : preview + variables ── */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px",background:"#F4F5FA"}}>
        {!selTpl?(
          <div style={{textAlign:"center",padding:"60px 20px",color:"var(--ink4)"}}>
            <div style={{fontSize:36,marginBottom:12}}>📝</div>
            <div style={{...serif,fontSize:20,color:"var(--ink)",marginBottom:6}}>Bibliothèque de templates</div>
            <div style={{fontSize:13}}>Sélectionnez un template à gauche pour le prévisualiser et le personnaliser.</div>
          </div>
        ):(
          <>
            {/* Variables */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"18px 20px",marginBottom:16,border:"1px solid var(--border)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>Variables à personnaliser</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {TEMPLATE_VARS.map(v=>(
                  <div key={v}>
                    <label style={{fontSize:11.5,color:"var(--ink3)",fontWeight:500,display:"block",marginBottom:4}}>{v}</label>
                    <input className="inp" value={vars[v]||""} onChange={e=>setVars(prev=>({...prev,[v]:e.target.value}))}
                      placeholder={v==="[VILLE]"?"Vannes":v==="[NOM]"?"Plomberie Martin":v==="[TEL]"?"02 97 XX XX XX":v==="[DATE]"?"31 mars":v==="[ANNÉES]"?"10":""}
                      style={{fontSize:12.5,padding:"7px 10px"}}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{background:"var(--surface)",borderRadius:16,padding:"20px",marginBottom:16,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,...typeColor(selTpl.type)}}>{selTpl.type}</span>
                <div style={{...serif,fontSize:17,color:"var(--ink)",flex:1}}>{resolve(selTpl.title)}</div>
              </div>
              <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.9,whiteSpace:"pre-line",padding:"14px 16px",background:"#F4F5FA",borderRadius:12,marginBottom:12}}>
                {resolve(selTpl.content)}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {selTpl.keywords.map((k,i)=>(
                  <span key={i} style={{background:"#F4F5FA",border:"1px solid #b8b8f8",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#6B40D8",fontWeight:600}}>{resolve(k)}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <select className="inp" value={selClient||""} onChange={e=>setSelClient(e.target.value)} style={{flex:1,minWidth:160,fontSize:12.5,padding:"8px 12px"}}>
                <option value="">— Choisir un client —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.icon||"📍"} {c.name}</option>)}
              </select>
              <button className="btn" onClick={addToCalendar} disabled={!selClient}
                style={{fontSize:13,padding:"9px 18px",opacity:selClient?1:.4}}>
                {copied?"✓ Ajouté au calendrier !":"📅 Ajouter au calendrier"}
              </button>
              <button className="btn-ghost" onClick={()=>{navigator.clipboard?.writeText(resolve(selTpl.content));setCopied(true);setTimeout(()=>setCopied(false),1500);}}
                style={{fontSize:12.5}}>
                📋 Copier
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── BENCHMARK WIDGET ─────────────────────────────────────────────────────────
// ─── SECTOR TIPS WIDGET ───────────────────────────────────────────────────────
function SectorTipsWidget({client, scores}){
  const sector = detectSector(client.category||"", client.city||"");
  const [expanded, setExpanded] = useState(false);
  if(!sector) return null;

  return(
    <div style={{background:"var(--surface)",borderRadius:20,border:"1.5px solid #b8b8f8",marginBottom:16,overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
      {/* Header toggle */}
      <div onClick={()=>setExpanded(e=>!e)} style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",background:"#F4F5FA",transition:"background .15s"}}>
        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{sector.icon||"📋"}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5,color:"#6B40D8"}}>Best Practices Google 2026 — {sector.label}</div>
          <div style={{fontSize:12,color:"#6B40D8",marginTop:1}}>{sector.mustDo.filter(t=>t.priority.includes("CRITIQUE")).length} actions critiques · objectif TOP 3 Google Maps</div>
        </div>
        <div style={{fontSize:18,color:"#6B40D8",transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▾</div>
      </div>

      {expanded&&(
        <div style={{padding:"16px 20px"}}>

          {/* TOP 3 stratégie */}
          {sector.top3Tips&&(
            <div style={{background:"linear-gradient(135deg,#3B5BDB,#6B40D8,#C03080,#E85A30)",borderRadius:14,padding:"16px 18px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:10}}>🏆 Stratégie TOP 3 Google Maps</div>
              {sector.top3Tips.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<sector.top3Tips.length-1?8:0}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:12.5,color:"#fff",lineHeight:1.5,fontWeight:500}}>{t}</div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Google */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8,marginBottom:16}}>
            {sector.stats.map((s,i)=>(
              <div key={i} style={{background:"#F4F5FA",borderRadius:10,padding:"9px 12px",border:"1px solid #b8b8f8"}}>
                <div style={{fontSize:12,color:"#6B40D8",fontWeight:500,lineHeight:1.4}}>{s}</div>
              </div>
            ))}
          </div>

          {/* Actions prioritaires */}
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Actions recommandées par Google</div>
          <div style={{display:"grid",gap:8}}>
            {sector.mustDo.map((tip,i)=>{
              const priorityColors = {
                "🔴 CRITIQUE": {bg:"#fef2f2",b:"#fecaca",c:"#dc2626",label:"CRITIQUE"},
                "🟠 URGENT":   {bg:"#fff7ed",b:"#fed7aa",c:"#ea580c",label:"URGENT"},
                "🟡 IMPORTANT":{bg:"#fffbeb",b:"#fde68a",c:"#d97706",label:"IMPORTANT"},
                "🟢 BONUS":    {bg:"#ffffff",b:"#e8e0ff",c:"#059669",label:"BONUS"},
              }[tip.priority]||{bg:"var(--ground)",b:"var(--border)",c:"var(--ink3)",label:"INFO"};
              return(
                <div key={i} style={{background:priorityColors.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${priorityColors.b}`,display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:priorityColors.c,color:"#fff",flexShrink:0,marginTop:2,letterSpacing:".3px"}}>{priorityColors.label}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{tip.action}</div>
                    <div style={{fontSize:11.5,color:"var(--ink3)",lineHeight:1.5}}>{tip.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:12,padding:"10px 14px",background:"#F4F5FA",borderRadius:10,fontSize:11.5,color:"var(--ink4)",display:"flex",alignItems:"center",gap:6}}>
            <span>📌</span> Recommandations issues des <strong style={{color:"var(--ink2)"}}>GBP Best Practices Playbooks 2026</strong> publiés par Google — Restaurant, Hôtel, Service, Beauté, Tours & Attractions.
          </div>

          {/* Local Service Ads — bloc spécial pour les artisans */}
          {sector.localServiceAds&&(
            <div style={{marginTop:12,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",borderRadius:14,padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:22}}>⭐</span>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{sector.localServiceAds.title}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginTop:1}}>Fonctionnalité exclusive Google — paiement au lead uniquement</div>
                </div>
              </div>
              <p style={{fontSize:12.5,color:"#fff",lineHeight:1.6,marginBottom:12}}>{sector.localServiceAds.description}</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6,marginBottom:10}}>
                {sector.localServiceAds.steps.map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.2)",borderRadius:8,padding:"7px 10px",display:"flex",gap:7,alignItems:"flex-start"}}>
                    <span style={{fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}.</span>
                    <span style={{fontSize:11.5,color:"#fff",lineHeight:1.4}}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11.5,color:"rgba(255,255,255,.9)",fontWeight:600}}>📊 {sector.localServiceAds.stat}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BenchmarkWidget({client, clients, calcScore, getLvl}){
  const cat = (client.category||"").split(",")[0].trim().toLowerCase();
  const myScore = calcScore(client.scores||{});
  const peers = clients.filter(c=>c.id!==client.id && (c.category||"").toLowerCase().includes(cat) && cat.length>2);

  if(peers.length===0) return null;

  const peerScores = peers.map(c=>calcScore({...(c.scores||{}),...(c.manualOverrides||{})}));
  const avg = Math.round(peerScores.reduce((a,b)=>a+b,0)/peerScores.length);
  const diff = myScore - avg;
  const best = Math.max(...peerScores, myScore);
  const isAbove = diff >= 0;

  return(
    <div style={{background: isAbove?"#ffffff":"#fef9ec", borderRadius:16, padding:"16px 20px", border:`1px solid ${isAbove?"#e8e0ff":"#fde68a"}`, marginBottom:16, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>Benchmark sectoriel · {client.category||"Votre secteur"}</div>
        <div style={{fontSize:13,color:"var(--ink2)",fontWeight:500}}>
          {isAbove
            ? <span>🏆 <strong style={{color:"#059669"}}>+{diff} points</strong> au-dessus de la moyenne de vos {peers.length} confrère{peers.length>1?"s":""}</span>
            : <span>📊 <strong style={{color:"#d97706"}}>{Math.abs(diff)} points</strong> en-dessous de la moyenne de vos {peers.length} confrère{peers.length>1?"s":""}</span>
          }
        </div>
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"#6B40D8"}}>{myScore}</div>
          <div style={{fontSize:10.5,color:"var(--ink4)"}}>Votre score</div>
        </div>
        <div style={{fontSize:18,color:"var(--ink4)"}}>vs</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"var(--ink3)"}}>{avg}</div>
          <div style={{fontSize:10.5,color:"var(--ink4)"}}>Moyenne</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"#d97706"}}>{best}</div>
          <div style={{fontSize:10.5,color:"var(--ink4)"}}>Meilleur</div>
        </div>
      </div>
    </div>
  );
}

function CalendrierTab({clients, client, setSelClient, upd}){
  const today=new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay,setSelDay]= useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newType,setNewType]=useState("Realisation");
  const [newTitle,setNewTitle]=useState("");
  const [selPost,setSelPost]=useState(null);

  const getPosts=c=>(c?.calPosts||{});
  const dayKey=(y,m,d)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const addPost=()=>{
    if(!newTitle.trim()||!client)return;
    const key=dayKey(year,month,selDay);
    const posts=getPosts(client);
    const np={id:Date.now(),type:newType,title:newTitle.trim(),content:"",keywords:[],cta:"",done:false,fromAudit:false};
    const updated={...client,calPosts:{...posts,[key]:[...(posts[key]||[]),np]}};
    upd(clients.map(c=>c.id===client.id?updated:c));
    setNewTitle("");setShowAdd(false);
  };

  const togglePost=(key,postId)=>{
    if(!client)return;
    const posts=getPosts(client);
    const updated={...client,calPosts:{...posts,[key]:(posts[key]||[]).map(p=>p.id===postId?{...p,done:!p.done}:p)}};
    upd(clients.map(c=>c.id===client.id?updated:c));
    if(selPost?.id===postId)setSelPost(p=>({...p,done:!p.done}));
  };

  const deletePost=(key,postId)=>{
    if(!client)return;
    const posts=getPosts(client);
    const updated={...client,calPosts:{...posts,[key]:(posts[key]||[]).filter(p=>p.id!==postId)}};
    upd(clients.map(c=>c.id===client.id?updated:c));
    if(selPost?.id===postId)setSelPost(null);
  };

  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const startOffset=(firstDay+6)%7;
  const cells=Array.from({length:Math.ceil((startOffset+daysInMonth)/7)*7},(_,i)=>{const d=i-startOffset+1;return d>=1&&d<=daysInMonth?d:null;});
  const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const DAYS=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  const posts=getPosts(client||{});
  const monthPrefix=`${year}-${String(month+1).padStart(2,"0")}`;
  const monthKeys=Object.keys(posts).filter(k=>k.startsWith(monthPrefix));
  const totalPosts=monthKeys.reduce((s,k)=>s+(posts[k]||[]).length,0);
  const donePosts=monthKeys.reduce((s,k)=>s+(posts[k]||[]).filter(p=>p.done).length,0);

  const clientsStats=clients.map(c=>{const cp=c.calPosts||{};const mk=Object.keys(cp).filter(k=>k.startsWith(monthPrefix));const tot=mk.reduce((s,k)=>s+(cp[k]||[]).length,0);const done=mk.reduce((s,k)=>s+(cp[k]||[]).filter(p=>p.done).length,0);return{...c,tot,done};}).filter(c=>c.tot>0);

  return(
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      {/* Sidebar clients */}
      <div style={{width:210,borderRight:"1px solid #e8edf5",background:"var(--surface)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
        <div style={{padding:"14px 14px 8px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Clients</div>
          {clients.length===0?<div style={{fontSize:12,color:"var(--ink4)",textAlign:"center",padding:"12px 0"}}>Aucun client</div>:clients.map(c=>{
            const cp=c.calPosts||{};const mk=Object.keys(cp).filter(k=>k.startsWith(monthPrefix));
            const tot=mk.reduce((s,k)=>s+(cp[k]||[]).length,0);const done=mk.reduce((s,k)=>s+(cp[k]||[]).filter(p=>p.done).length,0);
            return(
              <button key={c.id} onClick={()=>setSelClient(c.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:9,border:`1.5px solid ${client?.id===c.id?"var(--indigo2)":"transparent"}`,background:client?.id===c.id?"#ffffff":"transparent",cursor:"pointer",fontFamily:"inherit",marginBottom:3,textAlign:"left",transition:"all .15s"}}>
                <div style={{width:26,height:26,borderRadius:7,background:(c.color||"var(--indigo2)")+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{c.icon||"📍"}</div>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                  <div style={{fontSize:10,color:"var(--ink4)"}}>{tot>0?`${done}/${tot}`:"—"}</div>
                </div>
              </button>
            );
          })}
        </div>
        {/* Légende types */}
        <div style={{padding:"12px 14px",marginTop:"auto"}}>
          <div style={{fontSize:9.5,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:7}}>Types</div>
          {POST_TYPES.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><div style={{width:7,height:7,borderRadius:2,background:t.color}}/><span style={{fontSize:10.5,color:"var(--ink3)"}}>{t.label}</span></div>)}
        </div>
      </div>

      {/* Calendrier principal */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:"#F4F5FA"}}>
        {/* Nav mois */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"12px 20px",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{width:30,height:30,borderRadius:8,border:"1.5px solid #e2e8f0",background:"var(--surface)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <div style={{...serif,fontSize:19,color:"var(--ink)",minWidth:180,textAlign:"center"}}>{MONTHS[month]} {year}</div>
            <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{width:30,height:30,borderRadius:8,border:"1.5px solid #e2e8f0",background:"var(--surface)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
          <button onClick={()=>{setYear(today.getFullYear());setMonth(today.getMonth());}} style={{padding:"5px 12px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"var(--surface)",cursor:"pointer",fontFamily:"inherit",fontSize:11.5,color:"var(--ink3)",fontWeight:600}}>Aujourd'hui</button>
          {client&&totalPosts>0&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:14}}>
            {[{l:"Planifiés",v:totalPosts,c:"var(--indigo2)"},{l:"Publiés",v:donePosts,c:"#059669"},{l:"Restants",v:totalPosts-donePosts,c:"#d97706"}].map(({l,v,c})=>(
              <div key={l} style={{textAlign:"center"}}><div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:9.5,color:"var(--ink4)"}}>{l}</div></div>
            ))}
          </div>}
        </div>

        <div style={{padding:"16px 20px",flex:1}}>
          {!client?(
            <div style={{textAlign:"center",padding:"80px 0",color:"var(--ink4)"}}>Sélectionnez un client</div>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
                {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:"#94A3B8",padding:"5px 0",textTransform:"uppercase",letterSpacing:".4px"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                {cells.map((d,i)=>{
                  if(!d)return<div key={i} style={{minHeight:80}}/>;
                  const key=dayKey(year,month,d);
                  const dayPosts=(posts[key]||[]);
                  const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
                  const isSel=selDay===d;
                  return(
                    <div key={i} onClick={()=>{setSelDay(d===selDay?null:d);setShowAdd(false);setSelPost(null);}}
                      style={{minHeight:80,border:`1.5px solid ${isSel?"var(--indigo2)":isToday?"#FBCFE8":"#F4F5FA"}`,borderRadius:10,padding:"6px 7px",background:isSel?"#f0edff":isToday?"#ffffff":"#fff",cursor:"pointer",transition:"all .15s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <span style={{fontSize:11.5,fontWeight:isToday?800:600,color:isToday?"var(--indigo2)":"#374151",width:20,height:20,borderRadius:5,background:isToday?"#ffffff":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{d}</span>
                        {dayPosts.length>0&&<span style={{fontSize:9,color:"var(--indigo2)",fontWeight:700,background:"#F4F5FA",borderRadius:4,padding:"1px 4px"}}>{dayPosts.filter(p=>p.done).length}/{dayPosts.length}</span>}
                      </div>
                      {dayPosts.slice(0,3).map(p=>{
                        const t=POST_TYPES.find(x=>x.id===p.type)||POST_TYPES[0];
                        return<div key={p.id} onClick={ev=>{ev.stopPropagation();setSelDay(d);setSelPost(p);}}
                          style={{display:"flex",alignItems:"center",gap:3,padding:"2px 5px",borderRadius:4,background:p.done?"#f0fdf4":t.bg,marginBottom:2,cursor:"pointer",opacity:p.done?.6:1}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:p.done?"#059669":t.color,flexShrink:0,display:"inline-block"}}/>
                          <span style={{fontSize:9.5,color:p.done?"#059669":t.color,fontWeight:700,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",flex:1,maxWidth:"100%",letterSpacing:".2px"}}>{t.label}</span>
                        </div>;
                      })}
                      {dayPosts.length>3&&<div style={{fontSize:9,color:"var(--ink4)",textAlign:"center"}}>+{dayPosts.length-3}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Panneau jour */}
              {selDay&&(()=>{
                const key=dayKey(year,month,selDay);
                const dayPosts=(posts[key]||[]);
                return(
                  <div style={{marginTop:14,background:"var(--surface)",borderRadius:13,border:"1.5px solid #e0e7ff",padding:"16px 18px",boxShadow:"0 4px 20px rgba(37,99,235,.07)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{...serif,fontSize:17,color:"var(--ink)"}}>
                        {DAYS[(new Date(year,month,selDay).getDay()+6)%7]} {selDay} {MONTHS[month]}
                        <span style={{fontSize:12,color:"var(--ink4)",marginLeft:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>· {client.name}</span>
                      </div>
                      <button onClick={()=>setShowAdd(a=>!a)} className="btn" style={{padding:"6px 14px",fontSize:12}}>+ Ajouter</button>
                    </div>
                    {showAdd&&(
                      <div style={{background:"#F4F5FA",borderRadius:10,padding:"12px",marginBottom:12,border:"1px solid #e0e7ff"}}>
                        <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                          <div style={{flex:1,minWidth:160}}>
                            <div style={{fontSize:10,fontWeight:700,color:"var(--ink3)",marginBottom:4,textTransform:"uppercase"}}>Titre</div>
                            <input className="inp" value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPost()} placeholder="Titre du post…" autoFocus/>
                          </div>
                          <div style={{minWidth:140}}>
                            <div style={{fontSize:10,fontWeight:700,color:"var(--ink3)",marginBottom:4,textTransform:"uppercase"}}>Type</div>
                            <select className="inp" value={newType} onChange={e=>setNewType(e.target.value)} style={{cursor:"pointer"}}>
                              {POST_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                          </div>
                          <div style={{display:"flex",gap:5}}>
                            <button className="btn" style={{padding:"9px 16px",fontSize:12.5}} onClick={addPost} disabled={!newTitle.trim()}>Ajouter</button>
                            <button className="btn-ghost" onClick={()=>setShowAdd(false)}>Annuler</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {dayPosts.length===0?<div style={{textAlign:"center",padding:"16px",color:"var(--ink4)",fontSize:12.5}}>Aucun post ce jour</div>:(
                      <div style={{display:"grid",gap:6}}>
                        {dayPosts.map(p=>{
                          const t=POST_TYPES.find(x=>x.id===p.type)||POST_TYPES[0];
                          return(
                            <div key={p.id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${p.done?"#e8e0ff":t.color+"33"}`,background:p.done?"#ffffff":t.bg,transition:"all .15s"}}>
                              <div onClick={()=>togglePost(key,p.id)} style={{width:19,height:19,borderRadius:5,border:`2px solid ${p.done?"#22c55e":t.color}`,background:p.done?"#22c55e":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                                {p.done&&<span style={{color:"#fff",fontSize:9.5,fontWeight:800}}>✓</span>}
                              </div>
                              <span style={{background:t.color,color:"#fff",borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700,flexShrink:0}}>{t.label}</span>
                              <span onClick={()=>setSelPost(p)} style={{flex:1,fontSize:12.5,fontWeight:600,color:p.done?"#6B40D8":"#1e293b",textDecoration:p.done?"line-through":"none",cursor:"pointer"}}>{p.title}</span>
                              {p.fromAudit&&<span style={{fontSize:9.5,background:"#F4F5FA",color:"var(--indigo2)",borderRadius:4,padding:"1px 6px",fontWeight:600,flexShrink:0}}>IA S{p.week}</span>}
                              <button onClick={()=>deletePost(key,p.id)} style={{background:"transparent",border:"none",color:"#F4F5FA",cursor:"pointer",fontSize:17,padding:"0 3px",borderRadius:4,transition:"color .15s"}} onMouseEnter={e=>e.target.style.color="#dc2626"} onMouseLeave={e=>e.target.style.color="#F4F5FA"}>×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Vue agence */}
              {clientsStats.length>1&&<div style={{marginTop:14,background:"var(--surface)",borderRadius:13,border:"1px solid var(--border)",padding:"14px 18px"}}>
                <div style={{fontWeight:700,fontSize:12.5,marginBottom:10,color:"var(--ink)"}}>Vue agence · {MONTHS[month]}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:7}}>
                  {clientsStats.map(c=>{
                    const pct=c.tot?Math.round((c.done/c.tot)*100):0;
                    return(
                      <div key={c.id} onClick={()=>setSelClient(c.id)} style={{padding:"9px 11px",borderRadius:9,border:`1.5px solid ${client?.id===c.id?"var(--indigo2)":"#F4F5FA"}`,background:client?.id===c.id?"#ffffff":"#F4F5FA",cursor:"pointer",transition:"all .15s"}}>
                        <div style={{fontWeight:700,fontSize:12,marginBottom:3,color:"var(--ink)"}}>{c.icon||"📍"} {c.name}</div>
                        <div style={{fontSize:10.5,color:"var(--ink3)",marginBottom:4}}>{c.done}/{c.tot} publiés</div>
                        <div style={{height:4,background:"#F4F5FA",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#059669":"var(--indigo2)",borderRadius:2}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>}
            </>
          )}
        </div>
      </div>

      {selPost&&<PostModal post={selPost} client={client} onClose={()=>setSelPost(null)}
        onToggle={()=>{
          const key=Object.keys(posts).find(k=>(posts[k]||[]).some(p=>p.id===selPost.id));
          if(key)togglePost(key,selPost.id);
        }}/>}
    </div>
  );
}

// ── Composant principal ContenuGMB ─────────────────────────────────────────
function ContenuGMB({clients,upd,go,getLvl,calcScore}){
  const [tab,     setTab]      = useState("calendrier");
  const [selClientId, setSelClientId] = useState(clients[0]?.id||null);
  const client=clients.find(c=>c.id===selClientId)||clients[0]||null;

  const TABS=[
    {id:"calendrier", label:"📅 Calendrier"},
    {id:"posts",      label:"🤖 Posts IA"},
    {id:"templates",  label:"📝 Templates"},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {/* Onglets */}
      <div style={{background:"white",borderBottom:"1px solid #E5E7EB",borderTop:"3px solid #6B40D8",padding:"0 24px",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
        <span style={{fontSize:14,fontWeight:800,color:"#1E1B30",marginRight:16}}>Calendrier</span>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"13px 18px",border:"none",background:"transparent",fontFamily:"inherit",fontSize:13,fontWeight:tab===t.id?700:500,color:tab===t.id?"#6B40D8":"#6B7280",cursor:"pointer",borderBottom:`2.5px solid ${tab===t.id?"#6B40D8":"transparent"}`,transition:"all .15s",marginBottom:"-1px"}}>
            {t.label}
          </button>
        ))}
        <div style={{marginLeft:"auto",padding:"8px 0"}}>
          {clients.length>0&&(tab==="posts"||tab==="calendrier")&&(
            <select className="inp" style={{maxWidth:200,fontSize:12.5,padding:"6px 10px"}} value={selClientId||""} onChange={e=>setSelClientId(e.target.value)}>
              {clients.map(c=><option key={c.id} value={c.id}>{c.icon||"📍"} {c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="calendrier"&&(
          <CalendrierTab clients={clients} client={client} setSelClient={setSelClientId} upd={upd}/>
        )}
        {tab==="posts"&&(
          <PostsIATab client={client} upd={upd} clients={clients}/>
        )}
        {tab==="templates"&&(
          <TemplatesTab client={client} clients={clients} upd={upd}/>
        )}
      </div>
    </div>
  );
}
