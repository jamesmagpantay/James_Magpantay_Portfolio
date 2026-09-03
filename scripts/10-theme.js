/* Theme control. The toggle is a temporary override for the view you are in;
   flipping the view resets it to that view's own palette, and nothing is
   remembered between visits. */
(function(){
  var root = document.documentElement;
  var btns = [].slice.call(document.querySelectorAll('.thm-btn'));
  /* the browser-chrome tint (Android's status/address bar, mainly) used to
     follow the OS's own prefers-color-scheme via a pair of media-scoped
     meta tags - a leftover from before the theme became a property of the
     view rather than the visitor's system setting. That left it free to
     mismatch whatever the page actually rendered (a light off-the-clock
     page with the OS in dark mode still tinted the chrome dark, and vice
     versa - what read as "the page changed color" on its own). Painted
     from the site's own data-theme now, same as everything else here. */
  var metaTheme = document.getElementById('theme-color-meta');

  function now(){ return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function paint(){
    var t = now();
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      b.querySelector('.thm-lab').textContent = t === 'light' ? 'Light' : 'Dark';
    });
    if(metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#EFEDE8' : '#171512');
  }
  function set(t){ root.setAttribute('data-theme', t); paint(); }

  /* the entrance ambiance - only when the polarity actually changed, so
     flipping views while already on the matching theme (a toggle override
     that happened to already match the other view's default) stays
     silent instead of playing the wash twice in a row */
  function ambiance(prev){
    if(now() === prev || !window.sfx) return;
    window.sfx.play(now() === 'light' ? 'morning' : 'night');
  }

  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var prev = now();
      set(prev === 'light' ? 'dark' : 'light');
      if(window.sfx) window.sfx.play('click');
      ambiance(prev);
    });
  });

  /* each side owns its palette - the flip always restores it, and that
     restore is itself a dark<->light change exactly as often as the
     explicit toggle is, so it gets the same ambiance */
  document.addEventListener('viewflip', function(e){
    var prev = now();
    set(e.detail && e.detail.offline ? 'light' : 'dark');
    ambiance(prev);
  });

  paint();
})();
