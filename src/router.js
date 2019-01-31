import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'startup',
      component: () => import('./views/Startup.vue')
    },
    {
      path: '/character',
      name: 'menu',
      component: () => import('./views/StartMenu.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    },
    {
      path: '/dungeon',
      name: 'dungeon',
      component: () => import('./views/DungeonMenu.vue')
    },
    {
      path: '/dungeon/fight',
      name: 'fight',
      component: () => import('./views/Fight.vue')
    },
    {
      path: '/dungeon/loot',
      name: 'loot',
      component: () => import('./views/Loot.vue')
    },
    {
      path: '/dungeon/inventory',
      name: 'inventory',
      component: () => import('./views/Inventory.vue')
    },
    {
      path: '/dungeon/shop',
      name: 'shop',
      component: () => import('./views/Shop.vue')
    },
    {
      path: '/dungeon/event',
      name: 'event',
      component: () => import('./views/Event.vue')
    },
    {
      path: '/dungeon/event2',
      name: 'event2',
      component: () => import('./views/Event2.vue')
    }
  ]
})
