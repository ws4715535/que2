// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  
  const openid = wxContext.OPENID
  const {
    title,
    description,
    price,
    images,
    category,
    condition,
    location
  } = event
  
  // 参数验证
  if (!title || !description || !price || !images || !category || !condition || !location) {
    return {
      code: -1,
      message: '参数不完整'
    }
  }
  
  try {
    // 创建商品
    const productResult = await db.collection('products').add({
      data: {
        userId: openid,
        title,
        description,
        price: parseFloat(price),
        images,
        category,
        condition,
        location,
        status: 'onsale',
        viewCount: 0,
        favoriteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // 更新用户发布数量
    await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        publishCount: _.inc(1)
      }
    })
    
    return {
      code: 0,
      message: '发布成功',
      data: {
        productId: productResult._id
      }
    }
  } catch (error) {
    console.error('发布商品失败', error)
    return {
      code: -1,
      message: '发布失败',
      error: error
    }
  }
}