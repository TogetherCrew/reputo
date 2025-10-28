export function getAvailableAlgorithms() {
  console.log('getAvailableAlgorithms');
}

// Keep the service running
console.log('Workflows service starting...');
setInterval(() => {
  console.log('Workflows service is running...');
}, 30000); // Log every 30 seconds
