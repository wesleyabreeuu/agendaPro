<?php

namespace App\Http\Requests\Rotinas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRotinaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'required|in:espiritual,saude,trabalho,familia,estudos,financeiro,pessoal,outro',
            'frequencia_tipo' => 'required|in:diaria,dias_semana,intervalo',
            'dias_semana' => 'nullable|array',
            'dias_semana.*' => 'in:dom,seg,ter,qua,qui,sex,sab',
            'intervalo_dias' => 'nullable|integer|min:1',
            'data_inicio' => 'nullable|date',
            'horario' => 'nullable|date_format:H:i',
            'dificuldade' => 'required|in:facil,media,dificil',
            'energia_recomendada' => 'nullable|in:baixa,media,alta',
            'modo_minimo_ativo' => 'nullable|boolean',
            'modo_minimo_descricao' => 'nullable|string|max:500',
            'cor' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'icone' => 'nullable|string|max:60',
            'ativo' => 'nullable|boolean',
            'ordem' => 'nullable|integer|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'modo_minimo_ativo' => $this->boolean('modo_minimo_ativo'),
            'ativo' => $this->has('ativo') ? $this->boolean('ativo') : true,
            'dias_semana' => array_values(array_filter((array) $this->input('dias_semana', []))),
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('frequencia_tipo') === 'dias_semana' && count((array) $this->input('dias_semana', [])) === 0) {
                $validator->errors()->add('dias_semana', 'Selecione pelo menos um dia da semana.');
            }

            if ($this->input('frequencia_tipo') === 'intervalo' && !$this->filled('intervalo_dias')) {
                $validator->errors()->add('intervalo_dias', 'Informe o intervalo em dias.');
            }
        });
    }
}
