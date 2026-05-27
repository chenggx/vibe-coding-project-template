<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'type',
        'path',
        'icon',
        'permission',
        'sort_order',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_has_menus');
    }

    public static function toTree(Collection $menus, ?int $parentId = null): array
    {
        return $menus->where('parent_id', $parentId)
            ->sortBy('sort_order')
            ->values()
            ->map(
                fn ($item) => array_merge(
                    $item->toArray(),
                    ['children' => self::toTree($menus, $item->id)]
                )
            )
            ->all();
    }

    /**
     * 验证菜单类型的字段约束（共享逻辑，供 StoreRequest 和 UpdateRequest 调用）。
     */
    public static function validateMenuType(array $data): void
    {
        $type = $data['type'];

        if ($type === 'catalog') {
            if (($data['permission'] ?? null) !== null) {
                abort(response()->json(['code' => 10007, 'message' => '目录类型不能有权限标识', 'data' => null]));
            }
            if (($data['path'] ?? null) !== null) {
                abort(response()->json(['code' => 10007, 'message' => '目录类型不能有路由路径', 'data' => null]));
            }
        }

        if ($type === 'menu') {
            if (empty($data['permission'])) {
                abort(response()->json(['code' => 10007, 'message' => '菜单类型必须有权限标识', 'data' => null]));
            }
            if (empty($data['path'])) {
                abort(response()->json(['code' => 10007, 'message' => '菜单类型必须有路由路径', 'data' => null]));
            }
        }

        if ($type === 'permission') {
            if (($data['path'] ?? null) !== null) {
                abort(response()->json(['code' => 10007, 'message' => '权限点类型不能有路由路径', 'data' => null]));
            }
            if (($data['icon'] ?? null) !== null) {
                abort(response()->json(['code' => 10007, 'message' => '权限点类型不能有图标', 'data' => null]));
            }
        }

        if (! empty($data['parent_id'])) {
            $parent = self::find($data['parent_id']);
            if ($parent && $parent->type === 'permission') {
                abort(response()->json(['code' => 10007, 'message' => '不能将节点挂在权限点下', 'data' => null]));
            }
        }
    }

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }
}
