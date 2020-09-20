import Vue from 'vue'
import Router from 'vue-router'

// import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import SignUp from '@/components/SignUp'
import constants from '@/constants'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: constants.path.LOGIN,
      component: Login,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
    {
      path: constants.path.TOP,
      name: 'home',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Settings.vue'),
    },
    {
      path: '/machines',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Machines.vue'),
    },
    {
      path: '/robots',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Robots.vue'),
    },
    {
      path: '/licenses',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Licenses.vue'),
    },
    {
      path: '/ocsettings',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/OCSettings.vue'),
    },
    {
      path: '/releases',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Releases.vue'),
    },
    {
      path: '/settings',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/Settings.vue'),
    },
    {
      path: constants.path.SIGN_UP,
      component: SignUp,
      meta: {
        isPublic: true,
      },
    },
  ],
})
