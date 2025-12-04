// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时更新用户信息
    if (this.data.isLoggedIn) {
      this.loadUserInfo()
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const openid = await app.getOpenid()
      if (openid) {
        this.setData({ isLoggedIn: true })
        this.loadUserInfo()
      }
    } catch (error) {
      console.error('检查登录状态失败', error)
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = await app.getUserInfo()
      if (userInfo) {
        this.setData({ userInfo })
      }
    } catch (error) {
      console.error('加载用户信息失败', error)
    }
  },

  // 微信登录
  onLoginTap() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: async (res) => {
        try {
          wx.showLoading({ title: '登录中...' })
          
          // 调用登录云函数
          const { result } = await wx.cloud.callFunction({
            name: 'login'
          })
          
          if (result && result.code === 0) {
            // 更新用户信息
            const db = wx.cloud.database()
            await db.collection('users').where({
              openid: result.data.openid
            }).update({
              data: {
                nickname: res.userInfo.nickName,
                avatar: res.userInfo.avatarUrl
              }
            })
            
            this.setData({ isLoggedIn: true })
            await this.loadUserInfo()
            
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('登录失败', error)
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        } finally {
          wx.hideLoading()
        }
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none'
        })
      }
    })
  },

  // 退出登录
  onLogoutTap() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局数据
          app.globalData.userInfo = null
          app.globalData.openid = null
          
          this.setData({
            isLoggedIn: false,
            userInfo: {}
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 我的发布
  onMyProductsTap() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-products/my-products'
    })
  },

  // 我的收藏
  onMyFavoritesTap() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/my-favorites/my-favorites'
    })
  },

  // 交易记录
  onTransactionsTap() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 设置
  onSettingsTap() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})