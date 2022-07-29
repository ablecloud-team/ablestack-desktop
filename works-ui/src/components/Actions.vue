<template class="able-action">
  <a-space :size="8">
    <!-- 단일 Select 일때 버튼 표시 -->
    <a-tooltip v-if="state.buttonBool.vmStart" placement="bottom">
      <template #title>{{ $t("tooltip.vmStart") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('vmStart')">
        <caret-right-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.vmStop" placement="bottom">
      <template #title>{{ $t("tooltip.vmStop") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('vmStop')">
        <poweroff-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.vmRestart" placement="bottom">
      <template #title>{{ $t("tooltip.vmRestart") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('vmRestart')">
        <reload-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.userAllocate" placement="bottom">
      <template #title>{{ $t("tooltip.userAllocate") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('userAllocate')">
        <user-add-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.userUnlock" placement="bottom">
      <template #title>{{ $t("tooltip.userUnlock") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('userUnlock')">
        <user-delete-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.userPassChange" placement="bottom">
      <template #title>{{ $t("tooltip.userPassChange") }}</template>
      <a-button shape="circle" @click="setCircleButtonModal('userPassChange')">
        <lock-outlined />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.vmDestroy" placement="bottom">
      <template #title>{{ $t("tooltip.destroy") }}</template>
      <a-button type="primary" shape="circle" danger @click="setCircleButtonModal('vmDestroy')">
        <delete-filled />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.wsDel" placement="bottom">
      <template #title>{{ $t("tooltip.destroy") }}</template>
      <a-button type="primary" shape="circle" danger @click="setCircleButtonModal('wsDel')">
        <DeleteFilled />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.accountDel" placement="bottom">
      <template #title>{{ $t("tooltip.destroy") }}</template>
      <a-button type="primary" shape="circle" danger @click="setCircleButtonModal('accountDel')">
        <delete-filled />
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.wsUserDel" placement="bottom">
      <template #title>{{ $t("tooltip.destroy") }}</template>
      <a-button type="primary" shape="circle" danger @click="setCircleButtonModal('wsUserDel')">
        <DeleteFilled />
      </a-button>
    </a-tooltip>
    <!-- 단일 Select 일때 버튼 표시 -->

    <!-- Multi Select 일때 일괄 버튼 표시 -->
    <a-tooltip v-if="state.buttonBool.multiVmStart" placement="bottom">
      <template #title>{{ $t("tooltip.multiVmStart") }}</template>
      <a-button shape="round" @click="setCircleButtonModal('vmStart')">
        <CaretRightOutlined />
        {{ $t("tooltip.multiVmStart") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiVmStop" placement="bottom">
      <template #title>{{ $t("tooltip.multiVmStop") }}</template>
      <a-button shape="round" @click="setCircleButtonModal('vmStop')">
        <PoweroffOutlined />
        {{ $t("tooltip.multiVmStop") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiVmRestart" placement="bottom">
      <template #title>{{ $t("tooltip.multiVmStop") }}</template>
      <a-button shape="round" @click="setCircleButtonModal('vmRestart')">
        <ReloadOutlined />
        {{ $t("tooltip.multiVmRestart") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiUserAllocate" placement="bottom">
      <template #title>{{ $t("tooltip.multiUserAllocate") }}</template>
      <a-button shape="round" @click="setCircleButtonModal('userAllocate')">
        <UserAddOutlined />
        {{ $t("tooltip.multiUserAllocate") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiUserUnlock" placement="bottom">
      <template #title>{{ $t("tooltip.multiUserUnlock") }}</template>
      <a-button shape="round" @click="setCircleButtonModal('userUnlock')">
        <UserDeleteOutlined />
        {{ $t("tooltip.multiUserUnlock") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiVmDel" placement="bottom">
      <template #title>{{ $t("tooltip.multiDestroy") }}</template>
      <a-button shape="round" danger @click="setCircleButtonModal('vmDestroy')">
        <DeleteFilled />
        {{ $t("tooltip.multiDestroy") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiWsDel" placement="bottom">
      <template #title>{{ $t("tooltip.multiDestroy") }}</template>
      <a-button shape="round" danger @click="setCircleButtonModal('wsDel')">
        <DeleteFilled />
        {{ $t("tooltip.multiDestroy") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiUserDel" placement="bottom">
      <template #title>{{ $t("tooltip.multiDestroy") }}</template>
      <a-button shape="round" danger @click="setCircleButtonModal('accountDel')">
        <DeleteFilled />
        {{ $t("tooltip.multiDestroy") }}
      </a-button>
    </a-tooltip>
    <a-tooltip v-if="state.buttonBool.multiWsUserDel" placement="bottom">
      <template #title>{{ $t("tooltip.multiDestroy") }}</template>
      <a-button shape="round" danger @click="setCircleButtonModal('wsUserDel')">
        <DeleteFilled />
        {{ $t("tooltip.multiDestroy") }}
      </a-button>
    </a-tooltip>

    <!-- Multi Select 일때 일괄 버튼 표시 -->
    <a-modal
      v-model:visible="commonModalView"
      :title="commonModalTitle"
      :confirm-loading="confirmLoading"
      :ok-text="$t('label.ok')"
      :cancel-text="$t('label.cancel')"
      @cancel="handleCancel"
      @ok="handleSubmit()"
    >
      <a-alert :message="modalConfirm" :type="alertType" show-icon />
      <a-divider />
      <a-table size="small" :columns="listColumns" :pagination="{ pageSize: 10 }" :data-source="eventList"></a-table>
    </a-modal>

    <a-modal
      v-model:visible="userAllocateVmModalView"
      :title="$t('tooltip.desktop.allocate.user')"
      :confirm-loading="confirmLoading"
      :ok-text="$t('label.ok')"
      :cancel-text="$t('label.cancel')"
      @cancel="handleCancel"
      @ok="
        () => {
          if (selectedUser) handleSubmit();
        }
      "
    >
      <a-alert :message="modalConfirm" type="info" show-icon />
      <a-divider />
      <a-select
        v-model:value="selectedUser"
        show-search
        style="width: 100%; margin-top: 7px"
        option-filter-prop="label"
        class="addmodal-aform-item-div"
        :placeholder="$t('tooltip.vm.account.select')"
      >
        <a-select-option v-for="option in workspaceUserDataList" :key="option.name" :value="option.name" :label="option.name">
          {{ option.name }}
        </a-select-option>
      </a-select>
      <br />
      <br />
      <a-table size="small" :columns="listColumns" :pagination="{ pageSize: 10 }" :data-source="eventList"></a-table>
    </a-modal>
    <a-modal
      v-model:visible="userPassChangeModalView"
      :title="$t('tooltip.userPassChange')"
      :confirm-loading="confirmLoading"
      :ok-text="$t('label.ok')"
      :cancel-text="$t('label.cancel')"
      @cancel="handleCancel"
      @ok="userPassChangeAction"
    >
      <a-alert :message="modalConfirm" type="info" show-icon />
      <a-divider />
      <a-form :ref="formRef" :model="form" :rules="rules" layout="vertical" autocomplete="off">
        <a-form-item v-if="actionFrom == 'USDetail'" has-feedback name="curPassword" :label="$t('label.current.password')">
          <a-input-password v-model:value="form.curPassword" :placeholder="$t('placeholder.user.current.password')" />
        </a-form-item>
        <a-form-item has-feedback name="newPassword" :label="$t('label.new.password')">
          <a-input-password v-model:value="form.newPassword" :placeholder="$t('placeholder.user.new.password')" />
        </a-form-item>
        <a-form-item has-feedback name="newPasswordCheck" :label="$t('label.new.passwordCheck')">
          <a-input-password v-model:value="form.newPasswordCheck" :placeholder="$t('placeholder.user.new.passwordCheck')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-space>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  components: {},
  props: {
    actionFrom: {
      type: String,
      requires: true,
      default: "",
    },
    resource: {
      type: Object,
      required: false,
      default: null,
    },
    wsName: {
      type: String,
      requires: false,
      default: "",
    },
    wsInfo: {
      type: Object,
      requires: false,
      default: null,
    },
    vmInfo: {
      type: Object,
      requires: false,
      default: null,
    },
    accountInfo: {
      type: Object,
      requires: false,
      default: null,
    },
    multiSelectList: {
      type: Object,
      requires: false,
      default: null,
    },
  },
  emits: ["fetchData"],
  setup() {
    const state = reactive({
      buttonBool: {
        showModal: ref(false),
        vmStart: ref(false),
        vmStop: ref(false),
        vmRestart: ref(false),
        vmDestroy: ref(false),
        userAllocate: ref(false),
        userUnlock: ref(false),
        userPassChange: ref(false),
        wsDel: ref(false),
        wsUserDel: ref(false),
        accountDel: ref(false),
        multiVmStart: ref(false),
        multiVmStop: ref(false),
        multiVmRestart: ref(false),
        multiVmDel: ref(false),
        multiUserAllocate: ref(false),
        multiUserUnlock: ref(false),
        multiWsDel: ref(false),
        multiWsUserDel: ref(false),
        multiUserDel: ref(false),
      },
    });
    return {
      userAllocateVmModalView: ref(false),
      userPassChangeModalView: ref(false),
      commonModalView: ref(false),
      workspaceUserDataList: ref([]),
      commonModalTitle: ref(""),
      act: ref(""),
      modalConfirm: ref(""),
      state,
    };
  },
  data() {
    return {
      selectedUser: ref(undefined),
      eventList: [],
      alertType: ref("info"),
      succCnt: ref(0),
      failCnt: ref(0),
      existVmCnt: ref(0),
      confirmLoading: ref(false),
      passConfirmLoading: ref(false),
      sucMessage: ref(""),
      failMessage: ref(""),
      listColumns: [
        {
          title: this.$t("label.name"),
          dataIndex: "name",
          key: "name",
          width: "100%",
        },
      ],
    };
  },
  created() {
    this.fetchData();
    this.initForm();
  },
  methods: {
    initForm() {
      this.formRef = ref();
      this.form = reactive({});
      this.rules = reactive({
        curPassword: { min: 7, required: true, validator: this.validatePass, trigger: "change", message: this.$t("input.user.current.password") },
        newPassword: { min: 7, required: true, validator: this.validatePass, trigger: "change", message: this.$t("input.user.new.password") },
        newPasswordCheck: { required: true, validator: this.validatePassCheck, trigger: "change", message: this.$t("input.user.new.passwordCheck") },
      });
    },
    async validatePass(rule, value) {
      let lengthCheck = value.length >= rule.min ? true : false; //길이체크
      let containsEng = /[a-zA-Z]/.test(value); // 대소문자
      //let containsEngUpper = /[A-Z]/.test(value); 대문자
      let containsNumber = /[0-9]/.test(value);
      let containsSpecial = /[~!@#$%^&*()\-_+|<>?:{}]/.test(value);
      if (!value || value.length === 0 || !containsEng || !containsNumber || !containsSpecial || !lengthCheck) {
        return Promise.reject();
      } else {
        if (this.form.newPasswordCheck !== "") {
          this.formRef.value.validateFields("newPasswordCheck");
        }

        return Promise.resolve();
      }
    },
    async validatePassCheck(rule, value) {
      if (value !== this.form.newPassword) {
        return Promise.reject();
      } else {
        return Promise.resolve();
      }
    },
    parentRefresh() {
      this.$emit("fetchData");
    },
    fetchData() {
      // console.log(this.actionFrom, this.wsInfo, this.multiSelectList);

      if (this.actionFrom.includes("WS")) {
        if (this.wsInfo) {
          // 단일 워크스페이스 정보일 경우
          this.eventList = [this.wsInfo];
          this.state.buttonBool.wsDel = true;
        } else {
          // multi select 워크스페이스를 선택 했을 경우
          this.eventList = this.multiSelectList;
          if (this.actionFrom === "WSUserList") this.state.buttonBool.multiWsUserDel = true;
          else this.state.buttonBool.multiWsDel = true;
        }
      } else if (this.actionFrom.includes("AC")) {
        if (this.accountInfo) {
          this.eventList = [this.accountInfo];
          this.state.buttonBool.accountDel = true;
          this.state.buttonBool.userPassChange = true;
        } else {
          this.eventList = this.multiSelectList;
          this.state.buttonBool.multiUserDel = true;
        }
      } else if (this.actionFrom.includes("USDetail")) {
        if (this.accountInfo) {
          this.eventList = [this.accountInfo];
          this.state.buttonBool.userPassChange = true;
        }
      } else if (this.actionFrom.includes("VM")) {
        // 단일 VM 정보일 경우
        if (this.vmInfo) this.eventList = [this.vmInfo];
        else this.eventList = this.multiSelectList; // multi select VM를 선택 했을 경우

        // console.log(this.eventList);

        //시작 버튼 체크
        let res = null;
        res = this.eventList.filter((it) => it.mold_status === "Running");
        if (this.eventList.length === res.length) {
          if (this.vmInfo) {
            this.state.buttonBool.vmStop = true;
            this.state.buttonBool.vmRestart = true;
          } else {
            this.state.buttonBool.multiVmStop = true;
            this.state.buttonBool.multiVmRestart = true;
          }
        }

        //정지 버튼 체크
        res = this.eventList.filter((it) => it.mold_status === "Stopped");
        if (this.eventList.length === res.length) {
          if (this.vmInfo) this.state.buttonBool.vmStart = true;
          else this.state.buttonBool.multiVmStart = true;
        }
        //사용자 할당 해제 버튼 체크
        res = this.eventList.filter((it) => it.owner_account_id !== undefined && it.owner_account_id !== "");

        if (res.length > 0) {
          if (this.vmInfo) this.state.buttonBool.userUnlock = true;
          else this.state.buttonBool.multiUserUnlock = true;
        }

        //가상머신 삭제버튼 세팅
        if (this.vmInfo) this.state.buttonBool.vmDestroy = true;
        else this.state.buttonBool.multiVmDel = true;

        //사용자 할당 버튼 체크
        res = this.eventList.filter((it) => it.owner_account_id === undefined || it.owner_account_id === "");
        if (this.eventList.length === res.length) {
          //같은 워크스페이스면 할당 버튼 활성화, 아니면 비활성화
          res = this.eventList.filter(function (obj, i, s) {
            return (
              i ===
              s.findIndex(function (t) {
                return t.workspace_name === obj.workspace_name;
              })
            );
          });
          //사용자 할당 버튼
          if (res.length === 1) {
            //사용자 할당 버튼
            if (this.vmInfo) this.state.buttonBool.userAllocate = true;
            else this.state.buttonBool.multiUserAllocate = true;

            this.$worksApi
              .get("/api/v1/group/" + res[0].workspace_name)
              .then((response) => {
                if (response.status == 200) {
                  const temp = response.data.result.member == undefined ? "" : response.data.result.member;
                  for (let str of temp) {
                    this.workspaceUserDataList.push({
                      name: str.split(",")[0].split("CN=")[1],
                    });
                  }
                } else {
                  this.$message.error(
                    this.$t("message.worksapi.call.error", {
                      api: "/api/v1/group/",
                    })
                  );
                }
              })
              .catch((error) => {
                console.log("[API 호출 에러] :>> /api/v1/group/ ");
                // this.$message.error(
                //   this.$t("message.worksapi.call.error", {
                //     api: "/api/v1/group/",
                //   })
                // );
              });
          }
        }
      }
    },
    setCircleButtonModal(value) {
      this.act = value;
      this.commonModalTitle = this.$t("tooltip." + value);
      if (value == "userAllocate") {
        this.userAllocateVmModalView = true;
        this.modalConfirm = this.$t("modal.confirm.workspace.allocate.vm.user", {
          count: this.eventList.length,
        });
      } else if (value == "userPassChange") {
        this.userPassChangeModalView = true;
        this.modalConfirm = this.$t("modal.confirm.userPassChange", {
          name: this.accountInfo.username || this.accountInfo.name,
        });
      } else {
        this.commonModalView = true;
      }
      // if (value == "workspaceStart")
      //   this.modalConfirm =
      //     "[" +
      //     this.workspaceName +
      //     "] " +
      //     this.$t("modal.confirm.workspaceStart");
      // if (value == "workspaceStop")
      //   this.modalConfirm =
      //     "[" +
      //     this.workspaceName +
      //     "] " +
      //     this.$t("modal.confirm.workspaceStop");
      if (value == "wsDel") {
        this.modalConfirm = this.$t("modal.confirm.workspaceDestroy", {
          count: this.eventList.length,
        });
        this.alertType = "warning";
      }
      if (value == "wsUserDel") {
        this.modalConfirm = this.$t("modal.confirm.workspaceAccountDestroy", {
          count: this.eventList.length,
        });
        this.alertType = "warning";
      }

      if (value == "vmStart") {
        this.modalConfirm = this.$t("modal.confirm.vmStart", {
          count: this.eventList.length,
        });
      }
      if (value == "vmStop") {
        this.modalConfirm = this.$t("modal.confirm.vmStop", {
          count: this.eventList.length,
        });
      }
      if (value == "vmRestart") {
        this.modalConfirm = this.$t("modal.confirm.vmRestart", {
          count: this.eventList.length,
        });
      }
      if (value == "vmDestroy") {
        this.modalConfirm = this.$t("modal.confirm.vmDestroy", {
          count: this.eventList.length,
        });
        this.alertType = "warning";
      }
      if (value == "userUnlock") {
        this.modalConfirm = this.$t("modal.confirm.userUnlock", {
          count: this.eventList.length,
        });
      }
      if (value == "accountDel") {
        this.modalConfirm = this.$t("modal.confirm.accountDestroy", {
          count: this.eventList.length,
        });
        this.alertType = "warning";
      }
    },
    handleCancel() {
      this.commonModalView = false;
      this.confirmLoading = false;
      this.userAllocateVmModalView = false;
      this.userPassChangeModalView = false;
    },
    handleSubmit() {
      // console.log(this.act + "  ::  " + this.actionFrom);
      this.confirmLoading = true;
      if (this.actionFrom.includes("VM")) {
        if (this.act.includes("vm")) this.vmAction();

        if (this.act.includes("userUnlock")) this.vmUserUnlockAction();

        if (this.act.includes("userAllocate")) this.vmUserAllocateAction();
      }

      if (this.actionFrom.includes("WS")) {
        if (this.act.includes("wsDel")) this.wsDelAction();

        if (this.act.includes("wsUserDel")) this.multiWsUserDelAction();
      }

      if (this.actionFrom.includes("AC")) {
        if (this.act.includes("accountDel")) this.accountDelAction();
      }
    },
    async funcDelay(delay) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve("delay call!");
        }, delay);
      });
    },
    multiWsUserDelAction() {
      this.sucMessage = "message.workspace.user.delete.ok";
      this.failMessage = "message.workspace.user.delete.fail";
      this.$message.loading(this.$t("message.workspace.vm.user.deleting"), 0);

      var apiUrl = "";
      const arrAsync = [];
      for (let val of this.eventList) {
        apiUrl = "/api/v1/group/" + this.wsName + "/" + val.name;
        arrAsync.push(this.promiseAction("delete", apiUrl, null));
      }

      Promise.all(arrAsync)
        .then(() => {
          this.handleCancel();
        })
        .catch((error) => {})
        .finally(() => {
          this.funcEndMessage();
          this.parentRefresh();
        });
    },
    vmUserAllocateAction() {
      if (!this.selectedUser) return false;

      this.sucMessage = "message.user.vm.allocated.ok";
      this.failMessage = "message.user.vm.allocated.fail";
      this.$message.loading(this.$t("message.user.vm.allocating"), 0);

      var apiUrl = "";
      const arrAsync = [];
      for (let val of this.eventList) {
        apiUrl = "/api/v1/connection/" + val.uuid + "/" + this.selectedUser;
        arrAsync.push(this.promiseAction("put", apiUrl, null));
      }

      Promise.all(arrAsync)
        .then(() => {
          this.handleCancel();
        })
        .catch((error) => {})
        .finally(() => {
          this.funcEndMessage();
          this.parentRefresh();
        });
    },
    vmUserUnlockAction() {
      this.sucMessage = "message.user.vm.unlock.ok";
      this.failMessage = "message.user.vm.unlock.fail";
      this.$message.loading(this.$t("message.user.vm.unlocking"), 0);

      var apiUrl = "";
      const arrAsync = [];

      // 담당자가 할당된 목록만 보냄
      const ownList = this.eventList.filter((it) => it.owner_account_id !== undefined && it.owner_account_id !== "");
      for (let val of ownList) {
        apiUrl = "/api/v1/connection/" + val.uuid;
        arrAsync.push(this.promiseAction("delete", apiUrl, null));
      }

      Promise.all(arrAsync)
        .then(() => {
          this.funcEndMessage();
          this.handleCancel();
        })
        .catch((error) => {})
        .finally(() => {
          this.parentRefresh();
        });
    },
    userPassChangeAction(e) {
      e.preventDefault();
      let params = new URLSearchParams();
      params.append("oldPassword", this.form.curPassword);
      params.append("newPassword", this.form.newPassword);

      this.formRef.value
        .validate()
        .then(() => {
          this.confirmLoading = true;

          this.sucMessage = "message.user.password.change.ok";
          this.failMessage = "message.user.password.change.fail";
          this.$message.loading(this.$t("message.user.password.changing"), 0);

          const arrAsync = [];
          var apiUrl = "";
          if (this.actionFrom.includes("AC")) apiUrl = "/api/v1/passwordAdmin/" + this.accountInfo.name;
          else apiUrl = "/api/v1/passwordUser/" + this.accountInfo.username;

          arrAsync.push(this.promiseAction("patch", apiUrl, params));

          Promise.all(arrAsync)
            .then(() => {
              this.handleCancel();
              // this.parentRefresh();
            })
            .catch((error) => {})
            .finally(() => {
              setTimeout(() => {
                this.confirmLoading = false;
                this.funcEndMessage();
              }, 1000);
            });
        })
        .catch((error) => {
          console.log("error", error);
          //message.error(error);
        });
    },
    vmAction() {
      var apiUrl = "";
      var timer = 10000;
      if (this.act.includes("vmStart")) {
        this.$message.loading(this.$t("message.vm.status.starting"), 0);
        apiUrl = "/api/v1/instance/VMStart/";
        this.sucMessage = "message.vm.status.start.ok";
        this.failMessage = "message.vm.status.start.fail";
        timer = 10000;
      }
      if (this.act.includes("vmStop")) {
        this.$message.loading(this.$t("message.vm.status.stopping"), 0);
        apiUrl = "/api/v1/instance/VMStop/";
        this.sucMessage = "message.vm.status.stop.ok";
        this.failMessage = "message.vm.status.stop.fail";
        timer = 15000;
      }
      if (this.act.includes("vmRestart")) {
        this.$message.loading(this.$t("message.vm.status.restarting"), 0);
        apiUrl = "/api/v1/instance/VMReboot/";
        this.sucMessage = "message.vm.status.restart.ok";
        this.failMessage = "message.vm.status.restart.fail";
        timer = 10000;
      }
      if (this.act.includes("vmDestroy")) {
        this.$message.loading(this.$t("message.vm.status.destroying"), 0);
        apiUrl = "/api/v1/instance/VMDestroy/";
        this.sucMessage = "message.vm.status.delete.ok";
        this.failMessage = "message.vm.status.delete.fail";
        timer = 10000;
      }

      const arrAsync = [];
      for (let val of this.eventList) {
        arrAsync.push(this.promiseAction("patch", apiUrl + val.uuid, null));
      }

      Promise.all(arrAsync)
        .then(() => {
          this.handleCancel();
        })
        .catch((error) => {})
        .finally(() => {
          setTimeout(() => {
            this.funcEndMessage();

            if (this.actionFrom == "VMDetail" && this.act.includes("vmDestroy")) {
              //가상머신 상세화면일 경우 삭제시 가상머신 목록 화면으로 이동
              this.$router.push({ name: "VirtualMachine" });
            } else {
              this.parentRefresh();
            }
          }, timer);
        });
    },
    wsDelAction() {
      this.sucMessage = "message.workspace.delete.ok";
      this.failMessage = "message.workspace.delete.fail";
      this.existVmMessage = "message.workspace.delete.existvm";
      this.$message.loading(this.$t("message.workspace.destroying"), 0);

      var apiUrl = "";
      const arrAsync = [];
      // console.log("this.eventList :>> ", this.eventList);
      for (let val of this.eventList) {
        if (val.quantity === 0) {
          apiUrl = "/api/v1/workspace/" + val.uuid;
          arrAsync.push(this.promiseAction("delete", apiUrl, null));
        } else {
          this.existVmCnt = this.existVmCnt + 1;
        }
      }
      // console.log("arrAsync.length :>> ", arrAsync.length);
      if (arrAsync.length > 0) {
        Promise.all(arrAsync)
          .then(() => {
            this.handleCancel();

            if (this.actionFrom == "WSDetail") {
              this.$router.push({ name: "Workspace" });
            } else {
              this.parentRefresh();
            }
          })
          .catch((error) => {})
          .finally(() => {
            this.funcEndMessage();
          });
      } else {
        this.funcEndMessage();
        this.handleCancel();
      }
    },
    accountDelAction() {
      this.confirmLoading = true;
      this.sucMessage = "message.account.destroy.ok";
      this.failMessage = "message.account.destroy.fail";
      this.$message.loading(this.$t("message.account.destroying"), 0);

      var apiUrl = "";
      const arrAsync = [];
      for (let val of this.eventList) {
        apiUrl = "/api/v1/user/" + val.name;
        arrAsync.push(this.promiseAction("delete", apiUrl, null));
      }

      Promise.all(arrAsync)
        .then(() => {
          this.funcEndMessage();
          this.handleCancel();
          if (this.actionFrom == "ACDetail") {
            this.$router.push({ name: "Account" });
          } else {
            this.parentRefresh();
          }
        })
        .catch((error) => {})
        .finally(() => {});
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
      // console.log(this.failCnt, this.succCnt, this.existVmCnt);
      this.$message.destroy();
      if (this.succCnt > 0) {
        this.$message.success(
          this.$t(this.sucMessage, {
            count: this.succCnt,
          })
        );
      }
      if (this.failCnt > 0) {
        this.$message.error(
          this.$t(this.failMessage, {
            count: this.failCnt,
          })
        );
      }
      if (this.existVmCnt > 0) {
        this.$message.error(
          this.$t(this.existVmMessage, {
            count: this.existVmCnt,
          })
        );
      }
      this.failCnt = 0;
      this.succCnt = 0;
      this.existVmCnt = 0;
    },
  },
});
</script>

<style scoped>
#content-action .ant-btn {
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 14px;
}
</style>
