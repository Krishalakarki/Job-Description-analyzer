def jd_analysis_prompt(jd, skills):
    return f"""You are an expert job description analyzer. Your task is to extract skills accurately and compare them with user skills.

**CRITICAL EXTRACTION RULES:**
1. Extract ALL technical skills, frameworks, languages, and tools mentioned
2. Pay special attention to:
   - Programming languages (Python, Java, JavaScript, etc.)
   - Frameworks (FastAPI, Django, React, etc.)
   - Databases (SQL, PostgreSQL, MongoDB, etc.)
   - Tools (Git, Docker, Postman, etc.)
   - Concepts (REST API, GenAI, LLM, etc.)
3. Distinguish between "required" (must-have, strong, should, required) and "preferred" (nice-to-have, plus, bonus)

**COMPARISON LOGIC:**
- User has these skills: {skills}
- required_skills = ALL must-have skills from job description
- preferred_skills = ALL nice-to-have skills from job description  
- missing_skills = required skills NOT in user skills list
- matched = count of required skills present in user skills (case-insensitive partial matching)

**OUTPUT FORMAT (STRICT JSON):**
{{
  "required_skills": [list of all required skills from JD],
  "preferred_skills": [list of all preferred skills from JD],
  "missing_skills": [required skills user doesn't have],
  "match_score": {{
    "matched": number,
    "total": number,
    "percentage": number
  }},
  "learning_roadmap": [
    {{
      "skill": "missing skill name",
      "priority": "High/Medium/Low",
      "description": "why this skill matters for the role",
      "resources": [
        "Specific learning resource 1",
        "Specific learning resource 2"
      ]
    }}
  ]
}}

**IMPORTANT:**
- Return ONLY valid JSON, no markdown, no explanations
- Be thorough in skill extraction - don't miss obvious skills
- Match skills intelligently (e.g., "FastAPI" user skill matches "FastAPI" requirement)
- Provide actionable learning resources

---

**Job Description:**
{jd}

**User's Current Skills:**
{skills}

**Your JSON Response:**"""