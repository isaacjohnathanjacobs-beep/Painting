// Resene Colors Database
const reseneColors = {
  // Core existing colors
  'Resene Alabaster': '#F5F4F1', 'Resene Half Alabaster': '#FAF9F7', 'Resene Black White': '#EBE9E5',
  'Resene Sea Fog': '#E9E7E3', 'Resene Merino': '#E9E6DF', 'Resene Bianca': '#F3EFE6',
  'Resene White Pointer': '#E5E1DA', 'Resene Thorndon Cream': '#DAD5C9', 'Resene Pearl Lusta': '#F2EAD9',
  'Resene Concrete': '#C2C1BD', 'Resene Half Concrete': '#D1D0CC', 'Resene Silver Chalice': '#BEBDBA',
  'Resene Tea': '#BFB5A2', 'Resene Half Tea': '#D9D2C7', 'Resene Truffle': '#BEB9AD',
  'Resene Duck Egg Blue': '#C4CBC8', 'Resene Carefree': '#B7D4CD', 'Resene Fossil': '#D9D1C3',
  'Resene Pohutukawa': '#893C3F', 'Resene Keppel': '#3AB09E', 'Resene Ironsand': '#2D2926',
  'Resene Foundry': '#2C2F38',

  // NEUTRALS & OFF-WHITES
  'Resene Half Bianca': '#F7F3EA', 'Resene Quarter Bianca': '#FAF7F0', 'Resene Half Thorndon Cream': '#E4DED4',
  'Resene Double Thorndon Cream': '#CFC8B9', 'Resene Half Pearl Lusta': '#F0E8D7', 'Resene Double Pearl Lusta': '#E7DCC5',
  'Resene Soapstone': '#EFE9DE', 'Resene Solitaire': '#F5EAD7', 'Resene Villa White': '#EDE8DE',
  'Resene Half Villa White': '#F1EEE7', 'Resene Orchid White': '#F7F0E6', 'Resene Half Orchid White': '#F8F4ED',
  'Resene Quarter Spanish White': '#F4EDE1', 'Resene Siesta': '#EFE6D7', 'Resene Baroque': '#E2DACF',
  'Resene Half Biscotti': '#E8DFD3', 'Resene Double Biscotti': '#D8CEBF', 'Resene Milk White': '#EFEDE4',
  'Resene Quarter Merino': '#F1EEE7', 'Resene Double Black White': '#E6E3DD',

  // LIGHT GREYS & CONTEMPORARY NEUTRALS
  'Resene Wan White': '#E7E7E4', 'Resene Quarter Wan White': '#EFEFEC', 'Resene Quarter Geyser': '#E2E6E7',
  'Resene Geyser': '#D9DDDE', 'Resene Skinny Dip': '#DDD7C8', 'Resene Quarter Tea': '#E6E0D6',
  'Resene Triple Concrete': '#AFAFA9', 'Resene Half Fog': '#D4D6D4', 'Resene Fog': '#CBCDCB',
  'Resene Quarter Fog': '#E1E3E1', 'Resene Half Silver Chalice': '#CDCDCA', 'Resene Quarter Silver Chalice': '#E2E2E0',
  'Resene Quarter Stack': '#D2D3D0', 'Resene Westar': '#DCD7CF', 'Resene Parchment': '#DCD4C7',
  'Resene Half Tana': '#DDDFCD', 'Resene Half Napa': '#BFBAB1', 'Resene Half Surrender': '#DCDFE0',
  'Resene Ghost': '#DDE1E3', 'Resene Concrete Mixer': '#D5D5D3',

  // MEDIUM GREYS & URBAN TONES
  'Resene Mid Grey': '#7F7F7A', 'Resene Quarter Friar Grey': '#D0CCC3', 'Resene Half Friar Grey': '#A8A59D',
  'Resene Triple Friar Grey': '#5F5A52', 'Resene Iron Sand': '#4B4A44', 'Resene Tuna': '#484B51',
  'Resene Shuttle Grey': '#5F646A', 'Resene Dove Grey': '#7C7C76', 'Resene Scarpa Flow': '#7A7D7F',
  'Resene Quarter Scarpa Flow': '#D0D1D2', 'Resene Double Stack': '#6E706C', 'Resene Triple Stack': '#4C4D49',
  'Resene Cloudy': '#BFC4C7', 'Resene Dolphin Grey': '#787D82', 'Resene Spun Pearl': '#ACA9AD',
  'Resene Eighth Delta': '#EBEBE6', 'Resene Double Delta': '#A9A8A2', 'Resene Half Regent Grey': '#A4ABB1',
  'Resene Quarter Regent Grey': '#CCD1D6',

  // BROWNS / WARM EXTERIOR COLOURS
  'Resene Brown Sugar': '#A68A76', 'Resene Double Brown Sugar': '#8C6E5B', 'Resene Zorba': '#AFA397',
  'Resene Triple Zorba': '#8D8379', 'Resene Biscotti': '#DCCBBD', 'Resene Drought': '#C0A98A',
  'Resene Possessed': '#8A6346', 'Resene Kenya': '#7A5C46', 'Resene Double Stonehenge': '#666259',
  'Resene Stonehenge': '#7C776C', 'Resene Double Gravel': '#4A4743', 'Resene Gravel': '#625E58',
  'Resene Felix': '#6B5749', 'Resene Yuma': '#CDC3A7', 'Resene Tapa': '#767B6D',
  'Resene Double Tapa': '#5D6156', 'Resene Triple Tapa': '#464941', 'Resene Quarter Stonehenge': '#D8D4C8',
  'Resene Makara': '#A08D63', 'Resene Colins Wicket': '#7B6B47',

  // BLUES
  'Resene Coast': '#2E4858', 'Resene Endeavour': '#005C8A', 'Resene San Marino': '#4F6D8A',
  'Resene Horizon': '#7F8FA7', 'Resene Kashmir Blue': '#556C8C', 'Resene Mako': '#505459',
  'Resene Biscay': '#2E3F4F', 'Resene Lazy River': '#A7C0C8', 'Resene Breeze': '#C5DDE2',
  'Resene Escape': '#B8D1DC', 'Resene Half Escape': '#D8E7EC', 'Resene Nebula': '#C3D6D0',
  'Resene Half Cut Glass': '#DAE8E6', 'Resene Cut Glass': '#C7DDDA', 'Resene Kashmir': '#415A77',
  'Resene Rhino': '#3D4D59', 'Resene Watermark': '#96B6C8', 'Resene Half Gull Grey': '#CED6DB',
  'Resene Double Gull Grey': '#ABB4BA', 'Resene Astronaut': '#283A57',

  // GREENS
  'Resene Mantle': '#A3B5A6', 'Resene Double Mantle': '#839786', 'Resene Pewter': '#889094',
  'Resene Xanadu': '#788F8F', 'Resene Robin Egg Blue': '#A0C8C9', 'Resene Peace': '#C6D5CC',
  'Resene Ashanti': '#9EC2B3', 'Resene Kandinsky': '#7FA291', 'Resene Lemon Grass': '#999E68',
  'Resene Triple Lemon Grass': '#868C58', 'Resene Half Kumutoto': '#B7D9D3', 'Resene Kumutoto': '#89C4BC',
  'Resene Edgewater': '#CFE4DD', 'Resene Aqua': '#AFCED4', 'Resene Half Opal': '#A9C1BC',
  'Resene Tasman': '#AAB8A2', 'Resene Paddock': '#5D735A', 'Resene Verdun Green': '#487642',
  'Resene Hemlock': '#A8B09B', 'Resene Coriander': '#BFCABA',

  // FEATURE COLOURS / ACCENTS
  'Resene Pohutukawa Dark': '#7A3335', 'Resene Havoc': '#A52F2B', 'Resene Pohutukawa Light': '#9E474B',
  'Resene Smitten': '#C73862', 'Resene Plum': '#662B47', 'Resene Aubergine': '#462237',
  'Resene Hot Chile': '#8A2C23', 'Resene Bright Red': '#D82927', 'Resene Clockwork Orange': '#D16326',
  'Resene Ecstasy': '#F07C3E', 'Resene West Side': '#FF9835', 'Resene Turbo': '#F7C400',
  'Resene Wild Thing': '#ECB900', 'Resene Stinger': '#7C8A28', 'Resene Limerick': '#58A01C',
  'Resene Crusoe': '#2A6E4F', 'Resene Blue Lagoon': '#01757A', 'Resene Malibu': '#7CCCE5',
  'Resene Curious Blue': '#2596C1', 'Resene Endeavour Light': '#4FA1C8',

  'Choose colour': '#f3f4f6'
};

const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Hallway', 'Dining Room', 'Laundry', 'Garage', 'Office/Study'];
const exteriorTypes = ['House Walls', 'Deck', 'Fence', 'Roof', 'Garage', 'Shed'];
const claddingTypes = ['Weatherboard', 'Brick', 'Plaster/Stucco', 'Fibre Cement', 'Concrete Block'];
const trimLabels = {basic: 'Basic Trim', rounded: 'Rounded Trim (+25%)', colonial: 'Colonial Trim (+75%)'};
const condLabels = {excellent: 'Excellent (-5%)', good: 'Good Condition', fair: 'Fair (+30%)', poor: 'Poor (+70%)'};

let rooms = [], exteriors = [];

function getColorHex(colorName) {
  return reseneColors[colorName] || '#FFFFFF';
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
  document.getElementById(tab + '-tab').classList.add('active');
  document.querySelector('.' + tab + '-tab').classList.add('active');
}

function toggleColorGrid(elementId, forceState = null) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const isActive = container.classList.contains('active');
  const newState = forceState !== null ? forceState : !isActive;

  document.querySelectorAll('.color-grid-container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.color-selector-toggle').forEach(el => el.classList.remove('active'));

  if (newState) {
    container.classList.add('active');
    const toggle = container.previousElementSibling;
    if (toggle && toggle.classList.contains('color-selector-toggle')) {
      toggle.classList.add('active');
    }
  }
}

function createColorGrid(currentColor, fieldName, itemId, type) {
  const colorCategories = {
    'Popular Whites & Off-Whites': ['Resene Alabaster', 'Resene Half Alabaster', 'Resene Black White', 'Resene Double Black White', 'Resene Sea Fog', 'Resene Merino', 'Resene Quarter Merino', 'Resene Bianca', 'Resene Half Bianca', 'Resene Quarter Bianca', 'Resene Villa White', 'Resene Half Villa White', 'Resene Orchid White', 'Resene Half Orchid White', 'Resene Milk White'],

    'Warm Neutrals & Creams': ['Resene Thorndon Cream', 'Resene Half Thorndon Cream', 'Resene Double Thorndon Cream', 'Resene Pearl Lusta', 'Resene Half Pearl Lusta', 'Resene Double Pearl Lusta', 'Resene Quarter Spanish White', 'Resene Soapstone', 'Resene Solitaire', 'Resene Siesta', 'Resene Baroque', 'Resene Half Biscotti', 'Resene Double Biscotti'],

    'Contemporary Light Greys': ['Resene Concrete', 'Resene Half Concrete', 'Resene Triple Concrete', 'Resene Wan White', 'Resene Quarter Wan White', 'Resene Geyser', 'Resene Quarter Geyser', 'Resene Fog', 'Resene Half Fog', 'Resene Quarter Fog', 'Resene Ghost', 'Resene Concrete Mixer', 'Resene Westar'],

    'Modern Medium Greys': ['Resene Silver Chalice', 'Resene Half Silver Chalice', 'Resene Quarter Silver Chalice', 'Resene Mid Grey', 'Resene Dove Grey', 'Resene Cloudy', 'Resene Spun Pearl', 'Resene Quarter Stack', 'Resene Double Stack', 'Resene Quarter Scarpa Flow', 'Resene Scarpa Flow'],

    'Sophisticated Dark Greys': ['Resene Triple Stack', 'Resene Quarter Friar Grey', 'Resene Half Friar Grey', 'Resene Triple Friar Grey', 'Resene Iron Sand', 'Resene Tuna', 'Resene Shuttle Grey', 'Resene Dolphin Grey', 'Resene Half Regent Grey', 'Resene Quarter Regent Grey'],

    'Warm Beiges & Earth Tones': ['Resene Tea', 'Resene Half Tea', 'Resene Quarter Tea', 'Resene Truffle', 'Resene Skinny Dip', 'Resene Parchment', 'Resene Half Tana', 'Resene Half Napa', 'Resene Half Surrender', 'Resene Fossil'],

    'Natural Browns & Warm Exteriors': ['Resene Brown Sugar', 'Resene Double Brown Sugar', 'Resene Zorba', 'Resene Triple Zorba', 'Resene Biscotti', 'Resene Drought', 'Resene Possessed', 'Resene Kenya', 'Resene Stonehenge', 'Resene Double Stonehenge', 'Resene Quarter Stonehenge', 'Resene Gravel', 'Resene Double Gravel', 'Resene Felix', 'Resene Yuma', 'Resene Makara', 'Resene Colins Wicket'],

    'Traditional Exterior Darks': ['Resene Tapa', 'Resene Double Tapa', 'Resene Triple Tapa', 'Resene Ironsand', 'Resene Foundry'],

    'Blues & Coastal Tones': ['Resene Coast', 'Resene Endeavour', 'Resene Endeavour Light', 'Resene San Marino', 'Resene Horizon', 'Resene Kashmir Blue', 'Resene Kashmir', 'Resene Mako', 'Resene Biscay', 'Resene Rhino', 'Resene Astronaut', 'Resene Lazy River', 'Resene Breeze', 'Resene Escape', 'Resene Half Escape', 'Resene Watermark', 'Resene Half Gull Grey', 'Resene Double Gull Grey', 'Resene Curious Blue', 'Resene Malibu'],

    'Soft Aquas & Spa Colors': ['Resene Duck Egg Blue', 'Resene Robin Egg Blue', 'Resene Carefree', 'Resene Nebula', 'Resene Half Cut Glass', 'Resene Cut Glass', 'Resene Half Kumutoto', 'Resene Kumutoto', 'Resene Edgewater', 'Resene Aqua', 'Resene Half Opal', 'Resene Blue Lagoon'],

    'Natural Greens': ['Resene Mantle', 'Resene Double Mantle', 'Resene Pewter', 'Resene Xanadu', 'Resene Peace', 'Resene Ashanti', 'Resene Kandinsky', 'Resene Tasman', 'Resene Paddock', 'Resene Verdun Green', 'Resene Hemlock', 'Resene Coriander', 'Resene Lemon Grass', 'Resene Triple Lemon Grass'],

    'Bold Feature & Accent Colors': ['Resene Pohutukawa', 'Resene Pohutukawa Dark', 'Resene Pohutukawa Light', 'Resene Havoc', 'Resene Smitten', 'Resene Plum', 'Resene Aubergine', 'Resene Hot Chile', 'Resene Bright Red', 'Resene Clockwork Orange', 'Resene Ecstasy', 'Resene West Side', 'Resene Turbo', 'Resene Wild Thing', 'Resene Stinger', 'Resene Limerick', 'Resene Crusoe', 'Resene Keppel']
  };

  let gridHtml = '<div class="color-grid">';

  const isClearSelected = currentColor === 'Choose colour';
  gridHtml += `<div class="color-option clear-option ${isClearSelected ? 'selected' : ''}"
                    onclick="updateItem(${itemId}, '${fieldName}', 'Choose colour', '${type}'); toggleColorGrid('${itemId}-${fieldName}', false)">
                 <div class="color-tooltip">Clear Selection</div>
                 <div class="color-name" style="color: #64748b; font-weight: 600;">Clear</div>
               </div>`;

  Object.entries(colorCategories).forEach(([category, colors]) => {
    colors.forEach(color => {
      const colorHex = getColorHex(color);
      const isSelected = color === currentColor;
      const shortName = color.replace('Resene ', '').replace('Quarter ', 'Qtr ').replace('Half ', '1/2 ').replace('Double ', 'Dbl ').replace('Triple ', '3x ');
      const displayName = shortName.length > 16 ? shortName.substring(0, 14) + '...' : shortName;

      gridHtml += `<div class="color-option ${isSelected ? 'selected' : ''}"
                        style="background-color: ${colorHex};"
                        onclick="updateItem(${itemId}, '${fieldName}', '${color}', '${type}'); toggleColorGrid('${itemId}-${fieldName}', false)">
                     <div class="color-tooltip">${color}</div>
                     <div class="color-name">${displayName}</div>
                   </div>`;
    });
  });

  gridHtml += '</div>';
  return gridHtml;
}

function createRoomPreview(room) {
  const wallColor = getColorHex(room.wallColor);
  const ceilingColor = getColorHex(room.ceilingColor);

  return `
    <div class="room-preview">
      <div class="preview-label">Room Color Preview</div>
      <div class="room-3d">
        <div class="wall-back" style="background: ${wallColor};"></div>
        <div class="wall-right" style="background: ${wallColor};"></div>
        <div class="floor"></div>
        <div class="ceiling" style="background: ${ceilingColor};"></div>
      </div>

      <div class="color-legend">
        <div class="legend-item">
          <div class="legend-swatch" style="background: ${wallColor};"></div>
          <span>Walls: ${room.wallColor === 'Choose colour' ? 'TBD' : room.wallColor.replace('Resene ', '')}</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: ${ceilingColor};"></div>
          <span>Ceiling: ${room.ceilingColor === 'Choose colour' ? 'TBD' : room.ceilingColor.replace('Resene ', '')}</span>
        </div>
      </div>
    </div>`;
}

function calcRoom(r) {
  if(!r.length || !r.width) return 0;
  const l = +r.length, w = +r.width, h = +r.ceilingHeight;
  const floor = l * w, walls = 2 * (l + w) * h, ceil = floor, peri = 2 * (l + w);
  let p = 0;

  // Calculate premiums (additive, not multiplicative)
  const hPremium = h >= 3.6 ? 0.4 : h >= 3 ? 0.2 : h >= 2.7 ? 0.1 : 0;
  const rPremium = {Kitchen: 0.2, Bathroom: 0.25, Laundry: 0.15}[r.type] || 0;

  if(r.selectedTasks['Paint walls']) p += walls * 32;
  if(r.selectedTasks['Paint ceiling']) p += ceil * 36;
  if(r.selectedTasks['Paint skirting/coving']) {
    const tr = {basic: 10, rounded: 13, colonial: 18};
    p += peri * (tr[r.trimType] || 10);
  }
  if(r.selectedTasks['Paint doors']) p += 165;
  if(r.selectedTasks['Paint windows']) p += 95;
  if(r.selectedTasks['Paint cabinets']) p += floor * 0.2 * 48;
  if(r.selectedTasks['Remove wallpaper']) p += walls * 18;

  const cdPremium = {excellent: -0.05, good: 0, fair: 0.3, poor: 0.7}[r.condition];
  const coPremium = r.coats === '3' ? 0.35 : 0;

  // Apply all premiums additively
  p *= (1 + hPremium + rPremium + cdPremium + coPremium);
  return Math.round(p);
}

function calcExt(e) {
  let p = 0;

  // Calculate premiums (additive, not multiplicative)
  const cdPremium = {excellent: -0.1, good: 0, fair: 0.35, poor: 0.8}[e.condition];
  const coPremium = e.coats === '3' ? 0.35 : 0;
  const scPremium = e.scaffolding ? 0.25 : 0;
  const stPremium = +e.height === 2 ? 0.3 : +e.height >= 3 ? 0.5 : 0;

  if(e.type === 'House Walls') {
    const a = +e.area || 0;
    const clRates = {Weatherboard: 42, Brick: 52, 'Plaster/Stucco': 58, 'Fibre Cement': 46, 'Concrete Block': 48};
    if(e.selectedTasks['Paint walls']) p += a * (clRates[e.cladding] || 42);
    if(e.selectedTasks['Fascia/soffits']) p += a * 0.15 * 38;
    if(e.selectedTasks['Gutters/downpipes']) p += a * 0.1 * 32;
    if(e.selectedTasks['Window frames']) p += Math.ceil(a / 15) * 105;
    if(e.selectedTasks['Exterior doors']) p += 235;
  } else if(e.type === 'Deck') {
    const a = +e.deckArea || 0;
    if(e.selectedTasks['Stain/oil deck']) p += a * 16;
    if(e.selectedTasks['Paint deck']) p += a * 25;
    if(e.selectedTasks['Balustrades']) p += Math.sqrt(a) * 3 * 14;
  } else if(e.type === 'Fence') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint fence']) p += a * 31;
    if(e.selectedTasks['Stain fence']) p += a * 19;
  } else if(e.type === 'Garage' || e.type === 'Shed') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint walls']) p += a * 38;
    if(e.selectedTasks['Paint trim']) p += a * 0.12 * 24;
    if(e.selectedTasks['Paint doors']) p += 160;
  } else if(e.type === 'Roof') {
    const a = +e.area || 0;
    const roofPremium = e.roofType === 'Metal' ? 0.2 : e.roofType === 'Tile' ? 0.35 : 0;
    if(e.selectedTasks['Paint roof']) p += a * 40;
    // Apply roof premium separately for roof jobs
    p *= (1 + roofPremium);
  }

  // Apply all premiums additively (except roof which was already applied)
  if(e.type !== 'Roof') {
    p *= (1 + cdPremium + coPremium + scPremium + stPremium);
  } else {
    p *= (1 + cdPremium + coPremium + scPremium + stPremium);
  }

  return Math.round(p);
}

function calcAll() {
  const iT = rooms.reduce((s, r) => s + calcRoom(r), 0);
  const eT = exteriors.reduce((s, e) => s + calcExt(e), 0);
  const t = iT + eT;

  document.getElementById('total-price').textContent = t.toLocaleString();
  document.getElementById('min-price').textContent = Math.round(t * 0.95).toLocaleString();
  document.getElementById('max-price').textContent = Math.round(t * 1.08).toLocaleString();
  document.getElementById('interior-subtotal').textContent = iT.toLocaleString();
  document.getElementById('exterior-subtotal').textContent = eT.toLocaleString();

  let iRows = '';
  rooms.forEach((r, i) => {
    const p = calcRoom(r);
    if(p === 0) return;
    const tasks = Object.keys(r.selectedTasks).filter(t => r.selectedTasks[t]).map(t => {
      let taskName;
      let color = '';

      if (t === 'Remove wallpaper') {
        taskName = 'wallpaper removal';
      } else {
        taskName = t.replace('Paint ', '').toLowerCase();

        if (t === 'Paint walls' && r.wallColor && r.wallColor !== 'Choose colour') {
          color = ` (${r.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Paint ceiling' && r.ceilingColor && r.ceilingColor !== 'Choose colour') {
          color = ` (${r.ceilingColor.replace('Resene ', '')})`;
        } else if (t === 'Paint skirting/coving' && r.trimColor && r.trimColor !== 'Choose colour') {
          color = ` (${r.trimColor.replace('Resene ', '')})`;
        } else if (t === 'Paint doors' && r.doorColor && r.doorColor !== 'Choose colour') {
          color = ` (${r.doorColor.replace('Resene ', '')})`;
        } else if (t === 'Paint windows' && r.windowColor && r.windowColor !== 'Choose colour') {
          color = ` (${r.windowColor.replace('Resene ', '')})`;
        } else if (t === 'Paint cabinets' && r.cabinetColor && r.cabinetColor !== 'Choose colour') {
          color = ` (${r.cabinetColor.replace('Resene ', '')})`;
        }
      }

      return taskName + color;
    }).join(', ') || '—';
    iRows += `<tr><td><b>${r.type}</b></td><td>${r.length}×${r.width}m</td><td class="task-detail">${tasks}</td><td><b>$${p.toLocaleString()}</b></td></tr>`;
  });

  let eRows = '';
  exteriors.forEach((e, i) => {
    const p = calcExt(e);
    if(p === 0) return;
    const tasks = Object.keys(e.selectedTasks).filter(t => e.selectedTasks[t]).map(t => {
      let taskName = t.replace('Paint ', '').toLowerCase();
      let color = '';

      if (e.type === 'House Walls') {
        if (t === 'Paint walls' && e.wallColor && e.wallColor !== 'Choose colour') {
          color = ` (${e.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Fascia/soffits' && e.fasciaColor && e.fasciaColor !== 'Choose colour') {
          color = ` (${e.fasciaColor.replace('Resene ', '')})`;
        } else if (t === 'Gutters/downpipes' && e.gutterColor && e.gutterColor !== 'Choose colour') {
          color = ` (${e.gutterColor.replace('Resene ', '')})`;
        } else if (t === 'Window frames' && e.windowColor && e.windowColor !== 'Choose colour') {
          color = ` (${e.windowColor.replace('Resene ', '')})`;
        } else if (t === 'Exterior doors' && e.doorColor && e.doorColor !== 'Choose colour') {
          color = ` (${e.doorColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Deck') {
        if (t === 'Paint deck' && e.deckColor && e.deckColor !== 'Choose colour') {
          color = ` (${e.deckColor.replace('Resene ', '')})`;
        } else if (t === 'Balustrades' && e.balustradeColor && e.balustradeColor !== 'Choose colour') {
          color = ` (${e.balustradeColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Fence') {
        if ((t === 'Paint fence' || t === 'Stain fence') && e.fenceColor && e.fenceColor !== 'Choose colour') {
          color = ` (${e.fenceColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Garage' || e.type === 'Shed') {
        if (t === 'Paint walls' && e.wallColor && e.wallColor !== 'Choose colour') {
          color = ` (${e.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Paint trim' && e.trimColor && e.trimColor !== 'Choose colour') {
          color = ` (${e.trimColor.replace('Resene ', '')})`;
        } else if (t === 'Paint doors' && e.doorColor && e.doorColor !== 'Choose colour') {
          color = ` (${e.doorColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Roof') {
        if (t === 'Paint roof' && e.roofColor && e.roofColor !== 'Choose colour') {
          color = ` (${e.roofColor.replace('Resene ', '')})`;
        }
      }

      return taskName + color;
    }).join(', ') || '—';

    let sz;
    if(e.type === 'House Walls') {
      sz = `${e.area}m² ${e.cladding}`;
    } else if(e.type === 'Deck') {
      sz = `${e.deckArea}m²`;
    } else if(e.type === 'Roof') {
      sz = `${e.area}m² ${e.roofType || 'Metal'}`;
    } else {
      sz = `${e.area}m²`;
    }

    eRows += `<tr><td><b>${e.type}</b></td><td>${sz}</td><td class="task-detail">${tasks}</td><td><b>$${p.toLocaleString()}</b></td></tr>`;
  });

  document.getElementById('interior-table').innerHTML = iRows || '<tr><td colspan="4" style="text-align:center;color:#888;">No interior rooms added</td></tr>';
  document.getElementById('exterior-table').innerHTML = eRows || '<tr><td colspan="4" style="text-align:center;color:#888;">No exterior areas added</td></tr>';
  document.getElementById('interior-summary').style.display = iT > 0 ? 'block' : 'none';
  document.getElementById('exterior-summary').style.display = eT > 0 ? 'block' : 'none';
  document.getElementById('estimate-section').style.display = t > 0 ? 'block' : 'none';
}

function renderRooms() {
  document.getElementById('rooms-container').innerHTML = rooms.map((r, i) => {
    const allTasks = [
      {n: 'Paint walls', c: 'wallColor', types: ['all']},
      {n: 'Remove wallpaper', c: null, prep: true, types: ['all']},
      {n: 'Paint ceiling', c: 'ceilingColor', types: ['all']},
      {n: 'Paint skirting/coving', c: 'trimColor', trim: true, types: ['all']},
      {n: 'Paint doors', c: 'doorColor', types: ['all']},
      {n: 'Paint windows', c: 'windowColor', types: ['all']},
      {n: 'Paint cabinets', c: 'cabinetColor', types: ['Kitchen', 'Laundry', 'Bathroom']}
    ];

    const tasks = allTasks.filter(task =>
      task.types.includes('all') || task.types.includes(r.type)
    );

    const taskHtml = tasks.map(t => {
      const sel = r.selectedTasks[t.n];
      const colorHex = t.c ? getColorHex(r[t.c]) : null;
      return `
        <div class="task-box${sel ? ' selected' : ''}" onclick="toggleTask(${r.id},'${t.n}')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${sel ? ' checked' : ''} onchange="toggleTask(${r.id},'${t.n}')"> ${t.n}
          </label>
          ${sel && t.c ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${r.id}-${t.c}')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${colorHex};"></div>
                  <span>${r[t.c]}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${r.id}-${t.c}" class="color-grid-container">
                ${createColorGrid(r[t.c], t.c, r.id, 'room')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
              ${t.trim ? `
                <label style="margin-top:.8rem;">Trim Style</label>
                <select onchange="updateItem(${r.id},'trimType',this.value,'room')">
                  ${Object.entries(trimLabels).map(([v,l]) => `<option value="${v}"${r.trimType === v ? ' selected' : ''}>${l}</option>`).join('')}
                </select>
              ` : ''}
            </div>
          ` : ''}
          ${sel && t.prep ? `
            <div class="prep-work-info" onclick="event.stopPropagation()" style="margin-top: 0.5rem;">
              <small style="color: #666; font-style: italic;">✓ Includes surface preparation and cleanup</small>
            </div>
          ` : ''}
        </div>`;
    }).join('');

    return `
      <div class="room-card">
        <div class="room-header">
          <h3 class="room-title">Room ${i + 1}</h3>
          <button class="btn-delete" onclick="removeItem(${r.id}, 'room')">✕</button>
        </div>
        <div class="grid grid-4">
          <div><label>Room Type</label><select onchange="updateItem(${r.id},'type',this.value,'room')">${roomTypes.map(v => `<option value="${v}"${r.type === v ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
          <div><label>Length (m)</label><input type="number" step="0.1" value="${r.length}" onchange="updateItem(${r.id},'length',this.value,'room')"></div>
          <div><label>Width (m)</label><input type="number" step="0.1" value="${r.width}" onchange="updateItem(${r.id},'width',this.value,'room')"></div>
          <div><label>Ceiling Height</label>
            <select onchange="updateItem(${r.id},'ceilingHeight',this.value,'room')">
              <option value="2.4"${r.ceilingHeight === '2.4' ? ' selected' : ''}>2.4m (Standard)</option>
              <option value="2.7"${r.ceilingHeight === '2.7' ? ' selected' : ''}>2.7m</option>
              <option value="3.0"${r.ceilingHeight === '3.0' ? ' selected' : ''}>3.0m</option>
              <option value="3.6"${r.ceilingHeight === '3.6' ? ' selected' : ''}>3.6m+</option>
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div><label>Surface Condition
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Surface condition determines preparation requirements:
- Excellent: Light filling and sanding, ready to paint
- Good: Standard filling, sanding and minor touch-up work
- Fair: Some scraping, filling, sanding and spot priming needed
- Poor: Major scraping, extensive filling, sanding, full priming required</span>
            </span>
          </label><select onchange="updateItem(${r.id},'condition',this.value,'room')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${r.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${r.id},'coats',this.value,'room')">
              <option value="2"${r.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${r.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>
        <div class="section-header">Select painting tasks</div>
        ${taskHtml}
        ${Object.keys(r.selectedTasks).some(task => r.selectedTasks[task]) ? createRoomPreview(r) : ''}
      </div>`;
  }).join('');
  calcAll();
}

function renderExteriors() {
  document.getElementById('exterior-container').innerHTML = exteriors.map((e, i) => {
    let fields, taskHtml;

    if(e.type === 'House Walls') {
      fields = `
        <div class="grid grid-4">
          <div><label>Cladding Type</label><select onchange="updateItem(${e.id},'cladding',this.value,'exterior')">${claddingTypes.map(v => `<option value="${v}"${e.cladding === v ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
          <div><label>Wall Area (m²)
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Total external wall surface area to be painted. Measure height × width of each wall, add them together, then subtract doors/windows. Example: Front (6m×3m) + Back (6m×3m) + Left (8m×3m) + Right (8m×3m) = 84m²</span>
            </span>
          </label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Building Height</label>
            <select onchange="updateItem(${e.id},'height',this.value,'exterior')">
              <option value="1"${e.height === '1' ? ' selected' : ''}>Single storey</option>
              <option value="2"${e.height === '2' ? ' selected' : ''}>Two storey (+30%)</option>
              <option value="3"${e.height === '3' ? ' selected' : ''}>Three+ storey (+50%)</option>
            </select>
          </div>
          <div><label>Scaffolding</label>
            <select onchange="updateItem(${e.id},'scaffolding',this.value==='true','exterior')">
              <option value="false"${!e.scaffolding ? ' selected' : ''}>No</option>
              <option value="true"${e.scaffolding ? ' selected' : ''}>Yes (+25%)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div><label>Surface Condition
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Surface condition determines preparation requirements:
- Excellent: Light filling and sanding, ready to paint
- Good: Standard filling, sanding and minor touch-up work
- Fair: Some scraping, filling, sanding and spot priming needed
- Poor: Major scraping, extensive filling, sanding, full priming required</span>
            </span>
          </label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      const tasks = ['Paint walls', 'Fascia/soffits', 'Gutters/downpipes', 'Window frames', 'Exterior doors'];
      const colorFields = ['wallColor', 'fasciaColor', 'gutterColor', 'windowColor', 'doorColor'];

      taskHtml = tasks.map((task, idx) => {
        const isSelected = e.selectedTasks[task];
        const colorField = colorFields[idx];
        const taskColor = e[colorField] || 'Choose colour';
        const colorHex = getColorHex(taskColor);

        return `
          <div class="task-box${isSelected ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'${task}')">
            <label class="task-label" onclick="event.stopPropagation()">
              <input type="checkbox"${isSelected ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'${task}')"> ${task}
            </label>
            ${isSelected ? `
              <div class="color-select-group" onclick="event.stopPropagation()">
                <label>Resene Color Selection</label>
                <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-${colorField}')">
                  <div class="selected-color-display">
                    <div class="selected-color-swatch" style="background-color: ${colorHex};"></div>
                    <span>${taskColor}</span>
                  </div>
                  <span>▼ Change Color</span>
                </div>
                <div id="${e.id}-${colorField}" class="color-grid-container">
                  ${createColorGrid(taskColor, colorField, e.id, 'exterior')}
                </div>
                <div class="resene-brand">🎨 Resene ColorShop</div>
              </div>
            ` : ''}
          </div>`;
      }).join('');

    } else if(e.type === 'Deck') {
      fields = `
        <div class="grid grid-3">
          <div><label>Deck Area (m²)</label><input type="number" value="${e.deckArea}" onchange="updateItem(${e.id},'deckArea',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Stain/oil deck'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Stain/oil deck')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Stain/oil deck'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Stain/oil deck')">
            Stain/oil deck
          </label>
        </div>
        <div class="task-box${e.selectedTasks['Paint deck'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint deck')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint deck'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint deck')">
            Paint deck
          </label>
          ${e.selectedTasks['Paint deck'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-deckColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.deckColor || 'Choose colour')};"></div>
                  <span>${e.deckColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-deckColor" class="color-grid-container">
                ${createColorGrid(e.deckColor || 'Choose colour', 'deckColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Balustrades'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Balustrades')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Balustrades'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Balustrades')">
            Balustrades
          </label>
          ${e.selectedTasks['Balustrades'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-balustradeColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.balustradeColor || 'Choose colour')};"></div>
                  <span>${e.balustradeColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-balustradeColor" class="color-grid-container">
                ${createColorGrid(e.balustradeColor || 'Choose colour', 'balustradeColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    } else if(e.type === 'Fence') {
      fields = `
        <div class="grid grid-3">
          <div><label>Fence Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint fence'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint fence')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint fence'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint fence')">
            Paint fence
          </label>
          ${e.selectedTasks['Paint fence'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-fenceColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.fenceColor || 'Choose colour')};"></div>
                  <span>${e.fenceColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-fenceColor" class="color-grid-container">
                ${createColorGrid(e.fenceColor || 'Choose colour', 'fenceColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Stain fence'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Stain fence')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Stain fence'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Stain fence')">
            Stain fence
          </label>
        </div>`;

    } else if(e.type === 'Garage' || e.type === 'Shed') {
      fields = `
        <div class="grid grid-3">
          <div><label>Wall Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint walls'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint walls')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint walls'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint walls')">
            Paint walls
          </label>
          ${e.selectedTasks['Paint walls'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-wallColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.wallColor || 'Choose colour')};"></div>
                  <span>${e.wallColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-wallColor" class="color-grid-container">
                ${createColorGrid(e.wallColor || 'Choose colour', 'wallColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Paint trim'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint trim')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint trim'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint trim')">
            Paint trim
          </label>
          ${e.selectedTasks['Paint trim'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-trimColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.trimColor || 'Choose colour')};"></div>
                  <span>${e.trimColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-trimColor" class="color-grid-container">
                ${createColorGrid(e.trimColor || 'Choose colour', 'trimColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Paint doors'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint doors')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint doors'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint doors')">
            Paint doors
          </label>
          ${e.selectedTasks['Paint doors'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-doorColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.doorColor || 'Choose colour')};"></div>
                  <span>${e.doorColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-doorColor" class="color-grid-container">
                ${createColorGrid(e.doorColor || 'Choose colour', 'doorColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    } else if(e.type === 'Roof') {
      fields = `
        <div class="grid grid-3">
          <div><label>Roof Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Roof Type</label>
            <select onchange="updateItem(${e.id},'roofType',this.value,'exterior')">
              <option value="Metal"${e.roofType === 'Metal' ? ' selected' : ''}>Metal (+20%)</option>
              <option value="Tile"${e.roofType === 'Tile' ? ' selected' : ''}>Tile (+35%)</option>
              <option value="Membrane"${e.roofType === 'Membrane' ? ' selected' : ''}>Membrane</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint roof'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint roof')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint roof'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint roof')">
            Paint roof
          </label>
          ${e.selectedTasks['Paint roof'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-roofColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.roofColor || 'Choose colour')};"></div>
                  <span>${e.roofColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-roofColor" class="color-grid-container">
                ${createColorGrid(e.roofColor || 'Choose colour', 'roofColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    }

    return `
      <div class="exterior-card">
        <div class="room-header">
          <h3 class="room-title">${e.type} ${i + 1}</h3>
          <button class="btn-delete" onclick="removeItem(${e.id}, 'exterior')">✕</button>
        </div>
        <div style="margin-bottom:1rem;">
          <label>Structure Type</label>
          <select onchange="updateItem(${e.id},'type',this.value,'exterior')">${exteriorTypes.map(v => `<option value="${v}"${e.type === v ? ' selected' : ''}>${v}</option>`).join('')}</select>
        </div>
        ${fields}
        <div class="section-header">Select painting tasks</div>
        ${taskHtml}
      </div>`;
  }).join('');
  calcAll();
}

function addRoom() {
  rooms.push({
    id: Date.now(),
    type: 'Bedroom',
    length: '4.0',
    width: '3.5',
    ceilingHeight: '2.4',
    condition: 'good',
    coats: '2',
    trimType: 'basic',
    wallColor: 'Choose colour',
    ceilingColor: 'Choose colour',
    trimColor: 'Choose colour',
    doorColor: 'Choose colour',
    windowColor: 'Choose colour',
    cabinetColor: 'Choose colour',
    selectedTasks: {}
  });
  renderRooms();
}

function addExterior() {
  exteriors.push({
    id: Date.now(),
    type: 'House Walls',
    cladding: 'Weatherboard',
    area: '150',
    height: '1',
    condition: 'good',
    coats: '2',
    roofType: 'Metal',
    wallColor: 'Choose colour',
    fasciaColor: 'Choose colour',
    gutterColor: 'Choose colour',
    windowColor: 'Choose colour',
    doorColor: 'Choose colour',
    deckColor: 'Choose colour',
    balustradeColor: 'Choose colour',
    fenceColor: 'Choose colour',
    trimColor: 'Choose colour',
    roofColor: 'Choose colour',
    scaffolding: false,
    deckArea: '30',
    selectedTasks: {}
  });
  renderExteriors();
}

function removeItem(id, type) {
  if(type === 'room') {
    rooms = rooms.filter(r => r.id !== id);
    renderRooms();
  } else {
    exteriors = exteriors.filter(e => e.id !== id);
    renderExteriors();
  }
}

function updateItem(id, field, value, type) {
  if(type === 'room') {
    rooms = rooms.map(r => {
      if(r.id === id) {
        const updated = {...r, [field]: value};
        if(field === 'type') {
          updated.selectedTasks = {};
        }
        return updated;
      }
      return r;
    });
    renderRooms();
  } else {
    exteriors = exteriors.map(e => {
      if(e.id === id) {
        const updated = {...e, [field]: value};
        if(field === 'type') {
          updated.selectedTasks = {};
        }
        return updated;
      }
      return e;
    });
    renderExteriors();
  }
}

function toggleTask(id, task) {
  rooms = rooms.map(r => r.id === id ? {...r, selectedTasks: {...r.selectedTasks, [task]: !r.selectedTasks[task]}} : r);
  renderRooms();
}

function toggleExteriorTask(id, task) {
  exteriors = exteriors.map(e => e.id === id ? {...e, selectedTasks: {...e.selectedTasks, [task]: !e.selectedTasks[task]}} : e);
  renderExteriors();
}

function emailQuote() {
  const t = document.getElementById('total-price').textContent;
  window.location.href = `mailto:quote@yourcompany.co.nz?subject=Painting Quote Request - $${t}&body=Please provide a detailed quote for the painting work estimated at $${t}.`;
}

renderRooms();
renderExteriors();
