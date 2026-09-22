import { track } from '../lib/analytics';

/** A compact range filter and native, keyboard-accessible product dialogs. */
export function initExplorer(): void {
  const root = document.querySelector<HTMLElement>('[data-explorer]');
  if (!root) return;
  const filters = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-category]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-range-category]'));
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.category;
    let count = 0;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.rangeCategory !== category;
      if (!card.hidden) count++;
    });
    const status = root.querySelector('[data-range-status]');
    if (status) status.textContent = `Showing ${count} ${count === 1 ? 'vehicle' : 'vehicles'}`;
    track('vehicle_category_select', { category });
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-product-open]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(`product-${button.dataset.productOpen}`) as HTMLDialogElement | null;
      dialog?.showModal();
      document.body.dataset.locked = 'true';
      track('vehicle_view', { vehicle: button.dataset.productOpen });
    });
  });
  root.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
    dialog.querySelector('[data-product-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const lead = document.querySelector<HTMLElement>('[data-lead-modal]');
      if (!lead || lead.hidden) document.body.dataset.locked = 'false';
    });
    dialog.querySelector('[data-product-book]')?.addEventListener('click', () => dialog.close());
  });
}
