const fs = require('fs');
const path = require('path');
const dir = '../frontend/src';

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix the broken strings: 'http://:5000...'
  // Some might be in backticks: `http://:5000...`
  // We want them all to be dynamically using window.location.hostname

  if (content.includes("'http://:5000")) {
    // Single quotes
    content = content.replace(/'http:\/\/:5000([^']*)'/g, "`http://${window.location.hostname}:5000$1`");
    modified = true;
  }
  
  if (content.includes("`http://:5000")) {
    // Backticks
    content = content.replace(/`http:\/\/:5000/g, "`http://${window.location.hostname}:5000");
    modified = true;
  }
  
  // What about localhost:5000 that were not broken?
  if (content.includes("'http://localhost:5000")) {
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`http://${window.location.hostname}:5000$1`");
    modified = true;
  }
  
  if (content.includes("`http://localhost:5000")) {
    content = content.replace(/`http:\/\/localhost:5000/g, "`http://${window.location.hostname}:5000");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
};

const walk = (dir) => {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      replaceInFile(p);
    }
  });
};

walk(dir);
