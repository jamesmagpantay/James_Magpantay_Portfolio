/* Group One: the text+photo stack and the 3x2 roster grid size themselves
   independently (the roster fills its column, the photo is capped to the
   paragraph's width) so their natural heights rarely match. Nudge the
   shorter column down by the difference so both columns' bottom edges
   land on the same line - a plain translate, not a resize, so the photo
   keeps its crop and the roster's cells stay square. */
(function(){
  var wrap = document.querySelector('#groupone .grp-cols');
  if(!wrap) return;
  var left = wrap.children[0], right = wrap.children[1];
  var stacked = matchMedia('(max-width:900px)');

  function sync(){
    left.style.transform = '';
    right.style.transform = '';
    if(stacked.matches) return;
    var diff = left.getBoundingClientRect().bottom - right.getBoundingClientRect().bottom;
    if(diff > .5) right.style.transform = 'translateY(' + diff + 'px)';
    else if(diff < -.5) left.style.transform = 'translateY(' + (-diff) + 'px)';
  }

  sync();
  addEventListener('resize', sync);
  addEventListener('load', sync);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();
