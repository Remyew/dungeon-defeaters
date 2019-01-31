<template>
    <div class="event">
        <h1> Event </h1>

        <div v-if="loading" class="loading">
            <h1> Loading... </h1>
            <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>

        <player ref="playerEvent" :hide="true"></player>

        <div class="text">{{text}}</div>

        <stone-button v-for="button in buttons" :text="button.text" :link="button.link"
                      @pre="parseAction(button.action); checkLink(button.link)"></stone-button>
    </div>
</template>

<script>
  import StoneButton from "../components/stone-button"
  import Player from '../components/player';

  export default {
    name: "Fight",
    components: {StoneButton, Player},
    props: {},
    data() {
      return {
        buttons: [],
        text: '',
        quitting: false,
        loading: false,
      }
    },
    methods: {
      parseAction: function (text) {
        console.log("Actions: " + text);

        var actions = text.split(";");
        var self = this;

        actions.forEach(function (action) {
          var aParts = action.split("::");
          var key = aParts[0];
          console.log(action);
          switch (aParts[0]) {
            case "ls":
              var key = aParts[1].split("=")[0];
              var val = aParts[1].split("=")[1];
              window.localStorage.setItem(key, val);
              break;
            case "fight":
              self.$router.push("/dungeon/fight");
              break;
            case "heal":
              var val = aParts[1];
              console.log("Heal val: " + val);
              self.$refs.playerEvent.heal(parseInt(val));
              break;
            case "damage":
              var val = aParts[1];
              console.log("DMG val: " + val);
              self.$refs.playerEvent.takeDamage(parseInt(val));
              break;
            case "quit":
              self.$router.push("/dungeon");
              self.quitting = true;
              break;
            case "prob":
              //prob{0.005:ls->nextEvent=81,0.01:ls->nextEvent=82,0.985:ls->nextEvent=83}
              console.log("Probs: " + aParts[1]);
              aParts[1] = aParts[1].split("{")[1];
              //0.005:ls->nextEvent=81,0.1:ls->nextEvent=82,0.985:ls->nextEvent=83}
              aParts[1] = aParts[1].substring(0, aParts[1].length - 1);
              //0.005:ls->nextEvent=81,0.1:ls->nextEvent=82,0.985:ls->nextEvent=83

              var parts = aParts[1].split(",");
              //0.005:ls->nextEvent=81  0.1:ls->nextEvent=82  0.985:ls->nextEvent=83
              var actionProbs = [];
              var total = 0;
              parts.forEach(function (part) {
                var prob = Math.round(total + parseFloat(part.split(":")[0]) * 1000) / 1000;
                console.log("total: " + total + " prob:" + prob);
                total += prob;
                console.log("total   : " + total + " prob:" + prob);
                //0.005, 0.015, 1
                var action = part.split(":")[1].split("->").join("::");
                //ls::nextEvent=81
                actionProbs.push({prob: total, action: action});
              });

              actionProbs.forEach(function (prob) {
                console.log("P: " + prob.prob + ", " + prob.action);
              });

              var rand = Math.random();
              console.log("Random " + rand);

              var called = false;
              actionProbs.forEach(function (prob, index) {
                if (rand <= prob.prob && !called) {
                  self.parseAction(prob.action);
                  console.log("Calling prob(" + index + "):" + prob.action);
                  called = true;
                }
              });
              break;
          }
        });
      },
      checkLink: function (link) {
        console.log("Link: " + link);
        if (!this.quitting && (link === '' || link === window.undefined)) {
          //this.$router.go();
          this.$router.push("/dungeon/event2");
          //this.$forceUpdate();
        }
      }
    },
    mounted() {
      if (localStorage.nextEvent) {
        this.axios.get('http://' + localStorage.ip + ':8081/getEvent.php', {params: {id: localStorage.nextEvent}})
          .then(response => {
            console.log(response.data);
            var load = response.data;

            this.text = load.preText;
            this.buttons = JSON.parse(load.buttonActions.split("$'").join("$##$").split("'").join('"').split("$##$").join("'"));
            console.log(this.buttons);
            console.log(load.id);
            console.log(load.localStorage);

            var command = load.localStorage;
            if (command !== "") {
              console.log("Command: " + command);
              var parts = command.split(";");

              for (var i = 0; i < parts.length; i++) {
                var key = parts[i].split("=")[0];
                var value = parts[i].split("=")[1];
                console.log("Writing in ls: " + key + " = " + value);
                value = value.split("'").join('"');
                window.localStorage.setItem(key, value);
              }
            }
          })
          .catch(error => {
            console.log(error)
          });
        window.localStorage.removeItem("nextEvent");
      } else {
        this.text = localStorage.eventText;

        console.log("Parsing button from JSON");
        console.log(localStorage.eventButtons.split("$'").join("$##$").split("'").join('"').split("$##$").join("'"));
        if (localStorage.eventButtons !== window.undefined && localStorage.eventButtons !== "") {
          this.buttons = JSON.parse(localStorage.eventButtons.split("$'").join("$##$").split("'").join('"').split("$##$").join("'"));
          console.log(this.buttons);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
    .event {
        .player {
            height: 0;
            padding: 0;
            margin: 0;
        }

        .text {
            margin: 10px 0;
        }

        .loading {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background-color: white;
            z-index: 1000;

            h1 {
                position: absolute;
                top: 38%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
</style>
