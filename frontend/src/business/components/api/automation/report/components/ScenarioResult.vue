<template>
  <div class="scenario-result">
    <div v-if="(node.children && node.children.length >0) || node.unsolicited
    || (node.type && this.stepFilter.get('AllSamplerProxy').indexOf(node.type) === -1)">
      <el-card class="ms-card">
        <div class="el-step__icon is-text ms-api-col">
          <div class="el-step__icon-inner">
            {{ node.index }}
          </div>
        </div>
        <el-tooltip effect="dark" :content="node.label" placement="top">
          <el-link v-if="node.redirect" class="report-label-head" @click="isLink">
            {{ node.label }}
          </el-link>
          <span v-else>{{ node.label }}</span>
        </el-tooltip>
      </el-card>
    </div>
    <div v-else-if="node.type === 'MsUiCommand'">
      <ui-command-result
        :step-id="node.stepId"
        :index-number="node.index"
        :command="node"
        :isActive="isActive"
        :result="node.value"/>
    </div>
    <div v-else>
      <ms-request-result
        :step-id="node.stepId"
        :request="node.value"
        :redirect="node.redirect"
        :indexNumber="node.index"
        :error-code="node.errorCode"
        :scenarioName="node.label"
        :resourceId="node.resourceId"
        :total-status="node.totalStatus"
        :console="console"
        :isActive="isActive"
        :is-share="isShare"
        :share-id="shareId"
        v-on:requestResult="requestResult"
      />
    </div>
  </div>
</template>

<script>
import MsRequestResult from "./RequestResult";
import {STEP} from "@/business/components/api/automation/scenario/Setting";
const requireComponent = require.context('@/business/components/xpack/', true, /\.vue$/);
const UiCommandResult = requireComponent.keys().length > 0 ? requireComponent("./ui/automation/report/UiCommandResult.vue") : {};

export default {
  name: "MsScenarioResult",
  components: {
    'UiCommandResult': UiCommandResult.default,
    MsRequestResult
  },
  props: {
    scenario: Object,
    node: Object,
    console: String,
    isActive: Boolean,
    isShare:Boolean,
    shareId: String,
  },
  data() {
    return {
      stepFilter: new STEP,
    }
  },
  methods: {
    isLink() {
      let uri =  "/#/api/automation?resourceId=" + this.node.resourceId;
      this.clickResource(uri)
    },
    clickResource(uri) {
      this.$get('/user/update/currentByResourceId/' + this.node.resourceId, () => {
        this.toPage(uri);
      });
    },
    toPage(uri) {
      let id = "new_a";
      let a = document.createElement("a");
      a.setAttribute("href", uri);
      a.setAttribute("target", "_blank");
      a.setAttribute("id", id);
      document.body.appendChild(a);
      a.click();

      let element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },
    active() {
      this.isActive = !this.isActive;
    },
    requestResult(requestResult) {
      this.$emit("requestResult", requestResult);
    }
  },

  computed: {
    assertion() {
      return this.scenario.passAssertions + " / " + this.scenario.totalAssertions;
    },
    success() {
      return this.scenario.error === 0;
    }
  }
}
</script>

<style scoped>
.scenario-result {
  width: 100%;
  padding: 2px 0;
}

.scenario-result + .scenario-result {
  border-top: 1px solid #DCDFE6;
}

.ms-card >>> .el-card__body {
  padding: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenario-result .info {
  height: 40px;
  cursor: pointer;
}

.scenario-result .icon {
  padding: 5px;
}

.scenario-result .icon.is-active {
  transform: rotate(90deg);
}

.ms-api-col {
  background-color: #EFF0F0;
  border-color: #EFF0F0;
  margin-right: 10px;
  font-size: 12px;
  color: #64666A;
}

.ms-card .ms-api-col-create {
  background-color: #EBF2F2;
  border-color: #008080;
  margin-right: 10px;
  font-size: 12px;
  color: #008080;
}

.report-label-head {
  border-bottom: 1px solid #303133;
  color: #303133;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
  font-size: 13px;
}

/deep/ .el-step__icon {
  width: 20px;
  height: 20px;
  font-size: 12px;
}
</style>
