// Dialogue System

const DialogueSystem = {
    currentDialogue: null,
    currentNode: 0,
    currentNPC: null,

    // Dialogue trees
    dialogues: {
        guide_intro: {
            nodes: [
                {
                    text: "Welcome to Tutorial Island, adventurer! I'm the Survival Expert, and I'll be your guide today.",
                    options: [
                        { text: "What is this place?", next: 1 },
                        { text: "What should I do?", next: 2 },
                        { text: "Goodbye.", action: 'end' }
                    ]
                },
                {
                    text: "This is Tutorial Island - a safe place where new adventurers learn the basics before venturing into the mainland. You'll learn combat, fishing, cooking, and woodcutting here!",
                    options: [
                        { text: "Sounds exciting!", next: 2 },
                        { text: "I understand.", action: 'end' }
                    ]
                },
                {
                    text: "First, I suggest you visit the Combat Instructor to the north. He'll teach you how to defend yourself. After that, try fishing, cooking, and woodcutting!",
                    options: [
                        { text: "Where is the Combat Instructor?", next: 3 },
                        { text: "Thanks for the help!", action: 'advance_tutorial' }
                    ]
                },
                {
                    text: "The Combat Instructor is in the stone building to the north. Just follow the path and look for the signs!",
                    options: [
                        { text: "Thanks, I'll head there now!", action: 'advance_tutorial' }
                    ]
                }
            ]
        },

        combat_intro: {
            nodes: [
                {
                    text: "Ah, a new recruit! I'm the Combat Instructor. Ready to learn how to fight?",
                    options: [
                        { text: "Yes, teach me!", next: 1 },
                        { text: "What will I learn?", next: 2 },
                        { text: "Not right now.", action: 'end' }
                    ]
                },
                {
                    text: "Combat is simple - click on enemies to attack them. Your Attack skill determines your accuracy, Strength determines your damage, and Defence helps you avoid hits.",
                    options: [
                        { text: "How do I get stronger?", next: 3 },
                        { text: "Got it!", action: 'advance_tutorial' }
                    ]
                },
                {
                    text: "I teach the art of melee combat. Attack, Strength, and Defence are the core combat skills. Training them will make you a formidable warrior!",
                    options: [
                        { text: "Teach me to fight!", next: 1 },
                        { text: "Maybe later.", action: 'end' }
                    ]
                },
                {
                    text: "By fighting! Every battle gives you experience. The more you fight, the stronger you become. Now go practice on some training dummies!",
                    options: [
                        { text: "I'll start training!", action: 'advance_tutorial' }
                    ]
                }
            ]
        },

        fishing_intro: {
            nodes: [
                {
                    text: "Hello there! Want to learn how to fish? It's a relaxing and useful skill!",
                    options: [
                        { text: "Yes, please teach me!", next: 1 },
                        { text: "What can I catch?", next: 2 },
                        { text: "No thanks.", action: 'end' }
                    ]
                },
                {
                    text: "Fishing is easy! Just click on a fishing spot to start. You'll catch shrimp here - they're great for cooking!",
                    options: [
                        { text: "Where's the fishing spot?", next: 3 },
                        { text: "I'll try it out!", action: 'give_fishing_net' }
                    ]
                },
                {
                    text: "In these waters, you can catch shrimp. They're small but nutritious! Cook them over a fire to make a tasty meal.",
                    options: [
                        { text: "How do I start?", next: 1 },
                        { text: "Sounds delicious!", action: 'give_fishing_net' }
                    ]
                },
                {
                    text: "Look for the bubbling water just off the dock. Click on it to start fishing. Here, take this net!",
                    options: [
                        { text: "Thanks!", action: 'give_fishing_net' }
                    ]
                }
            ]
        },

        cooking_intro: {
            nodes: [
                {
                    text: "Welcome to the kitchen! I can teach you the art of cooking!",
                    options: [
                        { text: "What can you teach me?", next: 1 },
                        { text: "I have some raw fish.", next: 2 },
                        { text: "Goodbye.", action: 'end' }
                    ]
                },
                {
                    text: "Cooking turns raw food into meals that restore your health! Just use the fire with raw food in your inventory.",
                    options: [
                        { text: "How do I use the fire?", next: 3 },
                        { text: "I understand!", action: 'advance_tutorial' }
                    ]
                },
                {
                    text: "Excellent! Use the fire nearby to cook it. Cooked food heals you when eaten!",
                    options: [
                        { text: "I'll cook it right away!", action: 'advance_tutorial' }
                    ]
                },
                {
                    text: "Simply click on the fire while you have raw food. The cooking will happen automatically. Be careful though - at low levels, you might burn your food!",
                    options: [
                        { text: "Thanks for the tip!", action: 'advance_tutorial' }
                    ]
                }
            ]
        },

        woodcutting_intro: {
            nodes: [
                {
                    text: "Ho there! Want to learn woodcutting? It's a fundamental skill!",
                    options: [
                        { text: "Yes! Teach me!", next: 1 },
                        { text: "What's woodcutting for?", next: 2 },
                        { text: "Not interested.", action: 'end' }
                    ]
                },
                {
                    text: "Just click on a tree to start chopping. You'll get logs that can be used for fires, construction, and more!",
                    options: [
                        { text: "Where are the trees?", next: 3 },
                        { text: "Give me an axe!", action: 'give_axe' }
                    ]
                },
                {
                    text: "Logs are essential! You can use them to make fires for cooking, or craft them into useful items. Woodcutting is a great way to earn money too!",
                    options: [
                        { text: "How do I start?", next: 1 },
                        { text: "Sounds profitable!", action: 'give_axe' }
                    ]
                },
                {
                    text: "There are plenty of trees around here. Here, take this bronze axe to get started!",
                    options: [
                        { text: "Thanks!", action: 'give_axe' }
                    ]
                }
            ]
        }
    },

    start(dialogueId, npc) {
        if (!this.dialogues[dialogueId]) {
            console.error(`Dialogue not found: ${dialogueId}`);
            return;
        }

        this.currentDialogue = this.dialogues[dialogueId];
        this.currentNode = 0;
        this.currentNPC = npc;
        this.showNode();
    },

    showNode() {
        if (!this.currentDialogue) return;

        const node = this.currentDialogue.nodes[this.currentNode];
        if (!node) {
            this.end();
            return;
        }

        const options = node.options.map(opt => ({
            text: opt.text,
            action: () => this.selectOption(opt)
        }));

        UI.showDialogue(
            this.currentNPC.name,
            node.text,
            options,
            this.currentNPC.type
        );
    },

    selectOption(option) {
        if (option.action === 'end') {
            this.end();
        } else if (option.action === 'advance_tutorial') {
            Tutorial.advance();
            this.end();
        } else if (option.action === 'give_fishing_net') {
            Player.addToInventory({ id: 'small_fishing_net', name: 'Small Fishing Net', icon: '🥅' });
            UI.addChatMessage('You receive a small fishing net!', 'system');
            Tutorial.advance();
            this.end();
        } else if (option.action === 'give_axe') {
            Player.addToInventory({ id: 'bronze_axe', name: 'Bronze Axe', icon: '🪓' });
            UI.addChatMessage('You receive a bronze axe!', 'system');
            Tutorial.advance();
            this.end();
        } else if (option.next !== undefined) {
            this.currentNode = option.next;
            this.showNode();
        } else {
            this.end();
        }
    },

    end() {
        this.currentDialogue = null;
        this.currentNode = 0;
        this.currentNPC = null;
        UI.hideDialogue();
    }
};
