<template>
  <div
    ref="refSlider"
    class="d-slider"
    @mousedown.stop="mouseDownHandle"
    @contextmenu="contextmenuHandle"
    :class="{ 'is-vertical': props.vertical }"
  >
    <div class="d-slider__runway" @mousemove="mousemoveHandle">
      <div class="d-slider__cursor" :style="hoverStyle" v-show="props.hover">
        <div
          class="d-slider__tips"
          ref="refTips"
          :style="{ left: state.hoverTipsLeft }"
          v-show="props.hoverText"
        >
          {{ props.hoverText }}
        </div>
      </div>
      <div class="d-slider__preload" :style="preloadStyle"></div>
      <div class="d-slider__bar" :style="sliderBarStyle"></div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "DSlider",
};
</script>
<script setup lang="ts">
import { reactive, ref, Ref, computed } from "vue";
import { on, off } from "../utils/dom.ts";
type Nullable<T> = null | T;
const refSlider: Ref<HTMLElement> = ref(null);
const refTips: Ref<Nullable<HTMLElement>> = ref(null);
const props = defineProps({
  modelValue: {
    required: true,
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  hover: { type: Boolean, default: true },
  hoverText: { type: String, default: "" },
  preload: { type: Number, default: 0 },
  size: {
    type: String,
    default: "10px",
  },
});
const emits = defineEmits(["update:modelValue", "change", "onMousemove"]);
const state = reactive({
  dragging: false,
  hoverPosition: 0,
  hoverTipsLeft: "50%",
});

const sliderBarStyle: any = computed(() => {
  let value =
    props.modelValue < 0 ? 0 : props.modelValue > 1 ? 1 : props.modelValue;
  return props.vertical ? `height:${value * 100}%` : `width:${value * 100}%`;
});


const preloadStyle: any = computed(() => {
  let value = props.preload < 0 ? 0 : props.preload > 1 ? 1 : props.preload;
  return props.vertical ? `height:${value * 100}%` : `width:${value * 100}%`;
});

const hoverStyle: any = computed(() => {
  let value =
    state.hoverPosition < 0
      ? 0
      : state.hoverPosition > 1
      ? 1
      : state.hoverPosition;
  return props.vertical ? `bottom:${value * 100}%` : `left:${value * 100}%`;
});

const contextmenuHandle = (ev: MouseEvent) => {
  ev.preventDefault();
};

const mouseDownHandle = (ev: MouseEvent) => {
  if (props.disabled) return;
  ev.preventDefault();
  state.dragging = true;
  setPosition(ev);
  on(window, "mousemove", onDragging);
  on(window, "touchmove", onDragging);
  on(window, "mouseup", onDragEnd);
  on(window, "touchend", onDragEnd);
};

const mousemoveHandle = (ev: MouseEvent) => {
  if (!props.hover) return;
  let val = getPosition(ev);
  emits("onMousemove", ev, val);
  state.hoverPosition = val;
  if (props.vertical) return;

  let refSliderEl = refSlider.value as HTMLButtonElement;

  let refTipsWidth = (refTips.value as HTMLButtonElement).clientWidth / 2;
  let movePositon = ev.clientX - refSliderEl.getBoundingClientRect().left;

  if (movePositon < refTipsWidth) {
    state.hoverTipsLeft = refTipsWidth - movePositon + "px";
  } else if (refSliderEl.clientWidth - movePositon < refTipsWidth) {

    state.hoverTipsLeft =
      refSliderEl.clientWidth - movePositon - refTipsWidth + "px";
  } else {
    state.hoverTipsLeft = "50%";
  }
};


const setPosition = (ev: any) => {
  let value = getPosition(ev);
  emits("update:modelValue", value);
  emits("change", ev, value);
};

const getPosition = (ev: any) => {

  let refSliderEl = refSlider.value as HTMLButtonElement;
  let value = 0;
  if (props.vertical) {

    let clientHeight = refSliderEl.clientHeight;
    value =
      (refSliderEl.getBoundingClientRect().bottom - ev.clientY) / clientHeight;
  } else {
    value =
      (ev.clientX - refSliderEl.getBoundingClientRect().left) /
      refSliderEl.clientWidth;
  }
  return value < 0 ? 0 : value > 1 ? 1 : value;
};

const onDragging = (ev: Event) => {
  setPosition(ev);
};

const onDragEnd = (ev: Event) => {
  if (state.dragging) {
    off(window, "mousemove", onDragging);
    off(window, "touchmove", onDragging);
    off(window, "mouseup", onDragEnd);
    off(window, "touchend", onDragEnd);
    off(window, "contextmenu", onDragEnd);
    setTimeout(() => {
      state.dragging = false;
    }, 0);
  }
};
</script>
<style lang='less' scoped>
.d-slider {
  position: relative;
  .d-slider__runway {
    width: 100%;
    height: v-bind(size);
    background-color: #333333;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
    .d-slider__cursor,
    .d-slider__preload,
    .d-slider__bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }
    .d-slider__cursor {
      display: none; //TODO
      z-index: 1;
      width: 1px;
      background: #fff;
      pointer-events: none;
      .d-slider__tips {
        pointer-events: none;
        color: #fff;
        position: absolute;
        white-space: nowrap;
        z-index: 2;
        bottom: 14px;
        left: 50%;
        padding: 4px;
        box-sizing: border-box;
        display: block;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 3px;
        transform: translateX(-50%);
      }
    }
    &:hover .d-slider__cursor {
      display: block;
    }
    .d-slider__preload {
      background: #717171;
    }
    .d-slider__bar {
      background: linear-gradient(
        to right,
        #52a0fd 0%,
        #00e2fa 80%,
        #00e2fa 100%
      );
      &::before {
        display: block;
        content: "";
        position: absolute;
        right: -6px;
        top: 50%;
        width: 12px;
        height: 12px;
        transition: 0.2s;
        transform: translateY(-50%) scale(1, 1);
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 0 5px #409eff;
      }
    }
  }
  // 垂直模式
  &.is-vertical {
    height: 100%;
    display: inline-block;
    .d-slider__runway {
      position: relative;
      height: 100%;
      width: v-bind(size);
      margin: 0 6px;
      .d-slider__preload,
      .d-slider__bar,
      .d-slider__cursor {
        bottom: 0;
        top: auto;
        width: 100%;
      }
      .d-slider__cursor {
        height: 1px;
      }
      .d-slider__bar {
        &::before {
          top: -6px;
          left: 50%;
          width: 12px;
          height: 12px;
          transform: translateX(-50%) scale(1, 1);
        }
      }
    }
  }
}
</style>
