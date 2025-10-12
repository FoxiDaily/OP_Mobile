<template>
  <view class="container">
    <!-- <view class="nav-header" style="display: flex; align-items: center; position: relative;">
      <view class="back-btn" @click="goBack" style="z-index: 2;">
        <image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
      </view>
      <view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
        <text style="font-size: 32rpx; font-weight: bold; color: #fff;">OpenWrt</text>
      </view>
    </view> -->

    <view class="tab-bar">
      <view :class="['tab', currentTab === 0 ? 'active' : '']" @click="currentTab = 0">{{ $t('statistics.bandwidth') }}</view>
      <view :class="['tab', currentTab === 1 ? 'active' : '']" @click="currentTab = 1">{{ $t('statistics.load') }}</view>
    </view>

    <view v-if="currentTab === 1">
      <view v-if="loadData" class="load-card">
        <view class="load-header">
        </view>
        
        <view class="load-stats">
          <view class="stat-section">
            <view class="stat-title">{{ $t('statistics.current_load') }}</view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_1min') }}：</text>
              <text class="stat-value">{{ currentLoad1 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_5min') }}：</text>
              <text class="stat-value">{{ currentLoad5 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_15min') }}：</text>
              <text class="stat-value">{{ currentLoad15 }}</text>
            </view>
          </view>
          
          <view class="stat-section">
            <view class="stat-title">{{ $t('statistics.average') }}</view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_1min') }}：</text>
              <text class="stat-value">{{ averageLoad1 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_5min') }}：</text>
              <text class="stat-value">{{ averageLoad5 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_15min') }}：</text>
              <text class="stat-value">{{ averageLoad15 }}</text>
            </view>
          </view>
          
          <view class="stat-section">
            <view class="stat-title">{{ $t('statistics.peak') }}</view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_1min') }}：</text>
              <text class="stat-value">{{ peakLoad1 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_5min') }}：</text>
              <text class="stat-value">{{ peakLoad5 }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.load_15min') }}：</text>
              <text class="stat-value">{{ peakLoad15 }}</text>
            </view>
          </view>
        </view>

        <view class="chart-container">
          <view class="chart-wrapper">
            <view class="charts-box">
              <l-echart ref="loadChartRef" @finished="initLoadChart"></l-echart>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="status-empty">
        {{ $t('statistics.loading_load') }}
      </view>
    </view>

    <view v-else-if="currentTab === 0">
      <view class="interface-selector">
        <view class="selector-label">{{ $t('statistics.select_interface') }}：</view>
        <view class="interface-list">
          <view 
            v-for="(device, index) in deviceList" 
            :key="index"
            :class="['interface-item', selectedDevice === device.name ? 'active' : '']"
            @click="selectDevice(device.name)"
          >
            {{ device.name }}
          </view>
        </view>
      </view>

      <view v-if="selectedDevice && bandwidthData" class="bandwidth-card">
        <view class="bandwidth-header">
        </view>
        
        <view class="bandwidth-stats">
          <view class="stat-section">
                  <view class="stat-title">{{ $t('statistics.inbound') }}</view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.current') }}：</text>
              <text class="stat-value current-value">{{ formatBandwidth(currentRxRate) }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.average') }}：</text>
              <text class="stat-value">{{ formatBandwidth(averageRxRate) }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.peak') }}：</text>
              <text class="stat-value">{{ formatBandwidth(peakRxRate) }}</text>
            </view>
          </view>

          <view class="stat-section">
            <view class="stat-title">{{ $t('statistics.outbound') }}</view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.current') }}：</text>
              <text class="stat-value current-value">{{ formatBandwidth(currentTxRate) }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.average') }}：</text>
              <text class="stat-value">{{ formatBandwidth(averageTxRate) }}</text>
            </view>
            <view class="stat-row">
              <text class="stat-label">{{ $t('statistics.peak') }}：</text>
              <text class="stat-value">{{ formatBandwidth(peakTxRate) }}</text>
            </view>
          </view>
        </view>

        <view class="chart-container">
          <view class="chart-wrapper">
            <view class="charts-box">
              <l-echart ref="chartRef" @finished="initChart"></l-echart>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="selectedDevice && !bandwidthData" class="status-empty">
        {{ $t('statistics.loading_bandwidth') }}
      </view>

      <view v-else class="status-empty">
        {{ $t('statistics.select_interface_first') }}
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
             currentTab: 0,
       session: '',
       url: '/ubus',
       deviceInfo: {},
       deviceList: [],
       selectedDevice: '',
       bandwidthData: null,
       lastUpdateTime: '',
       timer: null,
       currentRxRate: 0,
       currentTxRate: 0,
       averageRxRate: 0,
       averageTxRate: 0,
       peakRxRate: 0,
       peakTxRate: 0,
        loadData: null,
        lastLoadUpdateTime: '',
        loadTimer: null,
        currentLoad1: 0,
        currentLoad5: 0,
        currentLoad15: 0,
        averageLoad1: 0,
        averageLoad5: 0,
        averageLoad15: 0,
        peakLoad1: 0,
        peakLoad5: 0,
        peakLoad15: 0,
       chartData: {
         timestamps: [],
         rxRates: [],
         txRates: []
       },
       loadChartData: {
         timestamps: [],
         load1: [],
         load5: [],
         load15: []
       },
         chartOption: {
           animation: false,
           animationDuration: 0,
           tooltip: {
             trigger: 'axis',
             axisPointer: {
               type: 'cross',
               label: {
                 backgroundColor: '#6a7985'
               },
               crossStyle: {
                 color: '#6a7985',
                 width: 2
               }
             },
             backgroundColor: 'rgba(0, 0, 0, 0.8)',
             borderColor: '#4facfe',
             borderWidth: 1,
             textStyle: {
               color: '#fff',
               fontSize: 12
             },
             formatter: (params) => {
               // 这里假设this.formatBandwidth可用，若不可用需调整为合适作用域
               const up = this.formatBandwidth(params[0].value)
               const down = this.formatBandwidth(params[1].value)
               // 使用 \n 进行换行，并设置 tooltip 的 extraCssText: 'white-space:pre' 以支持换行
               return "上行：" + up + "\n" +
                      "下行：" + down;
             },

           },
           legend: {
             data: ['入站', '出站'],
             top: 10,
             textStyle: {
               color: '#333'
             }
           },
           grid: {
             left: '10px',
             right: '5px',
             bottom: '20px',
             top: '40px',
             containLabel: true
           },
           xAxis: {
             type: 'category',
             boundaryGap: false,
             data: [],
             axisLabel: {
               show: true,
               color: '#666',
               fontSize: 10,
               interval: 'auto'
             },
             axisTick: {
               show: true,
               length: 4,
               lineStyle: {
                 color: '#ddd'
               }
             },
             axisLine: {
               lineStyle: {
                 color: '#ddd'
               }
             }
           },
           yAxis: {
             type: 'value',
             axisLabel: {
               color: '#666',
               fontSize: 10,
               formatter: (value) => {
                 return this.formatBandwidth(value)
               },
               show: true,
               inside: true
             },
             axisTick: {
               show: true,
               length: 4,
               lineStyle: {
                 color: '#ddd'
               }
             },
             axisLine: {
               show: true,
               lineStyle: {
                 color: '#ddd'
               }
             },
             splitLine: {
               show: true,
               lineStyle: {
                 color: '#f0f0f0',
                 type: 'dashed'
               }
             }
           },
           series: [
             {
               name: '入站',
               type: 'line',
               data: [],
               smooth: true,
               animation: false,
               lineStyle: {
                 color: '#4facfe',
                 width: 1
               },
               areaStyle: {
                 color: {
                   type: 'linear',
                   x: 0,
                   y: 0,
                   x2: 0,
                   y2: 1,
                   colorStops: [
                     { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
                     { offset: 1, color: 'rgba(79, 172, 254, 0.1)' }
                   ]
                 }
               }
             },
             {
               name: '出站',
               type: 'line',
               data: [],
               smooth: true,
               animation: false,
               lineStyle: {
                 color: '#00f2fe',
                 width: 1
               },
               areaStyle: {
                 color: {
                   type: 'linear',
                   x: 0,
                   y: 0,
                   x2: 0,
                   y2: 1,
                   colorStops: [
                     { offset: 0, color: 'rgba(0, 242, 254, 0.3)' },
                     { offset: 1, color: 'rgba(0, 242, 254, 0.1)' }
                   ]
                 }
               }
             }
           ]
         },
         loadChartOption: {
           animation: false,
           animationDuration: 0,
           tooltip: {
             trigger: 'axis',
             axisPointer: {
               type: 'cross',
               label: {
                 backgroundColor: '#6a7985'
               },
               crossStyle: {
                 color: '#6a7985',
                 width: 2
               }
             },
             backgroundColor: 'rgba(0, 0, 0, 0.8)',
             borderColor: '#ff6b6b',
             borderWidth: 1,
             textStyle: {
               color: '#fff',
               fontSize: 12
             },
             formatter: (params) => {
               // 这里假设this.formatBandwidth可用，若不可用需调整为合适作用域
               const load1 = params[0].value.toFixed(2)
               const load5 = params[1].value.toFixed(2)
               const load15 = params[2].value.toFixed(2)
               // 使用 \n 进行换行，并设置 tooltip 的 extraCssText: 'white-space:pre' 以支持换行
               return "1分钟：" + load1 + "\n" +
                      "5分钟：" + load5 + "\n" +
                      "15分钟：" + load15;
  
             }
           },
           legend: {
             data: ['1分钟', '5分钟', '15分钟'],
             top: 10,
             textStyle: {
               color: '#333'
             }
           },
           grid: {
             left: '10px',
             right: '5px',
             bottom: '20px',
             top: '40px',
             containLabel: true
           },
           xAxis: {
             type: 'category',
             boundaryGap: false,
             data: [],
             axisLabel: {
               show: true,
               color: '#666',
               fontSize: 10,
               interval: 'auto'
             },
             axisTick: {
               show: true,
               length: 4,
               lineStyle: {
                 color: '#ddd'
               }
             },
             axisLine: {
               lineStyle: {
                 color: '#ddd'
               }
             }
           },
           yAxis: {
             type: 'value',
             axisLabel: {
               color: '#666',
               fontSize: 10,
               show: true,
               inside: true,
               formatter: (value) => {
                 return value.toFixed(2)
               }
             },
             axisTick: {
               show: true,
               length: 4,
               lineStyle: {
                 color: '#ddd'
               }
             },
             axisLine: {
               show: true,
               lineStyle: {
                 color: '#ddd'
               }
             },
             splitLine: {
               show: true,
               lineStyle: {
                 color: '#f0f0f0',
                 type: 'dashed'
               }
             }
           },
           series: [
             {
               name: '1分钟',
               type: 'line',
               data: [],
               smooth: true,
               animation: false,
               lineStyle: {
                 color: '#ff6b6b',
                 width: 1
               },
               areaStyle: {
                 color: {
                   type: 'linear',
                   x: 0,
                   y: 0,
                   x2: 0,
                   y2: 1,
                   colorStops: [
                     { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                     { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
                   ]
                 }
               }
             },
             {
               name: '5分钟',
               type: 'line',
               data: [],
               smooth: true,
               animation: false,
               lineStyle: {
                 color: '#4ecdc4',
                 width: 1
               },
               areaStyle: {
                 color: {
                   type: 'linear',
                   x: 0,
                   y: 0,
                   x2: 0,
                   y2: 1,
                   colorStops: [
                     { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
                     { offset: 1, color: 'rgba(78, 205, 196, 0.1)' }
                   ]
                 }
               }
             },
             {
               name: '15分钟',
               type: 'line',
               data: [],
               smooth: true,
               animation: false,
               lineStyle: {
                 color: '#45b7d1',
                 width: 1
               },
               areaStyle: {
                 color: {
                   type: 'linear',
                   x: 0,
                   y: 0,
                   x2: 0,
                   y2: 1,
                   colorStops: [
                     { offset: 0, color: 'rgba(69, 183, 209, 0.3)' },
                     { offset: 1, color: 'rgba(69, 183, 209, 0.1)' }
                   ]
                 }
               }
             }
           ]
         }
    }
  },
     onLoad() {
     uni.setNavigationBarTitle({
       title: this.$t('statistics.title')
     })
     
     this.deviceInfo = DeviceManager.getCurrentDevice()
     this.session = this.deviceInfo.sysauth
     const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
     const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
	 this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
     
     this.loadPageData()
          
     this.startLoadRefresh()
   },
   
    onReady() {

    },
    
    onShow() {
      this.loadPageData()
      if (this.currentTab === 0) {
        if (this.selectedDevice && !this.timer) {
          this.startAutoRefresh()
        }
      } else if (this.currentTab === 1) {
        if (!this.loadTimer) {
          this.startLoadRefresh()
        }
      }
    },
    
    onHide() {
      console.log('onHide')
      this.stopAutoRefresh()
      this.stopLoadRefresh()
    },
    
    onUnload() {
      this.stopAutoRefresh()
      this.stopLoadRefresh()
      if (this._chartInstance) {
        this._chartInstance.dispose()
        this._chartInstance = null
      }
      if (this._loadChartInstance) {
        this._loadChartInstance.dispose()
        this._loadChartInstance = null
      }
    },
  methods: {
    goBack() {
      this.stopAutoRefresh()
      this.stopLoadRefresh()
      uni.reLaunch({ url: '/pages/device_list' })
    },
    

         loadPageData() {
       if (this.currentTab === 1) {
         this.loadLoadData()
       } else if (this.currentTab === 0) {
         this.loadBandwidthData()
       }
     },
    
         loadLoadData() {
       this.fetchLoadData()
     },
    
         loadBandwidthData() {
       this.fetchDevices()
     },
    
     fetchDevices() {
       uni.request({
         method: 'POST',
         url: this.url,
         data: {
           jsonrpc: '2.0',
           id: 1,
           method: 'call',
           params: [this.session, 'luci-rpc', 'getNetworkDevices', {}]
         },
         header: { 'Content-Type': 'application/json' },
         timeout: 3000,
         success: (res) => {
           if (res.data && res.data.result && res.data.result[1]) {
             const deviceMap = res.data.result[1]
             this.deviceList = Object.keys(deviceMap)
               .filter(devName => devName !== 'lo' && deviceMap[devName].up !== false)
               .map(devName => ({
                 name: devName,
                 type: deviceMap[devName].type || '-',
                 macaddr: deviceMap[devName].mac || '-'
               }))
               .sort((a, b) => {
                 if (a.name === 'br-lan') return -1
                 if (b.name === 'br-lan') return 1
                 return a.name.localeCompare(b.name)
               })
             
             if (this.deviceList.length > 0 && !this.selectedDevice) {
               const brLanDevice = this.deviceList.find(device => device.name === 'br-lan')
               const defaultDevice = brLanDevice ? brLanDevice.name : this.deviceList[0].name
               this.selectDevice(defaultDevice)
             }
           }
         },
         fail: (err) => {
           uni.showToast({ title: this.$t('statistics.get_interfaces_failed'), icon: 'none' })
         }
       })
     },
    
     selectDevice(devname) {
       this.selectedDevice = devname
       this.chartData.timestamps = []
       this.chartData.rxRates = []
       this.chartData.txRates = []
       this.fetchBandwidthData()
       this.startAutoRefresh()
     },
    
     fetchLoadData() {
       uni.request({
         method: 'POST',
         url: this.url,
         data: {
           jsonrpc: '2.0',
           id: 2,
           method: 'call',
           params: [this.session, 'luci', 'getRealtimeStats', { mode: 'load' }]
         },
         header: { 'Content-Type': 'application/json' },
         timeout: 3000,
         success: (res) => {
           if (res.data && res.data.result && res.data.result[1] && res.data.result[1].result) {
             this.loadData = res.data.result[1].result
             this.processLoadData()
             this.updateLastLoadUpdateTime()
           } else {
             this.loadData = null
           }
         },
         fail: (err) => {
           console.error('get load data failed:', err)
           this.loadData = null
           uni.showToast({ title: this.$t('statistics.get_load_failed'), icon: 'none' })
         }
       })
     },

      processLoadData() {
        if (!this.loadData || this.loadData.length === 0) return
        
        const latest = this.loadData[this.loadData.length - 1]
        
        if (latest) {
          this.currentLoad1 = (latest[1] / 100).toFixed(2)
          this.currentLoad5 = (latest[2] / 100).toFixed(2)
          this.currentLoad15 = (latest[3] / 100).toFixed(2)
          
          this.calculateLoadStats()
          this.updateLoadChartData()
        }
      },

      calculateLoadStats() {
        if (!this.loadData || this.loadData.length === 0) return
        
        const loads1 = []
        const loads5 = []
        const loads15 = []
        
        this.loadData.forEach(dataPoint => {
          loads1.push(dataPoint[1] / 100)
          loads5.push(dataPoint[2] / 100)
          loads15.push(dataPoint[3] / 100)
        })
        
        const sum1 = loads1.reduce((sum, load) => sum + load, 0)
        const sum5 = loads5.reduce((sum, load) => sum + load, 0)
        const sum15 = loads15.reduce((sum, load) => sum + load, 0)
        
        this.averageLoad1 = (sum1 / loads1.length).toFixed(2)
        this.averageLoad5 = (sum5 / loads5.length).toFixed(2)
        this.averageLoad15 = (sum15 / loads15.length).toFixed(2)
        
        this.peakLoad1 = Math.max(...loads1).toFixed(2)
        this.peakLoad5 = Math.max(...loads5).toFixed(2)
        this.peakLoad15 = Math.max(...loads15).toFixed(2)
      },

      updateLoadChartData() {
        if (!this.loadData || this.loadData.length === 0) return
     
        this.loadData.forEach(dataPoint => {
          this.addLoadDataPoint(dataPoint[0], dataPoint[1], dataPoint[2], dataPoint[3])
        })
        
        if (this._loadChartInstance) {
          this.updateLoadChart()
        }
      },

     addLoadDataPoint(timestamp, load1, load5, load15) {
       const maxPoints = 60
       
       const lastTimestamp = this.loadChartData.timestamps[this.loadChartData.timestamps.length - 1]
       if (lastTimestamp && lastTimestamp === timestamp) {
         return 
       }
       
       if (this.loadChartData.timestamps.length >= maxPoints) {
         this.loadChartData.timestamps.shift()
         this.loadChartData.load1.shift()
         this.loadChartData.load5.shift()
         this.loadChartData.load15.shift()
       }
       
       this.loadChartData.timestamps.push(timestamp)
       this.loadChartData.load1.push(load1 / 100)
       this.loadChartData.load5.push(load5 / 100)
       this.loadChartData.load15.push(load15 / 100)
     },

      updateLoadChart() {
        if (!this._loadChartInstance || !this.loadChartData.timestamps.length) return
        
        const categories = this.loadChartData.timestamps.map((timestamp, index) => {
          const date = new Date(timestamp * 1000)
          const minutes = date.getMinutes().toString().padStart(2, '0')
          const seconds = date.getSeconds().toString().padStart(2, '0')
          return `${minutes}:${seconds}`
        })
        
        const allLoads = [...this.loadChartData.load1, ...this.loadChartData.load5, ...this.loadChartData.load15]
        const maxLoad = Math.max(...allLoads)
        const minLoad = Math.min(...allLoads)
        const loadRange = maxLoad - minLoad
        
        let yAxisMax
        if (loadRange < 0.1) {
          yAxisMax = Math.max(maxLoad + 0.1, 0.5)
        } else {
          yAxisMax = maxLoad + (loadRange * 0.2) 
        }
        
        const yAxisMin = Math.max(0, minLoad - (loadRange * 0.1))
        
        const option = {
          ...this.loadChartOption,
          animation: false,
          animationDuration: 0,
          xAxis: {
            ...this.loadChartOption.xAxis,
            data: categories
          },
          yAxis: {
            ...this.loadChartOption.yAxis,
            min: yAxisMin,
            max: yAxisMax
          },
          series: [
            {
              ...this.loadChartOption.series[0],
              data: this.loadChartData.load1,
              animation: false
            },
            {
              ...this.loadChartOption.series[1],
              data: this.loadChartData.load5,
              animation: false
            },
            {
              ...this.loadChartOption.series[2],
              data: this.loadChartData.load15,
              animation: false
            }
          ]
        }
        
        this._loadChartInstance.setOption(option, false)
        
      },

     async initLoadChart() {
       if (!this.$refs.loadChartRef){
        return
       }
       try {
         const chart = await this.$refs.loadChartRef.init(echarts)
         this._loadChartInstance = chart
     
         
         this.loadChartOption.legend.data = [
           this.$t('statistics.load_1min'),
           this.$t('statistics.load_5min'),
           this.$t('statistics.load_15min')
         ]
         this.loadChartOption.series[0].name = this.$t('statistics.load_1min')
         this.loadChartOption.series[1].name = this.$t('statistics.load_5min')
         this.loadChartOption.series[2].name = this.$t('statistics.load_15min')
         
         this._loadChartInstance.setOption(this.loadChartOption, false)
         
         if (this.loadChartData.timestamps.length > 0) {
           this.updateLoadChart()
         }
       } catch (error) {
         console.error('load chart init failed:', error)
       }
     },

     startLoadRefresh() {
       this.stopLoadRefresh()
       this.loadTimer = setInterval(() => {
         this.fetchLoadData()
       }, 3000) 
     },

     stopLoadRefresh() {
       if (this.loadTimer) {
         clearInterval(this.loadTimer)
         this.loadTimer = null
       }
     },

     updateLastLoadUpdateTime() {
       const now = new Date()
       const hours = String(now.getHours()).padStart(2, '0')
       const minutes = String(now.getMinutes()).padStart(2, '0')
       const seconds = String(now.getSeconds()).padStart(2, '0')
       this.lastLoadUpdateTime = `${hours}:${minutes}:${seconds}`
     },
     
     fetchBandwidthData() {
       if (!this.selectedDevice) return
       
       uni.request({
         method: 'POST',
         url: this.url,
         data: {
           jsonrpc: '2.0',
           id: 33,
           method: 'call',
           params: [this.session, 'luci', 'getRealtimeStats', { mode: 'interface', device: this.selectedDevice }]
         },
         header: { 'Content-Type': 'application/json' },
         timeout: 3000,
         success: (res) => {
           if (res.data && res.data.result && res.data.result[1] && res.data.result[1].result) {
             this.bandwidthData = res.data.result[1].result
             this.processBandwidthData()
             this.updateLastUpdateTime()
           } else {
             this.bandwidthData = null
           }
         },
         fail: (err) => {
           console.error('get bandwidth data failed:', err)
           this.bandwidthData = null
          uni.showToast({ title: this.$t('statistics.get_bandwidth_failed'), icon: 'none' })
         }
       })
     },
    
     processBandwidthData() {
       if (!this.bandwidthData || this.bandwidthData.length < 2) return
       
       const latest = this.bandwidthData[this.bandwidthData.length - 1]
       const previous = this.bandwidthData[this.bandwidthData.length - 2]
       
       if (latest && previous) {
         const timeDelta = latest[0] - previous[0] 
         
         if (timeDelta > 0) {
           this.currentRxRate = (latest[1] - previous[1]) / timeDelta
           this.currentTxRate = (latest[3] - previous[3]) / timeDelta
           
            this.calculateAverageAndPeak()
            this.updateChartData()
         }
       }
     },
    
    calculateAverageAndPeak() {
      if (!this.bandwidthData || this.bandwidthData.length < 2) return
      
      const rates = []
      
      for (let i = 1; i < this.bandwidthData.length; i++) {
        const current = this.bandwidthData[i]
        const previous = this.bandwidthData[i - 1]
        const timeDelta = current[0] - previous[0]
        
        if (timeDelta > 0) {
          const rxRate = (current[1] - previous[1]) / timeDelta
          const txRate = (current[3] - previous[3]) / timeDelta
          rates.push({ rx: rxRate, tx: txRate })
        }
      }
      
      if (rates.length > 0) {
        const rxSum = rates.reduce((sum, rate) => sum + rate.rx, 0)
        const txSum = rates.reduce((sum, rate) => sum + rate.tx, 0)
        this.averageRxRate = rxSum / rates.length
        this.averageTxRate = txSum / rates.length
        
        this.peakRxRate = Math.max(...rates.map(rate => rate.rx))
        this.peakTxRate = Math.max(...rates.map(rate => rate.tx))
      }
    },
    
    formatBandwidth(bytesPerSecond) {
      if (!bytesPerSecond || bytesPerSecond < 0) return '0 B/s'
      
      const k = 1024
      const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
      const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
      
      if (i === 0) return Math.round(bytesPerSecond) + ' B/s'
      
      const value = bytesPerSecond / Math.pow(k, i)
      
      if (i === 1) {
        return Math.round(value) + ' ' + sizes[i]
      } else {
        return value.toFixed(1) + ' ' + sizes[i]
      }
    },
    
    updateLastUpdateTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.lastUpdateTime = `${hours}:${minutes}:${seconds}`
    },
    
       startAutoRefresh() {
        this.stopAutoRefresh()
         this.timer = setInterval(() => {
           if (this.selectedDevice) {
             this.fetchBandwidthData()
           }
         }, 3000) 
       },
    
     stopAutoRefresh() {
       if (this.timer) {
         clearInterval(this.timer)
         this.timer = null
       }
     },
     
                 
     
       async initChart() {
         if (!this.$refs.chartRef) return
         try {
           const chart = await this.$refs.chartRef.init(echarts)
           this._chartInstance = chart
           
           this.chartOption.legend.data = [
             this.$t('statistics.inbound'),
             this.$t('statistics.outbound')
           ]
           this.chartOption.series[0].name = this.$t('statistics.inbound')
           this.chartOption.series[1].name = this.$t('statistics.outbound')
           
           this._chartInstance.setOption(this.chartOption, false)
           
           if (this.chartData.timestamps.length > 0) {
             this.updateChart()
           }
         } catch (error) {
           console.error('chart init failed:', error)
         }
       },
     
       updateChartData() {
         if (!this.bandwidthData || this.bandwidthData.length < 2) return
         
         for (let i = 1; i < this.bandwidthData.length; i++) {
           const current = this.bandwidthData[i]
           const previous = this.bandwidthData[i - 1]
           
           if (current && previous) {
             const timeDelta = current[0] - previous[0]
             
             if (timeDelta > 0) {
               const rxRate = (current[1] - previous[1]) / timeDelta
               const txRate = (current[3] - previous[3]) / timeDelta
               
               this.addDataPoint(current[0], rxRate, txRate)
             }
           }
         }
         
         if (this._chartInstance) {
           this.updateChart()
         }
       },
     
     addDataPoint(timestamp, rxRate, txRate) {
       const maxPoints = 60
       
       const lastTimestamp = this.chartData.timestamps[this.chartData.timestamps.length - 1]
       if (lastTimestamp && lastTimestamp === timestamp) {
         return 
       }
       
       if (this.chartData.timestamps.length >= maxPoints) {
         this.chartData.timestamps.shift()
         this.chartData.rxRates.shift()
         this.chartData.txRates.shift()
       }
       
       this.chartData.timestamps.push(timestamp)
       this.chartData.rxRates.push(Math.max(0, rxRate)) 
       this.chartData.txRates.push(Math.max(0, txRate))
     },
     
       updateChart() {
         if (!this._chartInstance || !this.chartData.timestamps.length) return
         
         const categories = this.chartData.timestamps.map((timestamp, index) => {
           const date = new Date(timestamp * 1000)
           const minutes = date.getMinutes().toString().padStart(2, '0')
           const seconds = date.getSeconds().toString().padStart(2, '0')
           return `${minutes}:${seconds}`
         })
         
         const allRates = [...this.chartData.rxRates, ...this.chartData.txRates]
         const maxRate = Math.max(...allRates)
         const minRate = Math.min(...allRates)
         const rateRange = maxRate - minRate
         
         let yAxisMax
         if (rateRange < 100) {
           yAxisMax = Math.max(maxRate + 100, 500)
         } else {
           yAxisMax = maxRate + (rateRange * 0.2) 
         }
         
         const yAxisMin = Math.max(0, minRate - (rateRange * 0.1))
         
         const option = {
           ...this.chartOption,
           animation: false, 
           animationDuration: 0,
           xAxis: {
             ...this.chartOption.xAxis,
             data: categories
           },
           yAxis: {
             ...this.chartOption.yAxis,
             min: yAxisMin,
             max: yAxisMax
           },
           series: [
             {
               ...this.chartOption.series[0],
               data: this.chartData.rxRates,
               animation: false 
             },
             {
               ...this.chartOption.series[1],
               data: this.chartData.txRates,
               animation: false 
             }
           ]
         }
         
         this._chartInstance.setOption(option, false)
         
           }
  },
           watch: {
        currentTab(val) {
          this.loadPageData()
          if (val === 0) {
            if (!this.loadTimer) {
              this.startLoadRefresh()
            }
            this.$nextTick(() => {
              if (!this._loadChartInstance && this.$refs.loadChartRef) {
                this.initLoadChart()
              }
            })
          } else if (val === 1) {
            if (this.selectedDevice && !this.timer) {
              this.startAutoRefresh()
            }
            this.$nextTick(() => {
              if (!this._chartInstance && this.$refs.chartRef) {
                this.initChart()
              }
            })
          } else {
            this.stopAutoRefresh()
            this.stopLoadRefresh()
          }
        }
      }
}
</script>

<style scoped>


@import '@/styles/common.scss';

.container {
	padding: 20rpx;
}

.status-empty {
  color: #666;
  text-align: center;
  margin: 40rpx 0;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.interface-selector {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.selector-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.interface-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.interface-item {
  padding: 15rpx 25rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
  cursor: pointer;
}

.interface-item.active {
  background: #007AFF;
  color: white;
  font-weight: bold;
}

.interface-item:active {
  transform: scale(0.95);
}

 .bandwidth-card {
   background: rgba(255, 255, 255, 0.95);
   border-radius: 20rpx;
   padding: 10rpx;
   box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
 }

 .load-card {
   background: rgba(255, 255, 255, 0.95);
   border-radius: 20rpx;
   padding: 10rpx;
   box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
 }

 .bandwidth-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 30rpx;
   padding-bottom: 20rpx;
   border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
 }

 .load-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 30rpx;
   padding-bottom: 20rpx;
   border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
 }

 .bandwidth-title {
   font-size: 32rpx;
   font-weight: bold;
   color: #333;
 }

 .load-title {
   font-size: 32rpx;
   font-weight: bold;
   color: #333;
 }

 .bandwidth-time {
   font-size: 24rpx;
   color: #666;
 }

 .load-time {
   font-size: 24rpx;
   color: #666;
 }

 .bandwidth-stats {
   display: flex;
   gap: 30rpx;
   margin-bottom: 30rpx;
 }

   .load-stats {
    display: flex;
    gap: 20rpx;
    margin-bottom: 30rpx;
  }

 .stat-section {
   flex: 1;
   background: rgba(0, 0, 0, 0.02);
   border-radius: 15rpx;
   padding: 15rpx;
   min-width: 0;
 }

 .stat-title {
   font-size: 24rpx;
   font-weight: bold;
   color: #333;
   margin-bottom: 15rpx;
   text-align: center;
 }

 .stat-row {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 8rpx;
 }

 .stat-label {
   font-size: 22rpx;
   color: #666;
 }

 .stat-value {
   font-size: 22rpx;
   color: #333;
   font-weight: bold;
 }

 .current-value {
   color: #0066ff !important;
 }

 .chart-container {
   background: rgba(0, 0, 0, 0.02);
   border-radius: 15rpx;
   padding: 5rpx;
 }

 .chart-title {
   font-size: 28rpx;
   font-weight: bold;
   color: #333;
   text-align: center;
   margin-bottom: 20rpx;
 }

               .chart-wrapper {
      height: 600rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 10rpx;
      overflow: hidden;
      position: relative;
    }
    
    .charts-box {
      width: 100%;
      height: 100%;
    }

   .chart-canvas {
     width: 100%;
     height: 100%;
   }
</style>
