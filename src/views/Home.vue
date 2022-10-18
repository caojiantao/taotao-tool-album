<template>
  <van-nav-bar fixed>
    <template #title>
      <div class="header-title">相册</div>
      <div class="header-subtitle">
        {{ homeResp.albumNum }}相册 {{ homeResp.imageNum }}图片 {{ homeResp.videoNum }}视频
      </div>
    </template>
  </van-nav-bar>

  <infinite-list :context="infiniteListContext" @afterLoad="afterLoad">
    <van-grid :column-num="2" :border="false" :center="false" clickable gutter="10">
      <van-grid-item v-for="item in infiniteListContext.rows" :key="item.id" @click="onClick(item.id)">
        <div style="padding-top:100%;">
          <van-image fit="cover" :src="item.coverUrl" radius="5"
            style="position:absolute;top:0;width:100%;height:100%;" />
        </div>
        <div v-if="item.id > 0">
          <div style="font-weight:bold;">{{ item.name }}</div>
          <div class="header-subtitle">{{ item.picNum + item.videoNum }} 张</div>
        </div>
      </van-grid-item>
    </van-grid>
  </infinite-list>

</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

import $http from "@/http";
import config from "@/config.js";

import InfiniteList from "@/components/InfiniteList.vue";

const router = useRouter();

const homeResp = reactive({});

onMounted(() => {
  initPage();
})

const infiniteListContext = reactive({
  url: `/album/getAlbumPage`,
  params: {},
  rows: [
    {
      id: -1,
      coverUrl: `${import.meta.env.BASE_URL}/img/addAlbum.png`,
    },
  ],
})

const initPage = () => {
  $http({
    url: `/album/getAlbumHomeResp`,
  })
    .then((resp) => {
      Object.assign(homeResp, resp);
    })
    .catch((e) => { });
};

const afterLoad = (rows) => {
  rows.forEach((item) => {
    item.coverUrl = config.getPicUrl(item.coverFilename);
  });

};

const onClick = (albumId) => {
  if (albumId < 0) {
    router.push("/save");
  } else {
    router.push(`/${albumId}`);
  }
};
</script>
