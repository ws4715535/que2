// pages/chat/chat.js
const app = getApp()

Page({
  data: {
    messages: [],
    inputValue: '',
    currentUserId: '',
    toUserId: '',
    toUserNickname: '',
    productId: '',
    scrollToView: ''
  },

  onLoad(options) {
    this.setData({
      toUserId: options.toUserId,
      toUserNickname: options.nickname || '未知用户',
      productId: options.productId || ''
    })
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.toUserNickname
    })
    
    this.loadCurrentUser()
    this.loadMessages()
  },

  // 加载当前用户信息
  async loadCurrentUser() {
    try {
      const openid = await app.getOpenid()
      this.setData({ currentUserId: openid })
    } catch (error) {
      console.error('加载用户信息失败', error)
    }
  },

  // 加载消息历史
  async loadMessages() {
    try {
      const db = wx.cloud.database()
      const { data: messages } = await db.collection('messages')
        .where(
          wx.cloud.database().command.or([
            {
              fromUserId: this.data.currentUserId,
              toUserId: this.data.toUserId
            },
            {
              fromUserId: this.data.toUserId,
              toUserId: this.data.currentUserId
            }
          ])
        )
        .orderBy('createdAt', 'asc')
        .get()
      
      this.setData({
        messages: messages
      })
      
      // 滚动到底部
      if (messages.length > 0) {
        this.scrollToBottom()
      }
      
      // 标记消息为已读
      this.markMessagesAsRead()
    } catch (error) {
      console.error('加载消息失败', error)
    }
  },

  // 标记消息为已读
  async markMessagesAsRead() {
    try {
      const db = wx.cloud.database()
      await db.collection('messages')
        .where({
          fromUserId: this.data.toUserId,
          toUserId: this.data.currentUserId,
          isRead: false
        })
        .update({
          data: {
            isRead: true
          }
        })
    } catch (error) {
      console.error('标记消息已读失败', error)
    }
  },

  // 输入框变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 发送消息
  async sendMessage() {
    const content = this.data.inputValue.trim()
    if (!content) return
    
    try {
      // 调用云函数发送消息
      const { result } = await wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          toUserId: this.data.toUserId,
          content: content,
          productId: this.data.productId
        }
      })
      
      if (result && result.code === 0) {
        // 清空输入框
        this.setData({
          inputValue: ''
        })
        
        // 重新加载消息
        this.loadMessages()
      } else {
        wx.showToast({
          title: result.message || '发送失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('发送消息失败', error)
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  },

  // 滚动到底部
  scrollToBottom() {
    const messages = this.data.messages
    if (messages.length > 0) {
      this.setData({
        scrollToView: `msg-${messages.length - 1}`
      })
    }
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return ''
    
    const now = new Date()
    const messageDate = new Date(date)
    const diff = now - messageDate
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }
    
    // 小于1小时
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前'
    }
    
    // 小于24小时
    if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前'
    }
    
    // 显示具体时间
    const hours = messageDate.getHours().toString().padStart(2, '0')
    const minutes = messageDate.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
})