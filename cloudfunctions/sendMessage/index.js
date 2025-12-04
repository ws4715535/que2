// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  const fromUserId = wxContext.OPENID
  const { toUserId, content, productId } = event
  
  // 参数验证
  if (!toUserId || !content) {
    return {
      code: -1,
      message: '参数不完整'
    }
  }
  
  if (fromUserId === toUserId) {
    return {
      code: -1,
      message: '不能给自己发送消息'
    }
  }
  
  try {
    // 创建消息
    await db.collection('messages').add({
      data: {
        fromUserId,
        toUserId,
        productId: productId || '',
        content,
        isRead: false,
        createdAt: new Date()
      }
    })
    
    return {
      code: 0,
      message: '发送成功'
    }
  } catch (error) {
    console.error('发送消息失败', error)
    return {
      code: -1,
      message: '发送失败',
      error: error
    }
  }
}