<template>
  <div class="h-0 d-inline-flex">

    <!-- existing xforms -->
    <div class="d-inline-block position-relative d-flex align-items-center h-0"
      v-if="show">
      <div class="ml-2 position-relative delete-btn-container"
        :key="idx"
        v-for="(xform, idx) in xforms">

        <b-button size="sm"
          @click.stop
          class="position-relative"
          v-b-tooltip.hover.html
          placement="left"
          :title="renderTooltip(xform)"
          
          variant="warning">
          <font-awesome-icon icon="table" />
        </b-button>

        <font-awesome-icon icon="times-circle"
          v-b-tooltip.hover
          title="remove this transformation"
          class="text-danger position-absolute delete-btn"
          @click.stop="removeXform(idx)"/>
      </div>

    </div>

    <!-- adding new xform -->
    <div class="d-inline-block position-relative d-flex align-items-center h-0"
      v-if="showAddBtn">
      <b-button size="sm"
        @click.stop="showAddNewXformModal"
        class="ml-2"
        variant="success"
        v-b-tooltip.hover
        title="Add a new transform">
        <font-awesome-icon icon="plus" />
      </b-button>
    </div>

    <b-modal ref="new-xform-modal"
      :ok-disabled="!addNewXformIsValid"
      @ok="addNewXform">
      <b-form-radio-group
        v-model="addNewOptionValue"
        :options="addNewOptions">

      </b-form-radio-group>
      <textarea v-if="addNewOptionValue !== 'incTransformMatrix'"
        cols="30"
        rows="10"
        v-model="addNewXformString"
        :placeholder="identityMatStr">

      </textarea>
      <b-alert :show="!addNewXformIsValid" variant="warning">
        Not valid JSON.
      </b-alert>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getTransformMatrixInNm, identityMat } from'@/constants'
const renderMatrix = matrix => `<pre class="text-light mb-0">${matrix.join('\n')}</pre>`
const getTitle = title => `<span class="text-muted">${title}</span>`
const itemIsArraySize4 = item => Array.isArray(item) && item.length === 4
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    },
    showAddBtn: {
      type: Boolean,
      default: true
    },
    applyCurrentXform: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      xforms: [],
      addNewXformString: ``,
      addNewOptionValue: 'userDefined',
      addNewOptions:[
        { text: 'Use current incoming matrix', value: 'incTransformMatrix'},
        { text: 'Add custom affine matrix', value: 'userDefined' }
      ],
      identityMatStr: `[\n  ${identityMat.map(row => `[${row.join(', ')}]`).join(',\n  ') }\n]`
    }
  },
  computed: {
    ...mapState('nehubaStore', [
      'incTransformMatrix'
    ]),
    addNewXformIsValid: function () {
      if (this.addNewOptionValue === 'incTransformMatrix') return true
      if (this.addNewXformString === '') return false
      try {
        const parsedXformString = JSON.parse(this.addNewXformString)
        if (!itemIsArraySize4(parsedXformString)) return false
        if (!parsedXformString.every(row => itemIsArraySize4(row))) return false
        if (!parsedXformString.every(row => row.every(entry => typeof entry === 'number'))) return false
        return true
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    xforms: function () {
      this.$emit('xformsChanged', this.xforms)
    }
  },
  methods: {
    renderTooltip: function ({ type, matrix }) {
      if(type === 'incTransformMatrix'){
        return `${getTitle('current incoming matrix')}${renderMatrix(getTransformMatrixInNm(this.incTransformMatrix))}`
      }
      return `${getTitle(`user added matrix`)}${renderMatrix(matrix)}`
    },
    showAddNewXformModal: function () {
      this.$refs['new-xform-modal'].show()
    },
    addNewXform: function () {

      this.xforms = [ ...this.xforms, {
        type: this.addNewOptionValue,
        matrix: this.addNewXformString && JSON.parse(this.addNewXformString)
      } ]

      this.addNewXformString = ''
      
    },
    removeXform: function (index) {
      this.xforms = this.xforms.filter((_, idx) => idx !== index)
    }
  },
  mounted: function () {
    if (this.applyCurrentXform) this.xforms = [ { type: 'incTransformMatrix' } ]
  }
}
</script>
<style>

.delete-btn-container:hover .delete-btn
{
  visibility: visible!important;
}
.delete-btn
{
  visibility: hidden;
  top: -0.3em;
  right: -0.3em;
}
</style>