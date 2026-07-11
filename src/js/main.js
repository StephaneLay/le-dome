// JS minimal, uniquement du confort de navigation :
// le site reste entièrement lisible sans JavaScript.

(function () {
  // Menu burger (mobile)
  var burger = document.querySelector('.site-header__burger');
  var nav = document.getElementById('site-nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Affiche le message d'erreur renvoyé par scripts/contact.php
  // (redirection vers contact.html?erreur=champs|envoi).
  var erreurBox = document.getElementById('form-erreur');
  if (erreurBox && /[?&]erreur=/.test(location.search)) {
    erreurBox.hidden = false;
  }

  // Apparition douce des blocs au défilement. La classe .reveal n'est posée
  // qu'ici : sans JavaScript ou avec « réduire les animations », tout le
  // contenu reste simplement visible.
  var reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduireAnimations && 'IntersectionObserver' in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add('is-visible');
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: '0px 0px -60px', threshold: 0.05 });

    // Blocs isolés : apparition simple.
    document.querySelectorAll(
      '.hero__panel, .intro, .dishes__intro, .about-block, .menu-category, ' +
      '.booking__phone, .booking__widget, .booking__groups, ' +
      '.contact-grid > div, .contact-map, ' +
      '.reviews h2, .practical h2, .commitments h2, .galerie h2, .legal > *'
    ).forEach(function (bloc) {
      bloc.classList.add('reveal');
      observateur.observe(bloc);
    });

    // Grilles : les enfants apparaissent en léger décalé.
    document.querySelectorAll(
      '.dishes__grid, .reviews__grid, .commitments__grid, .gallery, ' +
      '.practical__grid, .services__grid'
    ).forEach(function (grille) {
      Array.prototype.forEach.call(grille.children, function (enfant, i) {
        enfant.classList.add('reveal');
        enfant.style.setProperty('--reveal-delay', Math.min(i * 70, 420) + 'ms');
        observateur.observe(enfant);
      });
    });
  }

  // Marque la page courante dans la navigation (le site est statique,
  // on évite de dupliquer cette logique dans chaque page).
  var current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav__list a').forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
