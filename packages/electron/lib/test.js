const ChildProcess = require('child_process')
const path = require('path')
const electronPath = require('electron');
const webdriver = require('selenium-webdriver')

module.exports = () => {
    const command = require.resolve('electron-chromedriver/bin/chromedriver.exe');
    const options = {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    }
    
    const chromeDriverProcess = ChildProcess.spawn(command, [], options)
    
    chromeDriverProcess.on('close', code => {
      if (code !== 0) {
        throw new Error(`Chromedriver exited with error code: ${code}`)
      }
    })
    
    chromeDriverProcess.on('error', error => { throw new Error(error) })

    const driver = new webdriver.Builder()
    // The "9515" is the port opened by chrome driver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
        chromeOptions: {
        // Here is the path to your Electron binary.
        binary: electronPath,
        }
    })
    .forBrowser('electron')
    .build()

    driver.get('http://www.google.com')
    driver.findElement(webdriver.By.name('q')).sendKeys('webdriver')
    driver.findElement(webdriver.By.name('btnG')).click()
    driver.wait(() => {
    return driver.getTitle().then((title) => {
        return title === 'webdriver - Google Search'
    })
    }, 1000)

    driver.quit()
    
};
