(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menu && header) {
    menu.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded', String(open));
    });
  }

  if (nav && header) {
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      header.classList.remove('menu-open');
      if (menu) menu.setAttribute('aria-expanded', 'false');
    }));
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // Keep only one curriculum module open at a time on small screens.
  const modules = [...document.querySelectorAll('.module')];
  modules.forEach(mod => mod.addEventListener('toggle', () => {
    if (mod.open && window.innerWidth < 760) {
      modules.forEach(other => { if (other !== mod) other.open = false; });
    }
  }));
})();

// V5.0 · prevent orphaned Chinese punctuation in large headings on mobile.
(() => {
  const selectors = '.hero h1, .section-heading h2, .intro h2, .small-group-copy h2, .special-copy h2, .compare-card h3, .prep-main h2, .pricing-copy h2, .about-copy h2, .final-grid h2';
  const protect = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.replace(/([\u3400-\u9FFFA-Za-z0-9）】」』》〉])([，。！？；：、])/g, '$1\u2060$2');
    });
  };
  document.querySelectorAll(selectors).forEach(protect);
})();
