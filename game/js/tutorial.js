// Tutorial System

const Tutorial = {
    currentStep: 0,
    steps: [
        {
            title: "Welcome to Tutorial Island!",
            text: "This is where your adventure begins! You'll learn the basics of combat, fishing, cooking, and woodcutting. Talk to the Survival Expert nearby to get started.",
            highlight: 'guide'
        },
        {
            title: "Combat Training",
            text: "Visit the Combat Instructor in the building to the north. He'll teach you how to defend yourself against monsters. Follow the path!",
            highlight: 'combat_instructor'
        },
        {
            title: "Time to Fish!",
            text: "Head to the fishing dock on the east side of the island. The Fishing Tutor will give you a net and teach you how to catch shrimp.",
            highlight: 'fishing_tutor'
        },
        {
            title: "Learn to Cook",
            text: "Great catch! Now visit the Cooking Tutor in the south. She'll teach you how to cook your fish so it restores more health.",
            highlight: 'cooking_tutor'
        },
        {
            title: "Woodcutting",
            text: "Almost done! Visit the Woodcutting Tutor to learn how to chop trees. Logs are useful for making fires and crafting.",
            highlight: 'woodcutting_tutor'
        },
        {
            title: "Tutorial Complete!",
            text: "Congratulations! You've learned the basic skills. In a full game, you would now leave Tutorial Island to explore the mainland. Thanks for playing!",
            highlight: null
        }
    ],
    isShowingStep: false,

    init() {
        this.currentStep = 0;
        this.showCurrentStep();
    },

    showCurrentStep() {
        if (this.currentStep >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[this.currentStep];
        this.isShowingStep = true;
        UI.showTutorial(step.title, step.text);
    },

    advance() {
        this.currentStep++;
        UI.hideTutorial();
        this.isShowingStep = false;

        if (this.currentStep < this.steps.length) {
            // Small delay before showing next step
            setTimeout(() => {
                if (this.currentStep === this.steps.length - 1) {
                    // Last step - show immediately
                    this.showCurrentStep();
                }
            }, 500);

            // Add a hint message
            const step = this.steps[this.currentStep];
            if (step && this.currentStep < this.steps.length - 1) {
                UI.addChatMessage(`Hint: ${step.text}`, 'system');
            }
        } else {
            this.complete();
        }
    },

    complete() {
        UI.addChatMessage('🎉 Tutorial Complete! You\'ve learned the basics!', 'system');
        UI.addChatMessage('Explore the island and practice your new skills!', 'system');
    },

    getCurrentObjective() {
        if (this.currentStep >= this.steps.length) {
            return "Explore and have fun!";
        }
        return this.steps[this.currentStep].text;
    },

    getHighlightedNPC() {
        if (this.currentStep >= this.steps.length) {
            return null;
        }
        return this.steps[this.currentStep].highlight;
    }
};
