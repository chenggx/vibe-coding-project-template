<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'success', int $code = 0): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function paginate(LengthAwarePaginator $resource, string $message = 'success'): JsonResponse
    {
        return response()->json([
            'code' => 0,
            'message' => $message,
            'data' => $resource->items(),
            'meta' => [
                'current_page' => $resource->currentPage(),
                'last_page' => $resource->lastPage(),
                'per_page' => $resource->perPage(),
                'total' => $resource->total(),
            ],
        ]);
    }

    public static function error(int $code, string $message = 'error', int $httpStatus = 200): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message,
            'data' => null,
        ], $httpStatus);
    }
}
