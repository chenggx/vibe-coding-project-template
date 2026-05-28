# Phase 2: Upload 模块迁移

**目标**：迁移最简单的单操作 upload 模块，验证 Phase 1 基础设施可用。

---

## 前置依赖

- [ ] Phase 1 已完成并合并

## 子任务

### adminApi 注入 upload endpoint

- [ ] 在 `src/services/adminApi.ts` 的 `endpoints` 中注入：
  ```ts
  uploadFile: build.mutation<{ url: string }, File>({
    query: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return { url: '/upload', method: 'POST', body: formData };
    },
  })
  ```

### 组件迁移

- [ ] 修改 `src/components/common/ImageUploader.tsx`
  - [ ] `import { useUploadFileMutation } from '@/services/adminApi'`
  - [ ] `const [uploadFile, { isLoading }] = useUploadFileMutation()`
  - [ ] 替换 `uploadApi.uploadFile(file)` 为 `uploadFile(file).unwrap()`
  - [ ] 处理 `unwrap()` 抛出的错误（替代原来的 try/catch 或 error 状态）

- [ ] 修改 `src/modules/auth/pages/ProfilePage.tsx`
  - [ ] 移除 `import { uploadApi } from '@/modules/upload/api'`（如存在）
  - [ ] 确保头像上传通过 `ImageUploader` 的 `onChange` 完成，不直接调用 uploadApi

### 清理旧代码

- [ ] 删除 `src/modules/upload/api.ts`
- [ ] 删除 `src/modules/upload/slice.ts`
- [ ] 修改 `src/app/rootReducer.ts`：移除 `upload` reducer
- [ ] 删除 `src/modules/upload/tests/api.test.ts`

### 验证

- [ ] 头像上传功能手动测试通过（个人资料页上传头像）
- [ ] `pnpm build` 无错误
- [ ] `grep -r "uploadApi\|upload/slice" src/` 无残留引用
- [ ] `pnpm test` 基线不变

---

## 关键文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/adminApi.ts` | 修改 | 注入 uploadFile endpoint |
| `src/components/common/ImageUploader.tsx` | 修改 | 使用 mutation hook |
| `src/modules/auth/pages/ProfilePage.tsx` | 修改 | 清理旧引用 |
| `src/modules/upload/api.ts` | 删除 | |
| `src/modules/upload/slice.ts` | 删除 | |
| `src/modules/upload/tests/api.test.ts` | 删除 | |
| `src/app/rootReducer.ts` | 修改 | 移除 upload reducer |

---

## 回滚

恢复删除的文件，还原 rootReducer 和页面改动。
