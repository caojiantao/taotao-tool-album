<template>
  <van-nav-bar fixed>
    <template #title>
      <div class="header-title">相册</div>
      <div style="color:gray;font-size:.5rem;">
        {{ homeResp.albumNum }}相册 {{ homeResp.imageNum }}图片
        {{ homeResp.videoNum }}视频
      </div>
    </template>
  </van-nav-bar>

  <van-pull-refresh
    v-model="refreshing"
    @refresh="onRefresh"
    success-text="刷新成功"
    style="margin-top: var(--van-nav-bar-height)"
  >
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-grid :column-num="2" :border="false" :center="false" clickable gutter="10">
        <van-grid-item
          v-for="item in rows"
          :key="item.id"
          @click="onClick(item.id)"
        >
          <van-image :src="item.coverUrl" radius="5" />
          <template v-if="item.id > 0">
            <div style="font-weight:bold;">{{ item.name }}</div>
            <div style="color:gray;font-size:.5rem;">{{ item.picNum + item.videoNum }} 张</div>
          </template>
        </van-grid-item>
      </van-grid>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

import $http from "@/http";
import config from "@/config.js";

const router = useRouter();

const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

const homeResp = reactive({});

const page = reactive({
  current: 1,
  size: 10,
});

const initRows = () => {
  return [
    {
      id: -1,
      coverUrl: `${import.meta.env.BASE_URL}/img/addAlbum.png`,
    },
  ];
};

const rows = ref(initRows());

onMounted(() => {
  onRefresh();
});

const getAlbumHome = () => {
  $http({
    url: `/album/getAlbumHomeResp`,
  })
    .then((resp) => {
      Object.assign(homeResp, resp);
    })
    .catch((e) => { });
};

const onRefresh = () => {
  getAlbumHome();
  finished.value = false;
  loading.value = true;
  page.current = 1;
  onLoad();
};

const onLoad = () => {
  $http({
    url: "/album/getAlbumPage",
    params: page,
  })
    .then((resp) => {
      if (refreshing.value) {
        rows.value = initRows();
        refreshing.value = false;
      }
      if (resp.rows.length == 0) {
        finished.value = true;
        return;
      }
      resp.rows.forEach((item) => {
        item.coverUrl = config.getPicUrl(item.coverFilename);
      });
      rows.value.push(...resp.rows);
    })
    .finally(() => {
      loading.value = false;
      page.current++;
    });
};

const onClick = (albumId) => {
  if (albumId < 0) {
    router.push("/add");
  } else {
    router.push(`/${albumId}`);
  }
};
</script>
