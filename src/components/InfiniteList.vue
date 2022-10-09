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
  context: {}
});
const emits = defineEmits(["initPage", "afterLoad"])

const page = reactive({
  current: 1,
  size: 10,
});

onMounted(() => {
  Object.assign(page, props.context.params);
  onRefresh();
});

const onRefresh = () => {
  refreshing.value = true;
  finished.value = false;
  loading.value = true;
  page.current = 1;
  emits("initPage");
  onLoad();
};

const onLoad = () => {
  const context = props.context;
  $http({
    url: context.url,
    params: page,
  })
    .then((resp) => {
      if (refreshing.value) {
        context.rows = [];
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
</script>
