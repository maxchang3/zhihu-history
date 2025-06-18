# CONTRIBUTION

## 开发环境设置

### 前置要求

| 要求               | 版本/说明                            |
| ------------------ | ------------------------------------ |
| **Node.js**        | 版本 >= 23.0.0                       |
| **包管理器**       | pnpm                                 |
| **浏览器**         | 支持用户脚本的浏览器                 |
| **用户脚本管理器** | Tampermonkey（已测试）或其他兼容扩展 |

### 快速开始

1. **克隆仓库**
    ```bash
    git clone https://github.com/maxchang3/zhihu-history.git
    cd zhihu-history
    ```

2. **安装依赖**
    ```bash
    pnpm install
    ```

3. **启动开发环境**
    ```bash
    pnpm dev
    ```

4. **安装开发版本**
    - 此时会自动打开浏览器，用户脚本管理器会自动识别并提示安装

## 开发规范

### 代码规范

使用 [Biome](https://biomejs.dev/) 进行代码格式化和检查：

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix

# 类型检查
pnpm typecheck
```

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## 构建与发布

### 构建命令

```bash
# 开发服务器
pnpm dev

# 生产构建
pnpm build
```

### 版本发布

使用 [bumpp](https://github.com/antfu/bumpp) 管理版本：

```bash
# 发布新版本
pnpm release
```

### 依赖更新

使用 [taze](https://github.com/antfu/taze) 更新依赖：

```bash
# 更新依赖（排除 React 相关包）
pnpm bump-deps
```
