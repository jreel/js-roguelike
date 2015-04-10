/**
 * Created by jreel on 4/7/2015.
 */

var Test = {
    display      : null,
    currentScreen: null,
    screenWidth  : 50,       // this should be an EVEN number
    screenHeight : 30,      // this should also be an EVEN number

    init: function() {
        // Any necessary initialization will go here.
        this.display = new ROT.Display({
            width : this.screenWidth,
            height: this.screenHeight,
            fontSize: 18,
            //fontFamily: "Segoe UI Symbol",
            forceSquareRatio: true
        }
        );

        // Create a helper function for binding to an event
        // and making it send that event to the screen
        var game = this; // So that we don't lose this
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the screen
                // (if there is one)
                if (game.currentScreen !== null) {
                    // Send the event type and data to the screen
                    game.currentScreen.handleInput(event, e);
                }
            }
            );
        };
        // Bind keyboard input events
        bindEventToScreen('keydown');
        //  bindEventToScreen('keyup');
        // bindEventToScreen('keypress');
    },

    refresh: function() {
        // Clear the screen
        this.display.clear();
        // Render the screen
        this.currentScreen.render(this.display);
    },

    switchScreen: function(screen) {
        // If we had a screen before, notify it that we exited
        if (this.currentScreen !== null) {
            this.currentScreen.exit();
        }
        // Clear the display
        this.display.clear();
        // Update the current screen, notify it we entered
        // and then render it
        this.currentScreen = screen;
        if (!this.currentScreen !== null) {
            this.currentScreen.enter();
            this.refresh();
        }
    }
};


Test.charsets = {
    weapons: "/ | ᎒ ¦ ⑊ ♆ ￤ ⌈ ⌉ ⊩ ⌠ ψ ܢ ރ ˨ ⍑ ᛏ ᛙ ᛚ ᛠ ᛡ ᛣ ᛦ ᛩ ⚒ ⚔ ⚵ ⚴ ⚳ ↑ ϯ " +
             "ꕚ ߉ ⫯ ፐ ዋ ↖ ↗ ↘ ↙ ↞ ↢ ↼ ↾ ↿ ♐ ➛ ➚ ↠ ↣ ➳ ➴ ➵ ➶ ➷ ➸ ➹ ☽ " +
             "☾ ) ( } { ℂ ϡ ⦃ ⦄ ⦇ ⦈ ♤ ➢ ➣",

    shields: "O 0 ۞ ⌾ ⍟ Ⓞ Ⓘ Ⓧ ⓛ ⓞ ⊕ ⊖ ⓧ ◉ ◍ ◎ ◯ ☉ " +
             "☸ ✇ ✪ ㉧ ㉬ ㊥ ⊗ ⊘ ⊙ ⊚ ⊛ ⊜ ⦿ Ɵ ϴ Ө " +
             "⌺ ⌸ ⌹ ⌻ ⌼ ⍁ ⍂ ⍠ ▤ ▥ ⊞ ◇ ◈ ᛥ ᗜ ᗢ ⩌ ᗨ",

    map: "^ ۩ ⇑ ⇧ ⇪ ⌂ ☖ ☗ ☠ ♊ ♎ ♖ ♙ ♜ ♟ ∏ Π ༜ ༶ ᎒ ⌃ ⌒ ⌓ ⌤ ⌯ △ ▴ ▵ ◠ ◡ ▲ " +
         "؞ ܀ ჻ ። ፨ ⁂ ‸ 〽 ∆ ∧ ∩ ⋀ ⋂ Δ ^ " +
         "↟ ⇞ ⇡ ⍋ ⍑ ⍡ ⏃ ▲ ☨ ♠ ♣ ♤ ♧ ↑ ↡ ᎙ ⇟ ⇣ ⌄ ⌎ ⌏ ⺌ ⺍ ༈ ༎ ‴ 〃 „ 〟 ↓ ⊻ ⋎ ٧ ⚶ " +
         "░ ▒ ▓ ☰ ☷ ☵ ☲ ⿲ ⿳ ∷ ∵ ∴ ≡ ≣ Ξ ☁ ★ ☆ ♣ ♧ ✽ ✾ ✿ ❀ ✬ ✮ ❁ ❃ ❋ ❦ ❧ " +
         "༺ ༻ ܣ ܤ ݍ ♒ ♨ ❄ ❅ ෴ ༄ ༅ ༆ ྅ ~ ∻ ∼ ≈ ≋ ～ ঠ",

    other: "! * ° ● ◦ • ¤ ۵ ० ੦ ૦ ୦ ௦ ౦ ೦ ๐ ໐ O ○ Ꮻ ℧ ⌇ ⌔ ⌕ ⊸ Ò Ó Ō Ū Ʊ Ѽ ð ò ó ō ȯ " +
           "⌗ ⌘ ☥ ☩ ⋕ Ҩ δ ό ѽ ṓ ʊ ᛍ ⚗ ⚖ ⚘ ⚚ " +
           "⍎ ⏅ Ѧ ⨅ ⋂ ∩ Π ∏ ⍬ ☸ ♕ ♔ ♚ ♛ ⌓ ⩍ ᗩ ⍞ ♊ ♉ ᕱ ⏚ ♡ ♢ ♥ ♦ " +
           "❒ ⚷ ᗼ ᘐ ፅ ☄ ♁ ❢ ❣ ❤ ¿ ∞ ⍾ ♘ ♞ Ԓ Д ♪ £ ♦ ♡ ♥ Σ ○ ↑",

    apple: "an apple:\n\r" +
           "%c{red}Ò Ó Ѽ ò ó ȯ ό ѽ\n\r" +
           "%c{yellow}Ò Ó Ѽ ò ó ȯ ό ѽ\n\r" +
           "%c{lime}Ò Ó Ѽ ò ó ȯ ό ѽ",

    mushroom: "a mushroom:\n\r" +
              "⍾ Ω Ϙ\n\r" +
              "%c{palevioletred}⍾ Ω Ϙ\n\r" +
              "%c{darkolivegreen}⍾ Ω Ϙ",

    cheese: "a wedge of cheese:\n\r" +
            "%c{yellow}⪨ ⪦ ⪩\n\r" +
            "%c{gold}⪨ ⪦ ⪩\n\r" +
            "%c{orange}⪨ ⪦ ⪩",

    cake: "a slice of cake:\n\r" +
          "⪨ ⪦ ⪩ ⪀ ⫺ ⪄ \n\r" +
          "%c{lightpink}⪨ ⪦ ⪩ ⪀ ⫺ ⪄ \n\r" +
          "%c{peachpuff}⪨ ⪦ ⪩ ⪀ ⫺ ⪄ \n\r",

    bag: "a bag or sack:\n\r" +
         "⏚ Ʊ ʊ ᴕ Ȣ Ʊ ℧ \n\r" +
         "%c{sienna}⏚ Ʊ ʊ ᴕ Ȣ Ʊ ℧ \n\r" +
         "%c{tan}⏚ Ʊ ʊ ᴕ Ȣ Ʊ ℧ \n\r",

    bread: "a loaf of bread:\n\r" +
           "⌓ ↀ\n\r" +
           "%c{wheat}⌓ ↀ",

    fig: "a fig or other fruit:\n\r" +
         "%c{purple}۵ გ ბ ტ\n\r" +
         "%c{brown}۵ გ ბ ტ",

    meats: "various meats:\n\r" +
           "%c{indianred}bacon: ≈ \n\r" +
           "%c{darkred}t-bone: Ⓣ \n\r" +
           "%c{peru}chicken: ዖ",

    crackers: "some (probably stale) crackers:\n\r" +
              "▱ ▭ ⃟ ◇ □ ⬜ ☐ ◻ ⊞ ⚀ ⊡ ◫ \n\r" +
              "%c{wheat}▱ ▭ ⃟ ◇ □ ⬜ ☐ ◻ ⊞ ⚀ ⊡ ◫",

    helmet: "a helmet, to wear on your head:\n\r" +
            "ᗩ ᕱ ⩍ ᙉ\n\r" +
            "%c{silver}ᗩ ᕱ ⩍ ᙉ\n\r" +
            "%c{gray}ᗩ ᕱ ⩍ ᙉ\n\r" +
            "%c{sienna}ᗩ ᕱ ⩍ ᙉ",

    torso: "different armors for your torso:\n\r" +
           "⍞ ♊ Д ᗜ ᗢ ⩌ ᗨ ꖏ ╦\n\r" +
           "%c{slategray}⍞ ♊ Д ᗜ ᗢ ⩌ ᗨ ꖏ ╦\n\r" +
           "%c{sienna}⍞ ♊ Д ᗜ ᗢ ⩌ ᗨ ꖏ ╦",

    gloves: "gloves:\n\r" +
            "✋ ☜ ☚ ☝\n\r" +
            "%c{saddlebrown}✋ ☜ ☚ ☝",

    legs: "pants, leggings, greaves:\n\r" +
          "Ԓ ⨅ ∏ ⎍ Л ℿ\n\r" +
          "%c{darkgoldenrod}Ԓ ⨅ ∏ ⎍ Л ℿ\n\r" +
          "%c{lightsteelblue}Ԓ ⨅ ∏ ⎍ Л ℿ",

    boots: "boots for your feet:\n\r" +
           "╝ ⥥ ⫫ ╚\n\r" +
           "%c{saddlebrown}╝ ⥥ ⫫ ╚",

    shield: "shields of different sizes & shapes:\n\r" +
            "small shield: ⌾ ⍟ ⊕ ⊖ ◉ ◍ ◎ ☉ ✇ ✪" +
            "⊚ ⊛ ⊜ ⦿ ⊞ ◇ ◈\n\r" +
            "large shield: Ⓞ Ⓘ Ⓧ ⓛ ⓞ ㉧ ㉬ ⌺ ⌸ ⌹ ⌻ ⌼ ⍁ ⍂ ⍠ ▤ ▥" +
            "unique shields: ۞ ◇ ◈ ᛥ ᗜ ᗢ ⩌",

    treasure: "coins, gems, money:\n\r" +
              "coins: • ● ⚫ ¢ $ \n\r" +
              "%c{gold}• ● ⚫ ¢ $\n\r" +
              "%c{}gems: ♦ ♢ ◊ ⧫ ⋄ ⟡ \n\r" +
              "%c{crimson}♦ ♢ ◊ ⧫ ⋄ ⟡\n\r" +
              "%c{gold}♦ ♢ ◊ ⧫ ⋄ ⟡ \n\r" +
              "%c{limegreen} ♦ ♢ ◊ ⧫ ⋄ ⟡",

    potions: "potions and jars:\n\r" +
             "Ō Ū ð δ ō ṓ ᛍ ⚗ ¿ ¡\n\r" +
             "%c{gray}Ō Ū ð δ ō ṓ ᛍ ⚗ ¿ ¡\n\r" +
             "%c{orange}Ō %c{magenta}Ū %c{lime}ð %c{purple}δ %c{red}ō %c{green}ṓ %c{blue}ᛍ %c{cyan}⚗ %c{yellow}¿ %c{teal}¡",

    boxes: "boxes or chests:\n\r" +
           "⍞ ⏛ ❒ ⌸ ⍌ ⎕ □ ◻ ☐ ⬜ ▤\n\r" +
           "%c{sienna}⍞ ⏛ ❒ ⌸ ⍌ ⎕ □ ◻ ☐ ⬜ ▤\n\r" +
           "%c{peru}⍞ ⏛ ❒ ⌸ ⍌ ⎕ □ ◻ ☐ ⬜ ▤",

    ring: "rings:\n\r" +
          "◦ ᴼ ○ ₒ ° ੦ ૦ ௦ ౦ ೦ ๐ ໐ O = Ǒ ǒ\n\r" +
          "%c{gold}◦ ᴼ ○ ₒ ° ੦ ૦ ௦ ౦ ೦ ๐ ໐ O = Ǒ ǒ",

    amulet: "amulets:\n\r" +
            "♉ Ɣ ɣ ४ ȣ ⴴ ૪ ♀ ਠ\n\r" +
            "%c{gold}♉ Ɣ ɣ ४ ȣ ⴴ ૪ ♀ ਠ",

    misc: "other miscellaneous items:\n\r" +
          "keys: %c{gold}⊸ ⚷ ⟜ \n\r" +
          "%c{}books & scrolls: %c{tan}ᗼ ᘐ ჷ\n\r" +
          "%c{}rope: %c{peru}Ҩ",

    staff: "magical staves and ordinary walking sticks:\n\r" +
           "/ | ᎒ ¦ ⑊ ￤ ⌠ ܢ ᛙ ߉ ⫯\n\r" +
           "%c{saddlebrown}/ | ᎒ ¦ ⑊ ￤ ⌠ ܢ ᛙ ߉ ⫯",

    axe: "single- and double-headed axes:\n\r" +
         "⌈ ⌉ Ṫ ȹ ᛏ ᛚ ᛠ ᛩ ↑ ϯ ፐ ዋ\n\r" +
         "%c{gray}⌈ ⌉ Ṫ ȹ ᛏ ᛚ ᛠ ᛩ ↑ ϯ ፐ ዋ",

    spear: "spears:\n\r" +
           "ᛏ ᛚ ↑ ↖ ↗ ↾ ↿ ➚ ♠ ♤\n\r" +
           "%c{saddlebrown}ᛏ ᛚ ↑ ↖ ↗ ↾ ↿ ➚ ♠ ♤\n\r" +
           "%c{gray}ᛏ ᛚ ↑ ↖ ↗ ↾ ↿ ➚ ♠ ♤",

    polearm: "halberds, pitchforks, and other polearms:\n\r" +
             "⍦ ♆ Ψ Ṫ ψ ˨ ᛠ ↑ ꖡ ꕚ ↾ ↿ ꕽ Ⴤ\n\r" +
             "%c{gray}⍦ ♆ Ψ Ṫ ψ ˨ ᛠ ↑ ꖡ ꕚ ↾ ↿ ꕽ Ⴤ",

    sword: "swords:\n\r" +
           "ރ ʡ ʢ ˨ ⚔ ) ( ⦇ ⦈ ♤ ➢ ➣ † / ⥜ ↓ ⤊ ⇭ ↘ ⟧ ⦊ ∤\n\r" +
           "%c{gray}ރ ʡ ʢ ˨ ⚔ ) ( ⦇ ⦈ ♤ ➢ ➣ † / ⥜ ↓ ⤊ ⇭ ↘ ⟧ ⦊ ∤",

    sickle: "sickles:\n\r" +
            "ʡ ʢ ⚳ ? ☽ ☾ ℂ ϡ\n\r" +
            "%c{gray}ʡ ʢ ⚳ ? ☽ ☾ ℂ ϡ",

    hammer: "the mighty dwarven hammer:\n\r" +
            "⊪ ⊩ ȹ ⍑ ᛏ ⚒ ፐ ዋ\n\r" +
            "%c{gray}⊪ ⊩ ȹ ⍑ ᛏ ⚒ ፐ ዋ\n\r" +
            "%c{gold}⊪ ⊩ ȹ ⍑ ᛏ ⚒ ፐ ዋ",

    mace: "spiked and flanged maces:\n\r" +
          "ᛄ ȹ ᛙ ᛡ ⚵ ⚴ ߉ ⫯ ዋ ↟ ☨ ♣ ♧\n\r" +
          "%c{lightslategray}ᛄ ȹ ᛙ ᛡ ⚵ ⚴ ߉ ⫯ ዋ ↟ ☨ ♣ ♧",

    club: "clubs -- like a mace, but wooden:\n\r" +
          "! ⑊ ܢ ᛙ ߉ ⫯ ♣ ♧ ❢ ❗\n\r" +
          "%c{sienna}! ⑊ ܢ ᛙ ߉ ⫯ ♣ ♧ ❢ ❗",

    bow: "let those arrows and bolts fly!\n\r" +
         "bows: ) ( } { ℂ ϡ ⦃ ⦄ ⦇ ⦈\n\r" +
         "%c{sienna}) ( } { ℂ ϡ ⦃ ⦄ ⦇ ⦈\n\r" +
         "%c{}crossbows: ᚖ ⟴ ⬲ ⍅ ⍆ ⦽ ⍒\n\r" +
         "%c{sienna}ᚖ ⟴ ⬲ ⍅ ⍆ ⦽ ⍒",

    arrow: "arrows, darts, and other projectiles:\n\r" +
           "arrows: ↖ ↗ ↘ ↙ ↢ ➛ ➚ ← → ↣ ➳ ➴ ➵ ➶ ➷ ➸ ➹ ⤧\n\r" +
           "darts: ↖ ↗ ↘ ↙ ↞ ➛ ➚ ← → ↠\n\r" +
           "bolts: ↖ ↗ ↘ ↙ ➛ ➚ ← → ⤧",

    punch: "punch attack! ✊"


};


window.onload = function() {
    // Check if rot.js is supported on this browser
    if (ROT.isSupported()) {
        // Initialize the game
        Test.init();

        // Add the container to the HTML page
        document.body.appendChild(Test.display.getContainer());

        // Load the start screen
        Test.switchScreen(Test.Screen.startScreen);
    } else {
        alert("The rot.js library isn't supported by your browser.");
    }
};

Test.Screen = {};

Test.Screen.startScreen = {

    charsets:   Object.keys(Test.charsets),
    charsetIndex: 0,

    enter      : function() {
        // console.log("Entered start screen.");
        this.charsetIndex = 0;
        this.charsets = Object.keys(Test.charsets);
    },
    exit       : function() {
        // console.log("Exited start screen.");
    },
    render     : function(display) {

        var currentCharset = this.charsets[this.charsetIndex];

        display.drawText(1, 1, Test.charsets[currentCharset]);

        this.charsetIndex++;

        if (this.charsetIndex == this.charsets.length) {
            this.charsetIndex = 0;
        }

        /*
        if (this.charsetIndex === 1) {
            display.drawText(1, 1, Test.charsets.weapons);
        } else if (this.charsetIndex === 2) {
            display.drawText(1, 1, Test.charsets.shields);
        } else if (this.charsetIndex === 3) {
            display.drawText(1, 1, Test.charsets.map);
        } else if (this.charsetIndex === 4) {
            display.drawText(1, 1, Test.charsets.misc);
            this.charsetIndex = 0;
        }
        this.charsetIndex++;
        */
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, cycle the charset
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Test.refresh();
            }
        }
    }
};

/* Original selection
 Test.charsets = {
 weapons: "/ | ҂ ᎘ ᎗ ℈ ᎒ ¦ ⍦ ⑊ ♆ ￤ ⌈ ⌉ ¬ ⊪ ⊩ ⌠ Ƭ Γ Τ T Ψ Ϯ Г Ṫ ſ ȹ ψ ܢ ރ ʡ ʢ ʄ ˨ ⍑ ᛏ ᛄ ᛙ ᛚ ᛠ ᛡ ᛣ ᛦ ᛩ ⥾ ⚒ ⚔ ⚵ ⚴ ⚳ ↑ ϯ Ƭ Ϯ " +
 "φ ⑂ ꖡ ꕚ ߉ ⫯ ⰹ ɼ ፐ ዋ ↖ ↗ ↘ ↙ ↞ ↢ ↤ ↼ ↽ ↾ ↿ ⇀ ⇁ ♐ ➛ ➚ ← → ↚ ↛ ↠ ↣ ↦ ⍅ ⍆ ♐ ➳ ➴ ➵ ➶ ➷ ➸ ➹ ☽ ☾ ) ( } { " +
 "〘 〔 〉 》 〕 〙 € ℂ ϡ ⦃ ⦄ ⦇ ⦈ ᗭ ≪ ≫ ≬ ♤ ➢ ➣ ➤ ▻ ⋖ ⋗ ⋘ ⋙ ‶",

 shields:    "O 0 ۞ ⌀ ⌾ ⌽ ⍉ ⍟ ⍬ ⏀ Ⓞ Ⓘ Ⓧ ⓛ ⓞ ∅ ⊕ ⊖ ⓧ ◉ ○ ◍ ◎ ◯ ☉ ☸ ♁ ✇ ✪ ㉧ ㉬ ㊥ ⊗ ⊘ ⊙ ⊚ ⊛ ⊜ ⦿ Ɵ Θ ϴ Ө " +
 "⌺ ⌸ ⌹ ⌻ ⌼ ⍁ ⍂ ⍠ ▢ ▣ ▤ ▥ ◫ ☐ ⊞ ⊟ ⊠ ◆ ◇ ◈ ◊ ⋄ ᛥ ⇕ ᗜ ᗢ ⩌ ᗨ",

 map:    "^ ۩ ࿄ ⇑ ⇧ ⇪ ⌂ ☖ ☗ ☠ ♊ ♎ ♖ ♗ ♙ ♜ ♝ ♟ ∏ Π ༜ ༶ ᎒ ⌃ ⌒ ⌓ ⌤ ⌯ ⑃ △ ▴ ▵ ◠ ◡ ◬ ▲ ؞ ܀ ჻ ። ፨ ⁂ ‸ 〽 ∆ ∧ ∩ ⋀ ⋂ Ʌ Δ Λ Ѧ ^ ʍ " +
 "↟ ↥ ⇈ ⇞ ⇡ ⍋ ⍑ ⍒ ⍡ ⍦ ⏃ ▲ ☨ ♆ ♠ ♣ ♤ ♧ ¥ ↑ ∐ ↡ ᎙ ⇊ ⇟ ⇣ ⌄ ⌎ ⌏ ♈ ⺌ ⺍ ༈ ༎ ″ ‴ 〃 „ 〟 ↓ ⊻ ⋎ ٧ ⚶ " +
 "░ ▒ ▓ ☰ ☷ ☵ ☲ ⿲ ⿳ ∷ ∵ ∴ ≡ ≣ Ξ ☁ ★ ☆ ♣ ♧ ✽ ✾ ✿ ❀ ✬ ✮ ❁ ❃ ❋ ❦ ❧ ༺ ༻ ܣ ܤ ݍ " +
 "♒ ♨ ❄ ❅ ෴ ༄ ༅ ༆ ྅ ﹌ ~ ∻ ∼ ≈ ≋ ～ ঠ",

 misc:   "! * ° ● ◦ • ¤ ∘ ٥ ۵ ० ০ ੦ ૦ ୦ ௦ ౦ ೦ ๐ ໐ O Ø Ꮻ ℧ ℥ ⌇ ⌑ ⌔ ⌕ ⊸ Ò Ó Ō Ū Ʊ Ѽ Ѿ ð ò ó ō ȯ ⌗ ⌘ ☥ ☩ ♀ ⋕ Ҩ δ ό ѽ ṓ ʊ ᛍ ⚗ ⚖ ⚘ ⚚ " +
 "⍊ ⍎ ⍘ ⍙ ⏂ ⏅ ▲ △ ◬ ⊥ Ѧ Ѩ ⨅ ⋂ ∩ Π ∏ ⍬ ☸ ♕ ♔ ♚ ♛ ŵ w ⌓ ⩍ ᗝ ᗩ ロ ▽ ∇ ⍞ ♊ ♉ ᕱ ⏚ ⑁ ♡ ♢ ♥ ♦ ❒ ∀ ⚷ ᗼ ◫ ⎅ ᗶ ᘐ ፅ " +
 "☄ ☌ ☍ ♁ ♂ ❛ ❢ ❣ ❤ ¿ ∞ Ȣ ⍾ ♘ ♞ Ԓ Ө Ѳ Д ♪ £ ♦ ♡ ♥ Σ σ ○ ♀ ↑"

 };
 */