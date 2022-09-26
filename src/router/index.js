import { createRouter, createWebHashHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Detail from "@/views/Detail.vue";
import Add from "@/views/Add.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/:albumId",
      component: Detail,
    },
    {
      path: "/add",
      component: Add,
    },
  ],
});

export default router;
