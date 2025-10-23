import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Exports a DOM element as a styled PDF using html-to-image
 * @param {string} elementId - The ID of the element to export
 * @param {string} fileName - Desired name of the exported PDF
 */
export async function exportToPDF(elementId, fileName = "export.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  try {
    // Convert HTML element to PNG
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      quality: 1,
      pixelRatio: 2, // higher quality
    });

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      let position = 0;
      let heightLeft = pdfHeight;

      // Add pages if content exceeds one page
      while (heightLeft > 0) {
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        if (heightLeft > 0) {
          pdf.addPage();
          position = -heightLeft;
        }
      }

      pdf.save(fileName);
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}
