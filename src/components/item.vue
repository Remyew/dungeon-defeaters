<template>
    <div class="item" v-if="amount > 0">
        <div class="i-infos">
            <div class="i-name">
                <div class="i-type">
                    <img v-if="iSlot === 0" src="../assets/slot-0.png"/>
                    <img v-if="iSlot === 1" src="../assets/slot-1.png"/>
                    <img v-if="iSlot === 2" src="../assets/slot-2.png"/>
                    <img v-if="iSlot === 3" src="../assets/slot-3.png"/>
                </div>

                {{name}}
            </div>
            <div class="i-value">
                {{value}}
                <img src="../assets/price.png"/>
            </div>
            <div class="i-weight">
                {{weight}}
                <img src="../assets/weight.png"/>
            </div>
            <div class="i-amount">
                {{amount}}
                <img src="../assets/amount.png"/>
            </div>
            <div class="i-rarity"
                 :class="{'r-0': rarity == 0, 'r-1': rarity == 1, 'r-2': rarity == 2, 'r-3': rarity == 3, 'r-4': rarity == 4}"></div>
        </div>
        <div class="i-desc" v-html="colorText(description)">
        </div>
        <div class="i-actions">
            <div @click="$emit('remove')" class="btn-remove"> Throw away</div>
            <div class="btn-sell" @click="$emit('sell')"> Sell</div>
            <div v-if="iSlot === 0" class="btn-consume" @click="$emit('consume')"> Consume</div>
            <div v-if="iSlot !== 0" class="btn-equip" @click="$emit('equip')"> Equip</div>
            <div v-if="iSlot !== 0" class="btn-unequip" @click="$emit('unequip')"> Unequip</div>
            <div v-if="action1 !== '-1'" @click="$emit('action1')"> {{action1}}</div>
            <div v-if="action2 !== '-1'" @click="$emit('action2')"> {{action2}}</div>
            <div v-if="action3 !== '-1'" @click="$emit('action3')"> {{action3}}</div>
        </div>
    </div>
</template>

<script>
  export default {
    name: "Item",
    props: {
      name: String,
      value: Number,
      weight: Number,
      amount: Number,
      iSlot: Number,
      rarity: Number,
      description: String,
      action1: {
        default: '-1',
        type: String
      },
      action2: {
        default: '-1',
        type: String
      },
      action3: {
        default: '-1',
        type: String
      },
    },
    methods: {
      colorText: function (text) {
        var parts = text.split(/\$[\dabcdef]{6}:/);
        var colors = text.match(/(?<=\$)[\dabcdef]{6}(?=:)/g);

        if (colors != null) {
          text = "";
          for (var i = 0; i < colors.length; i++) {
            text += parts[i] + "<span style='color:#" + colors[i] + "'>";
          }
          text += parts[parts.length - 1];
        }

        text = text.split(/\$((?=[^\d])|$)/).join("</span>");
        return text;
      }
    }
  }
</script>

<style lang="scss">
    .item {
        border: 1px solid black;
        padding: 6px 0;
        margin: 10px 0;

        .i-infos {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;

            & > div {
                display: inline-block;
                margin: 3px 5px;

                &:first-child {
                    margin-right: auto;
                }
            }
        }

        .i-name {
            margin-left: 8px;
        }
        .i-value {
            padding-left: 22px;
            position: relative;

            img {
                position: absolute;
                top: 0;
                left: 0;
                width: 16px;
            }
        }
        .i-weight {
            padding-left: 22px;
            position: relative;

            img {
                position: absolute;
                top: 0;
                left: 0;
                width: 16px;
            }
        }
        .i-amount {
            padding-left: 22px;
            position: relative;

            img {
                position: absolute;
                top: 0;
                left: 0;
                width: 16px;
            }
        }
        .i-type {
            position: relative;
            display: inline-block;
            margin-right: 13px;
            height: 16px;

            img {
                width: 16px;
                position: absolute;
                top: 2px;
            }
        }
        .i-rarity {
            width: 16px;
            height: 16px;
            float: right;
            position: relative;

            &::after {
                content: '';
                display: block;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 1px solid black;
            }
        }
        .r-0 {
            &::after {
                background-color: #c4c4c4;
            }
        }
        .r-1 {
            &::after {
                background-color: #42ff55;
            }
        }
        .r-2 {
            &::after {
                background-color: #2f8fef;
            }
        }
        .r-3 {
            &::after {
                background-color: #ce22f4;
            }
        }
        .r-4 {
            &::after {
                background-color: #ffbd30;
            }
        }
        .i-desc {
            width: 100%;
            margin: 5px;
            margin-left: 0px;
            border: 1px solid black;
            border-left: none;
            border-right: none;
            padding: 5px 6px;
            box-sizing: border-box;
            line-height: 22px;
            padding-top: 4px;
        }
        .i-actions {
            width: 100%;
            margin: 0px;
            padding: 5px 6px;
            box-sizing: border-box;
            font-weight: 600;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-evenly;

            div {
                display: inline-block;
                padding: 0 4px;
                cursor: pointer;
            }

            .btn-sell {
                display: none;
            }
        }
    }
</style>