/*
	Frequency Volume Reduction v1.0.2 by AAD
	https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Frequency-Volume-Reduction
*/

// Frequency data
const valueFrequency = [95.9, 107.9];

// Set initial stream volume
streamVolume = 1;
// Global variables for other plugins
pluginFrequencyVolumeReduction = true;
pluginFrequencyVolumeReductionActive = false;

// Check and update Stream.Volume
function checkAndUpdateVolume() {
    // Get the value of the span element with ID "data-frequency"
    const dataFrequencySpan = document.getElementById("freq-container").querySelector("#data-frequency");
    const dataFrequency = parseFloat(dataFrequencySpan.textContent.trim());

	valueStreamVolume = streamVolume || 1;

    // Check if data-frequency matches any value in valueFrequency array
    if (valueFrequency.some(freq => dataFrequency >= (freq - 0.195) && dataFrequency <= (freq + 0.195))) {
        reduceVolume(2);
    } else if (dataFrequency) {
		restoreVolume();
    }
}

// Reduce volume
function reduceVolume(reductionValue) {
    if (typeof pluginSignalMeterSmallSquelchActive == 'undefined' || (typeof pluginSignalMeterSmallSquelchActive !== 'undefined' && !pluginSignalMeterSmallSquelchActive)) {
        if (Stream) { Stream.Volume = valueStreamVolume / reductionValue; }
        // Display tempMessage and restart the timer
        displayMessage();
        pluginFrequencyVolumeReductionActive = true;
    }
}

let tempMessage = '🔉';
let e = document.getElementById("tuner-name");
let messageDisplayed = false;
let timerVolumeReduction;

// Display tempMessage and start/reset the timer
function displayMessage() {
    // Check if the message is not already displayed
    if (!messageDisplayed && window.innerWidth >= 768) {
        e.innerHTML += tempMessage;
        messageDisplayed = true;
        // Remove the last <br> from the element with the ID tuner-desc
        tunerDesc = document.getElementById('tuner-name');
        lastBrElement = tunerDesc.querySelector('br:last-child');
        if (lastBrElement) {
            lastBrElement.remove();
        }
        // Add tooltip
        tunerDesc.classList.add("tooltip-freq-vol");
        tunerDesc.setAttribute("data-tooltip", "Volume attenuated for this frequency.");
        tunerDesc.style.cursor = 'pointer';
        initFreqVolTooltips();
    }

    // If there's a running timer, clear it and restart
    if (timerVolumeReduction) {
        clearTimeout(timerVolumeReduction);
    }

    // Start the timer to remove tempMessage
    timerVolumeReduction = setTimeout(() => {
        e.innerHTML = e.innerHTML.replace(tempMessage, '');
        messageDisplayed = false;
        // Remove tooltip
        tunerDesc.classList.remove("tooltip-freq-vol");
        tunerDesc.removeAttribute("data-tooltip");
        tunerDesc.style.cursor = 'auto';
    }, 300000);
}

// Restore volume
function restoreVolume() {
    if (typeof pluginSignalMeterSmallSquelchActive == 'undefined' || (typeof pluginSignalMeterSmallSquelchActive !== 'undefined' && !pluginSignalMeterSmallSquelchActive)) {
        if (Stream) { Stream.Volume = valueStreamVolume; }
    }
    if (timerVolumeReduction) {
        clearTimeout(timerVolumeReduction);
        timerVolumeReduction = setTimeout(() => {
            e.innerHTML = e.innerHTML.replace(tempMessage, '');
            messageDisplayed = false;
            pluginFrequencyVolumeReductionActive = false;
            // Remove tooltip
            tunerDesc.classList.remove("tooltip");
            tunerDesc.removeAttribute("title");
            tunerDesc.style.cursor = 'auto';
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

// Tooltip
function initFreqVolTooltips() {
    $('.tooltip-freq-vol').off('mouseenter mouseleave mousemove'); // Remove previous event handlers
    $('.tooltiptext').remove(); // Remove any existing tooltips
    $('.tooltip-freq-vol').hover(function(e){
        if (!messageDisplayed) { return; } // Exit if message is not currently displayed
        var tooltipText = $(this).data('tooltip');
        // Add a delay of 500 milliseconds before creating and appending the tooltip
        $(this).data('timeout', setTimeout(() => {
            var tooltip = $('<div class="tooltiptext"></div>').html(tooltipText);
            $('body').append(tooltip);

            var posX = e.pageX;
            var posY = e.pageY;

            var tooltipWidth = tooltip.outerWidth();
            var tooltipHeight = tooltip.outerHeight();
            posX -= tooltipWidth / 2;
            posY -= tooltipHeight + 10;
            tooltip.css({ top: posY, left: posX, opacity: .99 }); // Set opacity to 1
            // For touchscreen devices
            if ((/Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) && ('ontouchstart' in window || navigator.maxTouchPoints)) {
                setTimeout(() => { $('.tooltiptext').remove(); }, 10000);
                document.addEventListener('touchstart', function() { setTimeout(() => { $('.tooltiptext').remove(); }, 500); });
            }
        }, 500));
    }, function() {
        // Clear the timeout if the mouse leaves before the delay completes
        clearTimeout($(this).data('timeout'));
        $('.tooltiptext').remove();
    }).mousemove(function(e){
        var tooltipWidth = $('.tooltiptext').outerWidth();
        var tooltipHeight = $('.tooltiptext').outerHeight();
        var posX = e.pageX - tooltipWidth / 2;
        var posY = e.pageY - tooltipHeight - 10;

        $('.tooltiptext').css({ top: posY, left: posX });
    });
}
