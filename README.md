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

## Déploiement (Strato, FTP)

- Envoyer **le contenu de `dist/`** (pas le dossier `dist` lui-même, pas
  `src/`, pas `build.js`) à la racine web de l'hébergement.
- Envoyer l'intégralité de `dist/` évite les incohérences entre une page
  régénérée et un header/footer commun qui aurait changé.
- Accès FTP Strato : toujours en attente de résolution (voir brief, point
  ouvert n° 1).

## Avant la mise en ligne — checklist

Chaque point est aussi marqué `TODO` en commentaire dans le fichier concerné :

- [ ] **Avis clients** (`src/pages/index.html`) : remplacer les 3 avis
      provisoires par de vrais avis Google Business Profile
- [ ] **Textes « Chez nous »** (`src/pages/chez-nous.html`) : remplacer les
      textes provisoires après l'entretien avec le client
- [ ] **Widget GloriaFood** (`src/pages/reservation.html`) : intégrer le code
      cuid/ruid de l'ancien site ; clarifier Dish vs GloriaFood avant
- [ ] **Formulaire de contact** (`src/pages/contact.html`) : écrire
      `scripts/contact.php` (envoi mail, PHP supporté par Strato) et le
      déployer à côté du site
- [ ] **Mentions légales** : compléter SIRET, forme juridique, gérant ;
      vérifier l'adresse exacte de STRATO AG
- [ ] **Politique de confidentialité** : durée de conservation des e-mails,
      date de mise à jour
- [ ] **Réseaux sociaux** (`src/partials/footer.html`) : vraies URL Facebook /
      Instagram (ou retirer les liens)
- [ ] **Domaine** : une fois confirmé, ajouter `<link rel="canonical">`,
      `og:url`, `og:image` (URL absolues) dans chaque page + `robots.txt` et
      `sitemap.xml`
- [ ] **Carte PDF** : comparer avec `src/data/menu.json` et corriger
- [ ] **Photo carpaccio** : confirmer avec le client qu'elle correspond bien
      au plat de la carte (frites non mentionnées dans le descriptif)
- [ ] **Prix en page d'accueil** : les 3 plats signature ont leur prix en dur
      dans `index.html` — vérifier qu'ils correspondent à `menu.json` à chaque
      mise à jour de carte

## Notes techniques

- Polices Bitter et Work Sans auto-hébergées (`src/fonts/`, fontes variables
  woff2) : pas d'appel à Google Fonts, meilleur pour le RGPD et la vitesse.
- L'iframe Google Maps de la page contact dépose des cookies Google (repris
  de l'ancien site, choix assumé) ; c'est couvert par la politique de
  confidentialité. Alternative plus stricte si besoin un jour : image
  statique cliquable qui charge la carte au clic.
- Le JSON-LD `Restaurant` est dans `index.html` ; le JSON-LD `Menu` est
  généré par `build.js` dans `menu.html`.
