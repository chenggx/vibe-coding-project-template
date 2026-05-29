<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Filters\OperationLogFilter;
use App\Http\Requests\OperationLog\IndexRequest;
use App\Models\OperationLog;
use App\Support\ApiResponse;

class OperationLogController extends Controller
{
    public function index(IndexRequest $request, OperationLogFilter $filter)
    {
        $query = OperationLog::query()->filter($filter);
        $query->orderBy('created_at', 'desc');

        return ApiResponse::paginate($query->paginate($request->input('per_page', 15)));
    }
}
