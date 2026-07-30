(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* loader */
  window.addEventListener('load', function(){
    setTimeout(function(){
      var l = document.getElementById('loader');
      if(l) l.classList.add('done');
      document.querySelectorAll('.hero h1 [data-h]').forEach(function(el,i){
        el.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1) '+(i*0.09)+'s, opacity .9s ease '+(i*0.09)+'s';
        requestAnimationFrame(function(){ el.style.transform='translateY(0)'; el.style.opacity='1'; });
      });
    }, reduce ? 0 : 900);
  });
  if(reduce){
    document.querySelectorAll('.hero h1 [data-h]').forEach(function(el){el.style.transform='none';el.style.opacity='1';});
  }

  /* nav scroll state + progress */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    if(y>40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h>0 ? (y/h*100) : 0) + '%';
    // parallax
    if(!reduce){
      document.querySelectorAll('[data-parallax]').forEach(function(el){
        var sp = parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translateY('+(y*sp)+'px)';
      });
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* burger menu */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function toggleMenu(open){
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open?'true':'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function(){ toggleMenu(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ toggleMenu(false); }); });

  /* reveal on scroll */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('[data-reveal]').forEach(function(el){ io.observe(el); });

  /* counters */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target, target = parseInt(el.getAttribute('data-count'),10);
      var suffix = el.getAttribute('data-suffix') || '';
      if(reduce){ el.textContent = target + suffix; cio.unobserve(el); return; }
      var start = null, dur = 1400;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/dur,1);
        var eased = 1-Math.pow(1-p,3);
        el.textContent = Math.round(eased*target) + suffix;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, {threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  /* custom cursor */
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    var dot = document.getElementById('cDot'), ring = document.getElementById('cRing');
    var mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px'; });
    (function loop(){
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.chip,.svc,.dom').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('hover'); });
    });
  }

  /* gallery lightbox */
  var tiles = [].slice.call(document.querySelectorAll('.wk'));
  var lb = document.getElementById('lightbox');
  if(tiles.length && lb){
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var current = 0, lastFocus = null;

    function show(i){
      current = (i + tiles.length) % tiles.length;
      var tile = tiles[current], img = tile.querySelector('img');
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || '';
      lbCap.textContent = tile.getAttribute('data-cap') || '';
    }
    function openLb(i){
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.classList.add('lb-open');
      requestAnimationFrame(function(){ lb.classList.add('open'); });
      document.getElementById('lbClose').focus();
    }
    function closeLb(){
      lb.classList.remove('open');
      document.body.classList.remove('lb-open');
      setTimeout(function(){ lb.hidden = true; lbImg.src = ''; }, reduce ? 0 : 350);
      if(lastFocus) lastFocus.focus();
    }

    tiles.forEach(function(tile,i){
      tile.addEventListener('click', function(){ openLb(i); });
    });
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function(){ show(current-1); });
    document.getElementById('lbNext').addEventListener('click', function(){ show(current+1); });
    /* click the backdrop (but not the photo or the buttons) to dismiss */
    lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){
      if(lb.hidden) return;
      if(e.key === 'Escape') closeLb();
      else if(e.key === 'ArrowLeft') show(current-1);
      else if(e.key === 'ArrowRight') show(current+1);
    });
  }
})();
