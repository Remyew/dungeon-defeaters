<template>
    <div class="dungeonmenu">
        <h1> The Dungeon </h1>
        <h2> Level {{dungeonLevel}} - {{3-dungeonLevelProgress}} / 3 </h2>

        <player ref="menuPlayer" :show-data="true"></player>

        <div class="player-actions">
            <h2> What to do??? </h2>

            <span v-for="option in options">
                <!-- Hidden button -->
                <stone-button v-if="!option.show" text="???" @pre="openOpt(option)"></stone-button>

                <transition name="spin">
                    <!-- Button with link, if there is no pre text -->
                    <stone-button v-if="option.show && option.preText === ''"
                                  :link="option.link"
                                  :text="option.buttonText"
                                  @pre="loadInLS(option.localStorage)"></stone-button>
                    <!-- If there is pre text, decide if to go to an event or open in story overlay -->
                    <!--<stone-button v-if="option.show && option.preText !== '' && option.link === ''"
                                  :text="option.buttonText"
                                  @pre="showPreOpt(option)"></stone-button>-->
                    <stone-button v-if="option.show && option.preText !== '' && option.link !== ''"
                                  :link="option.link"
                                  :text="option.buttonText"
                                  @pre="loadInLS(option.localStorage); eventLS(option.buttonActions, option.preText)"></stone-button>
                </transition>

                <!-- Text after clicking hidden button -->
                <story-overlay v-if="option.open" @continue="toggleOptions(option)"> {{option.text}} </story-overlay>
                <!-- Text after klicking action button (preText) -->
                <story-overlay v-if="option.showPre" :buttons="option.buttonActions"
                               @continue="loadInLS(option.localStorage)"> {{option.preText}} </story-overlay>
            </span>

            <stone-button link="/dungeon/inventory" text="Open your inventory"></stone-button>
        </div>


        <div class="bottom-bar">
           <!-- <router-link to="/character">
                <button onclick="window.localStorage.clear();">
                    If you will look here!
                </button>
            </router-link>
            <br/><br/>
            <div>
                <router-link to="/">
                    <span>Home</span>
                </router-link>
                <router-link style="margin-left: 10px;" to="/about">
                    <span>About</span>
                </router-link>
            </div>-->
            <router-link to="/">
                <span>Surrender</span>
            </router-link>
        </div>

        <story-overlay v-if="showEnter === 'true'" @continue="showedEnter()">
            {{enter}}
        </story-overlay>

        <story-overlay v-if="showBossNext === 'true'" @continue="showedBossNext()">
            {{bossNext}}
        </story-overlay>
    </div>
</template>


<script>
  import StoneButton from "../components/stone-button";
  import Player from "../components/player";
  import StoryOverlay from "../components/story-overlay";

  export default {
    name: "DungeonMenu",
    components: {Player, StoneButton, StoryOverlay},
    data() {
      return {
        dungeonLevel: 1,
        dungeonLevelProgress: 3,
        bossNext: false,
        showBossNext: false,
        showEnter: false,
        options: [],
        enter: '',
        bossNext: '',
      };
    },
    methods: {
      eventLS: function (btnActions, preText) {
        localStorage.eventButtons = btnActions;
        localStorage.eventText = preText
      },
      loadInLS: function (command) {
        if (command !== "") {
          console.log("Command: " + command);
          var parts = command.split(";");

          for (var i = 0; i < parts.length; i++) {
            var key = parts[i].split("=")[0];
            var value = parts[i].split("=")[1];
            value = value.split("'").join('"');
            console.log("Val: " + value);
            window.localStorage.setItem(key, value);
          }

          window.localStorage.removeItem("paths");
        }
      },
      toggleOptions: function (option) {
        option.show = !option.show;
        option.open = !option.open;
        localStorage.paths = JSON.stringify(this.options);
      },
      openOpt: function (option) {
        option.open = true;
        localStorage.paths = JSON.stringify(this.options);
      },
      showPreOpt: function (option) {
        option.showPre = true;
        localStorage.paths = JSON.stringify(this.options);
      },
      showedEnter: function () {
        this.showEnter = false;
        localStorage.showEnter = false;
      },
      showedBossNext: function () {
        this.showBossNext = false;
        localStorage.showBossNext = false;
      }
    },
    mounted() {
      if (localStorage.dungeonLevelProgress) this.dungeonLevelProgress = parseInt(localStorage.dungeonLevelProgress);
      if (!localStorage.dungeonLevelProgress) localStorage.dungeonLevelProgress = this.dungeonLevelProgress;
      if (localStorage.dungeonLevel) this.dungeonLevel = parseInt(localStorage.dungeonLevel);
      if (!localStorage.dungeonLevel) localStorage.dungeonLevel = this.dungeonLevel;
      console.log("DLP: " + this.dungeonLevelProgress);


      if (!localStorage.canFlee) localStorage.canFlee = 1;
      if (this.dungeonLevelProgress === 0) {
        localStorage.canFlee = 0;
        this.bossNext = true;

        if (localStorage.allowSetSBN === "true") {
          localStorage.showBossNext = true;
          localStorage.showBoss = true;
        }
        localStorage.allowSetSBN = false;
      } else if (this.dungeonLevelProgress === -1) {
        localStorage.canFlee = 1;
        this.bossNext = false;
        localStorage.showBossNext = false;
        localStorage.allowSetSBN = true;
        localStorage.showEnter = true;

        this.dungeonLevelProgress = 3;
        this.dungeonLevel++;
        this.$refs.menuPlayer.heal(this.$refs.menuPlayer.vitality());

        localStorage.dungeonLevelProgress = this.dungeonLevelProgress;
        localStorage.dungeonLevel = this.dungeonLevel;
        console.log("New DL: " + this.dungeonLevel);
      }

      if (localStorage.showEnter) this.showEnter = localStorage.showEnter;
      if (localStorage.showBossNext) this.showBossNext = localStorage.showBossNext;

      if (!localStorage.paths) {
        this.axios.get('http://' + localStorage.ip + ':8081/getPaths.php', {params: {'level': this.dungeonLevel}})
          .then(response => {
            console.log(response.data);
            var load = response.data;

            for (var el in load.paths) {
              this.options.push({
                text: load.paths[el].text,
                buttonText: load.paths[el].buttonText,
                link: load.paths[el].link,
                localStorage: load.paths[el].localStorage,
                preText: load.paths[el].preText,
                buttonActions: load.paths[el].buttonActions,
                show: false,
                showPre: false,
                open: false,
              });
            }

            localStorage.paths = JSON.stringify(this.options);
          })
          .catch(error => {
            console.log(error)
          });
      } else {
        this.options = JSON.parse(localStorage.paths);
      }


      this.axios.get('http://' + localStorage.ip + ':8081/getLevel.php', {params: {'id': this.dungeonLevel}})
        .then(response => {
          console.log(response.data);
          var load = response.data;

          this.enter = load.enter_text;
          this.bossNext = load.boss_pre_text;
        })
        .catch(error => {
          console.log(error)
        });
    }
  }
</script>
<style lang="scss" scoped>
    h1 {
        margin-bottom: 0;
    }

    h2 {
        margin-top: 0;
    }
</style>