/* Contact form: composes a mail draft - no backend needed on static hosting.
   The browser's own validation bubbles are unstyled, vanish on the next
   click and are announced inconsistently, so the errors are said in the
   page instead: named, tied to their field, and read out on submit. */
(function(){
  var f=document.getElementById('cform');
  if(!f) return;
  var TO='jamess.a.magpantay@gmail.com';

  var FIELDS=[
    {el:'cf-name', err:'err-name', label:'name',
     check:function(v){ return v ? '' : 'Please tell me your name.'; }},
    {el:'cf-from', err:'err-from', label:'email',
     check:function(v){
       if(!v) return 'Please leave an email so I can reply.';
       return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That does not look like an email address.';
     }},
    {el:'cf-msg',  err:'err-msg',  label:'message',
     check:function(v){
       if(!v) return 'A line or two about the role would help.';
       return v.length < 10 ? 'A little more detail, if you can.' : '';
     }}
  ];

  function mark(spec, msg){
    var el=document.getElementById(spec.el), box=document.getElementById(spec.err);
    if(msg){
      el.setAttribute('aria-invalid','true');
      box.textContent=msg; box.classList.add('on');
    } else {
      el.removeAttribute('aria-invalid');
      box.textContent=''; box.classList.remove('on');
    }
    return !msg;
  }
  /* correct a field and the complaint goes away as you type, not on resubmit */
  FIELDS.forEach(function(spec){
    var el=document.getElementById(spec.el);
    el.addEventListener('input', function(){
      if(el.getAttribute('aria-invalid') === 'true' && !spec.check(el.value.trim())) mark(spec, '');
    });
    el.addEventListener('blur', function(){
      if(el.value.trim()) mark(spec, spec.check(el.value.trim()));
    });
  });

  f.addEventListener('submit', function(e){
    e.preventDefault();
    var bad=null, n=0;
    FIELDS.forEach(function(spec){
      var el=document.getElementById(spec.el);
      var msg=spec.check(el.value.trim());
      if(!mark(spec, msg)){ n++; if(!bad) bad=el; }
    });
    if(bad){
      bad.focus();
      window.toast('err','Not sent', n===1 ? 'One field needs attention.' : n+' fields need attention.');
      return;
    }
    var v=function(id){ return document.getElementById(id).value.trim(); };
    var name=v('cf-name');
    var subject='Portfolio enquiry from '+(name||'a visitor');
    var body=v('cf-msg')+'\n\n-\n'+name+'\n'+v('cf-from');
    window.toast('ok','Opening your mail app',
      'The draft is addressed to '+TO+'. If nothing opens, copy the address instead.');
    location.href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });

  var c=document.getElementById('cf-copy');
  c.addEventListener('click', function(){
    window.copyText(TO, function(ok){
      if(ok){
        var t=c.textContent; c.textContent='Copied ✓';
        setTimeout(function(){ c.textContent=t; }, 1800);
        window.toast('ok','Address copied', TO);
      } else {
        window.toast('err','Could not copy', 'The address is '+TO);
      }
    });
  });
})();

/* Discord has no public profile URL from a username - copy it, then open the app. */
(function(){
  var dc=document.getElementById('dc');
  if(!dc) return;
  dc.addEventListener('click', function(){
    window.copyText('d.grimes', function(ok){
      if(ok) window.toast('ok','Discord handle copied','d.grimes');
      else   window.toast('info','My Discord handle','d.grimes');
    });
    dc.classList.add('revealed');
    setTimeout(function(){ dc.classList.remove('revealed'); }, 2000);
  });
})();
