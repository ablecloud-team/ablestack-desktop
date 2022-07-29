<template>
  <a-spin :spinning="spinning">
    <a-list v-if="actionFrom === 'VMDetail'" item-layout="horizontal">
      <a-list-item>
        <strong>{{ $t("label.name") }}</strong>
        <br />
        {{ resource.instanceMoldInfo.virtualmachine[0].displayname }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.workspace") }}</strong>
        <br />
        {{ resource.instanceDBInfo.workspace_name }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.vm.state") }}</strong>
        <br />{{ resource.instanceDBInfo.state }}

        {{
          resource.instanceDBInfo.mold_status === "Running"
            ? $t("label.vm.status.running")
            : resource.instanceDBInfo.mold_status === "Starting"
            ? $t("label.vm.status.starting")
            : resource.instanceDBInfo.mold_status === "Stopping"
            ? $t("label.vm.status.stopping")
            : resource.instanceDBInfo.mold_status === "Stopped"
            ? $t("label.vm.status.stopped")
            : ""
        }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.users") }}</strong>
        <br />
        {{ resource.instanceDBInfo.owner_account_id == "" ? $t("label.owner.account.false") : resource.instanceDBInfo.owner_account_id }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.vm.session.count") }}</strong>
        <br />
        {{ resource.instanceDBInfo.connected }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.domain") }}</strong>
        <br />
        {{ resource.instanceMoldInfo.virtualmachine[0].domain }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.hypervisor") }}</strong>
        <br />
        {{ resource.instanceMoldInfo.virtualmachine[0].hypervisor }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.pooltype") }}</strong>
        <br />
        {{ resource.instanceMoldInfo.virtualmachine[0].pooltype }}
      </a-list-item>
    </a-list>
    <a-list v-if="actionFrom === 'UserDetail' || actionFrom === 'ACDetail'" item-layout="horizontal">
      <a-list-item>
        <strong>{{ $t("label.account") }}</strong>
        <br />
        {{ resource.username }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.country") }}</strong>
        <br />
        {{ resource.co }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.countryCode") }}</strong>
        <br />
        {{ resource.countryCode }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.title") }}</strong>
        <br />
        {{ resource.title }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.department") }}</strong>
        <br />
        {{ resource.department }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.email") }}</strong>
        <br />
        {{ resource.mail }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.isAdmin") }}</strong
        ><br />
        {{ resource.isAdmin }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.telephoneNumber") }}</strong>
        <br />
        {{ resource.telephoneNumber }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.userPrincipalName") }}</strong>
        <br />
        {{ resource.userPrincipalName }}
      </a-list-item>
      <a-list-item>
        <strong>{{ $t("label.distinguishedName") }}</strong>
        <br />
        {{ resource.distinguishedName }}
      </a-list-item>
    </a-list>
    <a-list v-if="actionFrom === 'GroupPolicyDetail'" item-layout="horizontal">
      <a-list-item>
        <strong>{{ $t("label.account") }}</strong
        ><br />
        {{ resource.username }}
      </a-list-item>
    </a-list>
  </a-spin>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "DetailContent",
  props: {
    actionFrom: {
      type: String,
      required: true,
      default: null,
    },
    resource: {
      type: Object,
      required: true,
      default: null,
    },
  },
  setup(props) {},
  data() {
    return {
      spinning: ref(true),
    };
  },
  created() {
    this.fetchRefresh();
  },
  methods: {
    fetchRefresh() {
      this.fetchData();
      this.spinning = true;
    },
    fetchData() {
      setTimeout(() => {
        this.spinning = false;
      }, 500);
    },
  },
});
</script>

<style scoped>
.detail-content-card {
  margin-bottom: 10px;
  padding: "7px 24px 0px 24px";
  border: "0px";
}
::v-deep(.ant-card-head-title) {
  padding: 0px;
}
</style>
