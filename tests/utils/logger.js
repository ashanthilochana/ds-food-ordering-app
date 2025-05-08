import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'test-results', 'test-execution.log');
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'screenshots');

// Ensure directories exist
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Keep last N test runs
const RUNS_TO_KEEP = 3;

class Logger {
    constructor() {
        this.currentTestName = '';
        this.currentTestDir = '';
        this.currentRunTimestamp = Date.now();
    }

    setCurrentTest(testName) {
        // Sanitize test name for folder name
        const sanitizedName = testName.replace(/[^a-zA-Z0-9-_]/g, '-');
        this.currentTestName = sanitizedName;
        
        // Create test-specific directory with timestamp
        this.currentTestDir = path.join(
            SCREENSHOT_DIR,
            `${this.currentRunTimestamp}_${sanitizedName}`
        );
        
        if (!fs.existsSync(this.currentTestDir)) {
            fs.mkdirSync(this.currentTestDir, { recursive: true });
        }
    }

    cleanupOldScreenshots() {
        if (!fs.existsSync(SCREENSHOT_DIR)) return;

        // Get all test directories and sort by date (newest first)
        const dirs = fs.readdirSync(SCREENSHOT_DIR)
            .filter(file => fs.statSync(path.join(SCREENSHOT_DIR, file)).isDirectory())
            .map(dir => ({
                name: dir,
                path: path.join(SCREENSHOT_DIR, dir),
                time: fs.statSync(path.join(SCREENSHOT_DIR, dir)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        // Keep only the most recent N runs
        dirs.slice(RUNS_TO_KEEP).forEach(dir => {
            fs.rmSync(dir.path, { recursive: true, force: true });
            this.log(`Deleted old test directory: ${dir.name}`);
        });
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(LOG_FILE, logMessage);
    }

    async takeScreenshot(driver, name) {
        if (!this.currentTestDir) {
            this.log('Warning: No test directory set. Using default directory.');
            this.setCurrentTest('unknown-test');
        }

        const timestamp = Date.now();
        const filename = `${name}-${timestamp}.png`;
        const filepath = path.join(this.currentTestDir, filename);
        
        const image = await driver.takeScreenshot();
        fs.writeFileSync(filepath, image, 'base64');
        this.log(`Screenshot saved: ${this.currentTestName}/${filename}`);
    }

    init() {
        this.log('Initializing test run...');
        this.currentRunTimestamp = Date.now();
        this.cleanupOldScreenshots();
        this.log('Cleaned up old screenshots');
    }
}

export const logger = new Logger();
