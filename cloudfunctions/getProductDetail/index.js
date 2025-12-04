// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { productId } = event
  
  if (!productId) {
    return {
      code: -1,
      message: '商品ID不能为空'
    }
  }
  
  try {
    // 获取商品详情
    const productResult = await db.collection('products')
      .doc(productId)
      .get()
    
    if (!productResult.data) {
      return {
        code: -1,
        message: '商品不存在'
      }
    }
    
    const product = productResult.data
    
    // 获取卖家信息
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
    
    // 更新浏览次数
    try {
      await db.collection('products').doc(productId).update({
        data: {
          viewCount: db.command.inc(1)
        }
      })
    } catch (error) {
      console.error('更新浏览次数失败', error)
    }
    
    return {
      code: 0,
      message: '获取成功',
      data: product
    }
  } catch (error) {
    console.error('获取商品详情失败', error)
    return {
      code: -1,
      message: '获取失败',
      error: error
    }
  }
}