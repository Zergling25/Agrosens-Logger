(function () {
    const STORAGE_KEY = 'agrosens_telemetry_records_v1';

    const form = document.getElementById('sensor-form');
    const errorBanner = document.getElementById('error-banner');
    const statusMessage = document.getElementById('status-message');
    const logList = document.getElementById('log-list');
    const logCount = document.getElementById('log-count');
    const emptyMessage = document.getElementById('empty-message');
    const clearButton = document.getElementById('clear-logs');

    const fields = {
        ph: document.getElementById('ph'),
 ec: document.getElementById('ec'),
 temperature: document.getElementById('temperature'),
 humidity: document.getElementById('humidity')
    };

    let sensorLogs = loadLogs();

    // These buttons fill in example readinng so the status rules can be tested
    const testReadings = {
        optimal: { ph: 6.0, ec: 1.5, temperature: 68, humidity: 60 },
        warning: { ph: 7.0, ec: 2.5, temperature: 75, humidity: 45 },
        critical: { ph: 4.0, ec: 0.1, temperature: 50, humidity: 20 }
    };

    document.querySelectorAll('button[data-test]').forEach(function (button) {
        button.addEventListener('click', function () {
            const example = testReadings[button.dataset.test];
            form.elements.bay.value = 'Bay 1';

            Object.keys(fields).forEach(function (name) {
                fields[name].value = example[name];
                validateField(name);
            });

            errorBanner.hidden = true;
            errorBanner.textContent = '';
        });
    });

    function loadLogs() {
        try {
            const savedLogs = localStorage.getItem(STORAGE_KEY);
            return savedLogs ? JSON.parse(savedLogs) : [];
        } catch (error) {
            return [];
        }
    }

    function saveLogs() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sensorLogs));
    }

    function getFieldError(name, value) {
        if (value === '' || !Number.isFinite(Number(value))) {
            return 'Please enter a number.';
        }

        const number = Number(value);

        if (name === 'ph' && (number < 0 || number > 14)) {
            return 'pH must be between 0 and 14.';
        }
        if (name === 'ec' && number < 0) {
            return 'EC cannot be negative.';
        }
        if (name === 'humidity' && (number < 0 || number > 100)) {
            return 'Humidity must be between 0 and 100%.';
        }

        return '';
    }

    function validateField(name) {
        const field = fields[name];
        const errorText = document.getElementById(name + '-error');
        const message = getFieldError(name, field.value);

        field.classList.toggle('invalid', Boolean(message));
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        errorText.textContent = message;
        return message;
    }

    function validateForm() {
        const errors = [];

        Object.keys(fields).forEach(function (name) {
            const message = validateField(name);
            if (message) {
                errors.push(message);
            }
        });

        if (!form.elements.bay.value) {
            errors.push('Please choose a greenhouse bay.');
        }

        errorBanner.textContent = errors.join(' ');
        errorBanner.hidden = errors.length === 0;
        return errors.length === 0;
    }

    function classifyReading(reading) {
        const criticalPH = reading.ph < 5.0 || reading.ph > 7.5;
        const criticalTemp = reading.temperature < 55 || reading.temperature > 95;
        const criticalEC = reading.ec < 0.2 || reading.ec > 4.5;
        const criticalHumidity = reading.humidity < 30 || reading.humidity > 90;

        if (criticalPH && criticalTemp && criticalEC && criticalHumidity) {
            return 'Critical Hazard';
        }

        if (
            reading.ph >= 5.5 && reading.ph <= 6.5 &&
            reading.temperature >= 64.4 && reading.temperature <= 71.6 &&
            reading.ec >= 1.0 && reading.ec <= 2.0 &&
            reading.humidity >= 50 && reading.humidity <= 70
        ) {
            return 'Optimal';
        }

        return 'Warning';
    }

    function statusClass(status) {
        if (status === 'Optimal') return 'optimal';
        if (status === 'Critical Hazard') return 'critical';
        return 'warning';
    }

    function showLatestStatus() {
        if (sensorLogs.length === 0) {
            statusMessage.textContent = 'No readings have been recorded yet.';
            statusMessage.className = '';
            return;
        }

        const latest = sensorLogs[0];
        statusMessage.textContent = latest.bay + ': ' + latest.status +
        ' (pH ' + latest.ph + ', EC ' + latest.ec + ' mS/cm, ' +
        latest.temperature + '°F, humidity ' + latest.humidity + '%).';
        statusMessage.className = 'status-label ' + statusClass(latest.status);
    }

    function renderLogs() {
        logList.textContent = '';
        const fragment = document.createDocumentFragment();

        sensorLogs.forEach(function (reading) {
            const item = document.createElement('li');
            item.className = 'log-card ' + statusClass(reading.status);
            item.dataset.id = reading.id;

            const heading = document.createElement('h3');
            heading.textContent = reading.bay + ' - ' + reading.status;

            const details = document.createElement('p');
            details.textContent = 'pH: ' + reading.ph + ' | EC: ' + reading.ec +
            ' mS/cm | Temperature: ' + reading.temperature + '°F | Humidity: ' + reading.humidity + '%';

            const date = document.createElement('p');
            date.textContent = 'Recorded: ' + reading.timestamp;

            const status = document.createElement('span');
            status.className = 'status-label ' + statusClass(reading.status);
            status.textContent = reading.status;

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-log';
            deleteButton.dataset.deleteId = reading.id;
            deleteButton.textContent = 'Delete';
            deleteButton.setAttribute('aria-label', 'Delete reading for ' + reading.bay);

            item.appendChild(heading);
            item.appendChild(details);
            item.appendChild(date);
            item.appendChild(status);
            item.appendChild(document.createTextNode(' '));
            item.appendChild(deleteButton);
            fragment.appendChild(item);
        });

        logList.appendChild(fragment);
        logCount.textContent = sensorLogs.length;
        emptyMessage.hidden = sensorLogs.length > 0;
        clearButton.disabled = sensorLogs.length === 0;
        showLatestStatus();
    }

    Object.keys(fields).forEach(function (name) {
        fields[name].addEventListener('input', function () {
            validateField(name);
            if (!errorBanner.hidden && validateForm()) {
                errorBanner.hidden = true;
            }
        });
    });

    form.elements.bay.addEventListener('change', function () {
        if (!errorBanner.hidden && validateForm()) {
            errorBanner.hidden = true;
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const reading = {
            id: Date.now(),
                          bay: form.elements.bay.value,
                          ph: Number(fields.ph.value),
                          ec: Number(fields.ec.value),
                          temperature: Number(fields.temperature.value),
                          humidity: Number(fields.humidity.value),
                          status: '',
                          timestamp: new Date().toLocaleString()
        };

        reading.status = classifyReading(reading);
        sensorLogs.unshift(reading);
        saveLogs();
        renderLogs();
        form.reset();

                          Object.keys(fields).forEach(function (name) {
                              fields[name].classList.remove('invalid');
                              fields[name].setAttribute('aria-invalid', 'false');
                              document.getElementById(name + '-error').textContent = '';
                          });
        errorBanner.hidden = true;
    });

    logList.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-delete-id]');
        if (!button) return;

        const id = Number(button.dataset.deleteId);
        sensorLogs = sensorLogs.filter(function (reading) {
            return reading.id !== id;
        });
        saveLogs();
        renderLogs();
    });

    clearButton.addEventListener('click', function () {
        sensorLogs = [];
        saveLogs();
        renderLogs();
    });

    renderLogs();
})();
