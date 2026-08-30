/* Keyboard parity. Photos only ever answered to a click, which left the
   lightbox unreachable without a mouse. A figure is not a control, so it
   needs the role, the tab stop and the key handler spelled out. The handler
   is delegated, because the "see all" overlays clone these nodes and a
   listener bound to the original would not come with them.

   The project cards are deliberately left alone: their heading, copy and
   claim are already read in place, and wrapping them in a button role would
   hide exactly that. What the rail needed instead was a way to be scrolled
   without a pointer - which also gives the auto-drift something to pause
   for, since it already stops while focus is inside. */
(function(){
  document.querySelectorAll('.ph').forEach(function(fig){
    var i = fig.querySelector('img');
    fig.setAttribute('role', 'button');
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('data-kbd', '1');
    fig.setAttribute('aria-label', 'View photo' + (i && i.alt ? ': ' + i.alt : ''));
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('[data-kbd]');
    if(!t) return;
    e.preventDefault();
    t.click();
  });

  var rail = document.querySelector('.proj-rail');
  if(rail){
    rail.setAttribute('tabindex', '0');
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Projects, scrollable row');
  }
})();

/* Modals: send focus in, and put it back where it came from on the way out.
   Without this a keyboard or screen-reader visitor who opens the lightbox is
   dropped at the top of the document when it closes. */
(function(){
  ['lb', 'pm'].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    var from = null, open = false;
    new MutationObserver(function(){
      var now = el.classList.contains('on');
      if(now === open) return;
      open = now;
      if(now){
        from = document.activeElement;
        var c = el.querySelector('.lb-close, .pm-close');
        if(c) c.focus();
      } else if(from && from.focus){
        from.focus(); from = null;
      }
    }).observe(el, {attributes:true, attributeFilter:['class']});
  });
})();
