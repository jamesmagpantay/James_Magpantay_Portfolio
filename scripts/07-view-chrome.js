/* View chrome: the bar and badge appear once the hero is gone, name the
   current view, and put the flip back within reach at any scroll depth. */
(function(){
  var bar=document.getElementById('bar'), badge=document.getElementById('vbadge'),
      hero=document.querySelector('.hero');
  if(!bar||!hero) return;

  new IntersectionObserver(function(e){
    var gone = !e[0].isIntersecting;
    bar.classList.toggle('on', gone);
    badge.classList.toggle('on', gone);
  }, {rootMargin:'-70px 0px 0px 0px'}).observe(hero);

  function flip(){
    /* re-run the stagger on the incoming links, and pulse the bar */
    bar.classList.add('flipping'); badge.classList.add('flipping');
    setTimeout(function(){
      bar.classList.remove('flipping'); badge.classList.remove('flipping');
    }, 900);
    (window.flipView || function(){ document.getElementById('hwrap').click(); })();
  }
  var totop = document.getElementById('totop');
  if(totop) totop.addEventListener('click', function(){ window.scrollTo(0, 0); });
  document.getElementById('barflip').addEventListener('click', flip);
  badge.addEventListener('click', flip);
})();

/* one-time nudge pointing at the badge, mobile only - shown once ever per
   browser, and only if the flip has genuinely never been used before
   (checked against 'viewflip', which fires regardless of which of the
   three flip controls - the badge itself, the header pill, or the mobile
   menu's own flip button - actually triggered it, so discovering the
   feature any other way still cancels this). Mirrors the pattern already
   built for Bean's own "try dragging me" hint (16-assistant.js). */
(function(){
  if(!matchMedia('(max-width:860px)').matches) return;
  var el = document.getElementById('vhint');
  if(!el) return;
  var used, shown;
  try{
    used = localStorage.getItem('vbadge-used');
    shown = localStorage.getItem('vhint-shown');
  }catch(err){}
  if(used || shown) return;

  var hintT = null;
  document.addEventListener('viewflip', function(){
    clearTimeout(hintT);
    hide();
    try{ localStorage.setItem('vbadge-used', '1'); }catch(err){}
  });

  function show(){
    requestAnimationFrame(function(){ el.classList.add('on'); });
    try{ localStorage.setItem('vhint-shown', '1'); }catch(err){}
    var t = setTimeout(hide, 8000);
    el.querySelector('.vhint-close').addEventListener('click', function(){ clearTimeout(t); hide(); });
  }
  function hide(){ el.classList.remove('on'); }
  /* after the intro curtain has actually lifted, not underneath it - same
     idea as the sound heads-up in 09-sound.js, just a longer settle so it
     doesn't compete with the page's own entrance */
  function land(){ hintT = setTimeout(show, 6000); }
  document.addEventListener('preready', land);
  if(window.__preDone) land();
})();

/* View-flip announcement: the flip returns you to the top of a page whose
   whole body has been replaced - this tells screen readers, briefly, what
   changed and that there is more of it below. (The visual arrow that used
   to accompany this has been replaced by the "scroll" hint under the CV
   buttons in the stage photo.) */
(function(){
  var live = document.getElementById('scue-live');
  if(!live) return;

  document.addEventListener('viewflip', function(e){
    var off = e.detail.offline;
    /* name the view you just landed in, and count what is waiting below it */
    var nav = document.querySelector('.hero nav[data-view="' + (off ? 'off' : 'pro') + '"]');
    var n = nav ? nav.querySelectorAll('a').length : 0;
    live.textContent = (off ? 'Off the clock' : 'Security profile') + ' loaded - ' +
      n + (n === 1 ? ' section' : ' sections') + ' below. Scroll down.';

    lead(off);
  });

  /* Layer 3: hand the eye something moving just under the hero. The heading of
     the first swapped section is held back, then released when it reaches the
     viewport - with a failsafe so it can never stay hidden. */
  var armed = null, leadIO = null, leadT = null;
  function play(){
    if(!armed) return;
    var el = armed; armed = null;
    clearTimeout(leadT);
    if(leadIO){ leadIO.disconnect(); leadIO = null; }
    el.classList.remove('lead-arm');
    el.classList.add('lead-go');
    setTimeout(function(){ el.classList.remove('lead-go'); }, 1000);
  }
  function lead(off){
    play();                                   /* release any previous hold */
    var sec = document.querySelector('section.sec[data-view="' + (off ? 'off' : 'pro') + '"]');
    if(!sec || !sec.querySelector('.sec-head h2')) return;
    armed = sec;
    sec.classList.remove('lead-go');
    sec.classList.add('lead-arm');
    leadT = setTimeout(play, 4000);           /* failsafe */
    if(!('IntersectionObserver' in window)) return;
    leadIO = new IntersectionObserver(function(e){
      if(e[0].isIntersecting) play();
    }, {rootMargin:'0px 0px -12% 0px'});
    leadIO.observe(sec);
  }
})();
