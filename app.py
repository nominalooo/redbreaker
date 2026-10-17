"""
pojia-breaker Web Interface
Red Team Dashboard — Flask + real tooling backend with live console
"""
import os
import json
import subprocess
import shutil
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
from pathlib import Path
from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import anthropic, subprocess, os, json, traceback, sys, time, re
from datetime import datetime
from pathlib import Path
import requests as req_lib
from exa_py import Exa
from firecrawl import FirecrawlApp

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
client     = anthropic.Anthropic(
    api_key  = os.environ["ANTHROPIC_API_KEY"],
    base_url = os.environ.get("ANTHROPIC_BASE_URL")
)
exa        = Exa(api_key=os.environ["EXA_API_KEY"])
firecrawl  = FirecrawlApp(api_key=os.environ["FIRECRAWL_API_KEY"])
BASE_DIR   = Path(__file__).parent
WORKSPACE  = BASE_DIR / "workspace"
HISTORY_F  = BASE_DIR / "history.json"
WORKSPACE.mkdir(exist_ok=True)

SYSTEM = (BASE_DIR / "CLAUDE.md").read_text(encoding="utf-8")

TOOLS AVAILABLE:
- run_shell: bash commands, install binaries (gobuster/ffuf/nuclei/sqlmap/etc), wget/curl downloads
- run_python: execute Python code, data analysis, scripting
- write_file: write any file to workspace (code, reports, configs)
- read_file: read workspace files
- list_workspace: list all files with sizes
- web_search: Exa neural search - researching targets, CVEs, exploits, tools
- web_fetch: Firecrawl - fetch any URL, JS-rendered pages, docs
- search_history: search past conversation history

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024

SKILLS_DIR = Path("skills/bteam-skills")
AMMO_FILE = Path("ammo/ammo_matrix.json")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)


def load_ammo():
    """Load prompt injection payloads"""
    if AMMO_FILE.exists():
        with open(AMMO_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def load_skills():
    """Load red-team skills list"""
    if not SKILLS_DIR.exists():
        return []
    skills = []
    for skill_dir in sorted(SKILLS_DIR.iterdir()):
        if skill_dir.is_dir() and not skill_dir.name.startswith('.'):
            skills.append({
                "id": skill_dir.name,
                "name": skill_dir.name.replace('-', ' ').title(),
                "path": str(skill_dir)
            })
    return skills


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/skills')
def api_skills():
    return jsonify(load_skills())


@app.route('/api/ammo')
def api_ammo():
    return jsonify(load_ammo())


@app.route('/api/run/console', methods=['POST'])
def api_run_console():
    """Execute console command"""
    data = request.json
    command = data.get('command', '').strip()
    
    if not command:
        return jsonify({"error": "Empty command"}), 400
    
    # Security: basic command filtering (extend as needed)
    dangerous = ['rm -rf /', 'mkfs', ':(){:|:&};:', 'dd if=/dev/zero']
    if any(danger in command for danger in dangerous):
        return jsonify({"error": "Command rejected for safety"}), 403
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_file = RESULTS_DIR / f"console_{timestamp}.txt"
    
    try:
        # Execute with timeout
        proc = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=str(RESULTS_DIR)
        )
        stdout, stderr = proc.communicate(timeout=120)
        
        output = stdout + stderr
        
        # Save to file
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write(f"Command: {command}\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write(f"{'='*60}\n\n")
            f.write(output)
        
        return jsonify({
            "status": "completed",
            "output": output if len(output) < 5000 else output[:5000] + "\n\n... (truncated, see result file)",
            "result_file": str(result_file)
        })
    
    except subprocess.TimeoutExpired:
        proc.kill()
        return jsonify({"error": "Command timeout (120s limit)"}), 408
    except Exception as e:
        return jsonify({"error": f"Execution failed: {str(e)}"}), 500


@app.route('/api/run/skill', methods=['POST'])
def api_run_skill():
    """Execute a red-team skill"""
    data = request.json
    skill = data.get('skill')
    target = data.get('target', '')
    
    if not skill:
        return jsonify({"error": "Skill required"}), 400
    
    if not target:
        return jsonify({"error": "Target required"}), 400
    
    # Build command based on skill type
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_file = RESULTS_DIR / f"{skill}_{timestamp}.txt"
    
    try:
        # Map common skills to actual commands
        skill_lower = skill.lower()
        
        if 'sql' in skill_lower:
            # Check if sqlmap exists
            if shutil.which('sqlmap'):
                cmd = f"sqlmap -u '{target}' --batch --risk=3 --level=5 --timeout=30 --retries=1"
            else:
                cmd = f"echo 'sqlmap not installed. Install with: apt install sqlmap' && echo 'Simulating SQLi scan on {target}'"
        
        elif 'xss' in skill_lower or 'cross-site' in skill_lower:
            if shutil.which('dalfox'):
                cmd = f"dalfox url '{target}'"
            else:
                cmd = f"echo 'dalfox not installed. Install with: go install github.com/hahwul/dalfox/v2@latest' && echo 'Simulating XSS scan on {target}'"
        
        elif 'recon' in skill_lower or 'attack-surface' in skill_lower:
            if shutil.which('nmap'):
                cmd = f"nmap -sV -sC -T4 --max-retries 1 --host-timeout 30s {target}"
            else:
                cmd = f"echo 'nmap not installed. Install with: apt install nmap' && curl -I {target}"
        
        elif '401' in skill or '403' in skill or 'bypass' in skill_lower:
            if shutil.which('ffuf'):
                cmd = f"ffuf -u {target}/FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200,301,302 -t 20 -timeout 10"
            else:
                cmd = f"echo 'ffuf not installed. Install with: go install github.com/ffuf/ffuf@latest' && curl -I {target}"
        
        elif 'subdomain' in skill_lower:
            if shutil.which('subfinder'):
                cmd = f"subfinder -d {target} -silent"
            else:
                cmd = f"echo 'subfinder not installed. Install with: go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest' && dig {target}"
        
        elif 'nuclei' in skill_lower or 'vuln' in skill_lower:
            if shutil.which('nuclei'):
                cmd = f"nuclei -u {target} -severity critical,high -timeout 10"
            else:
                cmd = f"echo 'nuclei not installed. Install with: go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest' && curl -I {target}"
        
        elif 'idor' in skill_lower or 'authorization' in skill_lower:
            cmd = f"echo 'IDOR testing requires manual parameter manipulation' && curl -v {target}"
        
        elif 'ssrf' in skill_lower:
            cmd = f"echo 'SSRF testing module for {target}' && curl -v {target}"
        
        elif 'ssti' in skill_lower or 'template' in skill_lower:
            cmd = f"echo 'SSTI detection on {target}' && curl -v '{target}'"
        
        elif 'xxe' in skill_lower:
            cmd = f"echo 'XXE testing on {target}' && curl -v {target}"
        
        elif 'cmdi' in skill_lower or 'command-injection' in skill_lower:
            cmd = f"echo 'Command injection testing on {target}' && curl -v {target}"
        
        elif 'deserialization' in skill_lower:
            cmd = f"echo 'Deserialization testing on {target}' && curl -v {target}"
        
        elif 'path-traversal' in skill_lower or 'lfi' in skill_lower:
            cmd = f"echo 'Path traversal / LFI testing on {target}' && curl -v '{target}'"
        
        elif 'upload' in skill_lower:
            cmd = f"echo 'File upload testing on {target}' && curl -v {target}"
        
        elif 'waf' in skill_lower:
            if shutil.which('wafw00f'):
                cmd = f"wafw00f {target}"
            else:
                cmd = f"echo 'wafw00f not installed' && curl -I {target}"
        
        else:
            cmd = f"echo 'Executing {skill} against {target}' && curl -I {target}"
        
        # Execute command
        proc = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate(timeout=120)
        
        output = stdout + stderr
        
        # Save result
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write(f"=== {skill} @ {target} ===\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write(f"Command: {cmd}\n")
            f.write(f"{'='*60}\n\n")
            f.write(output)
        
        return jsonify({
            "status": "completed",
            "output": output[:3000] if len(output) > 3000 else output,
            "result_file": str(result_file)
        })
    
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Skill execution timeout (120s)"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/run/ammo', methods=['POST'])
def api_run_ammo():
    """Test LLM prompt injection payload"""
    data = request.json
    payload_id = data.get('payload')
    target_llm = data.get('target', 'generic')
    
    ammo = load_ammo()
    if payload_id not in ammo:
        return jsonify({"error": "Payload not found"}), 404
    
    payload = ammo[payload_id]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_file = RESULTS_DIR / f"ammo_{payload_id}_{timestamp}.json"
    
    # Simulate LLM testing (in real scenario, this would call target LLM API)
    result = {
        "payload_id": payload_id,
        "description": payload.get("desc", ""),
        "target": target_llm,
        "system": payload.get("system"),
        "user": payload.get("user"),
        "timestamp": timestamp,
        "status": "ready_for_manual_test",
        "notes": "Copy system/user prompts above and test manually against target LLM"
    }
    
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return jsonify(result)


@app.route('/api/results')
def api_results():
    """List all result files"""
    results = []
    for f in sorted(RESULTS_DIR.iterdir(), reverse=True):
        if f.is_file():
            results.append({
                "name": f.name,
                "size": f.stat().st_size,
                "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
            })
    return jsonify(results[:50])


@app.route('/api/results/<filename>')
def api_result_content(filename):
    """Get result file content"""
    file_path = RESULTS_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        return jsonify({"error": "Not found"}), 404
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({"content": content})
    except:
        return send_file(file_path)


@app.route('/api/results/clear', methods=['POST'])
def api_clear_results():
    """Clear all result files"""
    try:
        for f in RESULTS_DIR.iterdir():
            if f.is_file():
                f.unlink()
        return jsonify({"status": "cleared"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
