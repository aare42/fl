const { db, initialize } = require('./database');

const seedData = {
  organizations: [
    { name: 'ПриватБанк', description: 'Найбільший банк України' },
    { name: 'Monobank', description: 'Цифровий мобільний банк' },
    { name: 'ПУМБ', description: 'Перший Український Міжнародний Банк' },
    { name: 'Ощадбанк', description: 'Державний ощадний банк України' },
  ],
  
  tags: [
    'Особисті фінанси',
    'Кредитування',
    'Інвестиції',
    'Страхування',
    'Банківські послуги',
    'Мобільний банкінг',
    'Фінансова грамотність',
    'Бюджетування'
  ],
  
  cases: [
    {
      name: 'Планування сімейного бюджету',
      description: 'Кейс про створення та ведення сімейного бюджету для молодої родини',
      organization_id: 1,
      file_type: '.pdf',
      tags: ['Особисті фінанси', 'Бюджетування', 'Фінансова грамотність']
    },
    {
      name: 'Вибір кредиту на житло',
      description: 'Аналіз різних кредитних пропозицій для покупки нерухомості',
      organization_id: 1,
      file_type: '.pdf',
      tags: ['Кредитування', 'Особисті фінанси']
    },
    {
      name: 'Мобільний банкінг для початківців',
      description: 'Основи використання мобільного додатка банку',
      organization_id: 2,
      file_type: '.pdf',
      tags: ['Мобільний банкінг', 'Банківські послуги', 'Фінансова грамотність']
    },
    {
      name: 'Інвестиційна стратегія для молоді',
      description: 'Як розпочати інвестувати з невеликою сумою',
      organization_id: 3,
      file_type: '.pdf',
      tags: ['Інвестиції', 'Особисті фінанси', 'Фінансова грамотність']
    },
    {
      name: 'Страхування життя та здоров\'я',
      description: 'Порівняння страхових продуктів для фізичних осіб',
      organization_id: 4,
      file_type: '.pdf',
      tags: ['Страхування', 'Особисті фінанси']
    }
  ]
};

async function seed() {
  console.log('Initializing database...');
  await initialize();
  
  console.log('Seeding organizations...');
  const organizationIds = {};
  for (const org of seedData.organizations) {
    const result = await new Promise((resolve, reject) => {
      db.run('INSERT OR IGNORE INTO organizations (name, description) VALUES (?, ?)', 
        [org.name, org.description], 
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    organizationIds[org.name] = result;
    console.log(`  Added organization: ${org.name}`);
  }

  console.log('Seeding tags...');
  const tagIds = {};
  for (const tagName of seedData.tags) {
    const result = await new Promise((resolve, reject) => {
      db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName], function(err) {
        if (err) reject(err);
        else {
          // Get the tag ID
          db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
            if (err) reject(err);
            else resolve(row.id);
          });
        }
      });
    });
    tagIds[tagName] = result;
    console.log(`  Added tag: ${tagName}`);
  }

  console.log('Seeding cases...');
  for (const caseData of seedData.cases) {
    // Create dummy file path (since we don't have actual files)
    const fileName = caseData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + caseData.file_type;
    const filePath = `uploads/sample-${fileName}`;
    
    const caseId = await new Promise((resolve, reject) => {
      db.run('INSERT INTO cases (name, description, file_path, file_type, organization_id) VALUES (?, ?, ?, ?, ?)',
        [caseData.name, caseData.description, filePath, caseData.file_type, caseData.organization_id],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Add tags to case
    for (const tagName of caseData.tags) {
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO case_tags (case_id, tag_id) VALUES (?, ?)',
          [caseId, tagIds[tagName]],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    console.log(`  Added case: ${caseData.name}`);
  }

  console.log('Seeding completed successfully!');
  
  // Show summary
  const counts = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        (SELECT COUNT(*) FROM organizations) as orgs,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM cases) as cases
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });
  
  console.log(`Summary: ${counts.orgs} organizations, ${counts.tags} tags, ${counts.cases} cases`);
  
  db.close();
}

seed().catch(console.error);