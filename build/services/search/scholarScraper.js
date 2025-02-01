const puppeteer = require('puppeteer');

class ScholarScraper {
  constructor(downloadPath = './downloads') {
    this.downloadPath = downloadPath;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async searchScholar(query, maxResults = 10) {
    await this.page.goto(`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
    
    const results = await this.page.evaluate((maxResults) => {
      const articles = [];
      const items = document.querySelectorAll('.gs_ri');
      
      items.slice(0, maxResults).forEach(item => {
        const titleEl = item.querySelector('.gs_rt a');
        const authorEl = item.querySelector('.gs_a');
        const snippetEl = item.querySelector('.gs_rs');
        const citationEl = item.querySelector('.gs_fl a');
        
        articles.push({
          title: titleEl ? titleEl.innerText : 'No Title',
          link: titleEl ? titleEl.href : null,
          authors: authorEl ? authorEl.innerText : 'Unknown Authors',
          snippet: snippetEl ? snippetEl.innerText : 'No snippet available',
          citations: citationEl ? citationEl.innerText : '0 citations'
        });
      });
      
      return articles;
    }, maxResults);

    return results;
  }

  async downloadPDF(articleUrl, fileName) {
    await this.page.goto(articleUrl, { waitUntil: 'networkidle2' });
    
    const pdfLinks = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter(link => 
          link.href.toLowerCase().includes('.pdf') || 
          link.textContent.toLowerCase().includes('pdf')
        )
        .map(link => link.href);
    });

    if (pdfLinks.length > 0) {
      const pdfUrl = pdfLinks[0];
      
      const pdfPath = require('path').join(this.downloadPath, `${fileName}.pdf`);
      await this.page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: this.downloadPath
      });

      await this.page.goto(pdfUrl);
      
      return pdfPath;
    }

    throw new Error('No PDF found');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async generateCitation(article, format = 'APA') {
    switch(format) {
      case 'APA':
        return `${article.authors}. (${new Date().getFullYear()}). ${article.title}. Retrieved from ${article.link}`;
      case 'MLA':
        const authors = article.authors.split(',');
        return `${authors[0]} et al. "${article.title}." Web. ${new Date().getFullYear()}.`;
      default:
        return JSON.stringify(article);
    }
  }
}

module.exports = ScholarScraper;