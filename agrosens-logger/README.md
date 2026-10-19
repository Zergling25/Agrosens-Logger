Assignment 2A:
4.1 U
Starting State: The page displays a sensor entry form and previously saved logs loaded
from localStorage.
Action 1: The Data Entry and Real Time Constraint Check. The user selects a greenhouse
bay and enters pH, EC, temperature, and humidity. Labels, units, and placeholders
explain the expected values. JavaScript checks the readings as the user types and
displays errors for values outside acceptable plant growth ranges.
Action 2: The Log Submission. The user clicks Record Reading. The form checks required
fields and rejects physically invalid values, such as pH outside 0 to 14 or negative EC and
humidity values.
Action 3: The Output Telemetry Inspection. JavaScript calculates the status and displays
the submitted readings with an Optimal, Warning, or Critical Hazard label. The new log is
added to the log list and saved in localStorage.
Action 4: The Output Resolution. The user can click delete on an individual log or click
“Clear All Logs” to remove the entire history. The displayed list and saved data are
updated.
Lastly, the Terminal State: The page displays the latest status and remaining logs. Saved
readings remain available after refreshing the browser.
4.2
Gulf of Execution: Visible labels, units, and placeholders help users understand what to
enter. For example, EC is measured in mS/cm and humidity is measured as a percentage.
Gulf of Evaluation: After submission, JavaScript displays the calculated status. CSS colors
distinguish Optimal, Warning, and Critical Hazard readings.
System Constraint: HTML uses type="number", required, and appropriate min, max, and
step attributes. JavaScript also rejects physically invalid values before saving them.
Visual Feedback State: An input event listener checks values while the user types.
JavaScript displays an error message and adds an error CSS class, such as a red border,
when a value falls outside the preferred growth range.
Error Recovery: Users can correct input errors, delete individual logs, or clear all logs.
JavaScript updates localStorage after the changs.
Status Rules:
• Critical Hazard: All four conditions must be true, where pH below 5.0 or above 7.5,
temperature below 55F or above 95F, EC below 0.2 or above 4.5, and humidity
below 30% or above 90%.
• Optimal: pH is 5.5 to 6.5, temperature is 64.4 to 71.6F, EC is 1.0 to 2.0 mS/cm, and
humidity is 50 to 70%.
• Warning: The reading is neither Critical Hazard nor Optimal (?)
4.3
• <html lang="en"> [STATIC]
• <head> [STATIC]: page title, metadata, CSS link, and <script src="app.js"
defer>.
• <body> [STATIC]
• <header> [STATIC]: <h1> page title. CSS: padding.
• <main> [STATIC]: CSS: display: grid; gap: 1rem; padding: 1rem.
• <section id="sensor-panel"> [STATIC]: <h2> and <form
id="sensor-form"> [STATIC] (Event: submit).
• Bay <select required> [STATIC] with a visible label.
• pH <input type="number" min="0" max="14"
step="any" required> [STATIC]. Unit: none.
• EC <input type="number" min="0" step="any"
required> [STATIC]. Unit: mS/cm.
• Temperature <input type="number" step="any"
required> [STATIC]. Unit: F.
• Humidity <input type="number" min="0" max="100"
step="any" required> [STATIC]. Unit: %.
• Each field has a label, placeholder, and error message
element referenced by aria-describedby. Error message
elements are [STATIC]; their text and error styling are
[DYNAMIC]. Sensor fields have an input event.
• Record Reading <button type="submit"> [STATIC].
• <section id="latest-status"> [STATIC]: <h2> and status
message [DYNAMIC].
• <section id="log-panel"> [STATIC]: <h2> and <ul id="log-list">
[STATIC]. CSS: display: grid; gap: 0.5rem.
• Each <li> contains the reading details and a delete
button [DYNAMIC] (Event: click through the log list).
• Clear All Logs button [STATIC] (Event: click).
• <footer> [STATIC]: the basic page information.
JavaScript Events: The Form submission validates and saves the readings. Input events
check values and update errors. Click events delete individual logs or clear all logs.
4.4
const sensorLogSchema = {
id: "Number",
bay: "String",
ph: "Number",
ec: "Number",
temperature: "Number",
humidity: "Number",
status: "String",
timestamp: "String"
};
let sensorLogs = [];
The schema defines the readings keys and data types. The sensorLogs array stores the
readings in memory. JSON.stringify() and localStorage.setItem() save the logs while
localStorage.getItem() and JSON.parse() load them. The stored data is updated whenever
logs are added or removed.
