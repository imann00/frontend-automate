// Variables globales pour les données du graphique
var x = [];
var y1 = [];
var y2 = [];

// Initialisation du graphique Chart.js
var ctx = document.getElementById('myLineChart').getContext('2d');
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: x,
    datasets: [{
      label: 'Water Tank Level',
      data: y1,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6
    },
      {
        label: 'Water Flow Rate',
        data: y2,
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false // On utilise notre propre légende
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
});

// Fonction pour récupérer les valeurs des capteurs
function actualiserValeurCapteurs() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);

      try {
        var responseData = JSON.parse(this.responseText);
        x = [];
        y1 = [];
        y2 = [];

        for (let i = 0; i < responseData.length; i++) {
          if (responseData[i]["Flow"] && responseData[i]["Level"] && responseData[i]["temps"]) {
            x.push(responseData[i]["temps"]);
            y1.push(responseData[i]["Level"]);
            y2.push(responseData[i]["Flow"]);
          }
        }

        // Mettre à jour le graphique et les valeurs des capteurs
        updateChart();
        updateSensorsValues();
      } catch (error) {
        console.error('Erreur lors du parsing JSON:', error);
        // Générer des données de test si pas de backend
        generateTestData();
        updateChart();
        updateSensorsValues();
      }
    }
  };

  xhr.open("GET", "h.php", true);
  xhr.send();
}

// Fonction pour mettre à jour le graphique
function updateChart() {
  myLineChart.data.labels = x;
  myLineChart.data.datasets[0].data = y1;
  myLineChart.data.datasets[1].data = y2;
  myLineChart.update('none'); // Animation désactivée pour les mises à jour fréquentes
}

// Fonction pour mettre à jour les valeurs des capteurs
function updateSensorsValues() {
  let levelElement = document.getElementById("level");
  let flowElement = document.getElementById("flow");

  if (y1.length > 0 && y2.length > 0) {
    levelElement.innerHTML = y1[y1.length - 1] + " L";
    flowElement.innerHTML = y2[y2.length - 1] + " m³/s";
  }
}

// Fonction pour récupérer les valeurs des jauges (actuateurs)
function actualiserValeurGauge() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);

      try {
        if (this.responseText) {
          var responseData = JSON.parse(this.responseText);
          updateGaugeValue(responseData["f_v_rate"], responseData["dr_v_rate"]);
        }
      } catch (error) {
        console.error('Erreur lors du parsing JSON des jauges:', error);
        // Générer des valeurs de test pour les jauges
        let fillValue = Math.floor(Math.random() * 100);
        let drainValue = Math.floor(Math.random() * 100);
        updateGaugeValue(fillValue, drainValue);
      }
    }
  };

  xhr.open("GET", "actuators.php", true);
  xhr.send();
}

// Fonction pour mettre à jour les jauges
function updateGaugeValue(value1, value2) {
  // Calculer le dash array basé sur la valeur
  var dashArray1 = (value1 / 100) * 314/2; // 314 est la circonférence du cercle (2 * π * radius)
  var dashArray2 = (value2 / 100) * 314/2;

  // Mettre à jour le dash array pour les arcs colorés
  document.getElementById("coloredArc1").style.strokeDasharray = dashArray1 + " 314";
  document.getElementById("coloredArc2").style.strokeDasharray = dashArray2 + " 314";

  // Obtenir les couleurs pour les valeurs
  var color1 = getColorForValue(value1);
  var color2 = getColorForValue(value2);

  // Calculer les angles pour les pointeurs
  var angle1 = (value1 / 100) * 180 - 90;
  var angle2 = (value2 / 100) * 180 - 90;

  // Mettre à jour les pointeurs
  document.getElementById("pointer1").setAttribute("transform", "rotate(" + angle1 + " 100 100)");
  document.getElementById("pointer2").setAttribute("transform", "rotate(" + angle2 + " 100 100)");

  // Définir les couleurs pour les arcs colorés et les pointeurs
  document.getElementById("coloredArc1").style.stroke = color1;
  document.getElementById("pointer1").style.fill = color1;

  document.getElementById("coloredArc2").style.stroke = color2;
  document.getElementById("pointer2").style.fill = color2;

  // Mettre à jour les valeurs affichées
  document.getElementById("gauge-value-1").textContent = value1 + "%";
  document.getElementById("gauge-value-2").textContent = value2 + "%";
}

// Fonction pour déterminer la couleur basée sur la valeur
function getColorForValue(value) {
  if (value < 25) {
    return "#e74c3c"; // Rouge
  } else if (value < 50) {
    return "#f39c12"; // Orange
  } else if (value < 75) {
    return "#f1c40f"; // Jaune
  } else {
    return "#27ae60"; // Vert
  }
}

// Fonction pour le contrôle à distance du niveau
function levelRemoteContol() {
  let levelInput = document.getElementById("level-input");
  if (levelInput.value && levelInput.value > 0) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "remote.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("Commande de niveau envoyée:", levelInput.value);
        // Optionnel: afficher un message de confirmation
        showNotification("Commande envoyée avec succès!", "success");
      }
    };
    xhr.send("data=" + levelInput.value);
  } else {
    alert("Veuillez entrer une valeur valide pour le niveau");
  }
}

// Fonction pour afficher des notifications
function showNotification(message, type = "info") {
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transition: all 0.3s ease;
        ${type === 'success' ? 'background: #27ae60;' :
      type === 'error' ? 'background: #e74c3c;' :
          'background: #3498db;'}
    `;

  document.body.appendChild(notification);

  // Supprimer la notification après 3 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Fonction pour générer des données de test (quand le backend n'est pas disponible)
function generateTestData() {
  x = [];
  y1 = [];
  y2 = [];

  const now = new Date();
  for (let i = 19; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // Données toutes les minutes
    x.push(time.toLocaleTimeString());
    y1.push(Math.floor(Math.random() * 100) + 20); // Niveau entre 20 et 120
    y2.push(Math.floor(Math.random() * 50) + 10);  // Flow entre 10 et 60
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Gestion du checkbox pour activer/désactiver le contrôle à distance
  let remoteCheckbox = document.getElementById("label-check");
  let sendBtn = document.getElementById("send");

  remoteCheckbox.addEventListener('change', function() {
    if (this.checked) {
      sendBtn.removeAttribute('disabled');
      showNotification("Contrôle à distance activé", "success");
    } else {
      sendBtn.setAttribute('disabled', true);
      showNotification("Contrôle à distance désactivé", "info");
    }
  });

  // Gestion de l'input niveau avec validation
  let levelInput = document.getElementById("level-input");
  levelInput.addEventListener('input', function() {
    const value = parseFloat(this.value);
    if (value < 0) {
      this.value = 0;
    } else if (value > 200) {
      this.value = 200;
    }
  });

  // Gestion de l'envoi avec la touche Entrée
  levelInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !sendBtn.disabled) {
      levelRemoteContol();
    }
  });

  // Initialiser les données de test au chargement
  generateTestData();
  updateChart();
  updateSensorsValues();

  // Simuler les valeurs des jauges au démarrage
  updateGaugeValue(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
});

// Rafraîchir les valeurs automatiquement
setInterval(actualiserValeurCapteurs, 5000); // Toutes les 5 secondes
setInterval(actualiserValeurGauge, 5000);   // Toutes les 5 secondes

// Fonction pour simuler des données en temps réel (pour le développement)
function simulateRealTimeData() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();

  // Ajouter un nouveau point de données
  x.push(timeString);
  y1.push(Math.floor(Math.random() * 100) + 20);
  y2.push(Math.floor(Math.random() * 50) + 10);

  // Garder seulement les 20 derniers points
  if (x.length > 20) {
    x.shift();
    y1.shift();
    y2.shift();
  }

  updateChart();
  updateSensorsValues();
}

// Fonction pour exporter les données du graphique
function exportChartData() {
  const data = {
    timestamps: x,
    levels: y1,
    flows: y2,
    exportTime: new Date().toISOString()
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'water_tank_data_' + new Date().toISOString().slice(0, 10) + '.json';
  link.click();

  URL.revokeObjectURL(url);
  showNotification("Données exportées avec succès!", "success");
}

// Fonction pour réinitialiser les données du graphique
function resetChartData() {
  if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données?")) {
    x = [];
    y1 = [];
    y2 = [];
    updateChart();
    updateSensorsValues();
    showNotification("Données réinitialisées", "info");
  }
}

// Fonction pour basculer entre mode simulation et mode réel
let simulationMode = false;
let simulationInterval;

function toggleSimulation() {
  simulationMode = !simulationMode;

  if (simulationMode) {
    simulationInterval = setInterval(simulateRealTimeData, 2000);
    showNotification("Mode simulation activé", "info");
  } else {
    clearInterval(simulationInterval);
    showNotification("Mode simulation désactivé", "info");
  }
}

// Gestion des erreurs réseau
window.addEventListener('offline', function() {
  showNotification("Connexion réseau perdue - Mode hors ligne", "error");
});

window.addEventListener('online', function() {
  showNotification("Connexion réseau rétablie", "success");
});

// Fonction pour ajuster la taille du graphique lors du redimensionnement
window.addEventListener('resize', function() {
  myLineChart.resize();
});

// Fonctions utilitaires pour le débogage
function logSystemStatus() {
  console.log("=== État du système ===");
  console.log("Données X:", x.length, "points");
  console.log("Données Y1 (Level):", y1.length, "points");
  console.log("Données Y2 (Flow):", y2.length, "points");
  console.log("Dernières valeurs:", {
    level: y1[y1.length - 1],
    flow: y2[y2.length - 1],
    time: x[x.length - 1]
  });
  console.log("Mode simulation:", simulationMode);
  console.log("======================");
}

// Ajouter les fonctions au scope global pour le débogage
window.debugFunctions = {
  logSystemStatus,
  exportChartData,
  resetChartData,
  toggleSimulation,
  generateTestData: () => {
    generateTestData();
    updateChart();
    updateSensorsValues();
  }
};