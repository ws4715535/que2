// pages/detail/detail.js
const app = getApp()

Page({
  data: {
    product: {},
    isFavorited: false,
    productId: ''
  },

  onLoad(options) {
    const productId = options.id
    this.setData({ productId })
    this.loadProductDetail(productId)
    this.checkFavorite(productId)
  },

  // 加载商品详情
  async loadProductDetail(productId) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getProductDetail',
        data: { productId }
      })

      if (result && result.code === 0) {
        this.setData({
          product: result.data
        })
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载商品详情失败', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 检查是否已收藏
  async checkFavorite(productId) {
    try {
      const openid = await app.getOpenid()
      if (!openid) return

      const db = wx.cloud.database()
      const { data } = await db.collection('favorites').where({
        userId: openid,
        productId: productId
      }).get()

      this.setData({
        isFavorited: data.length > 0
      })
    } catch (error) {
      console.error('检查收藏状态失败', error)
    }
  },

  // 获取分类名称
  getCategoryName(category) {
    const categoryMap = {
      'table': '麻将桌',
      'tiles': '麻将牌',
      'accessories': '配件',
      'other': '其他'
    }
    return categoryMap[category] || category
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src
    const urls = e.currentTarget.dataset.urls
    
    wx.previewImage({
      current,
      urls
    })
  },

  // 收藏/取消收藏
  async onFavoriteTap() {
    try {
      const openid = await app.getOpenid()
      if (!openid) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      wx.showLoading({ title: '处理中...' })

      if (this.data.isFavorited) {
        // 取消收藏
        const db = wx.cloud.database()
        await db.collection('favorites').where({
          userId: openid,
          productId: this.data.productId
        }).remove()
        
        this.setData({ isFavorited: false })
        wx.showToast({ title: '已取消收藏' })
      } else {
        // 添加收藏
        const db = wx.cloud.database()
        await db.collection('favorites').add({
          data: {
            userId: openid,
            productId: this.data.productId,
            createdAt: new Date()
          }
        })
        
        this.setData({ isFavorited: true })
        wx.showToast({ title: '收藏成功' })
      }
    } catch (error) {
      console.error('收藏操作失败', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 私信卖家
  async onMessageTap() {
    try {
      const openid = await app.getOpenid()
      if (!openid) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      // 检查是否是卖家本人
      if (openid === this.data.product.userId) {
        wx.showToast({
          title: '这是您自己的商品',
          icon: 'none'
        })
        return
      }

      // 跳转到聊天页面
      wx.navigateTo({
        url: `/pages/chat/chat?toUserId=${this.data.product.userId}&productId=${this.data.productId}`
      })
    } catch (error) {
      console.error('私信失败', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 立即购买
  onBuyTap() {
    wx.showModal({
      title: '联系卖家',
      content: '是否立即联系卖家进行交易？',
      success: (res) => {
        if (res.confirm) {
          this.onMessageTap()
        }
      }
    })
  }
})