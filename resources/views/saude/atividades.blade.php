@extends('adminlte::page')

@section('title', 'Minhas Atividades')

@section('content_header')
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h1>Atividades Físicas</h1>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" data-toggle="modal" data-target="#modalCategoria">
            <i class="fas fa-dumbbell"></i> Novo Tipo de Atividade
        </button>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalAtividade">
            <i class="fas fa-plus-circle"></i> Nova Atividade
        </button>
    </div>
</div>
@stop

@section('content')
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
@endif

<div class="alert alert-info">
    O campo <strong>Tipo de atividade</strong> usa os exercícios cadastrados no sistema, como Corrida, Musculação ou Yoga.
    Já deixamos alguns tipos prontos e você também pode criar outros em <strong>Novo Tipo de Atividade</strong>.
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover table-sm">
	                <thead>
	                    <tr>
	                        <th>Data</th>
	                        <th>Atividade</th>
	                        <th>Descrição</th>
                        <th>Origem</th>
                        <th>Duração</th>
                        <th>Intensidade</th>
                        <th>Calorias</th>
                        <th>Ações</th>
                    </tr>
                </thead>
	                <tbody>
	                    @forelse($atividades as $ativ)
                            @php($mapaPath = $ativ->mapaResumoSvgPath())
	                        <tr>
	                            <td>{{ $ativ->data->format('d/m/Y') }}</td>
	                            <td>
	                                <span class="badge" style="background-color: {{ $ativ->categoria->cor }}; color: white;">
                                    <i class="{{ $ativ->categoria->icone }}"></i> {{ $ativ->categoria->nome }}
                                </span>
                            </td>
	                            <td>
                                    <div>{{ $ativ->descricao ?? '-' }}</div>
                                    @if($ativ->fonte === 'strava' && ($ativ->distancia_formatada || $ativ->ritmo_medio_formatado || $ativ->velocidade_media_kmh))
                                        <div class="mt-2 d-flex flex-wrap gap-1">
                                            @if($ativ->distancia_formatada)
                                                <span class="badge badge-light border">📏 {{ $ativ->distancia_formatada }}</span>
                                            @endif
                                            @if($ativ->ritmo_medio_formatado)
                                                <span class="badge badge-light border">🏃 {{ $ativ->ritmo_medio_formatado }}</span>
                                            @elseif($ativ->velocidade_media_kmh)
                                                <span class="badge badge-light border">⚡ {{ number_format($ativ->velocidade_media_kmh, 1, ',', '.') }} km/h</span>
                                            @endif
                                            @if($ativ->elevacao_formatada)
                                                <span class="badge badge-light border">⛰ {{ $ativ->elevacao_formatada }}</span>
                                            @endif
                                        </div>
                                    @endif
                                </td>
	                            <td>
	                                @if($ativ->fonte === 'strava')
	                                    <span class="badge badge-warning">
	                                        <i class="fab fa-strava"></i> Strava
                                    </span>
                                @else
                                    <span class="badge badge-secondary">Manual</span>
                                @endif
                            </td>
	                            <td><strong>{{ $ativ->duracao_minutos }}min</strong></td>
                            <td>
                                @switch($ativ->intensidade)
                                    @case('leve')
                                        <span class="badge badge-success">Leve</span>
                                        @break
                                    @case('moderada')
                                        <span class="badge badge-warning">Moderada</span>
                                        @break
                                    @case('intensa')
                                        <span class="badge badge-danger">Intensa</span>
                                        @break
                                @endswitch
                            </td>
                            <td><strong class="text-danger">{{ $ativ->calorias_queimadas }}kcal</strong></td>
	                            <td>
	                                <a href="{{ route('saude.edit-atividade', $ativ->id) }}" class="btn btn-xs btn-info" title="Editar">
	                                    <i class="fas fa-edit"></i>
	                                </a>
                                    @if($ativ->stravaUrl())
                                        <a href="{{ $ativ->stravaUrl() }}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-warning" title="Abrir no Strava">
                                            <i class="fab fa-strava"></i>
                                        </a>
                                    @endif
	                                <form method="POST" action="{{ route('saude.destroy-atividade', $ativ->id) }}" onsubmit="return confirm('Tem certeza?')" style="display: inline;">
	                                    @csrf
	                                    @method('DELETE')
                                    <button type="submit" class="btn btn-xs btn-danger" title="Deletar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
	                            </td>
	                        </tr>
                            @if($ativ->fonte === 'strava' && ($mapaPath || $ativ->notas))
                                <tr class="table-light">
                                    <td></td>
                                    <td colspan="7">
                                        <div class="row">
                                            @if($mapaPath)
                                                <div class="col-lg-4 mb-3 mb-lg-0">
                                                    <div class="strava-map-card">
                                                        <div class="small text-muted mb-2">Mapa resumido</div>
                                                        <svg viewBox="0 0 260 96" class="strava-map-svg" aria-label="Mapa resumido da atividade">
                                                            <path d="{{ $mapaPath }}" class="strava-map-track"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            @endif
                                            @if($ativ->notas)
                                                <div class="{{ $mapaPath ? 'col-lg-8' : 'col-12' }}">
                                                    <div class="small text-muted mb-1">Detalhes importados</div>
                                                    <div class="text-muted">{{ $ativ->notas }}</div>
                                                </div>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            @endif
	                    @empty
	                        <tr>
	                            <td colspan="8" class="text-center text-muted">Nenhuma atividade registrada</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <div class="d-flex justify-content-center mt-3">
            {{ $atividades->links() }}
        </div>
    </div>
</div>

<!-- Modal Nova Categoria -->
<div class="modal fade" id="modalCategoria" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('saude.store-categoria') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Novo Tipo de Atividade</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome" class="form-control" placeholder="Ex: Crossfit, Dança, Alongamento" required>
                    <small class="form-text text-muted">
                        Esse nome aparecerá na lista e no calendário das atividades.
                    </small>
                </div>

                <div class="form-group">
                    <label>Cor</label>
                    <input type="color" name="cor" class="form-control" value="#e74c3c">
                </div>

                <div class="form-group">
                    <label>Ícone</label>
                    <input type="text" name="icone" class="form-control" value="fas fa-dumbbell" placeholder="Ex: fas fa-running">
                    <small class="form-text text-muted">
                        Exemplo: <code>fas fa-running</code>, <code>fas fa-bicycle</code>, <code>fas fa-heart</code>.
                    </small>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label>Calorias por minuto - leve</label>
                        <input type="number" name="caloria_leve" class="form-control" min="0" step="0.01" value="4" required>
                    </div>
                    <div class="form-group col-md-4">
                        <label>Calorias por minuto - moderada</label>
                        <input type="number" name="caloria_moderada" class="form-control" min="0" step="0.01" value="6" required>
                    </div>
                    <div class="form-group col-md-4">
                        <label>Calorias por minuto - intensa</label>
                        <input type="number" name="caloria_intensa" class="form-control" min="0" step="0.01" value="8" required>
                    </div>
                </div>
                <small class="form-text text-muted">
                    Esses valores servem para calcular automaticamente as calorias gastas conforme a duração e a intensidade do exercício.
                </small>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Tipo</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal Nova Atividade -->
<div class="modal fade" id="modalAtividade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form method="POST" action="{{ route('saude.store-atividade') }}" class="modal-content">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title">Registrar Atividade</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Tipo de atividade <span class="text-danger">*</span></label>
                    <select name="categoria_atividade_fisica_id" class="form-control" required>
                        <option value="">-- Selecione uma atividade --</option>
                        @foreach($categorias as $cat)
                            <option value="{{ $cat->id }}">
                                <i class="{{ $cat->icone }}"></i> {{ $cat->nome }}
                            </option>
                        @endforeach
                    </select>
                    <small class="form-text text-muted">
                        Nao encontrou o tipo desejado? Cadastre um novo em <strong>Novo Tipo de Atividade</strong>.
                    </small>
                </div>

                <div class="form-group">
                    <label>Descrição (Opcional)</label>
                    <input type="text" name="descricao" class="form-control" placeholder="Ex: treino de pernas, corrida no parque, aula em grupo">
                </div>

                <div class="form-group">
                    <label>Data <span class="text-danger">*</span></label>
                    <input type="date" name="data" class="form-control" value="{{ now()->toDateString() }}" required>
                </div>

                <div class="form-group">
                    <label>Hora de Início (Opcional)</label>
                    <input type="time" name="hora_inicio" class="form-control">
                    <small class="form-text text-muted">
                        Preencha se quiser organizar melhor o horario do treino.
                    </small>
                </div>

                <div class="form-group">
                    <label>Duração (minutos) <span class="text-danger">*</span></label>
                    <input type="number" name="duracao_minutos" class="form-control" min="1" placeholder="Ex: 60" required>
                </div>

                <div class="form-group">
                    <label>Intensidade <span class="text-danger">*</span></label>
                    <select name="intensidade" class="form-control" required>
                        <option value="leve">🟢 Leve</option>
                        <option value="moderada" selected>🟡 Moderada</option>
                        <option value="intensa">🔴 Intensa</option>
                    </select>
                    <small class="text-muted d-block mt-2">
                        As calorias serao calculadas automaticamente com base no tipo de atividade, intensidade e duracao.
                    </small>
                </div>

                <div class="form-group">
                    <label>Notas (Opcional)</label>
                    <textarea name="notas" class="form-control" rows="2" placeholder="Ex: senti dor, bati meta, treino com personal..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Atividade</button>
            </div>
        </form>
    </div>
	</div>
	@stop

@push('css')
<style>
    .gap-1 {
        gap: .25rem;
    }

    .strava-map-card {
        background: linear-gradient(135deg, #fff7ed, #ffedd5);
        border: 1px solid #fed7aa;
        border-radius: 12px;
        padding: .75rem;
    }

    .strava-map-svg {
        width: 100%;
        height: 96px;
        display: block;
        background:
            radial-gradient(circle at 20% 20%, rgba(251, 146, 60, .08), transparent 45%),
            linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,247,237,.95));
        border-radius: 10px;
    }

    .strava-map-track {
        fill: none;
        stroke: #ea580c;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>
@endpush
