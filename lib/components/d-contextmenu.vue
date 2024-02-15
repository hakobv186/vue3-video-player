<template>
  <div>
    <transition name="d-fade-in">
      <div class="d-player-dialog" v-if="state.dialogType">
        <div class="d-player-dialog-body">
          <h5 class="d-player-dialog-title">
            {{ state.dialogTitle }}
            <i @click="state.dialogType = false" class="icon icon-close">X</i>
          </h5>
          <!-- Shortcut key description -->
          <ul
            class="d-player-hotkey-panel"
            v-show="state.dialogType == 'hotkey'"
          >
            <li
              class="d-player-hotkey-panel-item"
              v-for="item of hotkeyList"
              :key="item.key"
            >
              <span>{{ item.key }}</span>
              <span>{{ item.label }}</span>
            </li>
          </ul>
          <!-- 色彩调整 -->
          <ul
            class="d-player-filter-panel"
            v-show="state.dialogType == 'filter'"
          >
            <li class="d-player-filter-panel-item">
              <span>saturation</span>
              <d-slider
                class="filter-panel-slider"
                size="5px"
                v-model="filter.saturate"
              ></d-slider>
              <span>{{ Math.round(filter.saturate * 255) }}</span>
            </li>
            <li class="d-player-filter-panel-item">
              <span>brightness</span>
              <d-slider
                class="filter-panel-slider"
                size="5px"
                v-model="filter.brightness"
              ></d-slider>
              <span>{{ Math.round(filter.brightness * 255) }}</span>
            </li>
            <li class="d-player-filter-panel-item">
              <span>Contrast</span>
              <d-slider
                class="filter-panel-slider"
                size="5px"
                v-model="filter.contrast"
              ></d-slider>
              <span>{{ Math.round(filter.contrast * 255) }}</span>
            </li>
            <span
              @click="filterReset"
              title="reset"
              aria-label="reset"
              class="d-player-filter-reset"
              >reset</span
            >
          </ul>
        </div>
      </div>
    </transition>
    <div class="d-player-contextmenu" v-if="state.show">
      <ul class="d-player-contextmenu-body" :style="menuStyle">
        <li :dplayerKeyCode="item.key" v-for="item of menuList" :key="item.key">
          {{ item.label }}
        </li>
      </ul>
      <input class="d-player-copyText" />
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, onMounted, computed, onUnmounted } from "vue";
import { on, off } from "../utils/dom";
import { version } from "../../package.json";
import DSlider from "./d-slider.vue";
const state = reactive({
  show: false,
  dialogType: "",
  dialogTitle: "",
  version: version,
  mouseX: 0,
  mouseY: 0,
});

const menuList = [
  { label: "Video color adjustment", key: "filter" },
  { label: "Shortcut key description", key: "hotkey" },
  { label: "Copy video URL", key: "copy" },
  { label: "Version：" + version, key: "version" },
];
const hotkeyList = [
  { key: "Space", label: "Play / Pause" },
  { key: "→", label: "Fast forward 10s at a time, long press to play at 5x speed" },
  { key: "←", label: "Rewind 5 seconds" },
  { key: "↑", label: "Volume increased by 10%" },
  { key: "↓", label: "Volume increase and decrease by 10%" },
  { key: "Esc", label: "Exit full screen/Exit web page full screen" },
  { key: "F", label: "Full screen/exit full screen" },
];
const filter = reactive({
  saturate: 0.392,
  brightness: 0.392,
  contrast: 0.392,
});

// 菜单坐标
const menuStyle = computed(() => ({
  left: state.mouseX + "px",
  top: state.mouseY + "px",
}));

watch(filter, (val) => {
  let dPlayerVideoMain = document.querySelector("#dPlayerVideo");
  let saturate = (val.saturate * 2.55).toFixed(2);
  let brightness = (val.brightness * 2.55).toFixed(2);
  let contrast = (val.contrast * 2.55).toFixed(2);
  dPlayerVideoMain.style.filter = `saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`;
});
const filterReset = () => {
  filter.saturate = 0.392;
  filter.brightness = 0.392;
  filter.contrast = 0.392;
};
const keydownHandle = (ev) => {
  // ev.preventDefault()
  if (ev.key == "Escape") {
    contextmenuHide(0);
  }
};
// 显示菜单
const contextmenuShow = (ev) => {
  ev.preventDefault();
  on(window, "keydown", keydownHandle); //Enable shortcut keys
  on(window, "click", contextmenuHide); //Enable click keys
  let refPlayerWrap = document.querySelector("#refPlayerWrap");
  let clientWidth = refPlayerWrap.clientWidth;
  let clientHeight = refPlayerWrap.clientHeight;
  state.mouseX = ev.clientX - refPlayerWrap.getBoundingClientRect().left;
  if (clientWidth - state.mouseX < 130) {
    state.mouseX = state.mouseX + (clientWidth - state.mouseX - 130);
    // state.mouseX = state.mouseX - (clientWidth - state.mouseX)
  }

  state.mouseY = ev.clientY - refPlayerWrap.getBoundingClientRect().top;
  state.show = true;
};

// Hide menu
const contextmenuHide = (ev) => {
  let tagName = ev.target.nodeName == "LI";
  let keycode =
    ev.target.attributes.dplayerKeyCode &&
    ev.target.attributes.dplayerKeyCode.value;
  let hotKeyArr = menuList.map((item) => item.key);
  if (tagName && hotKeyArr.includes(keycode)) {
    state.dialogTitle = ev.target.innerText;
    state.dialogType = keycode;
    if (keycode == "copy") {
      let copyText = document.querySelector(".d-player-copyText");
      copyText.value = window.location.href;
      copyText.select();
      document.execCommand("copy");
      state.dialogType = "";
    } else if (keycode == "version") {
      state.dialogType = "";
    }
  }
  state.show = false;
  // Uninstall shortcut key
  off(window, "keydown", keydownHandle);
  off(window, "click", contextmenuHide); //启用点击键
};

onMounted(() => {
  let refPlayerWrap = document.querySelector("#refPlayerWrap");
  // Uninstall shortcut key
  off(window, "keydown", keydownHandle);
  off(window, "click", contextmenuHide); //启用点击键
  off(refPlayerWrap, "contextmenu", contextmenuShow);
  // 开启右键菜单
  on(refPlayerWrap, "contextmenu", contextmenuShow);
});
onUnmounted(() => {
  let refPlayerWrap = document.querySelector("#refPlayerWrap");
  off(window, "keydown", keydownHandle);
  off(window, "click", contextmenuHide); //启用点击键
  off(refPlayerWrap, "contextmenu", contextmenuShow);
});
</script>

<style scoped lang='less'>
@import "../style/reset.less";
@import "../style/base.less";
@import "../style/animate.less";
@import "../style/transition.less";
.d-player-contextmenu,
.d-player-dialog {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 50px;
  width: 100%;
  z-index: 5;
}
.d-player-contextmenu {
  .d-player-copyText {
    opacity: 0;
  }
  .d-player-contextmenu-body {
    position: absolute;
    border-radius: 5px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    color: #efefef;
    padding: 0;
    text-align: left;
    width: 130px;
    box-sizing: border-box;
    padding: 5px 0;
    li {
      padding: 8px 20px;
      margin: 0;
      cursor: pointer;
      transition: 0.2s;
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
.d-player-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  .d-player-dialog-body {
    background-color: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 5px;
    color: #fff;
    min-width: 200px;
    padding: 0 0 10px;
    .d-player-dialog-title {
      position: relative;
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      padding: 12px 0px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      margin-bottom: 10px;
      .icon-close {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
      }
    }
    // 快捷键说明
    .d-player-hotkey-panel {
      font-size: 12px;
      color: #eee;
      padding-right: 40px;
      .d-player-hotkey-panel-item {
        line-height: 26px;
        span {
          text-align: center;
          display: inline-block;
          width: 120px;
        }
        span:nth-child(2) {
          color: #999;
          width: 160px;
        }
      }
    }
    // 过滤镜
    .d-player-filter-panel {
      width: 320px;
      padding: 0 20px;
      .d-player-filter-reset {
        cursor: pointer;
        margin-top: 10px;
        padding: 3px 20px;
        display: inline-block;
        border-radius: 2px;
        font-size: 12px;
        background: rgba(133, 133, 133, 0.5);
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
      .d-player-filter-panel-item {
        height: 32px;
        display: flex;
        align-items: center;
        .filter-panel-slider {
          width: 100%;
          :deep(.d-slider__runway) {
            background-color: #999;
            .d-slider__bar:before {
              width: 8px;
              height: 8px;
              box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.5);
            }
          }
        }
        span {
          font-size: 12px;
          display: block;
          width: 80px;
          text-align: center;
        }
      }
    }
  }
}
</style>
