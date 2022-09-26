<template>
  <van-nav-bar fixed>
    <template #title>
      <div class="header-title">{{ albumDetail.name }}</div>
      <div class="header-subtitle">
        {{ albumDetail.picNum }}图片 {{ albumDetail.videoNum }}视频
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
      <van-grid :column-num="3" :border="false" :center="false">
        <van-grid-item
          v-for="(item, index) in rows"
          :key="item.id"
          clickable
          @click="onClick(index)"
        >
          <van-image
            v-if="item.fileType == 'PICTURE'"
            :src="item.pic.picUrl"
            alt=""
          />
          <van-image
            v-if="item.fileType == 'VIDEO'"
            :src="item.video.coverUrl"
            alt=""
          />
        </van-grid-item>
      </van-grid>
    </van-list>
  </van-pull-refresh>

  <van-uploader multiple :after-read="afterRead">
    <van-button icon="plus" type="primary"></van-button>
  </van-uploader>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ImagePreview } from "vant";
import config from "@/config.js";

import $http from "@/http";

const router = useRouter();
const albumId = router.currentRoute.value.params["albumId"];

const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

const albumDetail = reactive({
  name: "",
  picNum: 0,
  videoNum: 0,
});

const page = reactive({
  albumId: albumId,
  fileType: "PICTURE",
  current: 1,
  size: 10,
});

const rows = ref([]);

onMounted(() => {
  getAlbumDetail();
  onRefresh();
});

const onRefresh = () => {
  refreshing.value = true;
  finished.value = false;
  loading.value = true;
  page.current = 1;
  onLoad();
};

const getAlbumDetail = () => {
  $http({
    url: `/album/getAlbumById?albumId=${albumId}`,
  })
    .then((resp) => {
      Object.assign(albumDetail, resp);
    })
    .catch((e) => {});
};

const onLoad = () => {
  $http({
    url: `/album/getAlbumFilePage`,
    params: page,
  })
    .then((resp) => {
      if (refreshing.value) {
        rows.value = [];
        refreshing.value = false;
      }
      // 拼接图片地址链接
      resp.rows.forEach((item) => {
        if (item.fileType == "PICTURE") {
          item.pic.picUrl = config.getPicUrl(item.pic.filename);
        } else if (item.fileType == "VIDEO") {
          item.pic.coverUrl = config.getPicUrl(item.video.coverFilename);
        }
      });
      rows.value.push(...resp.rows);
      if (resp.rows.length == 0) {
        finished.value = true;
      }
    })
    .finally(() => {
      loading.value = false;
      page.current++;
    });
};

const onClick = (index) => {
  ImagePreview({
    images: rows.value.map((item) => item.pic.picUrl),
    startPosition: index,
  });
};

const afterRead = (files) => {
  let apiFiles = [];
  if (!files.length) {
    apiFiles.push(files.file);
  } else {
    apiFiles.push(...files.map((item) => item.file));
  }

  let data = new FormData();
  data.append("albumId", albumId);
  data.append("fileType", "PICTURE");
  apiFiles.forEach((item) => data.append("files", item));
  $http({
    url: `/album/batchUploadPic`,
    method: "post",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((resp) => {
      onRefresh();
    })
    .catch((e) => {});
};
</script>
