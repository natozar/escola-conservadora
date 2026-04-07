// ============================================================
// ESCOLA LIBERAL — Client-side Rate Limiter
// ============================================================
function createRateLimiter(cooldownMs) {
  var lastCall = 0;
  return function(fn) {
    var now = Date.now();
    if (now - lastCall < cooldownMs) {
      var wait = Math.ceil((cooldownMs - (now - lastCall)) / 1000);
      if (typeof window.toast === 'function') window.toast('Aguarde ' + wait + 's', 'error');
      return false;
    }
    lastCall = now;
    if (typeof fn === 'function') fn();
    return true;
  };
}

window.rateLimitDebate = createRateLimiter(3000);
window.rateLimitAITutor = createRateLimiter(10000);
window.rateLimitQuiz = createRateLimiter(5000);
window.createRateLimiter = createRateLimiter;
