// UI System

const UI = {
    elements: {},
    activePanel: null,

    init() {
        // Cache DOM elements
        this.elements = {
            playerName: document.getElementById('player-name-display'),
            statsPanel: document.getElementById('stats-panel'),
            inventoryPanel: document.getElementById('inventory-panel'),
            inventoryGrid: document.getElementById('inventory-grid'),
            minimapContainer: document.getElementById('minimap-container'),
            chatBox: document.getElementById('chat-box'),
            chatMessages: document.getElementById('chat-messages'),
            dialogueBox: document.getElementById('dialogue-box'),
            npcName: document.getElementById('npc-name'),
            dialogueText: document.getElementById('dialogue-text'),
            dialogueOptions: document.getElementById('dialogue-options'),
            npcPortrait: document.getElementById('npc-portrait'),
            contextMenu: document.getElementById('context-menu'),
            contextOptions: document.getElementById('context-options'),
            tutorialOverlay: document.getElementById('tutorial-overlay'),
            tutorialTitle: document.getElementById('tutorial-title'),
            tutorialText: document.getElementById('tutorial-text'),
            tutorialContinue: document.getElementById('tutorial-continue')
        };

        // Setup inventory grid
        this.setupInventory();

        // Setup action buttons
        this.setupActionButtons();

        // Setup tutorial continue button
        this.elements.tutorialContinue.addEventListener('click', () => {
            Tutorial.advance();
        });

        // Hide context menu on click elsewhere
        document.addEventListener('click', (e) => {
            if (!this.elements.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
    },

    setupInventory() {
        this.elements.inventoryGrid.innerHTML = '';
        for (let i = 0; i < 28; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = i;
            slot.addEventListener('click', () => this.onInventoryClick(i));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.onInventoryRightClick(i, e);
            });
            this.elements.inventoryGrid.appendChild(slot);
        }
    },

    setupActionButtons() {
        document.getElementById('btn-stats').addEventListener('click', () => {
            this.togglePanel('stats');
        });

        document.getElementById('btn-inventory').addEventListener('click', () => {
            this.togglePanel('inventory');
        });

        document.getElementById('btn-map').addEventListener('click', () => {
            this.togglePanel('minimap');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            this.addChatMessage('Settings coming soon!', 'system');
        });
    },

    togglePanel(panel) {
        const panels = {
            stats: this.elements.statsPanel,
            inventory: this.elements.inventoryPanel,
            minimap: this.elements.minimapContainer
        };

        // Hide other panels
        for (const [name, element] of Object.entries(panels)) {
            if (name === panel) {
                element.classList.toggle('visible');
                if (element.classList.contains('visible')) {
                    this.activePanel = panel;
                } else {
                    this.activePanel = null;
                }
            }
        }

        // Update button states
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
        if (this.activePanel) {
            const btnId = `btn-${panel === 'minimap' ? 'map' : panel}`;
            document.getElementById(btnId)?.classList.add('active');
        }
    },

    updatePlayerName(name) {
        this.elements.playerName.textContent = name;
    },

    updateStats() {
        for (const [stat, value] of Object.entries(Player.stats)) {
            const element = document.getElementById(`stat-${stat}`);
            if (element) {
                element.textContent = value;
            }
        }
    },

    updateInventory() {
        const slots = this.elements.inventoryGrid.children;
        for (let i = 0; i < 28; i++) {
            const slot = slots[i];
            const item = Player.inventory[i];

            if (item) {
                slot.textContent = item.icon || '📦';
                slot.classList.add('filled');
                slot.title = item.name;
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
                slot.title = '';
            }
        }
    },

    onInventoryClick(slotIndex) {
        const item = Player.inventory[slotIndex];
        if (item) {
            this.addChatMessage(`${item.name}`, 'system');
        }
    },

    onInventoryRightClick(slotIndex, event) {
        const item = Player.inventory[slotIndex];
        if (!item) return;

        const options = [
            { label: 'Use', action: () => this.useItem(slotIndex) },
            { label: 'Examine', action: () => this.examineItem(slotIndex) },
            { label: 'Drop', action: () => this.dropItem(slotIndex) }
        ];

        this.showContextMenu(event.clientX, event.clientY, options);
    },

    useItem(slotIndex) {
        const item = Player.inventory[slotIndex];
        if (!item) return;

        if (item.id === 'cooked_shrimp') {
            Player.stats.hitpoints = Math.min(Player.stats.hitpoints + 3, 10);
            Player.removeFromInventory(slotIndex);
            this.addChatMessage('You eat the shrimp. It heals 3 hitpoints.', 'system');
            this.updateStats();
        } else {
            this.addChatMessage(`You can't use that right now.`, 'system');
        }
    },

    examineItem(slotIndex) {
        const item = Player.inventory[slotIndex];
        if (item) {
            this.addChatMessage(`${item.name}: A useful item.`, 'system');
        }
    },

    dropItem(slotIndex) {
        const item = Player.inventory[slotIndex];
        if (item) {
            Player.removeFromInventory(slotIndex);
            this.addChatMessage(`You drop the ${item.name}.`, 'system');
        }
    },

    addChatMessage(message, type = 'normal') {
        const msgElement = document.createElement('div');
        msgElement.className = `chat-message ${type}`;
        msgElement.textContent = message;
        this.elements.chatMessages.appendChild(msgElement);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;

        // Limit messages
        while (this.elements.chatMessages.children.length > 50) {
            this.elements.chatMessages.removeChild(this.elements.chatMessages.firstChild);
        }
    },

    showDialogue(npcName, text, options = [], npcType = 'guide') {
        this.elements.dialogueBox.classList.remove('hidden');
        this.elements.npcName.textContent = npcName;
        this.elements.dialogueText.textContent = text;

        // Set NPC portrait
        const portraits = {
            guide: '👴',
            combat: '⚔️',
            fishing: '🎣',
            cooking: '👨‍🍳',
            woodcutting: '🪓'
        };
        this.elements.npcPortrait.textContent = portraits[npcType] || '👤';

        // Clear and add options
        this.elements.dialogueOptions.innerHTML = '';
        for (const option of options) {
            const btn = document.createElement('button');
            btn.className = 'dialogue-option';
            btn.textContent = option.text;
            btn.addEventListener('click', () => {
                if (option.action) option.action();
            });
            this.elements.dialogueOptions.appendChild(btn);
        }
    },

    hideDialogue() {
        this.elements.dialogueBox.classList.add('hidden');
    },

    showContextMenu(x, y, options) {
        this.elements.contextOptions.innerHTML = '';

        for (const option of options) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="option-action">${option.label}</span>`;
            li.addEventListener('click', () => {
                option.action();
                this.hideContextMenu();
            });
            this.elements.contextOptions.appendChild(li);
        }

        this.elements.contextMenu.style.left = `${x}px`;
        this.elements.contextMenu.style.top = `${y}px`;
        this.elements.contextMenu.classList.remove('hidden');
    },

    hideContextMenu() {
        this.elements.contextMenu.classList.add('hidden');
    },

    showTutorial(title, text) {
        this.elements.tutorialTitle.textContent = title;
        this.elements.tutorialText.textContent = text;
        this.elements.tutorialOverlay.classList.remove('hidden');
    },

    hideTutorial() {
        this.elements.tutorialOverlay.classList.add('hidden');
    }
};
