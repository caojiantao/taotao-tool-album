<template>
  <van-nav-bar fixed>
    <template #title>
      <div class="header-title">相册</div>
      <div class="header-subtitle">
        {{ countInfo.album }}相册 {{ countInfo.pic }}图片
        {{ countInfo.video }}视频
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
      <van-grid :column-num="2" :border="false" :center="false" clickable square gutter="10">
        <van-grid-item
          v-for="item in rows"
          :key="item.id"
          @click="onClick(item.id)"
        >
          <van-image :src="item.coverUrl" alt="" />
          <template v-if="item.id > 0">
            <div>{{ item.name }}</div>
            <div>{{ item.picNum + item.videoNum }} 张</div>
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

const countInfo = reactive({
  album: 0,
  pic: 0,
  video: 0,
});

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

const onRefresh = () => {
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
