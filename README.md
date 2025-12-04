# 闲雀 - 立直麻将设备/周边交易平台

专为麻将爱好者打造的二手交易社区微信小程序。

## 功能特性

- **商品浏览**: 首页展示推荐商品，支持分类筛选和搜索
- **商品详情**: 查看商品详细信息，联系卖家，收藏商品
- **发布商品**: 上传商品图片，填写详细信息，快速发布
- **个人中心**: 管理个人信息，查看发布和收藏
- **消息中心**: 与买家/卖家私信聊天，实时沟通
- **微信登录**: 使用微信授权登录，安全可靠

## 技术架构

- **前端**: 微信小程序原生框架
- **后端**: 微信云开发（云函数、数据库、存储）
- **数据库**: 微信云开发数据库（MongoDB）
- **用户认证**: 微信授权登录

## 项目结构

```
MahjongManager/
├── app.js                    # 小程序应用入口
├── app.json                  # 小程序全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json             # 站点地图配置
├── pages/                   # 页面目录
│   ├── index/              # 首页
│   ├── detail/             # 商品详情页
│   ├── publish/            # 发布商品页
│   ├── profile/            # 个人中心
│   ├── messages/           # 消息中心
│   └── chat/               # 聊天页面
├── cloudfunctions/         # 云函数目录
│   ├── login/              # 用户登录
│   ├── getProducts/        # 获取商品列表
│   ├── getProductDetail/   # 获取商品详情
│   ├── publishProduct/     # 发布商品
│   ├── getUserProfile/     # 获取用户资料
│   ├── sendMessage/        # 发送消息
│   └── getMessageList/     # 获取消息列表
└── images/                 # 图片资源目录
```

## 快速开始

1. **安装微信开发者工具**
   - 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. **导入项目**
   - 打开微信开发者工具
   - 点击"导入项目"
   - 选择项目根目录
   - 填写AppID（需要注册小程序账号）

3. **配置云开发环境**
   - 在微信开发者工具中开通云开发
   - 创建数据库集合：users、products、messages、favorites
   - 部署云函数

4. **运行项目**
   - 点击"编译"按钮
   - 在模拟器中预览效果

## 数据库设计

### users 用户表
- openid: 用户唯一标识
- nickname: 昵称
- avatar: 头像URL
- phone: 手机号
- rating: 评分
- publishCount: 发布数量
- soldCount: 成交数量
- createdAt: 创建时间

### products 商品表
- userId: 发布者ID
- title: 商品标题
- description: 商品描述
- images: 商品图片数组
- price: 价格
- category: 分类
- condition: 新旧程度
- location: 所在地区
- status: 状态（onsale/sold/offline）
- viewCount: 浏览次数
- favoriteCount: 收藏次数
- createdAt: 创建时间
- updatedAt: 更新时间

### messages 消息表
- fromUserId: 发送者ID
- toUserId: 接收者ID
- productId: 相关商品ID
- content: 消息内容
- isRead: 是否已读
- createdAt: 创建时间

### favorites 收藏表
- userId: 用户ID
- productId: 商品ID
- createdAt: 创建时间

## API 接口

### 商品相关
- `getProducts`: 获取商品列表
- `getProductDetail`: 获取商品详情
- `publishProduct`: 发布新商品

### 用户相关
- `login`: 用户登录
- `getUserProfile`: 获取用户信息

### 消息相关
- `sendMessage`: 发送私信
- `getMessageList`: 获取消息列表

## 开发说明

### 页面开发
- 使用微信小程序原生框架开发
- 遵循微信小程序设计规范
- 采用组件化开发模式

### 云函数开发
- 使用Node.js开发云函数
- 遵循微信云开发最佳实践
- 注意错误处理和安全性

### 样式设计
- 主色调：深绿色 (#2E7D32)
- 辅助色：米白色 (#FFF8E1)
- 圆角设计，简约风格

## 部署说明

1. **上传代码**
   - 在微信开发者工具中点击"上传"
   - 填写版本号和描述

2. **提交审核**
   - 登录[微信公众平台](https://mp.weixin.qq.com/)
   - 提交小程序审核

3. **发布上线**
   - 审核通过后发布上线

## 注意事项

- 需要注册微信小程序账号
- 需要开通微信支付（如需交易功能）
- 遵守微信小程序平台规范
- 注意用户隐私保护

## 联系方式

如有问题，请在GitHub上提交Issue或联系开发者。
