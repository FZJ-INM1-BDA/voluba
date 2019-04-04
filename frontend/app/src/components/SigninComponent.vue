<template>
  <div>
    <a
      :key="idx"
      v-for="(loginM, idx) in loginMethods"
      :href="loginM.href"
      class="dropdown-item">
      {{ loginM.name }}  
    </a>
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
