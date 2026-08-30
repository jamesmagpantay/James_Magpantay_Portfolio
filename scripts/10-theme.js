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

  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      set(now() === 'light' ? 'dark' : 'light');
      if(window.sfx) window.sfx.play('click');
    });
  });

  /* each side owns its palette - the flip always restores it */
  document.addEventListener('viewflip', function(e){
    set(e.detail && e.detail.offline ? 'light' : 'dark');
  });

  paint();
})();
