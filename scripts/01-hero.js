(function(){
  var wrap = document.getElementById('hwrap');
  var lens = document.getElementById('lens');
  var chip = document.getElementById('flip');
  var label = chip.querySelector('span');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toggle(){
    var off = document.body.classList.toggle('offline');
    /* mirror it onto <html>: the palette tokens and the scrollbar live there */
    document.documentElement.classList.toggle('offline', off);
    label.textContent = off ? 'Back to security' : 'See the other side';
    document.getElementById('t-sec').hidden = off;
    document.getElementById('t-james').hidden = !off;
    document.getElementById('rv-james').hidden = off;
    document.getElementById('rv-sec').hidden = !off;
    document.getElementById('img-fleece').hidden = off;
    document.getElementById('img-blazer').hidden = !off;
    document.getElementById('cols-on').hidden = off;
    document.getElementById('cols-off').hidden = !off;
    document.getElementById('set-certs').hidden = off;
    document.getElementById('set-social').hidden = !off;
    /* swap the whole page body: work sections <-> galleries */
    document.querySelectorAll('[data-view="pro"]').forEach(function(el){ el.hidden = off; });
    document.querySelectorAll('[data-view="off"]').forEach(function(el){ el.hidden = !off; });
    document.dispatchEvent(new CustomEvent('viewflip', {detail:{offline:off}}));
  }
  /* the hero CTA lives inside the toggle area - don't flip the page on its click */
  var heroCta = document.querySelector('.hero-cta a');
  if(heroCta) heroCta.addEventListener('click', function(e){ e.stopPropagation(); });
  /* flipping mid-page is disorienting - wipe, swap, and return to the top */
  var wipe = document.getElementById('wipe');
  var reducedMo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flip(){
    if(reducedMo || window.scrollY < 40){ toggle(); if(window.scrollY) window.scrollTo(0,0); return; }
    wipe.classList.add('on');
    setTimeout(function(){
      toggle();
      window.scrollTo(0,0);
      requestAnimationFrame(function(){ wipe.classList.remove('on'); });
    }, 230);
  }
  window.flipView = flip;
  wrap.addEventListener('click', toggle);
  /* the chip is the labelled, focusable control - the headline around it is
     just a large hit area for a pointer, so it must not toggle twice */
  chip.addEventListener('click', function(e){ e.stopPropagation(); toggle(); });

  /* liquid lens follow */
  var tx = 0, ty = 0, tr = 0;   /* targets */
  var cx = 0, cy = 0, cr = 0;   /* current  */
  var running = false;

  function frame(){
    var k = reduced ? 1 : 0.14;
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    cr += (tr - cr) * (reduced ? 1 : 0.11);
    lens.style.clipPath = 'circle(' + cr.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
    lens.style.setProperty('--mx', cx.toFixed(1) + 'px');
    lens.style.setProperty('--my', cy.toFixed(1) + 'px');
    lens.style.setProperty('--rr', cr.toFixed(1) + 'px');
    if(Math.abs(tr - cr) > 0.4 || Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4){
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }
  function kick(){ if(!running){ running = true; requestAnimationFrame(frame); } }

  /* the hero is zoomed, so a rect in viewport px is not the element's own
     px - the ratio against offsetWidth converts one to the other (1 unzoomed) */
  function zoomOf(el){ return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1; }

  wrap.addEventListener('mousemove', function(e){
    var b = wrap.getBoundingClientRect(), z = zoomOf(wrap);
    tx = (e.clientX - b.left) / z;
    ty = (e.clientY - b.top) / z;
    tr = Math.min(wrap.offsetWidth * 0.15, 190);
    kick();
  });
  wrap.addEventListener('mouseenter', function(e){
    var b = wrap.getBoundingClientRect(), z = zoomOf(wrap);
    cx = (e.clientX - b.left) / z; cy = (e.clientY - b.top) / z; cr = 0;
    kick();
  });
  wrap.addEventListener('mouseleave', function(){ tr = 0; kick(); });

  /* touch has no hover, so mousemove/mouseleave never fire - a tap opened the
     lens and nothing ever told it to close, leaving it stuck open until the
     next tap somewhere else. Drive it from touch instead: follow the finger
     while it's down, then close it shortly after it lifts. */
  var touchCloseT = null;
  function scheduleTouchClose(){
    clearTimeout(touchCloseT);
    touchCloseT = setTimeout(function(){ tr = 0; kick(); }, 650);
  }
  function aimTouch(t){
    var b = wrap.getBoundingClientRect(), z = zoomOf(wrap);
    tx = (t.clientX - b.left) / z;
    ty = (t.clientY - b.top) / z;
  }
  wrap.addEventListener('touchstart', function(e){
    if(!e.touches.length) return;
    clearTimeout(touchCloseT);
    aimTouch(e.touches[0]);
    cx = tx; cy = ty; cr = 0;
    tr = Math.min(wrap.offsetWidth * 0.15, 190);
    kick();
  }, {passive:true});
  wrap.addEventListener('touchmove', function(e){
    if(!e.touches.length) return;
    aimTouch(e.touches[0]);
    kick();
  }, {passive:true});
  wrap.addEventListener('touchend', scheduleTouchClose, {passive:true});
  wrap.addEventListener('touchcancel', scheduleTouchClose, {passive:true});

  var ph = document.getElementById('ph');
  ph.addEventListener('click', function(e){
    e.stopPropagation();
    if(!ph.classList.contains('revealed')){
      e.preventDefault();
      ph.classList.add('revealed');
    }
  });
})();
