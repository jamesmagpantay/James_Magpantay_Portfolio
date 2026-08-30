/* A two-way shortcut between the two long galleries. Scrolling down through
   the events set offers the way on; scrolling back up through Off the clock
   offers the way back. It follows the direction of travel, so it never points
   the way someone has just decided not to go. */
(function(){
  var btn  = document.getElementById('skipto'),
      lab  = btn && btn.querySelector('span'),
      ev   = document.getElementById('events'),
      life = document.getElementById('life');
  if(!btn || !lab || !ev || !life) return;

  var last = window.scrollY, dir = 1, mode = null;

  function set(next){
    if(next === mode) return;
    mode = next;
    btn.classList.toggle('on', !!next);
    btn.classList.toggle('up', next === 'up');
    btn.setAttribute('aria-hidden', next ? 'false' : 'true');
    btn.tabIndex = next ? 0 : -1;
    if(next){
      var to = next === 'up' ? 'Rooms I show up in' : 'Off the clock';
      lab.textContent = to;
      btn.setAttribute('aria-label', 'Jump to ' + to);
    }
  }

  function update(){
    /* both sections belong to the off-clock view only */
    if(ev.hidden || !ev.offsetParent){ set(null); return; }
    var vh = window.innerHeight || 800,
        e  = ev.getBoundingClientRect(),
        l  = life.getBoundingClientRect();

    if(dir > 0){
      /* heading down, well inside the events gallery, destination not yet near */
      set(e.top < -vh * .55 && e.bottom > vh * 1.15 ? 'down' : null);
    } else {
      /* heading up, well inside Off the clock, with the gallery clear above */
      set(l.top < -vh * .5 && e.bottom < -vh * .15 ? 'up' : null);
    }
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
    (mode === 'up' ? ev : life).scrollIntoView();   /* inherits smooth scrolling */
    set(null);
  });
  btn.tabIndex = -1;
  update();
})();

/* Scroll progress. One handler writes --p on <html>; the bar rule, the
   readout, the rail fill and the skip pill all read it. The rail's dots come
   from whichever nav is showing, so they follow the view without a second list. */
(function(){
  var root = document.documentElement,
      out  = document.getElementById('sprog'),
      rail = document.getElementById('srail');
  var targets = [], dots = [], ticking = false;

  function buildRail(){
    if(!rail) return;
    var nav = document.querySelector('.bar-nav[data-view="' +
              (document.body.classList.contains('offline') ? 'off' : 'pro') + '"]');
    rail.innerHTML = ''; targets = []; dots = [];
    if(!nav) return;
    [].forEach.call(nav.querySelectorAll('a'), function(a){
      var sec = document.querySelector(a.getAttribute('href'));
      if(!sec) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sdot';
      b.setAttribute('aria-label', 'Jump to ' + a.textContent.trim());
      b.innerHTML = '<span>' + a.textContent.trim() + '</span>';
      b.addEventListener('click', function(){
        if(window.sfx) window.sfx.play('click');
        sec.scrollIntoView();
      });
      rail.appendChild(b);
      targets.push(sec); dots.push(b);
    });
  }

  function paint(){
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    root.style.setProperty('--p', p.toFixed(4));
    if(out) out.textContent = Math.round(p * 100) + '%';
    if(rail){
      rail.classList.toggle('on', window.scrollY > 300);
      /* the section whose top has most recently passed the middle of the screen */
      var mid = window.innerHeight * .45, active = -1;
      targets.forEach(function(sec, i){
        if(sec.getBoundingClientRect().top <= mid) active = i;
      });
      dots.forEach(function(d, i){ d.setAttribute('aria-current', i === active ? 'true' : 'false'); });
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
    requestAnimationFrame(function(){ buildRail(); paint(); });
  });
  buildRail();
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
