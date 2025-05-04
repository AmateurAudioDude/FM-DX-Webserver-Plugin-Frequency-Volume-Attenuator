/*
	Frequency Volume Attenuator v1.0.4 by AAD
	https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Frequency-Volume-Attenuator
*/

(() => {

// Frequency data, set your custom frequencies here
const valueFrequency = [95.9, 107.9];
const valueBandwidth = 290; // kHz. 100 = no attenuation for side frequencies. Default: 290

const pluginVersion = '1.0.4';
const pluginName = "Frequency Volume Attenuator";
const pluginHomepageUrl = "https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Frequency-Volume-Attenuator";
const pluginUpdateUrl = "https://raw.githubusercontent.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Frequency-Volume-Attenuator/refs/heads/main/FrequencyVolumeReduction/pluginFrequencyVolumeReduction.js";
const pluginSetupOnlyNotify = true;
const CHECK_FOR_UPDATES = true;

// Set initial stream volume
if (window.location.pathname === '/setup') window.newVolumeGlobal = 0;
streamVolume = newVolumeGlobal || 1;
// Global variables for other plugins
pluginFrequencyVolumeReduction = true;
pluginFrequencyVolumeReductionActive = false;

const freqBandwidth = ((valueBandwidth / 1000) - 0.095);
// Check and update Stream.Volume
function checkAndUpdateVolume() {
    // Get the value of the span element with ID "data-frequency"
    const dataFrequencySpan = document.getElementById("freq-container").querySelector("#data-frequency");
    const dataFrequency = parseFloat(dataFrequencySpan.textContent.trim());

    valueStreamVolume = newVolumeGlobal || 1;

    // Check if data-frequency matches any value in valueFrequency array
    if (valueFrequency.some(freq => dataFrequency >= (freq - freqBandwidth) && dataFrequency <= (freq + freqBandwidth))) {
        reduceVolume(2);
    } else if (dataFrequency) {
        restoreVolume();
    }
}

// Reduce volume
function reduceVolume(reductionValue) {
    if (typeof pluginSignalMeterSmallSquelchActive == 'undefined' || (typeof pluginSignalMeterSmallSquelchActive !== 'undefined' && !pluginSignalMeterSmallSquelchActive)) {
        if (Stream) Stream.Volume = valueStreamVolume / reductionValue;
        // Display tempMessage and restart the timer
        displayMessage();
        pluginFrequencyVolumeReductionActive = true;
    }
}

let tempMessage = '\u{1F50A}';
let tunerDesc;
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
    if (timerVolumeReduction) {
        clearTimeout(timerVolumeReduction);
        timerVolumeReduction = setTimeout(() => {
            e.innerHTML = e.innerHTML.replace(tempMessage, '');
            messageDisplayed = false;
            pluginFrequencyVolumeReductionActive = false;
            if ((typeof pluginSignalMeterSmallSquelchActive == 'undefined' || (typeof pluginSignalMeterSmallSquelchActive !== 'undefined' && !pluginSignalMeterSmallSquelchActive)) && Stream) Stream.Volume = valueStreamVolume;
            // Remove tooltip
            tunerDesc = document.getElementById('tuner-name');
            tunerDesc.classList.remove("tooltip");
            tunerDesc.removeAttribute("title");
            tunerDesc.style.cursor = 'auto';
        }, 750);
    }
}

// Initial check and update
if (window.location.pathname !== '/setup') checkAndUpdateVolume();

// Create a MutationObserver to monitor changes in the value of "data-frequency"
const observer = new MutationObserver(checkAndUpdateVolume);

// Define the target node to observe
const targetNode = document.getElementById("freq-container");

// Configuration of the observer:
const config = { childList: true, subtree: true };

// Start observing the target node for changes in its content
if (window.location.pathname !== '/setup') observer.observe(targetNode, config);

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

// Function for update notification in /setup
function checkUpdate(setupOnly, pluginVersion, pluginName, urlUpdateLink, urlFetchLink) {
    if (setupOnly && window.location.pathname !== '/setup') return;

    // Function to check for updates
    async function fetchFirstLine() {
        const urlCheckForUpdate = urlFetchLink;

        try {
            const response = await fetch(urlCheckForUpdate);
            if (!response.ok) {
                throw new Error(`[${pluginName}] update check HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            const lines = text.split('\n');

            let version;

            if (lines.length > 2) {
                const versionLine = lines.find(line => line.includes("const pluginVersion =") || line.includes("const plugin_version ="));
                if (versionLine) {
                    const match = versionLine.match(/const\s+plugin[_vV]ersion\s*=\s*['"]([^'"]+)['"]/);
                    if (match) {
                        version = match[1];
                    }
                }
            }

            if (!version) {
                const firstLine = lines[0].trim();
                version = /^\d/.test(firstLine) ? firstLine : "Unknown"; // Check if first character is a number
            }

            return version;
        } catch (error) {
            console.error(`[${pluginName}] error fetching file:`, error);
            return null;
        }
    }

    // Check for updates
    fetchFirstLine().then(newVersion => {
        if (newVersion) {
            if (newVersion !== pluginVersion) {
                let updateConsoleText = "There is a new version of this plugin available";
                // Any custom code here
                
                console.log(`[${pluginName}] ${updateConsoleText}`);
                setupNotify(pluginVersion, newVersion, pluginName, urlUpdateLink);
            }
        }
    });

    function setupNotify(pluginVersion, newVersion, pluginName, urlUpdateLink) {
        if (window.location.pathname === '/setup') {
          const pluginSettings = document.getElementById('plugin-settings');
          if (pluginSettings) {
            const currentText = pluginSettings.textContent.trim();
            const newText = `<a href="${urlUpdateLink}" target="_blank">[${pluginName}] Update available: ${pluginVersion} --> ${newVersion}</a><br>`;

            if (currentText === 'No plugin settings are available.') {
              pluginSettings.innerHTML = newText;
            } else {
              pluginSettings.innerHTML += ' ' + newText;
            }
          }

          const updateIcon = document.querySelector('.wrapper-outer #navigation .sidenav-content .fa-puzzle-piece') || document.querySelector('.wrapper-outer .sidenav-content') || document.querySelector('.sidenav-content');

          const redDot = document.createElement('span');
          redDot.style.display = 'block';
          redDot.style.width = '12px';
          redDot.style.height = '12px';
          redDot.style.borderRadius = '50%';
          redDot.style.backgroundColor = '#FE0830' || 'var(--color-main-bright)'; // Theme colour set here as placeholder only
          redDot.style.marginLeft = '82px';
          redDot.style.marginTop = '-12px';

          updateIcon.appendChild(redDot);
        }
    }
}

if (CHECK_FOR_UPDATES) checkUpdate(pluginSetupOnlyNotify, pluginVersion, pluginName, pluginHomepageUrl, pluginUpdateUrl);

})();
