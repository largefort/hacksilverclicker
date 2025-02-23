// Update the buildings array with Old Norse names and new buildings
let game = {
  hacksilver: 0,
  totalHacksilver: 0,
  hacksilverPerSecond: 0,
  multiplier: 1,
  clickPower: 1,
  totalClicks: 0,
  clickHacksilver: 0,
  startTime: Date.now(),
  buildings: [{
    name: "Víkingahönd",
    cost: 15,
    baseHPS: 0.1,
    owned: 0,
    image: "cursor.png",
    hacksilverProduced: 0
  }, {
    name: "Víkingaöx",
    cost: 100,
    baseHPS: 1,
    owned: 0,
    image: "axe.png",
    hacksilverProduced: 0
  }, {
    name: "Víkingabær",
    cost: 1100,
    baseHPS: 8,
    owned: 0,
    image: "house.png",
    hacksilverProduced: 0
  }, {
    name: "Járnsmiðr",
    cost: 12000,
    baseHPS: 47,
    owned: 0,
    image: "blacksmith.png",
    hacksilverProduced: 0
  }, {
    name: "Mjöðrhöll",
    cost: 130000,
    baseHPS: 260,
    owned: 0,
    image: "meadhall.png",
    hacksilverProduced: 0
  }, {
    name: "Langskip",
    cost: 1.4e6,
    baseHPS: 1400,
    owned: 0,
    image: "knarr.png",
    hacksilverProduced: 0
  }, {
    name: "Blótstaðr",
    cost: 2e7,
    baseHPS: 7800,
    owned: 0,
    image: "PlaceofSacrifice.png",
    hacksilverProduced: 0
  }, {
    name: "Höfðingjahoð",
    cost: 3.3e8,
    baseHPS: 44000,
    owned: 0,
    image: "ChieftainsTemple.png",
    hacksilverProduced: 0
  }, {
    name: "Þingstaðr",
    cost: 5.1e9,
    baseHPS: 260000,
    owned: 0,
    image: "thingstad.png",
    hacksilverProduced: 0
  }, {
    name: "Konungshöll",
    cost: 7.5e10,
    baseHPS: 1.6e6,
    owned: 0,
    image: "hallofkings.png",
    hacksilverProduced: 0
  }, {
    name: "Yggdrasill",
    cost: 1e12,
    baseHPS: 1e7,
    owned: 0,
    image: "yggdrasil.png",
    hacksilverProduced: 0
  }, {
    name: "Bifröst",
    cost: 1.4e13,
    baseHPS: 6.5e7,
    owned: 0,
    image: "bifrost.png",
    hacksilverProduced: 0
  }, {
    name: "Ásgarðr",
    cost: 1.7e14,
    baseHPS: 4.3e8,
    owned: 0,
    image: "asgard.png",
    hacksilverProduced: 0
  }, {
    name: "Miðgarðr",
    cost: 2.1e15,
    baseHPS: 2.9e9,
    owned: 0,
    image: "midgard.png",
    hacksilverProduced: 0
  }, {
    name: "Valhöll",
    cost: 2.6e16,
    baseHPS: 2.1e10,
    owned: 0,
    image: "valhalla.png",
    hacksilverProduced: 0
  }],
  valEssence: 0,
  lifetimeHacksilver: 0,
  prestigeMultiplier: 1,
  valLevel: 0,
  lastValUpgrade: 0,
  valUpgrades: []
};

const purchaseSound = new Audio('click.wav');

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splashScreen = document.getElementById('splash-screen');
    splashScreen.style.opacity = '0';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 500);
  }, 4000); // Show splash screen for 4 seconds
});

function loadGame() {
  const savedGame = localStorage.getItem('vikingClickerSave');
  if (savedGame) {
    const loadedGame = JSON.parse(savedGame);
    game = {
      ...game,
      ...loadedGame,
      buildings: game.buildings.map((building, i) => ({
        ...building,
        owned: loadedGame.buildings[i]?.owned || 0,
        cost: loadedGame.buildings[i]?.cost || building.cost,
        hacksilverProduced: loadedGame.buildings[i]?.hacksilverProduced || 0
      }))
    };
    if (!game.valEssence) game.valEssence = 0;
    if (!game.prestigeMultiplier) game.prestigeMultiplier = 1;
    if (!game.lifetimeHacksilver) game.lifetimeHacksilver = game.hacksilver;
    if (!game.valLevel) game.valLevel = 0;
    if (!game.lastValUpgrade) game.lastValUpgrade = 0;
    if (!game.valUpgrades) game.valUpgrades = [];
    calculateHacksilverPerSecond();
    updateDisplay();
    updateStats();
    updateValhalla();
  }
}

function saveGame() {
  const saveData = {
    ...game,
    buildings: game.buildings.map(({name, owned, cost, hacksilverProduced}) => ({
      name, 
      owned,
      cost,
      hacksilverProduced
    }))
  };
  localStorage.setItem('vikingClickerSave', JSON.stringify(saveData));
}

function resetGame() {
  if (confirm("Are you sure you want to erase all progress? This cannot be undone!")) {
    // Create a fresh game state
    game = {
      hacksilver: 0,
      totalHacksilver: 0,
      hacksilverPerSecond: 0,
      multiplier: 1,
      clickPower: 1,
      totalClicks: 0,
      clickHacksilver: 0,
      startTime: Date.now(),
      buildings: game.buildings.map(b => ({
        ...b,
        owned: 0,
        cost: b.baseHPS * 15, // Reset cost to original
        hacksilverProduced: 0
      })),
      valEssence: 0,
      lifetimeHacksilver: 0, // Reset lifetime hacksilver
      prestigeMultiplier: 1,
      valLevel: 0,
      lastValUpgrade: 0,
      valUpgrades: []
    };
    
    localStorage.removeItem('vikingClickerSave');
    calculateHacksilverPerSecond();
    updateDisplay();
    updateStats();
    updateValhalla();
    location.reload();
  }
}

function updateStats() {
  const timePlayed = Math.floor((Date.now() - game.startTime) / 1000 / 60); // minutes
  let timeString = "";
  if (timePlayed < 60) {
    timeString = `${timePlayed} minutes`;
  } else if (timePlayed < 1440) {
    timeString = `${Math.floor(timePlayed / 60)} hours, ${timePlayed % 60} minutes`;
  } else {
    timeString = `${Math.floor(timePlayed / 1440)} days, ${Math.floor((timePlayed % 1440) / 60)} hours`;
  }
  
  document.getElementById('time-played').textContent = timeString;
  document.getElementById('total-hacksilver').textContent = formatNumber(game.totalHacksilver);
  document.getElementById('total-hps').textContent = formatNumber(game.hacksilverPerSecond);
  document.getElementById('total-clicks').textContent = formatNumber(game.totalClicks);
  document.getElementById('click-hacksilver').textContent = formatNumber(game.clickHacksilver);
  
  const buildingStats = document.getElementById('building-stats');
  buildingStats.innerHTML = game.buildings.map(building => 
    `<div class="stat-row">${building.name}: ${building.owned}</div>`
  ).join('');
}

function createFallingHacksilver(x = null) {
  const hacksilver = document.createElement('img');
  hacksilver.src = "hacksilver.png";
  hacksilver.className = 'falling-hacksilver';
  hacksilver.style.left = x ? `${x}px` : Math.random() * 100 + 'vw';
  hacksilver.style.animation = `falling ${3 + Math.random() * 4}s linear`;
  document.body.appendChild(hacksilver);
  hacksilver.onanimationend = () => hacksilver.remove();
}

setInterval(() => {
  if (game.hacksilverPerSecond > 0) {
    // Create 1 falling hacksilver for every 10 HPS, max 20
    const count = Math.min(Math.floor(game.hacksilverPerSecond / 10), 20);
    for (let i = 0; i < count; i++) {
      createFallingHacksilver();
    }
  }
}, 2000); // Every 2 seconds

function createFloatingText(x, y, amount) {
  const text = document.createElement('div');
  text.className = 'click-text';
  text.style.left = x - 30 + 'px';
  text.style.top = y - 20 + 'px';
  const icon = document.createElement('img');
  icon.src = "hacksilver.png";
  const amountSpan = document.createElement('span');
  amountSpan.textContent = '+' + amount;
  text.appendChild(icon);
  text.appendChild(amountSpan);
  document.body.appendChild(text);
  setTimeout(() => text.remove(), 1000);
}

// Update display functions to use Old Norse text
function updateDisplay() {
  document.getElementById('hacksilver-count').textContent = `${formatNumber(game.hacksilver)} Silfrhakk`;
  document.getElementById('hacksilver-per-second').textContent = `${formatNumber(game.hacksilverPerSecond)} á sekúndu`;
  updateStore();
}

// Update Store to use Old Norse text
function updateStore() {
  const storeDiv = document.getElementById('store-items');
  game.buildings.forEach((building, index) => {
    const existingItem = storeDiv.children[index];
    const canBuy = game.hacksilver >= building.cost;
    if (!existingItem) {
      const itemDiv = document.createElement('div');
      itemDiv.className = `store-item${canBuy ? ' can-buy' : ''}`;
      itemDiv.innerHTML = `
        <img src="${building.image}" alt="${building.name}">
        <div class="store-item-content">
          <div class="name">${building.name}</div>
          <div class="cost">Kostnaður: ${formatNumber(building.cost)} Silfrhakk</div>
          <div class="owned">Í eigu: ${building.owned}</div>
          <div>Framleiðir: ${building.baseHPS} SPS</div>
          <div>+1 Silfrhakk á smell</div>
        </div>
        <div class="store-item-actions">
          <button class="buy-button" onclick="buyBuilding(${index})" ${canBuy ? '' : 'disabled'}>
            Kaupa
          </button>
          <button class="info-button" onclick="showBuildingInfo(${index})">Upplýsingar</button>
          <button class="sell-button" onclick="sellBuilding(${index})" ${building.owned > 0 ? '' : 'disabled'}>
            Selja (${formatNumber(Math.floor(building.cost * 0.25))} Silfrhakk)
          </button>
        </div>
      `;
      storeDiv.appendChild(itemDiv);
    } else {
      existingItem.className = `store-item${canBuy ? ' can-buy' : ''}`;
      existingItem.querySelector('.cost').textContent = `Kostnaður: ${formatNumber(building.cost)} Silfrhakk`;
      existingItem.querySelector('.owned').textContent = `Í eigu: ${building.owned}`;
      existingItem.querySelector('.buy-button').disabled = !canBuy;
      existingItem.querySelector('.sell-button').disabled = building.owned <= 0;
      existingItem.querySelector('.sell-button').textContent = 
        `Selja (${formatNumber(Math.floor(building.cost * 0.25))} Silfrhakk)`;
    }
  });
}

function buyBuilding(index) {
  const building = game.buildings[index];
  if (game.hacksilver >= building.cost) {
    // Play purchase sound
    purchaseSound.currentTime = 0;
    purchaseSound.play().catch(err => console.log('Purchase sound prevented:', err));
    
    game.hacksilver -= building.cost;
    building.owned++;
    building.cost = Math.ceil(building.cost * 1.15);
    calculateHacksilverPerSecond();
    updateDisplay();
    saveGame();
  }
}

function calculateHacksilverPerSecond() {
  game.hacksilverPerSecond = game.buildings.reduce((total, building) => {
    return total + building.baseHPS * building.owned;
  }, 0) * game.multiplier * game.prestigeMultiplier;
  game.clickPower = (1 + game.buildings.reduce((total, building) => {
    return total + building.owned;
  }, 0)) * game.prestigeMultiplier;
}

function formatNumber(num) {
  if (num < 1 && num > 0) {
    return num.toFixed(1);
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Number.isInteger(num) ? Math.floor(num) : num.toFixed(1);
}

function calculatePrestigeGain() {
  return Math.floor(Math.sqrt(game.hacksilver / 1e12));
}

function enterValhalla() {
  const gain = calculatePrestigeGain();
  if (gain > 0) {
    if (confirm(`Are you sure you want to enter Valhalla? You will gain ${gain} Val Essence!`)) {
      game.valEssence += gain;
      game.prestigeMultiplier = 1 + (game.valEssence * 0.1); 
      
      const valEssence = game.valEssence;
      const prestigeMultiplier = game.prestigeMultiplier;
      const lifetimeHacksilver = game.lifetimeHacksilver + game.hacksilver;
      
      game = {
        hacksilver: 0,
        totalHacksilver: 0,
        hacksilverPerSecond: 0,
        multiplier: 1,
        clickPower: 1,
        totalClicks: 0,
        clickHacksilver: 0,
        startTime: Date.now(),
        buildings: [...game.buildings.map(b => ({...b, owned: 0}))],
        valEssence,
        prestigeMultiplier,
        lifetimeHacksilver,
        valLevel: game.valLevel,
        lastValUpgrade: game.lastValUpgrade,
        valUpgrades: game.valUpgrades
      };
      
      calculateHacksilverPerSecond();
      updateDisplay();
      updateStats();
      updateValhalla();
      saveGame();
    }
  }
}

// Update Valhalla text
function updateValhalla() {
  const gain = calculatePrestigeGain();
  const valhallaBtn = document.getElementById('valhalla-button');
  const nextValhallaInfo = document.getElementById('next-valhalla-info');
  
  document.getElementById('current-val-essence').textContent = game.valEssence;
  document.getElementById('prestige-multiplier').textContent = 
    `Núverandi Bónus: ${((game.prestigeMultiplier - 1) * 100).toFixed(1)}%`;
  
  if (gain > 0) {
    valhallaBtn.disabled = false;
    nextValhallaInfo.textContent = `Gakk inn í Valhöll til að fá ${gain} Val Kraft`;
  } else {
    valhallaBtn.disabled = true;
    const remaining = (1e12 - game.hacksilver).toFixed(0);
    nextValhallaInfo.textContent = `Þarf ${formatNumber(remaining)} meira Silfrhakk fyrir næsta Val Kraft`;
  }
  
  updateValLevel();
  document.getElementById('val-level').textContent = `Val Stig: ${game.valLevel}`;
  
  const upgradesContainer = document.getElementById('val-upgrades');
  upgradesContainer.innerHTML = '';
  
  game.valUpgrades.forEach((upgrade, index) => {
    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = `val-upgrade ${upgrade.purchased ? 'purchased' : ''}`;
    upgradeDiv.innerHTML = `
      <div class="upgrade-name">${upgrade.name}</div>
      <div class="upgrade-cost">${upgrade.cost} Val Kraftur</div>
      <div class="upgrade-bonus">+${(upgrade.bonus * 100).toFixed(1)}% Bónus</div>
      ${upgrade.purchased ? '<div class="purchased-text">Keypt</div>' : 
        `<button onclick="buyValUpgrade(${index})" 
         ${game.valEssence >= upgrade.cost ? '' : 'disabled'}>
         Kaupa</button>`}
    `;
    upgradesContainer.appendChild(upgradeDiv);
  });
}

function updateValLevel() {
  game.valLevel = Math.floor(Math.log10(game.lifetimeHacksilver));
}

function showBuildingInfo(index) {
  const building = game.buildings[index];
  const modal = document.getElementById('building-modal');
  const modalContent = document.querySelector('.modal-content');
  
  const updateModalStats = () => {
    const productionStats = document.getElementById('building-production-stats');
    if (productionStats) {
      productionStats.textContent = formatNumber(building.hacksilverProduced);
    }
  };

  modalContent.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${building.name}</h3>
      <button class="close-modal" onclick="closeBuildingModal()">&times;</button>
    </div>
    <div class="building-stats">
      <p>Í eigu: ${building.owned}</p>
      <p>Silfrhakk á sekúndu: ${formatNumber(building.baseHPS * building.owned * game.multiplier * game.prestigeMultiplier)}</p>
      <p>Grunnframleiðsla: ${formatNumber(building.baseHPS)} SPS</p>
      <p>Kostnaður: ${formatNumber(building.cost)} Silfrhakk</p>
      <p>Heildar Silfrhakk framleitt: <span id="building-production-stats">${formatNumber(building.hacksilverProduced)}</span></p>
    </div>
    <div class="building-description">
      ${getBuildingDescription(building.name)}
    </div>
  `;
  
  modal.style.display = 'flex';

  // Start updating the production stats while modal is open
  const statsInterval = setInterval(updateModalStats, 33); // ~30 FPS

  // Clear interval when modal is closed
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    clearInterval(statsInterval);
  });
}

function closeBuildingModal() {
  document.getElementById('building-modal').style.display = 'none';
}

function getBuildingDescription(name) {
  const descriptions = {
    'Víkingahönd': 'Öflugur víkingur sem safnar silfri með höndum sínum.',
    'Víkingaöx': 'Fornt vopn notað til að höggva silfur úr jörðinni.',
    'Víkingabær': 'Lítið bæ sem býr yfir víkingum sem safna silfri.',
    'Járnsmiðr': 'Smíði sem smíðar járn til að búa til silfr.',
    'Mjöðrhöll': 'Höll sem selur mjöð til að gefa víkingum styrk.',
    'Langskip': 'Stór skip sem fer víkinga til að safna silfri.',
    'Blótstaðr': 'Staður sem víkingar blóta til að fá silfr.',
    'Höfðingjahoð': 'Höfðingjahoð sem gefur víkingum styrk.',
    'Þingstaðr': 'Þingstaður sem safnar víkingum til að ræða um silfr.',
    'Konungshöll': 'Konungshöll sem gefur víkingum styrk og silfr.',
    'Yggdrasill': 'Yggdrasill sem gefur víkingum styrk og silfr.',
    'Bifröst': 'Bifröst sem gefur víkingum styrk og silfr.',
    'Ásgarðr': 'Ásgarðr sem gefur víkingum styrk og silfr.',
    'Miðgarðr': 'Miðgarðr sem gefur víkingum styrk og silfr.',
    'Valhöll': 'Valhöll sem gefur víkingum styrk og silfr.'
  };
  return descriptions[name] || 'Engin lýsing tiltæk.';
}

function sellBuilding(index) {
  event.stopPropagation(); 
  const building = game.buildings[index];
  if (building.owned > 0) {
    const refund = Math.floor(building.cost * 0.25);
    game.hacksilver += refund;
    building.owned--;
    building.cost = Math.floor(building.cost / 1.15);
    calculateHacksilverPerSecond();
    updateDisplay();
    updateStats();
    saveGame();
    
    createFloatingText(
      event.clientX || window.innerWidth / 2,
      event.clientY || window.innerHeight / 2,
      `+${formatNumber(refund)}`
    );
  }
}

// Update the interval to track hacksilver produced
setInterval(() => {
  const production = game.hacksilverPerSecond / 10;
  game.hacksilver += production;
  game.totalHacksilver += production;
  
  // Update individual building production tracking
  // This runs 10 times per second (100ms interval)
  game.buildings.forEach(building => {
    const buildingProduction = building.baseHPS * building.owned * game.multiplier * game.prestigeMultiplier / 10;
    building.hacksilverProduced += buildingProduction;
  });
  
  updateDisplay();
  updateStats();
  updateValhalla();
}, 100);

function generateValUpgrade() {
  const now = Date.now();
  if (now - game.lastValUpgrade >= 3600000) { // 1 hour
    const upgrade = {
      name: `Val Styrkur ${game.valUpgrades.length + 1}`,
      cost: Math.floor(5 + Math.pow(game.valUpgrades.length, 1.5)),
      bonus: 0.05 * (1 + game.valUpgrades.length * 0.1)
    };
    game.valUpgrades.push(upgrade);
    game.lastValUpgrade = now;
    updateValhalla();
    saveGame();
  }
}

function buyValUpgrade(index) {
  const upgrade = game.valUpgrades[index];
  if (game.valEssence >= upgrade.cost && !upgrade.purchased) {
    game.valEssence -= upgrade.cost;
    upgrade.purchased = true;
    game.prestigeMultiplier += upgrade.bonus;
    updateValhalla();
    calculateHacksilverPerSecond();
    saveGame();
  }
}

document.getElementById('shield').addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    game.hacksilver += game.clickPower * game.multiplier;
    game.totalHacksilver += game.clickPower * game.multiplier;
    game.clickHacksilver += game.clickPower * game.multiplier;
    game.totalClicks++;
    
    // Create 1-3 falling hacksilver at click location
    const fallCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < fallCount; i++) {
      createFallingHacksilver(touch.clientX);
    }
    
    createFloatingText(touch.clientX, touch.clientY, formatNumber(game.clickPower * game.multiplier));
    updateDisplay();
    updateStats();
});

document.getElementById('shield').addEventListener('click', function(e) {
    game.hacksilver += game.clickPower * game.multiplier;
    game.totalHacksilver += game.clickPower * game.multiplier;
    game.clickHacksilver += game.clickPower * game.multiplier;
    game.totalClicks++;
    
    // Create 1-3 falling hacksilver at click location
    const fallCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < fallCount; i++) {
      createFallingHacksilver(e.clientX);
    }
    
    createFloatingText(e.clientX, e.clientY, formatNumber(game.clickPower * game.multiplier));
    updateDisplay();
    updateStats();
});

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(button.dataset.tab).classList.add('active');

        const hacksilverDisplay = document.getElementById('hacksilver-display');
        if (button.dataset.tab === 'shield-tab') {
            hacksilverDisplay.style.display = 'flex';
        } else {
            hacksilverDisplay.style.display = 'none';
        }
    });
});

document.body.addEventListener('touchmove', function(e) {
    if (e.target.closest('#store-container')) return;
    e.preventDefault();
}, { passive: false });

const shield = document.getElementById('shield');
shield.addEventListener('touchstart', function(e) {
    if ('vibrate' in navigator) {
        navigator.vibrate(20);
    }
});

setInterval(saveGame, 30000);

setInterval(generateValUpgrade, 60000); // Check every minute

loadGame();
updateStats();

document.getElementById('reset-game').addEventListener('click', resetGame);