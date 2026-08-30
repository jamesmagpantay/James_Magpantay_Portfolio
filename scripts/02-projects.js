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
  rail.addEventListener('wheel', defer, {passive:true});
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
