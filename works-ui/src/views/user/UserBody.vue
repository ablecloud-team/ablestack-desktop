<template>
  <a-space id="content-space" direction="horizontal">
    <a-row id="content-row" style="min-height: 400px">
      <a-col :span="6" style="background: #f0f2f5; padding-right: 8px">
        <!-- 왼쪽 detail 창 -->
        <a-card bordered style="min-height: 300px">
          <UserInfoCard ref="refreshCall1" :resource="resource" />
        </a-card>
      </a-col>

      <a-col :span="18" style="background: #f0f2f5; padding-left: 8px">
        <!-- 오른쪽 tab 창 -->
        <a-card bordered>
          <UserTab ref="refreshCall2" :resource="resource" />
        </a-card>
      </a-col>
    </a-row>
  </a-space>
</template>

<script>
// import TabbedContent from "@/components/TabbedContent";
import UserInfoCard from "./UserInfoCard";
import UserTab from "./UserTab";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    UserInfoCard,
    UserTab,
  },
  props: {
    resource: {
      type: Object,
      required: true,
      default: null,
    },
  },
  setup() {
    return {};
  },
  methods: {
    fetchRefresh() {
      this.$refs.refreshCall1.fetchRefresh();
      this.$refs.refreshCall2.fetchRefresh();
    },
  },
});
</script>
<style>
#content-space,
#content-row {
  width: 100%;
}
#content-space > .ant-space-item {
  width: 100%;
}
</style>
