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

  <infinite-list ref="infiniteList" :context="infiniteListContext" @afterLoad="afterLoad">
    <van-checkbox-group v-model="checked">
      <van-grid :column-num="3" :border="false" :center="false" square gutter="1.5">
        <van-grid-item v-for="(item, index) in infiniteListContext.rows" :key="item.id" clickable
          @click="onPreview(item, index)">
          <van-image fit="cover" :src="item.picUrl" alt="" style="height:100%;" />
          <div class="header-subtitle" v-if="item.fileType == 'video'"
            style="position:absolute;right:0.2rem;bottom:0;color:white;">
            {{config.fmtSecond(item.ext.second)}}</div>

          <van-checkbox :name="item.albumFileId" v-if="batchHandle" style="position:absolute;top:0.2rem;right:0.2rem;"
            @click.stop>
          </van-checkbox>
        </van-grid-item>
      </van-grid>
    </van-checkbox-group>
  </infinite-list>

  <van-uploader v-if="!batchHandle" multiple :after-read="afterRead" accept="image/*,video/*"
    style="position:fixed;bottom:1rem;right:1rem;">
    <van-button icon="plus" type="primary"></van-button>
  </van-uploader>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ImagePreview, Toast, Dialog } from "vant";
import config from "@/config.js";
import InfiniteList from "@/components/InfiniteList.vue";

import httpProxy from "@/http/proxy.js";

const router = useRouter();
const albumId = router.currentRoute.value.params["albumId"];

const infiniteList = ref();
const infiniteListContext = reactive({
  url: `/album/getAlbumFilePage?albumId=${albumId}`,
  params: {},
  rows: [],
})

const albumDetail = reactive({
  name: "",
  picNum: 0,
  videoNum: 0,
});

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
  initPage();
})

// 页面初始化，填充基本信息
const initPage = () => {
  httpProxy({
    url: `/album/getAlbumById?albumId=${albumId}`,
    success: (resp) => {
      Object.assign(albumDetail, resp);
    },
  });
};

// 分页请求完成后，生成图片地址
const afterLoad = rows => {
  rows.forEach((item) => {
    let filename;
    if (item.ext) {
      item.ext = JSON.parse(item.ext);
    }
    if (item.fileType == "image") {
      filename = item.filename;
      item.picUrl = config.getFileUrl(filename, "thumbnail");
    } else if (item.fileType == "video") {
      if (item.ext) {
        filename = item.ext.coverFilename;
        item.picUrl = config.getFileUrl(filename, "thumbnail");
      }
    }
  });
}

const onPreview = (item, index) => {
  if (batchHandle.value) {
    let set = new Set(checked.value);
    if (set.has(item.albumFileId)) {
      set.delete(item.albumFileId);
    } else {
      set.add(item.albumFileId);
    }
    checked.value = Array.from(set);
    return;
  }

  if (item.fileType == 'image') {
    ImagePreview({
      images: infiniteListContext.rows.map((item) => item.picUrl),
      startPosition: index,
    });
  } else if (item.fileType == 'video') {
    let videoUrl = config.getFileUrl(item.filename, "video");
    window.open(videoUrl, "_blank");
  }
};

const afterRead = async (files) => {
  let apiFiles = [];
  if (!files.length) {
    apiFiles.push(files.file);
  } else {
    apiFiles.push(...files.map((item) => item.file));
  }

  let data = new FormData();

  apiFiles.forEach(item => data.append("files", item));

  httpProxy({
    url: `/album/batchUploadFile?albumId=${albumId}`,
    method: "post",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    toast: "正在上传...",
    success: resp => {
      infiniteList.value.onRefresh();
    }
  })
};

const onClickLeft = () => {
  if (batchHandle.value) {
    batchHandle.value = false;
  } else {
    history.back();
  }
};

const onClickDelete = () => {
  Dialog.confirm({
    title: '确定删除？',
    message: '删除后无法恢复，确定删除？',
  }).then(() => {
    httpProxy({
      url: `/album/batchRemoveFile?albumId=${albumId}`,
      method: "post",
      data: checked.value,
      toast: "正在删除...",
      success: resp => {
        batchHandle.value = false;
        infiniteList.value.onRefresh();
      }
    });
  }).catch(() => {
    // on cancel
  });
}
</script>
