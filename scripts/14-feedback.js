/* ---- Toasts. One live region, so the page can answer a click in words
   instead of leaving the visitor to guess whether anything happened. Every
   toast is announced, and every toast leaves on its own. ---- */
(function(){
  var host = document.getElementById('toasts');
  var LIFE = 5200, MAX = 3;

  window.toast = function(kind, title, detail, opts){
    if(!host) return;
    while(host.children.length >= MAX) drop(host.firstElementChild);
    var t = document.createElement('div');
    /* .center is a modifier, not a second toast system - same host, same
       queue/dismiss/auto-hide logic, it just escapes the bottom-left stack
       via position:fixed (see 09-feedback.css) for the one case that needs
       to interrupt bottom-middle rather than join the corner queue: an
       incomplete contact-form submit. opts.life overrides the default
       LIFE for that same call, so it can auto-dismiss faster without
       shortening every other toast's lifetime. */
    t.className = 'toast ' + (kind || 'info') + (opts && opts.center ? ' center' : '');
    var dot = document.createElement('i'); dot.className = 'toast-dot';
    var body = document.createElement('div');
    var b = document.createElement('b'); b.textContent = title;
    body.appendChild(b);
    if(detail){
      var d = document.createElement('span'); d.textContent = detail;
      body.appendChild(d);
    }
    t.appendChild(dot); t.appendChild(body);
    /* tapping one dismisses it - they stack at the thumb on a phone */
    t.addEventListener('click', function(){ drop(t); });
    host.appendChild(t);
    setTimeout(function(){ drop(t); }, (opts && opts.life) || LIFE);
    return t;
  };
  function drop(t){
    if(!t || t.dataset.going) return;
    t.dataset.going = '1';
    t.classList.add('out');
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 260);
  }

  /* The clipboard API is missing on file:// and rejects without a secure
     context, and the old code called .then on undefined. One helper, one
     fallback, and a callback that is honest about which happened. */
  window.copyText = function(text, done){
    done = done || function(){};
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text)
        .then(function(){ done(true); })
        .catch(function(){ done(legacy(text)); });
      return;
    }
    done(legacy(text));
  };
  function legacy(text){
    try{
      var a = document.createElement('textarea');
      a.value = text;
      a.setAttribute('readonly','');
      a.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(a);
      a.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(a);
      return !!ok;
    }catch(e){ return false; }
  }
})();

/* ---- Loading curtain, part two: the rail. The failsafe above already
   guarantees the reveal; this only makes the wait honest.

   Two things drive it, and the lower one wins. Real progress is how much of
   the first screen has arrived - everything not lazy-loaded is, by
   definition, exactly that, plus the webfonts. The floor is how far into the
   minimum hold we are. Taking the smaller means a page that loaded instantly
   still shows a bar that travels, instead of one that snaps to full and then
   sits there looking stuck for a second. ---- */
(function(){
  var fill = document.getElementById('pre-fill'),
      meta = document.getElementById('pre-meta');
  if(!fill) return;

  var pre  = window.__pre || {t0:Date.now(), min:0};
  var imgs = [].slice.call(document.querySelectorAll('img:not([loading="lazy"])'));
  var total = imgs.length + 1;                 /* + the webfonts */
  var got = 0, shown = 0, live = true;

  function tick(){ got++; }
  imgs.forEach(function(i){
    if(i.complete){ tick(); return; }
    i.addEventListener('load', tick, {once:true});
    i.addEventListener('error', tick, {once:true});
  });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(tick).catch(tick);
  else tick();

  function land(){
    live = false;
    fill.style.setProperty('--lp', '1');
    if(meta) meta.textContent = 'Ready';
  }
  function frame(){
    if(!live) return;
    var real  = total ? Math.min(1, got / total) : 1;
    var floor = pre.min > 0 ? (Date.now() - pre.t0) / pre.min : 1;
    /* monotonic, and never quite full until the curtain is actually going */
    shown = Math.max(shown, Math.min(real, floor, 0.985));
    fill.style.setProperty('--lp', shown.toFixed(3));
    if(meta) meta.textContent = Math.round(shown * 100) + '%';
    requestAnimationFrame(frame);
  }

  document.addEventListener('preready', land);
  if(window.__preDone) land();          /* it finished before we got here */
  else requestAnimationFrame(frame);
})();

/* ---- Pictures that did not arrive. A broken-image glyph is the one part of
   a page nobody designed; these keep the shape and say what happened. ---- */
(function(){
  function fail(img){
    var host = img.closest('.ph, .proj-shot, .pm-shot');
    if(host){
      img.style.display = 'none';
      host.classList.add('img-fail');
      /* it no longer opens anything, so it should not offer to */
      if(host.classList.contains('ph')){
        host.removeAttribute('role');
        host.removeAttribute('tabindex');
        host.removeAttribute('data-kbd');
      }
    } else {
      /* a logo or a sticker mark: the label beside it already names the thing */
      img.classList.add('gone');
    }
  }
  document.querySelectorAll('img').forEach(function(img){
    if(img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail(img);
    img.addEventListener('error', function(){ fail(img); });
    /* the modal reuses one <img> for every project, so a failure there has to
       be cleared when a working one arrives - otherwise the frame stays broken */
    img.addEventListener('load', function(){
      var host = img.closest('.ph, .proj-shot, .pm-shot');
      if(host) host.classList.remove('img-fail');
      img.style.display = '';
      img.classList.remove('gone');
    });
  });
})();

/* ---- The connection. Downloads and mail links are the things here that
   actually need one, so say something before they fail silently. ---- */
(function(){
  var was = navigator.onLine !== false;
  addEventListener('offline', function(){
    was = false;
    window.toast('err','You are offline','Downloads and links will not work until you reconnect.');
  });
  addEventListener('online', function(){
    if(!was) window.toast('ok','Back online','Everything works again.');
    was = true;
  });
  document.querySelectorAll('.dl a[download]').forEach(function(a){
    a.addEventListener('click', function(e){
      if(navigator.onLine === false){
        e.preventDefault();
        window.toast('err','Cannot download offline','Reconnect and try again.');
        return;
      }
      window.toast('info','Starting download', a.textContent.trim());
    });
  });
})();
