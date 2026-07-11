# Brief projet — Refonte du site Le Dôme (brasserie, Caluire)

Ce document résume toutes les décisions prises et informations collectées avant le début du développement, pour reprendre le projet avec tout le contexte nécessaire (dans Claude Code ou ailleurs).

## Contexte

- Client : Brasserie Le Dôme, restaurant familial, Centre Commercial Auchan Caluire.
- Site actuel : réalisé sous Adobe Muse (technologie discontinuée), hébergé chez Strato (conservé pour la refonte), visuellement daté.
- Objectif : site propre et moderne, bon référencement, réutilisation ponctuelle du contenu existant, nouveau logo à intégrer.
- Contrainte : projet freelance, build visé sur 2-3 jours après la phase de collecte.
- Site 100% statique HTML/CSS + JS minimal. Pas de CMS : les mises à jour de menu (environ tous les 3 mois) sont faites par le freelance lui-même, à la main ou via le script de build inclus — pas par le client.

## Informations pratiques confirmées

- Nom : Brasserie Le Dôme
- Adresse : 10 Chemin Jean Petit, Centre Commercial Auchan Caluire
- Téléphone : 04 78 23 64 15
- Email : brasserie.ledome@gmail.com
- Horaires (corrigés 10/07/2026) : lundi-samedi 8h00-19h00, jusqu'à 21h00 le jeudi et le vendredi, dimanche fermé
- Tagline (présente sur le logo/l'ancien site) : « Cuisine maison - Cocktails - Tapas »
- Ces informations, ainsi que les informations légales (SIRET, forme juridique, gérant), sont confirmées à jour côté client — à récupérer auprès de lui pour la page mentions légales.

## Accès et outils

- **Strato** (hébergement) : identifiants récupérés mais refusés à la connexion (« données d'accès non reconnues »). Pas encore résolu — piste : appel au support Strato par le client (titulaire du compte), possible confusion entre identifiants panel client et identifiants FTP. **Non bloquant** : l'accès n'est nécessaire qu'au moment du déploiement final (remplacement du site existant en FTP), tout le développement peut se faire sans.
- **GloriaFood** : accès obtenu. C'était l'outil de réservation de l'ancien site. **Décision client (10/07/2026) : GloriaFood ne sera pas utilisé sur le nouveau site.**
- **Dish** : accès obtenu. **C'est l'outil retenu pour la réservation en ligne** — module à intégrer sur la page réservation.
- **Google Business Profile** : accès obtenu directement (compte Google du client). Le profil est déjà globalement bien rempli, quelques détails à compléter plus tard (hors périmètre immédiat).
- **Mentions légales** : absentes du site actuel. À créer (obligation légale en France — LCEN) : SIRET, hébergeur (Strato, avec ses coordonnées), directeur de publication (le gérant).
- **Formulaire de contact** : l'ancien site utilise un script `scripts/form-u9251.php`, probablement généré par le widget de formulaire Adobe Muse/Business Catalyst (service Adobe discontinué). Fort risque qu'il ne fonctionne plus — à tester une fois l'accès FTP obtenu, sinon réécrire un script neutre (Strato supporte PHP sur la plupart de ses offres).

## Assets reçus (dans `src/images/`)

- `logo-le-dome.jpg` — nouveau logo, peint à la main, fond crème, lettrage noir + couleurs vives.
- `photo-salade-cesar.jpg` — photo pro haute résolution, correspond à la « Salade César » du menu (poulet, parmesan, croûtons).
- `photo-salade-lyonnaise.jpg` — photo pro haute résolution, correspond à la « Salade lyonnaise » (lardons, œuf poché).
- `photo-boeuf-carpaccio.jpg` — photo pro haute résolution, viande fine tranchée + frites. Association avec un plat précis de la carte incertaine (le descriptif du carpaccio de la carte ne mentionne pas de frites) — à confirmer avec le client pour la légende/alt text.
- Une 4e photo (dessert) était annoncée par le client mais pas encore reçue au moment de ce brief.
- **Signature visuelle retenue** : les 3 photos partagent une lumière en rayures caractéristique (ombre de store — attention : il n'y a PAS de pergola sur la terrasse, confirmé par le client le 11/07/2026, ne pas employer ce mot dans les textes). Motif finalement abandonné dans le design au profit de formes rondes (préférence client).

## Menu (dans `src/data/menu.json`)

Transcription complète depuis une photo de la carte physique (3 volets). Le schéma gère 4 types de blocs, car la carte n'est pas qu'une simple liste plat/prix :

- `"type": "simple"` — plat unique avec un prix (la majorité des catégories : salades, viandes, pâtes, poissons, tartares, burgers, fromages, desserts, bières en bouteille, apéritif maison).
- `"type": "tiered"` — un item a plusieurs prix selon le format (vins par 12cl/25cl/46cl/75cl, bières pression par demi/sérieux, eaux par 50cl/1L). Les formats non proposés pour un vin donné sont simplement absents de son objet `prices`.
- `"type": "formula"` — la formule du midi (prix fixe, composants, supplément).
- `"type": "note"` — la suggestion du chef (pas de prix, texte libre).

`build.js` sait déjà générer le HTML et le JSON-LD `schema.org/Menu` pour les catégories `simple` (celles qui ont un équivalent fiable dans le vocabulaire schema.org) ; les catégories `tiered`/`formula`/`note` sont rendues en HTML mais volontairement exclues du JSON-LD, faute de correspondance fiable dans schema.org pour des prix multi-formats.

**Une carte PDF plus complète est attendue du client** — à comparer avec cette transcription pour corrections/compléments avant mise en ligne finale.

## Direction design

### Palette

Extraite par échantillonnage direct des pixels du fichier logo (pas à l'œil) :

| Nom | Hex | Usage prévu |
|---|---|---|
| Crème | `#FAF6EB` | Fond principal |
| Ambré | `#E2751A` | Accent chaud (CTA, prix) |
| Framboise | `#D6455C` | Accent principal (titres, liens) |
| Bordeaux | `#6E2036` | Accent profond (footer, contraste) |
| Encre | `#241318` | Texte (quasi-noir chaud, pas de noir pur) |
| Sauge | `#A7A96E` | Détail floral mineur, très minoritaire |

### Typographie

- Titres : **Bitter** (serif à caractère mais sobre, ne fait pas concurrence au lettrage manuscrit du logo).
- Texte courant / menu / prix : **Work Sans** (très lisible).

### Concept de mise en page

Le client a validé la structure d'un site de référence (« La Famille », restaurant à la Croix-Rousse, thème WordPress Betheme) pour sa mise en page, mais **pas son habillage** (sombre, kaki, ambiance nocturne — à l'opposé du logo clair et coloré). Décision : garder l'ossature structurelle, recolorer entièrement avec la palette ci-dessus.

Éléments structurels à reprendre du site de référence, adaptés :
- Hero plein écran avec une des photos + logo, overlay clair (pas de overlay sombre).
- Bandeau à puces numérotées (« nos engagements ») — bon emplacement pour mettre en avant l'origine des viandes (France/race Limousine…), un vrai argument de confiance et de SEO qu'on n'a nulle part ailleurs sur le site actuel.
- Bloc avis clients, à connecter aux avis Google Business Profile plus tard.
- Galerie photo en grille — actuellement seulement 3-4 photos disponibles, prévoir des blocs de remplissage (couleur/texture/citation) plutôt que des trous.
- Footer 3 colonnes (réseaux sociaux, contact/horaires, logo), fond Bordeaux plutôt que noir.
- Motif signature : la lumière en rayures des photos, réutilisée en séparateurs de section ou dans le traitement photo.

**Cette direction a été validée sur la base de la palette/typo en isolation ; le client attend de voir le rendu réel sur une vraie page avant confirmation définitive.** La première page construite (l'accueil) sert donc aussi de test de cette direction — être prêt à ajuster.

## Sitemap proposé (à valider avec le client)

Accueil, Chez nous, Menu, Réservation, Contact, Mentions légales, Politique de confidentialité — environ 7 pages.

## Approche technique

- HTML/CSS/JS minimal, statique, hébergé sur Strato (remplacement du site existant en FTP au moment du déploiement).
- `build.js` (Node, sans dépendance) : injecte un header/footer commun dans chaque page (`{{HEADER}}`, `{{FOOTER}}`), génère la page menu depuis `src/data/menu.json` (`{{MENU_ITEMS}}`), génère le JSON-LD schema.org Menu (`{{MENU_SCHEMA}}`). Copie `src/css`, `src/js`, `src/images` vers `dist/` tel quel. Sortie 100% HTML statique, aucune dépendance JS runtime pour l'affichage.
- **Pas encore fait** : `src/partials/header.html`, `src/partials/footer.html`, et les pages dans `src/pages/*.html` n'existent pas encore — c'est la prochaine étape de développement, une fois le design validé sur une vraie page.
- Formulaire de contact : à vérifier/refaire (voir section Accès et outils ci-dessus).

## SEO / GEO / Google Business — plan

- `robots.txt` + `sitemap.xml` simples (peu de pages).
- Balises meta par page (title, description, OG, canonical) — le freelance maîtrise déjà cette partie.
- Données structurées schema.org : `Restaurant`/`LocalBusiness` + `Menu` (généré automatiquement depuis `menu.json`).
- Cohérence NAP (nom/adresse/téléphone) entre le site et la fiche Google Business Profile.
- Bonnes pratiques de référencement pour les moteurs IA (GEO) : contenu factuel en texte plutôt qu'uniquement en image, données structurées, cohérence avec les avis/annuaires existants. Le choix d'un site statique aide déjà beaucoup ici (rapide, pas de contenu caché derrière du JS).

## Points ouverts / prochaines actions

1. Résoudre l'accès Strato (probablement un appel au support).
2. Clarifier l'usage réel de Dish vs GloriaFood.
3. Réceptionner et intégrer le PDF de carte complet (comparer avec `menu.json`).
4. Réceptionner la 4e photo (dessert).
5. Rédiger les mentions légales et la politique de confidentialité avec les infos du client.
6. Construire `src/partials/header.html`, `src/partials/footer.html`, `src/css/style.css` (design tokens ci-dessus), et la page d'accueil — première validation visuelle réelle avec le client.
7. Tester le formulaire de contact existant une fois l'accès FTP obtenu.

## Contenu texte déjà collecté (verbatim, réutilisable)

Tagline / accroche (page d'accueil, ancien site) :
> BRASSERIE ET RESTAURANT
> Au cœur du Centre Commercial Auchan Caluire, venez découvrir un lieu haut en couleurs.
> Toute l'équipe est heureuse de vous accueillir

Page contact (ancien site) :
> Vous avez une question ?
> Appelez-nous ! ! !
> Une visite . . .

Aucun texte de présentation détaillé (histoire du lieu, équipe, valeurs) n'existe sur l'ancien site — prévoir un court entretien oral avec le client pour ce contenu (page « Chez nous »), plutôt que d'attendre un document écrit.
