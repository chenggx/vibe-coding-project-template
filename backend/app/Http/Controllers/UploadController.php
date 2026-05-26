<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\StorageService;
use App\Support\ApiResponse;
use App\Http\Requests\Upload\StoreRequest;

class UploadController extends Controller
{
    public function store(StoreRequest $request)
    {
        $url = app(StorageService::class)->upload($request->file('file'), 'avatars');

        return ApiResponse::success(['url' => $url], '上传成功');
    }
}
