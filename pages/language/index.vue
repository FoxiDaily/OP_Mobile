<template>
  <view class="container">
    <view class="settings-card">
 
 
      <view class="settings-content">
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">{{ $t('device_list.language_settings') }}</text>
          </view>
          
          <view class="language-options">
            <view 
              :class="['language-option', currentLanguage === 'zh-Hans' ? 'active' : '']"
              @click="switchLanguage('zh-Hans')"
            >
              <text class="language-text">中文</text>
              <view v-if="currentLanguage === 'zh-Hans'" class="check-icon">✓</view>
            </view>
            
            <view 
              :class="['language-option', currentLanguage === 'en' ? 'active' : '']"
              @click="switchLanguage('en')"
            >
              <text class="language-text">English</text>
              <view v-if="currentLanguage === 'en'" class="check-icon">✓</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import I18nUtils from '@/utils/i18n.js'

export default {
  data() {
    return {
      currentLanguage: 'zh-Hans'
    }
  },
  
  onLoad() {
    uni.setNavigationBarTitle({
      title: this.$t('device_list.language_settings')
    })
    this.currentLanguage = I18nUtils.getCurrentLanguage()
  },
  
  methods: {
    switchLanguage(locale) {
      if (locale === this.currentLanguage) return
      
      try {
        const success = I18nUtils.switchLanguage(locale)
        if (success) {
          this.currentLanguage = locale
          uni.showToast({
            title: this.$t('language.switch_success'),
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.log('切换语言时出错:', error)
      }
    }
  }
}
</script>

<style scoped>
@import '@/styles/common.scss';

.container {
  padding: 15rpx;
}

.settings-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-top: 50rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.settings-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.settings-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 40rpx;
}

.settings-content {
  text-align: left;
}

.settings-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.language-option.active {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.language-option:active {
  transform: scale(0.98);
}

.language-text {
  font-size: 28rpx;
  font-weight: 500;
}

.check-icon {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}
</style>