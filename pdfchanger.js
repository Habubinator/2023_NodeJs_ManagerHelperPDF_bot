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

    // const type = field.constructor.name
    // console.log(`${type}: ${name}`)

    // Невеликий костиль
    if(name == "currDate"){
      form.getTextField(name).setText((new Date()).toLocaleDateString('en-GB'))
    }else{
      form.getTextField(name).setText(findReplacement(name))
    }
    // form.getTextField(name).setFontSize(11);
    form.getTextField(name).updateAppearances(customFont);
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