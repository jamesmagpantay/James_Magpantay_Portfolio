/* Silent-mode bypass, shared by both audio modules below. A plain
   AudioContext's output stays under the ringer/silent switch on iOS, but the
   page's whole audio session flips into the "playback" category - which
   ignores that switch - the instant any HTMLMediaElement is playing. Both
   the interface sounds and the music are meant to be heard even with the
   phone silenced, so rather than leave that to whichever one happens to
   play an <audio> element first, a silent looping clip is started on the
   very first gesture to hold the session in that category from the start. */
(function(){
  var SILENCE = 'data:audio/wav;base64,UklGRtQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YbAEAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA=';
  /* Checked fresh on every gesture rather than latched once "armed" and
     forgotten: a tab put in the background for a long stretch can have its
     audio paused out from under it by the OS or the browser itself, and a
     stale "already armed" flag would then leave it silent forever, with no
     gesture left able to tell the difference from never having started. */
  var clip = null;
  function arm(){
    if(clip && !clip.paused) return;
    try{
      if(!clip){ clip = new Audio(SILENCE); clip.loop = true; }
      var p = clip.play();
      if(p && p.catch) p.catch(function(){});
    }catch(e){}
  }
  ['pointerdown','keydown','touchend'].forEach(function(e){
    addEventListener(e, arm, true);
  });
})();

/* Interface sound. Everything is synthesised in the Web Audio API - no files to
   host, and every character of it is a number you can tune. Five sounds, on
   by default on every load. */
(function(){
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

  /* on by default, every load - not remembered across reloads */
  var on = true;

  /* Desktop speakers (and the external ones this got tuned against) can
     take a fair bit more level than a laptop's built-in pair before it
     reads as loud rather than just audible - a laptop with nothing plugged
     in was coming through weak at the flat 0.30 every device used to
     share. Same 860px split the music module already uses below, kept
     independent (own MOBILE const) since this module is its own IIFE. */
  var MOBILE = matchMedia('(max-width:860px)');

  var ctx = null, master = null, noise = null;
  function boot(){
    /* a tab backgrounded long enough can have the browser close its audio
       context out from under it to free the hardware - ctx is still a
       truthy reference at that point, just a dead one, so it has to be
       checked rather than merely tested for existence, or nothing here
       ever rebuilds and every sound stays silent for the rest of the visit */
    if(ctx && ctx.state === 'closed'){ ctx = null; master = null; noise = null; }
    if(ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MOBILE.matches ? 0.30 : 1.15;
    /* one lowpass across everything - this is what makes the set read as
       "creamy" rather than sharp, however each sound is built */
    var warm = ctx.createBiquadFilter();
    warm.type = 'lowpass'; warm.frequency.value = 5400; warm.Q.value = .7;
    /* a handful of hits (the space-bar key, the view-flip thock, the big
       landing hit) already synthesize at peak gain 1.0 before master ever
       multiplies them - past a certain master value that starts clipping
       on its own rather than reading as louder. This limiter is what
       actually buys more headroom: fast attack/release so it only grabs
       the very top of a transient (normal-level hits pass through
       essentially untouched), letting master sit well above 1.0 for real
       loudness while it catches anything that would otherwise clip. */
    var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = .003; limiter.release.value = .12;
    master.connect(warm); warm.connect(limiter); limiter.connect(ctx.destination);
    var n = Math.floor(ctx.sampleRate * 0.5);
    noise = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = noise.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  /* boot() only runs once (guarded above), so a resize that crosses the
     860px line afterward would otherwise leave the level stuck at
     whichever side loaded first - live so it re-levels immediately
     instead of waiting on a reload, same as the music module. */
  function relevelMaster(){
    if(master) master.gain.value = MOBILE.matches ? 0.30 : 1.15;
  }
  if(MOBILE.addEventListener) MOBILE.addEventListener('change', relevelMaster);
  else if(MOBILE.addListener) MOBILE.addListener(relevelMaster);   /* older Safari */
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

  /* Actual pitch, not filtered noise - the one deliberate break from "no
     oscillators anywhere" above. A cricket or bird call is a real tone
     with a real pitch contour; noise through a bandpass can sweep but
     never rings like one, so this is the only path that can pass for the
     real thing. Used only by the two calls below it, never by UI sfx. */
  function tone(t, f0, f1, dur, peak, kind){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = kind || 'sine';
    o.frequency.setValueAtTime(f0 * vary(), t);
    if(f1) o.frequency.exponentialRampToValueAtTime(f1 * vary(), t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * .25);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + .02);
  }
  /* a cricket call is a fast trill at one near-constant pitch, not a sweep -
     a short train of 3-6 clicks a few milliseconds apart */
  function cricket(at){
    var base = 4000 + Math.random() * 700, n = 3 + (Math.random() * 4 | 0), t = at;
    for(var i = 0; i < n; i++){
      tone(t, base + Math.random() * 80, null, .016 + Math.random() * .008,
           .11 + Math.random() * .05, 'triangle');
      t += .024 + Math.random() * .012;
    }
  }
  /* A plain exponential sweep reads as a synth blip, not a bird - a real
     whistle flutters. This is a sine under a fast, shallow vibrato (birds
     sit around 25-40Hz) with a soft breath of noise on the attack, the
     little chiff you hear before the pitch of a real tweet settles in. */
  function warble(t, f0, f1, dur, peak){
    var o = ctx.createOscillator(), lfo = ctx.createOscillator(),
        lfoGain = ctx.createGain(), g = ctx.createGain(),
        n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0 * vary(), t);
    if(f1) o.frequency.exponentialRampToValueAtTime(f1 * vary(), t + dur);
    lfo.type = 'sine'; lfo.frequency.value = 26 + Math.random() * 14;
    lfoGain.gain.value = f0 * .045;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * .22);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master);
    n.buffer = noise;
    nf.type = 'bandpass'; nf.frequency.value = f0; nf.Q.value = 3;
    ng.gain.setValueAtTime(.0001, t);
    ng.gain.exponentialRampToValueAtTime(peak * .35, t + .006);
    ng.gain.exponentialRampToValueAtTime(.0001, t + .03);
    n.connect(nf); nf.connect(ng); ng.connect(master);
    o.start(t); lfo.start(t); n.start(t, Math.random() * .4);
    o.stop(t + dur + .04); lfo.stop(t + dur + .04); n.stop(t + .06);
  }
  /* three different species rather than one repeated shape: a rising
     tweet, a dip-then-rise warble, and a fast three-note trill - picked
     at random so the birds don't all sound like the same one bird */
  function bird(at){
    var kind = Math.random();
    if(kind < .4){
      /* rising tweet, sometimes answered by a second, softer one */
      var f0 = 2000 + Math.random() * 700, f1 = f0 + 900 + Math.random() * 800;
      warble(at, f0, f1, .10 + Math.random() * .05, .20 + Math.random() * .08);
      if(Math.random() < .6){
        warble(at + .12 + Math.random() * .05, f1 * .92, f0 * 1.08,
               .08 + Math.random() * .04, .15 + Math.random() * .06);
      }
    } else if(kind < .7){
      /* dip then rise - a single note that bends down before climbing out */
      var mid = 1900 + Math.random() * 500, peak2 = mid + 1400 + Math.random() * 600;
      warble(at, mid + 500, mid, .06, .14 + Math.random() * .05);
      warble(at + .06, mid, peak2, .11 + Math.random() * .05, .19 + Math.random() * .07);
    } else {
      /* fast three-note trill, climbing */
      var base = 2200 + Math.random() * 500, t = at;
      for(var i = 0; i < 3; i++){
        warble(t, base + i * 260, base + i * 260 + 180, .055 + Math.random() * .02,
               .15 + Math.random() * .06);
        t += .07 + Math.random() * .02;
      }
    }
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
                       thock({cut:3400, r1:240, r2:900, dur:.045, peak:.40}, ctx.currentTime + .075); },
    /* the theme toggle's entrance ambiance - a one-shot wash, not a loop,
       so it plays through once and is gone rather than lingering. Night is
       a low dusk drone under a couple of cricket trills, staggered so they
       don't all trip at once like a real patch of them wouldn't; morning
       is the same drone inverted - brighter, rising - under a few birds
       calling back and forth. */
    night: function(){
      shimmer(2.4, 820, 130, .15);
      var n = 2 + (Math.random() * 2 | 0);
      for(var i = 0; i < n; i++) cricket(ctx.currentTime + .25 + Math.random() * 1.7);
    },
    morning: function(){
      shimmer(1.9, 480, 2300, .13);
      var n = 2 + (Math.random() * 2 | 0);
      for(var i = 0; i < n; i++) bird(ctx.currentTime + .12 + Math.random() * 1.4);
    }
  };
  /* Which sounds pull the music down under them. Deliberately not the whole
     set: the scroll detent fires up to nine times a second and the key sounds
     fire on every character typed into the contact form, so ducking on those
     would leave the music pumping continuously. Only discrete, meaningful
     events - the ones you are meant to notice - get to interrupt it. */
  var DUCK = {click:1, big:1, open:1, close:1, land:1, flip:1,
              revealPro:1, revealOff:1, night:1, morning:1};

  function play(name, arg){
    if(!on) return;
    boot();
    if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
    if(DUCK[name]) document.dispatchEvent(new CustomEvent('sfxduck'));
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
      paint();
      if(on) play('click');
    });
  });
  paint();

  /* A stored "on" cannot make a sound by itself: no browser starts audio
     before the visitor has interacted with the page, so after a refresh the
     toggle sat there claiming to be on while nothing played.

     Waiting for play() to be reached is not enough either. Hovering and
     scrolling do not grant user activation on any platform - deliberately,
     so a page cannot sneak audio unlock into a passive gesture - and on
     touch, neither does touchstart: the browser only knows a touch was a
     tap, rather than the start of a scroll, once it ends. So this listens
     on every plausible activating event, but only disarms once resume() has
     actually landed - a touchend that turns out to have been a scroll, and
     so does not unlock anything, leaves the listeners armed for the next
     one instead of wasting the one shot it used to get. */
  if(on){
    (function(){
      var EVS = ['pointerdown', 'keydown', 'touchend'];
      function armed(){ return ctx && ctx.state === 'running'; }
      function disarm(){
        EVS.forEach(function(e){ removeEventListener(e, tryUnlock, true); });
        /* the first-visit banner is waiting to hear this, so it can clear
           itself the moment sound genuinely works rather than on a timer */
        document.dispatchEvent(new CustomEvent('sfxunlocked'));
      }
      function tryUnlock(){
        if(armed()) return disarm();
        boot();
        if(!ctx) return;
        var p = ctx.resume();
        if(p && p.then) p.then(function(){ if(armed()) disarm(); }).catch(function(){});
        /* belt and braces: a real (silent) buffer source started
           synchronously inside the gesture is the more reliable unlock on
           iOS, where resume() alone does not always take. */
        try{
          var b = ctx.createBufferSource();
          b.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
          b.connect(ctx.destination);
          b.start(0);
        }catch(e){}
        if(armed()) disarm();
      }
      EVS.forEach(function(e){ addEventListener(e, tryUnlock, true); });
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
  var HOVER = '.bar-nav a, .hero-top nav a, .git, .sticker, .bar-flip, .vbadge, .sfx-btn, .mus-btn, .thm-btn, .xp-row, .xp-cue, .proj, .tk, .ledger .row, .edu-card, .bar-brand, .f-links a, .dl a, .ph, .scroll-hint';
  document.querySelectorAll(HOVER).forEach(hover);
  /* the "see all" overlays clone .xp-row/.proj/.ph cards well after this ran,
     so the clones never got the listener above - 11-see-all.js calls this
     once it's done building a box, to wire the same tick onto whatever just
     landed in it (a plain querySelectorAll scoped to the box, so it's a
     no-op on boxes that hold neither kind of card) */
  window.wireHoverSound = function(root){
    root.querySelectorAll('.xp-row, .proj, .ph').forEach(hover);
  };
  var CLICK = '.git, .sticker, .bar-nav a, .hero-top nav a, .proj, .tk, .ledger .row, .edu-card, .f-links a, .dl a, .ph, .brand, .bar-brand, .scroll-hint';
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
})();

/* Soundtrack. Two loops, one per view: taut and atmospheric on the security
   side, warm and jazzy off the clock. Off by default on every load,
   lazy-loaded, faded rather than cut, and ducked under the CTA slam. */
(function(){
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
     phone or resizing a window re-levels rather than waiting for a reload.
     The desktop side was tuned against an external speaker that could take
     more than a laptop's built-in pair reads as comfortable at the same
     value - bumped up for anything past the mobile breakpoint; mobile is
     unaffected. */
  var MOBILE = matchMedia('(max-width:860px)');
  function vol(){ return MOBILE.matches ? 0.028 : 0.45; }

  var on = false, cur = null, ducked = 0, dead = false;

  /* Played through plain Web Audio buffer sources rather than <audio>
     elements, so level control runs through a GainNode - same as the sfx
     module - rather than HTMLMediaElement.volume, which iOS ignores
     outright. (The silent-mode bypass above already takes care of the
     switch itself, for this and the sfx module both.) */
  var actx = null, limiter = null, gainNodes = {}, buffers = {}, sources = {}, fadeRAF = {};

  function ensureCtx(){
    /* same recovery as the sfx module: a long spell backgrounded can get
       this context closed by the browser, and everything cached against it
       - its gain nodes, its decoded buffers - dies with it and has to be
       rebuilt against a fresh one rather than reused. */
    if(actx && actx.state === 'closed'){
      actx = null; limiter = null; gainNodes = {}; buffers = {}; sources = {};
    }
    if(actx) return actx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    actx = new AC();
    /* every track's gain node routes through this one shared limiter
       rather than straight to destination - same reasoning as the sfx
       module's (a fast, gentle catch on real peaks, not a constant
       squeeze), so the desktop level above can sit higher without a
       track transition or the two crossfading tracks summing into a clip. */
    limiter = actx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = .003; limiter.release.value = .12;
    limiter.connect(actx.destination);
    return actx;
  }
  function gainFor(k){
    var ctx = ensureCtx();
    if(!ctx) return null;
    if(gainNodes[k]) return gainNodes[k];
    var g = ctx.createGain();
    g.gain.value = 0;
    g.connect(limiter);
    gainNodes[k] = g;
    return g;
  }
  function level(k){ var g = gainNodes[k]; return g ? g.gain.value : 0; }
  function setLevel(k, v){ var g = gainFor(k); if(g) g.gain.value = v; }

  /* fetched and decoded once per view, then reused for every subsequent
     play - a buffer source is one-shot, so start()/swap() spin up a fresh
     node against the same decoded buffer rather than re-fetching it */
  function loadBuffer(k){
    if(buffers[k]) return buffers[k];
    var ctx = ensureCtx();
    if(!ctx) return Promise.reject(new Error('no audio context'));
    buffers[k] = fetch(bestSrc(SRC[k]))
      .then(function(r){ if(!r.ok) throw new Error('fetch failed'); return r.arrayBuffer(); })
      .then(function(data){ return ctx.decodeAudioData(data); })
      .catch(function(err){
        /* a missing or unplayable file should not leave the toggle lying */
        delete buffers[k];
        dead = true; on = false; paint();
        throw err;
      });
    return buffers[k];
  }

  /* a context created or resumed outside a user gesture stays suspended,
     so it has to be woken from one before the buffer is audible */
  function wake(){
    if(actx && actx.state === 'suspended') actx.resume();
  }
  /* a single unlock can be missed; while the music is on, every gesture is
     another chance for the context to come up */
  ['pointerdown','keydown','touchend'].forEach(function(e){
    addEventListener(e, function(){ if(on) wake(); }, true);
  });

  function view(){ return document.body.classList.contains('offline') ? 'off' : 'pro'; }

  function stopSource(k){
    var src = sources[k];
    if(!src) return;
    try{ src.stop(); }catch(e){}
    try{ src.disconnect(); }catch(e){}
    sources[k] = null;
  }
  function playSource(k){
    var ctx = ensureCtx();
    if(!ctx) return;
    gainFor(k);
    loadBuffer(k).then(function(buffer){
      stopSource(k);
      var src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(gainNodes[k]);
      src.start(0);
      sources[k] = src;
    }).catch(function(){});
  }

  /* the volume popover (desktop only - see the CSS on .mus-wrap) sits on
     top of vol()'s own device-based level rather than replacing it: 100%
     on the slider still means "whatever this device's normal level is",
     not some separate absolute number, so the mobile/desktop split above
     keeps working underneath it untouched. Remembered across visits since
     a volume preference is exactly the kind of thing a reload shouldn't
     silently reset. */
  var userVol = 1;
  try{
    var savedVol = localStorage.getItem('music-uservol');
    if(savedVol !== null){ var pv = parseFloat(savedVol); if(!isNaN(pv)) userVol = Math.max(0, Math.min(1, pv)); }
  }catch(err){}
  function target(){ return vol() * userVol * (ducked > 0 ? .4 : 1); }

  function fade(k, to, ms, done){
    if(fadeRAF[k]){ cancelAnimationFrame(fadeRAF[k]); fadeRAF[k] = null; }
    var from = level(k), t0 = performance.now();
    (function step(t){
      var q = ms > 0 ? Math.min(1, (t - t0) / ms) : 1;
      setLevel(k, Math.max(0, Math.min(1, from + (to - from) * q)));
      if(q < 1) fadeRAF[k] = requestAnimationFrame(step);
      else { fadeRAF[k] = null; if(done) done(); }
    })(t0);
  }

  function start(){
    cur = view();
    wake();
    playSource(cur);
    fade(cur, target(), FADE_IN);
  }
  function stop(){
    Object.keys(gainNodes).forEach(function(k){
      fade(k, 0, FADE_OUT, function(){ stopSource(k); });
    });
  }
  /* the view changed under us - cross-fade so the flip carries the score with it */
  function swap(){
    if(!on) return;
    var next = view();
    if(next === cur) return;
    var old = cur;
    cur = next;
    wake();
    playSource(next);
    fade(next, target(), XFADE);
    if(old) fade(old, 0, XFADE, function(){ stopSource(old); });
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
      paint();
      /* The same key the theme and sound pills answer with. This is a
         separate IIFE from the sound module, so its play() is not in scope
         here - window.sfx is the only way across, and it is absent entirely
         when that module bails for reduced motion. It plays in both
         directions, unlike the sound toggle, which cannot make a noise on
         the press that switches it off; and sfx.play is itself a no-op when
         interface sound is off, so this never adds a click nobody asked for. */
      if(window.sfx) window.sfx.play('click');
      if(on) start(); else stop();
    });
  });

  /* the volume sliders live as siblings of .mus-btn (see the HTML), not
     nested inside it, specifically so dragging one can never bubble into
     the button's own click handler above and toggle music off mid-drag -
     no stopPropagation needed, there is simply no button ancestor for the
     event to reach. Two sliders (bar + hero) share one userVol, kept in
     sync with each other on every input rather than each owning its own
     state. */
  var volSliders = [].slice.call(document.querySelectorAll('.mus-vol-slider'));
  /* skip, optionally, the one currently under the user's own cursor -
     writing element.value back onto a range input the user has an active
     pointer-drag on (even to the value it already holds) can fight the
     browser's own internal drag tracking, reading as the thumb freezing
     or refusing to move past wherever the first successful move landed.
     The other slider (kept in sync so both always agree) is never the one
     mid-drag, so it always gets the write. */
  function syncSliders(exceptEl){
    volSliders.forEach(function(s){
      if(s === exceptEl) return;
      s.value = String(Math.round(userVol * 100));
    });
  }
  syncSliders();
  /* dragging is handled entirely by hand here, not left to the browser's
     own native range-drag tracking. A fully custom-styled
     (-webkit-appearance:none) range input loses Chrome's "click anywhere
     on the track to jump there" handling - checked directly, only a
     pointerdown landing pixel-for-pixel on the 14px thumb itself actually
     engages native dragging; anywhere else on the track does nothing.
     Since the thumb starts pinned at one end (100%), a click meant to
     jump it from across the track almost never lands exactly on it, so
     nothing happens - reads as the slider being stuck at whatever it
     already was. setPointerCapture is what makes this reliable rather
     than just a pointerdown fix: it keeps pointermove routed to this
     element for the rest of the gesture even if the cursor drifts outside
     the slider's own (small, 14px-tall) box mid-drag, which a real drag
     toward either edge does often. */
  volSliders.forEach(function(s){
    function setFromClientX(clientX){
      var rect = s.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      var v = String(Math.round(pct * 100));
      if(v !== s.value){
        s.value = v;
        s.dispatchEvent(new Event('input', {bubbles:true}));
      }
    }
    s.addEventListener('pointerdown', function(e){
      /* preventDefault matters here in a way it didn't show up in testing
         against dispatched PointerEvents: those never engage the browser's
         own native slider-drag handling at all (that only fires for
         genuine trusted input), so a test built on dispatched events alone
         cannot see this. On a real mouse, without this, native dragging
         and this handler both try to drive the same value on every move -
         whichever runs second wins the frame, and native's own click-
         positioning is exactly the broken one (only the thumb itself,
         pixel-for-pixel, actually engages it - see the comment below).
         Fighting each other reads as the slider refusing to move. */
      e.preventDefault();
      setFromClientX(e.clientX);
      try{ s.setPointerCapture(e.pointerId); }catch(err){}
      function onMove(ev){ ev.preventDefault(); setFromClientX(ev.clientX); }
      function onUp(){
        s.removeEventListener('pointermove', onMove);
        s.removeEventListener('pointerup', onUp);
        s.removeEventListener('pointercancel', onUp);
      }
      s.addEventListener('pointermove', onMove);
      s.addEventListener('pointerup', onUp);
      s.addEventListener('pointercancel', onUp);
    });
  });
  volSliders.forEach(function(s){
    s.addEventListener('input', function(){
      userVol = Math.max(0, Math.min(1, s.value / 100));
      syncSliders(s);
      try{ localStorage.setItem('music-uservol', String(userVol)); }catch(err){}
      /* dragging the slider while music is off used to just set a level
         nobody could hear yet - silent, so it read as broken rather than
         as "quiet because nothing is playing." Touching it now starts
         playback at that level directly, the same as pressing the toggle
         would, so hovering and dragging is a complete action on its own
         rather than needing the toggle pressed first. A dragged range
         input still counts as user activation for the autoplay policy,
         same as a click does. */
      if(!on){
        if(dead) return;
        on = true;
        paint();
        start();
      } else if(cur){
        fade(cur, target(), 60);
      }
    });
  });

  (function(){
    function relevel(){ if(on && cur) fade(cur, target(), 300); }
    if(MOBILE.addEventListener) MOBILE.addEventListener('change', relevel);
    else if(MOBILE.addListener) MOBILE.addListener(relevel);   /* older Safari */
  })();

  document.addEventListener('viewflip', swap);
  /* Level alone does not solve masking: a sustained bed hides a 50ms
     transient even when the bed is quieter than it. So the music also steps
     back under each discrete effect and comes straight back - short enough
     to read as the effect cutting through rather than as the music dipping. */
  document.addEventListener('sfxduck', function(){
    if(!on || !cur) return;
    ducked++;
    fade(cur, target(), 70);
    setTimeout(function(){
      ducked = Math.max(0, ducked - 1);
      if(on && cur) fade(cur, target(), 320);
    }, 260);
  });

  /* the climax should still land - pull the music down under it, briefly */
  document.addEventListener('sfxclimax', function(){
    if(!on || !cur) return;
    ducked++;
    fade(cur, target(), 120);
    setTimeout(function(){
      ducked = Math.max(0, ducked - 1);
      if(on && cur) fade(cur, target(), 400);
    }, 420);
  });

  paint();
})();

/* Sound-on heads-up, every load: sfx defaults on but stays silent until a
   real tap unlocks it (a browser restriction, not a bug - see the sfx
   unlock above), so this says so at the top of the page each time rather
   than only on someone's first-ever visit. It clears itself the moment that
   tap actually lands - sfxunlocked fires right when it does - instead of
   sitting on a timer, so it never lingers once its own job is done; the
   timeout below is only a fallback for a visitor who never triggers it at
   all (reduced motion hides the sfx toggle entirely, for one). */
(function(){
  if(!matchMedia('(max-width:860px)').matches) return;
  var el = document.getElementById('snote');
  if(!el) return;

  function show(){
    requestAnimationFrame(function(){ el.classList.add('on'); });
    var t = setTimeout(hide, 8000);
    function clear(){ clearTimeout(t); hide(); }
    el.querySelector('.snote-close').addEventListener('click', clear);
    document.addEventListener('sfxunlocked', clear);
  }
  function hide(){ el.classList.remove('on'); }
  /* after the curtain has actually lifted, not underneath it */
  function land(){ setTimeout(show, 500); }
  document.addEventListener('preready', land);
  if(window.__preDone) land();
})();
