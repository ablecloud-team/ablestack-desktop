<template>
  <div id="content-layout">
    <a-layout>
      <a-layout-header id="content-header">
        <div>
          <a-row>
            <!-- 오른쪽 경로 -->
            <a-col id="content-path" :span="12">
              <Apath :paths="[$t('label.desktop')]" />
              <a-button shape="round" style="margin-left: 18px" size="small" @click="fetchRefresh()">
                <template #icon><reload-outlined /></template>
                {{ $t("label.refresh") }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-layout-header>
      <a-layout-content>
        <a-spin :spinning="spinning" size="large">
          <a-row class="dashboard-a-row" :gutter="4">
            <a-col flex="auto" v-for="workspace in dataList" class="dashboard-a-col">
              <a-card :title="workspace.name + '(' + workspace.description + ')'" :bodyStyle="{ margin: '1px' }">
                <a-row :gutter="4">
                  <a-col v-for="vm in workspace.instanceList" class="dashboard-a-col">
                    <a-card hoverable :title="vm.name" style="width: 200px; text-align: center">
                      <DesktopOutlined
                        :style="{
                          fontSize: '40px',
                          color:
                            vm.mold_status == 'Running' &&
                            vm.handshake_status === 'Ready' &&
                            workspace.policy.filter((it) => it.name === 'rdp_access_allow')[0].value === 'true'
                              ? 'black'
                              : 'pink',
                        }"
                      />
                      <!-- <a-popconfirm
                          :title="
                            vm.favorite == true
                              ? '즐겨찾기 해제하시겠습니까?'
                              : '즐겨찾기에 추가하시겠습니까?'
                          "
                          :ok-text="$t('label.ok')"
                          :cancel-text="$t('label.cancel')"
                          @confirm="favorite(vm.uuid, vm.favorite)"
                        >
                          <a-tooltip placement="bottom">
                            <template #title>{{
                              $t("label.favorite.off")
                            }}</template>

                            <StarFilled
                              v-if="vm.favorite"
                              :id="vm.uuid + '-TRUE'"
                              :style="{ color: '#ffd700' }"
                            />
                          </a-tooltip>
                          <a-tooltip placement="bottom">
                            <template #title>{{
                              $t("label.favorite.on")
                            }}</template>
                            <StarOutlined
                              v-if="!vm.favorite"
                              :id="vm.uuid + '-FALSE'"
                              :style="{ color: '#d9dbdf' }"
                            />
                          </a-tooltip>
                        </a-popconfirm> -->
                      <template #actions>
                        <a-tooltip placement="bottom">
                          <template #title>
                            {{
                              vm.handshake_status === "Ready" && workspace.policy.filter((it) => it.name == "rdp_access_allow")[0].value === "true"
                                ? $t("label.rdp.connect.ready")
                                : $t("label.rdp.connect.notready")
                            }}
                          </template>
                          <Icon>
                            <template #component>
                              <img src="@/assets/icon-remote-desktop.png" height="30" @click="conRdpClient(workspace.uuid, vm.uuid)" />
                            </template>
                          </Icon>
                        </a-tooltip>

                        <a-tooltip placement="bottom">
                          <template #title>
                            {{
                              vm.handshake_status === "Ready" && workspace.policy.filter((it) => it.name == "rdp_access_allow")[0].value === "true"
                                ? $t("label.desktop.console.connect.ready")
                                : $t("label.desktop.console.connect.notready")
                            }}
                          </template>
                          <Icon>
                            <template #component>
                              <img src="@/assets/icons-internet.png" width="30" height="30" @click="conWebClient(workspace.uuid, vm.uuid)" />
                            </template>
                          </Icon>
                        </a-tooltip>

                        <a-Popover placement="topLeft" trigger="click">
                          <template #content>
                            <a-popconfirm
                              v-if="vm.mold_status == 'Running'"
                              :title="$t('modal.confirm.user.vmStop')"
                              :ok-text="$t('label.ok')"
                              :cancel-text="$t('label.cancel')"
                              @confirm="vmAction(vm.uuid, 'vmStop')"
                            >
                              <a-tooltip placement="bottom" style="padding-right: 40px">
                                <template #title>{{ $t("tooltip.vmStop") }}</template>
                                <a-button shape="circle">
                                  <template #icon>
                                    <PoweroffOutlined
                                      :style="{
                                        color: '#333',
                                        fontSize: '18px',
                                      }"
                                    />
                                  </template>
                                </a-button>
                              </a-tooltip>
                            </a-popconfirm>
                            <a-popconfirm
                              v-if="vm.mold_status == 'Running'"
                              :title="$t('modal.confirm.user.vmRestart')"
                              :ok-text="$t('label.ok')"
                              :cancel-text="$t('label.cancel')"
                              @confirm="vmAction(vm.uuid, 'vmRestart')"
                            >
                              <a-tooltip placement="bottom">
                                <template #title>{{ $t("tooltip.vmRestart") }}</template>

                                <a-button shape="circle">
                                  <template #icon>
                                    <ReloadOutlined
                                      :style="{
                                        color: '#333',
                                        fontSize: '18px',
                                      }"
                                    />
                                  </template>
                                </a-button>
                              </a-tooltip>
                            </a-popconfirm>
                            <a-popconfirm
                              v-if="vm.mold_status == 'Stopped'"
                              :title="$t('modal.confirm.user.vmStart')"
                              :ok-text="$t('label.ok')"
                              :cancel-text="$t('label.cancel')"
                              @confirm="vmAction(vm.uuid, 'vmStart')"
                            >
                              <a-tooltip placement="bottom">
                                <template #title>{{ $t("tooltip.vmStart") }}</template>
                                <a-button shape="circle">
                                  <template #icon>
                                    <CaretRightOutlined
                                      :style="{
                                        color: '#333',
                                        fontSize: '18px',
                                      }"
                                    />
                                  </template>
                                </a-button>
                              </a-tooltip>
                            </a-popconfirm>
                          </template>
                          <MoreOutlined
                            :style="{
                              color: '#333',
                              fontSize: '24px',
                              marginTop: '5px',
                            }"
                          />
                        </a-Popover>
                      </template>
                      <br /><br />

                      {{ $t("label.vm.state") }} :
                      <a-tooltip placement="bottom">
                        <template #title>{{ vm.mold_status }}</template>
                        <a-badge
                          class="head-example"
                          :color="
                            ['Running'].includes(vm.mold_status)
                              ? 'green'
                              : ['Stopping', 'Starting'].includes(vm.mold_status)
                              ? 'blue'
                              : ['Stopped'].includes(vm.mold_status)
                              ? 'red'
                              : 'grey'
                          "
                          :text="
                            vm.mold_status === 'Running'
                              ? $t('label.vm.status.running')
                              : vm.mold_status === 'Starting'
                              ? $t('label.vm.status.starting')
                              : vm.mold_status === 'Stopping'
                              ? $t('label.vm.status.stopping')
                              : vm.mold_status === 'Stopped'
                              ? $t('label.vm.status.stopped')
                              : ''
                          "
                        />
                      </a-tooltip>
                      <br />
                      {{ $t("label.vm.ready.state") }} :
                      <a-tooltip placement="bottom">
                        <template #title>{{ vm.handshake_status }}</template>
                        <a-badge
                          class="head-example"
                          :color="['Joining', 'Joined'].includes(vm.handshake_status) ? 'yellow' : vm.handshake_status === 'Ready' ? 'green' : 'red'"
                          :text="
                            ['Not Ready', 'Pending'].includes(vm.handshake_status)
                              ? $t('label.vm.status.initializing') + '(' + vm.handshake_status + ')'
                              : ['Joining', 'Joined'].includes(vm.handshake_status)
                              ? $t('label.vm.status.configuring') + '(' + vm.handshake_status + ')'
                              : ['Ready'].includes(vm.handshake_status)
                              ? $t('label.vm.status.ready')
                              : $t('label.vm.status.notready')
                          "
                        />
                      </a-tooltip>

                      <!-- 
                      <a-tooltip placement="bottom">
                        <template #title>{{ vm.handshake_status }}</template>
                        <a-badge
                          class="head-example"
                          :color="vm.handshake_status == 'Ready' ? 'green' : 'red'"
                          :text="vm.handshake_status == 'Ready' ? $t('label.vm.status.ready') : $t('label.vm.status.notready')"
                        />({{ vm.mold_status }})
                      </a-tooltip> -->

                      <br />
                      <!-- <WindowsFilled /> {{ vm.ostype }} -->
                    </a-card>
                  </a-col>
                </a-row>
              </a-card>
            </a-col>
          </a-row>
        </a-spin>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import { defineComponent, ref, h } from "vue";
import { Button } from "ant-design-vue";
import customProtocolCheck from "custom-protocol-check";
import Icon from "@ant-design/icons-vue";
import Apath from "@/components/Apath";
import Actions from "@/components/Actions";
const hostname = process.env.VUE_APP_API_URL == "" ? window.location.hostname : process.env.VUE_APP_API_URL;
const apiPort = process.env.VUE_APP_API_PORT == "" ? "8082" : process.env.VUE_APP_API_PORT;
export default defineComponent({
  name: "UserDesktop",
  components: {
    Icon,
    Apath,
    Actions,
  },
  setup() {
    return {
      //desktopIconStyle: ref([ {"fontSize": '40px', "color": '#cc0000'} ]),
      cryptKey: "IgmTQVMISq9t4Bj7iRz7kZklqzfoXuq1",
      cryptIv: "zxy0123456789abc",
      spinning: ref(false),
      favPopTitle: ref(""),
      loading: ref(true),
      dataList: ref([]),
      succCnt: ref(0),
      failCnt: ref(0),
      osPass: ref(false),
    };
  },
  created() {
    this.fetchRefresh();
    this.timer = setInterval(() => {
      //60초 자동 갱신
      this.fetchData();
    }, 60000);
  },
  mounted() {
    this.funcOsCheck();
  },
  methods: {
    fetchRefresh() {
      this.spinning = true;
      this.fetchData();
    },
    fetchData() {
      return new Promise((resolve, reject) => {
        this.$worksApi
          .get("/api/v1/userdesktop/" + sessionStorage.getItem("userName"))
          .then((response) => {
            if (response.status == 200) {
              if (response.data.workspaceList !== null && response.data.workspaceList !== undefined) {
                this.dataList = response.data.workspaceList;
              } else {
                this.dataList = [];
              }
              resolve(this.dataList);
            } else {
              this.$message.error(this.$t("message.response.data.fail"));
            }
          })
          .catch((error) => {
            this.$message.error(this.$t("message.response.data.fail"));
          })
          .finally(() => {
            this.spinning = false;
          });
      });
    },
    favorite(uuid, bool) {
      console.log(uuid + " :: " + bool);
      // //const elId = event.currentTarget.id;

      // document.getElementById(elId).style.display = "none";
      // if (elId.includes("-TRUE")) {
      //   document.getElementById(val + "-FALSE").style.display = "block";
      // } else if (elId.includes("-FALSE")) {
      //   document.getElementById(val + "-TRUE").style.display = "block";
      // }

      // document.getElementById(val).style.display = "none";
      // document.getElementById(val).style.display = "none";
    },
    conRdpClient(workspaceUuid, vmUuid) {
      if (!this.osPass) {
        this.$message.warning(this.$t("message.userdesktop.rdp.connect.os.limit"));
        return false;
      }

      this.fetchData()
        .then((data) => {
          const liteParamArr = data.filter((dl) => dl.uuid === workspaceUuid)[0].instanceList.filter((il) => il.uuid === vmUuid)[0];
          const policyList = data.filter((dl) => dl.uuid === workspaceUuid)[0].policy.filter((pl) => pl.value !== "");

          if (liteParamArr.handshake_status === "Ready" && policyList.filter((pl) => pl.name == "rdp_access_allow")[0].value === "true") {
            this.$worksApi
              .get("/api/v1/connection/rdp/" + vmUuid + "/" + sessionStorage.getItem("userName"))
              .then((res) => {
                if (res.status == 200) {
                  const url =
                    "worksapp://" +
                    hostname +
                    ":" +
                    apiPort +
                    "/?full address=" +
                    hostname +
                    "&server port=" +
                    res.data.instance.public_port +
                    "&domain=" +
                    sessionStorage.getItem("domainName") +
                    "&username=" +
                    sessionStorage.getItem("userName") +
                    "&password=" +
                    res.data.instance.password +
                    "&instanceUuid=" +
                    vmUuid +
                    "&hash=" +
                    res.data.instance.hash;

                  // console.log(url);
                  customProtocolCheck(
                    url,
                    () => {
                      this.downloadRdpClient("works-client.zip");
                      this.$message.warning(this.$t("message.userdesktop.rdp.connect.client.notinstall"));
                      //worksapp 프로토콜이 설치안됨
                      const key = `open${Date.now()}`;
                      this.$notification.open({
                        message: this.$t("message.userdesktop.rdpclient.install.info"),
                        description: h("div", [
                          this.$t("message.userdesktop.client.install.notice1"),
                          h("br"),
                          this.$t("message.userdesktop.client.install.notice2"),
                          h("br"),
                          this.$t("message.userdesktop.client.install.notice3"),
                          h("br"),
                          this.$t("message.userdesktop.client.install.notice4"),
                        ]),
                        duration: 0,
                        style: {
                          width: "500px",
                        },
                        btn: () =>
                          h(
                            Button,
                            {
                              type: "primary",
                              size: "small",
                              onClick: () => this.$notification.close(key),
                            },
                            { default: () => this.$t("label.ok") }
                          ),
                        key,
                        onClose: close,
                      });
                    },
                    () => {},
                    100
                  );
                } else {
                  this.$message.error(this.$t("message.response.data.fail"));
                }
              })
              .catch((error) => {
                console.log(error);
                this.$message.error(this.$t("message.response.data.fail"));
              })
              .finally(() => {});
          } else {
            this.$message.warning(this.$t("message.userdesktop.policy.rdp.access.denied"));
            return false;
          }
        })
        .catch((err) => {
          this.$message.error(this.$t("message.response.data.fail"));
          // console.error(this.$t("message.response.data.fail")); // Error 출력
        });
    },
    downloadRdpClient(filename) {
      const downlink = document.createElement("a");
      downlink.setAttribute("href", "/client/" + filename);
      downlink.setAttribute("download", filename);
      downlink.style.display = "none";
      document.body.appendChild(downlink);
      downlink.click();
      document.body.removeChild(downlink);
    },
    conWebClient(workspaceUuid, vmUuid) {
      this.fetchData()
        .then((data) => {
          const liteParamArr = data.filter((dl) => dl.uuid === workspaceUuid)[0].instanceList.filter((il) => il.uuid === vmUuid)[0];
          const policyList = data.filter((dl) => dl.uuid === workspaceUuid)[0].policy.filter((pl) => pl.value !== "");

          if (liteParamArr.handshake_status === "Ready" && policyList.filter((pl) => pl.name == "rdp_access_allow")[0].value === "true") {
            policyList.forEach((item) => {
              liteParamArr[item.name] = item.value;
            });
            // liteParamArr["timestamp"] = Math.floor(Date.now() / 1000);
            liteParamArr["client-name"] = "ABLESTACK Works";
            liteParamArr["hostname"] = liteParamArr.ipaddress;
            liteParamArr["username"] = sessionStorage.getItem("userName");
            liteParamArr["domain"] = sessionStorage.getItem("domainName");
            // liteParamArr["enable-touch"] = true;
            // console.log(liteParamArr);

            const cipher = this.$CryptoJS.AES.encrypt(JSON.stringify(liteParamArr), this.$CryptoJS.enc.Utf8.parse(this.cryptKey), {
              iv: this.$CryptoJS.enc.Utf8.parse(this.cryptIv), // [Enter IV (Optional) 지정 방식]
              padding: this.$CryptoJS.pad.Pkcs7,
              mode: this.$CryptoJS.mode.CBC, // [cbc 모드 선택]
            });
            const encrypted = btoa(cipher.toString());
            window.open("/client/" + encrypted, "_blank");
          } else {
            this.$message.warning(this.$t("message.userdesktop.policy.rdp.access.denied"));
            return false;
          }
        })
        .catch((err) => {
          this.$message.error(this.$t("message.response.data.fail"));
          // console.error(this.$t("message.response.data.fail")); // Error 출력
        });
    },

    async vmAction(uuid, action) {
      var apiUrl = "";
      var timer = 10000;
      if (action == "vmStart") {
        this.$message.loading(this.$t("message.vm.status.starting"), 0);
        apiUrl = "/api/v1/instance/VMStart/";
        this.sucMessage = "message.vm.status.start.ok";
        this.failMessage = "message.vm.status.start.fail";
        timer = 10000;
      }
      if (action == "vmStop") {
        this.$message.loading(this.$t("message.vm.status.stopping"), 0);
        apiUrl = "/api/v1/instance/VMStop/";
        this.sucMessage = "message.vm.status.stop.ok";
        this.failMessage = "message.vm.status.stop.fail";
        timer = 15000;
      }
      if (action == "vmRestart") {
        this.$message.loading(this.$t("message.vm.status.restarting"), 0);
        apiUrl = "/api/v1/instance/VMReboot/";
        this.sucMessage = "message.vm.status.restart.ok";
        this.failMessage = "message.vm.status.restart.fail";
        timer = 10000;
      }

      const arrAsync = [];

      arrAsync.push(this.promiseAction("patch", apiUrl + uuid, null));

      Promise.all(arrAsync)
        .then(() => {
          this.handleCancel();
        })
        .catch((error) => {})
        .finally(() => {
          setTimeout(() => {
            this.funcEndMessage();

            this.fetchRefresh();
          }, timer);
        });
    },
    promiseAction(apiMethod, apiUrl, param) {
      return new Promise((resolve, reject) => {
        this.$worksApi({ url: apiUrl, method: apiMethod, data: param })
          .then((response) => {
            if (response.status === 200 || response.status === 204) this.succCnt = this.succCnt + 1;
            else this.failCnt = this.failCnt + 1;
            resolve(response.status);
          })
          .catch((error) => {
            this.failCnt = this.failCnt + 1;
            reject(error);
          });
      });
    },

    funcEndMessage() {
      this.$message.destroy();
      if (this.succCnt > 0) {
        this.$message.success(
          this.$t(this.sucMessage, {
            count: this.succCnt,
          }),
          5
        );
      }
      if (this.failCnt > 0) {
        this.$message.error(
          this.$t(this.failMessage, {
            count: this.failCnt,
          }),
          5
        );
      }
      this.failCnt = 0;
      this.succCnt = 0;
    },
    funcOsCheck() {
      var os,
        ua = navigator.userAgent;

      if (ua.indexOf("Windows") != -1) {
        os = "Windows";
        this.osPass = true;
      } else if (ua.indexOf("iPad") != -1 || ua.indexOf("iPhone") != -1 || ua.indexOf("iPod") != -1) {
        os = "Apple iOS";
        this.osPass = false;
      } else if (ua.indexOf("Android" != -1)) {
        os = "Android OS";
        this.osPass = false;
      } else if (ua.match(/Mac|PPC/)) {
        os = "Mac";
        this.osPass = false;
      } else if (ua.match(/Linux/)) {
        os = "Linux";
        this.osPass = false;
      } else if (ua.match(/(Free|Net|Open)BSD/)) {
        os = RegExp.$1 + "BSD";
        this.osPass = false;
      } else if (ua.match(/SunOS/)) {
        os = "Solaris";
        this.osPass = false;
      }
      //자세한 os 분류가 필요할때 사용
      // if (ua.match(/Win(dows )?NT 6\.0/)) {
      //   os = "Windows Vista";
      //   this.osPass = true;
      // } else if (ua.match(/Win(dows )?(NT 5\.1|XP)/)) {
      //   os = "Windows XP";
      //   this.osPass = true;
      // } else {
      //   if (
      //     ua.indexOf("Windows NT 5.1") != -1 ||
      //     ua.indexOf("Windows XP") != -1
      //   ) {
      //     os = "Windows XP";
      //     this.osPass = true;
      //   } else if (
      //     ua.indexOf("Windows NT 7.0") != -1 ||
      //     ua.indexOf("Windows NT 6.1") != -1
      //   ) {
      //     os = "Windows 7";
      //     this.osPass = true;
      //   } else if (
      //     ua.indexOf("Windows NT 8.0") != -1 ||
      //     ua.indexOf("Windows NT 6.2") != -1
      //   ) {
      //     os = "Windows 8";
      //     this.osPass = true;
      //   } else if (
      //     ua.indexOf("Windows NT 8.1") != -1 ||
      //     ua.indexOf("Windows NT 6.3") != -1
      //   ) {
      //     os = "Windows 8.1";
      //     this.osPass = true;
      //   } else if (
      //     ua.indexOf("Windows NT 10.0") != -1 ||
      //     ua.indexOf("Windows NT 6.4") != -1
      //   ) {
      //     os = "Windows 10";
      //     this.osPass = true;
      //   } else if (ua.match(/Win(dows )?NT( 4\.0)?/)) {
      //     os = "Windows NT";
      //     this.osPass = true;
      //   } else if (
      //     ua.indexOf("iPad") != -1 ||
      //     ua.indexOf("iPhone") != -1 ||
      //     ua.indexOf("iPod") != -1
      //   ) {
      //     os = "Apple iOS";
      //     this.osPass = false;
      //   } else if (ua.indexOf("Android" != -1)) {
      //     os = "Android OS";
      //     this.osPass = false;
      //   } else if (ua.match(/Mac|PPC/)) {
      //     os = "Mac";
      //     this.osPass = false;
      //   } else if (ua.match(/Linux/)) {
      //     os = "Linux";
      //     this.osPass = false;
      //   } else if (ua.match(/(Free|Net|Open)BSD/)) {
      //     os = RegExp.$1 + "BSD";
      //     this.osPass = false;
      //   } else if (ua.match(/SunOS/)) {
      //     os = "Solaris";
      //     this.osPass = false;
      //   }
      // }
    },
  },
});
</script>

<style scoped>
::v-deep(.ant-badge-status-dot) {
  width: 12px;
  height: 12px;
}
.dashboard-a-row {
  width: 100%;
  padding-top: 5px;
  padding-right: 5px;
  padding-left: 5px;
}
.dashboard-a-col {
  padding-bottom: 5px;
}
.ant-card-actions {
  height: 10px;
}

#content-layout .ant-layout-header {
  text-align: left;
  background: white;
  border: 1px solid #e8e8e8;
  /*color: #fff;*/
  font-size: 14px;
  line-height: 1.5;
  padding: 18px;
  height: auto;
}

#content-path {
  text-align: left;
  align-items: center;
  display: flex;
  height: 32px;
}

#content-action {
  text-align: right;
}

.ant-btn {
  margin-right: 8px;
}
</style>
