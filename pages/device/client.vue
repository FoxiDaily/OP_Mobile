<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('client.title') }}</text>
			</view>
		</view>

     <view class="tab-bar">
      <view v-if="deviceInfo.support_parental_control" :class="['tab', currentTab === 0 ? 'active' : '']" @click="currentTab = 0">{{ $t('client.user_list') }}</view>
      <view :class="['tab', currentTab === 1 ? 'active' : '']" @click="currentTab = 1">{{ $t('client.wireless_clients') }}</view>
      <view v-if="!deviceInfo.support_parental_control" :class="['tab', currentTab === 2 ? 'active' : '']" @click="currentTab = 2">{{ $t('client.dhcpv4_allocation') }}</view>
      <view v-if="!deviceInfo.support_parental_control" :class="['tab', currentTab === 3 ? 'active' : '']" @click="currentTab = 3">{{ $t('client.dhcpv6_allocation') }}</view>
     </view>
    <view v-if="currentTab === 0">
      <view v-if="userListLoading" class="client-empty">{{ $t('client.user_list_loading') }}</view>
      <view v-else-if="userList.length === 0" class="client-empty">{{ $t('client.no_user_data') }}</view>
      <view v-else>
        <view v-for="(user, index) in userList" :key="index" class="user-card" @click="goToUserDetail(user)">
          <view class="user-header">
            <view class="user-info">
              <text class="user-nickname">{{ getUserDisplayName(user) }}</text>
              <text class="user-hostname" v-if="user.hostname && user.nickname">{{ user.hostname }}</text>
            </view>
            <view class="user-status" :class="user.online ? 'online' : 'offline'">
              {{ user.online ? $t('client.online') : $t('client.offline') }}
            </view>
          </view>
          
          <view class="user-details">
            <view class="detail-row" v-if="!shouldHideMacRow(user)">
              <text class="label">{{ $t('client.mac') }}：</text>
              <text class="value">{{ user.mac }}</text>
            </view>
            <view class="detail-row">
              <text class="label">{{ $t('client.ip_address') }}：</text>
              <text class="value">{{ user.ip }}</text>
            </view>
            <view class="detail-row">
              <text class="label">{{ $t('client.current_app') }}：</text>
              <text class="value">{{ user.online ? (user.app || '--') : '--' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">{{ $t('client.current_url') }}：</text>
              <text class="value">{{ user.online ? (user.url || '--') : '--' }}</text>
            </view>
            <view class="detail-row" v-if="user.applist && user.applist.length > 0">
              <text class="label">{{ $t('client.frequent_apps') }}：</text>
              <view class="app-icons">
                <view 
                  v-for="(app, appIndex) in user.applist" 
                  :key="appIndex" 
                  class="app-item"
                  @click="showAppTooltip(app.name, $event)"
                  @mouseenter="showAppTooltip(app.name, $event)"
                  @mouseleave="hideAppTooltip"
                >
                  <view class="app-icon">
                    <image 
                      :src="getAppIconUrl(app.id)"
                      mode="aspectFit" 
                      class="app-icon-image"
                      @error="onIconError($event, app.id)" 
                    />
                    <text v-if="app.iconError" class="app-icon-fallback">📱</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else-if="currentTab === 1">
      <view v-if="loading" class="client-empty">{{ $t('client.wireless_clients_loading') }}</view>
      <view v-else-if="wirelessClients.length === 0" class="client-empty">{{ $t('client.no_wireless_clients') }}</view>
      <view v-else>
        <view v-for="(client, index) in wirelessClients" :key="index" class="client-card">
          <view class="client-row">
            <text class="label">{{ $t('client.mac') }}：</text>
            <view class="value" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <view style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                {{ client.mac }}
              </view>
              <image class="kick-btn" src="/static/disconnect.png" mode="widthFix" style="width: 27rpx; height: 25rpx;" @click="kickClient(client)" />
            </view>
          </view>
          <view v-if="client.hostname" class="client-row">
            <text class="label">{{ $t('client.hostname') }}：</text>
            <text class="value">{{ client.hostname }}</text>
          </view>
          <view class="client-row"><text class="label">{{ $t('client.signal') }}：</text><text class="value">{{ client.signal }}dBm</text></view>
          <view class="client-row"><text class="label">{{ $t('client.connection_time') }}：</text><text class="value">{{ formatTime(client.connected_time) }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.receive_rate') }}：</text><text class="value">{{ formatSingleRate(client, 'rx') }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.transmit_rate') }}：</text><text class="value">{{ formatSingleRate(client, 'tx') }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.interface') }}：</text><view class="value">{{ client.ifname }}<text v-if="wirelessIfBandMap[client.ifname]" class="band-info">{{ $t('client.band_info', { band: wirelessIfBandMap[client.ifname] }) }}</text></view></view>
        </view>
      </view>
      <view v-if="showDetail" class="client-detail-mask" @click="showDetail = false">
        <view class="client-detail-popup" @click.stop>
          <view class="client-detail-title">{{ $t('client.client_details') }}</view>
          <view v-for="(val, key) in detailClient" :key="key" class="client-detail-row">
            <text class="client-detail-key">{{ key }}</text>：<text class="client-detail-value">{{ val }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else-if="currentTab === 2">
      <view v-if="dhcpv4List.length === 0" class="client-empty">{{ $t('client.no_dhcpv4_allocation') }}</view>
      <view v-else>
        <view v-for="(item, index) in dhcpv4List" :key="index" class="client-card">
          <view class="client-row"><text class="label">{{ $t('client.mac') }}：</text><text class="value">{{ item.macaddr }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.hostname') }}：</text><text class="value">{{ item.hostname || '-' }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.ip_address') }}：</text><text class="value">{{ item.ipaddr }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.lease_time') }}：</text><text class="value">{{ formatLeaseTime(item.expires) }}</text></view>
        </view>
      </view>
    </view>
    
    <view v-else-if="currentTab === 3">
      <view v-if="dhcpv6List.length === 0" class="client-empty">{{ $t('client.no_dhcpv6_allocation') }}</view>
      <view v-else>
        <view v-for="(item, index) in dhcpv6List" :key="index" class="client-card">
          <view v-if="item.macaddr" class="client-row"><text class="label">{{ $t('client.mac') }}：</text><text class="value">{{ item.macaddr }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.hostname') }}：</text><text class="value">{{ item.hostname || '-' }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.ipv6_address') }}：</text><text class="value">{{ item.ip6addr }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.duid') }}：</text><text class="value">{{ item.duid }}</text></view>
          <view class="client-row"><text class="label">{{ $t('client.lease_time') }}：</text><text class="value">{{ formatLeaseTime(item.expires) }}</text></view>
        </view>
      </view>
    </view>
    
    <!-- App Tooltip -->
    <view v-if="tooltip.show" class="app-tooltip" :style="tooltip.style">
      {{ tooltip.text }}
    </view>
  </view>
</template>

<script>
import DeviceManager from '@/utils/deviceManager.js'
export default {
  data() {
    return {
	  statusBarHeight: 0,
      currentTab: 0,
      session: '',
      url: '/ubus',
      deviceInfo: {},
      wirelessClients: [],
      loading: false,
      showDetail: false,
      detailClient: {},
      wirelessIfBandMap: {},
      dhcpv4List: [],
      dhcpv6List: [],
      userList: [],
      userListLoading: false,
      oafSupported: true,
      userListTimer: null, // 用户列表刷新定时器
      tooltip: {
        show: false,
        text: '',
        style: {}
      }
    }
  },
  onLoad() {
	  this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'rpx';
    uni.setNavigationBarTitle({
      title: this.$t('client.title')
    })
    
    this.deviceInfo = DeviceManager.getCurrentDevice()
    // 确保support_parental_control有默认值
    if (this.deviceInfo.support_parental_control === undefined) {
      this.deviceInfo.support_parental_control = 0 // 默认为不支持
    }
    
    // 根据support_parental_control设置默认tab
    if (this.deviceInfo.support_parental_control === 0) {
      this.currentTab = 1 // 不支持家长控制时，默认显示无线客户端tab
    } else {
      this.currentTab = 0 // 支持家长控制时，默认显示用户列表tab
    }
    
    this.session = this.deviceInfo.sysauth
    const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
    const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
    this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
    this.loadData()
    this.startUserListTimer() // 启动用户列表定时刷新
    console.log("currentTab", this.currentTab)
  },
  onShow() {
    // 页面显示时启动定时器
    this.startUserListTimer()
  },
  onHide() {
    // 页面隐藏时停止定时器
    this.stopUserListTimer()
  },
  onUnload() {
    // 页面卸载时停止定时器
    this.stopUserListTimer()
  },
  methods: {
    goBack() {
          uni.reLaunch({ url: '/pages/device_list' })
        },
    // 跳转到用户详情页面
    goToUserDetail(user) {
      console.log('准备跳转到用户详情页面，用户信息:', user)
      const userInfo = encodeURIComponent(JSON.stringify(user))
      console.log('编码后的userInfo:', userInfo)
      uni.navigateTo({
        url: `/pages/device/client_detail?userInfo=${userInfo}`
      })
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
    // 判断是否应该隐藏MAC地址行
    shouldHideMacRow(user) {
      // 当用户名称显示的是MAC地址时，隐藏MAC地址行
      return !user.nickname && !user.hostname
    },
    // 显示应用tooltip
    showAppTooltip(appName, event) {
      this.tooltip.text = appName
      this.tooltip.show = true
      
      // 获取点击位置
      const rect = event.target.getBoundingClientRect()
      this.tooltip.style = {
        position: 'fixed',
        left: rect.left + rect.width / 2 + 'px',
        top: rect.top - 10 + 'px',
        transform: 'translateX(-50%)',
        zIndex: 9999
      }
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.hideAppTooltip()
      }, 3000)
    },
    // 隐藏应用tooltip
    hideAppTooltip() {
      this.tooltip.show = false
    },
    // 获取应用图标URL
    getAppIconUrl(appId) {
      const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
      const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
      return `${protocol}://${formattedHost}:${this.deviceInfo.port}/luci-static/resources/app_icons/${appId}.png`
    },
    loadData() {
      if (this.currentTab === 0) {
        this.fetchUserList()
        this.startUserListTimer() // 切换到用户列表时启动定时器
      } else if (this.currentTab === 1) {
        this.fetchWirelessClients()
        this.stopUserListTimer() // 切换到其他tab时停止定时器
      } else if (this.currentTab === 2) {
        this.fetchDHCPv4List()
        this.stopUserListTimer() // 切换到其他tab时停止定时器
      } else if (this.currentTab === 3) {
        this.fetchDHCPv6List()
        this.stopUserListTimer() // 切换到其他tab时停止定时器
      }
    },
    async fetchWirelessClients() {
      this.loading = true
      this.wirelessClients = []
      this.wirelessIfBandMap = {}
      const [interfaces, dhcpv4, dhcpv6] = await Promise.all([
        this.getWirelessInterfaces(),
        this.getDHCPv4Leases(),
        this.getDHCPv6Leases()
      ])
      const macToHostname = {}
      dhcpv4.forEach(item => { if(item.macaddr) macToHostname[item.macaddr.toUpperCase()] = item.hostname })
      dhcpv6.forEach(item => { if(item.macaddr) macToHostname[item.macaddr.toUpperCase()] = item.hostname })
      let allClients = []
      for (let iface of interfaces) {
        let clients = await this.getClientsByInterface(iface.ifname)
        allClients.push(...clients.map(c => ({
          ...c,
          ifname: iface.ifname,
          hostname: macToHostname[(c.mac || '').toUpperCase()] || ''
        })))
      }
      this.wirelessClients = allClients
      this.loading = false
    },
    getWirelessInterfaces() {
      return new Promise((resolve) => {
        uni.request({
          method: 'POST',
          url: this.url,
          data: {
            jsonrpc: '2.0',
            id: 101,
            method: 'call',
            params: [this.session, 'luci-rpc', 'getWirelessDevices', {}]
          },
          header: { 'Content-Type': 'application/json' },
		  timeout: 3000,
          success: (res) => {
            let interfaces = []
            if (res.data && res.data.result && res.data.result[1]) {
              const radios = res.data.result[1]
              Object.values(radios).forEach(radio => {
                let band = radio.config && radio.config.band ? radio.config.band.toUpperCase() : '-'
                if (radio.interfaces && Array.isArray(radio.interfaces)) {
                  radio.interfaces.forEach(iface => {
                    if (iface.ifname) {
                      interfaces.push({ifname: iface.ifname, band})
                      this.wirelessIfBandMap[iface.ifname] = band
                    }
                  })
                }
              })
            }
            resolve(interfaces)
          },
          fail: () => resolve([])
        })
      })
    },

    getClientsByInterface(ifname) {
      return new Promise((resolve) => {
        uni.request({
          method: 'POST',
          url: this.url,
          data: {
            jsonrpc: '2.0',
            id: 102,
            method: 'call',
            params: [this.session, 'iwinfo', 'assoclist', { device: ifname }]
          },
          header: { 'Content-Type': 'application/json' },
		  timeout: 3000,
          success: (res) => {
            let clients = []
            if (res.data && res.data.result && res.data.result[1] && res.data.result[1].results) {
              clients = res.data.result[1].results
            }
            resolve(clients)
          },
          fail: () => resolve([])
        })
      })
    },
    formatTime(val) {
      console.log('formatTime', val)
      if (!val && val !== 0) return '-';
      const s = parseInt(val);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      let str = '';
      if (d > 0) str += `${d}d `;
      if (h > 0 || d > 0) str += `${h}h `;
      if (m > 0 || h > 0 || d > 0) str += `${m}m `;
      str += `${sec}s`;
      return str.trim();
    },
    formatSingleRate(client, dir) {
      const info = (client[dir] || {});
      const rate = info.rate ? (info.rate / 1000).toFixed(1) : '-';
      const mhz = info.mhz ? `${info.mhz}MHz` : '';
      let mcsType = '';
      if (info.ht === true) mcsType = 'ht';
      else if (info.vht === true) mcsType = 'vht';
      else if (info.he === true) mcsType = 'he';
      else if (info.eht === true) mcsType = 'eht';
      let mcsStr = '';
      if (typeof info.mcs === 'number' && mcsType) mcsStr = `${mcsType}-mcs${info.mcs}`;
      let str = `${rate} Mbit/s`;
      if (mhz) str += ` ${mhz}`;
      if (mcsStr) str += ` ${mcsStr}`;
      return str;
    },
    showClientDetail(client) {
      this.detailClient = client
      this.showDetail = true
    },
    fetchDHCPv4List() {
      this.dhcpv4List = []
      console.log('fetchDHCPv4List')
      console.log("dhcp v4 session:", this.session)
      uni.request({
        method: 'POST',
        url: this.url,
        data: {
          jsonrpc: '2.0',
          id: 201,
          method: 'call',
          params: [this.session, 'luci-rpc', 'getDHCPLeases', {}]
        },
        header: { 'Content-Type': 'application/json' },
		timeout: 3000,
        success: (res) => {
          console.log('fetchDHCPv4List success', JSON.stringify(res))
          if (res.data && res.data.result && res.data.result[1] && res.data.result[1].dhcp_leases) {
            this.dhcpv4List = res.data.result[1].dhcp_leases
          }
        }
      })
    },
    fetchDHCPv6List() {
      this.dhcpv6List = []
      console.log('fetchDHCPv6List')
      uni.request({
        method: 'POST',
        url: this.url,
        data: {
          jsonrpc: '2.0',
          id: 202,
          method: 'call',
          params: [this.session, 'luci-rpc', 'getDHCPLeases', {}]
        },
        header: { 'Content-Type': 'application/json' },
		timeout: 3000,
        success: (res) => {
          console.log('fetchDHCPv6List success', JSON.stringify(res))
          if (res.data && res.data.result && res.data.result[1] && res.data.result[1].dhcp6_leases) {
            this.dhcpv6List = res.data.result[1].dhcp6_leases
          }
        }
      })
    },
    formatLeaseTime(val) {
      if (!val && val !== 0) return '-';
      const s = parseInt(val);
      const d = Math.floor(s / 86400); // 86400 = 24 * 60 * 60
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
      if (h > 0) return `${h}h ${m}m ${sec}s`;
      if (m > 0) return `${m}m ${sec}s`;
      return `${sec}s`;
    },
    fetchUserList(showLoading = true) {
      if (showLoading) {
        this.userListLoading = true
      }
      uni.request({
        method: 'POST',
        url: this.url,
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'call',
          params: [this.session, 'appfilter', 'get_all_users', {flag: 3}]
        },
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        success: (res) => {
          console.log('获取用户列表响应:', res)
          if (res.data && res.data.result && res.data.result[1] && res.data.result[1].data) {
            this.userList = res.data.result[1].data.list || []
            console.log('用户列表:', this.userList)
          } else {
            console.log('获取用户列表失败:', res)
            this.userList = []
          }
          if (showLoading) {
            this.userListLoading = false
          }
        },
        fail: (err) => {
          console.log('获取用户列表请求失败:', err)
          this.userList = []
          if (showLoading) {
            this.userListLoading = false
            uni.showToast({
              title: this.$t('client.load_failed'),
              icon: 'none'
            })
          }
        }
      })
    },
    // 启动用户列表定时刷新
    startUserListTimer() {
      this.stopUserListTimer() // 先清除现有定时器
      if (this.currentTab === 0) { // 只在用户列表tab时启动定时器
        this.userListTimer = setInterval(() => {
          this.fetchUserList(false) // 定时刷新时不显示加载状态
        }, 3000) // 3秒刷新一次
      }
    },
    // 停止用户列表定时刷新
    stopUserListTimer() {
      if (this.userListTimer) {
        clearInterval(this.userListTimer)
        this.userListTimer = null
      }
    },
    getAppIconUrl(appId) {
      // 构建应用图标的URL路径
      const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
      const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
      
      console.log('getAppIconUrl', `${protocol}://${formattedHost}:${this.deviceInfo.port}/luci-static/resources/app_icons/${appId}.png`)
      return `${protocol}://${formattedHost}:${this.deviceInfo.port}/luci-static/resources/app_icons/${appId}.png`
    },
    onIconError(event, appId) {
      // 图标加载失败时的处理
      console.log('应用图标加载失败222:', appId, event)
      
      // 找到对应的应用并设置错误状态
      this.userList.forEach(user => {
        if (user.applist) {
          user.applist.forEach(app => {
            if (app.id === appId) {
              this.$set(app, 'iconError', true)
            }
          })
        }
      })
    },
    getDHCPv4Leases() {
      return new Promise((resolve) => {
        uni.request({
          method: 'POST',
          url: this.url,
          data: {
            jsonrpc: '2.0',
            id: 201,
            method: 'call',
            params: [this.session, 'luci-rpc', 'getDHCPLeases', {}]
          },
          header: { 'Content-Type': 'application/json' },
          timeout: 3000,
          success: (res) => {
            if (res.data && res.data.result && res.data.result[1] && res.data.result[1].dhcp_leases) {
              resolve(res.data.result[1].dhcp_leases)
            } else {
              resolve([])
            }
          },
          fail: () => resolve([])
        })
      })
    },
    getDHCPv6Leases() {
      return new Promise((resolve) => {
        uni.request({
          method: 'POST',
          url: this.url,
          data: {
            jsonrpc: '2.0',
            id: 202,
            method: 'call',
            params: [this.session, 'luci-rpc', 'getDHCPLeases', {}]
          },
          header: { 'Content-Type': 'application/json' },
          timeout: 3000,
          success: (res) => {
            if (res.data && res.data.result && res.data.result[1] && res.data.result[1].dhcp6_leases) {
              resolve(res.data.result[1].dhcp6_leases)
            } else {
              resolve([])
            }
          },
          fail: () => resolve([])
        })
      })
    },
    kickClient(client) {
      uni.showModal({
        title: this.$t('client.tip'),
        content: this.$t('client.confirm_disconnect', { 
          mac: client.mac, 
          hostname: client.hostname ? '('+client.hostname+')' : '' 
        }),
        success: (res) => {
          if (res.confirm) {
            uni.request({
              method: 'POST',
              url: this.url,
              data: {
                jsonrpc: '2.0',
                id: 93,
                method: 'call',
                params: [
                  this.session,
                  `hostapd.${client.ifname}`,
                  'del_client',
                  {
                    addr: client.mac,
                    deauth: true,
                    reason: 5,
                    ban_time: 60000
                  }
                ]
              },
              header: { 'Content-Type': 'application/json' },
              timeout: 3000,
              success: (res) => {
                uni.showToast({ title: this.$t('client.disconnect_success'), icon: 'success' })
                this.loadData()
              },
              fail: () => {
                uni.showToast({ title: this.$t('client.disconnect_failed'), icon: 'none' })
              }
            })
          }
        }
      })
    },
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
	padding: 20rpx;
}
.client-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  padding: 40rpx;
}
.client-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}
.client-row:last-child {
  border-bottom: none;
}
.label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
  min-width: 120rpx;
  flex-shrink: 0;
}
.value {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
  flex: 1;
}
.client-detail-btn {
  margin-top: 12rpx;
  color: #3b82f6;
  text-align: right;
  font-size: 24rpx;
  cursor: pointer;
}
.client-empty {
  color: #666;
  text-align: center;
  margin: 40rpx 0;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}
.client-detail-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.client-detail-popup {
  background: #fff;
  border-radius: 30rpx;
  padding: 36rpx 40rpx 28rpx 40rpx;
  min-width: 400rpx;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}
.client-detail-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 18rpx;
}
.client-detail-row {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: flex;
  flex-wrap: wrap;
}
.client-detail-key {
  color: #888;
  min-width: 120rpx;
  font-weight: 500;
}
.client-detail-value {
  color: #222;
  font-weight: 500;
  margin-left: 8rpx;
}

.band-info {
  color: #666;
  font-size: 24rpx;
  margin-left: 4rpx;
  font-weight: normal;
}
.kick-btn {
  margin-left: 20rpx;
  cursor: pointer;
  transition: transform 0.2s;
}
.kick-btn:active {
  transform: scale(0.9);
}

/* 用户列表样式 */
.user-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  flex: 1;
}

.user-nickname {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 6rpx;
}

.user-hostname {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.user-status {
  font-size: 24rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.user-status.online {
  color: #4CD964;
  background: rgba(76, 217, 100, 0.1);
}

.user-status.offline {
  color: #FF3B30;
  background: rgba(255, 59, 48, 0.1);
}

.user-details {
  margin-bottom: 20rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.detail-row:last-child {
  border-bottom: none;
}

.app-icons {
  display: flex;
  flex-wrap: nowrap;
  gap: 8rpx;
  overflow-x: auto;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40rpx;
  flex-shrink: 0;
}

.app-icon {
  width: 40rpx;
  height: 40rpx;
  background: #e0e7ff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  overflow: hidden;
  position: relative;
}

.app-icon-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.app-icon-fallback {
  font-size: 20rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.app-name {
  font-size: 20rpx;
  color: #666;
  text-align: center;
  line-height: 1.2;
  max-width: 100rpx;
  word-break: break-all;
}

.app-tooltip {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  white-space: nowrap;
  pointer-events: none;
}
</style>
