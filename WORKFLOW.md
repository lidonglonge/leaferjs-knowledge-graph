# 开发工作流程

## 分支策略

- `main` - 生产分支，稳定版本
- `develop` - 开发分支，所有功能开发在此进行
- `feature/*` - 功能分支（可选，复杂功能时使用）

## 当前状态

- ✅ 已创建 `develop` 分支
- ✅ 已推送到 GitHub
- 📝 开发进行中

## 开发步骤

1. **在 develop 分支开发**
   ```bash
   git checkout develop
   # 编写代码
   git add .
   git commit -m "feat: xxx"
   git push origin develop
   ```

2. **准备合并时**
   - 确保代码完成并通过测试
   - 更新版本号和 CHANGELOG
   - 创建 Pull Request: `develop` → `main`

3. **代码审查**
   - 通知 code-reviewer 会话检查代码
   - 根据反馈修改
   - 审查通过后合并到 main

## 代码审查检查清单

提交审查前自检：
- [ ] 代码可以正常编译/构建
- [ ] 没有明显的逻辑错误
- [ ] 命名清晰，符合规范
- [ ] 已添加必要的注释
- [ ] 删除调试代码和 console.log

## 审查代理信息

- **会话 Key**: `agent:claude:acp:37d49b1f-ba14-445b-8792-bc00cab40c42`
- **标签**: code-reviewer
- **技能**: simplify, frontend-design
- **职责**: MR/PR 代码审查

## 通知审查代理的命令

```
/sessions_send agent:claude:acp:37d49b1f-ba14-445b-8792-bc00cab40c42 \
  "请审查代码: https://github.com/lidonglonge/leaferjs-knowledge-graph/pull/1"
```

或使用 git diff：
```
sessions_send agent:claude:acp:37d49b1f-ba14-445b-8792-bc00cab40c42 \
  "请审查以下代码变更:\n\n[粘贴 git diff 内容]"
```
