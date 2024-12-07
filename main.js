const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { analyzeFrequency, generateNumbers } = require('./generator.js'); // Import logic for analyzing and generating numbers

let mainWindow;

app.on('ready', () => {
    // Create the main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script for secure Node.js access
            contextIsolation: true, // Enable context isolation for security
        },
    });

    mainWindow.loadFile('index.html'); // Load the HTML file
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle the 'generate-numbers' IPC event
ipcMain.handle('generate-numbers', (event, data) => {
    try {
        const frequencies = analyzeFrequency(data); // Analyze frequencies
        const numbers = generateNumbers(frequencies); // Generate numbers based on frequencies
        return numbers; // Return the result to the renderer
    } catch (error) {
        console.error('Error generating numbers:', error);
        throw error;
    }
});

// Handle file selection
ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });
    return result.filePaths[0]; // Return the selected file path
});

// Read data from selected file and return stats
ipcMain.handle('read-file-data', async (event, filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
            .trim()
            .split('\n')
            .map(line => line.split(' ').map(Number));

        // Compute stats
        const totalNumbers = data.flat().length;
        const uniqueNumbers = new Set(data.flat()).size;
        const numRows = data.length;

        // Find most and least occurring numbers
        const occurrences = data.flat().reduce((acc, num) => {
            acc[num] = (acc[num] || 0) + 1;
            return acc;
        }, {});

        const sortedOccurrences = Object.entries(occurrences)
            .map(([num, count]) => ({ number: parseInt(num), count }))
            .sort((a, b) => b.count - a.count);

        const mostOccurring = sortedOccurrences.slice(0, 5);
        const leastOccurring = sortedOccurrences.slice(-5);

        // Find consecutive repeats
        const consecutiveRepeats = [];
        for (let i = 1; i < data.length; i++) {
            data[i].forEach(num => {
                // If number exists in the previous row and not already in consecutiveRepeats, add it
                if (data[i - 1].includes(num) && !consecutiveRepeats.includes(num)) {
                    consecutiveRepeats.push(num);
                }
            });
        }

        // Find numbers to avoid based on frequent repeats
        const numbersToAvoid = mostOccurring.slice(0, 3).map(item => item.number);

        return {
            totalNumbers,
            uniqueNumbers,
            numRows,
            mostOccurring,
            leastOccurring,
            consecutiveRepeats,  // Consecutive repeated numbers are now correctly handled
            numbersToAvoid,
            data
        };
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});
