<template>
    <router-link v-if="link !== '-1'" :to="link" class="stone-button" @click.native="$emit('pre')">
        <button><!--:style="{ backgroundImage: 'url(' + require('../assets/button_stone.png') + ')' }"-->
            <span>{{text}}</span>
        </button>
    </router-link>

    <div v-else class="stone-button" @click="$emit('pre')">
        <button><!--:style="{ backgroundImage: 'url(' + require('../assets/button_stone.png') + ')' }"-->
            <span>{{text}}</span>
        </button>
    </div>
</template>

<script>
  export default {
    name: "StoneButton",
    props: {
      link: {
        default: '-1',
        type: String
      },
      text: String
    }
  }
</script>

<style lang="scss" scoped>
    .stone-button {
        width: 48%;
        position: relative;
        display: inline-block;
        text-decoration: none;
        cursor: pointer;
        padding: 7px;
        border: 1px solid black;
        box-sizing: border-box;
        margin: 5px 1%;

        button {
            width: 100%;
            height: 100%;
            background-color: transparent;
            background-repeat: no-repeat;
            background-position: center;
            border: none;
            background-size: contain;
            //color: white;
            color: black; //
            font-weight: 600; //
            outline: none;
            margin: 3px 0; //
            display: block;
            cursor: pointer;

            span {
                display: block;
                /**position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);*/
                width: 100%;
                //padding: 0 15px;
                box-sizing: border-box;
                font-family: 'VT323', Courier, serif;
                font-size: 21px;
            }

            &::after {
                content: '';
                display: block;
                //padding-top: 42.85714%;
            }
        }
    }
</style>