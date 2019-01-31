<template>
    <div class="fight" @my-event="console.log('.fight');">
        <h1> Fight </h1>

        <enemy ref="enemyFight" :level="parseInt(level)"></enemy>
        <player ref="playerFight"></player>

        <div :class="{'flexed': true, 'locked': this.locked}">
            <player-attack ref="attack1" :buttonText="attacks[0].name" :loadingTime="attacks[0].cooldown"
                           @triggered="parseAttack(attacks[0].effect); reduceCD()"></player-attack>
            <player-attack v-if="level >= 1" ref="attack2" :buttonText="attacks[1].name" :loadingTime="attacks[1].cooldown"
                           @triggered="parseAttack(attacks[1].effect); reduceCD()"></player-attack>
            <player-attack v-if="level >= 3" ref="attack3" :buttonText="attacks[2].name" :loadingTime="attacks[2].cooldown"
                           @triggered="parseAttack(attacks[2].effect); reduceCD()"></player-attack>
            <player-attack v-if="level >= 5" ref="attack4" :buttonText="attacks[3].name" :loadingTime="attacks[3].cooldown"
                           @triggered="parseAttack(attacks[3].effect); reduceCD()"></player-attack>
        </div>

        <stone-button v-if="canFlee" link="/dungeon" text="Flee" @pre="clearLS()"></stone-button>
        <stone-button v-if="!canFlee" text="You can't escape"></stone-button>
    </div>
</template>

<script>
  import Enemy from '../components/enemy';
  import Player from '../components/player';
  import StoneButton from '../components/stone-button';
  import PlayerAttack from '../components/player-attack';

  export default {
    name: "Fight",
    components: {StoneButton, Enemy, Player, PlayerAttack},
    data() {
      return {
        level: localStorage.level,
        canFlee: localStorage.canFlee === "1",
        locked: false,
        attacks: [],
        playerDamageMult: 1,
        playerDMultTurns: -1,
        playerDMultAtks: -1,
        playerAddArmor: 0,
        playerAATurns: -1,
        enemyMiss: 0,
        enemyMTurns: -1,
        enemyStun: false,
        enemySTurns: -1,
      }
    },
    methods: {
      parseAttack: function (toParse) {
        console.log("To parse: " + toParse);
        if (!this.locked) {
          var effects = toParse.split(";");

          var self = this;
          effects.forEach(function (effect) {
            var command = effect.split(":")[0];
            var props = effect.split(":")[1] !== window.undefined ? effect.split(":")[1].split(",") : "";
            switch (command) {
              case "damage":
                self.attack();
                self.playerDMultAtks = self.playerDMultAtks - 1 > 0 ? self.playerDMultAtks - 1 : 0;
                console.log("Dmult ats: " + self.playerDMultAtks);
                break;
              case "damageMult":
                self.playerDamageMult = props[2];
                if (props[0] === 't') {
                  self.playerDMultTurns = parseInt(props[1]) + 1;
                } else {
                  self.playerDMultAtks = parseInt(props[1]);
                }
                console.log("Damage Multiplyer: " + props[2] + " for " + props[1] + " " + props[0]);
                break;
              case "miss":
                self.enemyMiss = parseFloat(props[0]);
                self.enemyMTurns = parseInt(props[1]) + 1;
                console.log("Miss chance: " + parseFloat(props[0]) + "% for " + props[1] + " turns");
                break;
              case "stun":
                self.enemyStun = true;
                self.enemySTurns = parseInt(props[0]) + 2;
                console.log("Stunned for " + parseInt(props[0]) + " turns");
                break;
              case "heal":
                var val = parseInt(props[0]);
                self.$refs.playerFight.heal(val);
                break;
              case "armor":
                var dur = parseInt(props[0]);
                var val = parseInt(props[1]);
                self.playerAddArmor = val;
                self.playerAATurns = dur + 1;
                self.$refs.playerFight.armorValue = parseInt(self.$refs.playerFight.armorValue) + val;
                break;
            }
          });
        }

        this.playerDMultTurns = this.playerDMultTurns - 1 > 0 ? this.playerDMultTurns - 1 : 0;
        console.log("Dmult turns: " + this.playerDMultTurns);
        if (this.playerDMultTurns <= 0 && this.playerDMultAtks <= 0) {
          this.playerDamageMult = 1;
        }

        this.playerAATurns = this.playerAATurns - 1 > 0 ? this.playerAATurns - 1 : 0;
        console.log("Add Armor turns: " + this.playerAATurns);
        if (this.playerAATurns <= 0) {
          this.$refs.playerFight.armorValue -= this.playerAddArmor;
          this.playerAddArmor = 0;
        }

        this.enemyMTurns = this.enemyMTurns - 1 > 0 ? this.enemyMTurns - 1 : 0;
        console.log("Miss turns: " + this.enemyMTurns);
        if (this.enemyMTurns <= 0) {
          this.enemyMiss = 0;
        }

        this.enemySTurns = this.enemySTurns - 1 > 0 ? this.enemySTurns - 1 : 0;
        console.log("Stun turns: " + this.enemySTurns);
        if (this.enemySTurns <= 0) {
          this.enemyStun = false;
        }

        if (!this.enemyStun) {
          var mr = Math.random();
          console.log(mr + " > " + this.enemyMiss);
          if (mr > this.enemyMiss) {
            if (!this.$refs.playerFight.isDefeated && !this.$refs.enemyFight.isDefeated) {
              var dmg = this.$refs.enemyFight.attack();
              if (this.playerImmune) {
                dmg = 0;
              } else if (this.playerUndying && this.$refs.playerFight.currentHP <= dmg) {
                dmg = this.$refs.playerFight.currentHP - 1;
              }

              this.$refs.playerFight.takeDamage(dmg);
            }
          } else {
            setTimeout(() => this.$refs.enemyFight.textEffect("MISSED", "#c1c1c1"), 300);
            console.log("Enemy missed");
          }
        } else {
          setTimeout(() => this.$refs.enemyFight.textEffect("STUNNED", "#c1c1c1"), 300);
          console.log("Enemy stunned");
        }
      },
      attack: function () {
        if (!this.$refs.enemyFight.isDefeated) {
          console.log("Atk improved by " + this.playerDamageMult);
          var atk = Math.round(this.$refs.playerFight.attack() * this.playerDamageMult);
          console.log("Damaging from Player: " + atk);
          this.$refs.enemyFight.takeDamage(atk, Math.round(this.$refs.playerFight.maxAttack() * this.playerDamageMult));
        }
      },
      reduceCD: function () {
        this.locked = true;
        console.log("Reducing...");
        setTimeout(() => this.$refs.attack1.reduceCooldown(), 1300);
        if(this.level >= 1) setTimeout(() => this.$refs.attack2.reduceCooldown(), 1300);
        if(this.level >= 3) setTimeout(() => this.$refs.attack3.reduceCooldown(), 1300);
        if(this.level >= 5) setTimeout(() => this.$refs.attack4.reduceCooldown(), 1300);
        setTimeout(() => this.locked = false, 2200);
      },
      clearLS: function () {
        window.localStorage.removeItem("enemyID");
      }
    },
    mounted() {
      this.attacks = JSON.parse(localStorage.attacks);
      console.log(this.attacks);

      if (localStorage.showBoss) this.showBoss = localStorage.showBoss;
    }
  }
</script>

<style lang="scss" scoped>
    .flexed {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .locked {
        .player-attack {
            background-color: #eee;
        }
    }

    .passive-attack {
        background-color: #eee;
    }
</style>