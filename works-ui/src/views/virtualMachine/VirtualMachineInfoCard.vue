<template>
  <a-spin :spinning="spinning">
    <div class="resource-details">
      <div class="resource-details__name">
        <a-avatar shape="square" :size="60">
          <template #icon>
            <DesktopOutlined />
          </template>
        </a-avatar>
        <h4 style="margin-left: 20px">
          {{ resource.instanceDBInfo.name }}
        </h4>
      </div>
    </div>

    <div id="Status" class="CardItem">
      <div class="ItemName">{{ $t("label.vm.state") }}</div>
      <div class="Item">
        <a-tooltip placement="bottom">
          <template #title>{{ resource.instanceDBInfo.mold_status }}</template>
          <a-badge
            class="head-example"
            :color="
              ['Running'].includes(resource.instanceDBInfo.mold_status)
                ? 'green'
                : ['Stopping', 'Starting'].includes(resource.instanceDBInfo.mold_status)
                ? 'blue'
                : ['Stopped'].includes(resource.instanceDBInfo.mold_status)
                ? 'red'
                : 'grey'
            "
            :text="
              resource.instanceDBInfo.mold_status === 'Running'
                ? $t('label.vm.status.running')
                : resource.instanceDBInfo.mold_status === 'Starting'
                ? $t('label.vm.status.starting')
                : resource.instanceDBInfo.mold_status === 'Stopping'
                ? $t('label.vm.status.stopping')
                : resource.instanceDBInfo.mold_status === 'Stopped'
                ? $t('label.vm.status.stopped')
                : ''
            "
          />
        </a-tooltip>
      </div>
    </div>

    <div id="Status" class="CardItem">
      <div class="ItemName">{{ $t("label.vm.ready.state") }}</div>
      <div class="Item">
        <a-tooltip placement="bottom">
          <template #title>{{ resource.instanceDBInfo.handshake_status }}</template>
          <a-badge
            class="head-example"
            :color="
              ['Joining', 'Joined'].includes(resource.instanceDBInfo.handshake_status)
                ? 'yellow'
                : resource.instanceDBInfo.handshake_status === 'Ready'
                ? 'green'
                : 'red'
            "
            :text="
              ['Not Ready', 'Pending'].includes(resource.instanceDBInfo.handshake_status)
                ? $t('label.vm.status.initializing') + '(' + resource.instanceDBInfo.handshake_status + ')'
                : ['Joining', 'Joined'].includes(resource.instanceDBInfo.handshake_status)
                ? $t('label.vm.status.configuring') + '(' + resource.instanceDBInfo.handshake_status + ')'
                : ['Ready'].includes(resource.instanceDBInfo.handshake_status)
                ? $t('label.vm.status.ready')
                : $t('label.vm.status.notready')
            "
          />
        </a-tooltip>
      </div>
    </div>
    <div id="ID" class="CardItem">
      <div class="ItemName">{{ $t("label.uuid") }}</div>
      <div class="Item">
        {{ resource.instanceDBInfo.uuid }}
      </div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.createdate") }}</div>
      <div class="Item">{{ resource.instanceDBInfo.create_date }}</div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.ostype") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].osdisplayname }}</div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.cpu.size") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].cputotal }}</div>
      <a-progress :percent="parseFloat(resource.instanceMoldInfo.virtualmachine[0].cpuused.split('%')[0])" size="small" status="active" style="width: 97%" />
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.memory.size") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].memory }} MB</div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.disk.size") }}</div>
      <div class="Item">
        {{ resource.instanceInstanceVolumeInfo.volume[0].sizegb }}<br />
        <a-tag>
          {{ $t("label.read") + " " + (resource.instanceMoldInfo.virtualmachine[0].diskkbsread / 1048576).toFixed(2) }}
          GB</a-tag
        >
        <a-tag>
          {{ $t("label.write") + " " + (resource.instanceMoldInfo.virtualmachine[0].diskkbswrite / 1048576).toFixed(2) }}
          GB</a-tag
        ><br />
        <a-tag> {{ $t("label.read.io") + " " + resource.instanceMoldInfo.virtualmachine[0].diskioread }}</a-tag>
        <a-tag> {{ $t("label.write.io") + " " + resource.instanceMoldInfo.virtualmachine[0].diskiowrite }}</a-tag>
      </div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.network") }}</div>
      <div class="Item">
        <a-tag> <ArrowUpOutlined /> RX {{ resource.instanceMoldInfo.virtualmachine[0].networkkbsread }} KB</a-tag>
        <a-tag> <ArrowDownOutlined /> TX {{ resource.instanceMoldInfo.virtualmachine[0].networkkbswrite }} KB</a-tag><br />
        {{ resource.instanceMoldInfo.virtualmachine[0].nic[0].networkname }} ({{ resource.instanceMoldInfo.virtualmachine[0].nic[0].type }})
      </div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.network.ip") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].nic[0].ipaddress }}</div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.template") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].templatename }}</div>
    </div>
    <div class="CardItem">
      <div class="ItemName">{{ $t("label.vm.serviceOffering") }}</div>
      <div class="Item">{{ resource.instanceMoldInfo.virtualmachine[0].serviceofferingname }}</div>
    </div>
  </a-spin>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  components: {},
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
      this.spinning = true;
      setTimeout(() => {
        this.spinning = false;
      }, 500);
    },
  },
});
</script>

<style lang="scss" scoped>
.CardItem {
  margin-bottom: 20px;
}
::v-deep(.ant-badge-status-dot) {
  width: 12px;
  height: 12px;
}
.ItemName {
  font-size: 14px;
  font-weight: bold;
}
.resource-details {
  text-align: center;
  margin-bottom: 20px;

  &__name {
    display: flex;
    align-items: center;
    align-content: center;
    text-align: center;

    .ant-avata {
      margin-right: 20px;
      overflow: hidden;
      min-width: 50px;
      cursor: pointer;
      img {
        height: 100%;
        width: 100%;
      }
    }
    h4 {
      font-size: 18px;
    }
  }
}
</style>
