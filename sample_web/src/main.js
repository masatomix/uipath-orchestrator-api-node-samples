import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import firebase from 'firebase'
import firebaseConfig from '@/firebaseConfig'
import constants from './constants'
import Type from './modules/Type'

// if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig)
// }
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
firebase.analytics()

Vue.prototype.$analytics = firebase.analytics()

Vue.config.productionTip = false
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // console.log(JSON.stringify(user));
    // User is signed in.
    store.commit(Type.user, user)
    store.commit(Type.loginStatus, true)
  } else {
    store.commit(Type.user, {})
    store.commit(Type.loginStatus, false)

    store.commit(Type.enterpriseConfig, {}) // インスタンスの更新
    store.commit(Type.communityConfig, {}) // インスタンスの更新
    store.commit(Type.jsonConfig, {}) // インスタンスの更新
    store.commit(Type.selectedRobotModeFlag, null) // インスタンスの更新
    store.commit(Type.orchestratorConfigSaved, false) // インスタンスの更新
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
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
