/* Interface sound. Everything is synthesised in the Web Audio API - no files to
   host, and every character of it is a number you can tune. Five sounds, off by
   default, remembered per visitor. */
(function(){
  var KEY = 'sfx-on';
  var btns = [].slice.call(document.querySelectorAll('.sfx-btn'));
  if(!btns.length) return;
  /* Reduced-motion visitors still get silence and no control. Touch devices
     no longer do: the hover sounds cannot fire without a pointer, but every
     click, view flip, row and modal in the set is wired to a real gesture,
     which is most of it. The first tap on the toggle is also the gesture
     that unlocks the AudioContext, so it works from the very first press. */
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    btns.forEach(function(b){ b.hidden = true; }); return;
  }

  var on = false;
  try{ on = localStorage.getItem(KEY) === '1'; }catch(e){}

  var ctx = null, master = null, noise = null;
  function boot(){
    if(ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.30;
    /* one lowpass across everything - this is what makes the set read as
       "creamy" rather than sharp, however each sound is built */
    var warm = ctx.createBiquadFilter();
    warm.type = 'lowpass'; warm.frequency.value = 5400; warm.Q.value = .7;
    master.connect(warm); warm.connect(ctx.destination);
    var n = Math.floor(ctx.sampleRate * 0.5);
    noise = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = noise.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  /* ±3% detune per hit - identical repeats are what make UI sound irritating */
  function vary(){ return 1 + (Math.random() * .06 - .03); }
  function env(g, t, peak, dur){
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + .004);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  }
  /* No oscillators anywhere below this line. A keypress is broadband noise
     exciting two resonances in a plastic case: a low one you feel as the
     "thock" and a mid one that gives it body. A pitched sine sweeping down
     is a kick drum, which is exactly what it sounded like. */
  function thock(o, at){
    var t = (at || ctx.currentTime),
        src = ctx.createBufferSource(),
        hp  = ctx.createBiquadFilter(),
        stem= ctx.createBiquadFilter(), sg = ctx.createGain(),
        r1  = ctx.createBiquadFilter(), g1 = ctx.createGain(),
        r2  = ctx.createBiquadFilter(), g2 = ctx.createGain();
    src.buffer = noise;
    hp.type = 'highpass'; hp.frequency.value = 90;

    /* the stem: contact transient, gone in a few milliseconds */
    stem.type = 'lowpass'; stem.frequency.value = o.cut * vary(); stem.Q.value = .7;
    sg.gain.setValueAtTime(.0001, t);
    sg.gain.exponentialRampToValueAtTime(o.peak * .55, t + .0015);
    sg.gain.exponentialRampToValueAtTime(.0001, t + .011);

    /* the case: two damped resonances, no fundamental to hear as a note */
    r1.type = 'bandpass'; r1.frequency.value = o.r1 * vary(); r1.Q.value = 7.5;
    g1.gain.setValueAtTime(.0001, t);
    g1.gain.exponentialRampToValueAtTime(o.peak, t + .004);
    g1.gain.exponentialRampToValueAtTime(.0001, t + o.dur);

    r2.type = 'bandpass'; r2.frequency.value = o.r2 * vary(); r2.Q.value = 4.5;
    g2.gain.setValueAtTime(.0001, t);
    g2.gain.exponentialRampToValueAtTime(o.peak * .5, t + .003);
    g2.gain.exponentialRampToValueAtTime(.0001, t + o.dur * .7);

    src.connect(hp);
    hp.connect(stem); stem.connect(sg); sg.connect(master);
    hp.connect(r1); r1.connect(g1); g1.connect(master);
    hp.connect(r2); r2.connect(g2); g2.connect(master);
    /* a different slice of noise each time, so no two hits are identical */
    src.start(t, Math.random() * .4); src.stop(t + o.dur + .05);
  }

  /* the headline gets its own gesture: a resonance opening upward, like a
     panel sliding back. Same noise source, so it belongs to the family. */
  function shimmer(dur, f0, f1, peak){
    var t = ctx.currentTime, s = ctx.createBufferSource(),
        bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true;
    bp.type = 'bandpass'; bp.Q.value = 6;
    bp.frequency.setValueAtTime(f0 * vary(), t);
    bp.frequency.exponentialRampToValueAtTime(f1 * vary(), t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * .34);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(master);
    s.start(t, Math.random() * .4); s.stop(t + dur + .05);
  }

  /* five keys off the same board - alphas differ slightly, as they do in life */
  var KEYS = [
    {cut:3600, r1:205, r2:820,  dur:.055, peak:.90},
    {cut:3300, r1:232, r2:940,  dur:.050, peak:.85},
    {cut:3900, r1:188, r2:760,  dur:.062, peak:.95},
    {cut:3450, r1:246, r2:1050, dur:.047, peak:.80},
    {cut:3750, r1:214, r2:880,  dur:.058, peak:.90}
  ];
  function pick(a){ return a[(Math.random() * a.length) | 0]; }

  var lib = {
    tick:  function(){ thock({cut:4200, r1:290, r2:1250, dur:.020, peak:.20}); },
    /* a detent under the thumb. 15ms and a peak a tenth of a click - it has
       to survive being heard a few times a second without becoming the thing
       you notice. f is how hard the page is being moved: a flick is brighter
       and a little louder than a nudge. */
    scroll:function(f){
      f = f || 0;
      thock({cut:4400 + f * 1000, r1:295 + f * 80, r2:1300 + f * 380,
             dur:.015, peak:.055 + f * .075});
    },
    key:   function(){ thock(pick(KEYS)); },
    keyup: function(){ thock({cut:5200, r1:330, r2:1500, dur:.022, peak:.26}); },
    click: function(){ thock(pick(KEYS)); },
    big:   function(){ thock({cut:3000, r1:165, r2:640, dur:.085, peak:.95}); },
    space: function(){ thock({cut:2600, r1:132, r2:480, dur:.115, peak:1.0}); },
    /* two-stage: the press, then a lighter one as it settles open */
    open:  function(){ thock(pick(KEYS)); thock({cut:4000, r1:300, r2:1100, dur:.035, peak:.34}, ctx.currentTime + .05); },
    close: function(){ thock({cut:3000, r1:190, r2:700, dur:.070, peak:.75}); },
    land:  function(){ thock({cut:2400, r1:124, r2:450, dur:.130, peak:.95}); },
    /* the headline, per side: cooler for the security name, warmer for his own */
    revealPro: function(){ thock({cut:2500, r1:158, r2:600, dur:.10, peak:.46}); shimmer(.42, 430, 2800, .17); },
    revealOff: function(){ thock({cut:2100, r1:132, r2:470, dur:.12, peak:.46}); shimmer(.50, 320, 1700, .19); },
    flip:  function(){ thock({cut:2600, r1:132, r2:480, dur:.115, peak:1.0});
                       thock({cut:3400, r1:240, r2:900, dur:.045, peak:.40}, ctx.currentTime + .075); }
  };
  function play(name, arg){
    if(!on) return;
    boot();
    if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    try{ if(lib[name]) lib[name](arg); }catch(e){}
  }
  window.sfx = { play: play, isOn: function(){ return on; } };

  /* ---- the control ---- */
  function paint(){
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.sfx-lab').textContent = on ? 'Sound on' : 'Sound off';
    });
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      /* never let a toggle bubble into a parent that acts on clicks */
      e.stopPropagation();
      on = !on;
      try{ localStorage.setItem(KEY, on ? '1' : '0'); }catch(e){}
      paint();
      if(on) play('click');
    });
  });
  paint();

  /* A stored "on" cannot make a sound by itself: no browser starts audio
     before the visitor has interacted with the page, so after a refresh the
     toggle sat there claiming to be on while nothing played.

     Waiting for play() to be reached is not enough either. On a pointer
     device the first thing that reaches it is a hover, and hover events do
     not grant user activation - so boot() built the context in a suspended
     state and resume() was ignored. It only came back on the next real
     click. Arm it on the first genuinely activating event instead. */
  if(on){
    (function(){
      var EVS = ['pointerdown', 'keydown', 'touchend'];
      function unlock(){
        EVS.forEach(function(e){ removeEventListener(e, unlock, true); });
        boot();
        if(ctx && ctx.state === 'suspended') ctx.resume();
      }
      EVS.forEach(function(e){ addEventListener(e, unlock, true); });
    })();
  }

  /* ---- wiring ---- */
  var lastTick = 0;
  function hover(el){
    el.addEventListener('pointerenter', function(){
      var n = performance.now();
      if(n - lastTick < 80) return;        /* or sweeping the nav machine-guns */
      lastTick = n;
      play('tick');
    });
  }
  var HOVER = '.bar-nav a, .hero-top nav a, .git, .sticker, .bar-flip, .vbadge, .sfx-btn, .xp-row, .xp-cue, .proj, .tk, .ledger .row, .bar-brand, .f-links a, .dl a, .ph';
  document.querySelectorAll(HOVER).forEach(hover);
  var CLICK = '.git, .sticker, .bar-nav a, .hero-top nav a, .proj, .tk, .ledger .row, .f-links a, .dl a, .ph, .brand, .bar-brand';
  document.querySelectorAll(CLICK)
    .forEach(function(el){ el.addEventListener('click', function(){ play('click'); }); });
  /* the headline CTAs and project cards get the heavier key */
  document.querySelectorAll('.proj, .dl a')
    .forEach(function(el){ el.addEventListener('click', function(){ play('big'); }); });


  /* ---- the headline ---- */
  var hw = document.getElementById('hwrap'), hwT = null, hwLast = 0;
  if(hw){
    hw.addEventListener('pointerenter', function(){
      clearTimeout(hwT);
      hwT = setTimeout(function(){
        var now = performance.now();
        if(now - hwLast < 900) return;        /* no retrigger on a wobble */
        hwLast = now;
        play(document.body.classList.contains('offline') ? 'revealOff' : 'revealPro');
      }, 90);                                  /* dwell: passing over is silent */
    });
    hw.addEventListener('pointerleave', function(){ clearTimeout(hwT); });
  }

  /* ---- the marks answer to the cursor ---- */
  document.querySelectorAll('.pup-mark img').forEach(function(el){
    el.addEventListener('pointerenter', function(){ play('key'); });
  });

  /* ---- "Hire the candidate": a roll that accelerates while you hover, and
     the slam when you commit. The roll is dwell-gated so sweeping past the
     link never starts it. ---- */
  var rollT = null, dwellT = null, hits = 0;
  var ROLL = 15;
  function rollStop(){
    clearTimeout(dwellT); clearTimeout(rollT);
    dwellT = rollT = null;
  }
  function rollStart(){
    if(!on) return;
    boot(); if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    rollStop();
    hits = 0;
    dwellT = setTimeout(function step(){
      if(hits >= ROLL){ rollT = null; return; }   /* holds at the top */
      var f = hits / ROLL;
      thock({
        cut:  3200 + f * 1000,
        r1:   200 + f * 95,
        r2:   800 + f * 520,
        dur:  .046,
        peak: .22 + f * .55
      });
      hits++;
      rollT = setTimeout(step, 112 - f * 74);     /* 112ms -> 38ms */
    }, 130);
  }
  function climax(){
    document.dispatchEvent(new CustomEvent('sfxclimax'));
    if(!on) return;
    boot(); if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    rollStop();
    var t = ctx.currentTime;
    thock({cut:2200, r1:96,  r2:370,  dur:.30, peak:1.0});
    thock({cut:3800, r1:270, r2:1250, dur:.09, peak:.55}, t + .012);
    thock({cut:2800, r1:150, r2:600,  dur:.19, peak:.50}, t + .034);
  }
  document.querySelectorAll('.hero-cta a, .big a, .sec-cta a').forEach(function(el){
    el.addEventListener('pointerenter', rollStart);
    el.addEventListener('pointerleave', rollStop);
    el.addEventListener('click', climax);
  });

  /* ---- the page under the thumb ----
     Scroll fires tens of times a second, so this cannot be "a sound on
     scroll" - it is a detent: one tick per fixed distance travelled, with a
     hard floor on how close together two of them may land. Distance alone
     would buzz on a fast flick; time alone would tick while nothing moved.
     Both together give a run of clicks that tracks the page, and silence the
     moment it stops. Works the same on a wheel, a trackpad and a thumb. */
  (function(){
    var STEP = 190,   /* px of travel between ticks */
        GAP  = 110,   /* ms floor between two ticks - caps a flick at ~9/sec */
        JUMP = 600;   /* px: past this it is a jump, not a scroll */
    var last = window.scrollY || 0, acc = 0, at = 0;
    addEventListener('scroll', function(){
      if(!on) return;
      var y = window.scrollY, d = Math.abs(y - last);
      last = y;
      /* a rail dot, a "back to top", the scroll after a view flip - those are
         travel the visitor did not make, and they should not sound like it */
      if(d > JUMP){ acc = 0; return; }
      acc += d;
      if(acc < STEP) return;
      var now = performance.now();
      /* hold the charge rather than dropping it, so the next tick lands as
         soon as the floor allows instead of needing another full STEP */
      if(now - at < GAP){ acc = STEP; return; }
      acc = 0; at = now;
      play('scroll', Math.min(1, d / 60));
    }, {passive:true});
  })();

  /* the page types back - held keys are ignored so a repeat never machine-guns */
  addEventListener('keydown', function(e){
    if(e.repeat) return;
    if(e.code === 'Space') play('space');
    else if(e.code === 'Enter' || e.code === 'Backspace' || e.code === 'Tab') play('big');
    else play('key');
  });
  addEventListener('keyup', function(){ play('keyup'); });

  document.addEventListener('viewflip', function(){ play('flip'); });

  document.querySelectorAll('.xp-row').forEach(function(row){
    row.addEventListener('click', function(){
      requestAnimationFrame(function(){
        play(row.getAttribute('aria-expanded') === 'true' ? 'open' : 'close');
      });
    });
  });

  ['lb','pm','pa','xa','ga'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    new MutationObserver(function(){
      play(el.classList.contains('on') ? 'open' : 'close');
    }).observe(el, {attributes:true, attributeFilter:['class']});
  });

  /* the arrow lands after the flip sweep has finished, not on top of it */
  var cue = document.getElementById('scue');
  if(cue) new MutationObserver(function(){
    if(cue.classList.contains('on')) setTimeout(function(){ play('land'); }, 420);
  }).observe(cue, {attributes:true, attributeFilter:['class']});
})();

/* Soundtrack. Two loops, one per view: taut and atmospheric on the security
   side, warm and jazzy off the clock. Off by default, lazy-loaded, faded
   rather than cut, and ducked under the CTA slam. */
(function(){
  var KEY = 'music-on';
  var btns = [].slice.call(document.querySelectorAll('.mus-btn'));
  if(!btns.length) return;

  /* ogg where the browser takes it (a third the size), mp3 everywhere else */
  var SRC = {
    pro: ['audio/profile.mp3'],
    off: ['audio/offclock.ogg', 'audio/offclock.mp3']
  };
  function bestSrc(list){
    var probe = document.createElement('audio');
    for(var i = 0; i < list.length; i++){
      var t = /\.ogg$/.test(list[i]) ? 'audio/ogg; codecs=vorbis' : 'audio/mpeg';
      if(probe.canPlayType(t)) return list[i];
    }
    return list[list.length - 1];
  }
  var FADE_IN = 1500, FADE_OUT = 1000, XFADE = 800;
  /* The music sits much closer to the interface sounds on a phone than it
     does on a desktop: the speaker has less range, and on touch the hover
     half of the sound set never fires at all - so the music ends up carrying
     the mix on its own. Halve it where the site is in its mobile layout.
     Matched to the same 860px the layout uses, and live, so rotating the
     phone or resizing a window re-levels rather than waiting for a reload. */
  var MOBILE = matchMedia('(max-width:860px)');
  function vol(){ return MOBILE.matches ? 0.05 : 0.11; }

  var el = {}, on = false, cur = null, ducked = 0, dead = false;

  function view(){ return document.body.classList.contains('offline') ? 'off' : 'pro'; }
  function make(k){
    if(el[k]) return el[k];
    var a = new Audio();
    a.loop = true; a.preload = 'auto'; a.volume = 0;
    a.addEventListener('error', function(){
      /* a missing or unplayable file should not leave the toggle lying */
      dead = true; on = false; paint();
    });
    a.src = bestSrc(SRC[k]);              /* set last: nothing loads until now */
    el[k] = a;
    return a;
  }
  function target(){ return vol() * (ducked > 0 ? .4 : 1); }

  function fade(a, to, ms, done){
    if(a._f){ cancelAnimationFrame(a._f); a._f = null; }
    var from = a.volume, t0 = performance.now();
    (function step(t){
      var k = ms > 0 ? Math.min(1, (t - t0) / ms) : 1;
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if(k < 1) a._f = requestAnimationFrame(step);
      else { a._f = null; if(done) done(); }
    })(t0);
  }

  function start(){
    cur = view();
    var a = make(cur);
    var p = a.play();
    if(p && p.catch) p.catch(function(){});
    fade(a, target(), FADE_IN);
  }
  function stop(){
    Object.keys(el).forEach(function(k){
      var a = el[k];
      fade(a, 0, FADE_OUT, function(){ a.pause(); });
    });
  }
  /* the view changed under us - cross-fade so the flip carries the score with it */
  function swap(){
    if(!on) return;
    var next = view();
    if(next === cur) return;
    var old = cur ? el[cur] : null;
    cur = next;
    var a = make(next);
    var p = a.play();
    if(p && p.catch) p.catch(function(){});
    fade(a, target(), XFADE);
    if(old) fade(old, 0, XFADE, function(){ old.pause(); });
  }

  function paint(){
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.mus-lab').textContent =
        dead ? 'No track' : (on ? 'Music on' : 'Music off');
      b.disabled = dead;
    });
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      if(dead) return;
      on = !on;
      try{ localStorage.setItem(KEY, on ? '1' : '0'); }catch(err){}
      paint();
      if(on) start(); else stop();
    });
  });

  (function(){
    function relevel(){ if(on && cur && el[cur]) fade(el[cur], target(), 300); }
    if(MOBILE.addEventListener) MOBILE.addEventListener('change', relevel);
    else if(MOBILE.addListener) MOBILE.addListener(relevel);   /* older Safari */
  })();

  document.addEventListener('viewflip', swap);
  /* the climax should still land - pull the music down under it, briefly */
  document.addEventListener('sfxclimax', function(){
    if(!on || !cur || !el[cur]) return;
    ducked++;
    fade(el[cur], target(), 120);
    setTimeout(function(){
      ducked = Math.max(0, ducked - 1);
      if(on && cur && el[cur]) fade(el[cur], target(), 400);
    }, 420);
  });

  /* Returning visitor who had it on. Try to start - a visitor who has built
     up enough engagement with this origin may be allowed to autoplay - but
     arm the fallback FIRST, and unconditionally.

     It used to be registered inside the rejection handler, which loses two
     ways: the promise settles asynchronously, so anyone who clicks before it
     rejects gets no listener and no music at all; and a browser that returns
     nothing from play() never rejects, so the handler never ran. */
  var pref = false;
  try{ pref = localStorage.getItem(KEY) === '1'; }catch(err){}
  if(pref){
    on = true; cur = view();
    var EVS = ['pointerdown', 'keydown', 'touchend'];
    var kick = function(){
      EVS.forEach(function(e){ removeEventListener(e, kick, true); });
      /* nothing to do if autoplay was allowed and it is already running */
      if(on && (!el[cur] || el[cur].paused)) start();
    };
    EVS.forEach(function(e){ addEventListener(e, kick, true); });

    var a = make(cur), p = a.play();
    if(p && p.then) p.then(function(){ fade(a, target(), FADE_IN); }).catch(function(){});
  }
  paint();
})();
