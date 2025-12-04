// 数据库初始化脚本
// 在微信开发者工具的云开发控制台中执行

// 创建 users 集合
// 索引：openid (唯一)
{
  "collectionName": "users",
  "indexes": [
    {
      "name": "openid_index",
      "key": { "openid": 1 },
      "unique": true
    }
  ]
}

// 创建 products 集合  
// 索引：userId, category, status, createdAt
{
  "collectionName": "products",
  "indexes": [
    {
      "name": "userId_index",
      "key": { "userId": 1 }
    },
    {
      "name": "category_index",
      "key": { "category": 1 }
    },
    {
      "name": "status_index",
      "key": { "status": 1 }
    },
    {
      "name": "createdAt_index",
      "key": { "createdAt": -1 }
    }
  ]
}

// 创建 messages 集合
// 索引：fromUserId, toUserId, createdAt
{
  "collectionName": "messages",
  "indexes": [
    {
      "name": "fromUserId_index",
      "key": { "fromUserId": 1 }
    },
    {
      "name": "toUserId_index",
      "key": { "toUserId": 1 }
    },
    {
      "name": "createdAt_index",
      "key": { "createdAt": -1 }
    }
  ]
}

// 创建 favorites 集合
// 索引：userId, productId (联合唯一)
{
  "collectionName": "favorites",
  "indexes": [
    {
      "name": "userId_productId_index",
      "key": { "userId": 1, "productId": 1 },
      "unique": true
    }
  ]
}