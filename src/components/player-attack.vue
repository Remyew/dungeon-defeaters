<template>
    <div :class="{'player-attack': true, 'passive-attack': loadingTime === 0}" @click="trigger()">
        <div class="title">
            <span>
                {{buttonText}}
            </span>
            <span v-if="loadingTime === 0">
                Passive
            </span>
        </div>
        <div class="lifebar" v-if="loadingTime !== 0">
            <progress-bar type="line" ref="loadingBar" :options="baroptions"></progress-bar>
        </div>
    </div>
</template>

<script>
  import StoneButton from '../components/stone-button';

  export default {
    name: "PlayerAttack",
    components: {StoneButton},
    props: {
      buttonText: String,
      ref: String,
      loadingTime: Number,
    },
    data() {
      return {
        cooldown: 0,
        baroptions: {
          color: '#ada37e',
          strokeWidth: 1.0,
          text: {
            value: 1,
            className: 'pa-loading-label',
            style: {}
          },
        },
      }
    },
    methods: {
      trigger: function () {
        if (this.cooldown === 0) {
          if (this.loadingTime > 0) {
            this.$refs.loadingBar.animate(0.0, {
              step: function (state, circle, attachment) {
                circle.setText(Math.round(circle.value() * 100) + "%");
              },
            });

            this.cooldown = this.loadingTime;
            this.cooldown = this.cooldown < 0 ? 0 : this.cooldown;

            this.$emit('triggered');
          }
        }
      },
      reduceCooldown: function () {
        this.cooldown = this.cooldown - 1 > 0 ? this.cooldown - 1 : 0;

        if(this.$refs.loadingBar !== window.undefined) {
          this.$refs.loadingBar.animate(1 - (this.cooldown / this.loadingTime), {
            step: function (state, circle, attachment) {
              circle.setText(Math.round(circle.value() * 100) + "%");
            },
          });
        }
      },
    },
    mounted() {
      this.$refs.loadingBar.animate(1.0, {
        step: function (state, circle, attachment) {
          circle.setText(Math.round(circle.value() * 100) + "%");
        },
      });
    }
  }
</script>

<style lang="scss">
    .player-attack {
        width: 45%;
        min-height: 45.8px;
        display: inline-block;
        border: 1px solid black;
        padding: 6px;
        padding-bottom: 10px;
        text-align: center;
        margin-bottom: 10px;
        position: relative;
        cursor: pointer;

        .title {
            font-family: 'VT323', Courier, sans-serif;
            font-size: 21px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .pa-loading-label {
            color: black !important;
            font-weight: 600;
        }

        &.passive-attack {
            .title {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 100%;
                transform: translate(-50%, -50%);
                padding-bottom: 15px;

                span:nth-of-type(2) {
                    color: #4f0707;
                    font-size: 15px;
                    position: absolute;
                    left: 50%;
                    bottom: 0;
                    transform: translatex(-50%);
                }
            }
        }
    }
</style>