const { PdfDocument } = require("@ironsoftware/ironpdf");

let defaultFolder = "./pdfs-pngs";

async function pdfToPic(chatID, filename) {
  try {
    await PdfDocument.fromFile(
      defaultFolder + "/" + "result" + chatID + ".pdf"
    ).then((resolve) => {
      resolve.rasterizeToImageFiles(
        defaultFolder + "/" + filename + ".png",
        {}
      );
      resolve;
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { pdfToPic };
