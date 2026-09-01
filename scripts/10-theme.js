/* Theme control. The toggle is a temporary override for the view you are in;
   flipping the view resets it to that view's own palette, and nothing is
   remembered between visits. */
(function(){
  var root = document.documentElement;
  var btns = [].slice.call(document.querySelectorAll('.thm-btn'));

  function now(){ return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function paint(){
    var t = now();
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      b.querySelector('.thm-lab').textContent = t === 'light' ? 'Light' : 'Dark';
    });
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
