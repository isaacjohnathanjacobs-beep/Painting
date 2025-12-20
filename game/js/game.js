// Main Game Engine

const Game = {
    canvas: null,
    ctx: null,
    minimapCanvas: null,
    minimapCtx: null,

    // Camera
    camera: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },

    // Game state
    isRunning: false,
    lastTime: 0,

    // Input
    mouse: {
        x: 0,
        y: 0,
        clicked: false,
        rightClicked: false
    },
    keys: {},

    init() {
        // Get canvas elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Setup input handlers
        this.setupInput();

        // Initialize game systems
        GameMap.init();
        NPCManager.init();
        UI.init();

        // Initialize player at spawn point
        Player.init(25, 20);
        UI.updatePlayerName(Player.character.name);
        UI.updateStats();
        UI.updateInventory();

        // Show inventory by default
        UI.togglePanel('inventory');
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    },

    setupInput() {
        // Mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Left click - move or interact
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e.clientX, e.clientY);
        });

        // Right click - context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e.clientX, e.clientY);
        });

        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Quick keys
            if (e.key === 'i' || e.key === 'I') UI.togglePanel('inventory');
            if (e.key === 's' || e.key === 'S') UI.togglePanel('stats');
            if (e.key === 'm' || e.key === 'M') UI.togglePanel('minimap');
            if (e.key === 'Escape') {
                UI.hideDialogue();
                UI.hideContextMenu();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    },

    handleClick(screenX, screenY) {
        // Convert screen coordinates to world coordinates
        const worldX = screenX + this.camera.x;
        const worldY = screenY + this.camera.y;
        const tileX = Math.floor(worldX / GameMap.tileSize);
        const tileY = Math.floor(worldY / GameMap.tileSize);

        // Check if clicked on NPC
        const npc = NPCManager.getNPCAt(tileX, tileY);
        if (npc) {
            // Move near NPC then interact
            const nearTile = this.findNearTile(npc.tileX, npc.tileY);
            if (nearTile) {
                Player.moveTo(nearTile.x, nearTile.y);
                // Set up interaction when reaching destination
                const checkInteract = setInterval(() => {
                    if (!Player.isMoving) {
                        clearInterval(checkInteract);
                        if (Utils.distance(Player.tileX, Player.tileY, npc.tileX, npc.tileY) <= 2) {
                            NPCManager.interactWith(npc);
                        }
                    }
                }, 100);
            }
            return;
        }

        // Check if clicked on interactable object
        const obj = GameMap.getObjectAt(tileX, tileY);
        if (obj && obj.interactable) {
            const nearTile = this.findNearTile(tileX, tileY);
            if (nearTile) {
                Player.moveTo(nearTile.x, nearTile.y);
                const checkInteract = setInterval(() => {
                    if (!Player.isMoving) {
                        clearInterval(checkInteract);
                        if (Utils.distance(Player.tileX, Player.tileY, tileX, tileY) <= 2) {
                            this.interactWithObject(obj);
                        }
                    }
                }, 100);
            }
            return;
        }

        // Regular movement
        Player.moveTo(tileX, tileY);
    },

    handleRightClick(screenX, screenY) {
        const worldX = screenX + this.camera.x;
        const worldY = screenY + this.camera.y;
        const tileX = Math.floor(worldX / GameMap.tileSize);
        const tileY = Math.floor(worldY / GameMap.tileSize);

        const options = [];

        // Check for NPC
        const npc = NPCManager.getNPCAt(tileX, tileY);
        if (npc) {
            options.push({
                label: `Talk-to ${npc.name}`,
                action: () => {
                    const nearTile = this.findNearTile(npc.tileX, npc.tileY);
                    if (nearTile) {
                        Player.moveTo(nearTile.x, nearTile.y);
                        const checkInteract = setInterval(() => {
                            if (!Player.isMoving) {
                                clearInterval(checkInteract);
                                NPCManager.interactWith(npc);
                            }
                        }, 100);
                    }
                }
            });
        }

        // Check for object
        const obj = GameMap.getObjectAt(tileX, tileY);
        if (obj) {
            if (obj.type === 'tree') {
                options.push({
                    label: 'Chop Tree',
                    action: () => this.startWoodcutting(tileX, tileY)
                });
            } else if (obj.type === 'fishing_spot') {
                options.push({
                    label: 'Fish',
                    action: () => this.startFishing(tileX, tileY)
                });
            } else if (obj.type === 'fire') {
                options.push({
                    label: 'Cook',
                    action: () => this.startCooking(tileX, tileY)
                });
            } else if (obj.type === 'sign') {
                options.push({
                    label: 'Read Sign',
                    action: () => UI.addChatMessage(obj.text, 'system')
                });
            }
        }

        // Always add walk here option
        options.push({
            label: 'Walk here',
            action: () => Player.moveTo(tileX, tileY)
        });

        if (options.length > 0) {
            UI.showContextMenu(screenX, screenY, options);
        }
    },

    findNearTile(tileX, tileY) {
        const directions = [
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 }
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

    interactWithObject(obj) {
        switch (obj.action) {
            case 'fish':
                this.startFishing(obj.x, obj.y);
                break;
            case 'cook':
                this.startCooking(obj.x, obj.y);
                break;
            case 'read':
                UI.addChatMessage(obj.text, 'system');
                break;
            case 'open':
                UI.addChatMessage('You open the chest...', 'system');
                if (obj.contents) {
                    Player.addToInventory({ id: obj.contents, name: 'Bronze Sword', icon: '⚔️' });
                    obj.contents = null; // Chest now empty
                } else {
                    UI.addChatMessage('The chest is empty.', 'system');
                }
                break;
        }
    },

    startFishing(tileX, tileY) {
        if (!Player.findInInventory('small_fishing_net') === -1) {
            UI.addChatMessage('You need a fishing net to fish here.', 'system');
            return;
        }

        const nearTile = this.findNearTile(tileX, tileY);
        if (nearTile) {
            Player.moveTo(nearTile.x, nearTile.y);
            const checkStart = setInterval(() => {
                if (!Player.isMoving) {
                    clearInterval(checkStart);
                    Player.startAction({ type: 'fish', verb: 'fishing', duration: 3000 });
                }
            }, 100);
        }
    },

    startCooking(tileX, tileY) {
        if (Player.findInInventory('raw_shrimp') === -1) {
            UI.addChatMessage('You need raw fish to cook.', 'system');
            return;
        }

        const nearTile = this.findNearTile(tileX, tileY);
        if (nearTile) {
            Player.moveTo(nearTile.x, nearTile.y);
            const checkStart = setInterval(() => {
                if (!Player.isMoving) {
                    clearInterval(checkStart);
                    Player.startAction({ type: 'cook', verb: 'cooking', duration: 2000 });
                }
            }, 100);
        }
    },

    startWoodcutting(tileX, tileY) {
        if (Player.findInInventory('bronze_axe') === -1) {
            UI.addChatMessage('You need an axe to chop trees.', 'system');
            return;
        }

        const nearTile = this.findNearTile(tileX, tileY);
        if (nearTile) {
            Player.moveTo(nearTile.x, nearTile.y);
            const checkStart = setInterval(() => {
                if (!Player.isMoving) {
                    clearInterval(checkStart);
                    Player.startAction({ type: 'chop', verb: 'chopping', duration: 4000 });
                }
            }, 100);
        }
    },

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        Tutorial.init();
        this.gameLoop();
    },

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    },

    update(deltaTime) {
        // Update player
        Player.update(deltaTime);

        // Update camera to follow player
        this.camera.x = Player.x - this.camera.width / 2 + 16;
        this.camera.y = Player.y - this.camera.height / 2 + 24;

        // Clamp camera to map bounds
        this.camera.x = Utils.clamp(this.camera.x, 0, GameMap.width * GameMap.tileSize - this.camera.width);
        this.camera.y = Utils.clamp(this.camera.y, 0, GameMap.height * GameMap.tileSize - this.camera.height);

        // Update NPCs
        NPCManager.update(deltaTime);

        // Keyboard movement (WASD)
        if (!Player.isMoving && !Player.currentAction) {
            let dx = 0, dy = 0;
            if (this.keys['w'] || this.keys['arrowup']) dy = -1;
            if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx = -1;
            if (this.keys['d'] || this.keys['arrowright']) dx = 1;

            if (dx !== 0 || dy !== 0) {
                const newTileX = Player.tileX + dx;
                const newTileY = Player.tileY + dy;
                if (GameMap.isWalkable(newTileX, newTileY)) {
                    Player.moveTo(newTileX, newTileY);
                }
            }
        }
    },

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render map
        GameMap.render(this.ctx, this.camera);

        // Render NPCs
        NPCManager.render(this.ctx, this.camera);

        // Render player
        Player.render(this.ctx, this.camera);

        // Render minimap
        GameMap.renderMinimap(this.minimapCtx, Player, 150, 150);

        // Draw click indicator
        if (Player.path.length > 0) {
            const lastTile = Player.path[Player.path.length - 1];
            const screenX = lastTile.x * GameMap.tileSize - this.camera.x;
            const screenY = lastTile.y * GameMap.tileSize - this.camera.y;

            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screenX, screenY, GameMap.tileSize, GameMap.tileSize);
        }
    },

    stop() {
        this.isRunning = false;
    }
};
