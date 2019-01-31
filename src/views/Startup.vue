<template>
    <div class="startup">
        <router-link to="/character">
            <h1>
                DUNGEON<br/>
                DEFEATERS
            </h1>
            <transition name="fade" mode="out-in">
                <div v-if="loaded" style="height: 100vh">
                    <div class="buttons">
                        <span class="desktop">Click to continue</span>
                        <span class="mobile">Tap to continue</span>
                    </div>
                </div>
            </transition>

            <div v-if="!loaded" class="loading">
                <div class="lds-ring" style="margin-top: 20px;">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </router-link>
    </div>
</template>

<script>
  export default {
    name: "Startup",
    data() {
      return {
        loaded: false,
      }
    },
    mounted() {
      window.localStorage.clear();
      localStorage.ip = window.location.href.split(":")[1].substring(2, window.location.href.split(":")[1].length);
      this.checkServer(1000);
    },
    methods: {
      checkServer: function (retTime) {
        this.axios
          .get('http://' + localStorage.ip + ':8081/check.php')
          .then(response => {
            console.log(response.data);
            var load = response.data;

            if (load.working) {
              this.loaded = true;
            }
          })
          .catch(error => {
            //console.log(error);
            console.log("=====  Connection error  =====");
            console.log("Failed to establish a connection to teh server.");
            retTime = parseInt(retTime * 1.5);
            console.log("Retrying in " + retTime);
            setTimeout(() => this.checkServer(retTime), retTime);
          });
      }
    }
  }
</script>

<style lang="scss" scoped>
    @keyframes startupTitle {
        0% {
            transform: translate(-50%, -50%) scale(1)
        }
        10% {
            transform: translate(-50%, -50%) scale(1)
        }
        40% {
            transform: translate(-50%, -50%) scale(1.3)
        }
        60% {
            transform: translate(-50%, -50%) scale(1.3)
        }
        90% {
            transform: translate(-50%, -50%) scale(1)
        }
        100% {
            transform: translate(-50%, -50%) scale(1)
        }
    }

    .startup {
        z-index: 100;

        a {
            color: black;
            text-decoration: none;
            display: block;
            height: 97vh;
        }

        h1 {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 60px;
            animation: startupTitle 3s infinite linear;
        }

        .buttons,
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .loading {
            top: 60%;
        }

        .desktop {
            display: none;

            @media (min-width: 1024px) {
                display: block;
            }
        }

        .mobile {
            display: block;

            @media (min-width: 1024px) {
                display: none;
            }
        }
    }
</style>