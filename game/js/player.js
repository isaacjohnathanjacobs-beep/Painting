// Player system

const Player = {
    // Character appearance
    character: {
        name: 'Player',
        gender: 'male',
        skin: 0,
        hairStyle: 0,
        hairColor: 0,
        shirt: 0,
        pants: 0
    },

    // Position (in pixels)
    x: 0,
    y: 0,

    // Tile position
    tileX: 25,
    tileY: 20,

    // Movement
    targetX: 0,
    targetY: 0,
    path: [],
    isMoving: false,
    moveSpeed: 3,
    direction: 'down',
    animFrame: 0,

    // Stats
    stats: {
        attack: 1,
        defence: 1,
        strength: 1,
        hitpoints: 10,
        agility: 1,
        fishing: 1,
        cooking: 1,
        woodcutting: 1
    },

    // Experience
    xp: {
        attack: 0,
        defence: 0,
        strength: 0,
        hitpoints: 1154, // Level 10
        agility: 0,
        fishing: 0,
        cooking: 0,
        woodcutting: 0
    },

    // Inventory (28 slots like OSRS)
    inventory: new Array(28).fill(null),

    // Currently doing action
    currentAction: null,
    actionProgress: 0,

    init(spawnTileX, spawnTileY) {
        this.tileX = spawnTileX;
        this.tileY = spawnTileY;
        this.x = spawnTileX * GameMap.tileSize;
        this.y = spawnTileY * GameMap.tileSize;
        this.targetX = this.x;
        this.targetY = this.y;
    },

    setCharacter(charData) {
        this.character = { ...charData };
    },

    // Click to move
    moveTo(targetTileX, targetTileY) {
        if (!GameMap.isWalkable(targetTileX, targetTileY)) {
            // Try to find nearest walkable tile
            const nearby = this.findNearestWalkable(targetTileX, targetTileY);
            if (nearby) {
                targetTileX = nearby.x;
                targetTileY = nearby.y;
            } else {
                return false;
            }
        }

        // Find path using A*
        const path = Utils.findPath(
            this.tileX, this.tileY,
            targetTileX, targetTileY,
            (x, y) => GameMap.isWalkable(x, y)
        );

        if (path && path.length > 0) {
            this.path = path;
            this.isMoving = true;
            this.currentAction = null;
            return true;
        }

        return false;
    },

    findNearestWalkable(tileX, tileY) {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: -1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: 1 }
        ];

        for (const dir of directions) {
            const nx = tileX + dir.dx;
            const ny = tileY + dir.dy;
            if (GameMap.isWalkable(nx, ny)) {
                return { x: nx, y: ny };
            }
        }
        return null;
    },

    update(deltaTime) {
        if (this.path.length > 0) {
            const nextTile = this.path[0];
            const targetPixelX = nextTile.x * GameMap.tileSize;
            const targetPixelY = nextTile.y * GameMap.tileSize;

            // Calculate direction
            const dx = targetPixelX - this.x;
            const dy = targetPixelY - this.y;

            // Update facing direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else if (dy !== 0) {
                this.direction = dy > 0 ? 'down' : 'up';
            }

            // Move towards target
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.moveSpeed) {
                this.x += (dx / dist) * this.moveSpeed;
                this.y += (dy / dist) * this.moveSpeed;
                this.animFrame += 0.15;
            } else {
                this.x = targetPixelX;
                this.y = targetPixelY;
                this.tileX = nextTile.x;
                this.tileY = nextTile.y;
                this.path.shift();

                if (this.path.length === 0) {
                    this.isMoving = false;
                    this.animFrame = 0;
                }
            }
        }

        // Update current action
        if (this.currentAction) {
            this.actionProgress += deltaTime;
            if (this.actionProgress >= this.currentAction.duration) {
                this.completeAction();
            }
        }
    },

    startAction(action) {
        this.currentAction = action;
        this.actionProgress = 0;
        UI.addChatMessage(`You start ${action.verb}...`, 'system');
    },

    completeAction() {
        if (!this.currentAction) return;

        const action = this.currentAction;

        switch (action.type) {
            case 'fish':
                this.addXP('fishing', 20);
                this.addToInventory({ id: 'raw_shrimp', name: 'Raw Shrimp', icon: '🦐' });
                UI.addChatMessage('You catch some shrimp!', 'system');
                break;

            case 'cook':
                const shrimp = this.findInInventory('raw_shrimp');
                if (shrimp !== -1) {
                    this.inventory[shrimp] = { id: 'cooked_shrimp', name: 'Cooked Shrimp', icon: '🍤' };
                    this.addXP('cooking', 30);
                    UI.addChatMessage('You cook the shrimp!', 'system');
                } else {
                    UI.addChatMessage('You need raw fish to cook.', 'system');
                }
                break;

            case 'chop':
                this.addXP('woodcutting', 25);
                this.addToInventory({ id: 'logs', name: 'Logs', icon: '🪵' });
                UI.addChatMessage('You chop down a tree and get some logs!', 'system');
                break;
        }

        this.currentAction = null;
        this.actionProgress = 0;
    },

    addXP(skill, amount) {
        this.xp[skill] += amount;
        const newLevel = this.xpToLevel(this.xp[skill]);

        if (newLevel > this.stats[skill]) {
            this.stats[skill] = newLevel;
            UI.addChatMessage(`Congratulations! You've reached level ${newLevel} ${skill}!`, 'system');
            UI.updateStats();
        }
    },

    xpToLevel(xp) {
        // Simplified OSRS-style XP curve
        let level = 1;
        let totalXP = 0;
        while (level < 99) {
            const xpForLevel = Math.floor(level + 300 * Math.pow(2, level / 7));
            if (totalXP + xpForLevel > xp) break;
            totalXP += xpForLevel;
            level++;
        }
        return level;
    },

    addToInventory(item) {
        const emptySlot = this.inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            this.inventory[emptySlot] = item;
            UI.updateInventory();
            return true;
        }
        UI.addChatMessage('Your inventory is full!', 'system');
        return false;
    },

    findInInventory(itemId) {
        return this.inventory.findIndex(item => item && item.id === itemId);
    },

    removeFromInventory(index) {
        if (this.inventory[index]) {
            this.inventory[index] = null;
            UI.updateInventory();
            return true;
        }
        return false;
    },

    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        Sprites.drawCharacter(
            ctx,
            this.character,
            screenX,
            screenY - 16, // Offset for character height
            1,
            this.direction,
            this.isMoving ? this.animFrame : 0
        );

        // Draw player name above character
        ctx.fillStyle = '#00FF00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.character.name, screenX + 16, screenY - 24);

        // Draw action progress bar if doing something
        if (this.currentAction) {
            const progress = this.actionProgress / this.currentAction.duration;
            const barWidth = 40;
            const barHeight = 6;
            const barX = screenX - 4;
            const barY = screenY - 32;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
};
