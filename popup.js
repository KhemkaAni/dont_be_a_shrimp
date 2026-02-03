document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.interval-btn');
  const customInput = document.getElementById('custom-minutes');
  const customBtn = document.getElementById('custom-btn');
  const feedback = document.getElementById('feedback');

  let feedbackTimeout;

  // Load saved interval and highlight the active button
  chrome.storage.local.get(['reminderInterval'], (result) => {
    const savedInterval = result.reminderInterval || 30;
    highlightActiveButton(savedInterval);
  });

  // Handle preset button clicks
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const minutes = parseInt(button.dataset.minutes, 10);
      setInterval(minutes);
    });
  });

  // Handle custom interval
  customBtn.addEventListener('click', () => {
    const minutes = parseInt(customInput.value, 10);
    if (minutes && minutes >= 1 && minutes <= 1440) {
      setInterval(minutes);
    } else {
      showFeedback('Please enter 1-1440 minutes', true);
    }
  });

  // Allow Enter key to set custom interval
  customInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      customBtn.click();
    }
  });

  function setInterval(minutes) {
    chrome.storage.local.set({ reminderInterval: minutes }, () => {
      highlightActiveButton(minutes);

      // Send message to background to update alarm
      chrome.runtime.sendMessage({
        action: 'updateAlarm',
        minutes: minutes
      });

      // Show feedback
      const timeText = formatTime(minutes);
      showFeedback(`Reminder set for every ${timeText}`);
    });
  }

  function formatTime(minutes) {
    if (minutes === 60) return '1 hour';
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  }

  function showFeedback(message, isError = false) {
    // Clear any existing timeout
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }

    feedback.textContent = message;
    feedback.style.backgroundColor = isError
      ? 'rgba(180, 80, 80, 0.15)'
      : 'rgba(45, 42, 38, 0.08)';
    feedback.classList.add('show');

    // Hide after 2.5 seconds
    feedbackTimeout = setTimeout(() => {
      feedback.classList.remove('show');
    }, 2500);
  }

  function highlightActiveButton(minutes) {
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.minutes, 10) === minutes) {
        btn.classList.add('active');
      }
    });

    // Show custom value in input if it's not a preset
    const presetValues = [15, 30, 45, 60];
    if (!presetValues.includes(minutes)) {
      customInput.value = minutes;
    } else {
      customInput.value = '';
    }
  }
});
