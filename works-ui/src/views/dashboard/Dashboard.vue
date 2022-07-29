<template>
  <div style="width: 100%">
    <a-row id="content-header-row">
      <a-col flex="100%" class="dashboard-a-col-one">
        <a-button type="primary" ghost shape="round" size="medium" @click="refresh(true)">
          <template #icon><ReloadOutlined /></template>
          {{ $t("label.fetch.latest") }}
        </a-button>
      </a-col>
    </a-row>
  </div>
  <div style="width: 100%; padding: 10px">
    <a-spin :spinning="spinning" size="large">
      <a-row>
        <a-col flex="100%">
          <a-row :gutter="24" type="flex">
            <a-col flex="100%" class="dashboard-a-col">
              <a-card :loading="loading" :title="$t('label.status.server')">
                <a-steps :current="dashboardStep" :status="stepStatus">
                  <a-step :title="$t('label.status.worksapi')" :description="descStep0" />
                  <a-step :title="$t('label.status.mold')" :description="descStep1" />
                  <a-step :title="$t('label.status.dc')" :description="descStep2" />
                  <a-step :title="$t('label.status.ad')" :description="descStep3" />
                  <!-- <a-step :title="$t('label.status.guac')" :description="descStep4" /> -->
                </a-steps>
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>

      <!-- <a-row>
        <a-col flex="100%">
          <a-row :gutter="12" type="flex">
            <a-col flex="25%" class="dashboard-a-col">
              <a-card
                :title="$t('label.status.dc')"
                class="dashboard-a-card-cl"
                hoverable
              >
                <a-progress
                  :stroke-color="{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }"
                  type="circle"
                  :percent="100"
                  :format="() => 'OK'"
                />
              </a-card>
            </a-col>
            <a-col flex="25%" class="dashboard-a-col">
              <a-card
                :title="$t('label.status.ad')"
                class="dashboard-a-card-cl"
                hoverable
              >
                <a-progress
                  :stroke-color="{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }"
                  type="circle"
                  :percent="100"
                  :format="() => 'OK'"
                />
              </a-card>
            </a-col>
            <a-col flex="25%" class="dashboard-a-col">
              <a-card
                :title="$t('label.status.worksapi')"
                class="dashboard-a-card-cl"
                hoverable
              >
                <a-progress
                  :stroke-color="{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }"
                  type="circle"
                  :percent="100"
                  :format="() => 'OK'"
                />
              </a-card>
            </a-col>
            <a-col flex="25%" class="dashboard-a-col">
              <a-card
                :title="$t('label.status.mold')"
                class="dashboard-a-card-cl"
                hoverable
              >
                <a-progress type="circle" :percent="100" status="exception" />
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row> -->
      <a-row>
        <a-col flex="100%">
          <a-row :gutter="8" type="flex">
            <a-col flex="50%" class="dashboard-a-col">
              <a-card :title="$t('label.workspace.count')" class="dashboard-a-card-cl" hoverable @click="$router.push({ name: 'Workspace' })">
                <span style="font-size: 80px; align: middle">{{ workspaceCount }}</span>
              </a-card>
            </a-col>
            <a-col flex="50%" class="dashboard-a-col">
              <a-card :title="$t('label.desktop.count')" class="dashboard-a-card-cl" hoverable @click="$router.push({ name: 'VirtualMachine' })">
                <span style="font-size: 80px">{{ desktopVmCount }}</span>
              </a-card>
            </a-col>
            <!-- <a-col flex="34%" class="dashboard-a-col">
              <a-card
                :title="$t('label.app.count')"
                class="dashboard-a-card-cl"
                hoverable
                @click="$router.push({ name: 'VirtualMachine' })"
              >
                <span style="font-size: 80px">{{ appVmCount }}</span>
              </a-card>
            </a-col> -->
          </a-row>
          <a-row :gutter="8" type="flex">
            <a-col flex="50%" class="dashboard-a-col">
              <a-card :title="$t('label.account.count')" class="dashboard-a-card-cl" hoverable @click="$router.push({ name: 'Account' })">
                <span style="font-size: 80px">{{ accountCount }}</span>
              </a-card>
            </a-col>
            <a-col flex="50%" class="dashboard-a-col">
              <a-card :title="$t('label.desktop.connected.count')" class="dashboard-a-card-cl" hoverable @click="$router.push({ name: 'VirtualMachine' })">
                <span style="font-size: 80px">{{ desktopConCount }}</span>
              </a-card>
            </a-col>
            <!-- <a-col flex="34%" class="dashboard-a-col">
              <a-card
                :title="$t('label.app.connected.count')"
                class="dashboard-a-card-cl"
                hoverable
              >
                <span style="font-size: 80px">{{ appConCount }}</span>
              </a-card>
            </a-col> -->
          </a-row>
        </a-col>
        <!-- <a-col flex="30%" class="dashboard-a-col">
        <a-card :bordered="true" class="dashboard-right-card">
          <a-timeline style="text-align: left">
            <a-timeline-item color="green"
              >Create a services site 2015-09-01</a-timeline-item
            >
            <a-timeline-item color="green"
              >Create a services site 2015-09-01</a-timeline-item
            >
            <a-timeline-item color="red">
              <p>Solve initial network problems 1</p>
              <p>Solve initial network problems 2</p>
              <p>Solve initial network problems 3 2015-09-01</p>
            </a-timeline-item>
            <a-timeline-item>
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </a-timeline-item>
            <a-timeline-item color="gray">
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </a-timeline-item>
            <a-timeline-item color="gray">
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col> -->
      </a-row>
    </a-spin>
  </div>
</template>
<script>
import { defineComponent, reactive, ref } from "vue";
export default defineComponent({
  name: "Dashboard",
  components: {},
  props: {},
  setup() {
    const state = reactive({});
    return {
      state,
    };
  },
  data() {
    return {
      timer: ref(null),
      loading: ref(false),
      spinning: ref(false),
      workspaceCount: ref("0"),
      desktopVmCount: ref("0"),
      appVmCount: ref("0"),
      accountCount: ref("0"),
      desktopConCount: ref("0"),
      appConCount: ref("0"),
      stepStatus: ref("error"),
      dashboardStep: ref(0),
      descStep0: ref(this.$t("message.status.checking")),
      descStep1: ref(this.$t("message.status.checking")),
      descStep2: ref(this.$t("message.status.checking")),
      descStep3: ref(this.$t("message.status.checking")),
      descStep4: ref(this.$t("message.status.checking")),
    };
  },
  created() {
    this.serverCheck();
    this.fetchData();
    this.timer = setInterval(() => {
      //30초 자동 갱신
      this.fetchData();
    }, 30000);
  },
  unmounted() {
    clearInterval(this.timer);
  },
  methods: {
    refresh(buttonClick) {
      if (buttonClick || sessionStorage.getItem("dashboardStep") === null) {
        this.spinning = true;
      }
      this.fetchData();
    },
    fetchData() {
      this.$worksApi
        .get("/api/serverCheck")
        .then((response) => {
          if (response.status == 200) {
            this.$store.dispatch("serverCheckCommit", response);
          }
        })
        .catch((error) => {
          this.$store.dispatch("serverCheckCommit", error.response);
          message.error(this.$t("message.response.data.fail"));
          // console.log(error.response.status);
        })
        .finally(() => {
          this.serverCheck();
        });

      this.$worksApi
        .get("/api/v1/dashboard")
        .then((response) => {
          if (response.status == 200) {
            const data = response.data.result;
            this.workspaceCount = data.workspaceCount;
            this.desktopVmCount = data.instanceCount;
            this.accountCount = data.usersCount - 3;
            this.desktopConCount = data.connectedCount;
            this.appVmCount = "0";
            this.appConCount = "0";
          }
        })
        .catch((error) => {
          this.$message.error(this.$t("message.response.data.fail"));
          // console.log(error.message);
        })
        .finally(() => {
          this.spinning = false;
        });
    },
    serverCheck() {
      const it = {
        works: this.$store.state.dashboard.works,
        mold: this.$store.state.dashboard.mold,
        dc: this.$store.state.dashboard.dc,
        samba: this.$store.state.dashboard.samba,
        guac: this.$store.state.dashboard.guac,
      };
      const mess_nosig = "message.status.check.nosignal";
      const mess_ok = "message.status.check.ok";

      if (it.works !== 0) {
        if (it.works === 200) {
          this.dashboardStep = 1;
          this.setMessage("works", mess_ok);
          delete it.works;
          if (it.mold === 200) {
            this.dashboardStep = 2;
            this.setMessage("mold", mess_ok);
            delete it.mold;
            if (it.dc === 200) {
              this.dashboardStep = 3;
              this.setMessage("dc", mess_ok);
              delete it.dc;
              if (it.samba === 200) {
                this.dashboardStep = 4;
                this.setMessage("samba", mess_ok);
                delete it.samba;
                if (it.guac === 200) {
                  this.dashboardStep = 5;
                  this.setMessage("guac", mess_ok);
                } else for (const v in it) this.setMessage(v, mess_nosig);
              } else for (const v in it) this.setMessage(v, mess_nosig);
            } else for (const v in it) this.setMessage(v, mess_nosig);
          } else for (const v in it) this.setMessage(v, mess_nosig);
        } else for (const v in it) this.setMessage(v, mess_nosig);
      }
    },
    setMessage(step, mess) {
      // console.log("step :>> ", step);
      // console.log("mess :>> ", mess);
      switch (step) {
        case "works":
          this.descStep0 = this.$t(mess);
          break;
        case "mold":
          this.descStep1 = this.$t(mess);
          break;
        case "dc":
          this.descStep2 = this.$t(mess);
          break;
        case "samba":
          this.descStep3 = this.$t(mess);
          break;
        case "guac":
          this.descStep4 = this.$t(mess);
          break;
        default:
          break;
      }
    },
  },
});
</script>

<style scoped>
.dashboard-a-card-cl {
  width: 100%;
  height: 100%;
  text-align: center;
}
.dashboard-a-col-one {
  text-align: right;
  padding: 10px;
  padding-bottom: 0px;
}

.dashboard-a-col {
  padding-bottom: 10px;
}
#content-action {
  text-align: right;
}
</style>
