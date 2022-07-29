<template>
  <a-row type="flex">
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
            <a-menu-item key="1" @click="accountInfo">
              <UserOutlined />
              <span style="margin: 10px"> {{ $t("label.profile") }} </span>
            </a-menu-item>
            <a-menu-item key="2" @click="dcConWebClient">
              <control-outlined />
              <span style="margin: 10px"> {{ $t("label.dcvm.connect") }}</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="3" @click="logoutSubmit">
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
  name: "AdminHeader",
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
      cryptKey: "IgmTQVMISq9t4Bj7iRz7kZklqzfoXuq1",
      cryptIv: "zxy0123456789abc",
      language: sessionStorage.getItem("locale") || "ko",
      userName: ref(""),
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
    accountInfo() {
      this.$router.push({ path: "/accountDetail/" + this.userName });
    },
    dcConWebClient() {
      const liteParamArr = {};
      liteParamArr["client-name"] = "ABLESTACK Works";
      liteParamArr["hostname"] = sessionStorage.getItem("dcurl");
      liteParamArr["password"] = "Ablecloud1!";
      liteParamArr["username"] = sessionStorage.getItem("userName");
      liteParamArr["domain"] = sessionStorage.getItem("domainName");
      // liteParamArr["enable-touch"] = true;
      console.log(liteParamArr);

      const cipher = this.$CryptoJS.AES.encrypt(JSON.stringify(liteParamArr), this.$CryptoJS.enc.Utf8.parse(this.cryptKey), {
        iv: this.$CryptoJS.enc.Utf8.parse(this.cryptIv), // [Enter IV (Optional) 지정 방식]
        padding: this.$CryptoJS.pad.Pkcs7,
        mode: this.$CryptoJS.mode.CBC, // [cbc 모드 선택]
      });
      const encrypted = btoa(cipher.toString());
      window.open("/clientdc/" + encrypted, "_blank");
    },
  },
});
</script>

<style scoped></style>
<style>
.header-col-right {
  text-align: right;
}
.header-col {
  font-size: 16px;
  margin-right: 20px;
}

.header-dropdown-menu {
  width: 110%;
}
.menu-collapsed {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.menu-collapsed:hover {
  color: #1890ff;
}
.ant-dropdown-menu-item-selected,
.ant-dropdown-menu-submenu-title-selected {
  color: #1890ff !important;
  background-color: #e6f7ff !important;
}
.ant-dropdown-menu-item:hover,
.ant-dropdown-menu-submenu-title:hover {
  color: #1890ff !important;
  background-color: #e6f7ff !important;
}
</style>
