<template>
  <a-row class="user-menu">
    <a-col :flex="1">
      <menu-unfold-outlined v-if="state.collapsed" class="menu-collapsed" @click="setCollapsed()" />
      <menu-fold-outlined v-else class="menu-collapsed" @click="setCollapsed()" />
    </a-col>
    <a-col :flex="4" class="header-col-right">
      <span class="header-col"> 【 {{ $t("label.cluster") }} : {{ clusterName }} ㅣ {{ $t("label.domain") }} : {{ domainName }} 】 </span>
      <a-dropdown placement="bottom">
        <span class="header-col">
          <TranslationOutlined />
        </span>
        <template #overlay>
          <a-menu :selected-keys="[language]" class="header-dropdown-menu" @click="setLocaleClick">
            <a-menu-item key="ko" value="koKR"> 한국어 </a-menu-item>
            <a-menu-item key="en" value="enUS"> English </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown placement="bottom">
        <span class="header-col">
          <UserOutlined />
          {{ userName }}
        </span>
        <template #overlay>
          <a-menu class="header-dropdown-menu">
            <a-menu-item key="1" @click="userinfo">
              <UserOutlined />
              <span style="margin: 10px">{{ $t("label.profile") }}</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="2" @click="logoutSubmit">
              <LogoutOutlined />
              <span style="margin: 10px">{{ $t("label.logout") }}</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-col>
  </a-row>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";
import { axiosLogout } from "@/api/index";
export default defineComponent({
  name: "UserHeader",
  components: {},
  props: {
    collapsed: Boolean,
  },
  emits: ["setCollapsed"],
  setup(props) {
    const state = reactive({
      collapsed: ref(props.collapsed),
    });
    return {
      state,
    };
  },
  data() {
    return {
      language: sessionStorage.getItem("locale") || "ko",
      username: ref(""),
    };
  },
  created() {
    // const res = await axiosUserDetail()
    // if(res.status === 200){
    //   this.$store.dispatch("loginCommit",res.data);
    //   this.state.userID = res.data.result.name;
    // }
    this.userName = sessionStorage.getItem("userName");
    this.clusterName = sessionStorage.getItem("clusterName");
    this.domainName = sessionStorage.getItem("domainName");
  },
  methods: {
    setCollapsed() {
      this.state.collapsed = !this.state.collapsed;
      this.$emit("setCollapsed");
    },
    setLocaleClick(e) {
      let localeValue = e.key;
      if (!localeValue) {
        localeValue = "ko";
      }
      this.setLocale(localeValue);
    },
    setLocale(localeValue) {
      this.language = localeValue;
      this.$locale = localeValue;
      this.$i18n.locale = localeValue;
      sessionStorage.setItem("locale", localeValue);
    },
    async logoutSubmit() {
      const res = await axiosLogout();
      if (res.data.result.login === false || res.data.result.status > 200) {
        this.$message.success(this.$t("message.logout.success"), 5);
        await this.$store.dispatch("logoutCommit");
        await this.$router.push({ name: "Login" });
      }
    },
    userinfo() {
      this.$router.push({ path: "/userDetail" });
    },
    // setLanguage(lang, message) {
    //   if (i18n) {
    //     i18n.locale = lang;
    //     if (message && Object.keys(message).length > 0) {
    //       i18n.setLocaleMessage(lang, message);
    //     }
    //   }
    //   if (!this.loadedLanguage.includes(lang)) {
    //     this.loadedLanguage.push(lang);
    //   }
    //   if (message && Object.keys(message).length > 0) {
    //     messages[lang] = message;
    //   }
    // },
  },
});
</script>

<style scoped></style>
