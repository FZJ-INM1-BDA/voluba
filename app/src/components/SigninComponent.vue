<template>
  <div>
    <span>
      Login via
    </span>
    <div class="btn-group">

      <a
        :key="idx"
        v-for="(loginM, idx) in loginMethods"
        :href="loginM.href"
        :disabled="loginM.disabled"
        :class="loginM.disabled ? 'disabled' : ''"
        class="btn btn-outline-secondary">
        {{ loginM.name }}  
      </a>
    </div>
  </div>
</template>
<script>
import { loginMethods } from '@/constants'
export default {
  data: function () {
    return {
      loginMethods
    }
  }
}
</script>
<style scoped>

</style>
