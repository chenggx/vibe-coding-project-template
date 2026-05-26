<?php

declare(strict_types=1);

namespace App\Http\Requests\Upload;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:jpg,jpeg,png,gif|max:2048',
        ];
    }
}
