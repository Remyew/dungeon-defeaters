<template>
    <div class="shop">
        <h1> Shop </h1>

        <span> Coins: {{sCoins}} </span>

        <!-- Load player, inventory and loot once -->
        <player ref="playerShop" :hide="true"></player>
        <Loot :hidden="true" ref="lootShop"></Loot>

        <h3> Wares </h3>
        <item v-for="(item, index) in items" :name="item.name" :value="Math.round(item.value * 1.5)"
              :weight="item.weight"
              :amount="item.amount" :rarity="item.rarity" :iSlot="item.slot" :description="item.description"
              action1="Buy" @action1="buy(item.id, index, Math.round(item.value * 1.5))">
        </item>

        <inventory ref="inventoryShop" :noExit="true" @sell="updateCoins()"></inventory>

        <story-overlay v-if="noCoins" link="" buttons="" @continue="noCoins = false" title="Action not possible"> You don't have enough coins! </story-overlay>
        <story-overlay v-if="noSpace" link="" buttons="" @continue="noSpace = false" title="Action not possible"> You don't have enough space left in your inventory! </story-overlay>

        <stone-button link="/dungeon" text="Leave"></stone-button>
    </div>
</template>

<script>
  import Loot from "./Loot"
  import Inventory from "./Inventory"
  import Item from '../components/item';
  import Player from '../components/player';
  import StoneButton from '../components/stone-button';
  import StoryOverlay from "../components/story-overlay";

  export default {
    name: "Shop",
    components: {StoryOverlay, Loot, Inventory, Item, Player, StoneButton},
    data() {
      return {
        sCoins: -1,
        sTotalWeight: -1,
        sMaxWeight: -1,
        items: [],
        inventory: [],
        noCoins: false,
        noSpace: false,
      }
    },
    methods: {
      buy: function (item_id, index, price) {
        if (this.sCoins >= price) {
          if (this.$refs.inventoryShop.totalWeight + this.$refs.lootShop.items[index].weight <= this.$refs.inventoryShop.maxWeight) {
            this.sCoins -= price;
            localStorage.coins = this.sCoins;

            //Remove item from shop
            this.$refs.lootShop.reduceItem(index);

            //Add item to inventory
            var self = this;
            this.$refs.inventoryShop.addItem(item_id, 1, false, function () {
              self.sTotalWeight = self.$refs.inventoryShop.totalWeight;
              self.$refs.inventoryShop.save();
              self.$refs.inventoryShop.playerCoins = self.sCoins;
            });
          } else {
            console.log("Not enough space!");
            this.noSpace = true;
          }
        } else {
          console.log("Not enough coins!");
          this.noCoins = true;
        }
      },
      updateCoins: function () {
        this.sCoins = localStorage.coins;
      }
    },
    mounted() {
      this.items = this.$refs.lootShop.getItems();
      this.sCoins = this.$refs.inventoryShop.playerCoins;
      this.sMaxWeight = this.$refs.inventoryShop.maxWeight;
      console.log("Inv: " + this.inventory);
    }
  }
</script>

<style lang="scss">
    .shop {
        .item {
            .i-actions {
                .btn-equip,
                .btn-unequip,
                .btn-consume,
                .btn-remove {
                    display: none;
                }
            }
        }
        .inventory {
            .inv_items {
                .item {
                    .i-actions {
                        .btn-equip,
                        .btn-consume,
                        .btn-remove,
                        .btn-sell {
                            display: block;
                        }
                    }
                }
            }
            .equipment {
                .item {
                    .i-actions {
                        .btn-unequip,
                        .btn-remove,
                        .btn-sell {
                            display: block;
                        }
                    }
                }
            }
        }
    }
</style>