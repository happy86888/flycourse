(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyTnwYPq1zrMg5WfDIrnCkPH9w4RhKoP_IV1JgJY6yCDu2HqoTcPDshOnXX5iinzxcD/exec';
  const CALLBACK = '__bkRegistrationStatus';
  const isRegistrationPage = document.body.classList.contains('registration-page');

  let resolveReady;
  window.BK_REGISTRATION_STATUS_READY = new Promise(resolve => { resolveReady = resolve; });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function finish(payload) {
    window.BK_REGISTRATION_CONFIG = payload || {};
    document.documentElement.classList.remove('registration-status-loading');
    if (resolveReady) resolveReady(payload || {});
    const script = document.getElementById('bk-registration-status-script');
    if (script) script.remove();
    try { delete window[CALLBACK]; } catch (_) {}
  }

  function renderClosed(config) {
    window.BK_REGISTRATION_CLOSED = true;
    document.documentElement.classList.add('registration-is-closed');

    const title = escapeHtml(config.title || '本梯次報名額滿');
    const message = escapeHtml(config.message || '感謝你的關注，本梯次名額已滿。下一梯次開放時會再公告。');

    if (isRegistrationPage) {
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = `
          <section class="registration-closed-section">
            <div class="container">
              <div class="registration-closed-card">
                <span class="registration-closed-kicker">REGISTRATION CLOSED</span>
                <h1>${title}</h1>
                <p>${message}</p>
                <div class="registration-closed-actions">
                  <a class="btn btn-dark" href="index.html">返回課程介紹</a>
                  <a class="btn btn-ghost-warm" href="https://lin.ee/PJLL2Zo" target="_blank" rel="noopener">LINE 詢問下一梯次</a>
                </div>
              </div>
            </div>
          </section>`;
      }
      return;
    }

    document.querySelectorAll('a[href="registration.html"]').forEach(a => {
      const raw = (a.textContent || '').trim();
      if (/報名|前往/.test(raw)) a.textContent = '本梯次報名額滿';
      a.classList.add('registration-closed-link');
    });
  }

  window[CALLBACK] = payload => {
    try {
      if (payload && payload.open === false) renderClosed(payload);
    } finally {
      finish(payload);
    }
  };

  document.documentElement.classList.add('registration-status-loading');
  const script = document.createElement('script');
  script.id = 'bk-registration-status-script';
  script.src = `${ENDPOINT}?action=status&callback=${encodeURIComponent(CALLBACK)}&_=${Date.now()}`;
  script.async = true;
  script.onerror = () => finish({});
  document.head.appendChild(script);
})();
