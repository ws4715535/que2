// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  const userId = wxContext.OPENID
  const { page = 1, limit = 20 } = event
  
  try {
    // 获取用户相关的消息会话列表
    const messages = await db.collection('messages')
      .where(
        db.command.or([
          { fromUserId: userId },
          { toUserId: userId }
        ])
      )
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    
    // 按会话分组，获取每个会话的最新消息
    const conversations = {}
    
    messages.data.forEach(message => {
      const otherUserId = message.fromUserId === userId ? message.toUserId : message.fromUserId
      const conversationKey = otherUserId
      
      if (!conversations[conversationKey] || 
          message.createdAt > conversations[conversationKey].lastMessage.createdAt) {
        conversations[conversationKey] = {
          otherUserId: otherUserId,
          lastMessage: message,
          unreadCount: 0
        }
      }
    })
    
    // 获取每个会话的未读消息数
    for (const key in conversations) {
      const conversation = conversations[key]
      const unreadResult = await db.collection('messages')
        .where({
          toUserId: userId,
          fromUserId: conversation.otherUserId,
          isRead: false
        })
        .count()
      
      conversation.unreadCount = unreadResult.total
    }
    
    // 获取对方用户信息
    const conversationList = await Promise.all(
      Object.values(conversations).map(async (conversation) => {
        try {
          const userResult = await db.collection('users')
            .where({ openid: conversation.otherUserId })
            .get()
          
          if (userResult.data.length > 0) {
            conversation.otherUser = {
              nickname: userResult.data[0].nickname,
              avatar: userResult.data[0].avatar
            }
          }
        } catch (error) {
          console.error('获取用户信息失败', error)
        }
        return conversation
      })
    )
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: conversationList,
        hasMore: conversationList.length === limit
      }
    }
  } catch (error) {
    console.error('获取消息列表失败', error)
    return {
      code: -1,
      message: '获取失败',
      error: error
    }
  }
}