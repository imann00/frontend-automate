document.addEventListener("DOMContentLoaded", function () {
  const gaugeElement = document.querySelector(".gauge");
  const gaugeElement2 = document.querySelector(".gauge2");
  const levelwts1 = document.querySelector(".wts1");
  const flowwts2 = document.querySelector(".wts2");

  function setGaugeValue(gauge, value) {
    if (value < 0 || value > 1) {
      return;
    }

    gauge.querySelector(".gauge__fill").style.transform = `rotate(${
      value / 2
    }turn)`;
    gauge.querySelector(".gauge__cover").textContent = `${Math.round(
      value * 100
    )}%`;

    console.log(gauge.querySelector(".gauge__fill").style.transform);
  }

  function fetchGaugeValue() {
    fetch("http://localhost/automatebackend/db.php?action=fetchGaugeValue")
      .then(response => response.json())
      .then(data => {
        const level = data.Level;
        const flow = data.Flow;
        setGaugeValue(gaugeElement, level / 30);
        setGaugeValue(gaugeElement2, level / 30);

        levelwts1.textContent = level;
        flowwts2.textContent = flow;

        createHistoricalPlot();
        
        console.log("Updated gauge value: " + level);
      })
      .catch(error => {
        console.error('Error fetching gauge value:', error);
      });
  }

  // Initial fetch
  fetchGaugeValue();

  // Polling interval (in milliseconds)
  const pollingInterval = 1000; // Adjust as needed

  // Polling loop
  setInterval(fetchGaugeValue, pollingInterval);
  function createHistoricalPlot() {
    fetch("http://localhost/automatebackend/db.php?action=fetchHistoricalData")
      .then(response => response.json())
      .then(data => {
        const flowData = data.map(entry => entry.Flow);
        const levelData = data.map(entry => entry.Level);
        const timeData = data.map(entry => entry.time); 

        const ctx = document.getElementById('historicalPlot').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: timeData, 
            datasets: [{
              label: 'Flow',
              data: flowData,
              borderColor: 'blue',
              fill: false
            }, {
              label: 'Level',
              data: levelData,
              borderColor: 'red',
              fill: false
            }]
          },
          options: {
            title: {
              display: true,
              text: 'Historical Flow and Level Data'
            },
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Value'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Time and Date' 
                }
              }]
            }
          }
        });
      })
      .catch(error => {
        console.error('Error fetching historical data:', error);
      });
  }
});
