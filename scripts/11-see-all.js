/* "See all" overlays. One mechanism, three sections: cards are cloned from the
   live section at open time, so each section stays the single source of truth
   and nothing here needs keeping in sync. */
(function(){
  var VIEWS = [
    { btn:'.pa-open-proj', ov:'#pa', box:'#pa-grid', src:'.proj-grid .proj',
      link:'.proj', linkCloses:true },
    { btn:'.pa-open-xp',   ov:'#xa', box:'#xa-grid', src:'.xp .xp-row',
      link:null,   linkCloses:false },
    /* photos stay in the grid: the lightbox layers above this overlay */
    { btn:'.pa-open-gal',  ov:'#ga', box:'#ga-grid', src:'#events .gal .ph',
      link:'.ph',  linkCloses:false }
  ];
  VIEWS.forEach(function(v){
    var opens = [].slice.call(document.querySelectorAll(v.btn)),
        ov    = document.querySelector(v.ov),
        box   = document.querySelector(v.box);
    if(!opens.length || !ov || !box) return;
    var close = ov.querySelector('.pa-close');
    var originals = [];

    function build(){
      box.innerHTML = ''; originals = [];
      var seen = {};
      [].forEach.call(document.querySelectorAll(v.src), function(card){
        var h = card.querySelector('h3') || card.querySelector('figcaption');
        var key = h ? h.textContent.trim() : card.innerHTML.slice(0, 60);
        if(seen[key]) return;          /* the rail holds two copies of its set */
        seen[key] = 1;
        originals.push(card);
        var c = card.cloneNode(true);
        c.removeAttribute('id');
        /* every entry arrives already open - that is the point of the view */
        if(c.hasAttribute('aria-expanded')) c.setAttribute('aria-expanded', 'true');
        box.appendChild(c);
      });
      /* cloning drops event listeners along with everything else - the hover
         tick from 09-sound.js has to be re-wired onto this batch by hand */
      if(window.wireHoverSound) window.wireHoverSound(box);
    }
    function show(){
      build();
      ov.classList.add('on');
      document.body.classList.add('pa-open');
      if(close) close.focus();
    }
    function hide(){
      ov.classList.remove('on');
      document.body.classList.remove('pa-open');
      opens[0].focus();
    }
    opens.forEach(function(b){ b.addEventListener('click', show); });
    if(close) close.addEventListener('click', hide);
    ov.addEventListener('click', function(e){ if(e.target === ov) hide(); });
    addEventListener('keydown', function(e){
      if(e.key === 'Escape' && ov.classList.contains('on')) hide();
    });
    /* a clone stands in for its original, so whatever the original opens
       still opens - the project modal, or the photo lightbox */
    if(v.link) box.addEventListener('click', function(e){
      var c = e.target.closest(v.link);
      if(!c) return;
      var i = [].indexOf.call(box.children, c);
      if(v.linkCloses) hide();
      if(originals[i]) originals[i].click();
    });
  });
})();
