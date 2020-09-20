<template>
  <span>
    <v-chip :color="color" class="ml-0 mr-2 black--text" label small>{{
      value
    }}</v-chip>
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'OcActive',
  props: {
    value: Boolean,
  },
  computed: {
    color() {
      return this.value ? 'green lighten-3' : 'orange lighten-3'
    },
  },
}
</script>
