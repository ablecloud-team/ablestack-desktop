<template>
  <a-table
    size="middle"
    :loading="loading"
    :columns="vmListColumns"
    :data-source="vmDataList"
    style="overflow-y: auto; overflow: auto"
    :pagination="pagination"
    :row-selection="{
      selectedRowKeys: state.selectedRowKeys,
      onChange: onSelectChange,
    }"
  >
    <!-- 검색 필터링 template-->
    <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :placeholder="$t('search.' + column.dataIndex)"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button type="primary" size="small" style="width: 90px; margin-right: 8px" @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
          <template #icon><search-outlined /></template>
          {{ $t("label.search") }}
        </a-button>
        <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
          {{ $t("label.reset") }}
        </a-button>
      </div>
    </template>
    <template #customFilterIcon="{ filtered }">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
    </template>
    <!-- 검색 필터링 template-->

    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'name'">
        <router-link :to="{ path: '/virtualMachineDetail/' + record.uuid }">
          {{ text }}
        </router-link>
      </template>
      <template v-if="column.dataIndex === 'workspace_name'">
        <router-link :to="{ path: '/workspaceDetail/' + record.workspace_uuid }">
          {{ text }}
        </router-link>
      </template>
      <template v-if="column.dataIndex === 'action'">
        <a-Popover placement="topLeft">
          <template #content>
            <Actions v-if="actionFrom === 'VMList'" :action-from="actionFrom" :vm-info="record" @fetchData="fetchRefresh" />
          </template>
          <MoreOutlined />
        </a-Popover>
      </template>
      <template v-if="column.dataIndex === 'workspace_type'">
        {{ record.workspace_type.toUpperCase() }}
      </template>
      <template v-if="column.dataIndex === 'status'">
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
      <template v-if="column.dataIndex === 'handshake_status'">
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
      <template v-if="column.dataIndex === 'owner_account_id'">
        <router-link :to="{ path: '/accountDetail/' + record.owner_account_id }">
          {{ text }}
        </router-link>
      </template>
    </template>
  </a-table>
</template>

<script>
import { defineComponent, ref, reactive } from "vue";
import Actions from "@/components/Actions";
export default defineComponent({
  components: {
    Actions,
  },
  props: {},
  emits: ["actionFromChange"],
  setup() {
    const state = reactive({
      searchText: "",
      searchedColumn: "",
      selectedRowKeys: [],
      selectedRows: [],
    });
    const searchInput = ref();
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
      //console.log(selectedKeys + "  ::  " + confirm + "  ::  " +dataIndex);
    };
    const handleReset = (clearFilters) => {
      clearFilters();
      state.searchText = "";
    };
    return {
      loading: ref(false),
      actionFrom: ref(""),
      searchInput,
      state,
      handleSearch,
      handleReset,
    };
  },
  data() {
    return {
      timer: ref(null),
      pagination: {
        // pageSize: 10,
        showSizeChanger: true, // display can change the number of pages per page
        pageSizeOptions: ["10", "20", "50", "100", "200"], // number of pages per option
        showTotal: (total) => this.$t("label.total") + ` ${total}` + this.$t("label.items"), // show total
        // showSizeChange: (current, pageSize) => (this.pageSize = pageSize), // update display when changing the number of pages per page
      },
      vmDataList: ref([]),
      vmListColumns: [
        {
          title: this.$t("label.name"),
          dataIndex: "name",
          key: "name",
          width: "22%",
          // slots: {
          //   customRender: "nameRender",
          //   filterDropdown: "filterDropdown",
          //   filterIcon: "filterIcon",
          // },
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          ellipsis: true,
          customFilterDropdown: true,
          onFilter: (value, record) => record.name.toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.$refs.searchInput.focus();
              }, 100);
            }
          },
        },
        {
          title: "",
          key: "action",
          dataIndex: "action",
          align: "right",
          width: "3%",
          // slots: { customRender: "actionRender" },
        },
        {
          title: this.$t("label.workspace"),
          dataIndex: "workspace_name",
          key: "workspace_name",
          width: "15%",
          sorter: (a, b) => (a.workspace_name < b.workspace_name ? -1 : a.workspace_name > b.workspace_name ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          ellipsis: true,
          // slots: { customRender: "workspaceRender" },
        },
        {
          title: this.$t("label.workspacetype"),
          dataIndex: "workspace_type",
          key: "workspace_type",
          width: "20%",
          // slots: {
          //   customRender: "typeRender",
          //   filterDropdown: "filterDropdown",
          //   filterIcon: "filterIcon",
          // },
          sorter: (a, b) => (a.workspace_type < b.workspace_type ? -1 : a.workspace_type > b.workspace_type ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          //onFilter: (value, record) => record.Type.toUpperCase().indexOf(value) === 0,
          //filterMultiple: false,
          // filters: [
          //   {
          //     text: 'DESKTOP',
          //     value: 'DESKTOP',
          //   },
          //   {
          //     text: 'APP',
          //     value: 'APP',
          //   },
          // ]
          customFilterDropdown: true,
          onFilter: (value, record) => record.workspace_type.toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.$refs.searchInput.focus();
              }, 100);
            }
          },
        },
        {
          title: this.$t("label.users"),
          dataIndex: "owner_account_id",
          key: "owner_account_id",
          width: "10%",
          sorter: (a, b) => (a.owner_account_id < b.owner_account_id ? -1 : a.owner_account_id > b.owner_account_id ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          // slots: { customRender: "userRender" },
        },
        {
          title: this.$t("label.vm.state"),
          dataIndex: "status",
          key: "status",
          width: "10%",
          sorter: (a, b) => (a.state < b.state ? -1 : a.status > b.status ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          // slots: { customRender: "vmStateRender" },
        },
        {
          title: this.$t("label.vm.ready.state"),
          dataIndex: "handshake_status",
          key: "handshake_status",
          width: "20%",
          sorter: (a, b) => (a.handshake_status < b.handshake_status ? -1 : a.handshake_status > b.handshake_status ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          // slots: { customRender: "vmReadyStateRender" },
        },
        {
          title: this.$t("label.vm.network.ip"),
          dataIndex: "ipaddress",
          key: "ipaddress",
          width: "15%",
          sorter: (a, b) => (a.ipaddress < b.ipaddress ? -1 : a.ipaddress > b.ipaddress ? 1 : 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: this.$t("label.vm.session.count"),
          dataIndex: "connected",
          key: "connected",
          width: "10%",
          sorter: (a, b) => (a.connected < b.connected ? -1 : a.connected > b.connected ? 1 : 0),
          sortDirections: ["descend", "ascend"],
          // slots: { customRender: "sessionRender" },
        },
      ],
    };
  },
  created() {
    this.fetchRefresh();
    this.timer = setInterval(() => {
      //60초 자동 갱신
      this.fetchData();
    }, 60000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    fetchRefresh() {
      this.$emit("actionFromChange", "VM", null);
      this.loading = true;
      this.actionFrom = "";
      this.state.selectedRowKeys = [];
      this.state.searchText = "";
      this.fetchData();
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.state.selectedRowKeys = selectedRowKeys;
      this.state.selectedRows = selectedRows;
      if (this.state.selectedRows.length > 0) {
        this.$emit("actionFromChange", "VMList", this.state.selectedRows);
      } else {
        this.$emit("actionFromChange", "VM", null);
      }
    },
    async fetchData() {
      await this.$worksApi
        .get("/api/v1/instance/all")
        .then((response) => {
          if (response.status == 200) {
            if (response.data.result.instanceInfo !== null) {
              this.vmDataList = response.data.result.instanceInfo;
              this.vmDataList.forEach((value, index, array) => {
                this.vmDataList[index].key = index;
              });
            }
          } else {
            this.$message.error(this.$t("message.response.data.fail"));
          }
        })
        .catch((error) => {
          this.$message.error(this.$t("message.response.data.fail"));
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });

      this.actionFrom = "VMList";
    },
  },
});
</script>
<style scoped lang="scss"></style>
