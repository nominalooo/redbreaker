// pojia-breaker frontend logic with live console

// Console state
const consoleHistory = [];
let historyIndex = -1;
let currentTarget = '';

document.addEventListener('DOMContentLoaded', () => {
  loadSkills();
  loadAmmo();
  loadResults();
  initConsole();
  
  // Auto-refresh results every 10s
  setInterval(loadResults, 10000);
});

// Initialize console
function initConsole() {
  const input = document.getElementById('console-input');
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.value.trim();
      if (command) {
        executeConsoleCommand(command);
        consoleHistory.push(command);
        historyIndex = consoleHistory.length;
        input.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = consoleHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < consoleHistory.length - 1) {
        historyIndex++;
        input.value = consoleHistory[historyIndex];
      } else {
        historyIndex = consoleHistory.length;
        input.value = '';
      }
    }
  });
}

// Execute console command
async function executeConsoleCommand(command) {
  const output = document.getElementById('console-output');
  
  // Add command to output
  addConsoleOutput(`<span class="console-prompt">root@breaker:~#</span> ${escapeHtml(command)}`);
  
  // Handle built-in commands
  if (command === 'help') {
    addConsoleOutput(`
<span style="color: var(--accent-amber);">Available commands:</span>

  nmap       - Network mapper (e.g., nmap -sV target.com)
  nuclei     - Vulnerability scanner (nuclei -u https://target.com)
  sqlmap     - SQL injection tool (sqlmap -u URL --batch)
  ffuf       - Web fuzzer (ffuf -u URL/FUZZ -w wordlist.txt)
  subfinder  - Subdomain enumeration (subfinder -d target.com)
  curl       - HTTP client (curl -X GET https://target.com)
  clear      - Clear console
  help       - Show this help

<span style="color: var(--text-muted);">Tip: Replace TARGET with actual domain/IP in quick commands above</span>
    `);
    return;
  }
  
  if (command === 'clear') {
    clearConsole();
    return;
  }
  
  // Execute real command via API
  addConsoleOutput(`<span style="color: var(--text-muted);">[*] Executing...</span>`);
  updateStatus('Running command...');
  
  try {
    const response = await fetch('/api/run/console', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      const outputText = result.output || '(no output)';
      addConsoleOutput(escapeHtml(outputText), true);
      updateStatus('Command completed');
      loadResults(); // Refresh results
    } else {
      addConsoleOutput(`<span style="color: #ff6b6b;">[ERROR] ${result.error || 'Command failed'}</span>`);
      updateStatus('Command failed');
    }
    
  } catch (err) {
    addConsoleOutput(`<span style="color: #ff6b6b;">[ERROR] ${err.message}</span>`);
    updateStatus('Connection error');
  }
}

// Add text to console output
function addConsoleOutput(text, isPlain = false) {
  const output = document.getElementById('console-output');
  const line = document.createElement('div');
  line.className = 'console-line';
  
  if (isPlain) {
    line.textContent = text;
  } else {
    line.innerHTML = text;
  }
  
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// Clear console
function clearConsole() {
  const output = document.getElementById('console-output');
  output.innerHTML = `<div class="console-welcome">
pojia·breaker interactive console v1.0
Type 'help' for available commands or enter any bash command directly.
  </div>`;
}

// Run example command
function runExampleCommand(command) {
  const input = document.getElementById('console-input');
  input.value = command;
  input.focus();
  
  // Scroll to console
  scrollToConsole();
}

// Set target
function setTarget() {
  const target = document.getElementById('skill-target').value.trim();
  if (!target) {
    alert('Please enter a target URL or IP');
    return;
  }
  currentTarget = target;
  updateStatus(`Target set: ${target}`);
  
  // Show confirmation
  const card = document.querySelector('.target-input-card');
  card.style.borderColor = 'var(--accent-amber)';
  setTimeout(() => {
    card.style.borderColor = '';
  }, 1000);
}

// Scroll helpers
function scrollToConsole() {
  document.getElementById('console').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.getElementById('console-input').focus();
  }, 500);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Load red-team skills
async function loadSkills() {
  try {
    const response = await fetch('/api/skills');
    const skills = await response.json();
    
    const grid = document.getElementById('skills-grid');
    
    if (skills.length === 0) {
      grid.innerHTML = '<div class="loading">No attack modules found</div>';
      return;
    }
    
    grid.innerHTML = skills.map(skill => `
      <div class="skill-card" onclick="runSkill('${skill.id}')">
        <div class="skill-icon">⚡</div>
        <h3>${skill.name}</h3>
        <div class="skill-id">${skill.id}</div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Failed to load skills:', err);
    document.getElementById('skills-grid').innerHTML = 
      '<div class="loading">Failed to load attack modules</div>';
  }
}

// Load LLM prompt injection payloads
async function loadAmmo() {
  try {
    const response = await fetch('/api/ammo');
    const ammo = await response.json();
    
    const grid = document.getElementById('ammo-grid');
    const entries = Object.entries(ammo);
    
    if (entries.length === 0) {
      grid.innerHTML = '<div class="loading">No payloads found</div>';
      return;
    }
    
    grid.innerHTML = entries.map(([id, payload]) => `
      <div class="ammo-card" onclick="showPayload('${id}')">
        <div class="ammo-icon">🔓</div>
        <h3>${id}</h3>
        <div class="ammo-desc">${(payload.desc || 'Prompt injection technique').substring(0, 60)}...</div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Failed to load ammo:', err);
    document.getElementById('ammo-grid').innerHTML = 
      '<div class="loading">Failed to load payloads</div>';
  }
}

// Run red-team skill
async function runSkill(skillId) {
  const target = document.getElementById('skill-target').value.trim();
  
  if (!target) {
    alert('⚠️ Set target first! Enter URL or IP in the field above.');
    document.getElementById('skill-target').focus();
    return;
  }
  
  // Update status
  updateStatus(`Running ${skillId}...`);
  
  const outputCard = document.getElementById('skill-output');
  const outputText = document.getElementById('skill-output-text');
  
  outputCard.classList.remove('hidden');
  outputText.textContent = `[*] Launching ${skillId} against ${target}\n[*] Please wait, this may take up to 2 minutes...\n`;
  
  // Scroll to output
  outputCard.scrollIntoView({ behavior: 'smooth' });
  
  try {
    const response = await fetch('/api/run/skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill: skillId, target })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      outputText.textContent = 
        `[✓] ${skillId} execution completed\n` +
        `[i] Target: ${target}\n` +
        `[i] Result file: ${result.result_file || 'N/A'}\n` +
        `[i] Timestamp: ${new Date().toLocaleString()}\n\n` +
        `${'='.repeat(60)}\n` +
        `${result.output || 'No output captured'}`;
      updateStatus('Attack completed ✓');
      loadResults(); // Refresh results list
    } else {
      outputText.textContent = `[✗] Error executing ${skillId}\n\n${result.error || 'Unknown error'}`;
      updateStatus('Attack failed ✗');
    }
    
  } catch (err) {
    outputText.textContent = `[✗] Request failed\n\nError: ${err.message}\n\nCheck your connection and try again.`;
    updateStatus('Connection error');
  }
}

// Show LLM payload details
async function showPayload(payloadId) {
  const target = document.getElementById('ammo-target').value;
  
  updateStatus('Loading payload...');
  
  try {
    const response = await fetch('/api/run/ammo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: payloadId, target })
    });
    
    const result = await response.json();
    
    const outputCard = document.getElementById('ammo-output');
    const outputContent = document.getElementById('ammo-output-content');
    
    outputCard.classList.remove('hidden');
    outputCard.scrollIntoView({ behavior: 'smooth' });
    
    outputContent.innerHTML = `
      <div class="payload-header">
        <h3>${payloadId}</h3>
        <p class="payload-description">${result.description || 'LLM jailbreak technique'}</p>
        <div class="payload-meta">
          <span>Target: <strong>${result.target}</strong></span>
          <span>Status: <strong style="color: var(--accent-amber);">${result.status}</strong></span>
        </div>
      </div>
      
      ${result.system ? `
        <div class="payload-block">
          <div class="payload-label">
            📋 System Prompt
            <button class="btn-copy-small" onclick="copyText(\`${escapeForJs(result.system)}\`)">Copy</button>
          </div>
          <div class="payload-text">${escapeHtml(result.system)}</div>
        </div>
      ` : ''}
      
      ${result.user ? `
        <div class="payload-block">
          <div class="payload-label">
            💬 User Prompt
            <button class="btn-copy-small" onclick="copyText(\`${escapeForJs(result.user)}\`)">Copy</button>
          </div>
          <div class="payload-text">${escapeHtml(result.user)}</div>
        </div>
      ` : ''}
      
      <div class="payload-instructions">
        <strong>How to use:</strong>
        <ol>
          <li>Copy the System Prompt (if present) and paste it into the LLM's system field</li>
          <li>Copy the User Prompt and send it as a user message</li>
          <li>Observe the LLM's response for jailbreak indicators</li>
        </ol>
      </div>
    `;
    
    updateStatus('Payload ready for testing');
    
  } catch (err) {
    alert('Failed to load payload: ' + err.message);
    updateStatus('Ready');
  }
}

// Load recent results
async function loadResults() {
  try {
    const response = await fetch('/api/results');
    const results = await response.json();
    
    const list = document.getElementById('results-list');
    
    if (results.length === 0) {
      list.innerHTML = '<div class="loading">No results yet. Run an attack module or console command to see output here.</div>';
      return;
    }
    
    list.innerHTML = results.map(r => `
      <div class="result-item" onclick="viewResult('${r.name}')">
        <div class="result-icon">📄</div>
        <div class="result-info">
          <div class="result-name">${r.name}</div>
          <div class="result-meta">${formatBytes(r.size)} · ${formatDate(r.modified)}</div>
        </div>
        <div class="result-arrow">→</div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Failed to load results:', err);
  }
}

// View result file
async function viewResult(filename) {
  try {
    const response = await fetch(`/api/results/${filename}`);
    const result = await response.json();
    
    // Show in modal/alert for now (can be enhanced with a dedicated modal)
    alert(`File: ${filename}\n\nContent:\n${result.content.substring(0, 2000)}\n\n... (truncated)`);
    
  } catch (err) {
    console.error('Failed to view result:', err);
    alert('Failed to load result file');
  }
}

// Clear all results
async function clearResults() {
  if (!confirm('Delete all result files? This cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch('/api/results/clear', { method: 'POST' });
    if (response.ok) {
      loadResults();
      updateStatus('Results cleared');
    } else {
      alert('Failed to clear results');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Close output card
function closeOutput(cardId) {
  document.getElementById(cardId).classList.add('hidden');
}

// Copy output text
function copyOutput(elementId) {
  const text = document.getElementById(elementId).textContent;
  copyText(text);
}

// Copy text to clipboard
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    updateStatus('Copied to clipboard ✓');
    setTimeout(() => updateStatus('Ready'), 2000);
  }).catch(() => {
    alert('Failed to copy. Please select and copy manually.');
  });
}

// Download output
function downloadOutput(elementId) {
  const text = document.getElementById(elementId).textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pojia-breaker-output-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Update status indicator
function updateStatus(text) {
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  
  statusText.textContent = text;
  
  if (text.includes('error') || text.includes('failed')) {
    statusDot.style.background = '#ff6b6b';
  } else if (text.includes('Running') || text.includes('Loading')) {
    statusDot.style.background = '#ffd43b';
  } else if (text.includes('completed') || text.includes('Ready')) {
    statusDot.style.background = '#51cf66';
  } else {
    statusDot.style.background = '#C8853F';
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeForJs(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
