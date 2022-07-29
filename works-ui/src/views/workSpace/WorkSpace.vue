<template>
  <div id="content-layout">
    <a-layout>
      <a-layout-header id="content-header">
        <div id="content-header-body">
          <a-row id="content-header-row">
            <!-- 왼쪽 경로 -->
            <a-col id="content-path" :span="12">
              <Apath :paths="[$t('label.workspace')]" />
              <a-button shape="round" style="margin-left: 20px" size="small" @click="refresh()">
                <template #icon><ReloadOutlined /></template>
                {{ $t("label.refresh") }}
              </a-button>
            </a-col>
            <!-- 우측 액션 -->
            <a-col id="content-action" :span="12">
              <div>
                <Actions v-if="actionFrom === 'WSList'" :action-from="actionFrom" :multi-select-list="multiSelectList" @fetchData="refresh" />
                <a-button
                  type="primary"
                  shape="round"
                  style="margin-left: 10px"
                  @click="
                    () => {
                      addModalView = true;
                    }
                  "
                  >{{ $t("label.workspace.create") }}
                  <template #icon>
                    <PlusOutlined />
                  </template>
                </a-button>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-layout-header>
      <a-layout-content>
        <div id="content-body">
          <WorkSpaceList ref="listRefreshCall" @actionFromChange="actionFromChange" />
        </div>
      </a-layout-content>
    </a-layout>
    <!-- ADD WORKSPACE MODAL START  -->
    <a-modal
      v-model:visible="addModalView"
      :title="$t('label.workspace.create')"
      :confirm-loading="confirmLoading"
      :ok-text="$t('label.ok')"
      :cancel-text="$t('label.cancel')"
      @cancel="handleCancel"
      @ok="createWorkspace"
    >
      <a-form :ref="formRef" :model="form" :rules="rules" layout="vertical" autocomplete="off">
        <!--워크스페이스 이름 start-->
        <a-form-item has-feedback name="name" :label="$t('label.name')">
          <a-input v-model:value="form.name" :placeholder="$t('placeholder.workspace.name')" />
        </a-form-item>
        <!--워크스페이스 이름 end-->
        <!--워크스페이스 설명 start-->
        <a-form-item has-feedback name="description" :label="$t('label.description')">
          <a-input v-model:value="form.description" :placeholder="$t('placeholder.workspace.description')" class="addmodal-aform-item-div" />
        </a-form-item>
        <!--워크스페이스 설명 end-->
        <!--워크스페이스 타입 start-->
        <!-- <a-form-item name="workspaceType" :label="$t('label.type')">
          <a-radio-group v-model:value="form.workspaceType" button-style="solid" @change="changeWorkspaceType">
            <a-radio-button value="desktop">{{ $t("label.desktop") }}</a-radio-button>
            <a-radio-button value="application">{{ $t("label.application") }}</a-radio-button>
          </a-radio-group>
        </a-form-item> -->
        <!--워크스페이스 타입 end-->
        <!--워크스페이스 전용 여부 start-->
        <!-- <a-form-item v-show="form.workspaceType == 'desktop'" name="dedicatedOrSharedBoolean" :label="$t('label.dedicated.shared')">
          <a-radio-group v-model:value="form.dedicatedOrSharedBoolean" button-style="solid">
            <a-radio-button :value="false">{{ $t("label.dedicated") }}</a-radio-button>
            <a-radio-button :value="true">{{ $t("label.shared") }}</a-radio-button>
          </a-radio-group>
        </a-form-item> -->
        <!--워크스페이스 전용 여부 end-->
        <!--워크스페이스 템플릿 start-->
        <a-form-item has-feedback name="masterTemplate" :label="$t('label.mastertemplate')">
          <a-select
            v-model:value="form.masterTemplate"
            :placeholder="$t('placeholder.workspace.template')"
            show-search
            option-filter-prop="label"
            class="addmodal-aform-item-div"
            @change="
              (val) => {
                form.workspaceType == 'desktop' ? this.templateChange(desktopTemplates[val]) : this.templateChange(applicationTemplates[val]);
              }
            "
          >
            <a-select-option v-if="form.workspaceType == 'desktop'" v-for="(opt, optIndex) in desktopTemplates" :key="optIndex">
              {{ opt.name + "(" + opt.version + ")" }}
            </a-select-option>
            <a-select-option v-if="form.workspaceType == 'application'" v-for="(opt, optIndex) in applicationTemplates" :key="optIndex">
              {{ opt.name + "(" + opt.version + ")" }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!--워크스페이스 템플릿 end-->
        <!--워크스페이스 컴퓨트 오퍼링 start-->
        <a-form-item has-feedback name="computeOffering" :label="$t('label.compute.offering')">
          <a-select
            v-model:value="form.computeOffering"
            :placeholder="$t('placeholder.workspace.compute.offering')"
            show-search
            option-filter-prop="label"
            class="addmodal-aform-item-div"
            @change="
              (val) => {
                this.offeringChange(offerings[val]);
              }
            "
          >
            <a-select-option v-for="(opt, optIndex) in offerings" :key="optIndex">
              {{ opt.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!--워크스페이스 컴퓨트 오퍼링 end-->
      </a-form>
    </a-modal>
    <!-- ADD WORKSPACE MODAL END  -->
  </div>
</template>

<script>
import Actions from "@/components/Actions";
import Apath from "@/components/Apath";
import WorkSpaceList from "./WorkSpaceList";
import { defineComponent, reactive, ref } from "vue";
export default defineComponent({
  name: "WorkSpace",
  components: {
    WorkSpaceList,
    Apath,
    Actions,
  },
  props: {},
  setup() {},
  data() {
    return {
      addModalView: ref(false),
      confirmLoading: ref(false),
      actionFrom: ref("WS"),
      multiSelectList: ref([]),
      templates: ref([]),
      templateDisabled: ref(true),
      desktopTemplates: ref([]),
      applicationTemplates: ref([]),
      offerings: ref([]),
    };
  },
  created() {
    this.initForm();
    this.fetchOfferingsAndTemplates();
  },
  methods: {
    initForm() {
      this.formRef = ref();
      this.form = reactive({
        workspaceType: "desktop",
        dedicatedOrSharedBoolean: false,
        masterTemplate: this.selectedTemplate,
        computeOffering: this.selectedOffering,
      });
      this.rules = reactive({
        name: { required: true, max: 7, validator: this.validateName, trigger: "change", message: this.$t("input.workspace.name") },
        description: { required: true, max: 32, message: this.$t("input.workspace.description") },
        workspaceType: { required: true, message: this.$t("input.workspace.workspaceType") },
        dedicatedOrSharedBoolean: { required: true },
        masterTemplate: { required: true, message: this.$t("input.workspace.masterTemplate") },
        computeOffering: { required: true, message: this.$t("input.workspace.computeOffering") },
      });
    },
    async validateName(rule, value) {
      let lengthCheck = value.length > rule.max ? true : false; //길이체크
      //let containsEng = /[a-zA-Z]/.test(value); // 대소문자
      //let containsEngUpper = /[A-Z]/.test(value); 대문자
      //let containsNumber = /[0-9]/.test(value);
      let containsSpecial = /[~!@#$%^&*()\-_+|<>?:{}]/.test(value);
      let containsHangle = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);
      let firstEng = /^[a-zA-Z]/.test(value);
      if (value === "" || containsHangle || containsSpecial || lengthCheck || !firstEng) {
        return Promise.reject();
      } else {
        return Promise.resolve();
      }
    },
    handleCancel() {
      this.addModalView = false;
      this.confirmLoading = false;
      this.refresh();
    },
    refresh() {
      this.$refs.listRefreshCall.fetchRefresh();
    },
    actionFromChange(val, obj) {
      this.actionFrom = "WS";
      setTimeout(() => {
        this.actionFrom = val;
        this.multiSelectList = obj;
      }, 100);
    },
    changeWorkspaceType(val) {
      console.log("val :>> ", val.target.value);
      if (val.target.value === "desktop") {
        if (this.arrayHasItems(this.desktopTemplates)) {
          this.form.masterTemplate = 0;
          this.templateChange(this.desktopTemplates[0]);
        } else {
          this.form.masterTemplate = null;
        }
      } else {
        if (this.arrayHasItems(this.applicationTemplates)) {
          this.form.masterTemplate = 0;
          this.templateChange(this.applicationTemplates[0]);
        } else {
          this.form.masterTemplate = null;
        }
      }
    },
    offeringChange(offer) {
      this.selectedOffering = offer;
    },
    templateChange(template) {
      this.selectedTemplate = template;
    },
    createWorkspace() {
      // 실제 template uuid 를 넘겨주기 위함.
      // console.log("this.selectedTemplate :>> ", this.selectedTemplate);
      const templ = this.temp.filter((it) => it.templateid == this.selectedTemplate.templateid)[0];
      const masterTemplateName = templ.name + "(" + templ.version + ")";
      // console.log(this.form.masterTemplate + " :: " + this.selectedTemplate.templateid + " :: " + masterTemplateName + " :: " + this.selectedOffering.id);

      let params = new URLSearchParams();
      params.append("name", this.form.name);
      params.append("description", this.form.description);
      params.append("type", this.form.workspaceType);
      params.append("shared", this.form.dedicatedOrSharedBoolean);
      params.append("masterTemplateName", masterTemplateName);
      params.append("templateUuid", this.selectedTemplate.templateid);
      params.append("computeOfferingUuid", this.selectedOffering.id);
      //console.log(params);
      this.formRef.value
        .validate()
        .then(() => {
          this.confirmLoading = true;
          this.$worksApi
            .get("/api/v1/group/" + this.form.name) //이름 중복 확인
            .then((response) => {
              if (response.status === 200) {
                //이름 중복일때 메시지 확인
                this.$message.error(this.$t("message.name.dupl"));
                this.confirmLoading = false;
              }
            })
            .catch((error) => {
              //이름 중복이 아닐때(status code = 401)
              this.$message.loading(this.$t("message.workspace.createing"), 0);
              this.$worksApi
                .post("/api/v1/workspace", params)
                .then((response) => {
                  this.$message.destroy();
                  if (response.status === 200) {
                    this.$message.success(this.$t("message.workspace.create.success"), 5);
                  } else {
                    this.$message.error(this.$t("message.workspace.create.fail"));
                  }
                })
                .catch((error) => {
                  this.$message.destroy();
                  this.$message.error(this.$t("message.workspace.create.fail"));
                  console.log(error);
                })
                .finally(() => {
                  this.handleCancel();
                });
            });
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    fetchOfferingsAndTemplates() {
      this.$worksApi
        .get("/api/v1/offering")
        .then((response) => {
          if (response.status == 200) {
            this.offerings = response.data.serviceOfferingList.listserviceofferingsresponse.serviceoffering;
            this.temp = response.data.templateList.listdesktopmasterversionsresponse.desktopmasterversion;

            this.desktopTemplates = this.temp.filter((it) => it.mastertemplatetype == "DESKTOP");
            this.applicationTemplates = this.temp.filter((it) => it.mastertemplatetype == "APP");

            this.templateChange(this.desktopTemplates[0]);
            this.offeringChange(this.offerings[0]);

            // this.form.computeOffering = 0;
          } else {
            this.$message.destroy();
            this.$message.error(this.$t("message.response.data.fail"));
          }
        })
        .catch((error) => {
          this.$message.destroy();
          this.$message.error(this.$t("message.response.data.fail"));
        })
        .finally(() => {
          if (this.arrayHasItems(this.desktopTemplates)) {
            this.form.masterTemplate = 0;
          } else {
            this.form.masterTemplate = null;
          }
          if (this.arrayHasItems(this.offerings)) {
            this.form.computeOffering = 0;
          } else {
            this.form.computeOffering = null;
          }
        });
    },
    arrayHasItems(array) {
      return array !== null && array !== undefined && Array.isArray(array) && array.length > 0;
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
