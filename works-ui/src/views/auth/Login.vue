<template>
  <div class="user-layout desktop">
    <div style="position: relative z-index: 999;">
      <a-alert v-if="statusBool" :message="statusMess" :description="statusDesc" :type="statusType" banner show-icon>
        <!-- <template #icon>
          <smile-outlined />
          <smile-outlined v-if="statusType == 'success'" />
          <frown-outlined v-else /> -->
        <!-- </template> -->
      </a-alert>
    </div>
    <div class="user-layout-container" style="position: absolute; z-index: 1">
      <div class="user-layout-header">
        <img src="@/assets/ablestack-logo.png" alt="logo" class="user-layout-logo" />
      </div>

      <a-spin :spinning="spinning">
        <a-form :ref="formRef" layout="horizontal" :model="form" :rules="rules" @finish="onSubmit" class="user-layout-login">
          <a-form-item has-feedback name="id">
            <a-input v-model:value="form.id" :placeholder="$t('placeholder.user.account')" size="large">
              <template #prefix>
                <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item has-feedback name="password">
            <a-input-password v-model:value="form.password" type="password" :placeholder="$t('placeholder.user.password')" size="large" autocomplete="off">
              <template #prefix>
                <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item style="margin-bottom: 0">
            <a-button type="primary" block class="login-button" html-type="submit">
              {{ $t("label.login") }}
            </a-button>
          </a-form-item>
          <!--   언어변환 버튼 start     -->
          <a-dropdown placement="bottomLeft">
            <span>
              <TranslationOutlined class="login-translation" style="font-size: 20px" />
            </span>
            <template #overlay>
              <a-menu :selected-keys="[language]" class="header-dropdown-menu" @click="setLocaleClick">
                <a-menu-item key="ko" value="koKR"> 한국어 </a-menu-item>
                <a-menu-item key="en" value="enUS"> English </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <!--   언어변환 버튼 끝     -->
        </a-form>
      </a-spin>
    </div>
  </div>
  <!-- </a-spin> -->
</template>

<script>
import { defineComponent, reactive, ref } from "vue";
export default defineComponent({
  name: "Login",
  components: {},
  setup() {},
  data() {
    return {
      timer: ref(null),
      spinning: ref(true),
      language: "ko",
      statusBool: ref(true),
      statusMess: ref(this.$t("message.status.check.worksapi")),
      statusDesc: ref(this.$t("message.status.check.desc.wait")),
      statusType: ref("info"),
    };
  },
  mounted() {
    this.language = sessionStorage.getItem("locale") || "ko";
    this.setLocale(this.language);
  },
  created() {
    this.initForm();
    sessionStorage.clear();
    this.serverCheck();
    this.timer = setInterval(() => {
      this.serverCheck();
    }, 10000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    initForm() {
      this.formRef = ref();
      this.form = reactive({});
      this.rules = {
        id: { required: true, trigger: "change", message: this.$t("message.please.enter.your.id") },
        password: { required: true, trigger: "change", message: this.$t("message.please.enter.your.password") },
      };
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
      //this.loadLanguageAsync(localeValue);
    },
    onSubmit() {
      let params = new URLSearchParams();
      this.formRef.value
        .validate()
        .then(() => {
          this.$message.destroy();
          this.$message.loading(this.$t("message.logging"), 0);
          params.append("id", this.form.id);
          params.append("password", this.form.password);
          this.$worksApi
            .post("/api/login", params)
            .then((response) => {
              //console.log(response);
              const data = response.data.result;
              if (response.status === 200 && data.login === true) {
                this.$store.dispatch("loginCommit", response.data);
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("locale", sessionStorage.getItem("locale") == null ? process.env.VUE_APP_I18N_LOCALE : sessionStorage.getItem("locale"));
                sessionStorage.setItem("userName", data.username);
                sessionStorage.setItem("isAdmin", data.isAdmin);
                sessionStorage.setItem("clusterName", data.clusterName);
                sessionStorage.setItem("domainName", data.domainName);

                this.$worksApi
                  .get("/api/v1/configuration")
                  .then((response) => {
                    console.log(response.data);
                    if (response.status === 200) {
                      const dcurl = response.data.result.filter((it) => it.name == "dc.default.url")[0].value;
                      const worksurl = response.data.result.filter((it) => it.name == "works.default.url")[0].value;
                      sessionStorage.setItem("dcurl", dcurl);
                      sessionStorage.setItem("worksurl", worksurl);
                      if (data.username.toLowerCase() === "administrator") {
                        this.$router.push({ name: "Dashboard" });
                      } else {
                        this.$router.push({ name: "UserDesktop" });
                      }
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                this.$message.destroy();
                this.$message.success(this.$t("message.login.completed"), 5);
              } else {
                this.$message.destroy();
                this.$message.error(this.$t("message.login.wrong"));
              }
            })
            .catch((error) => {
              this.$message.destroy();
              console.log(error);
              if (error.response.status === 400) {
                this.$message.error(this.$t("message.login.wrong.400"));
              } else if (error.response.status === 401) {
                this.$message.error(this.$t("message.login.wrong.401"));
              } else {
                this.$message.error(this.$t("message.login.wrong"));
              }
            });
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    serverCheck() {
      this.$worksApi
        .get("/api/serverCheck")
        .then((response) => {
          if (response.status === 200) {
            this.statCheck(response.data.result);
          } else {
            this.setStatView(400, "worksapi", "error", 200);
          }
        })
        .catch((error) => {
          this.setStatView(400, "worksapi", "error", 200);
          // console.log(error.message);
        })
        .finally(() => {});
    },
    async statCheck(data) {
      // console.log(data.Mold, data["Works-DC"], data["Works-Samba"]);
      var res = await this.setStatView(data["Mold"], "moldapi", "info", 200);
      if (!res) return false;
      res = await this.setStatView(data["Works-DC"], "dc", "info", 200);
      if (!res) return false;
      res = await this.setStatView(data["Works-Samba"], "ad", "info", 200);
      if (!res) return false;
      await this.setStatView(200, "all", "success", 500);
    },
    setStatView(stat, cd, type, time) {
      const _t = this;
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          _t.statusMess = _t.$t("message.status.check." + cd);
          if (stat === 200) {
            _t.statusDesc = _t.$t("message.status.check.desc." + cd + ".ok");
            _t.statusType = type;
            if (cd === "all") {
              clearInterval(_t.timer);
              setTimeout(() => {
                _t.spinning = false;
                _t.statusBool = false;
              }, 1200);
            }
            resolve(true);
          } else {
            _t.statusDesc = _t.$t("message.status.check.desc." + cd + ".fail");
            _t.statusType = "error";
            reject(false);
          }
        }, time);
      });
    },
  },
});
</script>

<style lang="less" scoped>
.user-layout {
  height: 100%;

  &-container {
    padding: 3rem 0;
    width: 100%;

    @media (min-height: 600px) {
      top: 50%;
      transform: translateY(-50%);
      margin-top: -50px;
    }
  }
  &-logo {
    width: 400px;
    border-style: none;
    margin: 0 auto 2rem;
    display: block;

    .mobile & {
      max-width: 300px;
      margin-bottom: 1rem;
    }
  }
  button.login-button {
    margin-top: 8px;
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}
.user-layout-login {
  min-width: 260px;
  width: 368px;
  margin: 0 auto;
}
// .user-layout-logo {
//   width: 600px;
//   margin: 0 auto 2rem;
//   border-style: none;
//   display: block;
// }
.login-translation {
  font-size: 20px;
  margin-top: 10px;
}
</style>
