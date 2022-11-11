#!/usr/bin/env node

const fs = require('fs');
const pug = require('pug');
const path = require('path');
const defaultConfig = require('./config.json');

const CWD = process.cwd();
const [output] = process.argv.slice(2);

let config = defaultConfig;

const configPath = path.resolve(CWD, 'config.json');
if (fs.existsSync(configPath)) {
  try {
    const customConfig = JSON.parse(fs.readFileSync(configPath));
    config = { ...defaultConfig, ...customConfig };
  } catch (error) {
    console.error('Incorrect config file, using default config...');
  }
}

if (output) {
  config.output = output;
}

function generateHtml(sonarData) {
  const render = pug.compileFile(path.resolve(__dirname, 'assets/template.pug'));

  return render({
    sonar: sonarData,
    config,
    url: process.env.URL || 'http://192.168.56.2:9000'
  });
}

const sonarFile = path.resolve(CWD, config.input);
if (!fs.existsSync(sonarFile)) {
  console.error('Sonar issues file not found!');
  process.exit(1);
}

console.log('Sonar issues report generating...');
console.log('Input file: ' + sonarFile);

try {
  const issueJson = JSON.parse(fs.readFileSync(sonarFile));
  const generatedHtml = generateHtml(issueJson);
  fs.writeFileSync(path.resolve(CWD, config.output), generatedHtml);
  
  console.log('Sonar issues report generated!')
  console.log('Output file: ' + path.resolve(CWD, config.output));
} catch (error) {
  console.error('Passed file has incorrect format!');
  process.exit(1);
}
