# pojia·breaker — Red Team Web Interface

**Professional offensive security framework with live console, 24 attack modules, and LLM jailbreak arsenal.**

Built on top of [Justinuse1/pojia-breaker](https://github.com/Justinuse1/pojia-breaker) with full web UI, interactive terminal, and one-click exploit modules.

---

## 🔥 Features

### ⚡ Live Interactive Console
- Real bash terminal in the browser
- Execute commands: `nmap`, `nuclei`, `sqlmap`, `ffuf`, `subfinder`
- Command history (↑/↓ arrows)
- Output streaming and result saving

### 🎯 24 Red Team Attack Modules
Pre-configured exploitation techniques ready to launch:
- **SQL Injection** — sqlmap with aggressive flags
- **XSS Detection** — dalfox scanning
- **SSRF Testing** — server-side request forgery
- **IDOR** — broken object authorization
- **Path Traversal / LFI**
- **XXE** — XML external entity
- **SSTI** — template injection
- **Command Injection**
- **Deserialization**
- **File Upload Bypass**
- **WAF Detection & Bypass**
- **401/403 Bypass Techniques**
- **Subdomain Enumeration**
- **API Reconnaissance**
- **Request Smuggling**
- **HTTP Host Header Attacks**
- **Type Juggling**
- **Reverse Shell Payloads**
- **Linux Privilege Escalation**
- **Tunneling & Pivoting**
- **Authentication Bypass**
- ...and more

### 🤖 LLM Jailbreak Arsenal
19 proven prompt injection techniques:
- Tested against GPT-4, Claude, Qwen, GLM, Doubao
- System + User prompt pairs ready to copy
- Target-specific optimization
- Bypass techniques for content policies

### 📊 Operation Results Dashboard
- Real-time status updates
- Result file browser
- Export/download outputs
- Operation history

---

## 🚀 Quick Start

### Local Installation

```bash
# Clone the repo
git clone https://github.com/nominalooo/pojia-breaker-web.git
cd pojia-breaker-web

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Open http://localhost:5000

### Cloud Deployment

**Railway (recommended):**
1. Push to your GitHub repo
2. Connect Railway to the repo
3. Deploy automatically

**Requirements:**
- Python 3.11
- Flask + Gunicorn
- See `requirements.txt`

Full deployment guide: **[DEPLOY_FINAL.md](DEPLOY_FINAL.md)**

---

## 📁 Project Structure

```
pojia-breaker-web/
├── app.py                      # Flask backend with /api/run/console endpoint
├── templates/index.html        # Web UI with live console
├── static/
│   ├── css/main.css           # Red team design system
│   └── js/main.js             # Console + API logic
├── skills/bteam-skills/       # 24 attack modules (markdown docs)
├── ammo/ammo_matrix.json      # 19 LLM jailbreak payloads
└── results/                   # Scan outputs and logs
```

---

## 🎮 Usage

### 1. Set Target
```
https://target.example.com
or
192.168.1.100
```

### 2. Launch Attack Module
Click on any module (e.g., **SQL Injection**) → results appear in output card.

### 3. Use Live Console
```bash
# Network scan
nmap -sV -sC target.com

# Vulnerability scan
nuclei -u https://target.com -severity critical,high

# Directory brute-force
ffuf -u https://target.com/FUZZ -w /usr/share/wordlists/dirb/common.txt

# Subdomain enumeration
subfinder -d target.com

# SQL injection
sqlmap -u "https://target.com/page?id=1" --batch --risk=3
```

### 4. Test LLM Jailbreaks
- Select target LLM (GPT-4, Claude, etc.)
- Click payload
- Copy System + User prompts
- Paste into target LLM interface

---

## 🛡️ Security Warning

**This tool is designed for authorized security testing only.**

- Use only on systems you own or have explicit permission to test
- Unauthorized access to computer systems is illegal
- The authors are not responsible for misuse of this tool

**Recommended use cases:**
- Bug bounty programs
- Penetration testing engagements
- Red team operations
- Security research
- CTF competitions

---

## 🔧 Installation of Security Tools

For full functionality, install these tools on your system:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y nmap sqlmap curl git

# Go tools
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/ffuf/ffuf@latest
go install github.com/hahwul/dalfox/v2@latest

# Add Go bin to PATH
export PATH=$PATH:$HOME/go/bin
```

**Note:** On cloud platforms (Railway, Vercel), most tools won't be available. Deploy on VPS for full capabilities.

---

## 🎨 Design Philosophy

**Red Team Aesthetic:**
- Warm paper background (#F6F1E8) with amber accents (#C8853F)
- Dark terminal blocks (#2A2723) for console
- Bold serif headings (DM Serif Display)
- Monospace for code/commands (Monaco, Menlo)
- Red primary buttons for attack actions
- Professional, dense layout optimized for efficiency

**UI Principles:**
- Console always accessible
- One-click module execution
- Real-time status updates
- Minimal clicks from target → results

---

## 📚 Skills Documentation

Each attack module includes:
- Detailed technique explanation
- Common vulnerability patterns
- Exploitation steps
- Payload examples
- Detection evasion techniques

Browse `/skills/bteam-skills/` for markdown docs.

---

## 🤝 Contributing

Based on [pojia-breaker](https://github.com/Justinuse1/pojia-breaker) by Justinuse1.

**This web interface adds:**
- Live console with command execution
- Visual dashboard for all modules
- One-click attack launching
- Result management system
- Professional red team UI

---

## 📜 License

Original pojia-breaker: See upstream repo

Web interface: Use responsibly for authorized testing only

---

## 🔗 Links

- **Original Project:** https://github.com/Justinuse1/pojia-breaker
- **Deployment Guide:** [DEPLOY_FINAL.md](DEPLOY_FINAL.md)
- **Bug Reports:** Open an issue

---

**Built for red teamers, by red teamers.** 🔥

*Remember: With great power comes great responsibility. Test ethically.*
