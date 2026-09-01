/* Site guide: a scripted chat head, not a live AI. It keyword-matches a
   fixed set of topics about James and the site, and can scroll/flip the
   page to the right place. Nothing here calls a network - it is free to
   host and it can never say something about James that wasn't written
   here on purpose. */
(function(){
  var root   = document.getElementById('asst'),
      launch = document.getElementById('asstLaunch'),
      panel  = document.getElementById('asstPanel'),
      closeB = document.getElementById('asstClose'),
      log    = document.getElementById('asstLog'),
      chips  = document.getElementById('asstChips'),
      form   = document.getElementById('asstForm'),
      input  = document.getElementById('asstInput'),
      badge  = document.getElementById('asstBadge'),
      bubble = document.getElementById('asstBubble'),
      bubbleClose = document.getElementById('asstBubbleClose'),
      quip   = document.getElementById('asstQuip');
  if(!root || !launch || !panel || !form || !input) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- the topic set. Each one is a bag of keywords a typed question can
     match against, plus a reply. `chip` is the label IF it's one of the
     handful promoted to a quick-reply button (see QUICK_CHIPS below) -
     everything else here is still fully reachable by typing, just not
     given a permanent button. `view` names which flip state its target
     lives in ('pro' or 'off'); goTo() flips the page first if the visitor
     is on the wrong side. ---- */
  var TOPICS = [
    { id:'projects', chip:'Projects', keywords:['project','projects','siem','scanner','ctf','hackathon','build','built','portfolio','app','vulnerability','nmap'],
      view:'pro', target:'#work', jump:'Show me',
      reply:"Oh, this is the fun part. James builds things that actually catch bad guys: a SIEM with SHA-256 hash-chained audit logs, a Python + Nmap vulnerability scanner, an AWS RAG chatbot, and an international CTF where he prompt-injected his way past an LLM's safety filters." },

    { id:'experience', chip:'Experience', keywords:['experience','intern','internship','job','dost','netconnect','cisco','gdg','google developer','aws cloud club','work history','career'],
      view:'pro', target:'#experience', jump:'Show me',
      reply:"He's a Software Developer Intern at the DOST (fixed a forged-token auth flaw there, no big deal), Vice CTO of Cisco NetConnect PUP, a Cybersecurity Compliance Analyst with Google Developer Groups, and he still finds time for the AWS Cloud Club too. Busy guy." },

    { id:'education', chip:'Education', keywords:['education','school','university','degree','pup','college','gpa','scholar','scholarship','student'],
      view:'pro', target:'#education', jump:'Show me',
      reply:"BSIT at the Polytechnic University of the Philippines (Manila), expected 2028, cybersecurity and networking track. He's also a Gokongwei Brothers Foundation scholar and made President's Lister for AY 2024 to 2025. The nerd credentials check out." },

    { id:'certs', chip:'Certs', keywords:['cert','certs','certificate','certification','certifications','credential','credentials','ccna','security+','isc2','ctia'],
      view:'pro', target:'#certs', jump:'Show me',
      reply:"Badge collection so far: CTIA Level III and Certified Cybersecurity Professional, both earned. Google Cybersecurity Professional and ISC2 Candidate are in progress. Security+ and CCNA are next up on the hit list." },

    { id:'stack', chip:'Tech stack', keywords:['stack','tools','tooling','language','languages','python','skills','technical skills','wireshark','burp','kali'],
      view:'pro', target:'#stack', jump:'Show me',
      reply:"Kali Linux, Burp Suite, Nmap, Wireshark, Elastic SIEM, CyberChef for the security side; Python, C, Java, and SQL for code; Git, GitHub, and Cisco Packet Tracer round it out. He's also comfortable pairing with AI tools like Claude, OpenAI, and Gemini." },

    { id:'hobbies', chip:'Off the clock', keywords:['hobby','hobbies','fun','personal','off the clock','games','gaming','movies','anime','life outside','free time','interests'],
      view:'off', target:'#life', jump:'Take me there',
      reply:"He's not always in incident-response mode, I promise. There's a whole other side of this site: games, movies and shows, speaking gigs, tech events he's crashed. It's one view flip away, want me to take you?" },

    { id:'contact', chip:'Hire him', keywords:['hire','hiring','contact','reach','email','recruit','recruiter','opportunity','available','availability','internship opportunity','apply'],
      view:'pro', target:'#summary', jump:'Take me there',
      reply:"Good news, he's actively looking. Open to internships and entry-level SOC, GRC, network, or cloud security roles, based in Manila, PH. Fastest route in is email, jamess.a.magpantay@gmail.com, or the form at the bottom of the page. I won't take it personally if you skip me." },

    { id:'resume', chip:'Résumé', keywords:['resume','résumé','cv','download'],
      reply:"Say less. Both are ready to go.",
      files:[
        {label:'Download CV', href:'docs/James_Magpantay_CV.pdf'},
        {label:'Download resume', href:'docs/James_Magpantay_Resume.pdf'}
      ] },

    { id:'socials', chip:'Socials', keywords:['linkedin','github','social','socials','discord','facebook','instagram'],
      view:'pro', target:'#contact',
      reply:"LinkedIn, GitHub, Facebook, and Instagram are all sitting in the footer along with his email. Scroll all the way down, or let me take you there." },

    { id:'about', chip:'About James', keywords:['who is james','who are you','about james','about him','tell me about','summary'],
      view:'pro', target:'#summary', jump:'Read more',
      reply:"James Randall A. Magpantay, BSIT student in Manila, building a career out of networking, cybersecurity, and systems administration. Real DOST internship, real CCNA training, real projects that ship real controls. Not bad for a student." }
  ];

  /* the persistent quick-reply row - every topic gets a button now that the
     row scrolls sideways instead of wrapping, ordered roughly by what a
     recruiter or a curious visitor reaches for first. Still just a
     shortcut: every one of these, and a few things that aren't buttons at
     all, are reachable by typing too. */
  var QUICK_CHIPS = ['projects', 'contact', 'certs', 'experience', 'stack', 'education', 'hobbies', 'resume', 'socials', 'about'];

  var GREET = ['hi','hello','hey','yo','sup'];
  var THANKS = ['thanks','thank you','thanks!','ty','appreciate it'];

  /* ---- small talk: the stuff visitors actually type that isn't about the
     site at all - "are you real", "tell me a joke," being annoyed at the
     bot. This is what keeps a scripted bot from dead-ending into "I don't
     understand" the second someone goes off-script; it just can't invent
     new facts about James, so every line here is either a joke, an honest
     admission of what it is, or a redirect back to something real. Checked
     before topic scoring in match(), so these always win over a loose
     keyword coincidence. ---- */
  var SMALLTALK = [
    { keywords:['are you real','are you human','are you a bot','are you ai','are you an ai','are you alive'],
      reply:["Define 'real.' I know an awful lot about James, if that counts for something.",
             "Real enough to point you where you need to go. That's what matters here."] },
    { keywords:['who made you','who built you','who created you','who coded you'],
      reply:"James made me, with Claude doing the actual typing. He named me Bean. I didn't get a vote." },
    { keywords:['what can you do','what do you do','help me','how do you work','what are you'],
      reply:"I'm Bean. I match what you type against a script about James: projects, experience, certs, his stack, hobbies, how to reach him. Try a button below." },
    { keywords:['tell me a joke','make me laugh','say something funny','joke'],
      reply:["Why did the pen tester bring a ladder? To get to the higher level privileges.",
             "James's favorite HTTP status code is 418. I'm a teapot. Mine's 429, too many requests, because that's basically my personality.",
             "There are 10 kinds of people who read this: those who understand binary, and those who don't."] },
    { keywords:['you suck','you\'re dumb','youre dumb','you are dumb','useless','you\'re useless','bad bot','stupid bot'],
      reply:["Fair. I'm a script, not a genius. Give me a real question about James and I'll actually earn my keep.",
             "Ouch, but okay. Try me on something I actually know, like his projects or certs."] },
    { keywords:['who are you really','what is your name','your name','who is bean','whats bean',"what's bean"],
      reply:"Bean. Just Bean, that's the whole name, no last name required. I answer to pretty much anything though, as long as it's about James." },
    /* the joke James specifically asked for - triggers on anything Mr. Bean
       shaped, not just the exact phrase, so "bean???" or "like mr bean?"
       both land here instead of falling through to the generic fallback */
    { keywords:['mr bean','mr. bean','mister bean','rowan atkinson','are you bean','teddy bear','bowler hat'],
      reply:["I'm Bean, not Mr. Bean! No bowler hat, no silent comedy, no yellow car. Just a guy with a script.",
             "Close, but no. Bean, not Mr. Bean. I don't even own a teddy bear."] },
    { keywords:['are you james','is this james'],
      reply:"Nope, I'm Bean, his guide. James is off doing actual security work. I'm the understudy who knows his lines." }
  ];

  /* ---- moods: swap a class on .asst, CSS carries the rest. Transient moods
     (excited, cheeky) pass a revert delay and settle back to welcoming on
     their own; curious and sleepy are idle-driven and persist until real
     activity clears them, below. ---- */
  var MOOD_CLASSES = ['mood-welcoming','mood-excited','mood-curious','mood-sleepy','mood-cheeky','mood-angry'];
  var currentMood = 'welcoming', moodT = null;

  function setMood(name, revertMs){
    if(currentMood === name && !revertMs) return;
    currentMood = name;
    MOOD_CLASSES.forEach(function(c){ root.classList.remove(c); });
    root.classList.add('mood-' + name);
    clearTimeout(moodT);
    if(revertMs) moodT = setTimeout(function(){ setMood('welcoming'); }, revertMs);
  }

  /* ---- open/close ---- */
  var everOpened = false;
  var launchMk = launch.querySelector('.asst-mk');

  function setOpen(v){
    if(v){ cancelThrow(); thrown = false; goHome(); }
    root.classList.toggle('open', v);
    panel.hidden = !v;
    launch.setAttribute('aria-expanded', v ? 'true' : 'false');
    if(window.sfx) window.sfx.play(v ? 'open' : 'close');
    if(launchMk){
      launchMk.classList.remove('pop');
      void launchMk.offsetWidth;              /* restart the animation every press */
      launchMk.classList.add('pop');
      /* the pop is a one-shot layered on top of whichever mood is playing -
         without this the class would sit forever and that mood would never
         get its infinite iteration-count back */
      clearTimeout(launchMk._popT);
      launchMk._popT = setTimeout(function(){ launchMk.classList.remove('pop'); }, 400);
    }
    if(v){
      hideBubble();
      hideQuip();
      badge.hidden = true;
      /* whatever mood the last drag/throw left him in carries into the
         conversation - consumed here, once, so it colors this one opening
         and doesn't linger past it */
      var openMood = playMood; playMood = null;
      setMood(openMood === 'happy' ? 'cheeky' : openMood === 'angry' ? 'angry' : 'excited', 1400);
      if(!everOpened){ everOpened = true; boot(openMood); }
      else if(openMood){ addMsg('bot', pick(PLAY_OPEN_LINES[openMood])); }
      requestAnimationFrame(function(){ input.focus(); });
      /* he's docked next to the panel now, not roaming - goHome() just
         cleared any bob from before, restart it here so he keeps quietly
         breathing/bobbing in place for as long as the conversation lasts,
         instead of going completely still the second you're actually
         talking to him */
      startBob();
    } else {
      /* closing hands him back to roam() - see kickRoam() for why this
         doesn't just happen on its own */
      kickRoam();
    }
  }
  /* a real drag (see the throw physics block near the bottom of this file)
     sets suppressClick so the click that pointerup fires right after
     releasing doesn't also toggle the panel open */
  var suppressClick = false;
  launch.addEventListener('click', function(){
    if(suppressClick){ suppressClick = false; return; }
    setOpen(panel.hidden);
  });
  closeB.addEventListener('click', function(){ setOpen(false); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  /* ---- the greeting speech-bubble - not just a one-time thing anymore.
     It shows once unprompted shortly after load, then again if the visitor
     goes quiet for a while, in a tone that matches whatever mood triggered
     it. Each stage fires at most once a page load, so it nudges without
     nagging. ---- */
  /* first-visit welcome (never seen this browser before) vs. welcome-back
     (asst-greeted already set from a prior visit) - two separate pools so a
     reload doesn't repeat the exact same "hi, I'm Bean" intro every time,
     while still greeting on every fresh page load rather than just once
     ever. Picked in showWelcome() below, not here. */
  var WELCOME_BACK = [
    "Welcome back! Still Bean, still know this site cold.",
    "Hey again! Need a hand finding something this time?",
    "Oh, you're back. Want the tour, or just poking around?"
  ];
  var GREETINGS = {
    excited: [
      "Psst, I'm Bean, James's site guide. Want the tour?",
      "Hi! I'm Bean. I know where all the good stuff is buried. Want a hand?",
      "Oh hey! Bean here. Poke me if you want the shortcut version of this site.",
      "Hi, I'm Bean. Also, you can actually grab and toss me around if you want. Try it."
    ],
    curious: [
      "Still scrolling? I can just point you somewhere specific.",
      "Take your time, or tap me and I'll cut to the chase.",
      "Looking for something in particular? I'm right here."
    ],
    sleepy: [
      "I'll just be over here if you need me.",
      "No rush at all. I'm basically furniture at this point.",
      "Zzz. Tap whenever, I'm not going anywhere."
    ]
  };
  function pick(arr){ return arr[(Math.random() * arr.length) | 0]; }

  function hideBubble(){ bubble.hidden = true; }
  /* the one shared mechanic behind every popup: greetings, idle nudges,
     and (below) reactions to the rest of the page all go through this -
     one speech bubble, one hide timer, one "don't show over an open
     panel" rule, so there's never a second competing popup surface. */
  function showText(text, hideMs, badgeOn){
    if(!panel.hidden) return false;
    /* mid-drag or mid-throw, pointerenter/pointerleave on other elements
       still fire even while the launcher holds pointer capture (capture
       only redirects move/up, not hover), so hovering anything reactive
       while playing with him used to trigger showText() -> goHome(),
       yanking him instantly back to the corner with no animation and
       cutting the throw off. Everything through here is a no-op for as
       long as a play session is active - see the quip system in the
       throw block below for what actually talks during that window. */
    if(dragging || thrown) return false;
    goHome();
    bubble.querySelector('p').textContent = text;
    bubble.hidden = false;
    if(badgeOn) badge.hidden = false;
    clearTimeout(showText._hideT);
    showText._hideT = setTimeout(hideBubble, hideMs);
    return true;
  }
  function showBubble(moodName){
    if(!showText(pick(GREETINGS[moodName]), 14000, true)) return;
    setMood(moodName, moodName === 'excited' ? 2200 : null);
  }
  /* the welcome greeting now fires on every fresh page load/reload, not
     just a visitor's very first-ever visit - James asked for a welcome on
     both a fresh start and a reload. asst-greeted still tracks whether
     this browser has seen the site before, just to pick which of the two
     pools to say, not to gate whether it shows at all any more. */
  function showWelcome(){
    var seenBefore = false;
    try{ seenBefore = !!localStorage.getItem('asst-greeted'); }catch(err){}
    if(!showText(pick(seenBefore ? WELCOME_BACK : GREETINGS.excited), 14000, true)) return;
    setMood('excited', 2200);
    try{ localStorage.setItem('asst-greeted', '1'); }catch(err){}
  }
  bubbleClose.addEventListener('click', function(e){
    e.stopPropagation(); hideBubble();
    try{ localStorage.setItem('asst-greeted', '1'); }catch(err){}
  });
  setTimeout(showWelcome, 3500);

  /* ---- a one-time, separate nudge that he's actually draggable - most
     visitors have no reason to try grabbing a chat launcher, so this spells
     it out once, 20s in, then never again on this browser once either the
     hint has been shown or a real drag has actually happened (checked at
     both ends: skipped up front if `asst-dragged` is already set, and
     cancelled outright the moment a real drag starts - see pointermove
     above). Separate from showWelcome() on purpose: it needs its own timer
     regardless of whether the welcome bubble was dismissed, seen, or timed
     out already, and it's one-shot forever, not repeated on every reload
     the way the welcome now is. ---- */
  var dragHintT = null;
  try{
    if(!localStorage.getItem('asst-dragged') && !localStorage.getItem('asst-drag-hint-shown')){
      dragHintT = setTimeout(function(){
        if(!showText("Oh, and you can actually grab and toss me around if you want. Try it.", 6000, false)) return;
        try{ localStorage.setItem('asst-drag-hint-shown', '1'); }catch(err){}
      }, 20000);
    }
  }catch(err){}

  /* ---- idle drift: quiet too long and the guide gets curious, then
     sleepy - active use (a click, a keystroke, scrolling, moving the
     mouse) resets it straight back to welcoming. Each stage fires once per
     page load, whether or not the first greeting was dismissed. ---- */
  var lastActivity = Date.now(), curiousShown = false, sleepyShown = false;
  function markActivity(){
    lastActivity = Date.now();
    if(currentMood === 'curious' || currentMood === 'sleepy') setMood('welcoming');
  }
  ['pointerdown','pointermove','keydown','scroll'].forEach(function(ev){
    addEventListener(ev, markActivity, { passive: true, capture: true });
  });
  setInterval(function(){
    var idle = Date.now() - lastActivity;
    if(!curiousShown && idle >= 25000){
      curiousShown = true;
      if(panel.hidden) showBubble('curious'); else setMood('curious');
    } else if(!sleepyShown && idle >= 90000){
      sleepyShown = true;
      if(panel.hidden) showBubble('sleepy'); else setMood('sleepy');
    }
  }, 5000);

  /* ---- rendering ---- */
  function addMsg(who, html, actions){
    var el = document.createElement('div');
    el.className = 'amsg amsg-' + who;
    el.innerHTML = '<p>' + html + '</p>';
    if(actions && actions.length){
      var wrap = document.createElement('div');
      wrap.className = 'amsg-actions';
      actions.forEach(function(a){
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = a.label;
        b.addEventListener('click', a.run);
        wrap.appendChild(b);
      });
      el.appendChild(wrap);
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function escapeHtml(s){
    return s.replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; });
  }

  function actionsFor(topic){
    var acts = [];
    if(topic.target){
      acts.push({ label: topic.jump || 'Take me there', run: function(){ goTo(topic); } });
    }
    if(topic.files){
      topic.files.forEach(function(f){
        acts.push({ label: f.label, run: function(){ download(f.href); } });
      });
    }
    return acts;
  }

  function reply(topic){
    addMsg('bot', topic.reply, actionsFor(topic));
    setMood('cheeky', 1700);
  }

  function goTo(topic){
    if(window.sfx) window.sfx.play('click');
    var wantOff = topic.view === 'off';
    var isOff = document.body.classList.contains('offline');
    function jump(){
      var el = document.querySelector(topic.target);
      if(el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
    if(wantOff !== isOff && window.flipView){
      window.flipView();
      setTimeout(jump, REDUCED ? 30 : 320);
    } else {
      jump();
    }
    setOpen(false);
  }

  function download(href){
    if(window.sfx) window.sfx.play('click');
    var a = document.createElement('a');
    a.href = href; a.setAttribute('download', '');
    document.body.appendChild(a); a.click(); a.remove();
  }

  function buildChips(){
    chips.innerHTML = '';
    QUICK_CHIPS.forEach(function(id){
      var t = TOPICS.filter(function(x){ return x.id === id; })[0];
      if(!t) return;
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = t.chip;
      b.addEventListener('click', function(){
        if(window.sfx) window.sfx.play('click');
        addMsg('user', escapeHtml(t.chip));
        reply(t);
      });
      chips.appendChild(b);
    });
  }

  /* ---- drag-to-scroll the chip row with the cursor, same pattern the
     projects rail uses: touch already scrolls natively, so this is a
     mouse-only affordance. A real drag (past a few px) suppresses the
     click that would otherwise fire on whatever chip the cursor lands on
     when released. ---- */
  (function(){
    var x0 = 0, s0 = 0, held = false, caught = false;
    chips.addEventListener('pointerdown', function(e){
      if(e.pointerType !== 'mouse' || e.button !== 0) return;
      held = true; x0 = e.clientX; s0 = chips.scrollLeft; caught = false;
    });
    chips.addEventListener('pointermove', function(e){
      if(!held) return;
      var dx = e.clientX - x0;
      if(Math.abs(dx) > 3 && !caught){
        caught = true;
        chips.classList.add('dragging');
        chips.setPointerCapture(e.pointerId);
      }
      if(caught) chips.scrollLeft = s0 - dx;
    });
    function release(){
      if(!held) return;
      held = false; caught = false;
      chips.classList.remove('dragging');
    }
    chips.addEventListener('pointerup', release);
    chips.addEventListener('pointercancel', release);
  })();

  var BOOTS = [
    "Hey! I'm Bean, James's site guide. Don't ask me about the weather. Tap something below or just type.",
    "Hi there. I'm Bean, not James, but I know this site cold. What are you after?"
  ];
  /* if a drag/throw session was still fresh when the panel opened, the
     very first thing he says reflects it instead of the neutral boot
     line - same idea as the mood carrying into the icon animation, just
     applied to the opening message too */
  var BOOTS_HAPPY = [
    "Okay that was fun. Anyway, hi, I'm Bean, James's site guide. What are you after?",
    "Ha, again sometime. I'm Bean, James's site guide, by the way. What do you need?"
  ];
  var BOOTS_ANGRY = [
    "I'm still recovering from that, but fine. I'm Bean, James's site guide. What do you need?",
    "We're going to pretend that didn't happen. I'm Bean, James's site guide. What are you after?"
  ];
  function boot(mood){
    var pool = mood === 'happy' ? BOOTS_HAPPY : mood === 'angry' ? BOOTS_ANGRY : BOOTS;
    addMsg('bot', pick(pool));
    buildChips();
  }
  /* the short version, for when he's already been opened before and this
     is just a passing remark rather than the whole opening line */
  var PLAY_OPEN_LINES = {
    happy: ["That was fun, by the way.", "We should do that again sometime.", "Okay, still buzzing from that throw."],
    angry: ["I have not forgiven you for that, by the way.", "Still recovering from being thrown, for the record.", "We need to talk about what just happened."]
  };

  var FALLBACKS = [
    "Hmm, that one's outside what I know. Try a button below, or go straight to the source: <a href=\"mailto:jamess.a.magpantay@gmail.com\">jamess.a.magpantay@gmail.com</a>",
    "I've got nothing for that. I'm no oracle. Pick a topic below?",
    "That's above my pay grade (I'm unpaid, technically). Try one of these instead:"
  ];
  var THANKS_REPLIES = ["Anytime! Anything else?", "That's what I'm here for. Need anything else?", "You got it. What else can I dig up?"];

  /* ---- typed questions: small talk first (it's about the bot, not the
     site, so a topic keyword coincidence shouldn't win), then score every
     topic by keyword hits and take the best. ---- */
  function match(q){
    q = q.toLowerCase().replace(/[?!.,]+$/g, '').trim();
    if(GREET.some(function(w){ return q === w || q.indexOf(w) === 0; })){
      return { reply: "Hey yourself! Ask me about projects, experience, certs, or how to reach James, or tap a topic below." };
    }
    if(THANKS.some(function(w){ return q.indexOf(w) > -1; })){
      return { reply: pick(THANKS_REPLIES) };
    }
    var smalltalk = null;
    SMALLTALK.forEach(function(s){
      if(smalltalk) return;
      if(s.keywords.some(function(k){ return q.indexOf(k) > -1; })){
        smalltalk = { reply: Array.isArray(s.reply) ? pick(s.reply) : s.reply };
      }
    });
    if(smalltalk) return smalltalk;
    var best = null, bestScore = 0;
    TOPICS.forEach(function(t){
      var score = 0;
      t.keywords.forEach(function(k){ if(q.indexOf(k) > -1) score += k.length; });
      if(score > bestScore){ bestScore = score; best = t; }
    });
    return best;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var q = input.value.trim();
    if(!q) return;
    if(window.sfx) window.sfx.play('key');
    addMsg('user', escapeHtml(q));
    input.value = '';
    var hit = match(q);
    if(!hit){
      addMsg('bot', pick(FALLBACKS));
      setMood('curious', 1800);
      return;
    }
    if(hit.id) reply(hit);
    else addMsg('bot', hit.reply);
  });

  /* ---- the chathead roams, continuously, not just an occasional twitch.
     While closed and the visitor hasn't touched anything, it patrols a
     small zone up and left of its home corner - a new spot every couple of
     seconds, with frequent quick trips home to "check in" before heading
     back out - so there's almost always something happening in that
     corner even with nobody near it. It always comes fully home before the
     bubble or panel is shown, since both are positioned relative to the
     (stationary) container box, not wherever the button has wandered to.

     Every actual move also warps the circle itself - a cartoon squash and
     stretch aligned with whichever axis that hop covers more of, so it
     reads as a body launching itself in a direction, not a dot sliding. */
  var roamT = null, curX = 0, curY = 0;
  /* small, low-key asides for idle wandering - not reactions to anything,
     just him thinking out loud while he drifts. Deliberately mundane/quiet
     rather than punchy, so it reads as ambient personality and not as if
     every hop is trying to be a joke. */
  var ROAM_LINES = [
    "Just stretching my legs.", "Don't mind me.", "Patrolling.", "Nothing much going on.",
    "Taking the scenic route.", "Just doing my rounds.", "Exploring the corners.",
    "Still here, just wandering.", "Keeping the corner warm.", "La la la."
  ];
  /* roam() is self-perpetuating (each call reschedules itself, deferring
     quietly whenever the panel's open or he's being played with) - but
     that chain only survives if something is still holding a pending
     timer. `pointerdown` clears it on purpose so a drag can't be fighting
     a scheduled hop, and nothing was ever calling roam() again afterward -
     so the very first click, drag or not, silently ended roaming forever.
     kickRoam() is the fix: call it after any interaction ends (a plain
     click, a completed drag/throw, closing the panel) to hand the chain
     back to roam(), which immediately re-evaluates and either moves him
     or quietly reschedules itself, same as it always did. */
  function kickRoam(){
    if(REDUCED) return;
    clearTimeout(roamT);
    roamT = setTimeout(roam, 900 + Math.random() * 900);
  }
  function warpFor(dx, dy){
    if(!dx && !dy) return;
    var cls = Math.abs(dx) >= Math.abs(dy) ? 'warp-x' : 'warp-y';
    launch.classList.remove('warp-x', 'warp-y');
    void launch.offsetWidth;               /* forces the animation to restart every hop */
    launch.classList.add(cls);
  }
  function moveTo(x, y, tiltDeg){
    warpFor(x - curX, y - curY);
    curX = x; curY = y;
    launch.style.translate = x.toFixed(0) + 'px ' + y.toFixed(0) + 'px';
    launch.style.rotate = tiltDeg + 'deg';
  }
  function goHome(){
    clearTimeout(bobT);
    launch.style.scale = '1';
    if(curX === 0 && curY === 0) return;
    moveTo(0, 0, 0);
  }
  function roam(){
    clearTimeout(roamT);
    if(REDUCED || !panel.hidden || !bubble.hidden || dragging || thrown){
      roamT = setTimeout(roam, 2600);
      return;
    }
    /* roughly one wander in four is a quick trip home instead of another
       far corner - reads as him pausing to "check on" his post before
       drifting off again, rather than just teleporting point to point */
    if((curX || curY) && Math.random() < 0.28){
      goHome();
      roamT = setTimeout(roam, 800 + Math.random() * 1000);
      return;
    }
    var x = -(18 + Math.random() * 70), y = -(14 + Math.random() * 88);
    var tilt = (Math.random() * 22 - 11).toFixed(1);
    moveTo(x, y, tilt);
    startBob();
    /* a roughly one-in-three chance of a little aside on landing - reuses
       the same quip bubble the drag/throw play session talks through
       (positioned on him wherever he actually is, no goHome() call), so
       idle wandering gets the same small, on-him speech style instead of
       the bigger docked .asst-bubble every other reaction uses. */
    if(Math.random() < 0.35) showQuip(pick(ROAM_LINES), 1600);
    roamT = setTimeout(roam, 1200 + Math.random() * 1500);
  }
  /* a tiny restless bob while it's paused between hops - stops the instant
     it moves again or heads home, so it never fights the travel transition */
  var bobT = null, bobOn = false;
  function scheduleBob(){
    bobT = setTimeout(function(){
      bobOn = !bobOn;
      launch.style.scale = bobOn ? '1.05' : '1';
      /* a small, occasional rotate-only shake layered on top of the bob -
         a passive "you can grab me" cue, distinct from the warp/bounce
         animations that only ever play mid-hop or mid-throw. Low odds per
         tick (bob ticks every ~420-700ms) so it reads as an occasional
         idle fidget, not a constant twitch. */
      if(!REDUCED && Math.random() < 0.1){
        launch.classList.remove('tug');
        void launch.offsetWidth;
        launch.classList.add('tug');
      }
      scheduleBob();
    }, 420 + Math.random() * 280);
  }
  /* the actual toggle lives in scheduleBob(), which reschedules itself
     without touching bobOn - startBob() only resets bobOn on a fresh start
     (panel opening, a new hop). Folding that reset into the recursive call
     itself was the old bug: every cycle forced bobOn back to false right
     before the next fire, so it only ever flipped false->true and the
     badge froze at scale 1.05 instead of pulsing. */
  function startBob(){
    clearTimeout(bobT);
    bobOn = false;
    scheduleBob();
  }
  if(!REDUCED) roamT = setTimeout(roam, 1800 + Math.random() * 1200);

  /* ---- throwable, like a basketball. Grabbing the chathead and dragging
     it past a small threshold hands it off from the roam system to a tiny
     physics sim: release velocity, gravity, and bounces off the edges of
     the viewport with energy lost on each hit, exactly like a dropped
     ball, until it's slow enough to call settled. The whole play session
     (grab through settle) commits to one temperament - happy or annoyed,
     picked once at grab - and talks through it via a little callout that
     follows the ball around, not just a silent mood animation.

     A real drag suppresses the click that pointerup fires afterward (see
     `suppressClick` above `setOpen`), so letting go mid-throw doesn't also
     pop the chat panel open. A plain click/tap - no meaningful movement -
     is left alone entirely and behaves exactly as it always has: it opens
     the panel, which calls goHome() and always wins over wherever he's
     landed, per "once clicked he returns to the corner." That's also
     where the persisted mood pays off - see setOpen() and boot() above.
     Touch is currently left to its native behavior (no throw) since
     there's no drag threshold to fall back on the way the mouse has a
     stray click. */
  var GRAVITY = 2900, HOME_PULL = 1500, BOUNCE = 0.52, FLOOR_FRICTION = 0.82, AIR_DRAG = 0.999;
  var REST_V = 60; /* below this speed a wall/floor touch is resting, not a fresh impact */
  var dragging = false, thrown = false, dragMoved = false;
  var dragX0 = 0, dragY0 = 0, dragTX0 = 0, dragTY0 = 0, dragSamples = [];
  var physicsRAF = null, bounds = null, homeNat = null;
  /* the mood for the *current* play session - set once at grab, read by
     every quip/mood call during that drag or throw, and left behind for
     setOpen()/boot() to pick up once the visitor actually clicks him */
  var playMood = null, lastPlayQuipAt = 0, moodRevertT = null;

  var PLAY_LINES = {
    happy: {
      grab:   ["Wheee!", "Ooh, hi!", "Yes, let's go!"],
      during: ["This is fun!", "Again, again!", "Weeeeee!", "Faster!"],
      throw:  ["Byeee!", "Catch me!", "Wheeeeee!"],
      bounce: ["Boing!", "Ha!", "Bouncy!"],
      settle: ["That was fun.", "Let's do that again sometime.", "Whew, fun landing."]
    },
    angry: {
      grab:   ["Hey!", "Whoa, watch it!", "Excuse me!"],
      during: ["Put me down!", "This isn't fun!", "Seriously?", "I did not consent to this!"],
      throw:  ["Bring me back now!", "You'll regret this!", "Not cool!"],
      bounce: ["Ow!", "Hey!", "Watch it!"],
      settle: ["Finally.", "Never doing that again.", "I need a minute."]
    }
  };

  /* the quip trails the ball itself, so it's positioned in real viewport
     pixels (homeNat + current translate), not docked to .asst's own box
     the way .asst-bubble is - and unlike showText()/say(), it never calls
     goHome(), on purpose: the whole point is to keep talking from wherever
     he currently is. */
  var quipT = null;
  function positionQuip(){
    if(!homeNat) return;
    quip.style.left = (homeNat.left + curX + homeNat.w / 2) + 'px';
    quip.style.top = (homeNat.top + curY - 6) + 'px';
  }
  function showQuip(text, ms){
    quip.textContent = text;
    positionQuip();
    quip.classList.add('on');
    clearTimeout(quipT);
    quipT = setTimeout(function(){ quip.classList.remove('on'); }, ms || 1400);
  }
  function hideQuip(){
    clearTimeout(quipT);
    quip.classList.remove('on');
  }

  function measureBounds(){
    var r = launch.getBoundingClientRect();
    var natLeft = r.left - curX, natTop = r.top - curY;
    homeNat = { left: natLeft, top: natTop, w: r.width, h: r.height };
    bounds = {
      minX: -natLeft, maxX: innerWidth - natLeft - r.width,
      minY: -natTop,  maxY: innerHeight - natTop - r.height
    };
  }
  function cancelThrow(){
    if(physicsRAF) cancelAnimationFrame(physicsRAF);
    physicsRAF = null; thrown = false;
    clearTimeout(moodRevertT);
    hideQuip();
  }

  launch.addEventListener('pointerdown', function(e){
    if(REDUCED || e.pointerType !== 'mouse' || e.button !== 0) return;
    cancelThrow();
    clearTimeout(roamT); clearTimeout(bobT);
    measureBounds();
    dragging = true; dragMoved = false;
    dragX0 = e.clientX; dragY0 = e.clientY; dragTX0 = curX; dragTY0 = curY;
    dragSamples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    launch.classList.add('no-glide');
  });
  launch.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var dx = e.clientX - dragX0, dy = e.clientY - dragY0;
    if(!dragMoved && Math.hypot(dx, dy) > 6){
      dragMoved = true;
      /* once a visitor has actually dragged him for real, the one-time
         "try dragging me" nudge below never needs to fire again on this
         browser - cancel it outright if it's still pending, and record
         the fact so a future reload doesn't schedule it at all */
      clearTimeout(dragHintT);
      try{ localStorage.setItem('asst-dragged', '1'); }catch(err){}
      try{ launch.setPointerCapture(e.pointerId); }catch(err){}
      /* the temperament for this whole play session, decided the instant
         a real drag is confirmed - everything from here to settle() reads
         this one value rather than rolling fresh each time */
      playMood = Math.random() < 0.5 ? 'happy' : 'angry';
      setMood(playMood === 'happy' ? 'cheeky' : 'angry');
      showQuip(pick(PLAY_LINES[playMood].grab), 1300);
      lastPlayQuipAt = performance.now();
    }
    if(!dragMoved) return;
    curX = dragTX0 + dx; curY = dragTY0 + dy;
    launch.style.translate = curX.toFixed(0) + 'px ' + curY.toFixed(0) + 'px';
    launch.style.rotate = Math.max(-24, Math.min(24, dx * 0.12)).toFixed(1) + 'deg';
    positionQuip();
    /* a fresh line every so often while he's actually being dragged
       around, not just at grab and release */
    var now = performance.now();
    if(now - lastPlayQuipAt > 900){
      lastPlayQuipAt = now;
      showQuip(pick(PLAY_LINES[playMood].during), 1200);
    }
    dragSamples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if(dragSamples.length > 5) dragSamples.shift();
  });
  launch.addEventListener('pointerup', function(){
    if(!dragging) return;
    dragging = false;
    kickRoam(); /* revive the chain pointerdown paused, whichever way this ends */
    if(!dragMoved){ launch.classList.remove('no-glide'); return; }
    suppressClick = true;
    var vx = 0, vy = 0;
    if(dragSamples.length >= 2){
      var a = dragSamples[0], b = dragSamples[dragSamples.length - 1];
      var dt = (b.t - a.t) || 16;
      vx = (b.x - a.x) / dt * 1000;
      vy = (b.y - a.y) / dt * 1000;
    }
    throwFrom(vx, vy);
  });
  launch.addEventListener('pointercancel', function(){
    dragging = false;
    launch.classList.remove('no-glide');
    kickRoam();
  });

  function throwFrom(vx, vy){
    /* no warpFor() here on purpose - it drives the same `scale` property as
       the .bounce squash below over an overlapping .85s window, and a real
       throw almost always bounces within that window, so the two would
       fight each other for the same property. The bounce squash alone
       already sells the impact; the release itself doesn't need its own
       stretch the way a roam hop does. */
    thrown = true;
    if(window.sfx) window.sfx.play('big');
    if(!playMood) playMood = Math.random() < 0.5 ? 'happy' : 'angry'; /* touch/edge-case fallback */
    clearTimeout(moodRevertT);
    setMood(playMood === 'happy' ? 'cheeky' : 'angry');
    showQuip(pick(PLAY_LINES[playMood].throw), 1300);
    runPhysics(vx, vy);
  }

  function runPhysics(vx, vy){
    var last = performance.now(), startT = last;
    function frame(t){
      var dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      vy += GRAVITY * dt;
      /* gravity doesn't just pull down - it pulls toward home too (curX=0
         is straight down from the corner), a constant sideways
         acceleration rather than a spring, so the trajectory still reads
         as falling, just falling on a diagonal that happens to end at the
         corner instead of wherever momentum ran out. This is also what
         gets him rolling the rest of the way home once he's already
         landed: the vertical bounce loses energy to floor friction, but
         this keeps pushing sideways the whole time. */
      if(Math.abs(curX) > 2) vx += (curX < 0 ? HOME_PULL : -HOME_PULL) * dt;
      vx *= Math.pow(AIR_DRAG, dt * 1000);
      curX += vx * dt; curY += vy * dt;
      var bounced = false, onFloor = false;
      /* REST_V separates a real impact from an object resting against a
         wall/floor: once he's landed, gravity pulls him back past
         bounds.maxY by a tiny amount almost every single frame (a classic
         artifact of an event-driven bounce model with no explicit "resting"
         state), and treating every one of those as a fresh bounce meant
         the land sound and the .bounce reflow were firing dozens of times
         a second - audibly glitching - while FLOOR_FRICTION got reapplied
         every frame too, crushing vx before HOME_PULL could ever actually
         roll him anywhere. Below this speed it's just resting: clamp the
         position, zero that axis's velocity, and skip the impact effects
         entirely rather than bouncing an already-negligible number. */
      if(curX < bounds.minX){
        curX = bounds.minX;
        if(Math.abs(vx) > REST_V){ vx = -vx * BOUNCE; bounced = true; } else vx = 0;
      }
      if(curX > bounds.maxX){
        curX = bounds.maxX;
        if(Math.abs(vx) > REST_V){ vx = -vx * BOUNCE; bounced = true; } else vx = 0;
      }
      if(curY < bounds.minY){
        curY = bounds.minY;
        if(Math.abs(vy) > REST_V){ vy = -vy * BOUNCE; bounced = true; } else vy = 0;
      }
      if(curY > bounds.maxY){
        curY = bounds.maxY; onFloor = true;
        if(Math.abs(vy) > REST_V){ vy = -vy * BOUNCE; vx *= FLOOR_FRICTION; bounced = true; } else vy = 0;
      }
      launch.style.translate = curX.toFixed(0) + 'px ' + curY.toFixed(0) + 'px';
      launch.style.rotate = Math.max(-70, Math.min(70, curX * 0.3)).toFixed(1) + 'deg';
      positionQuip();
      if(bounced){
        if(window.sfx) window.sfx.play('land');
        launch.classList.remove('bounce');
        void launch.offsetWidth;
        launch.classList.add('bounce');
        /* not every single bounce - a ball bouncing rapidly near the end
           would otherwise spam a line every hundred milliseconds */
        if(Math.random() < 0.5) showQuip(pick(PLAY_LINES[playMood].bounce), 700);
      }
      var speed = Math.hypot(vx, vy);
      /* settled means actually home, not just resting somewhere on the
         floor - comments stay off (see the dragging||thrown guard in
         showText()) for the whole roll, not just the fall and bounce */
      var home = onFloor && Math.abs(curX) < 8 && speed < 60;
      /* a safety floor: HOME_PULL always wins eventually, but a soft or
         unlucky throw could take a few seconds to visibly roll all the
         way there - cap it so a play session can never leave comments
         off indefinitely */
      var timedOut = (t - startT) > 6000;
      if(home || timedOut){
        physicsRAF = null;
        settle();
        return;
      }
      physicsRAF = requestAnimationFrame(frame);
    }
    physicsRAF = requestAnimationFrame(frame);
  }

  function settle(){
    thrown = false;
    launch.classList.remove('no-glide');
    /* the roll can end a few px short of true home if it hit the timeout
       floor above - close it out properly through moveTo() rather than
       leaving him slightly off-corner, same warp-on-arrival treatment as
       every other real move */
    if(curX !== 0 || curY !== 0) moveTo(0, 0, 0);
    else launch.style.rotate = '0deg';
    startBob();
    showQuip(pick(PLAY_LINES[playMood].settle), 1600);
    /* the icon relaxes back to idling shortly after - playMood itself
       stays set, waiting for setOpen()/boot() to read it whenever the
       visitor actually clicks him next */
    clearTimeout(moodRevertT);
    moodRevertT = setTimeout(function(){ setMood('welcoming'); }, 1800);
    /* stays wherever it landed, idling, until the visitor clicks it - or
       until roam() picks him up again on its own, which kickRoam() here
       guarantees rather than hoping the chain survived the whole throw */
    kickRoam();
  }

  addEventListener('resize', function(){ if(dragging || thrown) measureBounds(); });

  /* ---- reacting to the rest of the page. Toggles (theme, sound, music,
     the security/off-the-clock flip) get a bespoke line tied to whichever
     state they land on. Everything else - nav links, project cards, cert
     stickers, the "Hire the candidate" CTA, download links, and so on -
     gets a short, lighter quip: personalized with the element's own label
     when it has one (a heading, a bolded sticker title, a link's own
     text), generic otherwise.

     Delivered through his own speech bubble - the same popup the
     greetings and idle nudges already use, via showText() - rather than a
     separate toast, so every single thing he says lands in one
     recognisable place. Showing it calls goHome() (inside showText),
     which is a deliberate trade: a reaction always snaps him back to his
     corner first, interrupting a roam or even a throw in progress, so the
     bubble never ends up pointing at wherever he'd wandered off to. A
     shared cooldown and a "not while the chat panel is open" guard keep
     this from turning into a running commentary. */
  function say(text, hideMs){
    showText(text, hideMs || 4500, false);
  }
  /* rate limiting without going stale: a plain "too soon, drop it" gate
     meant one hover/click landing inside another one's cooldown just did
     nothing, leaving the bubble sitting on whatever the *previous*
     interaction said - which reads as "stuck on the wrong thing," because
     it is. react() instead queues the newest request and fires it the
     moment the cooldown clears, and every new call replaces whatever was
     still pending - so the bubble always eventually catches up to the
     last thing actually hovered or clicked, it just never shows something
     stale. `run` is a closure so it reads fresh state (current theme,
     current label) at the moment it actually fires, not at request time. */
  var reactTimer = null, lastReactAt = 0, pageLoadAt = Date.now();
  function react(run, minGap){
    clearTimeout(reactTimer);
    function attempt(){
      if(!panel.hidden) return;                 /* don't compete with an open chat */
      if(Date.now() - pageLoadAt < 3000) return; /* let the page's own load-in settle first */
      lastReactAt = Date.now();
      run();
    }
    var wait = minGap - (Date.now() - lastReactAt);
    if(wait <= 0) attempt();
    else reactTimer = setTimeout(attempt, wait);
  }

  /* -- toggles: each reacts to the state it just landed on, not the one it
     left. All three site controls update their own aria-pressed/data-theme
     synchronously inside their own click handlers, which - since those
     scripts load and therefore attach their listeners before this one -
     always run before ours does on the same click, so reading state here
     is always reading the *new* value. -- */
  var THEME_LINES = {
    dark:  ["Ooh, dark mode. Very hacker of you.", "Lights off. My favorite look on this site.", "Stealth mode: engaged."],
    light: ["Back to the light. Can't lurk forever.", "Sunny again, give my eyes a second.", "Light mode. Bold choice."]
  };
  document.querySelectorAll('.thm-btn').forEach(function(b){
    b.addEventListener('click', function(){
      react(function(){
        var t = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        say(pick(THEME_LINES[t]));
      }, 1200);
    });
  });

  var SFX_LINES = {
    on:  ["Sound's back. I missed my own clicks.", "Turning me back up, nice.", "Sound on. Let's make some noise."],
    off: ["Muting me? Rude, but fair.", "Sound off. I'll mime my reactions now.", "Quiet mode. Respect."]
  };
  document.querySelectorAll('.sfx-btn').forEach(function(b){
    b.addEventListener('click', function(){
      react(function(){
        say(pick(SFX_LINES[window.sfx && window.sfx.isOn() ? 'on' : 'off']));
      }, 1200);
    });
  });

  /* the soundtrack is two actual tracks, one per view (see 09-sound.js:
     "taut and atmospheric on the security side, warm and jazzy off the
     clock") - this is JM's own reaction to it, not James's, the same
     first-person "my favorite" voice he already uses for the theme and
     the view flip below, just applied to the soundtrack too */
  var MUS_ON_PRO = ["I love this track. Moody, atmospheric, keeps me locked in.", "This one's one of my favorites for the security side.", "Great pick, this is my go to for focus."];
  var MUS_ON_OFF = ["I love this one for downtime. Warm, jazzy, good company.", "This is one of my favorites for off the clock.", "My go to off hours track, honestly."];
  var MUS_OFF_LINES = ["Music off. Even I need quiet sometimes.", "No music? Fair, but you're missing one of my favorites.", "Tunes off, noted. Your loss, I love that one."];
  document.querySelectorAll('.mus-btn').forEach(function(b){
    b.addEventListener('click', function(){
      react(function(){
        var on = b.getAttribute('aria-pressed') === 'true';
        if(!on){ say(pick(MUS_OFF_LINES)); return; }
        say(pick(document.body.classList.contains('offline') ? MUS_ON_OFF : MUS_ON_PRO));
      }, 1200);
    });
  });

  var FLIP_LINES = {
    off: ["Welcome to the fun side.", "Ooh, off the clock. My favorite tab.", "Now we're talking hobbies, not headers."],
    pro: ["Back to business mode.", "Security profile, engaged.", "Professional face: on."]
  };
  document.addEventListener('viewflip', function(e){
    react(function(){
      say(pick(FLIP_LINES[e.detail && e.detail.offline ? 'off' : 'pro']));
    }, 1200);
  });

  /* fired by 05-contact.js on a failed submit (see 'contactinvalid' there) -
     separate from the CF_LINES focus reactions above (which comment on
     landing in a field) and from the centered toast (which names exactly
     what's wrong). This one's just a quick aside acknowledging the miss,
     singular/plural aware to match the toast's own count. */
  var INCOMPLETE_LINES = {
    one: ["Looks like one field's still empty.", "Almost. Just one more to fill in.", "One field's holding that up."],
    many: ["A few fields still need filling in.", "Not quite ready yet. Check the ones in red.", "Couple more fields before that sends."]
  };
  document.addEventListener('contactinvalid', function(e){
    var n = (e.detail && e.detail.count) || 1;
    react(function(){
      say(pick(n === 1 ? INCOMPLETE_LINES.one : INCOMPLETE_LINES.many), 1800);
    }, 1200);
  });

  /* -- the general run of buttons and links. Reuses the same element list
     09-sound.js already curated for its own hover/click sounds (HOVER and
     CLICK in that file - duplicated here as a literal string since that
     module doesn't export it), so "almost all buttons" tracks whatever the
     site itself already treats as an interactive control, rather than a
     second, possibly-drifting definition of the same idea. -- */
  /* #certs scopes the ledger row selector on purpose - the off-the-clock
     view has its own, unrelated .ledger for movies/shows, and an unscoped
     ".ledger .row" would match both, handing "earned, not bought" style
     cert phrasing to a Lord of the Rings rewatch */
  var REACT_SEL = '.bar-nav a, .hero-top nav a, .git, .sticker, .xp-row, .proj, .tk, ' +
    '#certs .ledger .row, .edu-card, .bar-brand, .f-links a, .dl a, .ph, .scroll-hint, ' +
    '.hero-cta a, .big a, .sec-cta a, #cf-name, #cf-from, #cf-msg';
  /* the contact form fields react on focus, not click - see the loop below,
     they're form controls (react on placing the cursor, including a tab
     into the field) rather than link/button-style targets */
  var CF_SEL = '#cf-name, #cf-from, #cf-msg';

  /* James: keep the hover-triggered comment only on the top nav bar
     (.hero-top nav a), the floating nav bar that takes over once you scroll
     past it (.bar-nav a, .bar-brand), the "Hire the candidate" CTA
     (repeated three times - .hero-cta a, .big a, .sec-cta a), the CV/résumé
     downloads (.dl a), and the scroll hint (.scroll-hint). Everything else
     in REACT_SEL keeps its click reaction, just not the hover one - dwelling
     over a project card, cert sticker, etc. no longer talks. */
  var HOVER_SEL = '.bar-nav a, .bar-brand, .hero-top nav a, .hero-cta a, .big a, .sec-cta a, ' +
    '.dl a, .scroll-hint';

  /* .textContent silently mashes words together across a <br> ("Hire
     the<br>candidate" reads back as "Hire thecandidate", no space) and
     the CTA's own trailing arrow glyph rides along too - so the CTA and
     the plain nav-ish text pulls get separate treatment below rather than
     both trusting the same raw-text read. */
  function labelOf(el){
    var h = el.querySelector('h3, b');
    if(h) return h.textContent.trim();
    var tkn = el.querySelector('.tk-n');
    if(tkn) return tkn.textContent.trim();
    if(el.matches('.bar-nav a, .hero-top nav a, .dl a, .bar-brand')){
      var t = el.textContent.trim();
      if(t) return t;
    }
    return null;
  }

  var HOVER_GENERIC = ["Ooh, what's this?", "Go on, I'm curious too.", "That one's worth a look.", "Poking around, nice."];
  var CLICK_GENERIC = ["Good pick.", "Nice choice.", "Ooh, exploring.", "That's a solid one."];

  /* the CTA repeats the exact same "Hire the<br>candidate" markup in three
     places, so it gets fixed lines rather than a read-the-label attempt -
     no arrow, no missing space, and copy that actually fits what the
     button does instead of "good taste" applied to a job application link */
  var CTA_HOVER = ["That's the button that matters most.", "This one's the real ask.", "Every visit should end here eventually."];
  var CTA_CLICK = ["Hope they're paying attention.", "That's the whole point of this page.", "Go on, make his day."];

  var EMAIL_HOVER = ["That's the fastest way to reach him.", "Direct line, right there.", "Good instinct, that's the quick route."];
  var EMAIL_CLICK = ["Straight to his inbox.", "That'll reach him fast.", "Good move, that one works."];

  var DL_HOVER = ["Good idea, keep that on file.", "That one's worth grabbing.", "Handy to have ready."];
  var DL_CLICK = ["Smart move.", "Good, that's saved.", "Keep that handy."];

  /* Group One roster - these are just click-through photo IDs elsewhere in
     REACT_SEL (.ph never carries a real label, so it would fall to
     CLICK_GENERIC below), but James wanted the team's own section to feel
     less like a generic gallery and more like he's actually introducing
     them. Personalized with the figcaption name where there is one. */
  var TEAMMATE_CLICK = ["Handsome.", "Okay, certified good-looking hacker.", "That's a solid teammate right there.", "10/10, would recruit again.", "Camera ready, that one."];
  var TEAMMATE_CLICK_NAMED = ["NAME? Handsome.", "Look at NAME, showing off.", "NAME. Certified good looks, certified skills.", "That's NAME. Solid teammate, better face.", "NAME, camera ready as always."];
  var GROUP_SHOT_CLICK = ["That's the whole crew, mid-hack.", "Group One, caught in the act.", "The team that got 8th out of 600. Not bad.", "Love this one, everyone's actually smiling."];

  var CF_LINES = {
    'cf-name': ["Go on, tell him who you are.", "Nice, starting with your name.", "Good, he likes knowing who's asking."],
    'cf-from': ["He'll actually reply to that one.", "Good, that's how he gets back to you.", "Make sure that one's right, it's the way back."],
    'cf-msg': ["This is the part that matters, make it count.", "Go on, tell him what you need.", "The more specific, the faster he replies."]
  };

  /* a cert badge or ledger row always carries its own status text - a
     `.st` span in the ledger, a `<small>` in the hero sticker - reading it
     is how the cert reaction pool below knows not to call something
     "earned" when it's still a target he hasn't started yet */
  function certStatus(el){
    var node = el.querySelector('.st, small');
    var t = node ? node.textContent.trim().toLowerCase() : '';
    if(t === 'target') return 'target';
    if(t === 'in progress' || t === 'in training' || t === 'candidate' || t === 'active') return 'progress';
    return 'earned';
  }

  /* every category below gets three genuinely distinct lines each for
     hover and click - no shared "X? Good eye." / "Nice, X." scaffolding
     reused across categories. That boilerplate was the actual repetition
     problem: even with real variety in the third slot, two of every
     three lines you saw were the same two templates regardless of what
     you were looking at. */
  function reactionText(el, kind){
    if(el.matches(CF_SEL)){
      return pick(CF_LINES[el.id]);
    }
    if(el.matches('.hero-cta a, .big a, .sec-cta a')){
      return pick(kind === 'hover' ? CTA_HOVER : CTA_CLICK);
    }
    if(el.matches('.f-links a')){
      return pick(kind === 'hover' ? EMAIL_HOVER : EMAIL_CLICK);
    }
    if(el.matches('.dl a')){
      return pick(kind === 'hover' ? DL_HOVER : DL_CLICK);
    }
    if(el.closest('#groupone .gal-roster')){
      var mate = el.querySelector('figcaption');
      mate = mate ? mate.textContent.trim() : '';
      return mate ? pick(TEAMMATE_CLICK_NAMED).replace(/NAME/g, mate) : pick(TEAMMATE_CLICK);
    }
    if(el.closest('#groupone') && el.matches('.ph')){
      return pick(GROUP_SHOT_CLICK);
    }
    var label = labelOf(el);
    if(!label) return pick(kind === 'hover' ? HOVER_GENERIC : CLICK_GENERIC);
    if(el.matches('.bar-nav a, .hero-top nav a, .bar-brand')){
      return kind === 'hover'
        ? pick([label + "? Good call.", "Curious about " + label + "?", "Thinking of heading to " + label + "?"])
        : pick(["Taking you to " + label + ".", "On to " + label + ".", label + ", coming right up."]);
    }
    /* education, experience, and certs are things James earned or lived
       through, not things he picked for style - "good taste" reads oddly
       applied to a degree or a job, so those get their own, more
       matter-of-fact phrasing instead of the generic pool below */
    if(el.matches('.edu-card')){
      return kind === 'hover'
        ? pick([label + ", worth a look.", "Checking his schooling?", "That program's the real deal."])
        : pick([label + ". Solid program.", label + ". Legit school.", "That's actual coursework, not a cert mill."]);
    }
    if(el.matches('.xp-row')){
      return kind === 'hover'
        ? pick([label + "? Real experience, that.", "Checking his work history?", "That one's not padding."])
        : pick([label + ". Real work.", label + ". The real deal.", "That job actually happened."]);
    }
    /* .sticker covers both the cert badges (this pool) and, with the .ss
       modifier, the social/contact links in the off-the-clock view (a
       platform pick, where "good taste" is exactly right) - exclude .ss
       so only the actual credentials get this pool. Certs aren't all in
       the same state though: earned, in progress, and target-only need
       different phrasing, or "he earned it" gets said about a cert he
       hasn't even started yet. */
    if(el.matches('.sticker:not(.ss), #certs .ledger .row')){
      var status = certStatus(el);
      if(status === 'target'){
        return kind === 'hover'
          ? pick([label + "? That's on the roadmap.", "Eyeing a future goal?", "Not started yet, but it's the plan."])
          : pick([label + ". Next on his list.", label + ". That's the target.", "He's aiming for that one."]);
      }
      if(status === 'progress'){
        return kind === 'hover'
          ? pick([label + "? He's working on that right now.", "Checking his progress?", "Still in the middle of that one."])
          : pick([label + ". Still in progress.", label + ". He's working toward that.", "Not finished yet, but he's on it."]);
      }
      return kind === 'hover'
        ? pick([label + "? That took studying.", "Eyeing his credentials?", "Earned, that one."])
        : pick([label + ". Earned, not bought.", label + ". Hard won.", "That one took actual effort."]);
    }
    if(el.matches('.proj')){
      return kind === 'hover'
        ? pick([label + "? He actually built that.", "Checking out his work?", "That one shipped for real."])
        : pick([label + ". He actually built that.", label + ". Real shipped work.", "That one's live, not a mockup."]);
    }
    return kind === 'hover'
      ? pick([label + "? Good taste.", "Eyeing " + label + "?", "Solid pick, " + label + "."])
      : pick([label + ". Good taste.", "Solid pick, " + label + ".", "That one's a keeper."]);
  }

  document.querySelectorAll(REACT_SEL).forEach(function(el){
    var hoverT = null;
    /* a dwell before hover reacts, cleared on leave - so sweeping the
       cursor across a row of nav links or cert stickers doesn't fire a
       comment for every one it happens to cross. This dwell is already
       doing most of the anti-spam work, so the shared cooldown below can
       stay short without the bubble turning into a running commentary. */
    if(el.matches(HOVER_SEL)){
      el.addEventListener('pointerenter', function(){
        clearTimeout(hoverT);
        hoverT = setTimeout(function(){
          react(function(){ say(reactionText(el, 'hover')); }, 1000);
        }, 500);
      });
      el.addEventListener('pointerleave', function(){ clearTimeout(hoverT); });
    }
    if(el.matches(CF_SEL)){
      /* a form field reacts on focus - clicking in, or tabbing in, both
         count as "landing on the field," same as clicking anywhere else
         reacts here. Repeat clicks that just move the cursor within an
         already-focused field don't re-fire, since focus only fires once
         per visit to the field. */
      el.addEventListener('focus', function(){
        if(window.sfx) window.sfx.play('click');
        react(function(){ say(reactionText(el, 'click'), 1800); }, 900);
      });
      return;
    }
    el.addEventListener('click', function(){
      /* .xp-row is an accordion (see 03-experience.js) - by the time this
         fires, that script has already flipped aria-expanded, so a click
         that just collapsed a row reads as false here. Collapsing isn't a
         new thing to comment on, it's closing the thing the last comment
         was about - so hide whatever's showing instead of queuing another
         line (or worse, leaving a stale one about a row that's shut again). */
      if(el.getAttribute('aria-expanded') === 'false'){ hideBubble(); return; }
      /* click comments are a quick aside, not a hover-dwell explanation -
         James asked for these to disappear fast rather than lingering the
         full 4500ms every other bubble gets */
      react(function(){ say(reactionText(el, 'click'), 1800); }, 900);
    });
  });
})();
