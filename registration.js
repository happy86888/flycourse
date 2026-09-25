(() => {
  const form = document.getElementById('courseRegistrationForm');
  if (!form) return;

  const DRAFT_KEY = 'bk_course_registration_draft_v3';
  const planInputs = [...form.querySelectorAll('input[name="course_plan"]')];
  const fullCourseHint = document.getElementById('fullCourseHint');
  const summaryPlan = document.getElementById('summaryPlan');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryBenefits = document.getElementById('summaryBenefits');

  const planMeta = {
    '8000': { title: '8,000 實體課程', price: 8000, benefits: ['4 小時工作坊小班制教學', '分組操作與查票實作', '請在留言欄填寫欲報名場次'] },
    '19800': { title: '19,800 完整課程', price: 19800, benefits: ['完整線上課程', '免費參加一次實體課程', '建議先查看完整課程頁'] },
    '29800': { title: '29,800 進階課程', price: 29800, benefits: ['進階課程內容', '免費參加一次實體課程', '免費一次實體一對一諮詢'] }
  };

  const currency = n => `NT$ ${Number(n).toLocaleString('zh-TW')}`;
  const selectedPlan = () => form.querySelector('input[name="course_plan"]:checked')?.value || '';

  function updatePlanUI() {
    const key = selectedPlan();
    const meta = planMeta[key];
    const full = key === '19800' || key === '29800';
    if (fullCourseHint) fullCourseHint.hidden = !full;

    if (!meta) {
      summaryPlan.textContent = '尚未選擇課程';
      summaryPrice.textContent = '—';
      summaryBenefits.innerHTML = '<li>請先從左側選擇課程方案</li>';
      return;
    }
    summaryPlan.textContent = meta.title;
    summaryPrice.textContent = currency(meta.price);
    summaryBenefits.innerHTML = meta.benefits.map(item => `<li>${item}</li>`).join('');
  }

  function saveDraft() {
    const fd = new FormData(form);
    const data = {
      course_plan: selectedPlan(),
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      note: String(fd.get('note') || '').trim()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function restoreDraft() {
    try {
      const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      if (data.course_plan) {
        const radio = form.querySelector(`input[name="course_plan"][value="${data.course_plan}"]`);
        if (radio) radio.checked = true;
      }
      ['name','phone','email','note'].forEach(name => {
        const el = form.elements[name];
        if (el && data[name]) el.value = data[name];
      });
    } catch (_) {}
    updatePlanUI();
  }

  planInputs.forEach(input => input.addEventListener('change', () => { updatePlanUI(); saveDraft(); }));
  form.addEventListener('input', saveDraft);
  restoreDraft();

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    saveDraft();
    window.location.href = 'registration-payment.html';
  });
})();
