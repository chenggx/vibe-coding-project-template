<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Filters\LoginLogFilter;
use App\Http\Requests\LoginLog\IndexRequest;
use App\Models\LoginLog;
use App\Support\ApiResponse;

class LoginLogController extends Controller
{
    public function index(IndexRequest $request, LoginLogFilter $filter)
    {
        $query = LoginLog::query()->filter($filter);
        $query->orderBy('created_at', 'desc');

        return ApiResponse::paginate($query->paginate($request->input('per_page', 15)));
    }
}
