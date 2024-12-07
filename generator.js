const fs = require('fs');

// Load historical data
const data = fs.readFileSync('data.txt', 'utf8')
  .trim()
  .split('\n')
  .map(line => line.split(' ').map(Number));

// Analyze common pairs and triplets
const analyzeFrequency = (data) => {
  const pairFrequency = {};
  const tripletFrequency = {};

  data.forEach(line => {
    for (let i = 0; i < line.length; i++) {
      for (let j = i + 1; j < line.length; j++) {
        const pair = [line[i], line[j]].sort((a, b) => a - b).join(',');
        pairFrequency[pair] = (pairFrequency[pair] || 0) + 1;

        for (let k = j + 1; k < line.length; k++) {
          const triplet = [line[i], line[j], line[k]].sort((a, b) => a - b).join(',');
          tripletFrequency[triplet] = (tripletFrequency[triplet] || 0) + 1;
        }
      }
    }
  });

  return { pairFrequency, tripletFrequency };
};

const frequencies = analyzeFrequency(data);
//console.log('Common pairs:', frequencies.pairFrequency);
//console.log('Common triplets:', frequencies.tripletFrequency);



const generateNumbers = (frequencies) => {
    const result = [];
    while (result.length < 5) {
      const tensGroups = [[], [], [], [], []]; // Arrays for each tens group
      for (let i = 1; i <= 50; i++) {
        tensGroups[Math.floor((i - 1) / 10)].push(i);
      }
  
      const selectedTens = [];
      while (selectedTens.length < 3) {
        const group = Math.floor(Math.random() * 5);
        if (!selectedTens.includes(group)) selectedTens.push(group);
      }
  
      const potentialNumbers = selectedTens.flatMap(group => tensGroups[group]);
      const selectedNumbers = [];
  
      while (selectedNumbers.length < 5) {
        const num = potentialNumbers[Math.floor(Math.random() * potentialNumbers.length)];
        if (!selectedNumbers.includes(num)) {
          selectedNumbers.push(num);
        }
      }
  
      const oddCount = selectedNumbers.filter(n => n % 2 !== 0).length;
      const evenCount = selectedNumbers.length - oddCount;
  
      if (
        selectedNumbers.some(n => n % 10 === 0) && // At least one number ending with 0
        selectedNumbers.every((n, i, arr) => i === 0 || arr[i] - arr[i - 1] !== 1) && // No consecutive numbers
        (oddCount === 3 && evenCount === 2 || oddCount === 2 && evenCount === 3) // Odd/even ratio
      ) {
        result.push(selectedNumbers.sort((a, b) => a - b));
      }
    }
  
    return result;
  };
  
  const generatedNumbers = generateNumbers(frequencies);
  //console.log('Generated Numbers:', generatedNumbers);
  
  module.exports = { analyzeFrequency, generateNumbers };