describe('Company Details Capture', () => {
  before(() => {
    cy.login();
  });

  after(() => {
    cy.logout();
  });
  
  it('Captures information and stores it for the first, third, and last companies from all alphabet pages', () => {

    const companyIndices = [0, 2, -1];

    function captureCompanyDetails(companyUrl) {
      const companyData = {};

      cy.visit(companyUrl);

      // Company Name
      cy.get('.company-details-name').invoke('text').then((name) => {
        companyData.companyName = name.trim();
      });

      // Logo
      cy.get('.company-details-img-wrap img').invoke('attr', 'src').then((src) => {
        if (src) {
          const absoluteUrl = src.startsWith('http') ? src : `https://www.medicines.org.uk${src}`;
          const logoFileName = `${companyData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_logo.png`;
          companyData.logoFilename = logoFileName;
          cy.getCookies().then((cookies) => {
            const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            
            cy.request({
              url: absoluteUrl,
              encoding: 'binary',
              headers: {
                Cookie: '',
              },
            }).then((response) => {
              cy.writeFile(`cypress/downloads/logos/${logoFileName}`, response.body, 'binary');
            });            
          });
        }
      });      

      // Contact Information
      cy.get('.company-contacts-item').each(($el) => {
        const label = $el.find('.company-contacts-item-title').text().trim();
        const value = $el.find('span, a').text().trim();
        companyData[label] = value;
      });

      // Save data to JSON
      cy.then(() => {
        const jsonFileName = `${companyData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        cy.writeFile(`cypress/downloads/data/${jsonFileName}`, companyData);
      });
    }

    function processPage() {
      cy.get('.browse-results a').then(($companies) => {
        const totalCompanies = $companies.length;
        if (totalCompanies === 0) {
          cy.log('No companies found on this page.');
          return;
        }
        const selectedIndices = companyIndices
          .map(index => (index === -1 ? totalCompanies - 1 : index))
          .filter(index => index < totalCompanies);

        if (selectedIndices.length === 0) {
          cy.log('No valid companies to capture.');
          return;
        }

        cy.log(`Selected Companies: ${selectedIndices.map(i => $companies.eq(i).text().trim())}`);

        selectedIndices.forEach((companyIndex) => {
          cy.wrap($companies.eq(companyIndex)).invoke('attr', 'href').then((href) => {
            const companyUrl = `https://www.medicines.org.uk${href}`;
            captureCompanyDetails(companyUrl);
            cy.go('back');
            cy.get('.browse-results a').should('exist');
          });
        });
      });
    }

    // Navigate
    cy.get('.browse-menu a').each(($link, index) => {
      cy.get('.browse-menu a').eq(index).click();
      cy.wait(1000);

      cy.get('.browse-results a').then(($companies) => {
        const letter = $link.text().trim();
        if ($companies.length === 0) {
          cy.log(`No companies found for letter ${letter}`);
        } else {
          cy.log(`Processing companies for letter ${letter}`);
          processPage();
        }
      });

      cy.go('back');
      cy.get('.browse-menu a').should('exist');
    });
  });
});
