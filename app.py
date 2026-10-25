import os
import re
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

def clean_pdf_text(text):
    text = re.sub(r'\b(\d+\s+\d+\s+obj|endobj|stream|endstream|xref|trailer)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

@app.route('/api/analyze-syllabus', methods=['POST'])
def analyze_syllabus():
    try:
        subject = request.form.get('subject', 'General Subject').strip()
        raw_text = request.form.get('rawText', '').strip()
        target_date_str = request.form.get('targetDate', '')
        daily_hours = float(request.form.get('dailyHours', 3))

        if 'syllabusFile' in request.files:
            file = request.files['syllabusFile']
            if file and file.filename.endswith('.pdf'):
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file.stream)
                    pdf_text = ""
                    for page in reader.pages:
                        pdf_text += page.extract_text() + "\n"
                    if len(pdf_text.strip()) > 20:
                        raw_text = pdf_text
                except Exception as ex:
                    print("pypdf parsing error, falling back to text:", ex)

        clean_text = clean_pdf_text(raw_text)
        lines = [l.strip() for l in clean_text.splitlines() if len(l.strip()) > 4]

        topics = []
        current_unit = "Unit 1"
        hard_words = {'pipelining', 'cache', 'hazard', 'dynamic programming', 'recursion', 'trees', 'graphs', 'compiler', 'deadlock', 'concurrency', 'fourier', 'calculus', 'interrupt', 'virtual memory'}
        med_words = {'architecture', 'memory', 'sorting', 'searching', 'array', 'stack', 'queue', 'normalization', 'routing', 'scheduling', 'bus'}

        for line in lines:
            if re.match(r'^(unit|module|chapter|section)\s*[\dIVX]+', line, re.IGNORECASE):
                parts = re.split(r'[:\-–]', line, maxsplit=1)
                current_unit = parts[0].strip()
                content = parts[1].strip() if len(parts) > 1 else ''
            else:
                content = line

            if content:
                for st in re.split(r'[,;•\-\–]', content):
                    st = st.strip()
                    if len(st) > 5 and not re.match(r'^[\d\W_]+$', st) and 'obj' not in st and 'stream' not in st:
                        lower = st.lower()
                        diff = 5 if any(w in lower for w in hard_words) else (3 if any(w in lower for w in med_words) else 2)
                        importance = 3 if diff >= 4 else (2 if diff == 3 else 1)
                        clean_title = st[:50] + '...' if len(st) > 50 else st

                        topics.append({
                            'title': f"{current_unit} - {clean_title}",
                            'difficulty': diff,
                            'hours': round(diff * 0.8 + 1.0, 1),
                            'importance': importance
                        })

        if not topics:
            topics = [
                {'title': f"Unit 1: Fundamentals & Core Architecture", 'difficulty': 2, 'hours': 2.5, 'importance': 2},
                {'title': f"Unit 2: System Operations & Bus Structure", 'difficulty': 3, 'hours': 3.5, 'importance': 2},
                {'title': f"Unit 3: Pipelining & High Performance Cache", 'difficulty': 5, 'hours': 4.5, 'importance': 3},
                {'title': f"Unit 4: Memory Hierarchy & Virtual Memory", 'difficulty': 4, 'hours': 4.0, 'importance': 3},
                {'title': f"Unit 5: Previous Year Questions & Review", 'difficulty': 4, 'hours': 3.0, 'importance': 3}
            ]

        topics = topics[:12]

        today = datetime.now()
        target_date = today + timedelta(days=30)
        if target_date_str:
            try:
                target_date = datetime.strptime(target_date_str, '%Y-%m-%d')
            except ValueError:
                pass

        total_days = max(2, (target_date - today).days)
        step_days = max(1, total_days // len(topics))

        plan = []
        for idx, t in enumerate(topics):
            task_deadline = today + timedelta(days=(idx + 1) * step_days)
            deadline_str = task_deadline.strftime('%Y-%m-%d')
            diff_days = max(0.2, (task_deadline - today).days)
            urgency = min(10.0, 10.0 / diff_days)
            score = round((urgency * 0.45) + ((t['difficulty'] / 5.0) * 10 * 0.35) + ((t['importance'] / 3.0) * 10 * 0.20), 1)

            plan.append({
                'id': f"t_syl_{int(datetime.now().timestamp())}_{idx}",
                'title': f"{subject}: {t['title']}",
                'deadline': deadline_str,
                'duration': t['hours'],
                'difficulty': t['difficulty'],
                'importance': t['importance'],
                'completed': False,
                'priorityScore': score
            })

        return jsonify({'success': True, 'plan': plan, 'count': len(plan)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 65)
    print("⚡ HYBRID AI STUDY PLANNER & HABIT LOOP TRACKER v3 ⚡")
    print("🌐 Clean PDF & Syllabus AI Engine + 100% Offline Mode")
    print("🚀 Running on http://localhost:5000")
    print("=" * 65)
    app.run(debug=True, port=5000)
