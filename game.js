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
    name: "Viking Hand",
    cost: 15,
    baseHPS: 0.1,
    owned: 0,
    image: "cursor.png"
  }, {
    name: "Viking Axe",
    cost: 100,
    baseHPS: 1,
    owned: 0,
    image: "axe.png"
  }, {
    name: "Viking House",
    cost: 1100,
    baseHPS: 8,
    owned: 0,
    image: "house.png"
  }, {
    name: "Blacksmith",
    cost: 12000,
    baseHPS: 47,
    owned: 0,
    image: "blacksmith.png"
  }, {
    name: "Mead Hall",
    cost: 130000,
    baseHPS: 260,
    owned: 0,
    image: "meadhall.png"
  }],
  valEssence: 0,
  lifetimeHacksilver: 0,
  prestigeMultiplier: 1
};

function loadGame() {
  const savedGame = localStorage.getItem('vikingClickerSave');
  if (savedGame) {
    const loadedGame = JSON.parse(savedGame);
    game = {
      ...game,
      ...loadedGame,
      buildings: game.buildings.map((building, i) => ({
        ...building,
        owned: loadedGame.buildings[i]?.owned || 0
      }))
    };
    if (!game.valEssence) game.valEssence = 0;
    if (!game.prestigeMultiplier) game.prestigeMultiplier = 1;
    if (!game.lifetimeHacksilver) game.lifetimeHacksilver = game.hacksilver;
    calculateHacksilverPerSecond();
    updateDisplay();
    updateStats();
    updateValhalla();
  }
}

function saveGame() {
  const saveData = {
    ...game,
    buildings: game.buildings.map(({name, owned}) => ({name, owned}))
  };
  localStorage.setItem('vikingClickerSave', JSON.stringify(saveData));
}

function resetGame() {
  if (confirm("Are you sure you want to erase all progress? This cannot be undone!")) {
    localStorage.removeItem('vikingClickerSave');
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

function updateDisplay() {
  document.getElementById('hacksilver-count').textContent = `${formatNumber(game.hacksilver)} HackSilver`;
  document.getElementById('hacksilver-per-second').textContent = `${formatNumber(game.hacksilverPerSecond)} per second`;
  updateStore();
}

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
                <div>
                    <div class="name">${building.name}</div>
                    <div class="cost">Cost: ${formatNumber(building.cost)} HackSilver</div>
                    <div class="owned">Owned: ${building.owned}</div>
                    <div>Produces: ${building.baseHPS} HPS</div>
                    <div>+1 HackSilver per click</div>
                </div>
            `;
      itemDiv.onclick = () => buyBuilding(index);
      storeDiv.appendChild(itemDiv);
    } else {
      existingItem.className = `store-item${canBuy ? ' can-buy' : ''}`;
      existingItem.querySelector('.cost').textContent = `Cost: ${formatNumber(building.cost)} HackSilver`;
      existingItem.querySelector('.owned').textContent = `Owned: ${building.owned}`;
    }
  });
}

function buyBuilding(index) {
  const building = game.buildings[index];
  if (game.hacksilver >= building.cost) {
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
        lifetimeHacksilver
      };
      
      calculateHacksilverPerSecond();
      updateDisplay();
      updateStats();
      updateValhalla();
      saveGame();
    }
  }
}

function updateValhalla() {
  const gain = calculatePrestigeGain();
  const valhallaBtn = document.getElementById('valhalla-button');
  const nextValhallaInfo = document.getElementById('next-valhalla-info');
  
  document.getElementById('current-val-essence').textContent = game.valEssence;
  document.getElementById('prestige-multiplier').textContent = 
    `Current Bonus: ${((game.prestigeMultiplier - 1) * 100).toFixed(1)}%`;
  
  if (gain > 0) {
    valhallaBtn.disabled = false;
    nextValhallaInfo.textContent = `Enter Valhalla to gain ${gain} Val Essence`;
  } else {
    valhallaBtn.disabled = true;
    const remaining = (1e12 - game.hacksilver).toFixed(0);
    nextValhallaInfo.textContent = `Need ${formatNumber(remaining)} more HackSilver for next Val Essence`;
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

setInterval(() => {
  game.hacksilver += game.hacksilverPerSecond / 10;
  game.totalHacksilver += game.hacksilverPerSecond / 10;
  updateDisplay();
  updateStats();
  updateValhalla();
}, 100);

setInterval(saveGame, 30000);

loadGame();
updateStats();

document.getElementById('reset-game').addEventListener('click', resetGame);