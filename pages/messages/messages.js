// pages/messages/messages.js
const app = getApp()

Page({
  data: {
    conversations: [],
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.checkLoginAndLoadMessages()
  },

  onShow() {
    // 页面显示时刷新消息列表
    if (this.data.conversations.length > 0) {
      this.loadMessages(true)
    }
  },

  // 检查登录状态并加载消息
  async checkLoginAndLoadMessages() {
    try {
      const openid = await app.getOpenid()
      if (!openid) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再查看消息',
          showCancel: false,
          success: () => {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        })
        return
      }
      
      this.loadMessages(true)
    } catch (error) {
      console.error('检查登录状态失败', error)
    }
  },

  // 加载消息列表
  async loadMessages(reset = false) {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getMessageList',
        data: {
          page: reset ? 1 : Math.ceil(this.data.conversations.length / 20) + 1,
          limit: 20
        }
      })

      if (result && result.code === 0) {
        const newConversations = result.data.list
        const conversations = reset ? newConversations : [...this.data.conversations, ...newConversations]
        
        this.setData({
          conversations,
          hasMore: result.data.hasMore,
          loading: false
        })
      } else {
        this.setData({ loading: false })
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载消息列表失败', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '网络错误',
        icon: 'none'
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
    
    // 小于7天
    if (diff < 604800000) {
      return Math.floor(diff / 86400000) + '天前'
    }
    
    // 超过7天显示日期
    const month = messageDate.getMonth() + 1
    const day = messageDate.getDate()
    return `${month}月${day}日`
  },

  // 点击会话
  onConversationTap(e) {
    const conversation = e.currentTarget.dataset.item
    
    wx.navigateTo({
      url: `/pages/chat/chat?toUserId=${conversation.otherUserId}&nickname=${conversation.otherUser.nickname}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadMessages(true)
    wx.stopPullDownRefresh()
  }
})