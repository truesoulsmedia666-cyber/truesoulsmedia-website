/* ============================================
   Careers Page Logic — True Souls Media LLP
   ============================================ */

/* ─── CONFIG: change the endpoint here ──────────────────────────────────────
   ENDPOINT   : Where applications are POSTed.
                • Default: Web3Forms (emails every application to the inbox linked
                  to ACCESS_KEY → truesoulsmedia666@gmail.com).
                • Google Sheets: deploy a Google Apps Script Web App and paste its
                  /exec URL here, then set FILE_MODE to 'base64'.
   ACCESS_KEY : Web3Forms key (ignored by non-Web3Forms endpoints).
   FILE_MODE  : 'none'      → CV is not uploaded (Web3Forms free plan has no
                              attachments); applicant is asked to share it on WhatsApp.
                'base64'    → CV is embedded in the JSON as base64 (Apps Script).
                'multipart' → Sent as multipart/form-data (Web3Forms Pro, custom APIs).
   ───────────────────────────────────────────────────────────────────────── */
const CAREERS_CONFIG = {
    ENDPOINT: 'https://api.web3forms.com/submit',
    ACCESS_KEY: 'd9dba101-a247-42f8-8758-21a336fb9de8',
    FILE_MODE: 'none',
    WHATSAPP_NUMBER: '919061286660',
    MAX_FILE_MB: 5
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('careersForm');
    if (!form) return;

    const roleSelect = document.getElementById('cr-role');
    const jobCards = [...document.querySelectorAll('.cr-job')];
    const stackField = document.getElementById('cr-stack-field');
    const stackLabel = document.getElementById('cr-stack-label');
    const stackInput = document.getElementById('cr-stack');
    const rateLabel = document.getElementById('cr-rate-label');
    const rateInput = document.getElementById('cr-rate');
    const fileInput = document.getElementById('cr-resume');
    const fileLabel = document.getElementById('cr-file-label');
    const statusBox = document.getElementById('cr-form-status');
    const successBox = document.getElementById('cr-success');
    const waBtn = document.getElementById('cr-wa-btn');
    const formSection = document.getElementById('application-form');

    /* ── 1. Build the role dropdown from the job cards (single source of truth) ── */
    const groups = { fulltime: 'Full-Time / In-Studio (Pala)', freelance: 'Freelance & On-Call Crew' };
    Object.entries(groups).forEach(([track, label]) => {
        const og = document.createElement('optgroup');
        og.label = label;
        jobCards.filter(c => c.dataset.track === track).forEach(c => {
            og.appendChild(new Option(c.dataset.title, c.dataset.role));
        });
        roleSelect.appendChild(og);
    });
    const openOg = document.createElement('optgroup');
    openOg.label = 'Something else?';
    openOg.appendChild(new Option('Open Application / Pitch Your Own Role', 'open-application'));
    roleSelect.appendChild(openOg);

    const roleMeta = id => jobCards.find(c => c.dataset.role === id);

    /* ── 2. Filter tabs ── */
    const tabs = document.querySelectorAll('.cr-tab');
    const trackLabels = document.querySelectorAll('.cr-track-label');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const f = tab.dataset.filter;
            jobCards.forEach(c => {
                const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
                c.classList.toggle('is-hidden', !show);
            });
            trackLabels.forEach(l => {
                const visible = jobCards.some(c => c.dataset.track === l.dataset.track && !c.classList.contains('is-hidden'));
                l.classList.toggle('is-hidden', !visible);
            });
        });
    });

    /* ── 3. Conditional fields ── */
    const STACK_COPY = {
        creative:  ['Editing Software & Workflow', 'e.g. Premiere Pro, DaVinci Resolve, After Effects, CapCut — plus your system specs'],
        crew:      ['Camera / Drone / Gear Kit', 'e.g. Sony A7 IV, 24-70 f/2.8, DJI RS3 gimbal, DJI Mini 4 Pro / FPV rig'],
        marketing: ['Ad Platforms & Marketing Tools', 'e.g. Meta Ads Manager, Google Ads, GA4, Search Console, WATI / Interakt'],
        content:   ['Content Tools & Setup', 'e.g. CapCut, Canva, Premiere Rush, iPhone / mirrorless + mic setup'],
        ops:       ['Planning Tools & Vendor Network', 'e.g. Google Sheets, Notion, existing caterer/decor/venue contacts'],
        events:    ['Languages & Event Experience', 'e.g. Malayalam, English, Hindi — corporate shows, weddings, college fests'],
        open:      ['Your Core Tools / Skills', 'Tell us the software, gear, or platforms you work with']
    };

    function getTrack() {
        const t = form.querySelector('input[name="engagement_track"]:checked');
        return t ? t.value : '';
    }

    function updateRate() {
        const track = getTrack();
        if (track === 'Freelance / Event Crew') {
            rateLabel.textContent = 'Expected Per-Day / Per-Event Rate (₹)';
            rateInput.placeholder = 'e.g. ₹6,000 per wedding day';
        } else if (track === 'Internship / Trainee') {
            rateLabel.textContent = 'Expected Monthly Stipend (₹)';
            rateInput.placeholder = 'e.g. ₹8,000 / month';
        } else {
            rateLabel.textContent = 'Expected Monthly Salary / Retainer (₹)';
            rateInput.placeholder = 'e.g. ₹25,000 / month';
        }
    }

    function updateStack() {
        const id = roleSelect.value;
        if (!id) { stackField.classList.add('is-hidden'); return; }
        const card = roleMeta(id);
        const kind = card ? card.dataset.kind : 'open';
        const [label, ph] = STACK_COPY[kind] || STACK_COPY.open;
        stackLabel.textContent = label;
        stackInput.placeholder = ph;
        stackField.classList.remove('is-hidden');
    }

    function setTrack(value) {
        const radio = form.querySelector(`input[name="engagement_track"][value="${value}"]`);
        if (radio) { radio.checked = true; clearError(radio); }
        updateRate();
    }

    roleSelect.addEventListener('change', () => {
        const card = roleMeta(roleSelect.value);
        // Auto-align the track with the chosen role unless they picked Internship
        if (card && getTrack() !== 'Internship / Trainee') {
            setTrack(card.dataset.track === 'freelance' ? 'Freelance / Event Crew' : 'Full-Time (In-Studio Pala)');
        }
        updateStack();
    });
    form.querySelectorAll('input[name="engagement_track"]').forEach(r => r.addEventListener('change', updateRate));

    /* ── 4. "Apply for this role" + hero freelance CTA ── */
    function goToForm(focusEl) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => focusEl && focusEl.focus({ preventScroll: true }), 700);
    }

    document.querySelectorAll('.cr-apply').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            roleSelect.value = btn.closest('.cr-job').dataset.role;
            roleSelect.dispatchEvent(new Event('change'));
            clearError(roleSelect);
            goToForm(document.getElementById('cr-name'));
        });
    });

    document.querySelectorAll('[data-preselect-track]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            setTrack(link.dataset.preselectTrack);
            goToForm(document.getElementById('cr-name'));
        });
    });

    document.querySelectorAll('[data-preselect-role]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            roleSelect.value = link.dataset.preselectRole;
            roleSelect.dispatchEvent(new Event('change'));
            clearError(roleSelect);
            goToForm(document.getElementById('cr-name'));
        });
    });

    /* ── 5. File input ── */
    fileInput.addEventListener('change', () => {
        const f = fileInput.files[0];
        clearError(fileInput);
        if (!f) { fileLabel.innerHTML = '<strong>Click to upload</strong> or drag your CV here · PDF, max 5MB'; return; }
        fileLabel.innerHTML = `📄 <strong>${f.name.replace(/[<>&"]/g, '')}</strong> · ${(f.size / 1048576).toFixed(2)} MB`;
    });

    /* ── 6. Validation ── */
    function fieldWrap(el) { return el.closest('.cr-field'); }
    function setError(el, msg) {
        const w = fieldWrap(el); if (!w) return;
        w.classList.add('has-error');
        const e = w.querySelector('.cr-error'); if (e && msg) e.textContent = msg;
    }
    function clearError(el) { const w = fieldWrap(el); if (w) w.classList.remove('has-error'); }

    function normalisePhone(raw) {
        let d = raw.replace(/[^\d]/g, '');
        if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
        if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
        return /^[6-9]\d{9}$/.test(d) ? d : null;
    }

    function normalisePortfolio(raw) {
        const v = raw.trim();
        if (/^@[\w.]{1,30}$/.test(v)) return `https://www.instagram.com/${v.slice(1)}`;
        const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
        try {
            const u = new URL(withProto);
            return u.hostname.includes('.') ? u.href : null;
        } catch { return null; }
    }

    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => clearError(el));
        el.addEventListener('change', () => clearError(el));
    });

    function validate() {
        let firstBad = null;
        const bad = (el, msg) => { setError(el, msg); if (!firstBad) firstBad = el; };

        const name = form.full_name;
        if (name.value.trim().length < 2) bad(name, 'Please enter your full name.');

        const phone = form.whatsapp;
        if (!normalisePhone(phone.value)) bad(phone, 'Enter a valid 10-digit Indian mobile number (starts with 6–9).');

        const email = form.email;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad(email, 'Enter a valid email address.');

        if (!form.district.value) bad(form.district, 'Select your city / district.');

        if (!getTrack()) bad(form.querySelector('input[name="engagement_track"]'), 'Choose an engagement track.');

        if (!roleSelect.value) bad(roleSelect, 'Select the role you are applying for.');

        const port = form.portfolio;
        if (!normalisePortfolio(port.value)) bad(port, 'Paste a valid link (Drive, Behance, YouTube, website) or an Instagram @handle.');

        const why = form.why_tsm;
        if (why.value.trim().length < 20) bad(why, 'Tell us a little more — at least a couple of sentences.');

        const f = fileInput.files[0];
        if (f) {
            const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
            if (!isPdf) bad(fileInput, 'Please upload your CV as a PDF.');
            else if (f.size > CAREERS_CONFIG.MAX_FILE_MB * 1048576) bad(fileInput, `File is larger than ${CAREERS_CONFIG.MAX_FILE_MB}MB.`);
        }

        if (firstBad) {
            const target = firstBad.type === 'radio' ? firstBad.closest('.cr-field') : firstBad;
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (firstBad.focus) firstBad.focus({ preventScroll: true });
        }
        return !firstBad;
    }

    const toBase64 = file => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
    });

    /* ── 7. Submit ── */
    form.addEventListener('submit', async e => {
        e.preventDefault();
        statusBox.classList.remove('show');
        if (form.botcheck.checked) return; // honeypot
        if (!validate()) return;

        const btn = form.querySelector('.cr-submit');
        const btnHTML = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = 'Submitting your application…';

        const roleText = roleSelect.options[roleSelect.selectedIndex].text;
        const districtText = form.district.options[form.district.selectedIndex].text;
        const phone = normalisePhone(form.whatsapp.value);
        const portfolio = normalisePortfolio(form.portfolio.value);
        const resume = fileInput.files[0];

        const payload = {
            subject: `New Job Application — ${roleText} | ${form.full_name.value.trim()}`,
            from_name: 'True Souls Media Careers',
            full_name: form.full_name.value.trim(),
            whatsapp: `+91 ${phone}`,
            email: form.email.value.trim(),
            replyto: form.email.value.trim(),
            district: districtText,
            engagement_track: getTrack(),
            role: roleText,
            portfolio,
            equipment_stack: stackInput.value.trim() || '—',
            expected_rate: rateInput.value.trim() || '—',
            why_tsm: form.why_tsm.value.trim(),
            resume_attached: resume ? `${resume.name} (${(resume.size / 1048576).toFixed(2)} MB)` : 'No',
            submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            source_page: location.href
        };
        if (CAREERS_CONFIG.ENDPOINT.includes('web3forms')) payload.access_key = CAREERS_CONFIG.ACCESS_KEY;

        try {
            let opts;
            if (resume && CAREERS_CONFIG.FILE_MODE === 'multipart') {
                const fd = new FormData();
                Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
                fd.append('attachment', resume);
                opts = { method: 'POST', body: fd, headers: { Accept: 'application/json' } };
            } else {
                if (resume && CAREERS_CONFIG.FILE_MODE === 'base64') {
                    payload.resume_name = resume.name;
                    payload.resume_base64 = await toBase64(resume);
                }
                const isAppsScript = CAREERS_CONFIG.ENDPOINT.includes('script.google.com');
                opts = {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    // Apps Script rejects CORS preflight, so send as text/plain
                    headers: isAppsScript ? { 'Content-Type': 'text/plain;charset=utf-8' }
                                          : { 'Content-Type': 'application/json', Accept: 'application/json' }
                };
            }

            const res = await fetch(CAREERS_CONFIG.ENDPOINT, opts);
            let ok = res.ok;
            try { const j = await res.json(); if (j && j.success === false) ok = false; } catch { /* non-JSON reply */ }
            if (!ok) throw new Error(`HTTP ${res.status}`);

            // Build the WhatsApp fast-track link
            const msg = `Hi True Souls Media team! I just applied for the ${roleText} position on truesoulsmedia.com/careers. My name is ${payload.full_name} from ${districtText}. Portfolio: ${portfolio}`;
            waBtn.href = `https://wa.me/${CAREERS_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

            document.getElementById('cr-success-name').textContent = payload.full_name.split(' ')[0];
            document.getElementById('cr-success-role').textContent = roleText;
            const cvNote = document.getElementById('cr-cv-note');
            cvNote.hidden = !(resume && CAREERS_CONFIG.FILE_MODE === 'none');

            form.hidden = true;
            document.getElementById('cr-form-intro').hidden = true;
            successBox.classList.add('show');
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('Careers form error:', err);
            statusBox.innerHTML = '⚠️ We couldn\'t submit your application right now. Please try again, or send your details directly on <a href="https://wa.me/919061286660" target="_blank" rel="noopener" style="color:#25d366;font-weight:700;">WhatsApp</a> / <a href="mailto:truesoulsmedia666@gmail.com" style="color:#c084fc;font-weight:700;">email</a>.';
            statusBox.classList.add('show');
        } finally {
            btn.disabled = false;
            btn.innerHTML = btnHTML;
        }
    });

    /* ── 8. Deep links: /careers?role=video-editor or ?track=freelance ── */
    const params = new URLSearchParams(location.search);
    const qRole = params.get('role');
    if (qRole && (roleMeta(qRole) || qRole === 'open-application')) {
        roleSelect.value = qRole;
        roleSelect.dispatchEvent(new Event('change'));
    }
    if (params.get('track') === 'freelance') setTrack('Freelance / Event Crew');
    if (params.get('track') === 'internship') setTrack('Internship / Trainee');
    updateRate();
});
