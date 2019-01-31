<template>
    <div class="inventory" v-if="!hidden">
        <h1 :class="{'notFixed': noExit}"> Inventory </h1>

        <player ref="playerInv" :hide="true"></player>
        <span> Coins: {{playerCoins}} </span>
        <span style="float: right;"> Weight: {{totalWeight}} / {{maxWeight}} </span>

        <div class="equipment">
            <item v-for="item in equipment"
                  :class="{'consumable': item.slot === 0, 'weapon': item.slot === 1, 'armor': item.slot === 2, 'wearable': item.slot === 3}"
                  :name="item.name" :value="item.value" :weight="item.weight"
                  :amount="item.amount" :rarity="item.rarity" :iSlot="item.slot" :description="item.description"
                  @remove="unequipItem(item.id, item.action); removeItem(item.id, 1); save()"
                  @unequip="unequipItem(item.id, item.action); save()"
                  @sell="playerCoins += item.value; unequipItem(item.id, item.action); removeItem(item.id, item.amount); save()">
            </item>
        </div>
        <br/><br/>
        <div class="inv_items">
            <item v-for="item in inv_items"
                  :class="{'consumable': item.slot === 0, 'weapon': item.slot === 1, 'armor': item.slot === 2, 'wearable': item.slot === 3}"
                  :name="item.name" :value="item.value" :weight="item.weight"
                  :amount="item.amount" :rarity="item.rarity" :iSlot="item.slot" :description="item.description"
                  @remove="removeItem(item.id, 1); save()"
                  @consume="consumeItem(item.id, item.action); save()"
                  @equip="equipItem(item.id, item.action)"
                  @sell="sellItem(item.value); removeItem(item.id, 1); save()">
            </item>
        </div>

        <div class="bottom" v-if="!noExit">
            <stone-button link="/dungeon" text="Exit" @pre="save()"></stone-button>
        </div>
    </div>
</template>

<script>
  import Item from '../components/item';
  import StoneButton from '../components/stone-button';
  import Player from '../components/player';

  export default {
    name: "Inventory",
    components: {Player, Item, StoneButton},
    props: {
      hidden: {
        type: Boolean,
        default: false,
      },
      noExit: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        equipment: [-1, -1, -1],
        inv_items: [],
        totalWeight: 0,
        maxWeight: 0,
        playerCoins: 0,
      }
    },
    methods: {
      addItem: function (item_id, amount = 1, isEquipped = false, callback = function () {
      }) {
        this.axios
          .get('http://' + localStorage.ip + ':8081/getItem.php?id=' + item_id)
          .then(response => {
            console.log("Loading item: " + item_id);
            console.log(response.data);
            var load = response.data;

            if (load.error === 0) {
              console.log("Error 0 => Adding");
              if (!isEquipped) {
                this.inv_items.push({
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
                this.equipment[load.slot - 1] = {
                  id: load.id,
                  name: load.name,
                  value: load.value,
                  weight: load.weight,
                  amount: amount,
                  rarity: load.rarity,
                  slot: load.slot,
                  description: load.description,
                  action: load.action
                };
                //Somehow, sometimes not all equipment inv_items are shown.
                //Forcing an update probably is ugly, but shows them.
                this.$forceUpdate();
              }
              this.totalWeight += load.weight * amount;
              callback();
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
      consumeItem(item_id, action) {
        this.$refs.playerInv.itemAction(action);
        this.removeItem(item_id, 1);
      },
      removeItem: function (item_id, amount) {
        var self = this;
        this.inv_items.forEach(function (item, index) {
          if (item.id === item_id) {
            self.inv_items[index].amount -= amount;
            self.totalWeight -= self.inv_items[index].weight * amount;

            if (self.inv_items[index].amount <= 0) {
              self.inv_items.filter(function (value) {
                return value !== index;
              });
            }
          }
        });
      },
      equipItem: function (item_id, actionToAdd) {
        console.log("Equipping " + item_id);
        var self = this;
        this.$refs.playerInv.itemAction(actionToAdd);

        this.inv_items.forEach(function (item, index) {
          if (item.id === item_id) {
            self.unequipItem(self.equipment[item.slot - 1].id, self.equipment[item.slot - 1].action);
            self.addItem(item_id, 1, true, function () {
              self.save()
            });

            self.removeItem(item_id, 1);
          }
        });
      },
      unequipItem: function (item_id, actionToRemove) {
        console.log("Unequipping " + item_id);
        if (item_id !== window.undefined) {
          var self = this;
          var added = false;
          this.$refs.playerInv.removeItemAction(actionToRemove);

          this.inv_items.forEach(function (item) {
            if (item.id === item_id) {
              item.amount++;
              self.equipment[item.slot - 1] = -1;
              added = true;
            }
          });

          if (!added) {
            this.equipment.forEach(function (item) {
              if (item.id === item_id) {
                self.inv_items.push(item);
                self.equipment[item.slot - 1] = -1;
              }
            });
          }
        } else {
          console.log("Nothing to unequip");
        }
      },
      sellItem: function (value) {
        this.playerCoins = parseInt(this.playerCoins) + parseInt(value);
        localStorage.coins = this.playerCoins;
        this.$emit('sell');
      },
      save: function () {
        var toSave = [];
        var self = this;
        this.inv_items.forEach(function (item, index_in_inv_items) {
          toSave.push({item_id: item.id, amount: self.inv_items[index_in_inv_items].amount});
        });
        localStorage.inventory = JSON.stringify(toSave);
        console.log("Saved Inv: " + localStorage.inventory);

        toSave = [];
        this.equipment.forEach(function (item, index_in_equipment) {
          toSave.push({item_id: item.id, amount: self.equipment[index_in_equipment].amount});
        });
        localStorage.equipment = JSON.stringify(toSave);
        console.log("Saved Equip: " + localStorage.equipment);
      },
      load: function () {
        var self = this;

        var toLoad = JSON.parse(localStorage.inventory);
        toLoad.forEach(function (item) {
          console.log(item);
          self.addItem(item.item_id, item.amount, false)
        });

        toLoad = JSON.parse(localStorage.equipment);
        toLoad.forEach(function (item) {
          self.addItem(item.item_id, item.amount, true);
        });
      }
    },
    mounted() {
      this.load();
      this.maxWeight = 15 + 5 * this.$refs.playerInv.level;
      this.playerCoins = localStorage.coins;
    }
  }
</script>

<style lang="scss">
    .inventory {
        .notFixed {
            position: relative;
            left: 0;
            right: 0;
        }
        .equipment {
            .item {
                .i-actions {
                    .btn-equip {
                        display: none;
                    }
                }
            }
        }
        .inv_items {
            .item {
                .i-actions {
                    .btn-unequip {
                        display: none;
                    }
                }
            }
        }
    }
</style>