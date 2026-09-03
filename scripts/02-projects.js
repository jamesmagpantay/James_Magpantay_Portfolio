/* Projects rail: slow auto-drift you can grab, swipe or flick to scrub.
   The card set is duplicated in the markup, so wrapping by one set width
   makes the row endless in both directions. */
(function(){
  var rail = document.querySelector('.proj-rail');
  if(!rail) return;
  var track = rail.querySelector('.proj-grid');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setWidth(){
    var g = parseFloat(getComputedStyle(track).columnGap) || 0;
    return (track.getBoundingClientRect().width + g) / 2;   /* one full set */
  }
  function pxPerSec(){
    var d = parseFloat(getComputedStyle(rail).getPropertyValue('--speed')) || 68;
    return setWidth() / d;
  }

  var span = setWidth(), rate = pxPerSec(), last = 0, idle = 0, held = false;
  addEventListener('resize', function(){ span = setWidth(); rate = pxPerSec(); });

  function wrap(){
    if(rail.scrollLeft >= span) rail.scrollLeft -= span;
    else if(rail.scrollLeft <= 0) rail.scrollLeft += span;
  }
  function frame(t){
    var dt = last ? Math.min((t - last) / 1000, .05) : 0;
    last = t;
    var paused = held || document.body.classList.contains('pm-open') || rail.matches(':hover') || rail.contains(document.activeElement)
                 || performance.now() < idle || reduced.matches;
    if(!paused) rail.scrollLeft += rate * dt;
    wrap();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* any manual scrub wins, then the drift eases back in after a beat */
  function defer(){ idle = performance.now() + 1600; }
  /* a plain vertical mouse wheel over the rail would otherwise get
     auto-converted into a horizontal pan by the browser, since the rail
     only scrolls on the x axis - that traps anyone just trying to scroll
     down the page. Only treat it as "the visitor chose to pan" when the
     gesture is actually horizontal (trackpad swipe or shift+wheel); a
     vertical-dominant wheel is stopped from panning the rail and applied
     to the page scroll instead, not passive since it needs to preventDefault. */
  rail.addEventListener('wheel', function(e){
    if(!e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      /* the object form with an explicit behavior, not the legacy
         scrollBy(x,y) signature - that one silently no-ops here under
         the page's global CSS scroll-behavior:smooth. 'instant' mirrors
         how a native wheel scroll actually feels (each tick lands right
         away, not eased), so passthrough scrolling doesn't feel laggy. */
      scrollBy({top: e.deltaY, left: 0, behavior: 'instant'});
      return;
    }
    defer();
  }, {passive:false});
  rail.addEventListener('touchstart', defer, {passive:true});
  rail.addEventListener('touchmove', defer, {passive:true});

  /* pointer drag for desktop, where the rail would not scroll on its own */
  var x0 = 0, s0 = 0, caught = false;
  rail.addEventListener('pointerdown', function(e){
    /* touch already scrolls natively - only mouse needs a manual drag */
    if(e.pointerType !== 'mouse'){ defer(); return; }
    if(e.button !== 0) return;
    held = true; x0 = e.clientX; s0 = rail.scrollLeft; caught = false;
    /* capture only once a real drag starts - capturing on pointerdown would
       retarget the click and swallow clicks on the cards */
  });
  rail.addEventListener('pointermove', function(e){
    if(!held) return;
    var dx = e.clientX - x0;
    if(Math.abs(dx) > 3 && !caught){
      caught = true;
      rail.classList.add('dragging');
      rail.setPointerCapture(e.pointerId);
    }
    if(caught) rail.scrollLeft = s0 - dx;
  });
  function release(){
    if(!held) return;
    held = false; caught = false; defer();
    rail.classList.remove('dragging');
  }
  rail.addEventListener('pointerup', release);
  rail.addEventListener('pointercancel', release);
})();
