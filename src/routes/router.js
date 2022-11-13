import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Orders from '../components/Orders.vue'
import Order from '../components/Order.vue'
import About from '../components/About.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      props: {},
      children: [
        {
          path: 'order',
          component: Order,
        },
        {
          path: 'orders',
          component: Orders,
        },
        {
          path: 'about',
          component: About,
        }
      ]
    }
  ]
})