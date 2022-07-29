<template>
  <a-button v-if="state.addButtonBool" type="dashed" block style="padding-bottom: 10px" :disabled="state.statusReadyBool" @click="changeModal(tapName, true)">
    <PlusOutlined />
    {{ state.addButtontext }}
  </a-button>

  <a-alert
    v-if="state.statusReadyBool"
    :message="$t('message.workspace.test.status') + ' : ' + state.statusReadyMessage"
    :description="state.statusReadyDescription"
    type="info"
    show-icon
  />

  <!-- selection 시용시 일괄버튼 보여주는 영역 -->
  <div v-if="actionFrom === 'VMList' || actionFrom === 'WSUserList'" style="padding-left: 20px; padding-top: 1px; text-align: left; height: 33px">
    <Actions v-if="vis" :action-from="actionFrom" :multi-select-list="state.selectedRows" :ws-name="resource.workspaceInfo.name" @fetchData="parentRefresh" />
  </div>
  <!-- selection 시용시 일괄버튼 보여주는 영역 -->
  <a-table
    :loading="loading"
    size="small"
    style="margin-left: 5px"
    :columns="columns"
    :data-source="dataList"
    :pagination="pagination"
    :row-selection="
      actionFrom === 'VMList' || actionFrom === 'WSUserList'
        ? {
            selectedRowKeys: state.selectedRowKeys,
            onChange: onSelectChange,
          }
        : null
    "
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'name'">
        <span v-if="actionFrom !== undefined && actionFrom === 'VMList'">
          <router-link :to="{ path: '/virtualMachineDetail/' + record.uuid }">
            {{ record.name }}
          </router-link>
        </span>
        <span v-else-if="actionFrom !== undefined && actionFrom === 'WSUserList'">
          <router-link :to="{ path: '/accountDetail/' + record.name }">
            {{ record.name }}
          </router-link>
        </span>
        <span v-else>
          {{ record.name }}
        </span>
      </template>

      <template v-if="column.dataIndex === 'value'">
        <!-- {{ record.settable_value.split(",").map((item) => ({ value: item })) }} -->

        <div>
          <a-select
            v-if="editableData[record.name] && record.settable_type == 'S'"
            v-model:value="editableData[record.name][column.dataIndex]"
            style="width: 100%"
            :options="record.settable_value.split(',').map((item) => ({ value: item }))"
          ></a-select>
          <a-input
            v-else-if="editableData[record.name] && record.settable_type == 'T'"
            v-model:value="editableData[record.name][column.dataIndex]"
            style="width: 100%"
          />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template v-if="column.dataIndex === 'action' && actionRef === 'VMList'">
        <a-popover placement="bottom">
          <template #content>
            <a-space direction="horizontal">
              <Actions :action-from="actionFrom" :vm-info="record" :ws-info="resource.workspaceInfo" @fetchData="parentRefresh" />
            </a-space>
          </template>
          <MoreOutlined />
        </a-popover>
      </template>
      <template v-if="column.dataIndex === 'action' && actionFrom === 'WSUserList'">
        <a-popconfirm :title="$t('message.delete.confirm')" :ok-text="$t('label.ok')" :cancel-text="$t('label.cancel')" @confirm="wsUserDel(record.name)">
          <a-tooltip placement="bottom">
            <template #title>{{ $t("tooltip.destroy") }}</template>
            <a-button type="primary" shape="circle" danger size="small">
              <template #icon>
                <DeleteFilled />
              </template>
            </a-button>
          </a-tooltip>
        </a-popconfirm>
      </template>
      <template v-if="column.dataIndex === 'i18N' && actionFrom === 'WSPolicyList'">
        {{ $t(text) }}
      </template>

      <template v-if="column.dataIndex === 'action' && actionFrom === 'WSPolicyList'">
        <span v-if="editableData[record.name]">
          <a-tooltip placement="bottom">
            <template #title>{{ $t("tooltip.destroy") }}</template>
            <a-button shape="circle" @click="editCancel(record.name)" size="small">
              <CloseCircleOutlined style="color: red" />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template #title>{{ $t("tooltip.save") }}</template>
            <a-button shape="circle" @click="editSave(record.name)" size="small">
              <CheckCircleOutlined style="color: #52c41a" />
            </a-button>
          </a-tooltip>
        </span>
        <span v-else>
          <a-tooltip placement="bottom">
            <template #title>{{ $t("tooltip.edit") }}</template>
            <a-button shape="circle" @click="editAction(record.name)" size="small">
              <EditOutlined />
            </a-button>
          </a-tooltip>
        </span>
      </template>

      <template v-if="column.dataIndex === 'owner_account_id'">
        <router-link :to="{ path: '/accountDetail/' + record.owner_account_id }">
          {{ record.owner_account_id }}
        </router-link>
      </template>
      <template v-if="column.dataIndex === 'mold_status'">
        <a-badge
          class="head-example"
          :color="
            ['Running'].includes(record.mold_status)
              ? 'green'
              : ['Stopping', 'Starting'].includes(record.mold_status)
              ? 'blue'
              : ['Stopped'].includes(record.mold_status)
              ? 'red'
              : 'grey'
          "
          :text="
            record.mold_status === 'Running'
              ? $t('label.vm.status.running')
              : record.mold_status === 'Starting'
              ? $t('label.vm.status.starting')
              : record.mold_status === 'Stopping'
              ? $t('label.vm.status.stopping')
              : record.mold_status === 'Stopped'
              ? $t('label.vm.status.stopped')
              : ''
          "
        />
      </template>

      <template v-if="column.dataIndex === 'status'">
        <a-tooltip placement="bottom">
          <template #title>{{ record.handshake_status }}</template>
          <a-badge
            class="head-example"
            :color="['Joining', 'Joined'].includes(record.handshake_status) ? 'yellow' : record.handshake_status === 'Ready' ? 'green' : 'red'"
            :text="
              ['Not Ready', 'Pending'].includes(record.handshake_status)
                ? $t('label.vm.status.initializing') + '(' + record.handshake_status + ')'
                : ['Joining', 'Joined'].includes(record.handshake_status)
                ? $t('label.vm.status.configuring') + '(' + record.handshake_status + ')'
                : ['Ready'].includes(record.handshake_status)
                ? $t('label.vm.status.ready')
                : $t('label.vm.status.notready')
            "
          />
        </a-tooltip>
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:visible="state.addVmModalBoolean"
    :title="state.addButtontext"
    width="500px"
    :confirm-loading="confirmLoading"
    :ok-text="$t('label.ok')"
    :cancel-text="$t('label.cancel')"
    @ok="wsVmAdd"
  >
    <p>
      {{
        $t("modal.confirm.workspace.add.vm", {
          name: resource.workspaceInfo.name,
        })
      }}
    </p>
    <a-input-number id="inputNumber" v-model:value="selectedVmQuantity" style="width: 100%; margin-top: 7px" :title="'Desktop Quantity'" :min="1" />
  </a-modal>

  <a-modal
    v-model:visible="state.addUserModalBoolean"
    :title="state.addButtontext"
    width="500px"
    :confirm-loading="confirmLoading"
    :ok-text="$t('label.ok')"
    :cancel-text="$t('label.cancel')"
    @ok="wsUserAdd"
  >
    <p>
      {{
        $t("modal.confirm.workspace.add.user", {
          name: resource.workspaceInfo.name,
        })
      }}
    </p>
    <a-select
      v-model:value="selectedUser"
      :placeholder="$t('tooltip.user')"
      mode="multiple"
      style="width: 98%"
      option-filter-prop="label"
      class="addmodal-aform-item-div"
      :options="
        filteredOptions.map((item) => ({
          value: item.name,
          label: item.name === 'Guest' ? '👤&nbsp;&nbsp;&nbsp;&nbsp;' + item.name : '👤&nbsp;&nbsp;&nbsp;&nbsp;' + item.name,
        }))
      "
    >
      <!--👥 <a-select-option
        v-for="option in addAbleUserList"
        :key="option.name"
        :value="option.name"
        :label="option.name"
        >
        {{ option.name }}
      </a-select-option> -->
    </a-select>
  </a-modal>
</template>

<script>
import { defineComponent, reactive, ref, computed } from "vue";
import { cloneDeep } from "lodash-es";
import Actions from "../components/Actions";

export default defineComponent({
  components: {
    Actions,
  },
  props: {
    tapName: {
      type: String,
      required: true,
      default: "",
    },
    actionFrom: {
      type: String,
      required: false,
      default: "",
    },
    resource: {
      type: Object,
      required: true,
      default: null,
    },
  },
  emits: ["parentRefresh"],
  setup() {
    const state = reactive({
      addVmModalBoolean: ref(false),
      addUserModalBoolean: ref(false),
      addButtonBool: ref(false),
      addButtontext: ref(""),
      statusReadyBool: ref(false),
      statusReadyMessage: ref(""),
      statusReadyDescription: ref(""),
      modalConfirm: ref(""),
      modalTitle: ref(""),
      selectedRowKeys: [],
      selectedRows: [],
    });
    return {
      state,
      editingKey: "",
      editableData: reactive({}),
    };
  },
  data() {
    return {
      settable_value: ref(["jack"]),
      aaa: ["NL", "30", "45", "60", "90", "180", "365"],
      confirmLoading: ref(false),
      actionRef: ref(""),
      workspaceName: ref(""),
      dataList: ref([]),
      loading: ref(false),
      addAbleUserList: ref([]),
      selectedUser: ref([]),
      selectedVmQuantity: ref(1),
      columns: ref([]),
      deleteUser: ref(""),
      vis: ref(false),
      succCnt: ref(0),
      failCnt: ref(0),
      pagination: {
        // pageSize: 10,
        showSizeChanger: true, // display can change the number of pages per page
        pageSizeOptions: ["10", "20", "50", "100", "200"], // number of pages per option
        showTotal: (total) => this.$t("label.total") + ` ${total}` + this.$t("label.items"), // show total
        // showSizeChange: (current, pageSize) => (this.pageSize = pageSize), // update display when changing the number of pages per page
      },
      rowSelection: ref(null),
      filteredOptions: computed(() => this.addAbleUserList.filter((o) => !this.selectedUser.includes(o.name))),
    };
  },
  created() {
    this.fetchRefresh();
    if (null == this.resource.workspaceInfo) {
      this.workspaceName = "";
    } else {
      this.workspaceName = this.resource.workspaceInfo.name;
    }
  },
  methods: {
    parentRefresh() {
      this.$emit("parentRefresh");
    },
    changeModal(target, value) {
      if (target == "desktop") {
        this.state.addVmModalBoolean = value;
      } else if (target == "user") {
        this.state.addUserModalBoolean = value;
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      // console.log(selectedRowKeys, selectedRows);
      this.vis = false;
      this.state.selectedRowKeys = selectedRowKeys;

      if (selectedRows.length > 0) {
        setTimeout(() => {
          this.state.selectedRows = selectedRows;
          //console.log(this.state.selectedRows);
          this.vis = true;
        }, 100);
      } else {
        this.vis = false;
      }
    },
    fetchRefresh(refreshClick) {
      if (refreshClick) this.loading = true;
      else this.loading = false;
      this.actionRef = "";
      this.vis = false;
      this.state.selectedRowKeys = [];
      this.state.selectedRows = [];

      this.fetchData();
    },
    fetchData() {
      if (this.tapName.includes("desktop")) {
        this.state.addButtonBool = ref(true);
        this.fetchDesktop();
        let stat = this.resource.workspaceInfo.template_ok_check;
        if (stat === "Ready") {
          this.state.statusReadyBool = false; //워크스페이스 Agent상태가 OK일때 데스크톱가상머신추가 활성화
        } else {
          this.state.statusReadyBool = true;
          if (stat === "Not Ready") {
            this.state.statusReadyMessage = this.$t("message.workspace.test.vmcreate");
          } else if (stat === "Pending") {
            this.state.statusReadyMessage = this.$t("message.workspace.test.initializing");
          } else if (stat === "Joining" || stat === "Joined") {
            this.state.statusReadyMessage = this.$t("message.workspace.test.configuring");
          }
          this.state.statusReadyDescription = this.$t("message.workspace.test");
        }
      } else if (this.tapName.includes("user")) {
        this.state.addButtonBool = ref(true);
        this.fetchUser();
      } else if (this.tapName.includes("policy")) {
        this.fetchPolicy();
      } else if (this.tapName.includes("network")) {
        this.fetchNetwork();
        // this.rowSelection = null;
      } else if (this.tapName.includes("datadisk")) {
        this.fetchDatadisk();
        // this.rowSelection = null;
      }

      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    fetchDesktop() {
      this.state.addButtontext = this.$t("label.desktop.vm.add");
      this.columns = [
        {
          dataIndex: "name",
          key: "name",
          title: this.$t("label.name"),
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.action"),
          key: "action",
          dataIndex: "action",
          width: "60px",
        },
        {
          title: this.$t("label.users"),
          dataIndex: "owner_account_id",
          key: "owner_account_id",
          sorter: (a, b) => (a.owner_account_id < b.owner_account_id ? -1 : a.owner_account_id > b.owner_account_id ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.vm.state"),
          dataIndex: "mold_status",
          key: "mold_status",
          sorter: (a, b) => (a.mold_status < b.mold_status ? -1 : a.mold_status > b.mold_status ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.vm.ready.state"),
          dataIndex: "status",
          key: "status",
          sorter: (a, b) => (a.status < b.status ? -1 : a.status > b.status ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },

        // {
        //   title: this.$t("label.desktop.connect.boolean"),
        //   dataIndex: "connected",
        //   key: "connected",
        //   sorter: (a, b) =>
        //     a.connected < b.connected
        //       ? -1
        //       : a.connected > b.connected
        //       ? 1
        //       : 0,
        //   sortDirections: ["descend", "ascend"],
        //   slots: { customRender: "connRender" },
        // },
      ];

      if (this.resource.instanceList !== undefined && this.resource.instanceList !== null) {
        this.dataList = this.resource.instanceList;
        this.dataList.forEach((value, index, array) => {
          this.dataList[index].key = index;
        });
      }

      // tooltip action버튼 리로드 시 시간차가 필요함.
      setTimeout(() => {
        this.actionRef = "VMList";
      }, 100);
    },
    async fetchUser() {
      this.state.addButtontext = this.$t("label.desktop.user.add");
      this.columns = [
        {
          dataIndex: "name",
          key: "name",
          title: this.$t("label.name"),
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.lastname"),
          dataIndex: "givenName",
          key: "givenName",
          width: "10%",
          sorter: (a, b) => (a.givenName < b.givenName ? -1 : a.givenName > b.givenName ? 1 : 0),
        },
        {
          title: this.$t("label.firstname"),
          dataIndex: "sn",
          key: "sn",
          width: "10%",
          sorter: (a, b) => (a.sn < b.sn ? -1 : a.sn > b.sn ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.title"),
          dataIndex: "title",
          key: "title",
          width: "15%",
          sorter: (a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.department"),
          dataIndex: "department",
          key: "department",
          width: "10%",
          sorter: (a, b) => (a.department < b.department ? -1 : a.department > b.department ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.phone"),
          dataIndex: "telephoneNumber",
          key: "telephoneNumber",
          width: "15%",
          sorter: (a, b) => (a.telephoneNumber < b.telephoneNumber ? -1 : a.telephoneNumber > b.telephoneNumber ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.action"),
          key: "action",
          dataIndex: "action",
          width: "60px",
        },
      ];
      var userInWorkspaceList = [];
      if (this.resource.groupDetail.member !== undefined && this.resource.groupDetail.member !== null) {
        for (let str of this.resource.groupDetail.member) {
          userInWorkspaceList.push({ name: str.split(",")[0].split("CN=")[1] });
        }
      }
      // 워크스페이스에 추가 할 사용자 목록 조회
      await this.$worksApi
        .get("/api/v1/user")
        .then((response) => {
          if (response.status == 200) {
            if (response.data.result !== null && response.data.result.length !== 0 && response.data.result !== undefined) {
              this.addAbleUserList = response.data.result.filter(function (o1) {
                return !userInWorkspaceList.some(function (o2) {
                  return o1.name == o2.name;
                });
              });
              userInWorkspaceList = response.data.result.filter(function (o1) {
                return userInWorkspaceList.some(function (o2) {
                  return o1.name == o2.name;
                });
              });
            } else {
              this.addAbleUserList = [];
            }
          } else {
            this.$message.error(this.$t("message.response.data.fail"));
          }
        })
        .catch((error) => {
          this.$message.destroy();
          this.$message.error(this.$t("message.response.data.fail"));
        });

      this.dataList = userInWorkspaceList;
      this.dataList.forEach((value, index, array) => {
        this.dataList[index].key = index;
      });
    },
    fetchPolicy() {
      this.columns = [
        {
          dataIndex: "name",
          key: "name",
          width: "20%",
          title: this.$t("label.name"),
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          defaultSortOrder: "ascend",
          sortDirections: ["descend", "ascend"],
        },
        // {
        //   title: this.$t("label.description"),
        //   dataIndex: "description",
        //   key: "description",
        //   width: "40%",
        // },
        {
          title: this.$t("label.description"),
          dataIndex: "i18N",
          key: "i18N",
        },
        {
          title: this.$t("label.value"),
          dataIndex: "value",
          key: "value",
          width: "20%",
        },
        {
          title: this.$t("label.action"),
          dataIndex: "action",
          align: "center",
          width: "80px",
        },
      ];
      if (this.resource.workspacePolicy !== undefined && this.resource.workspacePolicy !== null) {
        if (this.tapName === "gpolicy") {
          this.dataList = this.resource.workspacePolicy.filter((it) => it.type == "R");
        } else if (this.tapName === "wpolicy") {
          this.dataList = this.resource.workspacePolicy.filter((it) => it.type == "C");
        }
      }
    },
    fetchNetwork() {
      this.columns = [
        {
          dataIndex: "name",
          key: "name",
          // slots: { customRender: "nameRender" },
          title: this.$t("label.name"),
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        // {
        //   title: "",
        //   key: "action",
        //   dataIndex: "action",
        //   align: "right",
        //   width: "5px",
        //   slots: { customRender: "actionRender" },
        // },
        {
          title: this.$t("label.state"),
          dataIndex: "state",
          key: "state",
          sorter: (a, b) => (a.state < b.state ? -1 : a.state > b.state ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          // slots: { customRender: "stateRender" },
        },
      ];
      // 워크스페이스 네트워크 조회
      if (this.resource.networkInfo.network !== undefined && this.resource.networkInfo.network !== null) this.dataList = this.resource.networkInfo.network;
    },
    fetchDatadisk() {
      this.columns = [
        {
          dataIndex: "name",
          key: "name",
          // slots: { customRender: "nameRender" },
          title: this.$t("label.name"),
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        // {
        //   title: "",
        //   key: "action",
        //   dataIndex: "action",
        //   align: "right",
        //   width: "5px",
        //   slots: { customRender: "actionRender" },
        // },
        {
          title: this.$t("label.type"),
          dataIndex: "type",
          key: "type",
          sorter: (a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.size"),
          dataIndex: "sizegb",
          key: "sizegb",
          sorter: (a, b) => (a.sizegb < b.sizegb ? -1 : a.sizegb > b.sizegb ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
      ];

      // console.log(this.resource.instanceInstanceVolumeInfo.volume);
      // 가상머신 데이터디스크 조회
      if (this.resource.instanceInstanceVolumeInfo.volume !== undefined && this.resource.instanceInstanceVolumeInfo.volume !== null)
        this.dataList = this.resource.instanceInstanceVolumeInfo.volume;
    },
    async funcDelay(delay) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve("delay call!");
        }, delay);
      });
    },
    funcEndMessage() {
      // console.log(this.succCnt, this.failCnt);
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
      this.failCnt = 0;
      this.succCnt = 0;
    },
    //데스크톱 가상머신 개수선택해 추가
    wsVmAdd(e) {
      e.preventDefault();
      this.confirmLoading = true;

      this.sucMessage = "message.workspace.vm.add.success";
      this.failMessage = "message.workspace.vm.add.fail";
      this.$message.loading(this.$t("message.workspace.vm.adding"), 0);

      let params = new URLSearchParams();
      params.append("uuid", this.$route.params.workspaceUuid);
      params.append("quantity", this.selectedVmQuantity);

      const arrAsync = [];
      const apiUrl = "/api/v1/instance";

      arrAsync.push(this.promiseAction("put", apiUrl, params));

      Promise.all(arrAsync)
        .then(() => {
          this.parentRefresh();
          this.changeModal("desktop", false);
          this.confirmLoading = false;
        })
        .catch((error) => {})
        .finally(() => {
          setTimeout(() => {
            this.parentRefresh();
            this.succCnt = this.selectedVmQuantity;
            this.funcEndMessage();
          }, 20000);
        });
    },
    //워크스페이스에 사용자 추가
    wsUserAdd() {
      this.confirmLoading = true;
      //console.log(this.selectedUser);
      if (this.selectedUser.length == 0) return false;

      this.sucMessage = "message.workspace.user.add.ok";
      this.failMessage = "message.workspace.user.add.fail";
      this.$message.loading(this.$t("message.workspace.vm.user.adding"), 0);

      var apiUrl = "";
      const arrAsync = [];
      for (let val of this.selectedUser) {
        apiUrl = "/api/v1/group/" + this.resource.workspaceInfo.name + "/" + val;
        arrAsync.push(this.promiseAction("put", apiUrl, null));
      }
      Promise.all(arrAsync)
        .then(() => {
          this.parentRefresh();
        })
        .catch((error) => {})
        .finally(() => {
          setTimeout(() => {
            this.funcEndMessage();
            this.selectedUser = [];
            this.changeModal("user", false);
            this.confirmLoading = false;
          }, 1000);
        });
    },
    //워크스페이스에 추가된 목록중 선택된 1개 항목을 삭제
    wsUserDel(val) {
      this.sucMessage = "message.workspace.user.delete.ok";
      this.failMessage = "message.workspace.user.delete.fail";
      this.$message.loading(this.$t("message.workspace.vm.user.deleting"), 0);

      const arrAsync = [];
      const apiUrl = "/api/v1/group/" + this.resource.workspaceInfo.name + "/" + val;
      arrAsync.push(this.promiseAction("delete", apiUrl, null));

      Promise.all(arrAsync)
        .then(() => {
          this.parentRefresh();
        })
        .catch((error) => {})
        .finally(() => {
          setTimeout(() => {
            this.funcEndMessage();
          }, 1000);
        });
    },
    promiseAction(apiMethod, apiUrl, param) {
      return new Promise((resolve, reject) => {
        this.$worksApi({ url: apiUrl, method: apiMethod, data: param })
          .then((response) => {
            if (response.status === 200) this.succCnt = this.succCnt + 1;
            else this.failCnt = this.failCnt + 1;
            resolve(response.status);
          })
          .catch((error) => {
            this.failCnt = this.failCnt + 1;
            reject(error);
          });
      });
    },
    editAction(name) {
      this.editableData[name] = cloneDeep(this.dataList.filter((item) => name === item.name)[0]);
    },
    editCancel(name) {
      delete this.editableData[name];
    },
    async editSave(name) {
      Object.assign(this.dataList.filter((item) => name === item.name)[0], this.editableData[name]);

      // console.log(this.$route.params.workspaceUuid, this.editableData[name].name, this.editableData[name].value);
      let params = new URLSearchParams();

      params.append("policyName", this.editableData[name].name);
      params.append("policyValue", this.editableData[name].value);

      try {
        const res = await this.$worksApi.patch("/api/v1/policy/" + this.$route.params.workspaceUuid, params);
        if (res.status == 200) {
          this.$message.success(
            this.$t("message.workspace.policy.data.update.success", {
              name: this.editableData[name].name,
            })
          );
        } else {
          this.$message.error(
            this.$t("message.workspace.policy.data.update.fail", {
              name: this.editableData[name].name,
            })
          );
        }
      } catch (error) {
        this.$message.error(
          this.$t("message.workspace.policy.data.update.fail", {
            name: this.editableData[name].name,
          })
        );
        console.log(error);
      }
      delete this.editableData[name];

      this.fetchRefresh();
    },
  },
});
</script>

<style scoped></style>
