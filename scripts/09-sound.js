/* Interface sound. Everything is synthesised in the Web Audio API - no files to
   host, and every character of it is a number you can tune. Five sounds, off by
   default, remembered per visitor. */
(function(){
  var KEY = 'sfx-on';
  var btns = [].slice.call(document.querySelectorAll('.sfx-btn'));
  if(!btns.length) return;
  /* touch devices and reduced-motion visitors get silence, and no control */
  if(matchMedia('(hover: none)').matches ||
     matchMedia('(prefers-reduced-motion: reduce)').matches){
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
  function play(name){
    if(!on) return;
    boot();
    if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    try{ if(lib[name]) lib[name](); }catch(e){}
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
  var VOL = 0.11, FADE_IN = 1500, FADE_OUT = 1000, XFADE = 800;

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
  function target(){ return VOL * (ducked > 0 ? .4 : 1); }

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

  /* returning visitor who had it on: try, and if the browser blocks autoplay
     (it will, until they interact) pick it up on their first click */
  var pref = false;
  try{ pref = localStorage.getItem(KEY) === '1'; }catch(err){}
  if(pref){
    on = true; cur = view();
    var a = make(cur), p = a.play();
    if(p && p.then) p.then(function(){ fade(a, target(), FADE_IN); })
                     .catch(function(){
                       addEventListener('pointerdown', function once(){ if(on) start(); }, {once:true});
                     });
  }
  paint();
})();
