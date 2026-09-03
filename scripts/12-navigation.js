/* A two-way shortcut across three long sections in a row: events -> life ->
   games. Scrolling down deep inside events or life offers the way on to the
   next one; scrolling back up deep inside events, life, or games offers the
   way back to the TOP OF THAT SAME SECTION, not a jump into the one before
   it - so "Back up" is always a local "top of this gallery" move, symmetric
   with the fill below rather than a second kind of jump. events has no
   upstream section to clear first (it's the start of the chain), so its
   own up-check skips that half of the condition the other two use. It
   follows the direction of travel, so it never points the way someone has
   just decided not to go, and only one button/target is ever live at a
   time since the down/up checks below are each other's mutually exclusive
   scroll ranges.

   The pill's own fill (.skipto::before, driven by --p) is scoped to
   whichever section is actually being read here, not the whole-page
   scroll --p that <html> otherwise carries - set directly on the button
   as an inline custom property, which cascades over the page-level one
   for this element without needing a second CSS variable name. */
(function(){
  var btn   = document.getElementById('skipto'),
      lab   = btn && btn.querySelector('span'),
      ev    = document.getElementById('events'),
      life  = document.getElementById('life'),
      games = document.getElementById('games');
  if(!btn || !lab || !ev || !life || !games) return;

  var last = window.scrollY, dir = 1, mode = null, dest = null, track = null;

  /* 0 at this section's own top, 1 at its own bottom - independent of
     where the section sits in the document as a whole */
  function sectionProgress(sec){
    var vh = window.innerHeight || 800;
    var r = sec.getBoundingClientRect();
    var span = r.height - vh;
    if(span <= 0) return 1;
    return Math.min(1, Math.max(0, -r.top / span));
  }

  function set(next, target, trackSec, label){
    track = trackSec;
    if(next === mode && target === dest) return;
    mode = next; dest = target;
    btn.classList.toggle('on', !!next);
    btn.classList.toggle('up', next === 'up');
    btn.setAttribute('aria-hidden', next ? 'false' : 'true');
    btn.tabIndex = next ? 0 : -1;
    if(next){
      /* the vbadge corner toggle already shows "Off the clock" on screen at
         this scroll depth - keep the visible label generic so the two
         fixed bottom elements never repeat the same words, and save the
         actual destination for the accessible label instead */
      lab.textContent = next === 'up' ? 'Back up' : 'Next';
      btn.setAttribute('aria-label', label);
    }
  }

  function update(){
    /* all three sections belong to the off-clock view only */
    if(ev.hidden || !ev.offsetParent){ set(null); return; }
    var vh = window.innerHeight || 800,
        e  = ev.getBoundingClientRect(),
        l  = life.getBoundingClientRect(),
        g  = games.getBoundingClientRect();

    if(dir > 0){
      /* heading down, well inside events, destination (life) not yet near */
      if(e.top < -vh * .55 && e.bottom > vh * 1.15){ set('down', life, ev, 'Jump to Off the clock'); }
      /* heading down, well inside life, destination (games) not yet near */
      else if(l.top < -vh * .55 && l.bottom > vh * 1.15){ set('down', games, life, 'Jump to Games'); }
      else { set(null); return; }
    } else {
      /* heading up, well inside games (top AND bottom checked, so this
         stops firing once movies has been scrolled past games too - the
         top check alone stays true forever past that point), with life
         clear above - back to the top of games itself, not a jump into
         life */
      if(g.top < -vh * .5 && g.bottom > vh * .15 && l.bottom < -vh * .15){ set('up', games, games, 'Back to top of Games'); }
      /* heading up, well inside life (same top+bottom bracket as games
         above, for the same reason: stops this firing once games itself
         has been scrolled past), with events clear above - back to the
         top of life itself, not a jump into events */
      else if(l.top < -vh * .5 && l.bottom > vh * .15 && e.bottom < -vh * .15){ set('up', life, life, 'Back to top of Off the clock'); }
      /* heading up, well inside events itself - back to the top of events.
         No upstream section to clear first here (events is the start of
         the chain), so this is just the same top+bottom bracket alone. */
      else if(e.top < -vh * .5 && e.bottom > vh * .15){ set('up', ev, ev, 'Back to top of Rooms I show up in'); }
      else { set(null); return; }
    }
    btn.style.setProperty('--p', sectionProgress(track).toFixed(4));
  }

  addEventListener('scroll', function(){
    var y = window.scrollY;
    if(Math.abs(y - last) > 6){        /* ignore jitter */
      dir = y > last ? 1 : -1;
      last = y;
    }
    update();
  }, {passive:true});
  addEventListener('resize', update);
  document.addEventListener('viewflip', function(){ requestAnimationFrame(update); });

  btn.addEventListener('click', function(){
    if(window.sfx) window.sfx.play('click');
    if(dest) dest.scrollIntoView();   /* inherits smooth scrolling */
    set(null);
  });
  btn.tabIndex = -1;
  update();
})();

/* Scroll progress. One handler writes --p on <html>; the bar rule, the
   readout and the skip pill all read it. The desktop bar nav's sliding
   highlight - which section is current - comes from the same handler,
   built fresh against whichever nav is showing so it follows the view
   without a second list. */
(function(){
  var root = document.documentElement,
      out  = document.getElementById('sprog');
  var links = [], targets = [], glow = null, ticking = false;

  function buildNav(){
    var nav = document.querySelector('.bar-nav[data-view="' +
              (document.body.classList.contains('offline') ? 'off' : 'pro') + '"]');
    links = []; targets = []; glow = null;
    if(!nav) return;
    glow = nav.querySelector('.bar-nav-glow');
    [].forEach.call(nav.querySelectorAll('a'), function(a){
      var sec = document.querySelector(a.getAttribute('href'));
      if(!sec) return;
      links.push(a); targets.push(sec);
    });
  }

  function paint(){
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    root.style.setProperty('--p', p.toFixed(4));
    if(out) out.textContent = Math.round(p * 100) + '%';

    /* the section whose top has most recently passed the middle of the screen */
    var mid = window.innerHeight * .45, active = -1;
    targets.forEach(function(sec, i){
      if(sec.getBoundingClientRect().top <= mid) active = i;
    });
    links.forEach(function(a, i){ a.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    if(glow){
      if(active === -1){
        glow.classList.remove('on');
      } else {
        var a = links[active];
        glow.classList.add('on');
        glow.style.transform = 'translateX(' + a.offsetLeft + 'px)';
        glow.style.width = a.offsetWidth + 'px';
      }
    }
  }
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll);
  document.addEventListener('viewflip', function(){
    requestAnimationFrame(function(){ buildNav(); paint(); });
  });
  buildNav();
  paint();
})();

/* Mobile menu. Below 860px the bar's nav and its control pills have nowhere
   to go, so they move in here: the sections of whichever view is showing,
   the view flip, and the theme/music toggles. The links are cloned from the
   nav that is currently visible, so there is still one list, not three. */
(function(){
  var btn   = document.getElementById('menubtn'),
      sheet = document.getElementById('msheet'),
      nav   = document.getElementById('msheet-nav'),
      close = document.getElementById('msheetclose'),
      flip  = document.getElementById('msheetflip');
  if(!btn || !sheet || !nav) return;
  var last = null;

  function build(){
    var src = document.querySelector('.bar-nav[data-view="' +
              (document.body.classList.contains('offline') ? 'off' : 'pro') + '"]');
    nav.innerHTML = '';
    if(!src) return;
    [].forEach.call(src.querySelectorAll('a'), function(a){
      var c = document.createElement('a');
      c.href = a.getAttribute('href');
      c.textContent = a.textContent.trim();
      c.addEventListener('click', function(){ hide(); });
      nav.appendChild(c);
    });
  }

  /* keep tabbing inside the sheet while it is the thing on screen */
  function trap(e){
    if(e.key === 'Escape'){ e.preventDefault(); hide(); return; }
    if(e.key !== 'Tab') return;
    var f = sheet.querySelectorAll('a[href], button:not([disabled])');
    if(!f.length) return;
    var first = f[0], lastEl = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); lastEl.focus(); }
    else if(!e.shiftKey && document.activeElement === lastEl){ e.preventDefault(); first.focus(); }
  }

  function show(){
    last = document.activeElement;
    build();
    sheet.hidden = false;
    document.body.classList.add('msheet-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.addEventListener('keydown', trap);
    close.focus();
  }
  function hide(){
    if(sheet.hidden) return;
    sheet.hidden = true;
    document.body.classList.remove('msheet-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.removeEventListener('keydown', trap);
    if(last && last.focus) last.focus();
  }

  btn.addEventListener('click', function(){ sheet.hidden ? show() : hide(); });
  close.addEventListener('click', hide);
  if(flip) flip.addEventListener('click', function(){
    hide();
    (window.flipView || function(){ document.getElementById('flip').click(); })();
  });
  /* the sections changed under it - and the flip already sent us to the top */
  document.addEventListener('viewflip', function(){ hide(); build(); });
  /* back on a wide screen the bar has its own nav again */
  addEventListener('resize', function(){ if(innerWidth > 860) hide(); });
})();

/* Swipe to flip the view, on touch only - a mouse never fires these events,
   so this never competes with anything on desktop. Live from the very top
   of the page, not just once the bar's own flip control appears. Lands the
   same place the button/badge flip does - back at the top of the other
   view - rather than trying to guess a matched spot in a page with an
   entirely different section structure. */
(function(){
  var EDGE = 24;       /* px from either screen edge - the OS's own back-swipe territory */
  var MIN_DX = 70;      /* px of travel before this counts as a swipe, not a tap */
  var MAX_MS = 700;     /* slower than this reads as a drag, not a flick */
  var SKEW = 1.5;        /* how much more horizontal than vertical it has to be */
  /* left alone entirely - its own horizontal drag, and anything full-screen
     stacked over the page where a page-wide flip would be a surprise */
  var EXEMPT = '.proj-rail, .msheet, .pa, .lb, .pm, [role="dialog"]';

  var x0 = 0, y0 = 0, t0 = 0, live = false;

  addEventListener('touchstart', function(e){
    var t = e.touches[0];
    live = t.clientX > EDGE && t.clientX < innerWidth - EDGE &&
           !(e.target.closest && e.target.closest(EXEMPT));
    x0 = t.clientX; y0 = t.clientY; t0 = performance.now();
  }, {passive:true});

  addEventListener('touchend', function(e){
    if(!live) return;
    live = false;
    var t = e.changedTouches[0],
        dx = t.clientX - x0, dy = t.clientY - y0,
        dt = performance.now() - t0;
    if(dt > MAX_MS) return;
    if(Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * SKEW) return;
    (window.flipView || function(){ document.getElementById('flip').click(); })();
  }, {passive:true});
})();

/* The footer tile replays its entrance every time it crosses into view -
   toggled both ways rather than a one-shot, so scrolling back down to it
   later still finds it arriving. */
(function(){
  var el = document.getElementById('contact');
  if(!el) return;
  new IntersectionObserver(function(e){
    el.classList.toggle('on', e[0].isIntersecting);
  }, {rootMargin:'0px 0px -10% 0px'}).observe(el);
})();
