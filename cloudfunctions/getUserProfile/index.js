// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  const openid = wxContext.OPENID
  
  try {
    // 获取用户信息
    const userResult = await db.collection('users')
      .where({ openid: openid })
      .get()
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        id: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        rating: user.rating,
        publishCount: user.publishCount,
        soldCount: user.soldCount,
        createdAt: user.createdAt
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return {
      code: -1,
      message: '获取失败',
      error: error
    }
  }
}