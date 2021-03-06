import { createApp, h } from "vue";
import App from "./App.vue";

const app = createApp({
  render: () => h(App),
});

import router from "./router";
import VueCryptojs from "vue-cryptojs";
import Antd from "ant-design-vue";
import store from "./store";
import i18n from "./locales";
import "ant-design-vue/dist/antd.css";
import iconsUse from "./icons_use";
import { worksApi } from "@/api";
app.config.globalProperties.$worksApi = worksApi;

app
  .use(iconsUse)
  .use(router)
  .use(Antd)
  .use(VueCryptojs)
  .use(store)
  .use(i18n)
  .mount("#app");
