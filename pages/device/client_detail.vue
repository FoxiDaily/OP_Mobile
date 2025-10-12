<template>
  <view class="container">


    <view class="tab-bar">
      <view :class="['tab', currentTab === 0 ? 'active' : '']" @click="currentTab = 0">{{ $t('client_detail.basic_info') }}</view>
      <view :class="['tab', currentTab === 1 ? 'active' : '']" @click="currentTab = 1">{{ $t('client_detail.app_statistics') }}</view>
      <view :class="['tab', currentTab === 2 ? 'active' : '']" @click="currentTab = 2">{{ $t('client_detail.app_records') }}</view>
    </view>

    <!-- 基本信息 -->
    <view v-if="currentTab === 0" class="content">
      <view class="info-card">
     
        <view class="info-content">
          <view class="info-row">
            <text class="info-label">{{ $t('client_detail.device_name') }}：</text>
            <text class="info-value">{{ getUserDisplayName(userInfo) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ $t('client_detail.mac_address') }}：</text>
            <text class="info-value">{{ userInfo.mac }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ $t('client_detail.ip_address') }}：</text>
            <text class="info-value">{{ userInfo.ip }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ $t('client_detail.online_status') }}：</text>
            <text class="info-value" :style="{ color: userInfo.online ? '#4CD964' : '#FF3B30' }">
              {{ userInfo.online ? $t('client_detail.online') : $t('client_detail.offline') }}
            </text>
          </view>
          <view class="info-row" v-if="userInfo.app">
            <text class="info-label">{{ $t('client_detail.current_app') }}：</text>
            <text class="info-value">{{ userInfo.app }}</text>
          </view>
          <view class="info-row" v-if="userInfo.url">
            <text class="info-label">{{ $t('client_detail.current_url') }}：</text>
            <text class="info-value">{{ userInfo.url }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 应用统计 -->
    <view v-if="currentTab === 1" class="content">
      <view class="chart-card">
  
        <view class="chart-container">
          <view v-if="appStatisticsLoading" class="loading-container">
            <text class="loading-text">{{ $t('client_detail.loading_statistics') }}</text>
          </view>
          <view v-else-if="appStatistics.length === 0" class="empty-container">
            <text class="empty-text">{{ $t('client_detail.no_statistics') }}</text>
          </view>
          <view v-else class="chart-wrapper">
            <view class="charts-box">
              <l-echart ref="pieChartRef" @finished="initPieChart"></l-echart>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 应用记录 -->
    <view v-if="currentTab === 2" class="content">
      <view class="records-card">
   
        <view class="records-content">
          <view v-if="appRecordsLoading" class="loading-container">
            <text class="loading-text">{{ $t('client_detail.loading_records') }}</text>
          </view>
          <view v-else-if="appRecords.length === 0" class="empty-container">
            <text class="empty-text">{{ $t('client_detail.no_records') }}</text>
          </view>
          <view v-else class="records-table">
            <!-- 表头 -->
            <view class="table-header">
              <view class="header-cell app-name">{{ $t('client_detail.app_name') }}</view>
              <view class="header-cell start-time">{{ $t('client_detail.start_time') }}</view>
              <view class="header-cell duration">{{ $t('client_detail.duration') }}</view>
            </view>
            <!-- 表格内容 -->
            <view v-for="(record, index) in appRecords" :key="index" class="table-row">
              <view class="table-cell app-name">
                <view class="app-info">
                  <view class="app-icon-container">
                    <image 
                      :src="getAppIconUrl(record.id)"
                      mode="aspectFit" 
                      class="app-icon-image"
                      @error="onIconError($event, record.id)"
                    />
                    <text v-if="record.iconError" class="app-icon-fallback">📱</text>
                    <view v-if="record.act" class="filter-indicator"></view>
                  </view>
                  <text class="app-name-text">{{ record.name }}</text>
                </view>
              </view>
              <view class="table-cell start-time">
                <text class="time-text">{{ formatTime(record.ft) }}</text>
              </view>
              <view class="table-cell duration">
                <text class="duration-text">{{ formatDuration(record.tt) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import DeviceManager from '@/utils/deviceManager.js'
import * as echarts from '@/uni_modules/lime-echart/static/echarts.min.js'

export default {
  data() {
    return {
      currentTab: 1,
      userInfo: {},
      deviceInfo: {},
      session: '',
      url: '/ubus',
      appStatistics: [],
      appRecords: [],
      appStatisticsLoading: false,
      appRecordsLoading: false,
      chartData: [],
      chartOption: null,
      _chartInstance: null
    }
  },
  onLoad(options) {
    uni.setNavigationBarTitle({
      title: this.$t('client_detail.title')
    })
    
    // 获取传递的用户信息
    if (options.userInfo) {
      this.userInfo = JSON.parse(decodeURIComponent(options.userInfo))
      console.log('接收到的userInfo:', this.userInfo)
    } else {
      console.log('未接收到userInfo参数')
    }
    
    // 获取设备信息用于API调用
    this.deviceInfo = DeviceManager.getCurrentDevice()
    console.log('deviceInfo:', this.deviceInfo)
    
    this.session = this.deviceInfo.sysauth
    const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
    const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
    this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
    
    console.log('API URL:', this.url)
    console.log('Session:', this.session)
    
    this.loadData()
  },
  onShow() {
    // 页面显示时重新加载数据
    this.loadData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    loadData() {
      if (this.currentTab === 1) {
        this.fetchAppStatistics()
      } else if (this.currentTab === 2) {
        this.fetchAppRecords()
      }
    },
    // 获取用户显示名称
    getUserDisplayName(user) {
      if (user.nickname) {
        return user.nickname
      } else if (user.hostname) {
        return user.hostname
      } else {
        return user.mac
      }
    },
    // 获取应用图标URL
    getAppIconUrl(appId) {
      const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
      const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
      return `${protocol}://${formattedHost}:${this.deviceInfo.port}/luci-static/resources/app_icons/${appId}.png`
    },
    // 获取应用统计
    fetchAppStatistics() {
      this.appStatisticsLoading = true
      uni.request({
        method: 'POST',
        url: this.url,
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'call',
          params: [this.session, 'appfilter', 'dev_visit_time', {mac: this.userInfo.mac}]
        },
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        success: (res) => {
          console.log('获取应用统计响应:', res)
          if (res.data && res.data.result && res.data.result[1] && res.data.result[1].list) {
            this.appStatistics = res.data.result[1].list || []
            console.log('解析到的应用统计数据2:', JSON.stringify(this.appStatistics))
            this.$nextTick(() => {
              this.initPieChart()
            })
          } else {
            console.log('获取应用统计失败:', res)
            this.appStatistics = []
          }
          this.appStatisticsLoading = false
        },
        fail: (err) => {
          console.log('获取应用统计请求失败:', err)
          this.appStatistics = []
          this.appStatisticsLoading = false
          uni.showToast({
            title: this.$t('client_detail.load_failed'),
            icon: 'none'
          })
        }
      })
    },
    // 获取应用记录
    fetchAppRecords() {
      this.appRecordsLoading = true
      uni.request({
        method: 'POST',
        url: this.url,
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'call',
          params: [this.session, 'appfilter', 'dev_visit_list', {mac: this.userInfo.mac}]
        },
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        success: (res) => {
          if (res.data && res.data.result && res.data.result[1] && res.data.result[1].list) {
            // 获取原始数据，过滤掉访问时间为0的记录，并按照最后访问时间排序（最近的在前）
            const records = res.data.result[1].list || []
            this.appRecords = records
              .filter(record => record.tt && record.tt > 0) // 过滤掉访问时间为0的记录
              .sort((a, b) => {
                // 按ft字段（最后访问时间）降序排序，时间戳大的在前
                return (b.ft || 0) - (a.ft || 0)
              })
          } else {
            console.log('获取应用记录失败:', res)
            this.appRecords = []
          }
          this.appRecordsLoading = false
        },
        fail: (err) => {
          console.log('获取应用记录请求失败:', err)
          this.appRecords = []
          this.appRecordsLoading = false
          uni.showToast({
            title: this.$t('client_detail.load_failed'),
            icon: 'none'
          })
        }
      })
    },
    // 初始化饼图
    async initPieChart() {
      if (!this.$refs.pieChartRef) {
        return
      }
      
      try {
        const chart = await this.$refs.pieChartRef.init(echarts)
        this._chartInstance = chart
        
        if (!this.appStatistics || this.appStatistics.length === 0) {
          console.log('没有应用统计数据，跳过图表初始化')
          return
        }
        
        console.log('开始初始化饼图，数据:', this.appStatistics)
        
        // 准备图表数据
        const chartData = this.appStatistics.map(item => ({
          name: item.name,
          value: item.t
        }))
        
        console.log('图表数据:', chartData)
        
        // 创建饼图配置
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              const duration = this.formatDuration(params.value)
              return `${params.seriesName}\n${params.name}: ${duration} (${params.percent}%)`
            }
          },
          legend: {
            orient: 'horizontal',
            bottom: '0%',
            left: 'center',
            width: '90%',
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 20,
            lineGap: 1,
            textStyle: {
              fontSize: 11,
              lineHeight: 12
            },
            data: chartData.map(item => item.name),
            formatter: (name) => {
              const item = chartData.find(d => d.name === name)
              return item ? `${name} (${this.formatDuration(item.value)})` : name
            }
          },
          series: [
            {
              name: this.$t('client_detail.usage_time'),
              type: 'pie',
              radius: '50%',
              center: ['50%', '40%'],
              data: chartData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        
        console.log('图表配置:', option)
        
        this._chartInstance.setOption(option, false)
        
      } catch (error) {
        console.error('饼图初始化失败:', error)
      }
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(timestamp * 1000)
      const year = date.getFullYear().toString().slice(-2) // 只显示年份后两位
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}/${month}/${day} ${hours}:${minutes}`
    },
    // 格式化时长（根据语言使用不同格式）
    formatDuration(seconds) {
      if (!seconds) return '--'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      // 如果不足一分钟，显示为1分钟
      if (hours === 0 && minutes === 0) {
        return this.$i18n.locale === 'zh-Hans' ? '1分' : '1m'
      }
      
      if (hours > 0) {
        if (this.$i18n.locale === 'zh-Hans') {
          return `${hours}小时${minutes}分`
        } else {
          return `${hours}h ${minutes}m`
        }
      } else {
        if (this.$i18n.locale === 'zh-Hans') {
          return `${minutes}分`
        } else {
          return `${minutes}m`
        }
      }
    },
    // 图标加载失败处理
    onIconError(event, appId) {
      console.log('应用图标加载失败:', appId, event)
      // 找到对应的应用并设置错误状态
      this.appRecords.forEach(record => {
        if (record.id === appId) {
          this.$set(record, 'iconError', true)
        }
      })
    }
  },
  watch: {
    currentTab(val) {
      this.loadData()
    }
  }
}
</script>

<style scoped>
@import '@/styles/common.scss';

.container {
  padding: 5px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
}


.content {
  padding: 5rpx;
}

.info-card, .chart-card, .records-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 20rpx;

}

.chart-card {
  padding: 10rpx;
}

.records-card {
  padding: 10rpx;
}

.info-header, .chart-header, .records-header {
  margin-bottom: 20rpx;
}

.info-title, .chart-title, .records-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.info-content {
  space-y: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  min-width: 120rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.chart-container {
  height: 800rpx;
  width: 100%;
}

.chart-wrapper {
  width: 100%;
  height: 800rpx;
}

.charts-box {
  width: 100%;
  height: 100%;
}

.loading-container, .empty-container {
  text-align: center;
  padding: 60rpx 0;
}

.loading-text, .empty-text {
  font-size: 28rpx;
  color: #666;
}

.records-list {
  space-y: 20rpx;
}

.record-item {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.record-app {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.app-icon {
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  overflow: hidden;
  position: relative;
}

.app-icon-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.app-icon-fallback {
  font-size: 24rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.app-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.record-details {
  space-y: 8rpx;
}

.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6rpx 0;
}

.record-label {
  font-size: 24rpx;
  color: #666;
  min-width: 100rpx;
}

.record-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

/* 表格样式 */
.records-table {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
}

.header-cell {
  padding: 20rpx 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  text-align: left;
}

.header-cell.app-name {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 250rpx;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.header-cell.start-time {
  flex: 1.5;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: left;
}

.header-cell.duration {
  flex: 1;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: left;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.table-cell {
  padding: 20rpx 16rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}

.table-cell.app-name {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 200rpx;
}

.table-cell.start-time {
  flex: 1.5;
  justify-content: flex-start;
}

.table-cell.duration {
  flex: 1;
  justify-content: flex-start;
}

.app-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.app-icon-container {
  position: relative;
  width: 40rpx;
  height: 40rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.filter-indicator {
  position: absolute;
  top: -2rpx;
  right: -2rpx;
  width: 12rpx;
  height: 12rpx;
  background: #FF3B30;
  border-radius: 50%;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.app-name-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.duration-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}
</style>
