import os
import re
import socket
import ssl
import urllib.request
from datetime import datetime
from urllib.parse import urlparse

WEBSITE_DIR = "J:/Website"
LIVE_DOMAIN = "truesoulsmedia.com"
LIVE_URL = f"https://{LIVE_DOMAIN}"

HTML_FILES = [
    "index.html",
    "about.html",
    "wedding-planner.html",
    "photography.html",
    "events.html",
    "digital-marketing.html",
    "podcast.html"
]

report = []
report.append("# Website Health & Integrity Report")
report.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# --- 1. LOCAL FILE INTEGRITY CHECK ---
report.append("## 📁 Local File Integrity Check")
local_errors = []

def verify_local_reference(source_file, ref_path):
    if not ref_path:
        return True
    
    # Ignore external links
    if any(ref_path.startswith(p) for p in ["http://", "https://", "mailto:", "tel:", "wa.me", "https://wa.me"]):
        return True
    
    # Remove fragments
    parsed = urlparse(ref_path)
    clean_path = parsed.path
    fragment = parsed.fragment
    
    if not clean_path:
        target_file = os.path.join(WEBSITE_DIR, source_file)
    else:
        target_file = os.path.normpath(os.path.join(WEBSITE_DIR, clean_path))
        
    if not os.path.exists(target_file):
        local_errors.append(f"- **{source_file}**: Broken reference `{ref_path}` (File not found at `{os.path.relpath(target_file, WEBSITE_DIR)}`)")
        return False
        
    # Check anchor fragment
    if fragment and target_file.endswith(".html"):
        with open(target_file, "r", encoding="utf-8") as f:
            content = f.read()
        id_pattern = rf'id=["\']{re.escape(fragment)}["\']'
        name_pattern = rf'name=["\']{re.escape(fragment)}["\']'
        if not re.search(id_pattern, content) and not re.search(name_pattern, content):
            local_errors.append(f"- **{source_file}**: Broken anchor `#{fragment}` in `{ref_path}` (Anchor ID not found in target file)")
            return False
            
    return True

for html_file in HTML_FILES:
    full_path = os.path.join(WEBSITE_DIR, html_file)
    if not os.path.exists(full_path):
        local_errors.append(f"- **{html_file}**: Main file itself is MISSING!")
        continue
        
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find image src, link href, script src
    srcs = re.findall(r'src=["\'](.*?)["\']', content)
    hrefs = re.findall(r'href=["\'](.*?)["\']', content)
    
    for src in srcs:
        verify_local_reference(html_file, src)
        
    for href in hrefs:
        if not href or href == "#":
            continue
        verify_local_reference(html_file, href)

if local_errors:
    report.extend(local_errors)
else:
    report.append("✅ All local file references, images, scripts, stylesheets, and internal anchor links are valid!")

# --- 2. LIVE SITE ACCESSIBILITY ---
report.append("\n## 🌐 Live Website Accessibility")
live_errors = []

for page in [""] + HTML_FILES:
    page_url = f"{LIVE_URL}/{page}"
    try:
        req = urllib.request.Request(
            page_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebsiteHealthChecker/1.0'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            if status == 200:
                report.append(f"- ✅ Live page `{page_url}` is ONLINE (Status 200)")
            else:
                live_errors.append(f"- ❌ Live page `{page_url}` returned status {status}")
    except Exception as e:
        live_errors.append(f"- ❌ Live page `{page_url}` is OFFLINE or inaccessible! Error: {e}")

if live_errors:
    report.extend(live_errors)

# --- 3. SSL CERTIFICATE STATUS ---
report.append("\n## 🔒 SSL Certificate Status")
try:
    context = ssl.create_default_context()
    with socket.create_connection((LIVE_DOMAIN, 443), timeout=5) as sock:
        with context.wrap_socket(sock, server_hostname=LIVE_DOMAIN) as ssock:
            cert = ssock.getpeercert()
            
            # Format: 'May 24 23:59:59 2026 GMT'
            expire_str = cert['notAfter']
            expire_date = datetime.strptime(expire_str, '%b %d %H:%M:%S %Y %Z')
            days_left = (expire_date - datetime.utcnow()).days
            
            if days_left < 15:
                report.append(f"- ⚠️ **WARNING**: SSL Certificate expires in {days_left} days! (Expiry: {expire_str})")
            else:
                report.append(f"- ✅ SSL Certificate is VALID. Expires in {days_left} days. (Expiry: {expire_str})")
except Exception as e:
    report.append(f"- ❌ Failed to check SSL certificate status: {e}")

# Save report
report_path = os.path.join(WEBSITE_DIR, "website_health_report.md")
with open(report_path, "w", encoding="utf-8") as f:
    f.write("\n".join(report))

print("Website health check completed. Report saved to website_health_report.md.")
