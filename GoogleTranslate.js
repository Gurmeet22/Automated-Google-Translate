const fs = require('fs')
const parser = require('csv-parser')
const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox');
const options = new firefox.Options();
options.addArguments("-headless");
const url = 'https://translate.google.co.in/'
const csvPath = './CSV files/translations.csv'
const {languages} = require('./languages')

const csvData = {
    text: [],
    language: []
}
const finalData = []
let count = 0, index = 0

const Scrape = async () => {
    const driver = await new Builder().forBrowser('firefox').build();
    try {
        await driver.get(url);
        console.log('Hi')
        fs.createReadStream(csvPath)
        .pipe(parser({delimiter: ','}))
        .on('data', (data) => {
            csvData.text.push(data.Text)
            csvData.language.push(data.Language)
            // console.log(data)
        })
        .on('end', async () => {
            // console.log(csvData);
            try{
                while(count < csvData.text.length){
                    if(csvData.text[count].length>5000){
                        console.log('Length exceeded 5000 characters')
                        finalData.push({
                            text: "\""+csvData.text[count]+"\"",
                            languageToTranslateText: "\""+csvData.language[count]+"\"",
                            translatedText:'The text that need to be translated limited to 5000 characters only.'
                          });
                        AddDataToCSV(finalData);
                        driver.findElement(By.id('source')).clear();
                        count++;
                        continue
                    }
                    await driver.findElement(By.id('source')).sendKeys(csvData.text[count])
                    await driver.findElement(By.className('tl-more tlid-open-target-language-list')).click()
                    if(languages[0][csvData.language[count].toLowerCase()]){
                        console.log('Exists')
                        const id = languages[0][csvData.language[count].toLowerCase()].trim()
                        // await driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+id+'"]')).click()
                        try{
                            await driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+id+'"]')).click()
                        } catch(e) {
                            console.log("Exception caught 1 ");
                        }
                        try{
                            await driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+id+'item-selected item-emhasized"]')).click()
                        } catch(e) {
                            console.log("Exception caught 2 ");
                        }
                        try{
                            await driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+id+'item-emhasized"]')).click()
                        } catch(e) {
                            console.log("Exception caught 3 ");
                        }
                        try{
                            await driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+id+'item-selected"]')).click()
                        } catch(e) {
                            console.log("Exception caught 4 ");
                        }
                        const translatedText = await driver.findElement(By.xpath('//div[@class="tlid-results-container"]/div/div/div[2]/div/span')).getText()
                        console.log(translatedText)
                        finalData.push({
                            text: "\""+csvData.text[count]+"\"",
                            languageToTranslateText: "\""+csvData.language[count]+"\"",
                            translatedText: "\""+translatedText+"\""
                          });
                        AddDataToCSV(finalData);
                        await driver.findElement(By.id('source')).clear()
                    } else {
                        console.log('Language does not exist')
                        await driver.findElement(By.className('tl-more tlid-open-target-language-list')).click()
                        await driver.findElement(By.id('source')).clear()
                        finalData.push({
                            text: "\""+csvData.text[count]+"\"",
                            languageToTranslateText: "\""+csvData.language[count]+"\"",
                            translatedText:'Language Not Found.'
                          });
                        AddDataToCSV(finalData);
                    }
                    count++
                }
            } catch(e) {
                console.log(e)
            }
        });
        
    } catch(e) {
        console.log(e)
    }
}

Scrape()

const AddDataToCSV = (array) => {
 
    fs.appendFileSync('./CSV files/translatedData.csv', ''
    + array[index].text + ','
    + array[index].languageToTranslateText + ','
    + array[index].translatedText + ','
    + '\n');
    array = [];
    index++;
}

const quit = async () => {
    try {
        await driver.close()
        await driver.quit()
    } catch {
        console.log('Could not quit')
    }
}