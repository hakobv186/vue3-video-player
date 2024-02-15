<template>
  <div
    ref="refPlayerWrap"
    id="refPlayerWrap"
    class="d-player-wrap"
    @mousemove="mouseMovewWarp"
    :class="{
      'web-full-screen': state.webFullScreen,
      'is-lightoff': state.lightOff,
      'd-player-wrap-hover':
        state.playBtnState == 'play' || state.isVideoHovering,
    }"
  >
    <div class="d-player-video" id="dPlayerVideo">
      <video
        ref="refdVideo"
        class="d-player-video-main"
        id="dPlayerVideoMain"
        :controls="isMobile && state.speed ? true : false"
        :class="{ 'video-mirror': state.mirror }"
        :webkit-playsinline="props.playsinline"
        :playsinline="props.playsinline"
        v-bind="videoEvents"
        :volume="state.volume"
        :muted="state.muted"
        :loop="state.loop"
        :preload="preload"
        width="100%"
        height="100%"
        :src="props.src"
        :poster="props.poster"
      >
        Your browser does not support the Video tag.
      </video>
    </div>

    <transition name="d-fade-in">
      <div class="d-player-lightoff" v-show="state.lightOff"></div>
    </transition>
    <d-player-top :title="props.title" v-if="state.fullScreen"></d-player-top>
    <div class="d-player-state" v-if="!isMobile">
      <transition name="d-scale-out">
        <div class="d-play-btn" v-show="state.playBtnState == 'play'">
          <d-icon icon="icon-play" :size="40"></d-icon>
        </div>
      </transition>
      <d-status :state="state"></d-status>
    </div>
    <input
      v-if="!isMobile"
      type="input"
      readonly="readonly"
      ref="refInput"
      @dblclick="toggleFullScreenHandle"
      @keyup.f="toggleFullScreenHandle"
      @keyup.esc="state.webFullScreen = false"
      @click="togglePlay"
      @keydown.space="togglePlay"
      @keyup="keypress"
      @keydown.arrow-left="keydownLeft"
      @keydown.arrow-up.arrow-down="volumeKeydown"
      @keydown="keypress"
      class="d-player-input"
      maxlength="0"
    />
    <d-loading :loadType="state.loadStateType" />
    <d-contextmenu />
    <div
      class="d-player-control"
      ref="refPlayerControl"
      v-if="!isMobile && state.control"
    >
      <div class="d-control-progress">
        <d-slider
          class="d-progress-bar"
          @onMousemove="onProgressMove"
          @change="progressBarChange"
          :disabled="!state.speed"
          :hoverText="state.progressCursorTime"
          v-model="state.playProgress"
          :preload="state.preloadBar"
        ></d-slider>
      </div>

      <div class="d-control-tool" @click="inputFocusHandle">
        <div class="d-tool-bar">
          <div class="d-tool-item" @click="togglePlay">
            <d-icon size="24" :icon="`icon-${state.playBtnState}`"></d-icon>
          </div>
          <div
            class="d-tool-item d-tool-time audioTrack-btn"
            v-if="props.controlBtns.includes('audioTrack')"
          >
            <span>{{ state.currentTime }}</span>
            <span style="margin: 0 3px">/</span>
            <span class="total-time">{{ state.totalTime }}</span>
          </div>
        </div>
        <div class="d-tool-bar">
          <div
            class="d-tool-item quality-btn"
            v-if="
              state.qualityLevels.length &&
              props.controlBtns.includes('quality')
            "
          >
            {{
              state.qualityLevels.length &&
              (state.qualityLevels[state.currentLevel] || {}).height
            }}P
            <div class="d-tool-item-main">
              <ul class="speed-main" style="text-align: center">
                <li
                  :class="{ 'speed-active': state.currentLevel == index }"
                  @click="qualityLevelsHandle(row, index)"
                  v-for="(row, index) of state.qualityLevels"
                  :key="row"
                >
                  {{ row.height }}P
                </li>
              </ul>
            </div>
          </div>
          <div
            class="d-tool-item speedRate-btn"
            v-if="props.controlBtns.includes('speedRate')"
          >
            {{ state.speedActive == "1.0" ? "Double speed" : state.speedActive + "x" }}
            <div class="d-tool-item-main">
              <ul class="speed-main">
                <li
                  :class="{ 'speed-active': state.speedActive == row }"
                  @click="playbackRate(row)"
                  v-for="row of state.speedRate"
                  :key="row"
                >
                  {{ row }}x
                </li>
              </ul>
            </div>
          </div>
          <div
            class="d-tool-item volume-btn"
            v-if="props.controlBtns.includes('volume')"
          >
            <div class="d-tool-item-main volume-box" style="width: 52px">
              <div class="volume-main" :class="{ 'is-muted': state.muted }">
                <span class="volume-text-size"
                  >{{ state.muted ? 0 : ~~(state.volume * 100) }}%</span
                >
                <d-slider
                  @change="state.muted = false"
                  :hover="false"
                  size="5px"
                  :vertical="true"
                  v-model="state.volume"
                ></d-slider>
              </div>
            </div>
            <span @click="mutedHandler" style="display: flex">
              <d-icon
                size="20"
                :icon="`icon-volume-${
                  state.volume == 0 || state.muted
                    ? 'mute'
                    : state.volume > 0.5
                    ? 'up'
                    : 'down'
                }`"
              ></d-icon>
            </span>
          </div>
          <div
            class="d-tool-item setting-btn"
            v-if="props.controlBtns.includes('setting')"
          >
            <d-icon size="20" class="rotateHover" icon="icon-settings"></d-icon>
            <div class="d-tool-item-main">
              <ul class="speed-main">
                <li>
                  Mirror screen
                  <d-switch @change="mirrorChange" v-model="state.mirror" />
                </li>
                <li>
                  Loop
                  <d-switch @change="loopChange" v-model="state.loop" />
                </li>
                <li>
                  lights off mode
                  <d-switch @change="lightOffChange" v-model="state.lightOff" />
                </li>
              </ul>
            </div>
          </div>
          <div
            class="d-tool-item pip-btn"
            v-if="props.controlBtns.includes('pip')"
            @click="requestPictureInPictureHandle"
          >
            <d-icon size="20" icon="icon-pip"></d-icon>
            <div class="d-tool-item-main">picture within picture</div>
          </div>
          <div
            class="d-tool-item pip-btn"
            v-if="props.controlBtns.includes('pageFullScreen')"
            @click="state.webFullScreen = !state.webFullScreen"
          >
            <d-icon size="20" icon="icon-web-screen"></d-icon>
            <div class="d-tool-item-main">Web page full screen</div>
          </div>
          <div
            class="d-tool-item fullScreen-btn"
            v-if="props.controlBtns.includes('fullScreen')"
            @click="toggleFullScreenHandle"
          >
            <div class="d-tool-item-main">Full screen</div>
            <d-icon size="20" icon="icon-screen"></d-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "vue3VideoPlay",
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { reactive, ref, Ref, onMounted, useAttrs, watch, nextTick } from "vue";
import { debounce } from "throttle-debounce";
import Hls2 from "hls.js";
import DIcon from "../components/d-icon.vue";
import DPlayerTop from "../components/d-player-top.vue";
import DStatus from "../components/d-status.vue";
import DSwitch from "../components/d-switch.vue";
import DLoading from "../components/d-loading.vue";
import DSlider from "../components/d-slider.vue";
import DContextmenu from "../components/d-contextmenu.vue";
import {
  hexToRgba,
  timeFormat,
  requestPictureInPicture,
  toggleFullScreen,
  isMobile,
  firstUpperCase,
} from "../utils/util";
const Hls = new Hls2({ fragLoadingTimeOut: 2000 });
import { videoEmits, defineProps } from "./plugins/index";
const props = defineProps(defineProps);
const emits = defineEmits([
  ...videoEmits,
  "mirrorChange",
  "loopChange",
  "lightOffChange",
]);

const refPlayerWrap: Ref<HTMLElement> = ref(null);
const refdVideo: Ref<HTMLElement> = ref(null);
const refPlayerControl: Ref<HTMLElement> = ref(null);
const refInput: Ref<HTMLElement> = ref(null);
const state = reactive({
  dVideo: null,
  ...props,
  muted: props.muted,
  playBtnState: props.autoPlay ? "pause" : "play",
  loadStateType: "loadstart",
  fullScreen: false,
  handleType: "",
  currentTime: "00:00:00",
  preloadBar: 0,
  totalTime: "00:00:00",
  isVideoHovering: true,
  speedActive: "1.0",
  playProgress: 0,
  isMultiplesPlay: false,
  longPressTimeout: null,
  progressCursorTime: "00:00:00",
  qualityLevels: [],
  currentLevel: 0,
});
const compose =
  (...args) =>
  (value) =>
    args.reverse().reduce((acc, fn) => fn(acc), value);
const videoEvents = videoEmits.reduce((events, emit) => {
  let name = `on${firstUpperCase(emit)}`;
  events[name] = (ev) => {
    state.loadStateType = emit;
    emits(emit, ev);
  };

  return events;
}, {});
videoEvents["onCanplay"] = compose(videoEvents["onCanplay"], () => {
  if (state.playBtnState != "play") {
    state.dVideo.play();
  }
  if (state.autoPlay) {
    state.dVideo.play();
    state.playBtnState = "pause";
  }
});
videoEvents["onEnded"] = compose(videoEvents["onEnded"], () => {
  state.playBtnState = "replay";
});

videoEvents["onDurationchange"] = (ev) => {
  emits("durationchange", ev);
  if (props.currentTime != 0) {
    state.dVideo.currentTime = props.currentTime;
  }

  videoEvents.onTimeupdate(ev);
};

videoEvents["onProgress"] = (ev) => {
  emits("progress", ev);
  let duration = ev.target.duration;
  let length = ev.target.buffered;
  let end = ev.target.buffered.length && ev.target.buffered.end(length - 1);
  state.preloadBar = end / duration;
};


videoEvents["onTimeupdate"] = (ev) => {
  emits("timeupdate", ev);
  let duration = ev.duration || ev.target.duration || 0;
  let currentTime = ev.currentTime || ev.target.currentTime;
  state.playProgress = currentTime / duration;
  state.currentTime = timeFormat(currentTime);
  state.totalTime = timeFormat(duration);
};

videoEvents["onError"] = compose(videoEvents["onError"], () => {
  state.playBtnState = "replay";
});


let attrs = useAttrs();
for (let emit in attrs) {
  videoEvents[emit] = attrs[emit];
}


const hexToRgbaColor = hexToRgba(state.color);

const clearHandleType = debounce(500, () => {
  state.handleType = "";
});

const volumeKeydown = (ev) => {
  ev.preventDefault();
  if (ev.code == "ArrowUp") {
    state.volume = state.volume + 0.1 > 1 ? 1 : state.volume + 0.1;
  } else {
    state.volume = state.volume - 0.1 < 0 ? 0 : state.volume - 0.1;
  }
  state.muted = false;
  state.handleType = "volume";
  clearHandleType();
};
const keydownLeft = (ev) => {
  if (!props.speed) return;
  state.dVideo.currentTime =
    state.dVideo.currentTime < 10 ? 0.1 : state.dVideo.currentTime - 10;
  videoEvents.onTimeupdate(state.dVideo);
  playHandle();
};
const keypress = (ev) => {
  ev.preventDefault();
  let pressType = ev.type;
  if (ev.key == "ArrowRight") {
    playHandle();
    if (pressType == "keyup") {
      clearTimeout(state.longPressTimeout);
      if (!props.speed && !state.longPressTimeout) return;
      if (state.isMultiplesPlay) {
        state.dVideo.playbackRate = state.speedActive;
        state.isMultiplesPlay = false;
      } else {
        state.dVideo.currentTime = state.dVideo.currentTime + 10;
        videoEvents.onTimeupdate(state.dVideo);
      }
    } else if (pressType == "keydown") {
      if (!props.speed) return;
      if (state.isMultiplesPlay) {
        clearTimeout(state.longPressTimeout);
      }
      state.longPressTimeout = setTimeout(() => {
        state.isMultiplesPlay = true;
        state.dVideo.playbackRate = 5;
        state.handleType = "playbackRate";
        clearHandleType();
      }, 500);
    }
  }
};

const inputFocusHandle = () => {
  if (isMobile) return;
  refInput.value.focus();
};

const playHandle = () => {
  state.loadStateType = "play";
  state.dVideo.play().catch(() => {
    state.dVideo.load()
    setTimeout(() => {
      state.dVideo.play().catch(() => {
        state.playBtnState = "replay";
        state.loadStateType = "error";
      })
    },200)
  });
  state.playBtnState = "pause";
};
const pauseHandle = () => {
  state.dVideo.pause();
  state.playBtnState = "play";
};

const togglePlay = (ev) => {
  if (ev) ev.preventDefault();
  if (state.playBtnState == "play" || state.playBtnState == "replay") {
    playHandle();
  } else if (state.playBtnState == "pause") {
    pauseHandle();
  }
};

const mutedHandler = () => {
  state.muted = !state.muted;
  if (state.volume == 0) {
    state.volume = 0.05;
  }
};

const progressBarChange = (ev: Event, val) => {
  let duration = state.dVideo.duration || state.dVideo.target.duration; // 媒体总长
  state.dVideo.currentTime = duration * val;
  if (state.playBtnState == "play") {
    state.dVideo.play();
    state.playBtnState = "pause";
  }
};
const onProgressMove = (ev, val) => {
  state.progressCursorTime = timeFormat(state.dVideo.duration * val);
};

const hideControl = debounce(2500, () => {
  state.isVideoHovering = false;
});

const mouseMovewWarp = (ev) => {
  state.isVideoHovering = true;
  hideControl();
};

const qualityLevelsHandle = (row, index) => {
  Hls.currentLevel = index;
  state.currentLevel = index;
};
const playbackRate = (row) => {
  state.speedActive = row;
  state.dVideo.playbackRate = row;
};
const mirrorChange = (val) => {
  emits("mirrorChange", val, state.dVideo);
};
const loopChange = (val) => {
  emits("loopChange", val, state.dVideo);
};
const lightOffChange = (val) => {
  emits("lightOffChange", val, state.dVideo);
};

const requestPictureInPictureHandle = () => {
  requestPictureInPicture(state.dVideo);
};
const toggleFullScreenHandle = () => {
  state.fullScreen = toggleFullScreen(refPlayerWrap.value);
};

const init = (): void => {
  if (!state.dVideo.canPlayType(props.type)) {
    console.error(
      "vue3-video-play: Format not supported,Check the [type] parameter"
    );
  }
  if (
    state.dVideo.canPlayType(props.type) ||
    state.dVideo.canPlayType("application/vnd.apple.mpegurl")
  ) {
    state.muted = props.autoPlay;
  }

  else if (Hls2.isSupported()) {
    Hls.detachMedia();
    Hls.attachMedia(state.dVideo);
    Hls.on(Hls2.Events.MEDIA_ATTACHED, () => {
      Hls.loadSource(props.src);
      Hls.on("hlsManifestParsed", (ev, data) => {
        state.currentLevel = data.level;
        state.qualityLevels = data.levels || [];
      });
    });

    Hls.on("hlsLevelSwitching", (ev, data) => {
      console.log("LEVEL_SWITCHING");
    });
    Hls.on("hlsLevelSwitched", (ev, data) => {
      state.currentLevel = data.level;
      console.log("LEVEL_SWITCHED");
    });
  }
};

watch(
  () => props.src,
  () => {
    nextTick(() => {
      init();
    });
  },
  { immediate: true }
);
onMounted(() => {
  state.dVideo = refdVideo;
  inputFocusHandle();
});
defineExpose({
  play: playHandle,
  pause: pauseHandle,
  togglePlay,
});
</script>


<style lang="less" scoped>
@import "../style/reset.less";
@import "../style/transition.less";
@import "../style/animate.less";
@import "../style/base.less";
.d-player-wrap {
  --primary-color: v-bind(hexToRgbaColor);
  width: v-bind(width);
  height: v-bind(height);
}
@import "../style/vPlayer.less";
</style>
