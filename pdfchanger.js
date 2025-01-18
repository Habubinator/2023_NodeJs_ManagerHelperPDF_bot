const { PDFDocument, PDFForm, StandardFonts, PDFFont } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");

async function replaceText(inputFileName, outputFileName, replacements) {
  function findReplacement(formName) {
    let res = null;
    replacements.forEach((element) => {
      if (element.find == formName) {
        res = element.replace;
      }
    });
    return res;
  }

  const formPdfBytes = fs.readFileSync(inputFileName);
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  pdfDoc.registerFontkit(fontkit); // Для кастомного шрифту
  const fontBytes = fs.readFileSync("./static/Montserrat-Regular.ttf");
  const customFont = await pdfDoc.embedFont(fontBytes);

  const form = pdfDoc.getForm();

  // Перевірка які поля для вводу є у PDF файлі та їх зміна
  const fields = form.getFields();
  fields.forEach((field) => {
    const name = field.getName();
    const change_field = form.getTextField(name);
    if (name == "currDate") {
      change_field.setText(new Date().toLocaleDateString("en-GB"));
    } else if (name == "id") {
      change_field.setText(
        Math.floor(Math.random() * (999 - 100 + 1)) + 100 + "382472893"
      );
    } else if (name == "fullName2") {
      change_field.setText(findReplacement("fullName"));
    } else {
      change_field.setText(findReplacement(name));
    }
    change_field.updateAppearances(customFont);
  });
  form.flatten();
  const pdfBytes = await pdfDoc.save();

  return fs.writeFileSync(outputFileName, pdfBytes);
}

module.exports = { replaceText };
