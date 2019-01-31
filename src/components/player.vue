<template>
    <div class="player" :class="{'invisible': hide}">
        <div id="sd-player"></div>
        <div class="player-values" v-if="!hide">
            <div v-if="showData">
                <div class="player-value"> I am {{name}} the {{pClass}}</div>
                <div class="player-value"> Strength: {{strength()}}</div>
                <div class="player-value"> Precision: {{precision()}}</div>
                <div class="player-value"> Vitality: {{vitality()}}</div>
                <div class="player-value"> Tenacity: {{tenacity()}}</div>
                <div class="player-value"> Attack: {{minAttack()}} - {{maxAttack()}}</div>
                <div class="player-value"> Armor: {{armor()}}</div>
            </div>

            <div v-if="!showData" class="player-fight">
                <span class="name"> {{name}} </span>
                <span> Damage: {{this.minAttack()}} - {{this.maxAttack()}} </span>
                <span> Armor: {{this.armor()}} </span>
            </div>
            <div class="lifebar" :style="{ backgroundImage: 'url(' + require('../assets/health-icon.png') + ')' }">
                <progress-bar type="line" ref="pLifebar" :options="baroptions"></progress-bar>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showDefeated" class="defeated">
                <h1> DEFEATED </h1>
                <stone-button link="/" text="Play again" @pre="deleteStorage()"></stone-button>
            </div>
        </transition>
    </div>
</template>

<script>
  import StoneButton from "./stone-button";

  export default {
    name: "Player",
    components: {StoneButton},
    props: {
      hide: Boolean,
      showData: Boolean
    },
    data() {
      return {
        name: '',
        pClass: '',
        level: 1,

        //Attributes
        playerStrength: -1, //Physical power
        playerVitality: -1, //Magical power
        playerPrecision: -1, //Critical chance
        playerTenacity: -1, //Health and Armor
        maxPoints: -1,
        currentPoints: -1,

        //Computed attributes
        currentHealth: -1,
        maxHealth: -1,
        weaponDamage: -1,
        armorValue: -1,
        itemStrength: -1,
        itemVitality: -1,
        itemPrecision: -1,
        itemTenacity: -1,
        isDefeated: false,
        showDefeated: false,

        //Lifebar
        baroptions: {
          color: '#dd2504',
          strokeWidth: 1.5,
          text: {
            value: 20, //Same as pHealth
            className: 'p-lifebar-label',
            style: {}
          },
        },
      }
    },
    methods: {
      takeDamage: function (dmg) {
        dmg -= this.armor();
        if (dmg < 0) dmg = 0;

        this.currentHealth -= dmg;
        var maxHP = this.maxHealth;
        var percentage = this.currentHealth / maxHP;

        console.log("Player taking damage: " + dmg + " => CurHealth:" + this.currentHealth + " => Cur%:" + percentage);
        localStorage.currentHealth = this.currentHealth;

        if (this.currentHealth <= 0) {
          console.log("HP < 0");
          if (this.$refs.pLifebar !== window.undefined) {
            this.$refs.pLifebar.animate(0, {
              step: function (state, circle, attachment) {
                circle.setText("0");
              },
            });
          }
          localStorage.currentHealth = -1;
          this.isDefeated = true;
          setTimeout(() => this.showDefeated = true, 1000);
        } else {
          if (this.$refs.pLifebar !== window.undefined) {
            this.$refs.pLifebar.animate(percentage, {
              step: function (state, circle, attachment) {
                circle.setText(Math.round(maxHP * circle.value()));
              },
            });
          }
        }

        this.textEffect("-" + dmg);
      },
      heal: function (amount) {
        console.log("Healing for " + amount);
        amount = parseInt(amount);
        this.currentHealth += amount;
        if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth;
        localStorage.currentHealth = this.currentHealth;

        this.textEffect(this.currentHealth + " / " + this.maxHealth, "#45f442");
      },
      textEffect: function (text, color) {
        var node = document.createElement("h3");
        node.appendChild(document.createTextNode(text));
        node.setAttribute('class', 'damage');
        node.setAttribute("style", "color:" + color + ";");
        document.getElementById("sd-player").appendChild(node);

        setTimeout(() => node.setAttribute('class', 'damage damage-move'), 10);
        setTimeout(() => node.setAttribute('class', 'damage damage-hide'), 1000);
        setTimeout(() => document.getElementById("sd-player").removeChild(node), 1600);
      },
      armor: function () {
        return Math.floor(this.tenacity() / 2) + parseInt(this.armorValue);
      },
      minAttack: function () {
        return Math.floor(this.strength() / 2) + parseInt(this.weaponDamage.split("-")[0]);
      },
      maxAttack: function () {
        return Math.round(this.strength() / 2) + parseInt(this.weaponDamage.split("-")[1]);
      },
      attack: function () {
        var rand = Math.random();
        console.log("Precision: " + (this.precision() / 10));
        var crit = rand < this.precision() / 10 ? 2 : 1;
        console.log("Critting: " + (crit === 2));
        return Math.round((Math.random() * (this.maxAttack() - this.minAttack())) + this.minAttack()) * crit;
      },
      strength: function () {
        return parseInt(this.playerStrength) + parseInt(this.itemStrength);
      },
      vitality: function () {
        return parseInt(this.playerVitality) + parseInt(this.itemVitality);
      },
      tenacity: function () {
        return parseInt(this.playerTenacity) + parseInt(this.itemTenacity);
      },
      precision: function () {
        return parseInt(this.playerPrecision) + parseInt(this.itemPrecision);
      },
      itemAction: function (actions) {
        console.log(actions);

        var self = this;

        actions.split(";").forEach(function (action) {
          var parts = action.split(":");
          var order = parts[0];
          var amount = parts[1];

          switch (order) {
            case 'heal':
              self.heal(parseInt(amount));
              break;
            case 'attack':
              self.weaponDamage = amount.match(/\d*-\d*/g);
              localStorage.weaponDamage = amount.match(/\d*-\d*/g);
              console.log("New wd: " + self.weaponDamage);
              break;
            case 'armor':
              self.armorValue = parseInt(self.armorValue) + parseInt(amount);
              localStorage.armorValue = self.armorValue;
              console.log("New armor: " + self.armorValue);
              break;
            case 'strength':
              self.itemStrength = parseInt(self.itemStrength) + parseInt(amount);
              localStorage.itemStrength = self.itemStrength;
              console.log("New strength: " + self.itemStrength);
              break;
            case 'vitality':
              self.itemVitality = parseInt(self.itemVitality) + parseInt(amount);
              localStorage.itemVitality = self.itemVitality;
              console.log("New vitality: " + self.itemVitality);
              break;
            case 'tenacity':
              self.itemTenacity = parseInt(self.itemTenacity) + parseInt(amount);
              localStorage.itemTenacity = self.itemTenacity;
              console.log("New tenacity: " + self.itemTenacity);
              break;
            case 'precision':
              self.itemPrecision = parseInt(self.itemPrecision) + parseInt(amount);
              localStorage.itemPrecision = self.itemPrecision;
              console.log("New precision: " + self.itemPrecision);
              break;
          }
        });
      },
      removeItemAction: function (actions) {
        console.log("=== REMOVING IA ===");
        console.log(actions);

        var self = this;

        if (actions !== '' && actions !== window.undefined) {
          actions.split(";").forEach(function (action) {
            var parts = action.split(":");
            var order = parts[0];
            var amount = parts[1];

            switch (order) {
              case 'attack':
                self.weaponDamage = "0-0";
                localStorage.weaponDamage = "0-0";
                console.log("New wd: " + self.weaponDamage);
                break;
              case 'armor':
                console.log("self.armorValue[" + self.armorValue + "] = parseInt(self.armorValue)[" + parseInt(self.armorValue) + "] - parseInt(amount)[" + parseInt(amount) + "];");
                self.armorValue = parseInt(self.armorValue) - parseInt(amount);
                localStorage.armorValue = self.armorValue;
                console.log("New armor: " + self.armorValue);
                break;
              case 'strength':
                console.log("C strength: " + self.itemStrength);
                console.log("Amount: " + parseInt(amount));
                self.itemStrength = parseInt(self.itemStrength) - parseInt(amount);
                localStorage.itemStrength = self.itemStrength;
                console.log("New strength: " + self.itemStrength);
                break;
              case 'vitality':
                self.itemVitality = parseInt(self.itemVitality) - parseInt(amount);
                localStorage.itemVitality = self.itemVitality;
                console.log("New vitality: " + self.itemVitality);
                break;
              case 'tenacity':
                self.itemTenacity = parseInt(self.itemTenacity) - parseInt(amount);
                localStorage.itemTenacity = self.itemTenacity;
                console.log("New tenacity: " + self.itemTenacity);
                break;
              case 'precision':
                self.itemPrecision = parseInt(self.itemPrecision) - parseInt(amount);
                localStorage.itemPrecision = self.itemPrecision;
                console.log("New precision: " + self.itemPrecision);
                break;
            }
          });
        }
      },
      deleteStorage: function () {
        window.localStorage.clear();
      }
    },
    created() {
      //Set default values
      this.name = localStorage.name ? localStorage.name : 'Carlay';
      this.pClass = localStorage.pclassName ? localStorage.pclassName : 'Peasant';
      this.level = localStorage.level ? localStorage.level : 1;

      this.playerStrength = localStorage.playerStrength ? localStorage.playerStrength : 0;
      this.playerVitality = localStorage.playerVitality ? localStorage.playerVitality : 0;
      this.playerPrecision = localStorage.playerPrecision ? localStorage.playerPrecision : 0;
      this.playerTenacity = localStorage.playerTenacity ? localStorage.playerTenacity : 0;
      this.maxPoints = localStorage.max ? localStorage.max : 0;
      this.currentPoints = localStorage.current ? localStorage.current : 0;

      this.itemStrength = localStorage.itemStrength ? localStorage.itemStrength : 0;
      this.itemVitality = localStorage.itemVitality ? localStorage.itemVitality : 0;
      this.itemPrecision = localStorage.itemPrecision ? localStorage.itemPrecision : 0;
      this.itemTenacity = localStorage.itemTenacity ? localStorage.itemTenacity : 0;
      this.maxHealth = 12 + (this.level * this.vitality());
      this.currentHealth = localStorage.currentHealth ? parseInt(localStorage.currentHealth) : this.maxHealth;
      this.weaponDamage = localStorage.weaponDamage ? localStorage.weaponDamage : "0-0";
      this.armorValue = localStorage.armorValue ? localStorage.armorValue : 0;
    }
    ,
    mounted() {
      var maxHP = this.maxHealth;

      if (this.$refs.pLifebar !== window.undefined) {
        this.$refs.pLifebar.animate(this.currentHealth / this.maxHealth, {
          step: function (state, circle, attachment) {
            circle.setText(Math.round(maxHP * circle.value()));
          },
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
    .player {
        //width: 359.2px;
        //height: 111.35px;
        //overflow: hidden;
        padding: 6px;
        margin: 10px 0;
        border: 1px solid black;

        &.invisible {
            border: none;
        }

        .player-values {
            width: 100%;
            height: 100%;
            text-align: left;
            font-weight: 600;
            background-size: contain;
            margin: 0 auto;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;

            * {
                pointer-events: none;
            }

            .player-value {
                display: inline-block;
                box-sizing: border-box;
                padding: 0 15px;

                &:nth-of-type(1) {
                    width: 100%;
                    margin-bottom: 4px;
                }
            }
        }

        .player-fight {
            margin-left: -5px;

            span {
                margin: 0 5px;
            }

            .name {
                display: block;
            }
        }
    }
</style>

<style lang="scss">
    .player {
        #sd-player {
            position: relative;

            .damage {
                position: absolute;
                color: #dd2504;
                right: 20px;
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

        .lifebar {
            margin: 10px 0;
            position: relative;
            height: 30px;
            background-repeat: no-repeat;
            background-position-y: 80%;
            background-position-x: 57%;

            .p-lifebar-label {
                text-align: center;
                margin-top: 5px;
                font-family: 'VT323', Courier, sans-serif;
                font-size: 20px;
            }
        }
    }
</style>