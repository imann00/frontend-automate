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

  function fetchWaterSensors(){
    fetch("http://localhost/automatebackend/actuator.php?action=fetchWaterSensors")
      .then(response => response.json())
      .then(data => {
        const filling = data['filling valve_rate'];
        const draining = data['draining valve_rate'];

        setGaugeValue(gaugeElement, filling/100);
        setGaugeValue(gaugeElement2, draining/100);

        createHistoricalPlot();

      })
      .catch(error => {
        console.error('Error fetching gauge value:', error);
      });
  }
  function fetchGaugeValue() {

    fetch("http://localhost/automatebackend/capteurs.php?action=fetchGaugeValue")
      .then(response => response.json())
      .then(data => {
        const level = data.Level;
        const flow = data.Flow;
        

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
  fetchWaterSensors();
  // Polling interval (in milliseconds)
  const pollingInterval = 1000; // Adjust as needed

  // Polling loop
  setInterval(fetchGaugeValue, pollingInterval);
  function createHistoricalPlot() {
    fetch("http://localhost/automatebackend/capteurs.php?action=fetchHistoricalData")
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

// document.getElementById("sendButton").addEventListener("click", function() {
//   // Get the value from the input field
//   var levelValue = document.getElementById("levelInput").value;
  
//   // Get the state of the checkbox and convert it to a string
//   var isChecked = document.getElementById("checkboxIsChecked").checked.toString();
//   console.log("level "+levelValue)
//   // Send an AJAX request to the server
//   var xhr = new XMLHttpRequest();
//   xhr.open("POST", "save_remote_control.php", true);
//   xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//   xhr.onreadystatechange = function() {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//       // Response from the server
//       console.log(xhr.responseText);
//     }
//   };
//   xhr.send("levelValue=" + levelValue + "&isChecked=" + isChecked);
// });

function send() {

  var levelValue = document.getElementById("levelInput").value;
  
  // Get the state of the checkbox and convert it to a string
  var isChecked = document.getElementById("checkboxIsChecked").checked.toString();
  console.log("level "+levelValue)
  // Send an AJAX request to the server
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost/automatebackend/Rmcontrol.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // Response from the server
      console.log(xhr.responseText);
    }
  };
  xhr.send("levelValue=" + levelValue + "&isChecked=" + isChecked);


}

