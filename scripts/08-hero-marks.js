/* The marks end where the word "Gokongwei" begins in the intro copy. That x
   depends on where the paragraph wraps, so it is measured rather than guessed
   - and re-measured whenever the wrap can change. */
(function(){
  var mark = document.querySelector('.pup-mark'),
      host = document.querySelector('.h-wrap'),
      gk   = document.getElementById('gk'),
      hero = document.querySelector('.hero');
  if(!mark || !host || !gk || !hero) return;

  function place(){
    if(!gk.offsetParent) return;                  /* offline view: copy is hidden */
    var r = gk.getClientRects()[0];               /* first line fragment only */
    if(!r) return;
    var h = host.getBoundingClientRect();
    /* the hero is zoomed, so convert viewport px into the element's own px */
    var z = host.offsetWidth ? h.width / host.offsetWidth : 1;
    var x = (r.left - h.left) / z;
    hero.style.setProperty('--gkx', x.toFixed(1) + 'px');
  }

  place();
  addEventListener('resize', place);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  document.addEventListener('viewflip', function(){ requestAnimationFrame(place); });
})();
