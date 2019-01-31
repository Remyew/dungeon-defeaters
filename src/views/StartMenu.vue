<template>
    <div class="mainmenu">
        <h1>Character selection</h1>

        <player :hide="true" ref="playerSM"></player>

        <div class="inputs">
            <input v-model="name" placeholder="Enter name">
            <select v-model="pclass">
                <option disabled value="">Please select a class</option>
                <option v-for="(pclass, index) in pclasses" :value="index">{{pclass.name}}</option>
            </select>
            <select v-model="dungeonID">
                <option disabled :value="-1">Please select a type</option>
                <option v-for="(dtype, index) in dtypes" :value="index">{{dtype.name}}</option>
            </select>
        </div>

        <div v-if="pclass !== ''">
            <div class="player-value"> Strength: {{playerStrength}}</div>
            <div class="player-value"> Precision: {{playerPrecision}}</div>
            <div class="player-value"> Vitality: {{playerVitality}}</div>
            <div class="player-value"> Tenacity: {{playerTenacity}}</div>
        </div>

        <div class="output" v-if="pclass !== ''">
            <p>Hi, my name is: {{ name }} and I am a {{ pclassName }}</p>
        </div>

        <stone-button v-if="pclass !== '' && dungeonID !== -1" text="Enter the Dungeon!" link="/dungeon"
                      @pre="loadDungeon(); loadAttacks()"></stone-button>

        <div class="bottom-bar">
            <!--<button onclick="window.localStorage.clear(); location.reload();">
                If you will look here!
            </button>
            <br/><br/>-->
            <div>
                <router-link to="/">
                    <span>Leave</span>
                </router-link>
                <router-link style="margin-left: 10px;" to="/about">
                    <span>About</span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .inputs,
    .output {
        text-align: left;
    }
</style>

<script>
  import StoneButton from "../components/stone-button";
  import Player from "../components/player";

  export default {
    name: 'MainMenu',
    components: {Player, StoneButton},
    data() {
      return {
        name: 'Carlay',
        pclass: '',
        pclassName: '',
        pclasses: [],
        dungeonID: -1,
        dtypes: [],
        //Player values
        playerStrength: 0,
        playerVitality: 0,
        playerPrecision: 0,
        playerTenacity: 0,
      };
    },
    methods: {
      loadAttacks: function () {
        this.axios
          .get('http://' + localStorage.ip + ':8081/getAttacks.php', {params: {id: parseInt(this.pclass + 1)}})
          .then(response => {
            console.log(response.data);
            var load = response.data;

            var attacks = [];
            for (var el in load.attacks) {
              attacks.push({
                id: load.attacks[el].id,
                name: load.attacks[el].name,
                cooldown: load.attacks[el].cooldown,
                effect: load.attacks[el].effect,
              });
            }
            localStorage.attacks = JSON.stringify(attacks);
          })
          .catch(error => {
            console.log(error)
          });
      },
      loadDungeon: function () {
        console.log(this.dtypes[this.dungeonID].levels);
      }
    },
    mounted() {
      localStorage.ip = window.location.href.split(":")[1].substring(2, window.location.href.split(":")[1].length);

      if (localStorage.name) this.name = localStorage.name;
      if (localStorage.pclass) this.pclass = localStorage.pclass;
      if (localStorage.dungeonID) this.dungeonID = localStorage.dungeonID;
      if (localStorage.pclassName) this.pclassName = localStorage.pclassName;

      if (localStorage.playerStrength) this.playerStrength = parseInt(localStorage.playerStrength);
      if (localStorage.playerVitality) this.playerVitality = parseInt(localStorage.playerVitality);
      if (localStorage.playerPrecision) this.playerPrecision = parseInt(localStorage.playerPrecision);
      if (localStorage.playerTenacity) this.playerTenacity = parseInt(localStorage.playerTenacity);

      localStorage.allowSetSBN = true;
      localStorage.showEnter = true;

      //Set starting equip
      localStorage.coins = 5;
      localStorage.inventory = JSON.stringify([{item_id: 110, amount: 5}]);
      localStorage.equipment = JSON.stringify([{item_id: 10, amount: 1}, {item_id: 60, amount: 1}, {}]);
      localStorage.weaponDamage = "1-1";
      localStorage.armorValue = 1;

      this.axios
        .get('http://' + localStorage.ip + ':8081/getClasses.php')
        .then(response => {
          console.log(response.data);
          var load = response.data;

          for (var el in load.classes) {
            this.pclasses.push({
              id: load.classes[el].id,
              name: load.classes[el].name,
              strength: load.classes[el].strength,
              vitality: load.classes[el].vitality,
              tenacity: load.classes[el].tenacity,
              precision: load.classes[el].precision
            });
          }
        })
        .catch(error => {
          console.log(error)
        });

      this.axios
        .get('http://' + localStorage.ip + ':8081/getDungeons.php')
        .then(response => {
          console.log(response.data);
          var load = response.data;

          for (var el in load.dungeons) {
            this.dtypes.push({
              id: load.dungeons[el].id,
              name: load.dungeons[el].name,
              levels: load.dungeons[el].levels,
            });
          }
        })
        .catch(error => {
          console.log(error)
        });
    },
    watch: {
      name(newname) {
        localStorage.name = newname;
      },
      pclass(newpclass) {
        if (newpclass >= 0) {
          if (this.pclasses[newpclass] !== window.undefined) {
            this.pclassName = this.pclasses[newpclass].name;
            localStorage.pclassName = this.pclassName;
            localStorage.pclass = newpclass;

            this.playerStrength = this.pclasses[newpclass].strength;
            this.playerVitality = this.pclasses[newpclass].vitality;
            this.playerTenacity = this.pclasses[newpclass].tenacity;
            this.playerPrecision = this.pclasses[newpclass].precision;
          }
        }
      },
      dungeonID(newdungeonID) {
        if (newdungeonID >= 0) {
          if (this.dtypes[newdungeonID] !== window.undefined) {
            localStorage.dungeonID = newdungeonID;
            localStorage.dungeon = JSON.stringify({
              id: this.dtypes[newdungeonID].id,
              name: this.dtypes[newdungeonID].name,
              levels: this.dtypes[newdungeonID].levels
            });
            console.log(localStorage.dungeon);
          }
        }
      },
      playerStrength(newstrength) {
        localStorage.playerStrength = newstrength;
      },
      playerVitality(newvitality) {
        localStorage.playerVitality = newvitality;
      },
      playerPrecision(newprecision) {
        localStorage.playerPrecision = newprecision;
      },
      playerTenacity(newtenacity) {
        localStorage.playerTenacity = newtenacity;
      }
    }
  }
</script>

<style lang="scss" scoped>
    .inputs {
        margin-bottom: 15px;

        input,
        select {
            font-family: Courier, sans-serif;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 10px;
            font-size: 20px;
        }
    }

    .player-value {
        margin: 5px 0;
        user-select: none;
    }
</style>