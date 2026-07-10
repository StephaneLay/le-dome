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

  // Marque la page courante dans la navigation (le site est statique,
  // on évite de dupliquer cette logique dans chaque page).
  var current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav__list a').forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
