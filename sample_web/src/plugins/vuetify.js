import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader 追記
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure you are using css-loader
import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader
import ja from 'vuetify/lib/locale/ja'
import en from 'vuetify/lib/locale/en'

Vue.use(Vuetify)

export default new Vuetify({
  //https://vuetifyjs.com/ja/customization/internationalization/
  lang: {
    locales: { ja, en },
    current: 'ja',
  },
})
