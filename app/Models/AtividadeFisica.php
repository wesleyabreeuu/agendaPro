<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AtividadeFisica extends Model
{
    use HasFactory;

    protected $table = 'atividade_fisica';

    protected $fillable = [
        'user_id',
        'categoria_atividade_fisica_id',
        'descricao',
        'data',
        'hora_inicio',
        'duracao_minutos',
        'tempo_movimento_segundos',
        'tempo_decorrido_segundos',
        'intensidade',
        'calorias_queimadas',
        'distancia_metros',
        'elevacao_ganho_metros',
        'elevacao_maxima_metros',
        'elevacao_minima_metros',
        'velocidade_media_mps',
        'velocidade_maxima_mps',
        'ritmo_medio_segundos',
        'achievement_count',
        'pr_count',
        'total_photo_count',
        'start_latitude',
        'start_longitude',
        'end_latitude',
        'end_longitude',
        'mapa_resumo_polyline',
        'stream_data',
        'notas',
        'fonte',
        'fonte_id',
        'sport_type',
        'sincronizado_em',
    ];

    protected $casts = [
        'data' => 'date',
        'duracao_minutos' => 'integer',
        'tempo_movimento_segundos' => 'integer',
        'tempo_decorrido_segundos' => 'integer',
        'calorias_queimadas' => 'integer',
        'distancia_metros' => 'float',
        'elevacao_ganho_metros' => 'float',
        'elevacao_maxima_metros' => 'float',
        'elevacao_minima_metros' => 'float',
        'velocidade_media_mps' => 'float',
        'velocidade_maxima_mps' => 'float',
        'ritmo_medio_segundos' => 'integer',
        'achievement_count' => 'integer',
        'pr_count' => 'integer',
        'total_photo_count' => 'integer',
        'start_latitude' => 'float',
        'start_longitude' => 'float',
        'end_latitude' => 'float',
        'end_longitude' => 'float',
        'stream_data' => 'array',
        'sincronizado_em' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $atividade) {
            if (!$atividade->calorias_queimadas && $atividade->categoria) {
                $calorias_por_minuto = $atividade->categoria->getCalorias($atividade->intensidade);
                $atividade->calorias_queimadas = (int) ($atividade->duracao_minutos * $calorias_por_minuto);
            }
        });

        static::updating(function (self $atividade) {
            if ($atividade->isDirty(['duracao_minutos', 'intensidade', 'categoria_atividade_fisica_id'])) {
                if ($atividade->categoria) {
                    $calorias_por_minuto = $atividade->categoria->getCalorias($atividade->intensidade);
                    $atividade->calorias_queimadas = (int) ($atividade->duracao_minutos * $calorias_por_minuto);
                }
            }
        });
    }

    public function categoria()
    {
        return $this->belongsTo(CategoriaAtividadeFisica::class, 'categoria_atividade_fisica_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getDistanciaKmAttribute(): ?float
    {
        return $this->distancia_metros !== null
            ? round($this->distancia_metros / 1000, 2)
            : null;
    }

    public function getDistanciaFormatadaAttribute(): ?string
    {
        return $this->distancia_km !== null
            ? number_format($this->distancia_km, 2, ',', '.') . ' km'
            : null;
    }

    public function getElevacaoFormatadaAttribute(): ?string
    {
        return $this->elevacao_ganho_metros !== null
            ? number_format($this->elevacao_ganho_metros, 0, ',', '.') . ' m'
            : null;
    }

    public function getElevacaoMaximaFormatadaAttribute(): ?string
    {
        return $this->elevacao_maxima_metros !== null
            ? number_format($this->elevacao_maxima_metros, 0, ',', '.') . ' m'
            : null;
    }

    public function getVelocidadeMediaKmhAttribute(): ?float
    {
        return $this->velocidade_media_mps !== null
            ? round($this->velocidade_media_mps * 3.6, 1)
            : null;
    }

    public function getVelocidadeMaximaKmhAttribute(): ?float
    {
        return $this->velocidade_maxima_mps !== null
            ? round($this->velocidade_maxima_mps * 3.6, 1)
            : null;
    }

    public function getTempoMovimentoFormatadoAttribute(): ?string
    {
        return $this->tempo_movimento_segundos
            ? $this->formatSeconds($this->tempo_movimento_segundos)
            : null;
    }

    public function getTempoDecorridoFormatadoAttribute(): ?string
    {
        return $this->tempo_decorrido_segundos
            ? $this->formatSeconds($this->tempo_decorrido_segundos)
            : null;
    }

    public function getRitmoMedioFormatadoAttribute(): ?string
    {
        if ($this->ritmo_medio_segundos === null || $this->ritmo_medio_segundos <= 0) {
            return null;
        }

        $minutos = intdiv($this->ritmo_medio_segundos, 60);
        $segundos = $this->ritmo_medio_segundos % 60;

        return sprintf('%d:%02d min/km', $minutos, $segundos);
    }

    public function stravaUrl(): ?string
    {
        if ($this->fonte !== 'strava' || empty($this->fonte_id)) {
            return null;
        }

        return 'https://www.strava.com/activities/' . $this->fonte_id;
    }

    public function hasMapaResumo(): bool
    {
        return filled($this->mapa_resumo_polyline);
    }

    public function mapaResumoSvgPath(int $width = 260, int $height = 96, int $padding = 8): ?string
    {
        $points = $this->decodePolyline($this->mapa_resumo_polyline);

        if (count($points) < 2) {
            return null;
        }

        $latitudes = array_column($points, 0);
        $longitudes = array_column($points, 1);
        $minLat = min($latitudes);
        $maxLat = max($latitudes);
        $minLng = min($longitudes);
        $maxLng = max($longitudes);

        $usableWidth = max(1, $width - ($padding * 2));
        $usableHeight = max(1, $height - ($padding * 2));
        $latRange = max(0.000001, $maxLat - $minLat);
        $lngRange = max(0.000001, $maxLng - $minLng);
        $scale = min($usableWidth / $lngRange, $usableHeight / $latRange);

        $offsetX = $padding + (($usableWidth - ($lngRange * $scale)) / 2);
        $offsetY = $padding + (($usableHeight - ($latRange * $scale)) / 2);

        $segments = [];

        foreach ($points as $index => [$lat, $lng]) {
            $x = $offsetX + (($lng - $minLng) * $scale);
            $y = $offsetY + (($maxLat - $lat) * $scale);
            $segments[] = ($index === 0 ? 'M' : 'L') . round($x, 2) . ' ' . round($y, 2);
        }

        return implode(' ', $segments);
    }

    private function decodePolyline(?string $polyline): array
    {
        if (empty($polyline)) {
            return [];
        }

        $points = [];
        $index = 0;
        $lat = 0;
        $lng = 0;
        $length = strlen($polyline);

        while ($index < $length) {
            $lat += $this->decodePolylineChunk($polyline, $index);
            $lng += $this->decodePolylineChunk($polyline, $index);
            $points[] = [$lat / 1e5, $lng / 1e5];
        }

        return $points;
    }

    private function decodePolylineChunk(string $polyline, int &$index): int
    {
        $result = 0;
        $shift = 0;

        do {
            $byte = ord($polyline[$index++]) - 63;
            $result |= ($byte & 0x1f) << $shift;
            $shift += 5;
        } while ($byte >= 0x20 && $index < strlen($polyline) + 1);

        return ($result & 1) ? ~($result >> 1) : ($result >> 1);
    }

    private function formatSeconds(int $seconds): string
    {
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        $remainingSeconds = $seconds % 60;

        return $hours > 0
            ? sprintf('%d:%02d:%02d', $hours, $minutes, $remainingSeconds)
            : sprintf('%d:%02d', $minutes, $remainingSeconds);
    }
}
