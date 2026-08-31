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
