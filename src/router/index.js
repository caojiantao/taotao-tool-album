import { createRouter, createWebHashHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Detail from "@/views/Detail.vue";
import Save from "@/views/Save.vue";
import Video from "@/views/Video.vue";

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
      path: "/save",
      component: Save,
    },
    {
      path: "/video",
      component: Video,
    },
  ],
});

export default router;
