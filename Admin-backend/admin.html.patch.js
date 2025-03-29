/**
 * This script helps patch the admin.html file
 * Run this file with Node.js after updating the code
 */
const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'Admin_frontend', 'admin.html');
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Replace the week selection with session selection
const weekSelectorHTML = `
                <div class="form-group">
                    <label for="week-number">Select Week:</label>
                    <div class="week-number-selector">
                        <button type="button" class="week-arrow" id="decrease-week">-</button>
                        <input type="number" id="week-number" min="1" value="1" readonly>
                        <button type="button" class="week-arrow" id="increase-week">+</button>
                    </div>
                    <div class="week-value-display" id="week-value-display">Week 1</div>
                    <input type="hidden" id="week" name="week" value="Week 1">
                </div>`;

const sessionSelectorHTML = `
                <div class="form-group">
                    <label for="session-selector">Select Session:</label>
                    <select id="session-selector" class="form-control">
                        <option value="Session 2021">Session 2021</option>
                        <option value="Session 2022">Session 2022</option>
                        <option value="Session 2023">Session 2023</option>
                        <option value="Session 2024">Session 2024</option>
                    </select>
                    <div class="session-value-display" id="session-value-display">Session 2021</div>
                    <input type="hidden" id="session" name="session" value="Session 2021">
                </div>`;

html = html.replace(weekSelectorHTML, sessionSelectorHTML);

fs.writeFileSync(adminHtmlPath, html);
console.log('Successfully updated admin.html');a