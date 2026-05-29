# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Laravel 13 + Sanctum 的后台管理 API，使用 SQLite（开发期），前端对接地址默认为 `http://localhost:5173`。

## 常用命令

```bash
# 一键安装（安装依赖、生成密钥、迁移、构建前端）
composer run setup

# 开发模式（同时启动 serve / queue / pail / vite）
composer run dev

# 仅启动 API 服务
php artisan serve

# 运行迁移并填充初始数据
php artisan migrate --seed

# 运行测试
php artisan test
# 或
composer run test

# 代码风格检查与修复
./vendor/bin/pint

# 重置超级管理员密码
php artisan admin:reset-password

# 创建存储链接
php artisan storage:link
```

## 项目架构

### 统一响应格式

所有 API 响应通过 `App\Support\ApiResponse` 封装：

- `ApiResponse::success($data, $message)` — 成功响应，code 固定为 `0`
- `ApiResponse::paginate($paginator)` — 分页响应，附加 `meta` 字段
- `ApiResponse::error($code, $message, $httpStatus)` — 错误响应，data 固定为 `null`

Controller 中不要直接 `return response()->json(...)`，统一使用 `ApiResponse`。

### 认证与权限

- 使用 **Sanctum Token 认证**。`POST /login` 返回 `token`，客户端在后续请求的 `Authorization: Bearer {token}` Header 中携带。
- `/login` 有 `throttle:5,1` 限流保护。
- 受保护路由使用 `auth:sanctum` + `active` 中间件组。
- 超级管理员（`is_super_admin = true`）天然拥有所有权限，不受菜单权限中间件限制。
- 除 `/menus` 查询接口外，其他管理接口均受 `menu.permission` 中间件保护。

### 目录约定

- `app/Http/Controllers/` — 控制器，保持精简，业务逻辑下沉到 Service 或模型
- `app/Http/Requests/{Auth,Menu,Profile,Role,Upload,User}/` — 按领域分目录的 FormRequest 验证类
- `app/Models/` — Eloquent 模型，User 使用 `HasMenuPermissions` Trait 处理权限关联
- `app/Models/Traits/Filterable.php` — 可筛选 Trait，配合 `QueryFilter` 实现列表过滤。**所有需要支持 `->filter()` 查询的模型必须 use 此 Trait**
- `app/Services/` — 业务服务层（如 `PermissionService`、`StorageService`）
- `app/Support/ApiResponse.php` — 全局响应封装，禁止绕过
- `app/Http/Middleware/CheckMenuPermission.php` — 菜单权限校验
- `app/Http/Middleware/EnsureUserIsActive.php` — 账号状态与有效期检查
- `app/Console/Commands/AdminResetPassword.php` — 超管密码重置命令

### 错误码

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 10001 | 邮箱或密码错误 |
| 10002 | 账号已禁用或已过期 |
| 10003 | 无权访问 |
| 10004 | 用户不存在 |
| 10005 | 不能修改/删除超级管理员 |
| 10006 | 角色不存在 |
| 10007 | 菜单不存在 |
| 10008 | 请先删除子节点 |
| 10009 | 当前密码不正确 |
| 10010 | 不能删除自己的账号 |

### 数据模型

- **User**：支持 `status`（启用/禁用）、`expires_at`（过期时间）、`is_super_admin`（超管标记）
- **Role**：角色模型
- **Menu**：菜单模型，树形结构，支持权限控制
- 关联表：`user_has_roles`、`role_has_menus`

### 测试

- 配置位于 `phpunit.xml`，测试环境使用内存中的 SQLite (`:memory:`)
- 测试目录：`tests/Unit/` 和 `tests/Feature/`
- 基类为 `Tests\TestCase`，继承自 `Illuminate\Foundation\Testing\TestCase`

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- phpunit/phpunit (PHPUNIT) - v12

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This application uses PHPUnit for testing. All tests must be written as PHPUnit classes. Use `php artisan make:test --phpunit {name}` to create a new test.
- If you see a test using "Pest", convert it to PHPUnit.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite to make sure everything is still passing.
- Tests should cover all happy paths, failure paths, and edge cases.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files; these are core to the application.

## Running Tests

- Run the minimal number of tests, using an appropriate filter, before finalizing.
- To run all tests: `php artisan test --compact`.
- To run all tests in a file: `php artisan test --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --compact --filter=testName` (recommended after making a change to a related file).

</laravel-boost-guidelines>
