(() => {
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyTnwYPq1zrMg5WfDIrnCkPH9w4RhKoP_IV1JgJY6yCDu2HqoTcPDshOnXX5iinzxcD/exec'; // Google Apps Script Web App endpoint
  const PAYMENT_ACCOUNT = '115540-345068';
  const DRAFT_KEY = 'bk_course_registration_draft_v3';
  const SUCCESS_KEY = 'bk_course_registration_success_v1';

  const form = document.getElementById('paymentRegistrationForm');
  if (!form) return;

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
  const paymentAccount = document.getElementById('paymentAccount');
  const feeAdjustedAmount = document.getElementById('feeAdjustedAmount');
  const copyAccount = document.getElementById('copyAccount');
  const summaryPlan = document.getElementById('summaryPlan');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryName = document.getElementById('summaryName');
  const summaryEmail = document.getElementById('summaryEmail');
  const last5 = form.querySelector('input[name="payment_last5"]');

  paymentAmount.textContent = currency(meta.price);
  if (feeAdjustedAmount) feeAdjustedAmount.textContent = `若銀行端產生手續費，可匯 ${currency(meta.price - 15)}（已扣 NT$15）`;
  summaryPlan.textContent = meta.title;
  summaryPrice.textContent = currency(meta.price);
  summaryName.textContent = draft.name;
  summaryEmail.textContent = draft.email;

  if (PAYMENT_ACCOUNT && paymentAccount) paymentAccount.textContent = PAYMENT_ACCOUNT;

  last5.addEventListener('input', () => {
    last5.value = last5.value.replace(/\D/g, '').slice(0, 5);
  });

  copyAccount?.addEventListener('click', async () => {
    if (!PAYMENT_ACCOUNT) return;
    try {
      await navigator.clipboard.writeText(PAYMENT_ACCOUNT);
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
    if (!form.reportValidity()) return;

    const data = buildPayload();
    const submitBtn = form.querySelector('.registration-submit');
    const originalText = submitBtn.innerHTML;

    if (!FORM_ENDPOINT) {
      goToSuccess(data, false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '送出中…';

    try {
      // Apps Script 跨網域送出採 simple request + no-cors，避免瀏覽器預檢 CORS 擋住。
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
