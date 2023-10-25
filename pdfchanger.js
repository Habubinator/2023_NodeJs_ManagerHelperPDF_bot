const {PDFDocument, PDFForm, StandardFonts, PDFFont} = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require("fs")

async function replaceText(inputFileName, outputFileName, replacements) {

  function findReplacement(formName){
    let res = null;
    replacements.forEach(element =>{
      if(element.find == formName){
        res = element.replace
      }
    })
    return res;
  }  

  const formPdfBytes = fs.readFileSync(inputFileName)
  const pdfDoc = await PDFDocument.load(formPdfBytes)
  pdfDoc.registerFontkit(fontkit); // Для кастомного шрифту
  const fontBytes = fs.readFileSync("./static/Montserrat-Regular.ttf");
  const customFont = await pdfDoc.embedFont(fontBytes);

  const form = pdfDoc.getForm()


  // Перевірка які поля для вводу є у PDF файлі та їх зміна
  const fields = form.getFields()
  fields.forEach(field => {
    const name = field.getName()
    const change_field = form.getTextField(name)
    // const type = field.constructor.name
    // console.log(`${type}: ${name}`)

    // Невеликий костиль
    if(name == "currDate"){
      change_field.setText((new Date()).toLocaleDateString('en-GB'))
    }else if(name == "id"){
      change_field.setText(Math.floor(Math.random())*100+"382472893")
    }else{
      change_field.setText(findReplacement(name))
    }
    // change_field.setFontSize(11);
    change_field.updateAppearances(customFont);
  })

  // ПІСЛЯ ПРАВОК ЦЯ ЧАСТИНА КОДУ НЕ ПОТРІБНА

  // Вставка зображення до документу

  // const imageBytes = fs.readFileSync(photoName)
  // const image = await pdfDoc.embedPng(imageBytes)

  // const { width: imgWidth, height: imgHeight } = image.scaleToFit(105,125)

  //   // Вставка зображення по координатам на першу сторінку
  //   pdfDoc.getPages()[0].drawImage(image, {
  //     x: 475,
  //     y: 590,
  //     width: imgWidth,
  //     height: imgHeight,
  //   });

  const pdfBytes = await pdfDoc.save()

  return fs.writeFileSync(outputFileName, pdfBytes);
}

module.exports = {replaceText}