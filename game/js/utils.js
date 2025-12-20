// Utility functions for the game

const Utils = {
    // Clamp a value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random element from array
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Deep clone an object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Format time (seconds to MM:SS)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Convert tile coordinates to pixel coordinates
    tileToPixel(tileX, tileY, tileSize) {
        return {
            x: tileX * tileSize,
            y: tileY * tileSize
        };
    },

    // Convert pixel coordinates to tile coordinates
    pixelToTile(pixelX, pixelY, tileSize) {
        return {
            x: Math.floor(pixelX / tileSize),
            y: Math.floor(pixelY / tileSize)
        };
    },

    // Check if point is within rectangle
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    // Simple AABB collision detection
    rectCollision(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    },

    // A* Pathfinding algorithm
    findPath(startX, startY, endX, endY, isWalkable) {
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${startX},${startY}`;
        const endKey = `${endX},${endY}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.distance(startX, startY, endX, endY));
        openSet.push({ x: startX, y: startY, f: fScore.get(startKey) });

        const getNeighbors = (x, y) => {
            const neighbors = [];
            const directions = [
                { dx: 0, dy: -1 }, // up
                { dx: 0, dy: 1 },  // down
                { dx: -1, dy: 0 }, // left
                { dx: 1, dy: 0 },  // right
                { dx: -1, dy: -1 }, // diagonal
                { dx: 1, dy: -1 },
                { dx: -1, dy: 1 },
                { dx: 1, dy: 1 }
            ];

            for (const dir of directions) {
                const nx = x + dir.dx;
                const ny = y + dir.dy;
                if (isWalkable(nx, ny)) {
                    // For diagonal movement, check if adjacent tiles are walkable
                    if (dir.dx !== 0 && dir.dy !== 0) {
                        if (isWalkable(x + dir.dx, y) && isWalkable(x, y + dir.dy)) {
                            neighbors.push({ x: nx, y: ny, cost: 1.414 });
                        }
                    } else {
                        neighbors.push({ x: nx, y: ny, cost: 1 });
                    }
                }
            }
            return neighbors;
        };

        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;

            if (currentKey === endKey) {
                // Reconstruct path
                const path = [];
                let curr = currentKey;
                while (cameFrom.has(curr)) {
                    const [x, y] = curr.split(',').map(Number);
                    path.unshift({ x, y });
                    curr = cameFrom.get(curr);
                }
                return path;
            }

            closedSet.add(currentKey);

            for (const neighbor of getNeighbors(current.x, current.y)) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(neighborKey)) continue;

                const tentativeG = gScore.get(currentKey) + neighbor.cost;

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + this.distance(neighbor.x, neighbor.y, endX, endY);
                    fScore.set(neighborKey, f);

                    if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push({ x: neighbor.x, y: neighbor.y, f });
                    }
                }
            }
        }

        return null; // No path found
    }
};
