document.addEventListener("DOMContentLoaded", function () {
  const gaugeElement = document.querySelector(".gauge");
  const gaugeElement2 = document.querySelector(".gauge2");

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
    fetch("http://localhost:8080/gauge")
      .then(response => response.json())
      .then(data => {
        setGaugeValue(gaugeElement, data);
        setGaugeValue(gaugeElement2, data);

        console.log("Updated gauge value: " + data);
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
});
