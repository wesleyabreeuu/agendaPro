<?php

namespace App\Http\Requests\Goals;

use App\Models\Goal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string|max:80',
            'data_inicio' => 'nullable|date',
            'data_meta' => 'nullable|date|after_or_equal:data_inicio',
            'status' => ['required', Rule::in(Goal::STATUSES)],
            'cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'icone' => 'nullable|string|max:60',
            'peso_inicial' => 'nullable|numeric|min:0|max:99999999',
            'peso_meta' => 'nullable|numeric|min:0|max:99999999',
            'distancia_meta' => 'nullable|numeric|min:0|max:9999999999',
            'valor_meta' => 'nullable|numeric|min:0|max:999999999999',
            'tipo_meta' => ['required', Rule::in(Goal::GOAL_TYPES)],
            'rotina_ids' => 'nullable|array',
            'rotina_ids.*' => 'integer|exists:rotinas,id',
            'milestones' => 'nullable|array',
            'milestones.*.titulo' => 'nullable|string|max:255',
            'milestones.*.descricao' => 'nullable|string',
            'milestones.*.ordem' => 'nullable|integer|min:1',
            'milestones.*.meta_valor' => 'nullable|numeric|min:0',
            'milestones.*.concluido' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->input('status', 'planejamento'),
            'tipo_meta' => $this->input('tipo_meta', 'personalizado'),
            'rotina_ids' => array_values(array_filter((array) $this->input('rotina_ids', []))),
        ]);
    }
}
