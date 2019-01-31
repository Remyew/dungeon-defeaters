<template>
    <div class="enemy">
        <h2 id="enemy-name"> {{ name }} </h2>
        <div class="e-lifebar">
            <progress-bar type="line" ref="eLifebar" :options="baroptions"></progress-bar>
        </div>
        <div class="e-data">
            <b>Damage: {{minAttack}} - {{maxAttack}} &nbsp; Armor: {{armor}}</b>
        </div>
        <transition name="fade">
            <div v-if="showDefeated" class="defeated">
                <h1> DEFEATED </h1>
                <stone-button link="/dungeon" text="Leave the corpse"></stone-button>
                <stone-button link="/dungeon/loot" text="Take the loot" @pre="prepareLoot()"></stone-button>
            </div>
        </transition>

        <story-overlay v-if="showBoss === 'true'" @continue="showedBoss()">
            {{introText}}
        </story-overlay>
    </div>
</template>

<script>
  import StoneButton from "./stone-button";
  import StoryOverlay from '../components/story-overlay';

  export default {
    name: "enemy",
    components: {StoneButton, StoryOverlay},
    props: {
      level: Number,
    },
    data() {
      return {
        name: '',
        maxHP: -1,
        currentHP: -1,
        minAttack: -1,
        maxAttack: -1,
        armor: -1,
        lootData: '',
        isDefeated: false,
        showDefeated: false,
        damaged: 0,
        isBoss: false,
        showBoss: false,
        introText: '',

        baroptions: {
          color: '#dd2504',
          strokeWidth: 0.5,
          text: {
            value: this.pHealth,
            className: 'e-lifebar-label',
            style: {}
          },
        },
      }
    },
    methods: {
      takeDamage: function (dmg, maxAttack) {
        dmg -= this.armor;
        dmg = dmg >= 0 ? dmg : 0;

        this.currentHP -= dmg;
        var percentage = this.currentHP / this.maxHP;
        var maxHP = this.maxHP;
        this.damaged = true;

        if (this.currentHP <= 0) {
          if (this.$refs.eLifebar !== window.undefined) {
            this.$refs.eLifebar.animate(0, {
              step: function (state, circle, attachment) {
                circle.setText("0");
              },
            });
          }
          this.isDefeated = true;
          window.localStorage.removeItem("enemyID");
          setTimeout(() => this.showDefeated = true, 850);
        } else {
          if (this.$refs.eLifebar !== window.undefined) {
            this.$refs.eLifebar.animate(percentage, {
              step: function (state, circle, attachment) {
                circle.setText(Math.round(maxHP * circle.value()));
              },
            });
          }
        }

        this.textEffect("-" + dmg);

        if (dmg > maxAttack) {
          setTimeout(() => this.textEffect("CRIT"), 300);
        }
      },
      prepareLoot: function () {
        var m1 = this.level > 1 ? this.level > 2 ? this.level > 3 ? this.level > 4 ? 1.0 : 0.75 : 0.5 : 0.25 : 0;
        var m2 = this.level > 2 ? this.level > 3 ? this.level > 4 ? this.level > 5 ? 1.0 : 0.75 : 0.5 : 0.25 : 0;
        var m3 = this.level > 3 ? this.level > 4 ? this.level > 5 ? this.level > 6 ? 1.0 : 0.75 : 0.5 : 0.25 : 0;
        var m4 = this.level > 4 ? this.level > 5 ? this.level > 6 ? this.level > 7 ? 1.0 : 0.75 : 0.5 : 0.25 : 0;

        if (this.isBoss) {
          switch (parseInt(this.level)) {
            case 1:
              m1 = 2.5;
              break;
            case 2:
              m1 = 2;
              m2 = 3;
              break;
            case 3:
              m2 = 2;
              m3 = 3;
              break;
            default:
              m3 = 2;
              m4 = 3;
              break;
          }
        }

        console.log("Loot chances by level: 1, " + m1 + ", " + m2 + ", " + m3 + ", " + m4);

        var lootData = this.lootData.split("'").join('"');
        console.log("Enemy LD: " + this.lootData);
        if(this.lootData === '') {
          console.log("Setting default loot");
          lootData = {level: this.level, type: 0, amin: 1, amax: 3, m0: 1, m1: m1, m2: m2, m3: m3, m4: m4};
        }
        window.localStorage.setItem("lootData", JSON.stringify(lootData));
        console.log("Prepared JSON: " + JSON.stringify(lootData));
        console.log("Prepared: " + window.localStorage.getItem("lootData"));
      },
      attack: function () {
        return Math.round(Math.random() * (this.maxAttack - this.minAttack)) + this.minAttack;
      },
      textEffect: function (text, color) {
        var node = document.createElement("h3");
        node.appendChild(document.createTextNode(text));
        node.setAttribute('class', 'damage');
        node.setAttribute("style", "color:" + color + ";");
        document.getElementById("enemy-name").appendChild(node);

        setTimeout(() => node.setAttribute('class', 'damage damage-move'), 10);
        setTimeout(() => node.setAttribute('class', 'damage damage-hide'), 1000);
        setTimeout(() => document.getElementById("enemy-name").removeChild(node), 1600);
      },
      showedBoss: function () {
        this.showBoss = false;
        localStorage.showBoss = false;
      },
    },
    mounted: function () {
      var etype = localStorage.canFlee === "1" ? "Enemy" : "Boss";
      if (etype === "Boss") {
        this.isBoss = true;
      }

      var params = {'level': parseInt(this.level)};
      if (localStorage.enemyID && etype !== "Boss") {
        params = {'enemy_id': parseInt(localStorage.enemyID)};
      }
      console.log(params);

      this.axios.get('http://' + localStorage.ip + ':8081/get' + etype + '.php', {params: params})
        .then(response => {
          console.log(response.data);
          var load = response.data;

          this.name = load.name;
          this.maxHP = load.life;
          this.currentHP = load.life;
          this.minAttack = load.attackMin;
          this.maxAttack = load.attackMax;
          this.armor = load.armor;
          this.lootData = load.lootData;
          console.log("Enemy LD: " + this.lootData);
          localStorage.enemyID = load.id;
          this.introText = load.boss_text;

          var maxHP = this.maxHP;
          if (this.$refs.eLifebar !== window.undefined) {
            this.$refs.eLifebar.animate(1.0, {
              step: function (state, circle, attachment) {
                circle.setText(Math.round(maxHP * circle.value()));
              },
            });
          }
        })
        .catch(error => {
          console.log(error)
        });

      if (localStorage.showBoss) this.showBoss = localStorage.showBoss;
    },
  }
</script>

<style lang="scss">
    .enemy {
        padding: 6px;
        border: 1px solid black;

        h2 {
            position: relative;
            display: inline-block;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 0;
            margin-bottom: 10px;

            .damage {
                content: '-10';
                position: absolute;
                color: #dd2504;
                right: -20px;
                top: -10px;
                font-size: 14px;
                opacity: 0;
                transition: top 1.5s, opacity .5s;
            }
            .damage-move {
                top: -40px;
                opacity: 1;
            }
            .damage-hide {
                top: -40px;
                opacity: 0;
            }
        }

        .e-lifebar {
            .e-lifebar-label {
                font-family: 'VT323', Courier, serif;
                font-size: 25px;
                font-weight: bold;
                text-align: center;

                &::before {
                    content: 'Enemy HP: ';
                }
            }
        }

        .e-data {
            margin-top: 7px;
        }
    }
</style>