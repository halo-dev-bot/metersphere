<template>
  <ms-edit-dialog
    :visible.sync="visible"
    width="20%"
    :title="title"
    :with-footer="false"
    :close-on-click-modal="false"
    @close="handleClose">
    {{tip}}
    <template v-slot:footer>
      <el-button type="primary" @click="save" @keydown.enter.native.prevent>{{$t('保存')}}</el-button>
      <el-button @click="cancel">{{$t('不保存')}}</el-button>
    </template>
  </ms-edit-dialog>
</template>

<script>
import MsEditDialog from "@/business/components/common/components/MsEditDialog";
export default {
  name: "IsChangeConfirm",
  components: {MsEditDialog},
  data() {
    return {
      visible: false,
      data: {
        temWorkspaceId: null
      }
    }
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$t('test_track.case.minder_save_confirm_title');
      }
    },
    tip: {
      type: String,
      default() {
        return this.$t('test_track.case.minder_save_confirm_tip');
      }
    }
  },
  methods: {
    open(item, temWorkspaceId) {
      this.visible = true;
      this.temWorkspaceId = temWorkspaceId ? temWorkspaceId : null;
      this.data = item;
    },
    save() {
      this.$emit('confirm', true, this.temWorkspaceId);
      this.visible = false;
    },
    cancel() {
      this.$emit('confirm', false, this.temWorkspaceId);
      this.visible = false;
    },
    handleClose() {
      this.$store.commit('setTemWorkspaceId', null);
    }
  }

}
</script>

<style scoped>

</style>
