<template>
    <transition name="fade" v-if="visible">
        <div class="story-overlay">
            <h1> {{title}} </h1>

            <player ref="playerEvent" :hide="true"></player>

            <div class="text">
                <slot></slot>
            </div>

            <div class="buttons">
                <stone-button v-for="button in buttonArray" :text="button.text" :link="button.link"
                              @pre="parseAction(button.action)"></stone-button>

                <stone-button v-if="link === '' && buttonArray.length === 0" text="Continue"
                              @pre="hide()"></stone-button>
                <stone-button v-if="link !== '' && buttonArray.length === 0" :link="link" text="Continue"
                              @pre="hide()"></stone-button>
            </div>
        </div>
    </transition>
</template>

<script>
  import StoneButton from '../components/stone-button'
  import Player from "../components/player"

  export default {
    name: "StoryOverlay",
    components: {StoneButton, Player},
    props: {
      title: {
        type: String,
        default: "Story",
      },
      link: String,
      buttons: String,
    },
    data() {
      return {
        visible: true,
        buttonArray: []
      }
    },
    methods: {
      hide: function () {
        this.visible = false;
        this.$emit('continue');
      },
      parseAction: function (text) {
        console.log(text);

        var actions = text.split(";");
        var self = this;

        actions.forEach(function (action) {
          var aParts = action.split(":");
          switch (aParts[0]) {
            case "ls":
              var key = aParts[1].split("=")[0];
              var val = aParts[1].split("=")[1];
              window.localStorage.setItem(key, val);
              break;
            case "fight":
              self.$router.push("/dungeon/fight");
              break;
            case "heal":
              var val = aParts[1].split("=")[1];
              console.log("Heal val: " + val);
              self.$refs.playerEvent.heal(parseInt(val));
              break;
            case "quit":
              self.$router.go();
              //self.$forceUpdate();
              self.hide();
              break;
          }
        });
      }
    },
    mounted() {
      if (this.buttons !== window.undefined && this.buttons !== "") {
        console.log(this.buttons.split("'").join('"'));
        this.buttonArray = JSON.parse(this.buttons.split("'").join('"'));
        console.log(this.buttonArray);
      }
    }
  }
</script>

<style lang="scss">
    .story-overlay {
        position: fixed;
        left: 8px;
        right: 8px;
        top: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.95);
        padding: 0 20px;
        z-index: 9999;

        .text,
        .buttons {
            margin-bottom: 20px;
            max-width: 360px;
            margin: 0 auto;
        }

        .player {
            height: 0;
            padding: 0;
            margin: 0;
        }
    }
</style>