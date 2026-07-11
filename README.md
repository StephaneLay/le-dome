# Site Brasserie Le Dôme — Caluire

Site vitrine 100 % statique. Le contexte projet complet est dans
[PROJECT_BRIEF.md](PROJECT_BRIEF.md).

## Principe

```
src/  = les sources (ce qu'on édite)        ← jamais déployé
dist/ = le site généré (ce qu'on déploie)   ← jamais édité à la main
```

`node build.js` lit `src/`, assemble les pages (header/footer communs, menu
généré depuis `src/data/menu.json`) et écrit le résultat dans `dist/`.
**`dist/` est entièrement effacé et régénéré à chaque build** : toute
modification faite directement dans `dist/` est perdue au build suivant.

Le build tourne uniquement sur le poste de travail — le serveur Strato n'a
besoin ni de Node ni de quoi que ce soit : on lui envoie du HTML/CSS/JS pur.

## Workflow quotidien

1. Modifier les fichiers dans `src/` (pages, CSS, images, menu…)
2. `node build.js`
3. Vérifier en local : ouvrir `dist/index.html` dans un navigateur
   (ou `npx serve dist` pour un rendu strictement identique à la prod)
4. `git add -A && git commit` — l'historique git est le filet de sécurité :
   en cas de problème, on peut toujours revenir à la version précédente
5. Déployer (voir ci-dessous)

## Mettre à jour le menu (le cas le plus fréquent)

1. Éditer **uniquement** `src/data/menu.json` (prix, plats, catégories —
   les 4 types de blocs sont documentés dans PROJECT_BRIEF.md)
2. `node build.js`
   - Si le JSON est invalide (virgule oubliée…), **le build s'arrête avec une
     erreur et ne produit rien de cassé** — c'est voulu : corriger et relancer.
   - Les caractères spéciaux (`&`, `<`, apostrophes…) sont échappés
     automatiquement, on peut écrire les noms de plats naturellement.
   - Les prix doivent rester des nombres (`12.90`), pas des chaînes (`"12.90"`).
3. Contrôler `dist/menu.html` dans le navigateur (le sommaire et le JSON-LD
   schema.org sont régénérés automatiquement)
4. Commit, puis redéployer **au minimum `menu.html`** (le plus simple et le
   plus sûr : redéployer tout `dist/`)

## Déploiement (Strato, SFTP)

- Envoyer **le contenu de `dist/`** (pas le dossier `dist` lui-même, pas
  `src/`, pas `build.js`) à la racine web de l'hébergement.
- ⚠️ **NE JAMAIS TOUCHER `/cnn-immo/`** : c'est un second site vivant
  (cnn-immo.fr, location de vacances) hébergé sur le même pack. Remplacer
  uniquement les fichiers du site Le Dôme (pages HTML de la racine + css,
  js, images, fonts, scripts, phone). Sauvegarde complète du serveur dans
  `legacy/sauvegarde-2026-07-11/`.
- Le serveur est en **PHP 7.2** : `scripts/contact.php` est écrit pour cette
  version (ne pas y introduire de syntaxe PHP 8).
- Domaines : `ledome.fr` → racine `/`, `cnn-immo.fr` → `/cnn-immo/`.

## Avant la mise en ligne — checklist

Chaque point est aussi marqué `TODO` en commentaire dans le fichier concerné :

À demander au client :

- [ ] **Prix du petit déjeuner** : le 7,50 € affiché sur la carte visuelle
      petit déjeuner (`src/pages/menu.html`) est un prix factice — demander
      le vrai prix
- [ ] **Allergènes** : la mention légale « disponible en salle » est en place
      en bas de la page carte — récupérer le document du client pour le
      publier en lien, puis lui générer un QR code pointant vers
      `ledome.fr/menu.html#allergenes` pour ses menus imprimés
- [ ] **Textes « Chez nous »** (`src/pages/chez-nous.html`) : remplacer les
      textes provisoires après l'entretien avec le client
- [x] **Avis clients** : 3 vrais extraits Google en place (Cécile C., Elsa D.,
      Thiago F. 4★), note 4/5 · 284 avis confirmée sur la fiche — montrer au
      client pour information
- [ ] **Mentions légales** : il manque encore le capital social et le n° de
      TVA intracommunautaire (SIRET, forme juridique et directeur de
      publication sont renseignés)
- [ ] **Carte PDF** : comparer avec `src/data/menu.json` et corriger
- [ ] **Photo carpaccio** : confirmer qu'elle correspond bien au plat de la
      carte (frites non mentionnées dans le descriptif)

À faire côté développement :

- [ ] **Activer le certificat SSL/HTTPS** dans le panel Strato : le site
      actuel ne répond qu'en HTTP (vérifié le 11/07/2026) — généralement
      inclus gratuitement dans le pack
- [ ] **Après activation du SSL** : ajouter `<link rel="canonical">`,
      `og:url`, `og:image` (URL absolues en https://www.ledome.fr/) dans
      chaque page + `robots.txt` et `sitemap.xml`
- [ ] **Tester après déploiement** : le formulaire de contact de bout en bout
      (envoi réel → réception sur brasserie.ledome@gmail.com, y compris le
      dossier spam) et le widget Dish (créneaux du midi proposés)
- [ ] **Politique de confidentialité** : durée de conservation des e-mails,
      date de mise à jour
- [ ] **Vérifier l'adresse exacte de STRATO AG** sur le contrat du client
      (mentions légales)
- [ ] **Prix en page d'accueil** : les 3 plats signature ont leur prix en dur
      dans `index.html` — vérifier qu'ils correspondent à `menu.json` à chaque
      mise à jour de carte
- [ ] **Poids des images** : `terrasse.jpg`, `petit-dejeuner.jpg` et les 4
      photos récupérées de l'ancien serveur (`salle-*.jpg`, `terrasse-*.jpg`)
      font 1 à 2 Mo chacune — les redimensionner/compresser avant la mise en
      ligne (vitesse de chargement = SEO)

## Notes techniques

- Polices Bitter et Work Sans auto-hébergées (`src/fonts/`, fontes variables
  woff2) : pas d'appel à Google Fonts, meilleur pour le RGPD et la vitesse.
- L'iframe Google Maps de la page contact dépose des cookies Google (repris
  de l'ancien site, choix assumé) ; c'est couvert par la politique de
  confidentialité. Alternative plus stricte si besoin un jour : image
  statique cliquable qui charge la carte au clic.
- Le JSON-LD `Restaurant` est dans `index.html` ; le JSON-LD `Menu` est
  généré par `build.js` dans `menu.html`.
- **Formulaire de contact** : `src/scripts/contact.php` envoie via `mail()`
  PHP (expéditeur brasserie@ledome.fr — adresse du domaine, requise pour la
  délivrabilité — destinataire brasserie.ledome@gmail.com, Reply-To le
  visiteur), même mécanisme que l'ancien site dont l'envoi est avéré.
  Anti-spam : champ pot de miel invisible. Succès → redirection `merci.html`.
  **Le PHP ne s'exécute ni en préversion locale ni sur GitHub Pages** — le
  formulaire ne se teste que sur le serveur Strato.
- **Réservation** : widget DISH Reservation (même établissement que l'ancien
  site), recoloré via ses paramètres. Réservations = service du midi
  (configuration Dish conservée telle quelle).
