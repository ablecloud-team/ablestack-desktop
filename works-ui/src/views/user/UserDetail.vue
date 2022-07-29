<template>
  <div id="content-layout">
    <a-layout>
      <a-layout-header id="content-header">
        <div>
          <a-row>
            <a-col id="content-path" :span="12">
              <Apath :paths="[{ name: resource.username, component: null }]" />
              <a-button shape="round" style="margin-left: 20px" size="small" @click="refresh()">
                <template #icon><ReloadOutlined /></template>
                {{ $t("label.refresh") }}
              </a-button>
            </a-col>

            <a-col id="content-action" :span="12">
              <Actions v-if="actionFrom" :action-from="actionFrom" :account-info="resource" />
            </a-col>
          </a-row>
        </div>
      </a-layout-header>
      <a-layout-content>
        <div id="content-body">
          <UserBody ref="refreshCall" :resource="resource" />
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import Actions from "../../components/Actions";
import Apath from "../../components/Apath";
import UserBody from "./UserBody";
import { defineComponent, ref } from "vue";
export default defineComponent({
  components: {
    UserBody,
    Apath,
    Actions,
  },
  props: {},
  setup() {
    return {
      actionFrom: ref(""),
    };
  },
  data() {
    return {
      resource: ref([]),
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    refresh() {
      this.fetchData();
      this.$refs.refreshCall.fetchRefresh();
    },
    async fetchData() {
      await this.$worksApi
        .get("/api/v1/user/" + sessionStorage.getItem("userName"))
        .then((response) => {
          if (response.status == 200) {
            this.resource = response.data.result;
          } else {
            this.$message.error(this.$t("message.response.data.fail"));
          }
        })
        .catch((error) => {
          this.$message.error(this.$t("message.response.data.fail"));
          console.log(error);
        });
      this.actionFrom = "USDetail";
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#content-layout .ant-layout-content {
  background: #f0f2f5;
  padding: 10px;
}
#content-layout .ant-layout-header {
  text-align: left;
  background: white;
  border: 1px solid #e8e8e8;
  /*color: #fff;*/
  font-size: 14px;
  line-height: 1.5;
  padding: 20px;
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
</style>
