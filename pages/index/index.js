// pages/index/index.js
const app = getApp()

Page({
  data: {
    products: [],
    currentCategory: 'all',
    searchKeyword: '',
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadProducts()
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.products.length === 0) {
      this.loadProducts()
    }
  },

  // 加载商品列表
  async loadProducts(reset = false) {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const page = reset ? 1 : this.data.page
      const category = this.data.currentCategory === 'all' ? '' : this.data.currentCategory
      
      const { result } = await wx.cloud.callFunction({
        name: 'getProducts',
        data: {
          page,
          limit: 20,
          category,
          keyword: this.data.searchKeyword
        }
      })

      if (result && result.code === 0) {
        const newProducts = result.data.list
        const products = reset ? newProducts : [...this.data.products, ...newProducts]
        
        this.setData({
          products,
          hasMore: result.data.hasMore,
          page: reset ? 2 : this.data.page + 1,
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
      console.error('加载商品失败', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    }
  },

  // 分类切换
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    if (category === this.data.currentCategory) return

    this.setData({
      currentCategory: category,
      products: [],
      page: 1,
      hasMore: true
    })
    
    this.loadProducts(true)
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索
  onSearch() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    
    this.loadProducts(true)
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts()
    }
  },

  // 商品点击
  onProductTap(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${productId}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    
    await this.loadProducts(true)
    wx.stopPullDownRefresh()
  }
})