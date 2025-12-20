// Sprite rendering system - generates pixel art characters procedurally

const Sprites = {
    // Skin tone colors
    skinColors: [
        '#FFDBAC', // Light
        '#F1C27D', // Light tan
        '#E0AC69', // Tan
        '#C68642', // Medium
        '#8D5524', // Dark
        '#5C3A21'  // Deep
    ],

    // Hair colors
    hairColors: [
        '#090806', // Black
        '#3D2314', // Dark brown
        '#85461E', // Brown
        '#D4A574', // Light brown
        '#E5C100', // Blonde
        '#B55239', // Red
        '#DEDEDE', // White/Gray
        '#FF6B6B'  // Fantasy pink
    ],

    // Hair styles
    hairStyles: [
        { name: 'Short', draw: 'drawShortHair' },
        { name: 'Long', draw: 'drawLongHair' },
        { name: 'Spiky', draw: 'drawSpikyHair' },
        { name: 'Ponytail', draw: 'drawPonytailHair' },
        { name: 'Bald', draw: 'drawBaldHead' },
        { name: 'Mohawk', draw: 'drawMohawkHair' }
    ],

    // Shirt colors
    shirtColors: [
        '#4A90D9', // Blue
        '#D94A4A', // Red
        '#4AD94A', // Green
        '#D9D94A', // Yellow
        '#9B4AD9', // Purple
        '#FFFFFF', // White
        '#2D2D2D'  // Black
    ],

    // Pants colors
    pantsColors: [
        '#4A5568', // Gray
        '#2D3748', // Dark gray
        '#744210', // Brown
        '#1A365D', // Navy
        '#553C9A', // Purple
        '#22543D'  // Dark green
    ],

    // Draw a complete character
    drawCharacter(ctx, character, x, y, scale = 1, direction = 'down', frame = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const skinColor = this.skinColors[character.skin];
        const hairColor = this.hairColors[character.hairColor];
        const shirtColor = this.shirtColors[character.shirt];
        const pantsColor = this.pantsColors[character.pants];
        const hairStyle = this.hairStyles[character.hairStyle];

        // Animation offset for walking
        const walkOffset = Math.sin(frame * 0.3) * 2;
        const isWalking = frame !== 0;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 46, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw character based on direction
        this.drawBody(ctx, skinColor, shirtColor, pantsColor, direction, isWalking ? walkOffset : 0);
        this.drawHead(ctx, skinColor, direction);
        this.drawFace(ctx, direction);
        this[hairStyle.draw](ctx, hairColor, direction);

        ctx.restore();
    },

    // Draw the body (torso, arms, legs)
    drawBody(ctx, skinColor, shirtColor, pantsColor, direction, walkOffset) {
        // Legs
        ctx.fillStyle = pantsColor;
        if (direction === 'left' || direction === 'right') {
            // Side view legs
            ctx.fillRect(11, 32, 6, 12);
            ctx.fillRect(15, 32 + Math.abs(walkOffset), 6, 12);
        } else {
            // Front/back view legs
            ctx.fillRect(9 - walkOffset/2, 32, 6, 12);
            ctx.fillRect(17 + walkOffset/2, 32, 6, 12);
        }

        // Feet
        ctx.fillStyle = '#4A3728';
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(10, 42, 8, 4);
            ctx.fillRect(14, 42 + Math.abs(walkOffset), 8, 4);
        } else {
            ctx.fillRect(8 - walkOffset/2, 42, 7, 4);
            ctx.fillRect(17 + walkOffset/2, 42, 7, 4);
        }

        // Torso
        ctx.fillStyle = shirtColor;
        ctx.fillRect(8, 20, 16, 14);

        // Arms
        ctx.fillStyle = skinColor;
        if (direction === 'left') {
            ctx.fillRect(4, 21, 5, 10);
        } else if (direction === 'right') {
            ctx.fillRect(23, 21, 5, 10);
        } else {
            // Front/back - both arms visible
            ctx.fillRect(3, 21, 5, 10);
            ctx.fillRect(24, 21, 5, 10);
        }

        // Shirt sleeves over arms
        ctx.fillStyle = shirtColor;
        if (direction === 'left') {
            ctx.fillRect(4, 21, 5, 4);
        } else if (direction === 'right') {
            ctx.fillRect(23, 21, 5, 4);
        } else {
            ctx.fillRect(3, 21, 5, 4);
            ctx.fillRect(24, 21, 5, 4);
        }
    },

    // Draw the head
    drawHead(ctx, skinColor, direction) {
        ctx.fillStyle = skinColor;
        // Head base
        ctx.fillRect(8, 4, 16, 16);

        // Ears (side view)
        if (direction === 'left') {
            ctx.fillRect(5, 9, 3, 5);
        } else if (direction === 'right') {
            ctx.fillRect(24, 9, 3, 5);
        } else if (direction === 'down') {
            // Front view - both ears
            ctx.fillRect(5, 9, 3, 5);
            ctx.fillRect(24, 9, 3, 5);
        }
    },

    // Draw the face
    drawFace(ctx, direction) {
        if (direction === 'up') return; // No face visible from behind

        ctx.fillStyle = '#000';

        if (direction === 'down') {
            // Eyes
            ctx.fillRect(11, 10, 3, 3);
            ctx.fillRect(18, 10, 3, 3);
            // Eye whites
            ctx.fillStyle = '#FFF';
            ctx.fillRect(12, 11, 1, 1);
            ctx.fillRect(19, 11, 1, 1);
            // Mouth
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(14, 15, 4, 2);
        } else if (direction === 'left') {
            // Side face - left
            ctx.fillRect(9, 10, 3, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(9, 11, 1, 1);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(7, 14, 3, 2);
        } else if (direction === 'right') {
            // Side face - right
            ctx.fillRect(20, 10, 3, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(22, 11, 1, 1);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(22, 14, 3, 2);
        }
    },

    // Hair style drawing methods
    drawShortHair(ctx, hairColor, direction) {
        ctx.fillStyle = hairColor;
        ctx.fillRect(7, 2, 18, 6);
        ctx.fillRect(8, 6, 16, 3);

        if (direction === 'left') {
            ctx.fillRect(5, 4, 4, 6);
        } else if (direction === 'right') {
            ctx.fillRect(23, 4, 4, 6);
        } else if (direction === 'down') {
            ctx.fillRect(5, 5, 4, 5);
            ctx.fillRect(23, 5, 4, 5);
        }
    },

    drawLongHair(ctx, hairColor, direction) {
        ctx.fillStyle = hairColor;
        ctx.fillRect(6, 2, 20, 6);
        ctx.fillRect(7, 6, 18, 4);

        if (direction === 'up') {
            ctx.fillRect(5, 8, 22, 18);
        } else {
            // Side hair
            ctx.fillRect(4, 8, 5, 16);
            ctx.fillRect(23, 8, 5, 16);
        }
    },

    drawSpikyHair(ctx, hairColor, direction) {
        ctx.fillStyle = hairColor;
        // Base
        ctx.fillRect(7, 4, 18, 5);

        // Spikes
        for (let i = 0; i < 5; i++) {
            const spikeX = 8 + i * 4;
            ctx.beginPath();
            ctx.moveTo(spikeX, 4);
            ctx.lineTo(spikeX + 2, -2);
            ctx.lineTo(spikeX + 4, 4);
            ctx.fill();
        }

        if (direction !== 'up') {
            ctx.fillRect(6, 5, 3, 5);
            ctx.fillRect(23, 5, 3, 5);
        }
    },

    drawPonytailHair(ctx, hairColor, direction) {
        ctx.fillStyle = hairColor;
        ctx.fillRect(7, 2, 18, 6);
        ctx.fillRect(8, 6, 16, 3);

        // Ponytail in back
        if (direction === 'up' || direction === 'left' || direction === 'right') {
            ctx.fillRect(13, 8, 6, 4);
            ctx.fillRect(14, 12, 4, 8);
            ctx.fillRect(15, 20, 2, 4);
        }
    },

    drawBaldHead(ctx, hairColor, direction) {
        // No hair to draw
    },

    drawMohawkHair(ctx, hairColor, direction) {
        ctx.fillStyle = hairColor;

        // Center mohawk
        for (let i = 0; i < 4; i++) {
            const h = 8 - i * 2;
            ctx.fillRect(14, 2 - i * 2, 4, h);
        }
    },

    // Draw a simple NPC
    drawNPC(ctx, type, x, y, scale = 1, direction = 'down', frame = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const npcConfigs = {
            guide: {
                skin: 0,
                hair: '#DEDEDE',
                hairStyle: 'drawShortHair',
                shirt: '#FFD700',
                pants: '#2D3748'
            },
            combat: {
                skin: 2,
                hair: '#090806',
                hairStyle: 'drawSpikyHair',
                shirt: '#D94A4A',
                pants: '#2D3748'
            },
            fishing: {
                skin: 1,
                hair: '#3D2314',
                hairStyle: 'drawLongHair',
                shirt: '#4A90D9',
                pants: '#744210'
            },
            cooking: {
                skin: 3,
                hair: '#85461E',
                hairStyle: 'drawPonytailHair',
                shirt: '#FFFFFF',
                pants: '#4A5568'
            },
            woodcutting: {
                skin: 4,
                hair: '#3D2314',
                hairStyle: 'drawShortHair',
                shirt: '#22543D',
                pants: '#744210'
            }
        };

        const config = npcConfigs[type] || npcConfigs.guide;
        const skinColor = this.skinColors[config.skin];
        const walkOffset = Math.sin(frame * 0.3) * 2;
        const isWalking = frame !== 0;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 46, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawBody(ctx, skinColor, config.shirt, config.pants, direction, isWalking ? walkOffset : 0);
        this.drawHead(ctx, skinColor, direction);
        this.drawFace(ctx, direction);
        this[config.hairStyle](ctx, config.hair, direction);

        // NPC indicator (yellow dot above head)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(16, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Draw a tile
    drawTile(ctx, type, x, y, size) {
        const tileColors = {
            grass: ['#4a7c23', '#5a8c33', '#3a6c13'],
            water: ['#2980b9', '#3498db', '#2471a3'],
            sand: ['#d4a574', '#c9986a', '#deb584'],
            stone: ['#7f8c8d', '#95a5a6', '#6d7b7c'],
            dirt: ['#8b6914', '#7a5a0a', '#9b7924'],
            wood: ['#8B4513', '#A0522D', '#7B3F00'],
            path: ['#BDB76B', '#CDC673', '#ADAD5C']
        };

        const colors = tileColors[type] || tileColors.grass;
        const colorIndex = (Math.floor(x/size) + Math.floor(y/size)) % colors.length;

        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, size, size);

        // Add some texture
        if (type === 'grass') {
            ctx.fillStyle = colors[(colorIndex + 1) % colors.length];
            for (let i = 0; i < 3; i++) {
                const gx = x + (Math.sin(x * y + i) * 0.5 + 0.5) * (size - 4);
                const gy = y + (Math.cos(x + y + i) * 0.5 + 0.5) * (size - 4);
                ctx.fillRect(gx, gy, 2, 4);
            }
        } else if (type === 'water') {
            // Water shimmer
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            const wx = x + Math.sin(Date.now() / 500 + x) * 2;
            ctx.fillRect(wx + 4, y + 4, size - 8, 2);
        }
    },

    // Draw objects
    drawObject(ctx, type, x, y, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        switch(type) {
            case 'tree':
                // Trunk
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(12, 24, 8, 20);
                // Leaves
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.arc(16, 16, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2E8B2E';
                ctx.beginPath();
                ctx.arc(16, 12, 12, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'rock':
                ctx.fillStyle = '#696969';
                ctx.beginPath();
                ctx.ellipse(16, 20, 14, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#808080';
                ctx.beginPath();
                ctx.ellipse(14, 18, 8, 6, -0.3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'fishing_spot':
                ctx.fillStyle = '#2980b9';
                ctx.beginPath();
                ctx.ellipse(16, 20, 12, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                // Bubbles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(12, 18, 3, 0, Math.PI * 2);
                ctx.arc(20, 16, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'fire':
                // Logs
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(6, 26, 20, 6);
                ctx.fillRect(10, 22, 12, 6);
                // Fire
                const flicker = Math.sin(Date.now() / 100) * 2;
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.moveTo(16, 4 + flicker);
                ctx.lineTo(8, 24);
                ctx.lineTo(24, 24);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(16, 10 + flicker);
                ctx.lineTo(11, 22);
                ctx.lineTo(21, 22);
                ctx.fill();
                break;

            case 'sign':
                // Post
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(14, 16, 4, 20);
                // Sign board
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(4, 4, 24, 14);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(4, 4, 24, 14);
                break;

            case 'chest':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(4, 12, 24, 16);
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(4, 12, 24, 4);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(14, 18, 4, 4);
                break;
        }

        ctx.restore();
    }
};
