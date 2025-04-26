# **Information Security Project: Web Application Vulnerability Assessment & Mitigation**   

## **📌 Project Overview**  
This project involves identifying, exploiting, and mitigating security vulnerabilities in a self-developed web application. The goal was to simulate real-world attacks, implement security fixes, and validate their effectiveness.  

---

## **🔧 Technologies Used**  
- **Backend:** Node.js
- **Frontend:** React 
- **Security Tools:**  
  - CSRF Tokens  
  - Feistel Cipher (Password Encryption)  
  - Rate Limiting (DDoS Protection)  
  - SQL Parameterized Queries  
- **Testing Tools:**  
  - Postman (API Testing)   

---

## **📋 Vulnerabilities Tested & Fixed**  

| **Vulnerability**         | **Attack Method**                          | **Solution Implemented**                     |
|---------------------------|-------------------------------------------|---------------------------------------------|
| **DDoS Attack**           | 100 requests/minute from single IP        | Rate limiting (5 requests/min) + IP blocking |
| **XSS (Cross-Site Scripting)** | Injected `<script>` in username field   | Input sanitization & output encoding        |
| **CSRF (Cross-Site Request Forgery)** | Forged unauthorized requests       | CSRF tokens for authenticated sessions      |
| **Brute Force Attack**    | 1000-passwords dictionary attack          | Account lockout after 5 failed attempts     |
| **SQL Injection**         | `' OR 1=1 --` bypassed login              | Parameterized queries                       |
| **Geo-Blocking**          | Allowed access from blocked regions (Israel) | IP-based geolocation restriction          |
| **Password Encryption**   | Plaintext passwords in database           | Feistel Cipher encryption                  |

---

## **🛡️ Key Security Measures Implemented**  
1. **DDoS Protection**  
   - Blocked IPs exceeding **5 requests/minute**.  
2. **XSS Prevention**  
   - Sanitized user inputs & encoded outputs.  
3. **CSRF Mitigation**  
   - Unique tokens for authenticated requests.  
4. **Brute Force Defense**  
   - Temporary lockout after **5 failed attempts**.  
5. **SQL Injection Protection**  
   - Used **parameterized queries**.  
6. **Geo-Restriction**  
   - Denied access from **Israel**.  
7. **Password Security**  
   - Encrypted passwords using **Feistel Cipher**.  

---
