/* Yamato Kokushi v0.2: loaded after the existing inline script. */
(() => {
  const quiz = document.getElementById('quiz');
  const check = document.getElementById('check');
  const next = document.getElementById('next');
  const prev = document.getElementById('prev');
  const result = document.getElementById('result');
  const options = document.getElementById('options');
  const status = document.getElementById('status');
  if (!quiz || !check || !next || !prev || !result || !options) return;
  check.style.display = 'none';
  prev.style.display = 'none';
  const summary = document.createElement('section');
  summary.className = 'panel';
  summary.id = 'session-summary';
  summary.style.display = 'none';
  quiz.insertAdjacentElement('afterend', summary);
  let answered = new Map();
  let finished = false;
  let sessionIds = [];
  const originalRender = render;
  function ensureSession() {
    const ids = order.map(q => q.id);
    if (ids.join('\u0000') !== sessionIds.join('\u0000')) {
      sessionIds = ids;
      answered = new Map();
      finished = false;
      summary.style.display = 'none';
    }
  }
  function showSummary() {
    finished = true;
    const count = answered.size;
    const correct = [...answered.values()].filter(Boolean).length;
    const wrong = count - correct;
    quiz.style.display = 'none';
    summary.style.display = 'block';
    summary.innerHTML = `<h2>今回の演習結果</h2><p>回答：<strong>${count}問</strong></p><p>正解：<strong>${correct}問</strong> ／ 不正解：<strong>${wrong}問</strong></p><p>正答率：<strong>${count ? Math.round(correct / count * 100) + '%' : '—'}</strong></p><button class="primary" id="session-restart">もう一度演習する</button>`;
    document.getElementById('session-restart').onclick = () => {
      answered.clear(); finished = false; current = 0; selected = null; revealed = false;
      summary.style.display = 'none'; render();
    };
    summary.scrollIntoView({block:'start'});
  }
  render = function () {
    ensureSession();
    if (finished) return;
    originalRender();
    const q = order[current];
    if (!q) return;
    next.disabled = !revealed && selected === null;
    next.textContent = revealed ? (current === order.length - 1 ? '結果を見る' : '次の問題へ') : '回答を確定して解説を見る';
    prev.style.display = 'none';
    check.style.display = 'none';
  };
  // Replace handlers after the existing application has registered them.
  next.onclick = () => {
    const q = order[current];
    if (!q) return;
    if (!revealed) {
      if (selected === null) return;
      revealed = true;
      const correct = selected === q.answer;
      if (!answered.has(q.id)) {
        answered.set(q.id, correct);
        const prior = state.history[q.id] || {attempts:0,wrongEver:false};
        state.history[q.id] = {attempts:(prior.attempts || 0)+1,wrongEver:!!prior.wrongEver || !correct,lastCorrect:correct,updatedAt:new Date().toISOString()};
        save();
      }
      render();
      result.scrollIntoView({block:'nearest'});
    } else if (current === order.length - 1) {
      showSummary();
    } else {
      current++; selected = null; revealed = false; render();
      quiz.scrollIntoView({block:'start'});
    }
  };
  // Existing option click handlers call render(), which now applies the new UI.
  const rebuildSession = () => { sessionIds = []; answered.clear(); finished = false; summary.style.display = 'none'; };
  for (const id of ['subject','mode']) {
    const el = document.getElementById(id);
    const old = el.onchange;
    el.onchange = function (e) { rebuildSession(); if (old) old.call(this,e); };
  }
  for (const id of ['shuffle','reset','import']) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(id === 'import' ? 'change' : 'click', () => { rebuildSession(); });
  }
  render();
})();
