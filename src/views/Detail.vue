<template>
  <video id="tao-video" autoplay  style="display:none;"></video>
  <canvas id="tao-canvas" style="display:none;"></canvas>

  <van-nav-bar fixed>
    <template #title>
      <div class="header-title">{{ albumDetail.name }}</div>
      <div style="color:gray;font-size:.5rem;">
        {{ albumDetail.picNum }}图片 {{ albumDetail.videoNum }}视频
      </div>
    </template>
  </van-nav-bar>

  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" success-text="刷新成功"
    style="margin-top: var(--van-nav-bar-height)">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-grid :column-num="3" :border="false" :center="false" square gutter="2">
        <van-grid-item v-for="(item, index) in rows" :key="item.id" clickable @click="onClick(item, index)">
          <van-image fit="cover" :src="item.picUrl" alt="" style="height:100%;" />
          <div v-if="item.fileType == 'video'"
            style="position:absolute;right:0.2rem;bottom:0;color:white;font-weight: bold;">
            {{fmtSecond(item.ext.second)}}</div>
        </van-grid-item>
      </van-grid>
    </van-list>
  </van-pull-refresh>

  <van-uploader multiple :after-read="afterRead" accept="image/*,video/*"
    style="position:fixed;bottom:2rem;right:2rem;">
    <van-button icon="plus" type="primary"></van-button>
  </van-uploader>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ImagePreview, Toast } from "vant";
import config from "@/config.js";
import { parseVideo } from "@/utils.js";

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
  current: 1,
  size: 10,
});

const rows = ref([]);

onMounted(() => {
  onRefresh();
});

const onRefresh = () => {
  getAlbumDetail();
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
    .catch((e) => { });
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
        let filename;
        if (item.ext) {
          item.ext = JSON.parse(item.ext);
        }
        if (item.fileType == "image") {
          filename = item.filename;
        } else if (item.fileType == "video") {
          filename = item.ext.coverFilename;
        }
        item.picUrl = config.getPicUrl(filename);
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

const onClick = (item, index) => {
  if (item.fileType == 'image') {
    ImagePreview({
      images: rows.value.map((item) => item.picUrl),
      startPosition: index,
    });
  } else if (item.fileType == 'video') {
    let videoUrl = config.getPicUrl(item.filename);
    window.open(videoUrl, "_blank");
  }
};

const afterRead = async (files) => {
  Toast.loading({
    message: '正在上传...',
    forbidClick: true,
    overlay: true,
    duration: 0,
  });

  let apiFiles = [];
  if (!files.length) {
    apiFiles.push(files.file);
  } else {
    apiFiles.push(...files.map((item) => item.file));
  }

  let data = new FormData();

  apiFiles.forEach(item => data.append("files", item));

  $http({
    url: `/album/batchUploadFile?albumId=${albumId}`,
    method: "post",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((resp) => {
      Toast.clear();
      onRefresh();
    })
    .catch((e) => { });
};

const fmtSecond = (t) => {
  let result = [];
  for (let i = 0; t != 0 || i < 2; i++) {
    let n = t % 60;
    t = Math.floor(t / 60);
    let flag = (n < 10) && (i == 0 || t != 0);
    result.push((flag ? "0" : "") + n);
  }
  return result.reverse().join(":")
}
</script>
