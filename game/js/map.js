// Map system for Tutorial Island

const GameMap = {
    tileSize: 32,
    width: 50,
    height: 40,
    tiles: [],
    objects: [],
    collisionMap: [],

    // Tile types
    TILES: {
        GRASS: 0,
        WATER: 1,
        SAND: 2,
        STONE: 3,
        DIRT: 4,
        WOOD: 5,
        PATH: 6
    },

    // Tile properties
    tileProperties: {
        0: { name: 'grass', walkable: true },
        1: { name: 'water', walkable: false },
        2: { name: 'sand', walkable: true },
        3: { name: 'stone', walkable: true },
        4: { name: 'dirt', walkable: true },
        5: { name: 'wood', walkable: true },
        6: { name: 'path', walkable: true }
    },

    // Initialize the Tutorial Island map
    init() {
        this.createTutorialIsland();
        this.generateCollisionMap();
    },

    createTutorialIsland() {
        // Initialize with water
        this.tiles = [];
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = this.TILES.WATER;
            }
        }

        // Create the island shape (irregular oval)
        const centerX = 25;
        const centerY = 20;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dx = (x - centerX) / 18;
                const dy = (y - centerY) / 14;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Add some noise for natural edges
                const noise = Math.sin(x * 0.5) * 0.1 + Math.cos(y * 0.3) * 0.1;

                if (dist + noise < 0.85) {
                    this.tiles[y][x] = this.TILES.GRASS;
                } else if (dist + noise < 1.0) {
                    this.tiles[y][x] = this.TILES.SAND;
                }
            }
        }

        // Create paths connecting different areas
        this.createPath(12, 20, 38, 20); // Main horizontal path
        this.createPath(25, 10, 25, 30); // Main vertical path
        this.createPath(12, 20, 12, 12); // Path to combat area
        this.createPath(38, 20, 38, 28); // Path to woodcutting area
        this.createPath(25, 10, 35, 10); // Path to fishing area
        this.createPath(25, 30, 15, 30); // Path to cooking area

        // Create stone areas (buildings/structures)
        this.createArea(10, 8, 6, 5, this.TILES.STONE);  // Combat building
        this.createArea(33, 8, 6, 5, this.TILES.STONE);  // Fishing dock
        this.createArea(36, 26, 5, 5, this.TILES.STONE); // Woodcutting area
        this.createArea(10, 28, 6, 5, this.TILES.STONE); // Cooking area
        this.createArea(22, 18, 7, 5, this.TILES.STONE); // Central spawn area

        // Add wooden floors in buildings
        this.createArea(11, 9, 4, 3, this.TILES.WOOD);
        this.createArea(23, 19, 5, 3, this.TILES.WOOD);

        // Create objects list
        this.objects = [
            // Trees scattered around
            { type: 'tree', x: 8, y: 16 },
            { type: 'tree', x: 42, y: 18 },
            { type: 'tree', x: 38, y: 28 },
            { type: 'tree', x: 39, y: 29 },
            { type: 'tree', x: 37, y: 30 },
            { type: 'tree', x: 20, y: 14 },
            { type: 'tree', x: 30, y: 14 },
            { type: 'tree', x: 15, y: 26 },
            { type: 'tree', x: 35, y: 24 },

            // Rocks
            { type: 'rock', x: 18, y: 12 },
            { type: 'rock', x: 32, y: 26 },
            { type: 'rock', x: 40, y: 15 },

            // Fishing spot (near dock)
            { type: 'fishing_spot', x: 36, y: 7, interactable: true, action: 'fish' },

            // Cooking fire
            { type: 'fire', x: 12, y: 30, interactable: true, action: 'cook' },

            // Signs
            { type: 'sign', x: 24, y: 17, interactable: true, action: 'read', text: 'Welcome to Tutorial Island!' },
            { type: 'sign', x: 11, y: 11, interactable: true, action: 'read', text: 'Combat Training Area' },
            { type: 'sign', x: 35, y: 11, interactable: true, action: 'read', text: 'Fishing Dock' },
            { type: 'sign', x: 38, y: 29, interactable: true, action: 'read', text: 'Woodcutting Grove' },
            { type: 'sign', x: 11, y: 31, interactable: true, action: 'read', text: 'Cooking Area' },

            // Chests (tutorial rewards)
            { type: 'chest', x: 25, y: 21, interactable: true, action: 'open', contents: 'bronze_sword' }
        ];
    },

    createPath(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        for (let i = 0; i <= steps; i++) {
            const x = Math.round(x1 + (dx * i) / steps);
            const y = Math.round(y1 + (dy * i) / steps);

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.tiles[y][x] = this.TILES.PATH;
                // Make paths 2 tiles wide
                if (x + 1 < this.width) this.tiles[y][x + 1] = this.TILES.PATH;
                if (y + 1 < this.height) this.tiles[y + 1][x] = this.TILES.PATH;
            }
        }
    },

    createArea(startX, startY, width, height, tileType) {
        for (let y = startY; y < startY + height && y < this.height; y++) {
            for (let x = startX; x < startX + width && x < this.width; x++) {
                if (x >= 0 && y >= 0) {
                    this.tiles[y][x] = tileType;
                }
            }
        }
    },

    generateCollisionMap() {
        this.collisionMap = [];
        for (let y = 0; y < this.height; y++) {
            this.collisionMap[y] = [];
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                this.collisionMap[y][x] = !this.tileProperties[tile].walkable;
            }
        }

        // Add object collisions
        for (const obj of this.objects) {
            if (obj.type === 'tree' || obj.type === 'rock') {
                if (this.collisionMap[obj.y]) {
                    this.collisionMap[obj.y][obj.x] = true;
                }
            }
        }
    },

    isWalkable(tileX, tileY) {
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return false;
        }
        return !this.collisionMap[tileY][tileX];
    },

    getTile(tileX, tileY) {
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return null;
        }
        return this.tiles[tileY][tileX];
    },

    getObjectAt(tileX, tileY) {
        return this.objects.find(obj => obj.x === tileX && obj.y === tileY);
    },

    getInteractablesNear(tileX, tileY, radius = 1) {
        return this.objects.filter(obj => {
            if (!obj.interactable) return false;
            const dx = Math.abs(obj.x - tileX);
            const dy = Math.abs(obj.y - tileY);
            return dx <= radius && dy <= radius;
        });
    },

    // Render the map
    render(ctx, camera) {
        const startTileX = Math.floor(camera.x / this.tileSize);
        const startTileY = Math.floor(camera.y / this.tileSize);
        const tilesX = Math.ceil(camera.width / this.tileSize) + 2;
        const tilesY = Math.ceil(camera.height / this.tileSize) + 2;

        // Draw tiles
        for (let y = startTileY; y < startTileY + tilesY && y < this.height; y++) {
            for (let x = startTileX; x < startTileX + tilesX && x < this.width; x++) {
                if (x < 0 || y < 0) continue;

                const tile = this.tiles[y][x];
                const tileName = this.tileProperties[tile].name;
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;

                Sprites.drawTile(ctx, tileName, screenX, screenY, this.tileSize);
            }
        }

        // Draw objects (sorted by Y for depth)
        const sortedObjects = [...this.objects].sort((a, b) => a.y - b.y);

        for (const obj of sortedObjects) {
            const screenX = obj.x * this.tileSize - camera.x;
            const screenY = obj.y * this.tileSize - camera.y;

            // Only draw if on screen
            if (screenX > -64 && screenX < camera.width + 64 &&
                screenY > -64 && screenY < camera.height + 64) {
                Sprites.drawObject(ctx, obj.type, screenX, screenY - 16);
            }
        }
    },

    // Render minimap
    renderMinimap(ctx, player, width, height) {
        const scale = 3;
        const offsetX = width / 2 - player.tileX * scale;
        const offsetY = height / 2 - player.tileY * scale;

        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                const screenX = x * scale + offsetX;
                const screenY = y * scale + offsetY;

                if (screenX < -scale || screenX > width || screenY < -scale || screenY > height) {
                    continue;
                }

                let color;
                switch(tile) {
                    case this.TILES.WATER: color = '#2980b9'; break;
                    case this.TILES.GRASS: color = '#27ae60'; break;
                    case this.TILES.SAND: color = '#f1c40f'; break;
                    case this.TILES.STONE: color = '#7f8c8d'; break;
                    case this.TILES.PATH: color = '#bdc3c7'; break;
                    case this.TILES.WOOD: color = '#8B4513'; break;
                    default: color = '#27ae60';
                }

                ctx.fillStyle = color;
                ctx.fillRect(screenX, screenY, scale, scale);
            }
        }

        // Draw player as white dot
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw NPCs as yellow dots
        if (typeof NPCManager !== 'undefined') {
            ctx.fillStyle = '#ffd700';
            for (const npc of NPCManager.npcs) {
                const npcScreenX = npc.tileX * scale + offsetX;
                const npcScreenY = npc.tileY * scale + offsetY;
                ctx.beginPath();
                ctx.arc(npcScreenX, npcScreenY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};
