/* Gallery lightbox for the offline view. */
(function(){
  var lb=document.getElementById('lb'), im=document.getElementById('lb-img'), cap=document.getElementById('lb-cap');
  if(!lb) return;
  document.querySelectorAll('.ph').forEach(function(fig){
    fig.addEventListener('click', function(){
      var i=fig.querySelector('img');
      im.src=i.src; im.alt=i.alt; cap.textContent=i.alt;
      lb.classList.add('on');
    });
  });
  function close(){ lb.classList.remove('on'); im.src=''; }
  lb.addEventListener('click', close);
  addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
})();

/* Click a project card to blow it up: big image left, detail right. */
(function(){
  var pm=document.getElementById('pm');
  if(!pm) return;
  var img=document.getElementById('pm-img'),
      ttl=document.getElementById('pm-title'), copy=document.getElementById('pm-copy'),
      fact=document.getElementById('pm-fact'),
      repoLink=document.getElementById('pm-repo'), demoLink=document.getElementById('pm-demo');

  /* repo/demo are optional per project and not all are filled in yet - a
     card without one shows the button greyed out and inert rather than
     hiding it outright, so the row still reads as "code + demo" while the
     real links get added */
  function setLink(a, url){
    if(url){
      a.href = url; a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex');
      a.classList.remove('pm-link-disabled');
    }else{
      a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1;
      a.classList.add('pm-link-disabled');
    }
  }

  document.querySelectorAll('.proj').forEach(function(card){
    card.addEventListener('click', function(e){
      var r = card.closest('.proj-rail');
      if(r && r.classList.contains('dragging')) return;
      e.stopPropagation();
      var h=card.querySelector('h3'), shot=card.querySelector('.proj-shot img');
      img.src = shot ? shot.src : ''; img.alt = shot ? shot.alt : '';
      img.className = shot && shot.classList.contains('top') ? 'top' : '';
      ttl.innerHTML    = h.innerHTML;
      copy.textContent = card.querySelector('p').textContent;
      fact.textContent = card.querySelector('.fact').textContent;
      setLink(repoLink, card.dataset.repo);
      setLink(demoLink, card.dataset.demo);
      document.body.classList.add('pm-open');
      pm.classList.add('on');
    });
  });
  function close(){ pm.classList.remove('on'); document.body.classList.remove('pm-open'); img.src=''; }
  pm.addEventListener('click', function(e){ if(e.target===pm || e.target.closest('.pm-close')) close(); });
  addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
})();
