<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Filters\AnnouncementFilter;
use App\Http\Requests\Announcement\IndexRequest;
use App\Http\Requests\Announcement\StoreRequest;
use App\Http\Requests\Announcement\UpdateRequest;
use App\Models\Announcement;
use App\Support\ApiResponse;

class AnnouncementController extends Controller
{
    public function index(IndexRequest $request, AnnouncementFilter $filter)
    {
        $query = Announcement::query()->filter($filter);
        $query->orderBy('pinned', 'desc')->orderBy('created_at', 'desc');

        return ApiResponse::paginate($query->paginate($request->input('per_page', 15)));
    }

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $request->boolean('status', false),
            'pinned' => $request->boolean('pinned', false),
        ]);

        return ApiResponse::success($announcement, '创建成功');
    }

    public function show(int $id)
    {
        $announcement = Announcement::find($id);

        if (! $announcement) {
            return ApiResponse::error(10004, '公告不存在');
        }

        return ApiResponse::success($announcement);
    }

    public function update(UpdateRequest $request, int $id)
    {
        $announcement = Announcement::find($id);

        if (! $announcement) {
            return ApiResponse::error(10004, '公告不存在');
        }

        $validated = $request->validated();

        $announcement->title = $validated['title'];
        $announcement->content = $validated['content'];

        if ($request->has('status')) {
            $announcement->status = $request->boolean('status');
        }

        if ($request->has('pinned')) {
            $announcement->pinned = $request->boolean('pinned');
        }

        $announcement->save();

        return ApiResponse::success($announcement, '更新成功');
    }

    public function destroy(int $id)
    {
        $announcement = Announcement::find($id);

        if (! $announcement) {
            return ApiResponse::error(10004, '公告不存在');
        }

        $announcement->delete();

        return ApiResponse::success(null, '删除成功');
    }
}
