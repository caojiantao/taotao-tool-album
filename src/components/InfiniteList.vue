<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" success-text="刷新成功"
    style="margin-top: var(--van-nav-bar-height)">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
      style="min-height: calc(100vh - var(--van-nav-bar-height));">
      <slot></slot>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

import $http from "@/http";

const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);

const props = defineProps({
  context: {
    url: "",
    params: {},
    rows: [],
  }
});
// 初始值 rows json 格式，在 refresh 时重置
let initRows = [];

const emits = defineEmits(["afterLoad"])

const page = reactive({
  current: 1,
  size: 10,
});

onMounted(() => {
  initRows = JSON.stringify(props.context.rows);
  onRefresh();
});

const onRefresh = () => {
  refreshing.value = true;
  finished.value = false;
  loading.value = true;
  page.current = 1;
  onLoad();
};

const onLoad = () => {
  const context = props.context;
  Object.assign(page, context.params);
  $http({
    url: context.url,
    params: page,
  })
    .then((resp) => {
      if (refreshing.value) {
        context.rows = JSON.parse(initRows);
        refreshing.value = false;
      }
      if (resp.rows.length == 0) {
        finished.value = true;
        return;
      }
      emits("afterLoad", resp.rows);
      context.rows.push(...resp.rows);
    })
    .finally(() => {
      loading.value = false;
      page.current++;
    });
};

defineExpose({
  // 暴露整体刷新方法
  onRefresh,
})
</script>
