/* The portrait flips the view too - same toggle as the headline. */
(function(){
  var wrap = document.getElementById('hwrap');
  if(!wrap) return;
  document.querySelectorAll('.stage-photo img').forEach(function(img){
    img.addEventListener('click', function(e){
      e.stopPropagation();
      wrap.click();
    });
  });
})();

/* Liquid-glass puck: tracks the cursor, but only inside the rendered photo
   box - its bottom edge up to the top of the head, never the space above. */
(function(){
  var host = document.querySelector('.stage-photo');
  var lens = document.getElementById('plens');
  if(!host || !lens) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tx=0, ty=0, tr=0, cx=0, cy=0, cr=0, running=false;

  function shown(){ return host.querySelector('img:not([hidden])'); }

  /* object-fit:contain + object-position:bottom centre - work out the real box */
  function fit(){
    var img = shown();
    if(!img || !img.naturalWidth) return;
    var b = host.getBoundingClientRect();
    var z = host.offsetWidth ? b.width / host.offsetWidth : 1;   /* hero zoom */
    var bw = host.offsetWidth, bh = b.height / z;
    var scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
    var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    lens.style.height = h + 'px';
    lens.style.left   = ((bw - w) / 2) + 'px';
    lens.style.right  = ((bw - w) / 2) + 'px';
  }
  addEventListener('resize', fit);
  host.querySelectorAll('img').forEach(function(i){
    if(i.complete) fit(); else i.addEventListener('load', fit);
  });
  new MutationObserver(fit).observe(host, {attributes:true, subtree:true, attributeFilter:['hidden']});

  function frame(){
    var k = reduced ? 1 : .14;
    cx += (tx-cx)*k; cy += (ty-cy)*k; cr += (tr-cr)*(reduced ? 1 : .11);
    lens.style.clipPath = 'circle(' + cr.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
    lens.style.setProperty('--mx', cx.toFixed(1) + 'px');
    lens.style.setProperty('--my', cy.toFixed(1) + 'px');
    if(Math.abs(tr-cr) > .4 || Math.abs(tx-cx) > .4 || Math.abs(ty-cy) > .4) requestAnimationFrame(frame);
    else running = false;
  }
  function kick(){ if(!running){ running = true; requestAnimationFrame(frame); } }

  /* coordinates are relative to the measured box, so the puck can never
     wander into the empty area above the head */
  function aim(e){
    var b = lens.getBoundingClientRect();
    var z = lens.offsetWidth ? b.width / lens.offsetWidth : 1;   /* hero zoom */
    tx = (e.clientX - b.left) / z;
    ty = (e.clientY - b.top) / z;
    return b;
  }
  host.addEventListener('mouseenter', function(e){
    fit(); aim(e); cx = tx; cy = ty; cr = 0;
    tr = Math.min(lens.offsetWidth * .13, 54);
    kick();
  });
  host.addEventListener('mousemove', function(e){
    var b = aim(e);
    tr = Math.min(b.width * .13, 54);
    kick();
  });
  host.addEventListener('mouseleave', function(){ tr = 0; kick(); });
})();

/* Idle demo: the chip taps itself at random, never less than 2s apart. */
(function(){
  var chip=document.getElementById('flip');
  if(!chip) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  chip.classList.add('landed');          /* entrance is done; keep it out of the way */
  function tap(){
    chip.classList.add('tap');
    setTimeout(function(){ chip.classList.remove('tap'); }, 520);
    setTimeout(tap, 2000 + Math.random() * 4000);   /* 2s–6s gap */
  }
  setTimeout(tap, 2600);                            /* after the chip has arrived */
})();
