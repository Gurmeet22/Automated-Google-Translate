const fs = require('fs')
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

let count = 0
const result = {
    arrayLang: [],
    arrayIndex: []
}
const languages = {}
let finalData = ''

const getId = async () => {
    const driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
    try {
        await driver.get(url);
        console.log('Hi')
        await driver.findElement(By.className('tl-more tlid-open-target-language-list')).click()
        while(count <104){
            let x = 2 + count;
            let id = await driver.findElement(By.xpath('//div[@class="language-list-unfiltered-langs-tl_list"]/div[2]/div['+x+']')).getAttribute('class')
            let name = await driver.findElement(By.xpath('//div[@class="'+id+'"]/div[2]')).getText()
            let ids = ''
            if(id.split('-').length == 3){
                ids = id.split('-')[1] + '-' + id.split('-')[2]
            } else {
                ids = id.split('-')[1]
            }
            ids = ids.replace(' item-selected', '')
            if(name == ''){
                name = 'English'
            }
            result.arrayLang.push(name)
            result.arrayIndex.push(ids)
            // console.log(result)
            count++;
        }
        for(var i=0;i<result.arrayIndex.length;i++){
            languages[result.arrayLang[i]] = result.arrayIndex[i]
        }
        finalData = "exports.languages = [" + JSON.stringify(languages) + "]"
        // console.log(finalData)
        await fs.writeFile('./languages.js', '' + finalData + '\n', (err) => {
            if(!err){
                console.log('File created successfully')
            }
        })
    } catch(e){
        console.log(e)
    }
};

getId()

const quit = async () => {
    try {
        await driver.close()
        await driver.quit()
    } catch {
        console.log('Could not quit')
    }
}