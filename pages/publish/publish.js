// pages/publish/publish.js
const app = getApp()

Page({
  data: {
    images: [],
    categories: [
      { name: '麻将桌', value: 'table' },
      { name: '麻将牌', value: 'tiles' },
      { name: '配件', value: 'accessories' },
      { name: '其他', value: 'other' }
    ],
    conditions: [
      { name: '全新', value: 'new' },
      { name: '九成新', value: 'ninety' },
      { name: '八成新', value: 'eighty' },
      { name: '七成新', value: 'seventy' },
      { name: '六成新及以下', value: 'sixty' }
    ],
    categoryName: '',
    conditionName: '',
    categoryValue: '',
    conditionValue: ''
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录状态
  async checkLogin() {
    try {
      const openid = await app.getOpenid()
      if (!openid) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再发布商品',
          showCancel: false,
          success: () => {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        })
      }
    } catch (error) {
      console.error('检查登录状态失败', error)
    }
  },

  // 选择图片
  chooseImage() {
    const remaining = 9 - this.data.images.length
    
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          images: [...this.data.images, ...newImages]
        })
      },
      fail: (error) => {
        console.error('选择图片失败', error)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.images
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    this.setData({
      categoryName: category.name,
      categoryValue: category.value
    })
  },

  // 新旧程度选择
  onConditionChange(e) {
    const index = e.detail.value
    const condition = this.data.conditions[index]
    this.setData({
      conditionName: condition.name,
      conditionValue: condition.value
    })
  },

  // 表单提交
  async onSubmit(e) {
    const formData = e.detail.value
    
    // 验证必填项
    if (!formData.title || !formData.description || !formData.price || 
        !this.data.categoryValue || !this.data.conditionValue || !formData.location) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }
    
    if (this.data.images.length === 0) {
      wx.showToast({
        title: '请上传商品图片',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({ title: '发布中...' })
      
      // 上传图片到云存储
      const uploadedImages = await this.uploadImages()
      
      if (uploadedImages.length === 0) {
        wx.hideLoading()
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        return
      }
      
      // 调用云函数发布商品
      const { result } = await wx.cloud.callFunction({
        name: 'publishProduct',
        data: {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          images: uploadedImages,
          category: this.data.categoryValue,
          condition: this.data.conditionName,
          location: formData.location
        }
      })
      
      wx.hideLoading()
      
      if (result && result.code === 0) {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        })
        
        // 返回首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 2000)
      } else {
        wx.showToast({
          title: result.message || '发布失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('发布商品失败', error)
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    }
  },

  // 上传图片到云存储
  async uploadImages() {
    try {
      const uploadPromises = this.data.images.map(async (imagePath, index) => {
        try {
          const cloudPath = `products/${Date.now()}-${index}.jpg`
          const { fileID } = await wx.cloud.uploadFile({
            cloudPath,
            filePath: imagePath
          })
          return fileID
        } catch (error) {
          console.error(`上传图片 ${index} 失败`, error)
          return null
        }
      })
      
      const results = await Promise.all(uploadPromises)
      return results.filter(id => id !== null)
    } catch (error) {
      console.error('上传图片失败', error)
      return []
    }
  }
})