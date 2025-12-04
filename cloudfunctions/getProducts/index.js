// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  
  const {
    page = 1,
    limit = 20,
    category = '',
    keyword = ''
  } = event
  
  try {
    // 构建查询条件
    let where = {
      status: 'onsale' // 只显示在售商品
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (keyword) {
      where.title = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }
    
    // 获取商品总数
    const countResult = await db.collection('products').where(where).count()
    const total = countResult.total
    
    // 获取商品列表
    const productsResult = await db.collection('products')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    
    // 获取卖家信息
    const products = await Promise.all(
      productsResult.data.map(async (product) => {
        try {
          const userResult = await db.collection('users')
            .where({ openid: product.userId })
            .get()
          
          if (userResult.data.length > 0) {
            product.seller = {
              id: userResult.data[0].openid,
              nickname: userResult.data[0].nickname,
              avatar: userResult.data[0].avatar,
              rating: userResult.data[0].rating,
              soldCount: userResult.data[0].soldCount
            }
          }
        } catch (error) {
          console.error('获取卖家信息失败', error)
        }
        return product
      })
    )
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: products,
        total: total,
        hasMore: page * limit < total
      }
    }
  } catch (error) {
    console.error('获取商品列表失败', error)
    return {
      code: -1,
      message: '获取失败',
      error: error
    }
  }
}