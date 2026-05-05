const BASE_URL = 'https://cpap-backend.onrender.com/api/v1';

async function testEndpoint(name, path, method = 'GET', body = null) {
  try {
    const start = Date.now();
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, options);
    const duration = Date.now() - start;
    
    const icon = response.ok ? '✅' : '❌';
    console.log(`${icon} [${response.status}] ${method.padEnd(4)} | ${name.padEnd(25)} | ${duration}ms | ${path}`);
  } catch (error) {
    console.log(`💥 [ERR] ${method.padEnd(4)} | ${name.padEnd(25)} | ${path} | ${error.message}`);
  }
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE ENDPOINT AUDIT (GET + POST) ---');
  
  const endpoints = [
    // GET Endpoints
    ['List Patients', '/patients', 'GET'],
    ['Patient Summary', '/patient/PAT0001/summary', 'GET'],
    ['Physician Queue', '/physician/queue', 'GET'],
    ['Technician Queue', '/technician/queue', 'GET'],
    ['Technician Events', '/technician/events', 'GET'],
    ['Triage Alias', '/technician/triage/events', 'GET'],
    ['CPAP Trends', '/patient/PAT0001/trends/cpap', 'GET'],
    ['Biomarkers', '/patient/PAT0001/biomarkers', 'GET'],
    ['Devices', '/patient/PAT0001/devices', 'GET'],
    ['Interventions (GET)', '/patient/PAT0001/interventions', 'GET'],
    ['Surveys', '/patient/PAT0001/surveys', 'GET'],
    ['Weekly Analysis', '/patient/PAT0001/analysis/weekly', 'GET'],
    ['Videos', '/patient/PAT0001/videos', 'GET'],
    ['Authorizations', '/patient/PAT0001/authorizations', 'GET'],
    
    // POST Endpoints (Dummy Data)
    ['Create Intervention', '/patient/PAT0001/interventions', 'POST', { type: 'test', job_code: 'TEST', actor: { role: 'physician', id: '1' }, outcome: 'success' }],
    ['Submit Event Triage', '/technician/events/1/triage', 'POST', { action: 'VALIDATE', technician_id: '1' }],
    ['Monitoring Log', '/patient/PAT0001/surveys/monitoring', 'POST', { form_type: 'test', notes: 'test', technician_id: '1' }],
    ['Create Authorization', '/patient/PAT0001/authorizations', 'POST', { type: 'test', status: 'approved', physician_id: '1', digital_seal_hash: 'test' }],
    ['Video Interaction', '/patient/PAT0001/videos/1/interaction', 'POST', { watched: true, watch_duration_seconds: 10 }],
    ['Submit Survey', '/patient/PAT0001/surveys/1/submit', 'POST', { answers: [{ question_id: '1', value: 'test' }], completion_time_seconds: 0 }],
    ['Support Ticket', '/patient/PAT0001/support/ticket', 'POST', { issue_type: 'test', details: 'test' }],
  ];

  for (const [name, path, method, body] of endpoints) {
    await testEndpoint(name, path, method, body);
  }
  
  console.log('--- COMPREHENSIVE AUDIT COMPLETE ---');
}

runTests();
