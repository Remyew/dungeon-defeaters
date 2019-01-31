<template>
    <div class="player-value">
        {{ attname }}:
        <span @click="remove()">
                    -
                </span>
        <div>{{ value }}</div>
        <span @click="add()">
                    +
                </span>
    </div>
</template>

<script>
  export default {
    name: "player-value",
    props: {
      attname: String,
      value: Number,
      current: Number,
      max: Number
    },
    methods: {
      add: function () {
        if (this.value < 10 && this.current < this.max) {
          this.$emit('increment')
        }
      },
      remove: function () {
        if (this.value > 0) {
          this.$emit('decrement')
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>