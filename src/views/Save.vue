<template>
  <van-nav-bar title="新建相册">
  </van-nav-bar>

  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-field v-model="addAblum.name" placeholder="填写相册名称" :rules="[{ required: true, message: '请填写相册名称' }]"
        size="large" />
      <van-field v-model="addAblum.description" placeholder="描述" />
      <van-field label="封面" input-align="right">
        <template #input>
          <van-uploader v-model="files" :max-count="1" />
        </template>
      </van-field>
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button block type="primary" native-type="submit">
        完成
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';

import httpProxy from "@/http/proxy.js";

const router = useRouter();

const addAblum = reactive({
  name: '',
  description: '',
  file: null,
})
const files = ref([]);

addAblum.file = computed(() => {
  if (files.value.length > 0) {
    return files.value[0].file;
  }
});

const onSubmit = () => {
  httpProxy({
    url: `/album/addAlbum`,
    method: 'post',
    data: addAblum,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    toast: "正在保存...",
    success: resp => {
      router.push(`/`);
    }
  })
}
</script>
