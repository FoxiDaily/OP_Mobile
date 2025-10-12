<template>
	<view class="container">


		<view class="tab-container">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				class="tab-item"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				<text class="tab-text">{{ tab.name }}</text>
			</view>
		</view>

		<view v-if="currentTab === 0">
			<view v-if="loading" class="loading-overlay">
				<view class="loading-content">
					<view class="loading-spinner"></view>
					<text class="loading-text">{{ $t('parental_control.loading_apps') }}</text>
				</view>
			</view>

			<view v-else class="rules-container">
			<view class="category-list">
				<view v-for="(category, categoryIndex) in categories" :key="categoryIndex" class="category-card">
					<view class="category-header" @click="toggleCategory(categoryIndex)">
						<view class="category-left">
							<image 
								class="category-arrow" 
								:src="category.expanded ? '/static/align-bottom.png' : '/static/right.png'" 
								mode="widthFix" 
								style="width: 24rpx; height: 24rpx; margin-right: 15rpx;" 
							/>
							<view class="category-info">
								<text class="category-name">{{ category.name }}</text>
								<text class="category-count">({{ category.apps.length }})</text>
							</view>
						</view>
						<view class="category-right">
							<text class="selected-count">{{ getSelectedCount(category) }}/{{ category.apps.length }}</text>
						</view>
					</view>

					<view v-if="category.expanded" class="app-list">
						<view class="category-select-all">
							<switch 
								:checked="category.allSelected" 
								@change="toggleCategorySelect(categoryIndex)"
								color="#007AFF"
							/>
							<text class="select-all-text">{{ $t('parental_control.select_all') }}</text>
						</view>
						
						<view v-for="(app, appIndex) in category.apps" :key="app.id" class="app-item">
							<view class="app-left">
								<image 
									:src="getAppIconUrl(app.id)" 
									mode="aspectFit" 
									class="app-icon"
									@error="onIconError($event, app.id)"
								/>
								<text v-if="app.iconError" class="app-icon-fallback">📱</text>
								<text class="app-name">{{ app.name }}</text>
							</view>
							<view class="app-right">
								<switch 
									:checked="app.selected" 
									@change="toggleAppSelect(categoryIndex, appIndex)"
									color="#007AFF"
								/>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="save-button-container">
				<button 
					class="save-button" 
					@click="saveRules"
					:disabled="saving"
				>
					<text class="save-button-text">{{ saving ? $t('parental_control.saving') : $t('parental_control.save') }}</text>
				</button>
			</view>
			</view>
		</view>

		<view v-if="currentTab === 1" class="time-config-container">
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-overlay">
				<view class="loading-content">
					<view class="loading-spinner"></view>
					<text class="loading-text">{{ $t('parental_control.loading_settings') }}</text>
				</view>
			</view>

			<view v-else class="config-content">
				<view class="config-section">
					<view class="section-title">{{ $t('parental_control.time_mode') }}</view>
					<view class="mode-selector">
						<view 
							class="mode-item"
							:class="{ active: timeConfig.mode === 0 }"
							@click="switchTimeMode(0)"
						>
							<text class="mode-text">{{ $t('parental_control.fixed_time') }}</text>
						</view>
						<view 
							class="mode-item"
							:class="{ active: timeConfig.mode === 1 }"
							@click="switchTimeMode(1)"
						>
							<text class="mode-text">{{ $t('parental_control.dynamic_time') }}</text>
						</view>
					</view>
				</view>

				<view v-if="timeConfig.mode === 0" class="config-section">
					<view class="section-title">{{ $t('parental_control.time_slots') }}</view>
					<view class="time-slots">
						<view v-for="(slot, index) in timeConfig.time_list" :key="index" class="time-slot">
							<picker 
								mode="time" 
								:value="slot.start" 
								@change="slot.start = $event.detail.value"
							>
								<view class="time-picker">{{ slot.start }}</view>
							</picker>
							<text class="time-separator">-</text>
							<picker 
								mode="time" 
								:value="slot.end" 
								@change="slot.end = $event.detail.value"
							>
								<view class="time-picker">{{ slot.end }}</view>
							</picker>
							<view class="remove-btn" @click="removeTimeSlot(index)">
								<text class="remove-text">×</text>
							</view>
						</view>
						<view class="add-slot-btn" @click="addTimeSlot">
							<text class="add-text">+ {{ $t('parental_control.add_time_slot') }}</text>
						</view>
					</view>
				</view>

				<view v-if="timeConfig.mode === 1" class="config-section">
					<view class="section-title">{{ $t('parental_control.dynamic_settings') }}</view>
					<view class="dynamic-settings">
						<view class="setting-item">
							<text class="setting-label">{{ $t('parental_control.allow_time') }}</text>
							<input 
								type="number" 
								v-model="timeConfig.allow_time" 
								class="setting-input"
								placeholder="20"
							/>
							<text class="setting-unit">{{ $t('parental_control.minutes') }}</text>
						</view>
						<view class="setting-item">
							<text class="setting-label">{{ $t('parental_control.deny_time') }}</text>
							<input 
								type="number" 
								v-model="timeConfig.deny_time" 
								class="setting-input"
								placeholder="60"
							/>
							<text class="setting-unit">{{ $t('parental_control.minutes') }}</text>
						</view>
						<view class="setting-item">
							<text class="setting-label">{{ $t('parental_control.start_time') }}</text>
							<picker 
								mode="time" 
								:value="timeConfig.start_time" 
								@change="timeConfig.start_time = $event.detail.value"
							>
								<view class="time-picker">{{ timeConfig.start_time }}</view>
							</picker>
						</view>
						<view class="setting-item">
							<text class="setting-label">{{ $t('parental_control.end_time') }}</text>
							<picker 
								mode="time" 
								:value="timeConfig.end_time" 
								@change="timeConfig.end_time = $event.detail.value"
							>
								<view class="time-picker">{{ timeConfig.end_time }}</view>
							</picker>
						</view>
					</view>
				</view>

				<view class="config-section">
					<view class="section-title">{{ $t('parental_control.weekdays') }}</view>
					<view class="weekday-selector">
						<view 
							v-for="day in 7" 
							:key="day - 1"
							class="weekday-item"
							:class="{ active: timeConfig.weekday_list.includes(day - 1) }"
							@click="toggleWeekday(day - 1)"
						>
							<text class="weekday-text">{{ getWeekdayName(day - 1) }}</text>
						</view>
					</view>
				</view>

				<view class="save-button-container">
					<button 
						class="save-button" 
						@click="saveTimeConfig"
						:disabled="saving"
					>
						<text class="save-button-text">{{ saving ? $t('parental_control.saving') : $t('parental_control.save') }}</text>
					</button>
				</view>
			</view>
		</view>

		<view v-if="currentTab === 2" class="user-config-container">
			<view v-if="loading" class="loading-overlay">
				<view class="loading-content">
					<view class="loading-spinner"></view>
					<text class="loading-text">{{ $t('parental_control.loading_settings') }}</text>
				</view>
			</view>

			<view v-else class="config-content">
				<view class="config-section">
					<view class="section-title">{{ $t('parental_control.user_mode') }}</view>
					<view class="mode-selector">
						<view 
							class="mode-item"
							:class="{ active: userConfig.mode === 0 }"
							@click="switchUserMode(0)"
						>
							<text class="mode-text">{{ $t('parental_control.auto_mode') }}</text>
						</view>
						<view 
							class="mode-item"
							:class="{ active: userConfig.mode === 1 }"
							@click="switchUserMode(1)"
						>
							<text class="mode-text">{{ $t('parental_control.manual_mode') }}</text>
						</view>
					</view>
				</view>

				<view v-if="userConfig.mode === 0" class="config-section">
					<view class="section-title">{{ $t('parental_control.all_users') }}</view>
					<view class="user-list">
						<view v-for="user in allUsers" :key="user.mac" class="user-item">
							<view class="user-info">
								<text class="user-name">{{ getUserDisplayName(user) }}</text>
								<text class="user-mac">{{ user.mac }}</text>
							</view>
							<view class="user-status">
								<text class="status-text" :class="{ online: user.online }">
									{{ user.online ? $t('parental_control.online') : $t('parental_control.offline') }}
								</text>
							</view>
						</view>
					</view>
				</view>

				<view v-if="userConfig.mode === 1" class="config-section">
					<view class="section-title" @click="toggleManualUsers">
						<view class="title-left">
							<image 
								class="expand-arrow" 
								:src="manualUsersExpanded ? '/static/align-bottom.png' : '/static/right.png'" 
								mode="widthFix" 
								style="width: 24rpx; height: 24rpx; margin-right: 15rpx;" 
							/>
							<text>{{ $t('parental_control.manual_users') }}</text>
						</view>
						<text class="user-count">({{ userConfig.list.length }})</text>
					</view>
					
					<view v-if="manualUsersExpanded" class="manual-users">
						<view v-for="(user, index) in userConfig.list" :key="index" class="manual-user-item">
							<view class="user-info">
								<text class="user-name">{{ getUserDisplayName(user) }}</text>
								<text class="user-mac">{{ user.mac }}</text>
							</view>
							<view class="remove-btn" @click="removeUserFromManual(index)">
								<text class="remove-text">×</text>
							</view>
						</view>
					</view>
					
					<view class="add-user-section">
						<view class="section-title">{{ $t('parental_control.add_user') }}</view>
						<view class="available-users">
							<view 
								v-for="user in getAvailableUsers()" 
								:key="user.mac"
								class="available-user-item"
								@click="addUserToManual(user)"
							>
								<view class="user-info">
									<text class="user-name">{{ getUserDisplayName(user) }}</text>
									<text class="user-mac">{{ user.mac }}</text>
								</view>
								<view class="add-btn">
									<text class="add-text">+</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="save-button-container">
					<button 
						class="save-button" 
						@click="saveUserConfig"
						:disabled="saving"
					>
						<text class="save-button-text">{{ saving ? $t('parental_control.saving') : $t('parental_control.save') }}</text>
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import DeviceManager from '@/utils/deviceManager.js'

export default {
	data() {
		return {
			loading: false,
			saving: false,
			deviceInfo: {},
			session: '',
			url: '/ubus',
			categories: [],
			selectedAppIds: [],
			currentTab: 0,
			tabs: [
				{ name: this.$t('parental_control.app_filter_rules'), key: 'rules' },
				{ name: this.$t('parental_control.time_config'), key: 'time' },
				{ name: this.$t('parental_control.user_config'), key: 'user' }
			],
			timeConfig: {
				mode: 0,
				time_list: [],
				weekday_list: [], 
				allow_time: 20, 
				deny_time: 60, 
				start_time: '00:00', 
				end_time: '23:59' 
			},
			userConfig: {
				mode: 0, 
				list: [] 
			},
			allUsers: [],
			manualUsersExpanded: false
		}
	},
	computed: {
	},
	onLoad() {
		uni.setNavigationBarTitle({
			title: this.$t('parental_control.app_filter_rules')
		})
		
		this.deviceInfo = DeviceManager.getCurrentDevice()
		this.session = this.deviceInfo.sysauth
		const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
		const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
		this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
		
		this.loadData()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		
		switchTab(index) {
			this.currentTab = index
			if (index === 0 && this.categories.length === 0) {
				this.loadData()
			} else if (index === 1) {
				this.loadTimeConfig()
			} else if (index === 2) {
				this.loadUserConfig()
			}
		},
		
		loadData() {
			this.loading = true
			this.loadAppCategories().then(() => {
				return this.loadSelectedApps()
			}).finally(() => {
				this.loading = false
			})
		},
		
		loadAppCategories() {
			return new Promise((resolve, reject) => {
				uni.request({
					method: 'POST',
					url: this.url,
					data: {
						jsonrpc: '2.0',
						id: 1,
						method: 'call',
						params: [this.session, 'appfilter', 'class_list', {}]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 5000,
					success: (res) => {
						if (res.data && res.data.result && res.data.result[1] && res.data.result[1].class_list) {
							this.categories = res.data.result[1].class_list.map(category => ({
								name: category.name,
								expanded: false,
								allSelected: false,
								apps: category.app_list.map(appStr => {
									const [id, name, icon] = appStr.split(',')
									return {
										id: parseInt(id),
										name: name,
										icon: parseInt(icon),
										selected: false,
										iconError: false
									}
								})
							}))
						}
						resolve()
					},
					fail: (err) => {
						reject(err)
					}
				})
			})
		},
		
		loadSelectedApps() {
			return new Promise((resolve, reject) => {
				uni.request({
					method: 'POST',
					url: this.url,
					data: {
						jsonrpc: '2.0',
						id: 2,
						method: 'call',
						params: [this.session, 'appfilter', 'get_app_filter', {}]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 5000,
					success: (res) => {
						if (res.data && res.data.result && res.data.result[1] && res.data.result[1].app_list) {
							this.selectedAppIds = res.data.result[1].app_list
							this.$nextTick(() => {
								this.updateAppSelection()
							})
						}
						resolve()
					},
					fail: (err) => {
						reject(err)
					}
				})
			})
		},
		
		updateAppSelection() {
			this.categories.forEach(category => {
				category.apps.forEach(app => {
					app.selected = this.selectedAppIds.includes(app.id)
				})
				this.updateCategorySelection(category)
			})
		},
		
		updateCategorySelection(category) {
			const selectedCount = category.apps.filter(app => app.selected).length
			category.allSelected = selectedCount === category.apps.length && category.apps.length > 0
		},
		
		toggleCategory(index) {
			this.categories[index].expanded = !this.categories[index].expanded
		},
		
		toggleCategorySelect(index) {
			const category = this.categories[index]
			const newState = !category.allSelected
			
			
			category.apps.forEach(app => {
				app.selected = newState
			})
			
			category.allSelected = newState
		},
		
		toggleAppSelect(categoryIndex, appIndex) {
			const app = this.categories[categoryIndex].apps[appIndex]
			app.selected = !app.selected
			this.updateCategorySelection(this.categories[categoryIndex])
		},
		
		getSelectedCount(category) {
			return category.apps.filter(app => app.selected).length
		},

		loadTimeConfig() {
			this.loading = true
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 4,
					method: 'call',
					params: [this.session, 'appfilter', 'get_app_filter_time', {}]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 5000,
				success: (res) => {
					if (res.data && res.data.result && res.data.result[1] && res.data.result[1].data) {
						this.timeConfig = res.data.result[1].data
					}
					this.loading = false
				},
				fail: (err) => {
					this.loading = false
				}
			})
		},
		
		loadUserConfig() {
			this.loading = true
			Promise.all([
				this.getUserConfig(),
				this.getAllUsers()
			]).finally(() => {
				this.loading = false
			})
		},
		
		getUserConfig() {
			return new Promise((resolve, reject) => {
				uni.request({
					method: 'POST',
					url: this.url,
					data: {
						jsonrpc: '2.0',
						id: 5,
						method: 'call',
						params: [this.session, 'appfilter', 'get_app_filter_user', {}]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 5000,
					success: (res) => {

						if (res.data && res.data.result && res.data.result[1] && res.data.result[1].data) {
							this.userConfig = res.data.result[1].data
						}
						resolve()
					},
					fail: (err) => {
						reject(err)
					}
				})
			})
		},
		
		getAllUsers() {
			return new Promise((resolve, reject) => {
				uni.request({
					method: 'POST',
					url: this.url,
					data: {
						jsonrpc: '2.0',
						id: 6,
						method: 'call',
						params: [this.session, 'appfilter', 'get_all_users', { flag: 3 }]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 5000,
					success: (res) => {
						if (res.data && res.data.result && res.data.result[1] && res.data.result[1].data) {
							this.allUsers = res.data.result[1].data.list || []
						}
						resolve()
					},
					fail: (err) => {
						reject(err)
					}
				})
			})
		},
		
		saveTimeConfig() {
			this.saving = true
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 7,
					method: 'call',
					params: [this.session, 'appfilter', 'set_app_filter_time', this.timeConfig]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 5000,
				success: (res) => {
					if (res.data && res.data.result && res.data.result[0] === 0) {
						uni.showToast({
							title: this.$t('parental_control.save_success'),
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: this.$t('parental_control.save_failed'),
							icon: 'error'
						})
					}
					this.saving = false
				},
				fail: (err) => {
					uni.showToast({
						title: this.$t('parental_control.save_failed'),
						icon: 'error'
					})
					this.saving = false
				}
			})
		},
		
		saveUserConfig() {
			this.saving = true
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 8,
					method: 'call',
					params: [this.session, 'appfilter', 'set_app_filter_user', { mode: this.userConfig.mode }]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 5000,
				success: (res) => {
					if (res.data && res.data.result && res.data.result[0] === 0) {
						uni.showToast({
							title: this.$t('parental_control.save_success'),
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: this.$t('parental_control.save_failed'),
							icon: 'error'
						})
					}
					this.saving = false
				},
				fail: (err) => {
					uni.showToast({
						title: this.$t('parental_control.save_failed'),
						icon: 'error'
					})
					this.saving = false
				}
			})
		},
		
		switchTimeMode(mode) {
			this.timeConfig.mode = mode
		},
		
		switchUserMode(mode) {
			this.userConfig.mode = mode
		},
		
		addTimeSlot() {
			this.timeConfig.time_list.push({
				start: '00:00',
				end: '23:59'
			})
		},
		
		removeTimeSlot(index) {
			this.timeConfig.time_list.splice(index, 1)
		},
		
		toggleWeekday(day) {
			const index = this.timeConfig.weekday_list.indexOf(day)
			if (index > -1) {
				this.timeConfig.weekday_list.splice(index, 1)
			} else {
				this.timeConfig.weekday_list.push(day)
			}
		},
		
		getWeekdayName(day) {
			const weekdays = [
				this.$t('parental_control.sunday'),
				this.$t('parental_control.monday'),
				this.$t('parental_control.tuesday'),
				this.$t('parental_control.wednesday'),
				this.$t('parental_control.thursday'),
				this.$t('parental_control.friday'),
				this.$t('parental_control.saturday')
			]
			return weekdays[day]
		},
		
		addUserToManual(user) {
			this.saving = true
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 9,
					method: 'call',
					params: [this.session, 'appfilter', 'add_app_filter_user', { mac_list: [user.mac] }]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 5000,
				success: (res) => {
					if (res.data && res.data.result && res.data.result[0] === 0) {
						this.userConfig.list.push({
							mac: user.mac,
							nickname: user.nickname || '',
							hostname: user.hostname || ''
						})
						uni.showToast({
							title: this.$t('parental_control.save_success'),
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: this.$t('parental_control.save_failed'),
							icon: 'error'
						})
					}
					this.saving = false
				},
				fail: (err) => {
					uni.showToast({
						title: this.$t('parental_control.save_failed'),
						icon: 'error'
					})
					this.saving = false
				}
			})
		},
		
		removeUserFromManual(index) {
			const user = this.userConfig.list[index]
			if (user) {
				this.saving = true
				uni.request({
					method: 'POST',
					url: this.url,
					data: {
						jsonrpc: '2.0',
						id: 10,
						method: 'call',
						params: [this.session, 'appfilter', 'del_app_filter_user', { mac: user.mac }]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 5000,
					success: (res) => {
						if (res.data && res.data.result && res.data.result[0] === 0) {
							this.userConfig.list.splice(index, 1)
							uni.showToast({
								title: this.$t('parental_control.save_success'),
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: this.$t('parental_control.save_failed'),
								icon: 'error'
							})
						}
						this.saving = false
					},
					fail: (err) => {
						uni.showToast({
							title: this.$t('parental_control.save_failed'),
							icon: 'error'
						})
						this.saving = false
					}
				})
			}
		},
		

		getUserDisplayName(user) {
			return user.nickname || user.hostname || user.mac
		},
		

		getAvailableUsers() {
			const manualUserMacs = this.userConfig.list.map(user => user.mac)
			return this.allUsers.filter(user => !manualUserMacs.includes(user.mac))
		},
		

		toggleManualUsers() {
			this.manualUsersExpanded = !this.manualUsersExpanded
		},
		
		getAppIconUrl(appId) {
			const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
			const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
			return `${protocol}://${formattedHost}:${this.deviceInfo.port}/luci-static/resources/app_icons/${appId}.png`
		},
		
		onIconError(event, appId) {
			this.categories.forEach(category => {
				category.apps.forEach(app => {
					if (app.id === appId) {
						app.iconError = true
					}
				})
			})
		},
		
		saveRules() {
			this.saving = true
			
			const selectedIds = []
			this.categories.forEach(category => {
				category.apps.forEach(app => {
					if (app.selected) {
						selectedIds.push(app.id)
					}
				})
			})
			
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 3,
					method: 'call',
					params: [this.session, 'appfilter', 'set_app_filter', { app_list: selectedIds }]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 5000,
				success: (res) => {
					this.saving = false
					if (res.data && res.data.result && res.data.result[0] === 0) {
						uni.showToast({
							title: this.$t('parental_control.save_success'),
							icon: 'success'
						})
						
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						uni.showToast({
							title: this.$t('parental_control.save_failed'),
							icon: 'error'
						})
					}
				},
				fail: (err) => {
					this.saving = false
					uni.showToast({
						title: this.$t('parental_control.save_failed'),
						icon: 'none'
					})
				}
			})
		}
	}
}
</script>

<style scoped>
@import '@/styles/common.scss';

.tab-container {

	display: flex;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12rpx;
	padding: 8rpx;
}
.container {
	padding: 20rpx;
}
.tab-item {
	flex: 1;
	text-align: center;
	padding: 15rpx 0;
	border-radius: 8rpx;
	transition: all 0.3s ease;
}

.tab-item.active {
	background: rgba(255, 255, 255, 0.2);
}

.tab-text {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	font-weight: 500;
}

.tab-item.active .tab-text {
	color: #fff;
	font-weight: 600;
}

.time-config-container,
.user-config-container {
	padding: 10rpx;
}

.config-content {
	padding-bottom: 40rpx;
}

.config-section {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	font-size: 32rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title-left {
	display: flex;
	align-items: center;
}

.user-count {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

.mode-selector {
	display: flex;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
	padding: 6rpx;
}

.mode-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	border-radius: 8rpx;
	transition: all 0.3s ease;
}

.mode-item.active {
	background: #007AFF;
}

.mode-text {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

.mode-item.active .mode-text {
	color: #fff;
	font-weight: 600;
}

.time-slots {
	margin-top: 20rpx;
}

.time-slot {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 20rpx;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
}

.time-picker {
	padding: 10rpx 15rpx;
	background: #fff;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	border: 1rpx solid #ddd;
}

.time-separator {
	margin: 0 20rpx;
	font-size: 28rpx;
	color: #666;
}

.remove-btn {
	width: 45rpx;
	height: 45rpx;
	background: #ff4757;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 20rpx;
}

.remove-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
}

.add-slot-btn {
	padding: 20rpx;
	background: rgba(0, 122, 255, 0.1);
	border-radius: 12rpx;
	text-align: center;
	border: 2rpx dashed #007AFF;
}

.add-text {
	font-size: 28rpx;
	color: #007AFF;
	font-weight: 500;
}

.dynamic-settings {
	margin-top: 20rpx;
}

.setting-item {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 20rpx;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
}

.setting-label {
	font-size: 28rpx;
	color: #333;
	width: 200rpx;
}

.setting-input {
	flex: 1;
	padding: 15rpx 20rpx;
	background: #fff;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	border: 1rpx solid #ddd;
	margin: 0 20rpx;
}

.setting-unit {
	font-size: 24rpx;
	color: #666;
}

.weekday-selector {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
	margin-top: 20rpx;
}

.weekday-item {
	padding: 20rpx 30rpx;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
}

.weekday-item.active {
	background: #007AFF;
	border-color: #007AFF;
}

.weekday-text {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
}

.weekday-item.active .weekday-text {
	color: #fff;
	font-weight: 600;
}

/* 用户列表 */
.user-list,
.manual-users,
.available-users {
	margin-top: 20rpx;
}

.user-item,
.manual-user-item,
.available-user-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
	margin-bottom: 15rpx;
}

.user-info {
	flex: 1;
}

.user-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.user-mac {
	font-size: 24rpx;
	color: #666;
}

.user-status {
	display: flex;
	align-items: center;
}

.status-text {
	font-size: 24rpx;
	color: #999;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	background: rgba(0, 0, 0, 0.1);
}

.status-text.online {
	color: #27ae60;
	background: rgba(39, 174, 96, 0.1);
}

.add-btn {
	width: 60rpx;
	height: 60rpx;
	background: #27ae60;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.add-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
}

.add-user-section {
	margin-top: 30rpx;
	padding-top: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
}

.loading-content {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #007AFF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #666;
}

.rules-container {
}

.category-list {
	margin-bottom: 20rpx;
}

.category-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.category-header {
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
}

.category-left {
	flex: 1;
	display: flex;
	align-items: center;
}

.category-info {
	flex: 1;
}

.category-name {
	font-size: 32rpx;
	color: #333;
	font-weight: 600;
	margin-right: 10rpx;
}

.category-count {
	font-size: 24rpx;
	color: #666;
}

.category-right {
	display: flex;
	align-items: center;
}

.selected-count {
	font-size: 28rpx;
	color: #007AFF;
	font-weight: 600;
}

.app-list {
	padding: 0 30rpx 20rpx;
}

.category-select-all {
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
}

.select-all-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-left: 15rpx;
}

.app-item {
	padding: 20rpx 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #f8f8f8;
}

.app-item:last-child {
	border-bottom: none;
}

.app-left {
	flex: 1;
	display: flex;
	align-items: center;
}

.app-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 12rpx;
	margin-right: 20rpx;
	background: #f8f8f8;
}

.app-icon-fallback {
	width: 60rpx;
	height: 60rpx;
	border-radius: 12rpx;
	margin-right: 20rpx;
	background: #f8f8f8;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.app-name {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.app-right {
	display: flex;
	align-items: center;
}

.save-button-container {
	padding: 40rpx 20rpx;
}

.save-button {
	width: 100%;
	height: 88rpx;
	background: #007AFF;
	border-radius: 16rpx;
	border: none;
	display: flex;
	justify-content: center;
	align-items: center;
}

.save-button:disabled {
	background: #ccc;
}

.save-button-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: 600;
}
</style>
