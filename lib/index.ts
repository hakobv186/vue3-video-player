import { App } from 'vue';
import videoPlay from './video-play/main.vue';

export function install(app: App): void {
  app.component(videoPlay.name, videoPlay);
}

videoPlay.install = install;

export { videoPlay };
export default videoPlay as typeof videoPlay & { install: typeof install };
