
import streamlit as st
import os
import json
import pandas as pd
from datetime import datetime
import google.generativeai as genai

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="HireAI - Smart Recruitment Suite",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CUSTOM STYLING ---
st.markdown("""
    <style>
    .main {
        background-color: #f8fafc;
    }
    .stButton>button {
        width: 100%;
        border-radius: 10px;
        height: 3em;
        background-color: #2563eb;
        color: white;
        font-weight: 600;
        border: none;
    }
    .stButton>button:hover {
        background-color: #1d4ed8;
        border: none;
        color: white;
    }
    .job-card {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        border: 1px solid #e2e8f0;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .metric-card {
        background-color: white;
        padding: 15px;
        border-radius: 12px;
        border-left: 5px solid #2563eb;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
    </style>
""", unsafe_allow_html=True)

# --- SESSION STATE INITIALIZATION ---
if 'jobs' not in st.session_state:
    st.session_state.jobs = [
        {"id": "1", "title": "Senior Frontend Engineer", "dept": "Engineering", "content": "React expert with 5+ years experience...", "created": "2023-10-01"},
        {"id": "2", "title": "Product Designer", "dept": "Design", "content": "UI/UX lead for fintech tools...", "created": "2023-10-05"}
    ]
if 'candidates' not in st.session_state:
    st.session_state.candidates = []

# --- AI SERVICES ---
def get_ai_evaluation(jd_text, resume_text):
    """Call Gemini to evaluate the candidate against the JD."""
    genai.configure(api_key=os.environ.get("API_KEY"))
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    Analyze this resume against the Job Description (JD).
    JD: {jd_text}
    Resume: {resume_text}
    
    Return a JSON object with:
    - matchPercentage (number 0-100)
    - summary (string)
    - pros (list of strings)
    - cons (list of strings)
    - interviewQuestions (list of 5 strings)
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean potential markdown from response
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except Exception as e:
        return {"error": str(e)}

def generate_invite_email(name, role, score):
    """Generate a personalized email invite."""
    genai.configure(api_key=os.environ.get("API_KEY"))
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    prompt = f"Write a warm, professional interview invitation email for {name} for the {role} role. Their AI match score was {score}%."
    response = model.generate_content(prompt)
    return response.text

# --- SIDEBAR NAVIGATION ---
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/flash-on.png", width=60)
    st.title("HireAI")
    st.markdown("---")
    nav = st.radio("Navigation", ["📊 Dashboard", "💼 Job Management", "🔍 Candidate Screening"])
    st.markdown("---")
    st.info("System running on Gemini 2.0 Flash Pro")

# --- DASHBOARD VIEW ---
if nav == "📊 Dashboard":
    st.title("Recruitment Overview")
    
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Active Jobs", len(st.session_state.jobs))
    c2.metric("Candidates", len(st.session_state.candidates))
    
    shortlisted = len([c for c in st.session_state.candidates if c['score'] >= 75])
    c3.metric("Shortlisted", shortlisted)
    
    avg_score = sum([c['score'] for c in st.session_state.candidates]) / len(st.session_state.candidates) if st.session_state.candidates else 0
    c4.metric("Avg Match Score", f"{int(avg_score)}%")

    st.markdown("### Recent Candidate Activity")
    if not st.session_state.candidates:
        st.write("No candidates screened yet.")
    else:
        df = pd.DataFrame(st.session_state.candidates)
        st.table(df[['name', 'email', 'score', 'status']].sort_values(by='score', ascending=False).head(5))

# --- JOB MANAGEMENT VIEW ---
elif nav == "💼 Job Management":
    st.title("Job Descriptions")
    
    with st.expander("➕ Create New Position", expanded=False):
        with st.form("new_job_form"):
            title = st.text_input("Job Title")
            dept = st.text_input("Department")
            content = st.text_area("Full Job Description")
            submitted = st.form_submit_button("Save Position")
            if submitted and title and content:
                new_job = {
                    "id": str(len(st.session_state.jobs) + 1),
                    "title": title,
                    "dept": dept,
                    "content": content,
                    "created": datetime.now().strftime("%Y-%m-%d")
                }
                st.session_state.jobs.append(new_job)
                st.success(f"Position '{title}' created!")

    st.markdown("### Active Roles")
    for job in st.session_state.jobs:
        with st.container():
            st.markdown(f"""
            <div class="job-card">
                <h4>{job['title']}</h4>
                <p style='color: #64748b; font-size: 0.8em;'>{job['dept']} • Created {job['created']}</p>
                <p style='font-size: 0.9em;'>{job['content'][:150]}...</p>
            </div>
            """, unsafe_allow_html=True)

# --- CANDIDATE SCREENING VIEW ---
elif nav == "🔍 Candidate Screening":
    st.title("Candidate Screening")
    
    # 1. Selection
    job_titles = [j['title'] for j in st.session_state.jobs]
    selected_role = st.selectbox("Target Job Role", job_titles)
    active_jd = next(j for j in st.session_state.jobs if j['title'] == selected_role)
    
    # 2. Upload
    uploaded_file = st.file_uploader("Upload Candidate Resume (PDF or TXT)", type=['pdf', 'txt'])
    
    if uploaded_file and st.button("🚀 Run AI Analysis"):
        with st.spinner("Gemini is analyzing the resume..."):
            # Simulate text extraction (In prod use PyPDF2 for PDFs)
            resume_text = uploaded_file.read().decode("utf-8", errors="ignore")
            
            # AI Evaluation
            evaluation = get_ai_evaluation(active_jd['content'], resume_text)
            
            if "error" not in evaluation:
                new_cand = {
                    "name": uploaded_file.name.split('.')[0],
                    "email": "candidate@example.com",
                    "score": evaluation['matchPercentage'],
                    "status": "Shortlisted" if evaluation['matchPercentage'] >= 75 else "Screened",
                    "evaluation": evaluation
                }
                st.session_state.candidates.append(new_cand)
                
                # Show results
                st.balloons()
                st.success(f"Analysis Complete! Match Score: {evaluation['matchPercentage']}%")
                
                col_a, col_b = st.columns(2)
                with col_a:
                    st.info("🎯 **Strengths**")
                    for p in evaluation['pros']: st.write(f"✅ {p}")
                with col_b:
                    st.warning("⚠️ **Gaps**")
                    for c in evaluation['cons']: st.write(f"❌ {c}")
                
                st.markdown("### 📝 Suggested Interview Questions")
                for q in evaluation['interviewQuestions']:
                    st.write(f"- {q}")
                
                if st.button("📧 Generate Invitation Email"):
                    email = generate_invite_email(new_cand['name'], selected_role, new_cand['score'])
                    st.text_area("Email Draft", email, height=250)
            else:
                st.error(f"AI Evaluation failed: {evaluation['error']}")

    st.markdown("---")
    st.subheader("Screened Candidates")
    if st.session_state.candidates:
        st.dataframe(pd.DataFrame(st.session_state.candidates).drop(columns=['evaluation']))
    else:
        st.write("No candidates screened for this role yet.")
