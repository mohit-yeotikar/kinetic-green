import { track } from '../lib/analytics';

/** External map search: never invent nearby dealers or distance estimates. */
export function initDealer(): void {
  const form = document.querySelector<HTMLFormElement>('[data-dealer-form]');
  const query = document.querySelector<HTMLInputElement>('[data-dealer-query]');
  if (!form || !query) return;
  document.querySelectorAll<HTMLButtonElement>('[data-dealer-city]').forEach(button => {
    button.addEventListener('click', () => {
      query.value = button.dataset.dealerCity ?? '';
      query.focus();
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const location = query.value.trim();
    const valid = /^\d+$/.test(location) ? /^\d{6}$/.test(location) : /^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(location);
    query.setCustomValidity(valid ? '' : 'Enter a city name or a 6-digit Indian PIN code.');
    if (!form.reportValidity()) return;
    const url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');
    url.searchParams.set('query', `Kinetic Green authorised dealer ${location} India`);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    track('dealer_search', { query: location, source: 'homepage-map-search' });
  });
  query.addEventListener('input', () => query.setCustomValidity(''));
}
