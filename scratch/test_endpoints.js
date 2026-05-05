const BASE_URL = 'https://cpap-backend.onrender.com/api/v1';

async function testEndpoint(name, path) {
  try {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}${path}`);
    const duration = Date.now() - start;
    
    if (response.ok) {
      console.log(`✅ [${response.status}] ${name.padEnd(25)} | ${duration}ms | ${path}`);
    } else {
      console.log(`❌ [${response.status}] ${name.padEnd(25)} | ${duration}ms | ${path}`);
    }
  } catch (error) {
    console.log(`💥 [ERR] ${name.padEnd(25)} | ${path} | ${error.message}`);
  }
}

async function runTests() {
  console.log('--- STARTING ENDPOINT AUDIT ---');
  
  // Test root health first (note: health is outside /api/v1)
  try {
    const res = await fetch('https://cpap-backend.onrender.com/health');
    console.log(`🏥 [${res.status}] System Health           | ${res.ok ? 'UP' : 'DOWN'} | /health`);
  } catch (e) {
    console.log('🏥 [ERR] System Health           | DOWN | /health');
  }

  const endpoints = [
    ['List Patients', '/patients'],
    ['Patient Summary', '/patient/PAT0001/summary'],
    ['Physician Queue', '/physician/queue'],
    ['Technician Queue', '/technician/queue'],
    ['Technician Events', '/technician/events'],
    ['Triage Alias', '/technician/triage/events'],
    ['CPAP Trends', '/patient/PAT0001/trends/cpap'],
    ['Biomarkers', '/patient/PAT0001/biomarkers'],
    ['Devices', '/patient/PAT0001/devices'],
    ['Interventions (GET)', '/patient/PAT0001/interventions'],
    ['Surveys', '/patient/PAT0001/surveys'],
    ['Weekly Analysis', '/patient/PAT0001/analysis/weekly'],
    ['Videos', '/patient/PAT0001/videos'],
    ['Authorizations', '/patient/PAT0001/authorizations'],
  ];

  for (const [name, path] of endpoints) {
    await testEndpoint(name, path);
  }
  
  console.log('--- AUDIT COMPLETE ---');
}

runTests();
