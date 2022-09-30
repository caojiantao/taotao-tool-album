<template>
  <video :src="src" style="width: 100%" controls autoplay></video>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

import config from "@/config.js";

const router = useRouter();

const src = ref("");

onMounted(() => {
  let query = router.currentRoute.value.query;
  src.value = config.getPicUrl(query.filename);
});
</script>
