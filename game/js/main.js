// Main entry point - Character Creator and Game Initialization

const CharacterCreator = {
    previewCanvas: null,
    previewCtx: null,

    // Current character options
    character: {
        name: '',
        gender: 'male',
        skin: 0,
        hairStyle: 0,
        hairColor: 0,
        shirt: 0,
        pants: 0
    },

    init() {
        this.previewCanvas = document.getElementById('character-preview');
        this.previewCtx = this.previewCanvas.getContext('2d');

        this.setupEventListeners();
        this.updatePreview();
    },

    setupEventListeners() {
        // Name input
        const nameInput = document.getElementById('character-name');
        nameInput.addEventListener('input', (e) => {
            this.character.name = e.target.value;
        });

        // Gender buttons
        document.querySelectorAll('[data-option="gender"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-option="gender"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.character.gender = btn.dataset.value;
                this.updatePreview();
            });
        });

        // Skin color buttons
        document.querySelectorAll('[data-option="skin"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-option="skin"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.character.skin = parseInt(btn.dataset.value);
                this.updatePreview();
            });
        });

        // Hair color buttons
        document.querySelectorAll('[data-option="hairColor"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-option="hairColor"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.character.hairColor = parseInt(btn.dataset.value);
                this.updatePreview();
            });
        });

        // Hair style navigation
        document.getElementById('hair-prev').addEventListener('click', () => {
            this.character.hairStyle = (this.character.hairStyle - 1 + Sprites.hairStyles.length) % Sprites.hairStyles.length;
            document.getElementById('hair-name').textContent = Sprites.hairStyles[this.character.hairStyle].name;
            this.updatePreview();
        });

        document.getElementById('hair-next').addEventListener('click', () => {
            this.character.hairStyle = (this.character.hairStyle + 1) % Sprites.hairStyles.length;
            document.getElementById('hair-name').textContent = Sprites.hairStyles[this.character.hairStyle].name;
            this.updatePreview();
        });

        // Shirt color buttons
        document.querySelectorAll('[data-option="shirt"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-option="shirt"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.character.shirt = parseInt(btn.dataset.value);
                this.updatePreview();
            });
        });

        // Pants color buttons
        document.querySelectorAll('[data-option="pants"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-option="pants"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.character.pants = parseInt(btn.dataset.value);
                this.updatePreview();
            });
        });

        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
    },

    updatePreview() {
        // Clear canvas
        this.previewCtx.fillStyle = '#87CEEB';
        this.previewCtx.fillRect(0, 0, 128, 96);
        this.previewCtx.fillStyle = '#90EE90';
        this.previewCtx.fillRect(0, 96, 128, 96);

        // Draw character at larger scale
        Sprites.drawCharacter(
            this.previewCtx,
            this.character,
            32, // x
            70, // y
            2,  // scale
            'down',
            0
        );
    },

    validateName() {
        const name = this.character.name.trim();
        if (name.length < 1) {
            return 'Adventurer'; // Default name
        }
        if (name.length > 12) {
            return name.substring(0, 12);
        }
        return name;
    },

    startGame() {
        // Validate and set name
        this.character.name = this.validateName();

        // Transfer character data to player
        Player.setCharacter(this.character);

        // Switch screens
        document.getElementById('character-creator').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        // Initialize and start game
        Game.init();
        Game.start();
    }
};

// Start character creator when page loads
window.addEventListener('DOMContentLoaded', () => {
    CharacterCreator.init();
});
