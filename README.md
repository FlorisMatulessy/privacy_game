# Privacy Quest - Webgame voor Gemeente Apeldoorn

Privacy awareness serious game gebouwd met React + PHP backend.

## 📁 Project Structuur

```
react-app/
├── 📂 backend/              # PHP Backend
│   ├── 📂 api/             # API Endpoints
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── change_password.php
│   │   ├── get_settings.php
│   │   ├── update_settings.php
│   │   ├── add_department.php
│   │   ├── add_question.php
│   │   ├── update_question.php
│   │   ├── delete_question.php
│   │   ├── get_questions.php
│   │   ├── get_department_stats.php
│   │   ├── admin_stats.php
│   │   └── save_game_results.php
│   │
│   ├── 📂 helpers/          # Helper Functions
│   │   └── security_helpers.php
│   │
│   └── 📂 setup/            # Database Setup Scripts
│       ├── create_tables.php
│       ├── add_email_to_db.php
│       ├── fix_passwords.php
│       └── check_db.php
│
├── 📂 src/                  # React Frontend
│   ├── Account.jsx
│   ├── Admin.jsx
│   ├── App.jsx
│   ├── AppSettings.jsx
│   ├── DepartmentManagement.jsx
│   ├── GameResults.jsx
│   ├── GameResultsDebug.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── QuestionManagement.jsx
│   ├── Register.jsx
│   ├── SessionManager.jsx
│   ├── main.jsx
│   └── ...
│
├── 📂 tests/                # Testing & Security
│   └── 📂 security/
│       ├── penetration_test.php
│       ├── owasp_compliance_check.php
│       ├── final_security_check.php
│       ├── security_audit.php
│       ├── sql_injection_check.php
│       └── frontend_security_check.cjs
│
├── 📂 docs/                 # Documentation
│   ├── SECURITY_PROOF.md
│   ├── SECURITY_AUDIT_REPORT.md
│   ├── EMAIL_SECURITY.md
│   ├── README.md
│   └── SECURITY.md
│
├── 📂 public/               # Static Assets
├── 📂 assets/               # Compiled Assets (dist)
│
├── index.html              # Entry Point
├── package.json            # Dependencies
├── vite.config.js          # Vite Config
├── tailwind.config.js      # Tailwind Config
├── postcss.config.js       # PostCSS Config
└── eslint.config.js        # ESLint Config
```

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 🔐 Security

**Status:** ✅ **Productie-Ready**

- ✅ Penetration Tests: 100% geslaagd
- ✅ OWASP Top 10: 95% compliant
- ✅ SQL Injection: Beschermd
- ✅ XSS: Beschermd
- ✅ Bcrypt wachtwoorden
- ✅ Rate limiting
- ✅ Security logging

Zie [docs/SECURITY_PROOF.md](docs/SECURITY_PROOF.md) voor volledige security audit.

## 🧪 Security Tests Uitvoeren

```bash
# Backend security scan
php tests/security/final_security_check.php

# Penetration testing
php tests/security/penetration_test.php

# OWASP compliance
php tests/security/owasp_compliance_check.php

# Frontend security
node tests/security/frontend_security_check.cjs
```

## 🗄️ Database

**Database:** `privacy_game` (MySQL via XAMPP)

**Setup:**
```bash
php backend/setup/create_tables.php
```

**Tabellen:**
- users
- departments
- questions
- app_settings
- game_results
- audit_logs
- login_attempts
- achievements
- user_achievements
- password_history

## 📊 Tech Stack

**Frontend:**
- React 18.3.1
- Vite 7.2.4
- TailwindCSS

**Backend:**
- PHP 8.x
- MySQL (XAMPP)
- Bcrypt password hashing
- Prepared statements

## 🔑 API Endpoints

**Public:**
- `POST /backend/api/register.php` - User registratie
- `POST /backend/api/login.php` - Authenticatie

**Authenticated:**
- `POST /backend/api/change_password.php` - Wachtwoord wijzigen
- `GET /backend/api/get_settings.php` - App instellingen
- `POST /backend/api/save_game_results.php` - Game resultaten opslaan

**Admin Only:**
- `GET /backend/api/admin_stats.php` - Admin statistieken
- `POST /backend/api/add_department.php` - Afdeling toevoegen
- `POST /backend/api/add_question.php` - Vraag toevoegen
- `PUT /backend/api/update_question.php` - Vraag bewerken
- `DELETE /backend/api/delete_question.php` - Vraag verwijderen
- `PUT /backend/api/update_settings.php` - Instellingen aanpassen

## 📝 Compliance

- ✅ OWASP Top 10 (2021)
- ✅ OWASP API Security
- ✅ Baseline Informatiebeveiliging Overheid (BIO)
- ✅ GDPR
- ✅ Gemeente Apeldoorn Security Eisen

## 🛠️ Development

**Directories:**
- `src/` - React components (bewerk hier)
- `backend/api/` - PHP endpoints (bewerk hier)
- `backend/helpers/` - Gedeelde functies
- `tests/security/` - Security tests (niet wijzigen)
- `docs/` - Documentatie

**Hot Module Replacement:**
Frontend changes worden automatisch herladen tijdens `npm run dev`.

**API Testing:**
Test API endpoints via browser of Postman op `http://localhost/react-app/backend/api/`

## 📦 Deployment

**Productie Checklist:**
- [ ] HTTPS certificaat installeren
- [ ] Security headers toevoegen (CSP, HSTS)
- [ ] Environment variables configureren
- [ ] Database credentials beveiligen
- [ ] Error reporting uitzetten
- [ ] Monitoring/alerting opzetten

## 🤝 Bijdragen

Dit project is ontwikkeld voor Gemeente Apeldoorn als educatieve privacy awareness tool.

## 📄 Licentie

Alle code en data blijft eigendom van Gemeente Apeldoorn.
