/* Ambient sky burst: a denser round of shooting stars (dark) or a small
   flock of birds (light) plays on a fresh load, a refresh, and right after
   a dark/light mode change - then it settles back to the slow idle cycle
   .sky-fx already runs on its own via CSS. */
(function(){
  var sky = document.getElementById('skyfx');
  if(!sky) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(!reduced){
    var t = null;
    (function(){
      function burst(){
        /* retrigger even if a burst is already mid-flight: drop the class,
           force a reflow, then add it back so the animations restart */
        sky.classList.remove('burst');
        void sky.offsetWidth;
        sky.classList.add('burst');
        clearTimeout(t);
        t = setTimeout(function(){ sky.classList.remove('burst'); }, 4000);
      }
      burst();
      new MutationObserver(burst)
        .observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
    })();
  }

  /* the one place the sky must never draw: on top of the portrait photo.
     .sky-fx is fixed over the whole page, so the photo's viewport position
     (not its document position) is what a mask needs - tracked here and
     written onto the layer as a soft-edged hole, kept in sync with scroll,
     resize, and the fleece<->blazer swap when the view flips. */
  var photo = document.querySelector('.stage-photo');
  if(photo){
    var ticking = false;
    function updateHole(){
      ticking = false;
      var r = photo.getBoundingClientRect();
      if(r.width < 2 || r.height < 2){
        sky.style.setProperty('--hole-rx', '0px');
        sky.style.setProperty('--hole-ry', '0px');
        return;
      }
      sky.style.setProperty('--hole-x', (r.left + r.width / 2) + 'px');
      sky.style.setProperty('--hole-y', (r.top + r.height / 2) + 'px');
      sky.style.setProperty('--hole-rx', (r.width / 2 + 16) + 'px');
      sky.style.setProperty('--hole-ry', (r.height / 2 + 16) + 'px');
    }
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(updateHole);
    }
    updateHole();
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', onScroll);
    document.addEventListener('viewflip', function(){ requestAnimationFrame(updateHole); });
  }
})();
