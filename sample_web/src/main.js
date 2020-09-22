import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import firebase from 'firebase'
import firebaseConfig from '@/firebaseConfig'
import constants from './constants'
import VueMeta from 'vue-meta'
import VueI18n from 'vue-i18n'
import FlagIcon from 'vue-flag-icon'

// if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig)
// }

Vue.use(VueMeta)
Vue.use(VueI18n) // cf. https://note.com/thiroyoshi/n/n88bb060bf325
Vue.use(FlagIcon)

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
firebase.analytics()

Vue.prototype.$analytics = firebase.analytics()

Vue.config.productionTip = false
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // console.log(JSON.stringify(user));
    // User is signed in.
    store.dispatch('user/login', user)
    firebase.analytics().setUserId(user.uid)
    firebase.analytics().setUserProperties({
      account_type: 'Basic', // can help you to define audiences
    })
  } else {
    store.dispatch('user/logout')
    store.dispatch('appStore/clearConfig')
  }
})

router.beforeEach((to, from, next) => {
  const currentUser = store.state.user.user
  if (currentUser.uid) {
    if (to.path === constants.path.LOGIN) {
      firebase
        .auth()
        .signOut()
        .then(() => next())
    }
  }

  if (to.matched.some(record => record.meta.isPublic)) {
    // alert('isPublic = true '+ to.path)
    next()
  } else {
    // alert('isPublic = false '+ to.path)
    if (currentUser.uid) {
      next()
    } else {
      next({
        path: constants.path.LOGIN,
        query: {
          redirect: to.path,
        },
      })
    }
  }
})

const i18n = new VueI18n({
  locale: 'ja',
  // messages: {
  //   ja: require('../lang/ja.json'),
  //   en: require('../lang/en.json'),
  // },
  messages: require('./lang.json'),
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
