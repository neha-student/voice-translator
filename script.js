const languages = {
    "en-GB": "English",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "it-IT": "Italian",
    "pt-PT": "Portuguese",
    "ru-RU": "Russian",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "zh-CN": "Chinese",
    "hi-IN": "Hindi",
    "ar-SA": "Arabic",
    "bn-IN": "Bengali",
    "id-ID": "Indonesian",
    "nl-NL": "Dutch",
    "tr-TR": "Turkish",
    "vi-VN": "Vietnamese",
    "pl-PL": "Polish",
    "uk-UA": "Ukrainian",
    "th-TH": "Thai"
};

const selectFrom = document.getElementById('lang-from');
const selectTo = document.getElementById('lang-to');
const textFrom = document.getElementById('text-from');
const textTo = document.getElementById('text-to');
const translateBtn = document.getElementById('translate-btn');
const swapBtn = document.getElementById('swap-btn');
const copyBtn = document.getElementById('copy-btn');
const countSpan = document.getElementById('count');
const micBtn = document.getElementById('mic-btn');
const speakFromBtn = document.getElementById('speak-from-btn');
const speakToBtn = document.getElementById('speak-to-btn');

// Initialize select options
function populateSelect(selectElement, defaultVal) {
    for (let code in languages) {
        let option = document.createElement('option');
        option.value = code;
        option.textContent = languages[code];
        if (code === defaultVal) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    }
}

populateSelect(selectFrom, "en-GB");
populateSelect(selectTo, "es-ES");

// Character count logic
textFrom.addEventListener('input', () => {
    const length = textFrom.value.length;
    if (length > 500) {
        textFrom.value = textFrom.value.substring(0, 500);
    }
    countSpan.textContent = textFrom.value.length;
});

// Swap languages logic
swapBtn.addEventListener('click', () => {
    let tempCode = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempCode;

    let tempText = textFrom.value;
    textFrom.value = textTo.value;
    textTo.value = tempText;

    countSpan.textContent = textFrom.value.length;
    
    if (textTo.value) {
        copyBtn.disabled = false;
        speakToBtn.disabled = false;
    } else {
        copyBtn.disabled = true;
        speakToBtn.disabled = true;
    }
});

// Copy translation logic
copyBtn.addEventListener('click', () => {
    if (textTo.value) {
        navigator.clipboard.writeText(textTo.value).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="#10b981" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        });
    }
});

// Translation logic
translateBtn.addEventListener('click', async () => {
    let text = textFrom.value.trim();
    if (!text) return;

    let translateFrom = selectFrom.value;
    let translateTo = selectTo.value;

    translateBtn.innerHTML = '<span class="loading"></span>';
    translateBtn.style.pointerEvents = "none";
    textTo.placeholder = "Translating...";
    
    try {
        let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;
        let res = await fetch(apiUrl);
        let data = await res.json();
        
        if (data.responseData && data.responseData.translatedText) {
            textTo.value = data.responseData.translatedText;
            copyBtn.disabled = false;
            speakToBtn.disabled = false;
        } else {
            textTo.value = "Translation failed. Try again.";
            copyBtn.disabled = true;
            speakToBtn.disabled = true;
        }
    } catch (error) {
        console.error("Error during translation", error);
        textTo.value = "Error during translation. Try again.";
        copyBtn.disabled = true;
        speakToBtn.disabled = true;
    } finally {
        translateBtn.innerHTML = 'Translate Text';
        translateBtn.style.pointerEvents = "auto";
        textTo.placeholder = "Translation will appear here...";
    }
});

// Text to Speech
function speakText(text, lang) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

speakFromBtn.addEventListener('click', () => {
    speakText(textFrom.value, selectFrom.value);
});

speakToBtn.addEventListener('click', () => {
    speakText(textTo.value, selectTo.value);
});

// Speech to Text
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    micBtn.addEventListener('click', () => {
        recognition.lang = selectFrom.value;
        const isRecording = micBtn.classList.contains('recording');
        
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    recognition.onstart = () => {
        micBtn.classList.add('recording');
        micBtn.style.color = '#ef4444'; // Red color while recording
    };
    
    recognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.style.color = '';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const currentText = textFrom.value;
        const newText = currentText ? currentText + ' ' + transcript : transcript;
        
        if (newText.length <= 500) {
            textFrom.value = newText;
            countSpan.textContent = textFrom.value.length;
        } else {
            textFrom.value = newText.substring(0, 500);
            countSpan.textContent = 500;
        }
    };
} else {
    micBtn.style.display = 'none'; // Hide if not supported
}
