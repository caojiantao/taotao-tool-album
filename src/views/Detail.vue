<template>
  <van-nav-bar v-if="batchHandle" fixed left-text="取消" @click-left="onClickLeft">
    <template #right>
      <van-icon name="delete-o" @click="onClickDelete" />
    </template>
  </van-nav-bar>
  <van-nav-bar v-else fixed left-text="返回" left-arrow @click-left="onClickLeft">
    <template #title>
      <div class="header-title">{{ albumDetail.name }}</div>
      <div class="header-subtitle">
        {{ albumDetail.picNum }}图片 {{ albumDetail.videoNum }}视频
      </div>
    </template>
    <template #right>
      <van-popover v-model:show="showPopover" :actions="actions" @select="onSelect" placement="bottom-end"
        :offset="[10, 15]">
        <template #reference>
          <van-icon name="ellipsis" />
        </template>
      </van-popover>
    </template>
  </van-nav-bar>

  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" success-text="刷新成功"
    style="margin-top: var(--van-nav-bar-height)">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
      style="min-height: calc(100vh - var(--van-nav-bar-height));">
      <van-checkbox-group v-model="checked">
        <van-grid :column-num="3" :border="false" :center="false" square gutter="1.5">
          <van-grid-item v-for="(item, index) in rows" :key="item.id" clickable @click="onClick(item, index)">
            <van-image fit="cover" :src="item.picUrl" alt="" style="height:100%;" />
            <div class="header-subtitle" v-if="item.fileType == 'video'"
              style="position:absolute;right:0.2rem;bottom:0;color:white;">
              {{fmtSecond(item.ext.second)}}</div>

            <van-checkbox :name="item.id" v-if="batchHandle" style="position:absolute;top:0.2rem;right:0.2rem;"
              @click.stop>
            </van-checkbox>
          </van-grid-item>
        </van-grid>
      </van-checkbox-group>
    </van-list>
  </van-pull-refresh>

  <van-uploader multiple :after-read="afterRead" accept="image/*,video/*"
    style="position:fixed;bottom:1rem;right:1rem;">
    <van-button icon="plus" type="primary"></van-button>
  </van-uploader>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ImagePreview, Toast } from "vant";
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
  current: 1,
  size: 10,
});

const rows = ref([]);

const showPopover = ref(false);

const batchHandle = ref(false);
const checked = ref([]);

const actions = [
  { text: '首页', code: 'go-home' },
  { text: '编辑相册', code: 'edit-album' },
  { text: '批量管理', code: 'batch-handle' },
];
const onSelect = (action) => {
  if (action.code == 'go-home') {
    router.push('/')
  } else if (action.code == 'batch-handle') {
    batchHandle.value = true;
  }
}

// 当取消批量管理模式，重置复选框组选中
watch(batchHandle, (newValue, oldValue) => {
  if (!newValue) {
    checked.value = [];
  }
})

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
          item.picUrl = config.getPicUrl(filename);
        } else if (item.fileType == "video") {
          if (item.ext) {
            filename = item.ext.coverFilename;
            item.picUrl = config.getPicUrl(filename);
          }
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

const onClick = (item, index) => {
  if (batchHandle.value) {
    let set = new Set(checked.value);
    if (set.has(item.id)) {
      set.delete(item.id);
    } else {
      set.add(item.id);
    }
    checked.value = Array.from(set);
    return;
  }

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

const onClickLeft = () => {
  if (batchHandle) {
    batchHandle.value = false;
  } else {
    history.back();
  }
};

const onClickDelete = () => {
  Toast.loading({
    message: '正在删除...',
    forbidClick: true,
    overlay: true,
    duration: 0,
  });
  $http({
    url: `/album/batchRemoveFile?albumId=${albumId}`,
    method: "post",
    data: checked.value,
  })
    .then((resp) => {
      batchHandle.value = false;

      Toast.clear();
      onRefresh();
    })
    .catch((e) => { });
}
</script>
