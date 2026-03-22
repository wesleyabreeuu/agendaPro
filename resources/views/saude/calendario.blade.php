@extends('adminlte::page')

@section('title', 'Calendário de Atividades')

@section('content_header')
<div class="d-flex justify-content-between align-items-center">
    <h1>Calendário de Atividades</h1>
</div>
@stop

@section('content')
<div class="card">
    <div class="card-body">
        <div id='calendar'></div>
    </div>
</div>

@push('css')
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css' rel='stylesheet' />
@endpush

@push('js')
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js'></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'pt-br',
      events: {!! json_encode($eventos) !!},
      eventDisplay: 'block'
    });
    calendar.render();
  });
</script>
@endpush
@stop
