const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replacements = [
    [/\+id/g, 'id'],
    [/\+gradeId/g, 'gradeId'],
    [/roleId\s*:\s*number/g, 'roleId: string'],
    [/gradeId\s*:\s*number/g, 'gradeId: string'],
    [/classId\s*:\s*number/g, 'classId: string'],
    [/studentAssignmentId\s*:\s*number/g, 'studentAssignmentId: string'],
    [/\+studentAssignmentId/g, 'studentAssignmentId'],
  ];

  replacements.forEach(([regex, repl]) => {
    if (regex.test(content)) {
      content = content.replace(regex, repl);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
console.log("Done");
