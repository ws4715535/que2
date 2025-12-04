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
    // 检查用户是否已存在
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      await db.collection('users').add({
        data: {
          openid: openid,
          nickname: '微信用户',
          avatar: '',
          phone: '',
          rating: 5.0,
          publishCount: 0,
          soldCount: 0,
          createdAt: new Date()
        }
      })
    }
    
    return {
      code: 0,
      message: '登录成功',
      data: {
        openid: openid
      }
    }
  } catch (error) {
    console.error('登录失败', error)
    return {
      code: -1,
      message: '登录失败',
      error: error
    }
  }
}