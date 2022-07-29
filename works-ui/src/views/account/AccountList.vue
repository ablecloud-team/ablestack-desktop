<template>
  <a-table
    size="middle"
    :loading="loading"
    :columns="UserListColumns"
    :data-source="userDataList"
    :bordered="false"
    style="overflow-y: auto; overflow: auto"
    :pagination="{
      change: (page, pageSize) => {
        this.state.selectedRowKeys = [];
      },
    }"
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
        <router-link :to="{ path: '/accountDetail/' + text }">
          {{ text }}
        </router-link>
      </template>
      <template v-if="column.dataIndex === 'action'">
        <a-Popover placement="topLeft">
          <template #content>
            <Actions v-if="actionFrom == 'ACList'" :action-from="actionFrom" :account-info="record" @fetchData="fetchRefresh" />
          </template>
          <MoreOutlined />
        </a-Popover>
      </template>
    </template>
  </a-table>
</template>

<script>
import { defineComponent, ref, reactive } from "vue";
import Actions from "@/components/Actions";
import { worksApi } from "@/api";
export default defineComponent({
  components: {
    Actions,
  },
  props: {},
  emits: ["actionFromChange", "downloadListSetting"],
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
      searchInput,
      state,
      handleSearch,
      handleReset,
    };
  },
  data() {
    return {
      actionFrom: ref(""),
      timer: ref(null),
      pagination: {
        // pageSize: ref(20),
        showSizeChanger: true, // display can change the number of pages per page
        pageSizeOptions: ["10", "20", "50", "100", "200"], // number of pages per option
        showTotal: (total) => this.$t("label.total") + ` ${total}` + this.$t("label.items"), // show total
        change: (page, pageSize) => {
          this.state.selectedRowKeys = [];
        },
        showSizeChange: (current, pageSize) => {
          console.log(current, pageSize);
          this.pageSize = pageSize;
        }, // update display when changing the number of pages per page
      },
      userDataList: ref([]),
      UserListColumns: [
        {
          title: this.$t("label.account"),
          dataIndex: "name",
          key: "name",
          width: "22%",
          // slots: {
          //   customRender: "nameRender",
          //   filterDropdown: "filterDropdown",
          //   filterIcon: "filterIcon",
          // },
          sorter: (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
          // defaultSortOrder: "ascend",
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
          title: this.$t("label.lastname"),
          dataIndex: "givenName",
          key: "givenName",
          width: "10%",
          sorter: (a, b) => (a.givenName < b.givenName ? -1 : a.givenName > b.givenName ? 1 : 0),
          sortDirections: ["descend", "ascend"],
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
          width: "10%",
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
          title: this.$t("label.email"),
          dataIndex: "mail",
          key: "mail",
          width: "15%",
          sorter: (a, b) => (a.mail < b.mail ? -1 : a.mail > b.mail ? 1 : 0),
          sortDirections: ["descend", "ascend"],
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
      this.$emit("actionFromChange", "AC", null);
      this.actionFrom = "";
      this.loading = true;
      this.state.selectedRowKeys = [];
      this.state.searchText = "";
      this.fetchData();
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      console.log("selectedRowKeys :>> ", selectedRowKeys);
      this.state.selectedRowKeys = selectedRowKeys;
      this.state.selectedRows = selectedRows;
      if (this.state.selectedRows.length > 0) {
        this.$emit("actionFromChange", "ACList", this.state.selectedRows);
      } else {
        this.$emit("actionFromChange", "AC", null);
      }
    },
    async fetchData() {
      await worksApi
        .get("/api/v1/user")
        .then((response) => {
          if (response.status == 200) {
            if (response.data.result !== null && response.data.result !== undefined) {
              // console.log("response.data.result :>> ", response.data.result);
              this.userDataList = response.data.result;
              this.userDataList = this.userDataList.filter((map) => !["Administrator", "Guest", "krbtgt"].includes(map.name));
              this.userDataList.forEach((value, index, array) => {
                this.userDataList[index].key = index;
              });
            } else {
              this.userDataList = [];
            }
          } else {
            this.$message.error(this.$t("message.response.data.fail"));
            //console.log(response.message);
          }
        })
        .catch((error) => {
          console.log(error);
          this.$message.error(this.$t("message.response.data.fail"));
        })
        .finally(() => {
          this.loading = false;
        });
      this.actionFrom = "ACList";

      this.$emit("downloadListSetting", this.userDataList);
    },
  },
});
</script>

<style scoped></style>
