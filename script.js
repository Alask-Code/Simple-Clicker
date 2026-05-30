const state = {
  points: 0,
  basePower: 1,
  critChance: 0.1,
  critMultiplier: 2,
  critBonus: 0,
  bonusActive: false,
  clicks: 0,
  panelVisible: true,
};

const upgrades = [
  {
    id: "power",
    name: "Power Up",
    description: "Increase base click power by +1",
    level: 1,
    baseCost: 10,
    effect: () => {
      state.basePower += 1;
    },
  },
  {
    id: "crit",
    name: "Crit Chance",
    description: "Add +5% crit chance",
    level: 1,
    baseCost: 20,
    effect: () => {
      state.critChance = Math.min(state.critChance + 0.05, 0.5);
    },
  },
];

const perks = [
  {
    id: "lucky",
    name: "Lucky Charm",
    description: "Permanent +10% crit chance",
    cost: 120,
    purchased: false,
    effect: () => {
      state.critChance = Math.min(state.critChance + 0.1, 0.75);
    },
  },
  {
    id: "gold",
    name: "Gold Coin",
    description: "Critical hits give +20% extra reward",
    cost: 180,
    purchased: false,
    effect: () => {
      state.critBonus = 0.2;
    },
  },
  {
    id: "frenzy",
    name: "Frenzy Box",
    description: "Every 15 clicks grants +5 bonus points",
    cost: 220,
    purchased: false,
    effect: () => {
      state.bonusActive = true;
    },
  },
];

const pointsEl = document.getElementById("points");
const clickPowerEl = document.getElementById("clickPower");
const critInfoEl = document.getElementById("critInfo");
const feedbackEl = document.getElementById("feedback");
const upgradeList = document.getElementById("upgrade-list");
const perkList = document.getElementById("perk-list");
const clickerBtn = document.getElementById("clicker");
const togglePanelBtn = document.getElementById("toggle-panel");
const panelEl = document.querySelector(".panel");

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function getUpgradeCost(upgrade) {
  return Math.ceil(upgrade.baseCost * Math.pow(1.8, upgrade.level - 1));
}

function renderShop() {
  upgradeList.innerHTML = upgrades
    .map((upgrade) => {
      const cost = getUpgradeCost(upgrade);
      const disabled = state.points < cost ? "disabled" : "";
      return `
        <button class="shop-button" data-id="${upgrade.id}" ${disabled}>
          <span class="name">${upgrade.name} (Lv ${upgrade.level})</span>
          <span class="detail">${upgrade.description}</span>
          <span class="detail">Cost: ${cost} points</span>
        </button>
      `;
    })
    .join("");

  perkList.innerHTML = perks
    .map((perk) => {
      const disabled =
        state.points < perk.cost || perk.purchased ? "disabled" : "";
      const label = perk.purchased ? "Purchased" : `Cost: ${perk.cost}`;
      return `
        <button class="shop-button" data-id="${perk.id}" ${disabled}>
          <span class="name">${perk.name}</span>
          <span class="detail">${perk.description}</span>
          <span class="detail">${label}</span>
        </button>
      `;
    })
    .join("");
}

function updateUI(message) {
  pointsEl.textContent = state.points;
  clickPowerEl.textContent = `Power: ${state.basePower}`;
  critInfoEl.textContent = `Crit: ${formatPercent(state.critChance)} x${state.critMultiplier}`;
  if (message) {
    feedbackEl.textContent = message;
  }
  if (panelEl) {
    panelEl.classList.toggle("hidden", !state.panelVisible);
  }
  if (togglePanelBtn) {
    togglePanelBtn.textContent = state.panelVisible
      ? "Hide upgrades & perks"
      : "Show upgrades & perks";
  }
  renderShop();
}

function togglePanel() {
  state.panelVisible = !state.panelVisible;
  updateUI(state.panelVisible ? "Panel shown" : "Panel hidden");
}

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade) return;
  const cost = getUpgradeCost(upgrade);
  if (state.points < cost) return;
  state.points -= cost;
  upgrade.effect();
  upgrade.level += 1;
  updateUI(`Bought ${upgrade.name}!`);
}

function buyPerk(id) {
  const perk = perks.find((item) => item.id === id);
  if (!perk || perk.purchased || state.points < perk.cost) return;
  state.points -= perk.cost;
  perk.purchased = true;
  perk.effect();
  updateUI(`Perk unlocked: ${perk.name}!`);
}

function clickAction() {
  state.clicks += 1;
  let gain = state.basePower;
  const isCrit = Math.random() < state.critChance;

  if (isCrit) {
    gain = Math.ceil(gain * state.critMultiplier * (1 + state.critBonus));
  }

  if (state.bonusActive && state.clicks % 15 === 0) {
    gain += 5;
  }

  state.points += gain;
  updateUI(isCrit ? `Critical hit! +${gain} points` : `+${gain} points`);
}

clickerBtn.addEventListener("click", clickAction);
if (togglePanelBtn) {
  togglePanelBtn.addEventListener("click", togglePanel);
}
upgradeList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  buyUpgrade(button.dataset.id);
});
perkList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  buyPerk(button.dataset.id);
});

updateUI("Welcome! Click the button to earn points.");
