// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }

    // 全局数据
    this.globalData = {
      userInfo: null,
      openid: null
    }
  },

  // 获取用户openid
  async getOpenid() {
    if (this.globalData.openid) {
      return this.globalData.openid
    }

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      })
      this.globalData.openid = result.openid
      return result.openid
    } catch (error) {
      console.error('获取openid失败', error)
      return null
    }
  },

  // 获取用户信息
  async getUserInfo() {
    if (this.globalData.userInfo) {
      return this.globalData.userInfo
    }

    try {
      const openid = await this.getOpenid()
      if (!openid) return null

      const db = wx.cloud.database()
      const { data: user } = await db.collection('users').where({
        openid: openid
      }).get()

      if (user && user.length > 0) {
        this.globalData.userInfo = user[0]
        return user[0]
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败', error)
      return null
    }
  }
})
