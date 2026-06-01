<?php

namespace App\Http\Requests\Goals;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'data' => 'required|date',
            'descricao' => 'required|string|max:255',
            'valor' => 'nullable|numeric|max:999999999999',
            'tipo' => 'required|string|max:40',
            'observacoes' => 'nullable|string',
        ];
    }
}
