// Addresses are decoded only in response to a visitor's click or keyboard activation.
// This discourages routine scraping; it does not prevent determined extraction.
(() => {
  'use strict';
  const mailboxes = {
    academic: [59,34,38,36,50,33,50,57,23,48,54,35,50,52,63,121,50,51,34],
    personal: [59,34,38,96,36,50,33,50,57,23,48,58,54,62,59,121,52,56,58]
  };
  document.querySelectorAll('[data-email]').forEach(button => {
    const target = document.getElementById(button.getAttribute('aria-controls'));
    const encoded = mailboxes[button.dataset.email];
    if (!target || !encoded) return;
    button.addEventListener('click', () => {
      const expanding = button.getAttribute('aria-expanded') !== 'true';
      target.replaceChildren();
      if (expanding) {
        const address = encoded.map(code => String.fromCharCode(code ^ 87)).join('');
        const link = document.createElement('a');
        link.className = 'contact-email';
        link.href = ['mail', 'to:'].join('') + address;
        link.textContent = address;
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';
        link.append(arrow);
        target.append(link);
      }
      target.hidden = !expanding;
      button.setAttribute('aria-expanded', String(expanding));
      const label = button.dataset.email === 'academic' ? 'Georgia Tech email' : 'personal email';
      button.firstElementChild.textContent = `${expanding ? 'Hide' : 'Reveal'} ${label}`;
      button.lastElementChild.textContent = expanding ? '−' : '+';
    });
  });
})();
