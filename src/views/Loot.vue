<template>
    <div v-if="!hidden" class="loot">
        <h1 v-if="!itemsOnly" style="z-index: 100;"> Loot </h1>

        <player ref="playerLoot" :hide="true"></player>

        <item v-for="(item, index) in items" :name="item.name" :value="item.value" :weight="item.weight"
              :amount="item.amount" :rarity="item.rarity" :iSlot="item.slot" :description="item.description"
              action1="Take all"
              action2="Take one"
              @remove="items[index].amount = -1" @consume="consume(index, item.action)"
              @action1="take(index, item.amount)"
              @action2="take(index, 1)">
        </item>

        <inventory ref="inventoryLoot" :noExit="true"></inventory>
        <story-overlay v-if="noSpace" link="" buttons="" @continue="noSpace = false" title="Action not possible"> You don't have enough space left in your inventory! </story-overlay>

        <stone-button v-if="!itemsOnly" link="/dungeon" text="Leave"></stone-button>
    </div>
</template>

<script>
  import StoneButton from '../components/stone-button';
  import Item from '../components/item';
  import Player from '../components/player';
  import Inventory from "./Inventory";
  import StoryOverlay from "../components/story-overlay";

  export default {
    name: "Loot",
    components: {StoryOverlay, Inventory, Player, StoneButton, Item},
    props: {
      itemsOnly: {
        type: Boolean,
        default: false,
      },
      hidden: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        items: [],
        totalWeight: 0,
        noSpace: false,
      }
    },
    methods: {
      loadItem: function (id, amount) {
        this.axios
          .get('http://' + localStorage.ip + ':8081/getItem.php?id=' + id)
          .then(response => {
            console.log(response.data);
            var load = response.data;
            if (load.error == "0") {
              this.items.push({
                id: load.id,
                name: load.name,
                value: load.value,
                weight: load.weight,
                amount: amount,
                rarity: load.rarity,
                slot: load.slot,
                description: load.description,
                action: load.action
              });
            } else {
              switch (load.error) {
                case "1":
                  console.log("No item found!");
                  break;
                case "2":
                  console.log("No id set!");
                  break;
              }
            }
          })
          .catch(error => {
            console.log(error)
          });
      },
      loadItems: function (type, amin, amax, m0, m1, m2, m3, m4) {
        var slotProbs = [0.4, 0.2, 0.2, 0.2];
        var rarityProbs = [0.5, 0.389, 0.1, 0.01, 0.001];

        var ms = [m0, m1, m2, m3, m4];
        for (var i = 0; i < rarityProbs.length; i++) {
          console.log("M" + i + ": " + ms[i]);
          rarityProbs[i] *= ms[i];
        }

        //Multiply the item probabilitys, based on the loot type
        if (parseInt(type) === 0) { //Loot from fight
          slotProbs[1] *= 1.5;
          slotProbs[2] *= 1.5;
        }
        if (parseInt(type) === 1) {//Loot from chest
          slotProbs[0] *= 1.3;
          slotProbs[3] *= 1.3;
        }
        var slotProbsTotal = 0;
        slotProbs.forEach(function (prob) {
          slotProbsTotal += prob;
        });
        slotProbsTotal = Math.round(slotProbsTotal * 1000) / 1000;
        var rarityProbsTotal = 0;
        rarityProbs.forEach(function (prob) {
          rarityProbsTotal += prob;
        });
        rarityProbsTotal = Math.round(rarityProbsTotal * 1000) / 1000;

        console.log("Slot probs: " + slotProbs + " => Total: " + slotProbsTotal);
        console.log("Rarity probs: " + rarityProbs + " => Total: " + rarityProbsTotal);
        var amount = Math.floor(Math.random() * (amax - amin)) + amin;
        console.log("Amount: " + amount);

        for (var i = 0; i < amount; i++) {
          var randSlot = Math.random() * slotProbsTotal;
          var randRarity = Math.random() * rarityProbsTotal;
          console.log(randSlot);
          console.log(randRarity);

          var currentFrom = 0;
          var slotIndex = -1;
          slotProbs.forEach(function (prob, index) {
            prob = Math.round(prob * 1000) / 1000;
            if (randSlot <= currentFrom + prob && slotIndex === -1) {
              slotIndex = index;
            }
            currentFrom += prob;
          });

          currentFrom = 0;
          var rarityIndex = -1;
          rarityProbs.forEach(function (prob, index) {
            prob = Math.round(prob * 1000) / 1000;
            if (randRarity <= currentFrom + prob && rarityIndex === -1) {
              rarityIndex = index;
            }
            currentFrom += prob;
          });
          console.log("slotIndex: " + slotIndex);
          console.log("rarityIndex: " + rarityIndex);

          this.axios
            .get('http://' + localStorage.ip + ':8081/getItemsForLoot.php', {
              params: {
                'slot': slotIndex,
                'rarity': rarityIndex
              }
            })
            .then(response => {
              console.log(response.data);
              var load = response.data;

              if (load.error === 0) {
                var rows = 0;
                for (; load.items[rows] !== window.undefined; rows++) ;
                var chosenItem = Math.floor(Math.random() * rows);
                var updated = false;

                var self = this;
                this.items.forEach(function (item, index) {
                  if (item.id === load.items[chosenItem].id) {
                    self.items[index].amount++;
                    updated = true;
                  }
                });

                if (!updated) {
                  this.items.push({
                    id: load.items[chosenItem].id,
                    name: load.items[chosenItem].name,
                    value: load.items[chosenItem].value,
                    weight: load.items[chosenItem].weight,
                    amount: 1,//amount
                    rarity: load.items[chosenItem].rarity,
                    slot: load.items[chosenItem].slot,
                    description: load.items[chosenItem].description,
                    action: load.items[chosenItem].action
                  });
                }
              }
            })
            .catch(error => {
              console.log(error)
            });
        }
      },
      take: function (index, amount) {
        if (this.$refs.inventoryLoot.totalWeight + (this.items[index].weight * amount) <= this.$refs.inventoryLoot.maxWeight) {
          this.items[index].amount -= amount;
          var self = this;

          var added = false;
          this.$refs.inventoryLoot.inv_items.forEach(function (item) {
            if (item.id === self.items[index].id) {
              item.amount += amount;
              self.$refs.inventoryLoot.totalWeight = parseInt(self.$refs.inventoryLoot.totalWeight) + parseInt(self.items[index].weight) * amount;
              added = true;
              self.$refs.inventoryLoot.save();
            }
          });

          if (!added) {
            this.$refs.inventoryLoot.addItem(this.items[index].id, amount, false, function cb() {
              self.$refs.inventoryLoot.save();
            });
          }
        } else {
          this.noSpace = true;
        }
      },
      reduceItem: function (index) {
        this.items[index].amount--;
        if (this.items[index].amount === 0) this.removeItem(index);
      },
      consume: function (index, action) {
        this.$refs.playerLoot.itemAction(action);
        this.reduceItem(index);
      },
      removeItem: function (index) {
        this.items[index].amount = -1;
      },
      getItems: function () {
        return this.items;
      }
    }
    ,
    mounted() {
      var lootData = JSON.parse(window.localStorage.getItem("lootData"));
      console.log("Lootdata: " + lootData);
      console.log(lootData);
      lootData = lootData.type === window.undefined ? JSON.parse(lootData) : lootData;
      console.log(lootData);
      this.loadItems(lootData.type, lootData.amin, lootData.amax, lootData.m0, lootData.m1, lootData.m2, lootData.m3, lootData.m4);
      //window.localStorage.removeItem("lootData");
    }
  }
</script>

<style lang="scss">
    .loot {
        padding-top: 75px;
        padding-bottom: 50px;

        h1 {
            position: fixed;
            top: 0;
            left: 8px;
            right: 8px;
            text-align: center;
            background-color: white;
            margin: 0;
            padding: 23px 0;
            z-index: 10;
        }

        .story-overlay {
            h1 {
                position: relative;
            }
        }

        .item {
            .i-actions .btn-unequip,
            .i-actions .btn-equip,
            .i-actions .btn-remove {
                display: none;
            }
        }

        .player {
            border: none;
            position: fixed;
            top: 50px;
            left: 8px;
            right: 8px;
            z-index: 11;
        }

        .inventory {
            .inv_items {
                .item {
                    .i-actions {
                        .btn-consume,
                        .btn-equip,
                        .btn-remove {
                            display: block;
                        }
                    }
                }
            }
            .equipment {
                .item {
                    .i-actions {
                        .btn-unequip,
                        .btn-remove {
                            display: block;
                        }
                    }
                }
            }
        }
    }
</style>