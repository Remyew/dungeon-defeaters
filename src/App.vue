<template>
    <div id="app">
        <transition :name="transitionName" mode="out-in">
            <router-view/>
        </transition>
    </div>
</template>

<script>
  export default {
    name: 'app',
    components: {},
    metaInfo: {
      title: 'Dungeon Defeaters',
      htmlAttrs: {
        lang: 'en',
        amp: undefined
      }
    },
    data() {
      return {
        prevHeight: 0,
        message: '',
        transitionName: 'slide-left',
      };
    },
    created() {
      this.$router.beforeEach((to, from, next) => {
        console.log(next);
        if (to.path === from.path) {
          console.log("Reloading " + from.path);
          this.$router.go();
          //this.$forceUpdate();
        } else {
          console.log("FROM:" + from.path);
          console.log("TO:" + to.path);
          var toDepth = 0;
          to.path.split('/').forEach(function (el) {
            toDepth += el != false ? 1 : 0;
          });

          var fromDepth = 0;
          from.path.split('/').forEach(function (el) {
            fromDepth += el != false ? 1 : 0;
          });

          if (to.path === "/character") {
            toDepth--;
          }

          let transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
          this.transitionName = transitionName;
          next();
        }
      });
    },
    methods: {},
    mounted() {
      localStorage.ip = window.location.href.split(":")[1].substring(2, window.location.href.split(":")[1].length);
    }
  }
</script>

<style lang="scss">
    @font-face {
        font-family: "VT323";
        src: url("./assets/fonts/VT323-Regular.ttf") format("truetype");
    }

    h1,
    h2 {
        pointer-events: none;
    }

    body {
        margin: 0;
        //background-color: #d1b494;
    }

    #app {
        font-family: Courier, sans-serif;
        overflow: hidden;
        width: 360px;
        max-width: 100vw;
        margin: 0 auto;
        padding: 8px;
        box-sizing: border-box;
    }

    h1, h2 {
        font-family: 'VT323', Courier, sans-serif;
        text-align: center;
    }

    .scrollable {
        overflow-y: scroll;
    }

    .defeated {
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 360px;
        bottom: 0;
        padding-top: 100px;
        z-index: 100;
        background-color: rgba(255, 255, 255, 0.9);
        color: red;
    }

    .bottom-bar {
        margin-top: 30px;
        border-top: 1px solid black;
        padding-top: 10px;

        a {
            color: black;
            text-decoration: none;
            display: inline-block;
            border: 1px solid black;
            padding: 6px;
        }
    }

    //Animations
    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 0.5s;
        transition-property: height, opacity;
        transition-timing-function: ease;
        overflow: hidden;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0
    }

    .slide-left-enter-active,
    .slide-left-leave-active,
    .slide-right-enter-active,
    .slide-right-leave-active {
        transition-duration: 0.3s;
        transition-property: height, opacity, transform;
        transition-timing-function: cubic-bezier(0, 0, 0, 0);
        overflow: hidden;
    }

    .slide-left-enter,
    .slide-right-leave-active {
        opacity: 0;
        transform: translate(2em, 0);
    }

    .slide-left-leave-active,
    .slide-right-enter {
        opacity: 0;
        transform: translate(-2em, 0);
    }

    .spin-enter-active,
    .spin-leave-active {
        transition-duration: 0.5s;
        transition-property: transform;
        transition-timing-function: ease;
    }

    .spin-enter,
    .spin-leave-active {
        transform: rotateY(720deg);
    }

    .lds-ring {
        display: inline-block;
        position: relative;
        width: 64px;
        height: 64px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        div {
            box-sizing: border-box;
            display: block;
            position: absolute;
            width: 51px;
            height: 51px;
            margin: 6px;
            border: 6px solid #000;
            border-radius: 50%;
            animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            border-color: #000 transparent transparent transparent;

            &:nth-child(1) {
                animation-delay: -0.45s;
            }
            &:nth-child(2) {
                animation-delay: -0.3s;
            }
            &:nth-child(3) {
                animation-delay: -0.15s;
            }
        }

        @keyframes lds-ring {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    }
</style>
