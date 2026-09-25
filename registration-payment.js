(async () => {
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyTnwYPq1zrMg5WfDIrnCkPH9w4RhKoP_IV1JgJY6yCDu2HqoTcPDshOnXX5iinzxcD/exec';
  const DRAFT_KEY = 'bk_course_registration_draft_v3';
  const SUCCESS_KEY = 'bk_course_registration_success_v1';

  const form = document.getElementById('paymentRegistrationForm');
  if (!form) return;

  // 先等報名狀態確認，避免額滿時付款頁還短暫顯示帳號。
  try { await (window.BK_REGISTRATION_STATUS_READY || Promise.resolve({})); } catch (_) {}
  if (window.BK_REGISTRATION_CLOSED) return;

  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch (_) {}

  if (!draft.course_plan || !draft.name || !draft.phone || !draft.email) {
    window.location.replace('registration.html');
    return;
  }

  const planMeta = {
    '8000': { title: '8,000 實體課程', price: 8000 },
    '19800': { title: '19,800 完整課程', price: 19800 },
    '29800': { title: '29,800 進階課程', price: 29800 }
  };
  const meta = planMeta[draft.course_plan];
  if (!meta) {
    window.location.replace('registration.html');
    return;
  }

  const currency = n => `NT$ ${Number(n).toLocaleString('zh-TW')}`;
  const paymentAmount = document.getElementById('paymentAmount');
  const paymentBankName = document.getElementById('paymentBankName');
  const paymentBankCode = document.getElementById('paymentBankCode');
  const paymentAccount = document.getElementById('paymentAccount');
  const paymentNote = document.getElementById('paymentNote');
  const paymentLoadError = document.getElementById('paymentLoadError');
  const copyAccount = document.getElementById('copyAccount');
  const summaryPlan = document.getElementById('summaryPlan');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryName = document.getElementById('summaryName');
  const summaryEmail = document.getElementById('summaryEmail');
  const last5 = form.querySelector('input[name="payment_last5"]');
  const submitBtn = form.querySelector('.registration-submit');

  paymentAmount.textContent = currency(meta.price);
  summaryPlan.textContent = meta.title;
  summaryPrice.textContent = currency(meta.price);
  summaryName.textContent = draft.name;
  summaryEmail.textContent = draft.email;

  let livePaymentAccount = '';

  function loadPaymentConfig() {
    return new Promise((resolve, reject) => {
      const callback = `__bkPaymentConfig_${Date.now()}`;
      const script = document.createElement('script');
      let done = false;

      const cleanup = () => {
        if (done) return;
        done = true;
        script.remove();
        try { delete window[callback]; } catch (_) {}
      };

      window[callback] = payload => {
        cleanup();
        resolve(payload || {});
      };

      script.src = `${FORM_ENDPOINT}?action=payment&callback=${encodeURIComponent(callback)}&_=${Date.now()}`;
      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('PAYMENT_CONFIG_LOAD_FAILED'));
      };
      document.head.appendChild(script);
    });
  }

  try {
    const config = await loadPaymentConfig();
    if (config.open === false) {
      window.location.replace('registration.html');
      return;
    }

    livePaymentAccount = String(config.bank_account || '').trim();
    paymentBankName.textContent = String(config.bank_name || '—');
    paymentBankCode.textContent = config.bank_code ? `銀行代碼 ${config.bank_code}` : '銀行代碼 —';
    paymentAccount.textContent = livePaymentAccount || '付款帳號載入失敗';
    paymentNote.textContent = String(config.payment_note || '');

    if (!livePaymentAccount) throw new Error('PAYMENT_ACCOUNT_EMPTY');
  } catch (_) {
    if (paymentLoadError) paymentLoadError.hidden = false;
    if (submitBtn) submitBtn.disabled = true;
    if (copyAccount) copyAccount.disabled = true;
  }

  last5.addEventListener('input', () => {
    last5.value = last5.value.replace(/\D/g, '').slice(0, 5);
  });

  copyAccount?.addEventListener('click', async () => {
    if (!livePaymentAccount) return;
    try {
      await navigator.clipboard.writeText(livePaymentAccount);
      const old = copyAccount.textContent;
      copyAccount.textContent = '已複製';
      setTimeout(() => { copyAccount.textContent = old; }, 1200);
    } catch (_) {}
  });

  function buildPayload() {
    return {
      submitted_at: new Date().toISOString(),
      course_plan: meta.title,
      course_price: meta.price,
      name: String(draft.name || '').trim(),
      phone: String(draft.phone || '').trim(),
      email: String(draft.email || '').trim(),
      note: String(draft.note || '').trim(),
      payment_last5: String(last5.value || '').trim()
    };
  }

  function goToSuccess(data, sent) {
    localStorage.setItem(SUCCESS_KEY, JSON.stringify({ ...data, sent: Boolean(sent) }));
    localStorage.removeItem(DRAFT_KEY);
    window.location.href = `registration-success.html${sent ? '?sent=1' : ''}`;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity() || !livePaymentAccount) return;

    const data = buildPayload();
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.textContent = '送出中…';

    try {
      // Apps Script 跨網域送出採 simple request + no-cors，避免預檢 CORS。
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...data, website: '' })
      });
      goToSuccess(data, true);
    } catch (_) {
      alert('送出時發生問題，請稍後再試，或先透過 LINE 聯絡老師。');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
})();
