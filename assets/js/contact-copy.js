(() => {
  document.querySelectorAll('[data-copy-contact]').forEach(button => {
    const status = button.closest('.contact-copy-content')?.querySelector('[role="status"]');
    const username = button.dataset.copyContact;
    // Keep the username readable/selectable without JavaScript or clipboard access.
    if (!status || !username || !navigator.clipboard?.writeText) return;
    button.hidden = false;
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      button.disabled = true;
      status.textContent = 'Copying Discord username…';
      try {
        await navigator.clipboard.writeText(username);
        status.textContent = 'Discord username copied!';
      } catch {
        status.textContent = 'Could not copy. Select the username and copy it manually.';
      } finally {
        button.disabled = false;
      }
    });
  });
})();
