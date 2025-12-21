// NPC System

const NPCManager = {
    npcs: [],

    init() {
        // Create Tutorial Island NPCs
        this.npcs = [
            {
                id: 'guide',
                name: 'Survival Expert',
                type: 'guide',
                tileX: 24,
                tileY: 19,
                direction: 'down',
                dialogue: 'guide_intro',
                tutorialStep: 0
            },
            {
                id: 'combat_instructor',
                name: 'Combat Instructor',
                type: 'combat',
                tileX: 12,
                tileY: 10,
                direction: 'down',
                dialogue: 'combat_intro',
                tutorialStep: 1
            },
            {
                id: 'fishing_tutor',
                name: 'Fishing Tutor',
                type: 'fishing',
                tileX: 35,
                tileY: 9,
                direction: 'left',
                dialogue: 'fishing_intro',
                tutorialStep: 2
            },
            {
                id: 'cooking_tutor',
                name: 'Cooking Tutor',
                type: 'cooking',
                tileX: 12,
                tileY: 29,
                direction: 'right',
                dialogue: 'cooking_intro',
                tutorialStep: 3
            },
            {
                id: 'woodcutting_tutor',
                name: 'Woodcutting Tutor',
                type: 'woodcutting',
                tileX: 37,
                tileY: 27,
                direction: 'down',
                dialogue: 'woodcutting_intro',
                tutorialStep: 4
            }
        ];

        // Initialize NPC pixel positions
        for (const npc of this.npcs) {
            npc.x = npc.tileX * GameMap.tileSize;
            npc.y = npc.tileY * GameMap.tileSize;
            npc.animFrame = 0;
            npc.idleTimer = 0;
        }
    },

    update(deltaTime) {
        for (const npc of this.npcs) {
            // Simple idle animation
            npc.idleTimer += deltaTime;

            // Occasionally look around
            if (npc.idleTimer > 3000 + Math.random() * 2000) {
                npc.idleTimer = 0;
                const directions = ['up', 'down', 'left', 'right'];
                npc.direction = Utils.randomElement(directions);
            }
        }
    },

    getNPCAt(tileX, tileY) {
        return this.npcs.find(npc =>
            Math.abs(npc.tileX - tileX) <= 1 &&
            Math.abs(npc.tileY - tileY) <= 1
        );
    },

    getNPCById(id) {
        return this.npcs.find(npc => npc.id === id);
    },

    interactWith(npc) {
        if (!npc) return;

        // Face the player
        const dx = Player.tileX - npc.tileX;
        const dy = Player.tileY - npc.tileY;

        if (Math.abs(dx) > Math.abs(dy)) {
            npc.direction = dx > 0 ? 'right' : 'left';
        } else {
            npc.direction = dy > 0 ? 'down' : 'up';
        }

        // Start dialogue
        DialogueSystem.start(npc.dialogue, npc);
    },

    render(ctx, camera) {
        // Sort by Y position for proper depth
        const sortedNPCs = [...this.npcs].sort((a, b) => a.tileY - b.tileY);

        for (const npc of sortedNPCs) {
            const screenX = npc.x - camera.x;
            const screenY = npc.y - camera.y;

            // Only draw if on screen
            if (screenX > -64 && screenX < camera.width + 64 &&
                screenY > -64 && screenY < camera.height + 64) {

                Sprites.drawNPC(
                    ctx,
                    npc.type,
                    screenX,
                    screenY - 16,
                    1,
                    npc.direction,
                    0
                );

                // Draw NPC name
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, screenX + 16, screenY - 24);

                // Draw chat icon if NPC has dialogue for current tutorial step
                if (Tutorial.currentStep === npc.tutorialStep || npc.tutorialStep === undefined) {
                    ctx.fillStyle = '#FFD700';
                    ctx.font = '16px Arial';
                    ctx.fillText('💬', screenX + 16, screenY - 36);
                }
            }
        }
    }
};
