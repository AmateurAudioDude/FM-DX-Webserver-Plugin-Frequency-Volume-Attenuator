/*
	Frequency Volume Reduction v1.0 by AAD
	https://github.com/AmateurAudioDude
*/

// Frequency data
const valueFrequency = [99.1, 103.9];

// Set initial stream volume
streamVolume = 1;

// updateVolume also exists in /js/3las/main.js
function updateVolume() {
	streamVolume = $(this).val();
	setTimeout(() => Stream.Volume = $(this).val(), 100);
}

// Check and update Stream.Volume
function checkAndUpdateVolume() {
    // Get the value of the span element with ID "data-frequency"
    const dataFrequencySpan = document.getElementById("freq-container").querySelector("#data-frequency");
    const dataFrequency = parseFloat(dataFrequencySpan.textContent.trim());

	valueStreamVolume = streamVolume || 1;

    // Check if data-frequency matches any value in valueFrequency array
    if (valueFrequency.some(freq => dataFrequency >= (freq - 0.195) && dataFrequency <= (freq + 0.195))) {
        reduceVolume(2.25);
    } else if (dataFrequency) {
		restoreVolume();
    }
}

// Reduce volume
function reduceVolume(reductionValue) {
    Stream.Volume = valueStreamVolume / reductionValue;

    // Display tempMessage and restart the timer
    displayMessage();
}

let tempMessage = '🔉';
let e = document.getElementById("tuner-name");
let messageDisplayed = false;
let timer;

// Display tempMessage and start/reset the timer
function displayMessage() {
    // Check if the message is not already displayed
    if (!messageDisplayed && window.innerWidth >= 768) {
        e.innerHTML += tempMessage;
        messageDisplayed = true;
        // Remove the last <br> from the element with the ID tuner-desc
        const tunerDesc = document.getElementById('tuner-name');
        const lastBrElement = tunerDesc.querySelector('br:last-child');
        if (lastBrElement) {
            lastBrElement.remove();
        }
    }

    // If there's a running timer, clear it and restart
    if (timer) {
        clearTimeout(timer);
    }

    // Start the timer to remove tempMessage
    timer = setTimeout(() => {
        e.innerHTML = e.innerHTML.replace(tempMessage, '');
        messageDisplayed = false;
    }, 300000);
}

// Restore volume
function restoreVolume() {
    Stream.Volume = valueStreamVolume;
    if (timer) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            e.innerHTML = e.innerHTML.replace(tempMessage, '');
            messageDisplayed = false;
        }, 500);
    }
}

// Initial check and update
checkAndUpdateVolume();

// Create a MutationObserver to monitor changes in the value of "data-frequency"
const observer = new MutationObserver(checkAndUpdateVolume);

// Define the target node to observe
const targetNode = document.getElementById("freq-container");

// Configuration of the observer:
const config = { childList: true, subtree: true };

// Start observing the target node for changes in its content
observer.observe(targetNode, config);
