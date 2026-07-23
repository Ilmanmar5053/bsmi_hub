const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🚀 Memulai generate PDF...');
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, 'Proposal_BSMI_Hub.html');
    await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts and images to fully load
    await new Promise(r => setTimeout(r, 3000));

    const outputPath = path.resolve(__dirname, 'Proposal_BSMI_Hub.pdf');

    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '18mm',
            bottom: '20mm',
            left: '18mm'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false,
    });

    console.log('✅ PDF berhasil di-generate!');
    console.log('📄 Lokasi file: ' + outputPath);
    
    await browser.close();
})();
