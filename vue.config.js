module.exports = {
  devServer: {
    port: 8080,
    proxy: {
      '/ubus': {
        target: 'http://192.168.66.1',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/ubus': '/ubus'
        }
      },
      '/cgi-bin/luci': {
        target: 'http://192.168.66.1',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/cgi-bin/luci': '/cgi-bin/luci'
        }
      }
    }
  }
} 