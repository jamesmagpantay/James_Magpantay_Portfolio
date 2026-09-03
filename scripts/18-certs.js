/* Certification viewer: click a hero sticker or a ledger row to see the
   certificate itself where one's been uploaded, or a plain status note
   where it hasn't. Reuses the project modal's shell (.pm/.pm-panel/
   .pm-shot/.pm-body/.fact/.pm-links, #cm in the markup) since it already
   does "image or not, title, description, a highlighted fact, a link"
   well - the fact line carries the status detail here instead of a
   project's metric, and the one link is a verify URL instead of code/demo. */
(function(){
  var cm = document.getElementById('cm');
  if(!cm) return;
  var shot   = document.getElementById('cm-shot'),
      img    = document.getElementById('cm-img'),
      empty  = document.getElementById('cm-empty'),
      emptyTxt = document.getElementById('cm-empty-txt'),
      emptyDefault = emptyTxt ? emptyTxt.textContent : 'Certificate not uploaded yet',
      status = document.getElementById('cm-status'),
      title  = document.getElementById('cm-title'),
      copy   = document.getElementById('cm-copy'),
      fact   = document.getElementById('cm-fact'),
      verify = document.getElementById('cm-verify');

  /* `verify` is left unset everywhere for now - James will send the actual
     verification URLs later. Until then every cert's Verify link renders
     disabled/greyed out, same treatment the project modal already gives a
     repo or demo link that isn't filled in yet. */
  var CERTS = {
    ctia: {
      title: 'Cyber Threat Intelligence Analysis', earned: true, statusLabel: 'Earned',
      desc: 'Threat intelligence lifecycle work: collection, analysis, and reporting on adversary behavior. Sponsored by TESDA.',
      fact: "Earned via CTIA Level III (AMA), 2026. Certificate photo not uploaded yet.",
      emptyNote: 'Earned — photo pending upload'
    },
    ccp: {
      title: 'Certified Cybersecurity Professional', earned: true, statusLabel: 'Earned',
      desc: 'Broad cybersecurity fundamentals: security operations, risk, and best practices.',
      fact: 'Earned via Appkademiya, 2026.',
      img: 'photos/certs/ccp.png'
    },
    google: {
      title: 'Google Cybersecurity Professional', statusLabel: 'In progress',
      desc: "Google's professional track: security foundations, network defense, and incident response.",
      fact: "In progress via Coursera. The certificate lands here once it's earned."
    },
    isc2cc: {
      title: 'ISC2 Certified in Cybersecurity', statusLabel: 'Candidate',
      desc: "ISC2's entry-level credential: security principles and network security basics.",
      fact: "The scheduled exam had to be missed after sudden flooding from severe weather made it unsafe to travel. Now in talks with Pearson VUE and ISC2, hoping for a reschedule soon."
    },
    secplus: {
      title: 'CompTIA Security+', statusLabel: 'Target',
      desc: 'Industry-standard credential covering core security functions: threats, architecture, operations.',
      fact: 'On the roadmap, not started yet. Next up after CCNA.'
    },
    ccna: {
      title: 'Cisco CCNA', statusLabel: 'Target',
      desc: 'Networking fundamentals: routing, switching, and network security.',
      fact: 'In training via Cisco NetConnect PUP. Certificate pending completion.'
    },
    isc2candidate: {
      title: 'ISC2 Candidate', statusLabel: 'Active',
      desc: 'Standing membership with ISC2 while working toward full certification.',
      fact: "Active candidate status, a standing rather than an exam result."
    },
    thm: {
      title: 'AI Odyssey CTF', earned: true, statusLabel: 'Completed',
      desc: 'International TryHackMe CTF: prompt injection, traffic interception, and adversarial ML analysis.',
      fact: 'Completed via TryHackMe, 2026.',
      img: 'photos/certs/thm.png'
    }
  };

  /* same disabled-link pattern 04-overlays.js uses for a project's repo/
     demo buttons: no URL yet, so it shows greyed out and inert rather
     than missing. */
  function setLink(a, url){
    if(url){
      a.href = url; a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex');
      a.classList.remove('pm-link-disabled');
    }else{
      a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1;
      a.classList.add('pm-link-disabled');
    }
  }

  function open(key){
    var c = CERTS[key];
    if(!c) return;
    title.textContent = c.title;
    copy.textContent = c.desc;
    fact.textContent = c.fact;
    status.textContent = c.statusLabel;
    status.classList.toggle('earned', !!c.earned);
    setLink(verify, c.verify);
    /* the site-wide broken-image handler (14-feedback.js) watches every
       <img> and marks its .pm-shot host .img-fail the moment the image
       errors - including a plain `img.src = ''`, which resolves to the
       page's own URL and fails to decode as one. removeAttribute avoids
       triggering that fetch at all, so a placeholder cert never gets
       mistaken for a real photo that failed to load. */
    shot.classList.remove('img-fail');
    /* the markup starts the img `hidden` (no-JS fallback); Chrome's own
       [hidden]{display:none} still wins the very first time regardless of
       .pm-shot img's own display:block, so the attribute has to actually
       come off - after that, style.display alone does the toggling. */
    img.hidden = false;
    if(c.img){
      img.src = c.img; img.alt = c.title; img.style.display = '';
      empty.hidden = true;
    }else{
      img.style.display = 'none'; img.removeAttribute('src');
      if(emptyTxt) emptyTxt.textContent = c.emptyNote || emptyDefault;
      empty.hidden = false;
    }
    document.body.classList.add('pm-open');
    cm.classList.add('on');
  }
  function close(){ cm.classList.remove('on'); document.body.classList.remove('pm-open'); img.src=''; }

  document.querySelectorAll('[data-cert]').forEach(function(el){
    function activate(){ open(el.getAttribute('data-cert')); }
    el.addEventListener('click', function(e){ e.stopPropagation(); activate(); });
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(); }
    });
  });

  cm.addEventListener('click', function(e){ if(e.target === cm || e.target.closest('.pm-close')) close(); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
})();
