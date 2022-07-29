<template>
  <a-row :gutter="[8, 8]" type="flex" justify="center" align="top">
    <a-col flex="230px">
      <h3>{{ $t("label.input.mode") }}</h3>
      <a-radio-group
        v-model:value="setText"
        button-style="solid"
        @change="
          (selected) => {
            $emit('inputModeChange', selected.target.value);
          }
        "
      >
        <a-tooltip placement="bottom" :title="$t('tooltip.input.mode.false')">
          <a-radio-button :value="false">
            {{ $t("label.input.mode.no") }}
          </a-radio-button>
        </a-tooltip>
        <a-tooltip placement="bottom" :title="$t('tooltip.input.mode.true')">
          <a-radio-button :value="true">
            {{ $t("label.input.mode.text") }}
          </a-radio-button>
        </a-tooltip>
        <!-- <a-tooltip
          placement="bottom"
          title="내장된 데스크톱 화상 키보드의 입력을 표시하고 허용합니다. 화상 키보드는 다른 방법으로는 불가능할 수 있는 키 조합을 입력할 수 있습니다. (Ctrl-Alt-Del 등)"
        >
          <a-radio-button value="osk">화상 키보드</a-radio-button>
        </a-tooltip> -->
      </a-radio-group>
    </a-col>
    <a-col flex="230px">
      <h3>{{ $t("label.mouse.mode") }}</h3>
      <a-radio-group
        v-model:value="setMouse"
        button-style="solid"
        @change="
          (selected) => {
            $emit('mouseModeChange', selected.target.value);
          }
        "
      >
        <a-tooltip placement="bottom" :title="$t('tooltip.mouse.mode.false')">
          <a-radio-button :value="true">
            {{ $t("label.mouse.mode.touchscreen") }}
          </a-radio-button>
        </a-tooltip>
        <a-tooltip placement="bottom" :title="$t('tooltip.mouse.mode.true')">
          <a-radio-button :value="false">
            {{ $t("label.mouse.mode.touchpad") }}
          </a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </a-col>
    <a-col flex="230px">
      <h3>{{ $t("label.display") }}</h3>
      <a-button @click="zoomHandle(-10)" shape="circle">
        <template #icon><MinusOutlined /></template>
      </a-button>
      &nbsp;
      <a-input
        v-model:value="scale"
        style="width: 80px"
        :max-length="3"
        @blur="scaleHandle"
      />%&nbsp;
      <a-button @click="zoomHandle(10)" shape="circle">
        <template #icon><PlusOutlined /></template>
      </a-button>
    </a-col>
    <a-col flex="214px">
      <h3>{{ $t("label.fullscreen") }}</h3>

      <a-radio-group
        v-model:value="setFullScreen"
        button-style="solid"
        @change="
          (selected) => {
            fullscreenModeChange(selected.target.value);
          }
        "
      >
        <a-tooltip placement="bottom" :title="$t('tooltip.fullscreen.mode.on')">
          <a-radio-button :value="true">
            {{ $t("label.fullscreen.mode.on") }}
          </a-radio-button>
        </a-tooltip>
        <a-tooltip
          placement="bottom"
          :title="$t('tooltip.fullscreen.mode.off')"
        >
          <a-radio-button :value="false">
            {{ $t("label.fullscreen.mode.off") }}
          </a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </a-col>
    <a-col flex="230px">
      <h3>{{ $t("label.filesystem") }}</h3>
      <a-tooltip
        placement="bottom"
        :title="$t('tooltip.filesystem.mode.download')"
      >
        <a-button size="medium" @click="fileDownloadModalVisible">
          <template #icon>
            <DownloadOutlined />
          </template>
          {{ $t("label.download") }}
        </a-button>
      </a-tooltip>
      &nbsp;
      <a-tooltip
        placement="bottom"
        :title="$t('tooltip.filesystem.mode.upload')"
      >
        <a-button size="medium" @click="fileUpladModalVisible">
          <template #icon>
            <UploadOutlined />
          </template>
          {{ $t("label.upload") }}
        </a-button>
      </a-tooltip>
    </a-col>
    <a-col flex="230px"></a-col>
  </a-row>
  <a-modal
    v-model:visible="uploadModal"
    :title="$t('label.file.upload')"
    centered
    width="600px"
  >
    <template #footer>
      <a-button @click="() => (uploadModal = false)">{{
        $t("label.close")
      }}</a-button>
    </template>
    <a-upload-dragger
      v-model:file-list="fileList"
      :multiple="true"
      :beforeUpload="beforeUpload"
      @remove="handleRemove"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">
        {{ $t("input.file.upload.dragdrop") }}
      </p>
      <!-- <template #itemRender="{ file, actions }">
        <a-space>
          <span :style="file.status === 'error' ? 'color: red' : ''">{{
            file.name
          }}</span>
          <a href="javascript:;" @click="actions.remove">delete</a>
          <delete-outlined @click="handleClick" />
        </a-space>
      </template>
      <template #removeIcon></template> -->
    </a-upload-dragger>
  </a-modal>
  <a-modal
    v-model:visible="downloadModal"
    :title="$t('label.file.download')"
    centered
    :width="800"
  >
    <template #footer>
      <a-button @click="() => (downloadModal = false)">
        {{ $t("label.close") }}
      </a-button>
    </template>

    <a-alert
      message="하위폴더로 이동은 폴더 항목을 더블클릭 하세요. (※ 폴더 단위 다운로드 불가)"
      type="info"
      show-icon
    />

    <a-row id="content-header-row">
      <!-- 왼쪽 경로 -->
      <a-col id="button-left" :span="12">
        <a-button @click="backDirectory" shape="round" size="small">
          <template #icon><swap-left-outlined /></template>
          {{ $t("label.move.parent") }}
        </a-button>
      </a-col>
      <a-col id="button-right" :span="12">
        <a-button
          v-if="state.selectedRowKeys.length > 0"
          @click="batchFileDownAction"
          type="primary"
          shape="round"
          size="small"
        >
          <template #icon><download-outlined /></template>
          {{ $t("label.batch.download") }}
        </a-button>
      </a-col>
    </a-row>

    <a-table
      :columns="dowlloadListCol"
      :data-source="downloadList"
      :pagination="false"
      size="small"
      :scroll="{ y: 800 }"
      :row-selection="{
        selectedRowKeys: state.selectedRowKeys,
        onChange: onSelectChange,
      }"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'name'">
          <span> &nbsp;{{ curDir }} </span>
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.key === 'name'">
          <span
            v-if="record.type === 'DIRECTORY'"
            @dblclick="fileDblclick(record)"
            style="cursor: pointer"
          >
            <folder-open-filled /> {{ text }}
          </span>
          <span v-else> <file-outlined /> {{ text }} </span>
        </template>
        <template
          v-if="column.dataIndex === 'action' && record.type == 'NORMAL'"
        >
          <a-button
            @click="fileDownAction(record)"
            type="primary"
            shape="round"
            size="small"
          >
            <template #icon><download-outlined /></template>
            {{ $t("label.download") }}
          </a-button>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>
<script>
import { defineComponent, ref, reactive } from "vue";
import Guacamole from "guacamole-common-js";
export default defineComponent({
  props: {
    client: {
      type: Object,
      requires: true,
      default: null,
    },
    token: {
      type: Object,
      requires: true,
      default: null,
    },
    display: {
      type: Object,
      requires: true,
      default: null,
    },
    mouse: {
      type: Object,
      requires: true,
      default: null,
    },
    keyboard: {
      type: Object,
      requires: true,
      default: null,
    },
  },
  emits: ["inputModeChange", "mouseModeChange"],
  setup() {
    const state = reactive({
      selectedRowKeys: [],
      selectedRows: [],
    });
    return {
      state,
    };
  },
  data() {
    return {
      setText: ref(false),
      setMouse: ref(true),
      setFullScreen: ref(false),
      scale: ref(this.$store.state.client.scale * 100),
      fileList: ref([]),
      uploadModal: ref(false),
      downloadModal: ref(false),
      downloadLoading: ref(false),
      downloadList: ref([]),
      dowlloadListCol: [
        {
          dataIndex: "name",
          key: "name",
          width: "82%",
        },
        {
          title: this.$t("label.action"),
          key: "action",
          dataIndex: "action",
          width: "18%",
        },
      ],
    };
  },
  computed: {},
  created() {},
  mounted() {},
  watch: {},
  methods: {
    zoomHandle(inout) {
      this.scale = parseInt(this.scale) + inout;
      this.scaleHandle();
    },
    scaleHandle() {
      if (this.$store.state.client.minScale * 100 > this.scale)
        this.scale = this.$store.state.client.minScale * 100;
      else if (this.$store.state.client.maxScale * 100 < this.scale)
        this.scale = this.$store.state.client.maxScale * 100;

      this.display.scale(parseInt(this.scale) / 100);
      if (this.scale === this.$store.state.client.minScale)
        document.getElementById("app").style.overflow = "hidden";
      else document.getElementById("app").style.overflow = "auto";
    },
    fileUpladModalVisible() {
      if (
        this.token.connection.settings["enable-drive"] === "true" &&
        this.token.connection.settings["disable-upload"] === "false"
      ) {
        this.uploadModal = true;
      } else {
        this.$message.error(this.$t("message.file.upload.permission.denied"));
        return false;
      }
    },
    fileDownloadModalVisible() {
      if (
        this.token.connection.settings["enable-drive"] === "true" &&
        this.token.connection.settings["disable-download"] === "false"
      ) {
        this.downloadModal = true;
      } else {
        this.$message.error(this.$t("message.file.download.permission.denied"));
        return false;
      }
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = [];
      this.fileList = newFileList;
    },
    beforeUpload(file, fileList) {
      return false;
    },
    handleChange(e) {
      const index = this.fileList.findIndex((i) => i.uid == e.file.uid);
      const newFileList = this.fileList.slice();

      setTimeout(() => {
        this.uploadFile(e.file);
      }, 1000);
    },
    uploadFile(file) {
      const reader = new FileReader();
      const STREAM_BLOB_SIZE = 6144;

      var managedFileUpload = {};
      reader.onloadend = () => {
        const stream = this.client.createFileStream(file.type, file.name);
        const bytes = new Uint8Array(reader.result);

        let offset = 0;
        // let progress = 0;

        managedFileUpload.filename = file.name;
        managedFileUpload.mimetype = file.type;
        managedFileUpload.length = file.size;

        stream.onack = (status) => {
          if (status.isError()) {
            console.log("Error uploading file");
            return false;
          }
          const index = this.fileList.findIndex((i) => i.uid == file.uid);
          const sliceBytes = bytes.subarray(offset, offset + STREAM_BLOB_SIZE);
          const base64 = btoa(String.fromCharCode.apply(String, sliceBytes));

          // Write packet
          stream.sendBlob(base64);
          // Advance to next packet
          offset += STREAM_BLOB_SIZE;

          if (offset >= bytes.length) {
            managedFileUpload.progress = 100;
            stream.sendEnd();
            if (index > -1) {
              this.fileList[index].percent = 100;
              this.fileList[index].status = "done";

              setTimeout(() => {
                this.fileList.splice(
                  this.fileList.findIndex((i) => i.uid == file.uid),
                  1
                );
              }, 5000);
            }
          } else {
            managedFileUpload.progress = Math.floor(
              (offset / bytes.length) * 100
            );

            if (index > -1) {
              this.fileList[index].percent = managedFileUpload.progress;
              this.fileList[index].status = "uploading";
            }
          }
        };
      };
      // fileReader Call
      reader.readAsArrayBuffer(file);
    },
    downloadFile(url, filename) {
      const downlink = document.createElement("a");
      downlink.setAttribute("href", url);
      downlink.setAttribute("download", filename);
      downlink.style.display = "none";
      document.body.appendChild(downlink);
      downlink.click();
      document.body.removeChild(downlink);
    },
    fullscreenModeChange(setFullScreen) {
      const dc = document;
      const dcEl = document.documentElement;

      if (setFullScreen && !dc.fullscreenElement) {
        if (dcEl.requestFullscreen) return dcEl.requestFullscreen();
        if (dcEl.webkitRequestFullscreen) return dcEl.webkitRequestFullscreen();
        if (dcEl.mozRequestFullScreen) return dcEl.mozRequestFullScreen();
        if (dcEl.msRequestFullscreen) return dcEl.msRequestFullscreen();
      } else if (!setFullScreen && dc.fullscreenElement) {
        if (dc.exitFullscreen) return dc.exitFullscreen();
        if (dc.webkitCancelFullscreen) return dc.webkitCancelFullscreen();
        if (dc.mozCancelFullScreen) return dc.mozCancelFullScreen();
        if (dc.msExitFullscreen) return dc.msExitFullscreen();
      } else {
        return false;
      }
    },
    updateDirectory(filesystem, file) {
      this.resetSelectedRow();
      this.filesystem = filesystem;
      this.downloadLoading = true;
      const _this = this;
      // Do not attempt to refresh the contents of directories
      if (file.mimetype !== Guacamole.Object.STREAM_INDEX_MIMETYPE) return;

      // Request contents of given file
      this.filesystem.object.requestInputStream(
        file.streamName,
        function handleStream(stream, mimetype) {
          // Ignore stream if mimetype is wrong
          if (mimetype !== Guacamole.Object.STREAM_INDEX_MIMETYPE) {
            stream.sendAck(
              "Unexpected mimetype",
              Guacamole.Status.Code.UNSUPPORTED
            );
            return;
          }

          // Signal server that data is ready to be received
          stream.sendAck("Ready", Guacamole.Status.Code.SUCCESS);

          // Read stream as JSON
          var jsonReader = new Guacamole.JSONReader(stream);

          // Acknowledge received JSON blobs
          jsonReader.onprogress = (length) => {
            stream.sendAck("Received", Guacamole.Status.Code.SUCCESS);
          };

          // Reset contents of directory
          jsonReader.onend = () => {
            // Empty contents
            file.files = [];
            // Determine the expected filename prefix of each stream
            _this.curDir = file.streamName;
            if (_this.curDir.charAt(_this.curDir.length - 1) !== "/")
              _this.curDir += "/";

            // For each received stream name
            var mimetypes = jsonReader.getJSON();
            var fileIndex = 0;
            for (var name in mimetypes) {
              // Assert prefix is correct
              if (name.substring(0, _this.curDir.length) !== _this.curDir)
                continue;

              // Extract filename from stream name
              var filename = name.substring(_this.curDir.length);

              // Deduce type from mimetype
              var type = "NORMAL";
              if (mimetypes[name] === Guacamole.Object.STREAM_INDEX_MIMETYPE)
                type = "DIRECTORY";

              // Add file entry
              file.files.push({
                key: fileIndex,
                mimetype: mimetypes[name],
                streamName: name,
                type: type,
                parent: _this.curDir,
                name: filename,
              });
              fileIndex = fileIndex + 1;
            }
            _this.downloadList = file.files;
            _this.downloadLoading = false;
          };
        }
      );
    },
    fileDblclick(file) {
      //하위폴더 이동~
      if (file.type == "DIRECTORY") {
        this.filesystem = {
          client: this.client,
          object: this.filesystem.object,
          name: file.name,
          root: {
            mimetype: file.mimetype,
            streamName: file.streamName,
            parent: file.parent,
            type: "DIRECTORY",
          },
        };
        this.updateDirectory(this.filesystem, this.filesystem.root);
      }
    },
    fileDownAction(file) {
      //다운로드 시작~
      const _this = this;
      this.filesystem.object.requestInputStream(
        file.streamName,
        function downloadStream(stream, mimetype) {
          // Parse filename from string
          var filename = file.streamName.match(/(.*[\\/])?(.*)/)[2];

          // Start download
          stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);

          const arrayBufferReader = new Guacamole.ArrayBufferReader(stream);
          var chunks = [];

          var siz = 0;
          const key = filename;

          // stream buffer 데이터 받음
          arrayBufferReader.ondata = (buffer) => {
            const bufBlob = new Blob([buffer], { type: mimetype });
            chunks.push(bufBlob);

            siz = siz + bufBlob.size;
            _this.$notification.open({
              key,
              message: _this.$t("label.file.download"),
              description: "[" + _this.bytesToSize(siz) + "] " + filename,
              placement: "bottomRight",
              duration: 0,
              style: {
                width: "400px",
              },
              onClose: () => {
                _this.$notification.close(key);
              },
            });

            stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);
          };

          //stream 이 끝났을 시
          arrayBufferReader.onend = () => {
            _this.$notification.open({
              key,
              message: _this.$t("label.file.download"),
              description: "[" + _this.$t("label.complete") + "] " + filename,
              placement: "bottomRight",
              duration: 5,
              style: {
                width: "400px",
              },
              onClose: () => {
                _this.$notification.close(key);
              },
            });
            const blob = new Blob(chunks, { type: mimetype });
            const url = URL.createObjectURL(blob);
            _this.downloadFile(url, filename);
          };
        }
      );
    },
    batchFileDownAction() {
      this.state.selectedRows.forEach((item, index) => {
        if (item.type === "NORMAL") this.fileDownAction(item);
      });
      this.resetSelectedRow();
    },
    resetSelectedRow() {
      this.state.selectedRowKeys = [];
      this.state.selectedRows = [];
    },
    bytesToSize(bytes, decimals = 1) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    // bytesToSize(x) {
    //   const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    //   let l = 0,
    //     n = parseInt(x, 10) || 0;
    //   if (n === 1) return "1 byte";

    //   while (n >= 1024 && ++l) {
    //     n = n / 1024;
    //   }
    //   return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
    // },
    // bytesToSize(bytes) {
    //   var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    //   if (bytes == 0) return "0 Byte";
    //   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    //   return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    // },
    backDirectory() {
      if (this.filesystem.root.streamName == "/") {
        return false;
      } else {
        const index = this.filesystem.root.streamName.lastIndexOf("/");
        if (index == 0) this.filesystem.root.streamName = "/";
        else {
          this.filesystem.root.streamName =
            this.filesystem.root.streamName.slice(0, index);
        }
        this.updateDirectory(this.filesystem, this.filesystem.root);
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.state.selectedRowKeys = selectedRowKeys;
      this.state.selectedRows = selectedRows;
      // console.log(selectedRowKeys, selectedRows);
      // if (this.state.selectedRows.length > 0) {
      //   this.$emit("actionFromChange", "VMList", this.state.selectedRows);
      // } else {
      //   this.$emit("actionFromChange", "VM", null);
      // }
    },
  },
});
</script>
<style scoped>
h3 {
  text-align: center;
}
.ant-col {
  text-align: center;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  padding: 1rem;
}
.rct {
  text-decoration: underline;
  cursor: pointer;
}

#button-left {
  text-align: left;
  align-items: center;
  padding: 10px 0px 10px 40px;
}

#button-right {
  text-align: right;
  padding: 10px 20px 10px 10px;
}
</style>
