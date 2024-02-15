<template>
  <div style="text-align: center; max-width: 800px">
    <videoPlay
      ref="video"
      style="display: inline-block; max-width: 800px"
      v-bind="options"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from "vue";
import { videoPlay } from "../lib/index.js";

const options = reactive({
  width: "100%",
  height: "450px",
  color: "#409eff",
  muted: false,
  webFullScreen: false,
  autoPlay: false,
  currentTime: 0,
  loop: false,
  mirror: false,
  ligthOff: false,
  volume: 0.3,
  control: true,
  title: "",
  type: "video/mp4",
  src: "https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4",
  poster: "https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/ironMan.jpg",
  controlBtns: [
    "audioTrack",
    "quality",
    "speedRate",
    "volume",
    "setting",
    "pip",
    "pageFullScreen",
    "fullScreen",
  ],
});
const video = ref(null);

nextTick(() => {
  console.log(video.value);
});
</script>

<style scoped>
</style>
