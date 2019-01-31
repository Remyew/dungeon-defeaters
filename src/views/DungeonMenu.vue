<template>
    <div class="dungeonmenu">
        <h1> {{dungeon.name}} </h1>
        <h2> Level {{dungeonLevel.level}} - {{dungeonLevel.name}} </h2>

        <player ref="menuPlayer" :show-data="true"></player>

        <div class="player-actions">
            <h2> What to do??? </h2>

            <span v-for="(path, index) in currentPathes">
                <!-- Hidden button -->
                <stone-button v-if="!path.show" text="???" @pre="openOpt(path)"></stone-button>

                <transition name="spin">
                    <!-- Button that links to next action -->
                    <stone-button v-if="path.show && path.preText === ''"
                                  :link="path.link"
                                  :text="path.buttonText"
                                  @pre="loadInLS(path.localStorage); activatePath(index)"></stone-button>
                    <!-- && path.link !== '' -->
                    <stone-button v-if="path.show && path.preText !== ''"
                                  :link="path.link"
                                  :text="path.buttonText"
                                  @pre="loadInLS(path.localStorage); setEventData(path.buttonActions, path.preText); activatePath(index)"></stone-button>
                </transition>

                <!-- Text after clicking hidden button -->
                <story-overlay v-if="path.open"
                               @continue="toggleCurrentPathes(path)"> {{path.text}} </story-overlay>
                <!-- Text after klicking action button (preText) -->
                <story-overlay v-if="path.showPre" :buttons="path.buttonActions"
                               @continue="loadInLS(path.localStorage)"> {{path.preText}} </story-overlay>
            </span>

            <stone-button link="/dungeon/inventory" text="Open your inventory"></stone-button>
        </div>

        <div class="bottom-bar">
            <router-link to="/">
                <span>Surrender</span>
            </router-link>
        </div>

        <story-overlay v-if="showEnter === 'true'" @continue="showedEnter()">
            {{enter}}
        </story-overlay>

        <story-overlay v-if="showBossNext === 'true' || showBossNext === true" @continue="showedBossNext()">
            {{dungeonLevel.bossPre}}
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
        dungeonLevelIndex: -1,//Saves the array position of the current dungeonlevel in dungeon
        dungeonLevel: {},//Saves data from level table
        dungeon: {},//Saves data from dungeon table
        pathes: {},//Saves all the pathes for the level
        bossNext: false,//Activates boss message
        showBossNext: false,//Activates/Deactivates boss message
        showEnter: false,//Show enter message
        currentPathes: [],//Saves the displayed pathes
        levelPathes: [],//Saves the left pathes of the level
        currentPathCount: -1,//Saves the length of the current path array to enable asynchron loading in path array
      }
    },
    methods: {
      setEventData: function (btnActions, preText) {
        localStorage.eventButtons = btnActions;
        localStorage.eventText = preText
      },
      loadInLS: function (command) {
        if (command !== "") {
          var parts = command.split(";");

          for (var i = 0; i < parts.length; i++) {
            var key = parts[i].split("=")[0];
            var value = parts[i].split("=")[1];
            value = value.split("'").join('"');
            window.localStorage.setItem(key, value);
          }
        }
      },
      toggleCurrentPathes: function (path) {
        path.show = !path.show;
        path.open = !path.open;
        localStorage.paths = JSON.stringify(this.currentPathes);
      },
      openOpt: function (path) {
        path.open = true;
        localStorage.paths = JSON.stringify(this.currentPathes);
      },
      showPreOpt: function (path) {
        path.showPre = true;
        localStorage.paths = JSON.stringify(this.currentPathes);
      },
      showedEnter: function () {
        this.showEnter = false;
        localStorage.showEnter = false;
      },
      showedBossNext: function () {
        this.showBossNext = false;
        localStorage.showBossNext = false;
      },
      loadPathes: function () {
        //If there are pathes left in the dungeon, load pathes from there.
        if (this.dungeonLevel.pathes.length > 0) {
          //Load pathes until there are three pathes
          while (this.currentPathCount < 3) {
            //Increase amount of pathes
            this.currentPathCount++;
            localStorage.currentPathCount = this.currentPathCount;

            //Choose random path
            var randomIndex = Math.floor(Math.random() * this.dungeonLevel.pathes.length);
            var randomPath = this.dungeonLevel.pathes[randomIndex];
            randomPath.amount--;
            //Save dungeon with removed path
            localStorage.dungeonLevel = JSON.stringify(this.dungeonLevel);

            this.axios.get('http://' + localStorage.ip + ':8081/getPath.php', {
              params: {
                'type': randomPath.type,
                "level": this.dungeonLevel.level
              }
            })
              .then(response => {
                console.log(response.data);
                var load = response.data;

                //Load path from server, then save it in lS
                this.currentPathes.push({
                  text: load.text,
                  buttonText: load.buttonText,
                  link: load.link,
                  localStorage: load.localStorage,
                  preText: load.preText,
                  buttonActions: load.buttonActions,
                  show: false,
                  showPre: false,
                  open: false,
                });

                localStorage.paths = JSON.stringify(this.currentPathes);
              })
              .catch(error => {
                console.log(error)
              });

            //Remove path from level, if there are none of this type left
            if (randomPath.amount <= 0) {
              this.dungeonLevel.pathes.splice(randomIndex, 1);
              localStorage.dungeonLevel = JSON.stringify(this.dungeonLevel);
            }
          }
          //If there are no paths left and the boss wasn't already loaded
        } else if (parseInt(this.currentPathCount) === 0 && parseInt(localStorage.loadedBoss) === 0) {
          //Set variables to enable boss texts
          this.showBossNext = true;
          localStorage.showBossNext = true;
          localStorage.loadedBoss = 1;
          localStorage.canFlee = 0;
          localStorage.showBoss = true;

          //Add boss button
          this.currentPathes = [{
            text: this.dungeonLevel.bossPre,
            buttonText: this.dungeonLevel.bossButton,
            link: "dungeon/fight",
            localStorage: "",
            preText: "",
            buttonActions: "",
            show: true,
            showPre: false,
            open: false,
          }];

          //Save path to boss
          localStorage.paths = JSON.stringify(this.currentPathes);
        }
      },
      activatePath: function (index) {
        var self = this;
        setTimeout(function () {
          self.currentPathes.splice(index, 1);
          self.currentPathCount--;
          localStorage.currentPathCount = self.currentPathCount;
          localStorage.paths = JSON.stringify(self.currentPathes);
        }, 1000);
      }
    },
    mounted() {
      //Load data from local storage
      if (localStorage.dungeon) this.dungeon = JSON.parse(localStorage.dungeon);
      if (localStorage.paths) this.currentPathes = JSON.parse(localStorage.paths);
      if (localStorage.currentPathCount) this.currentPathCount = localStorage.currentPathCount;
      if (localStorage.showBossNext) this.showBossNext = localStorage.showBossNext;
      if (localStorage.dungeonLevelIndex) this.dungeonLevelIndex = localStorage.dungeonLevelIndex;
      localStorage.canFlee = 1;

      //Load level at the beginning, loadedLevel resets after boss defeat.
      if (parseInt(this.currentPathCount) === -1) {
        localStorage.loadedBoss = 0;
        //Increase index; -1 at the beginning
        this.dungeonLevelIndex++;
        localStorage.dungeonLevelIndex = this.dungeonLevelIndex;

        //Load level by index
        this.axios
          .get('http://' + localStorage.ip + ':8081/getLevel.php', {params: {'id': this.dungeon.levels[this.dungeonLevelIndex]}})
          .then(response => {
            console.log(response.data);
            var load = response.data;

            this.dungeonLevel = {
              name: load.name,
              level: load.level,
              enter: load.enter_text,
              bossPre: load.boss_pre_text,
              bossFightText: load.boss_fight_start_text,
              bossButton: load.boss_button,
              pathes: load.pathes,
            };
            //Save dungeon level
            localStorage.dungeonLevel = JSON.stringify(this.dungeonLevel);
            localStorage.level = load.level;

            //Set pathcount to 0 to ensure correct amount of paths. Will be increased in loading
            this.currentPathCount = 0;
            localStorage.currentPathCount = this.currentPathCount;

            //Load pathes
            this.loadPathes();
          })
          .catch(error => {
            console.log(error)
          });
      } else {
        //Load level from localStoorage
        this.dungeonLevel = JSON.parse(localStorage.dungeonLevel);
        //Load additional pathes
        this.loadPathes();
      }
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