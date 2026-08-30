/* Experience rows: click a row and it opens into the description for that role. */
(function(){
  var rows = [].slice.call(document.querySelectorAll('.xp-row'));
  rows.forEach(function(row){
    row.addEventListener('click', function(){
      /* a click that ends a text selection should not collapse the row */
      var sel = window.getSelection();
      if(sel && sel.toString().trim() && row.contains(sel.anchorNode)) return;
      var open = row.getAttribute('aria-expanded') === 'true';
      rows.forEach(function(r){ r.setAttribute('aria-expanded','false'); });
      row.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
})();
