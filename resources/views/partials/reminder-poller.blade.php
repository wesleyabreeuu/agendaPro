<div class="toast reminder-toast" id="reminderToast" data-delay="9000" style="position: fixed; right: 20px; bottom: 20px; min-width: 320px; z-index: 2000;">
  <div class="toast-header bg-warning">
    <strong class="mr-auto">Lembrete</strong>
    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="toast-body" id="reminderToastBody"></div>
</div>

@push('js')
<script>
  (function () {
    if (window.__agendaReminderPolling) {
      return;
    }
    window.__agendaReminderPolling = true;

    const feedUrl = "{{ route('lembretes.due') }}";
    const toastEl = document.getElementById('reminderToast');
    const toastBody = document.getElementById('reminderToastBody');

    async function ensurePermission() {
      if (!('Notification' in window)) {
        return 'unsupported';
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission !== 'denied') {
        return Notification.requestPermission();
      }

      return Notification.permission;
    }

    async function ensureServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        return null;
      }

      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) {
        return existing;
      }

      try {
        return await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        console.error('Falha ao registrar service worker', error);
        return null;
      }
    }

    async function showNativeNotification(item) {
      const permission = await ensurePermission();
      if (permission !== 'granted' || !('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await ensureServiceWorker();
      if (!registration) {
        return false;
      }

      await registration.showNotification(item.titulo, {
        body: item.mensagem + ' ' + item.quando,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: item.url }
      });

      return true;
    }

    function showToast(item) {
      if (!toastEl || !toastBody || typeof $ === 'undefined') {
        return;
      }

      toastBody.innerHTML = `
        <div class="font-weight-bold mb-1">${item.titulo}</div>
        <div>${item.mensagem}</div>
        <div class="small text-muted mt-2">${item.quando}</div>
        <a href="${item.url}" class="btn btn-sm btn-warning mt-3">Abrir compromisso</a>
      `;

      $(toastEl).toast('show');
    }

    async function pollReminders() {
      try {
        const response = await fetch(feedUrl, {
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'same-origin'
        });

        if (!response.ok) {
          return;
        }

        const reminders = await response.json();
        for (const item of reminders) {
          const notified = await showNativeNotification(item);
          if (!notified) {
            showToast(item);
          }
        }
      } catch (error) {
        console.error('Falha ao consultar lembretes', error);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        pollReminders();
      }
    });

    window.addEventListener('load', () => {
      ensureServiceWorker();
      ensurePermission();
      pollReminders();
      window.setInterval(pollReminders, 60000);
    });
  })();
</script>
@endpush
