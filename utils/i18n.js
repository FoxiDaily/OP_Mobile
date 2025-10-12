
function getCurrentLocale() {
  try {
 
    try {
      const storedLocale = uni.getStorageSync('locale')
      if (storedLocale) {
        return storedLocale
      }
    } catch (error) {
      console.log('get language error', error)
    }
    
    const app = getApp()
    
    if (app?.$vm?.$i18n?.locale) {
      return app.$vm.$i18n.locale
    }
    
    if (app?.$vm?.$root?.$i18n?.locale) {
      return app.$vm.$root.$i18n.locale
    }
    
    const locale = uni.getLocale()
    
    let result
    if (locale === 'zh-Hans') {
      result = 'zh-Hans'
    } else {
      result = 'en'
    }
    
    return result
  } catch (error) {
    return 'zh-Hans'
  }
}

class I18nUtils {

  static t(key, params = {}) {
    const i18n = getApp().$vm?.$i18n || getApp().$vm?.$root?.$i18n
    if (i18n) {
      return i18n.t(key, params)
    }
    return key
  }

  static setPageTitle(pageKey) {
    const title = this.t(`pages.${pageKey}`)
    if (title) {
      uni.setNavigationBarTitle({
        title: title
      })
    }
  }


  static switchLanguage(locale) {
    try {
      

      uni.setStorageSync('locale', locale)
      
      const app = getApp()
      if (app?.$vm?.$i18n) {
        app.$vm.$i18n.locale = locale
      }
      
      return true
    } catch (error) {
      return false
    }
  }


  static getCurrentLanguage() {
    return getCurrentLocale()
  }
}



export default I18nUtils
