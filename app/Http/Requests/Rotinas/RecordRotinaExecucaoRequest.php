<?php

namespace App\Http\Requests\Rotinas;

use Illuminate\Foundation\Http\FormRequest;

class RecordRotinaExecucaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'data' => 'nullable|date',
            'status' => 'required|in:pendente,concluida,pulada',
            'modo_usado' => 'nullable|in:normal,minimo',
            'observacao' => 'nullable|string|max:500',
        ];
    }
}
