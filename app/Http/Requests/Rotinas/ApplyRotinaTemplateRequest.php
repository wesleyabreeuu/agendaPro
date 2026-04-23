<?php

namespace App\Http\Requests\Rotinas;

use Illuminate\Foundation\Http\FormRequest;

class ApplyRotinaTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [];
    }
}
