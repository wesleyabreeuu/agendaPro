@extends('adminlte::page')

@section('title', 'Calendário')

@section('content_header')
  <div class="d-flex justify-content-between align-items-center flex-wrap">
    <h1 class="mb-2">Calendário</h1>
    <a href="{{ route('compromissos.index') }}" class="btn btn-outline-secondary">
      <i class="fas fa-list"></i> Lista
    </a>
  </div>
@stop

@section('content')
  <div class="card">
    <div class="card-body">
      <div id="calendar"></div>
    </div>
  </div>

  {{-- Modal detalhes --}}
  <div class="modal fade" id="modalDetalhe" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTitulo">Compromisso</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p><strong>Data/Hora:</strong> <span id="modalDataHora"></span></p>
          <p><strong>Local:</strong> <span id="modalLocal"></span></p>
          <p><strong>Descrição:</strong></p>
          <div class="alert alert-light mb-0" id="modalDescricao"></div>
        </div>
        <div class="modal-footer">
          <a href="#" id="modalEditarLink" class="btn btn-primary">
            <i class="fas fa-edit"></i> Editar
          </a>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
@stop

@push('css')
  {{-- FullCalendar CSS (CDN) --}}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css">

  <style>
    #calendar {
      max-width: 1200px;
      margin: 0 auto;
    }

    .fc .fc-toolbar-title {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .fc .fc-daygrid-event {
      border-radius: 8px;
      padding: 2px 6px;
    }
  </style>
@endpush

@push('js')
  {{-- FullCalendar JS (CDN Global) --}}
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>

  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const el = document.getElementById('calendar');

      const calendar = new FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        height: 'auto',
        locale: 'pt-br',

        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },

        // carrega eventos via rota
        events: "{{ route('compromissos.calendario.eventos') }}",

        eventClick: function(info) {
          const e = info.event;

          document.getElementById('modalTitulo').innerText = e.title || 'Compromisso';

          const start = e.start;
          const dataHora = start ? start.toLocaleString('pt-BR') : '-';

          document.getElementById('modalDataHora').innerText = dataHora;
          document.getElementById('modalLocal').innerText = (e.extendedProps && e.extendedProps.local) ? e.extendedProps.local : '-';
          document.getElementById('modalDescricao').innerText = (e.extendedProps && e.extendedProps.descricao) ? e.extendedProps.descricao : '-';

          document.getElementById('modalEditarLink').href = `/compromissos/${e.id}/edit`;

          $('#modalDetalhe').modal('show');
        }
      });

      calendar.render();
    });
  </script>
@endpush
