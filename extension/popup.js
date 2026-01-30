// Load saved skills on popup open
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['userSkills'], (result) => {
    if (result.userSkills) {
      document.getElementById('userSkills').value = result.userSkills;
    }
  });
});

// Save skills whenever they change
document.getElementById('userSkills').addEventListener('blur', () => {
  const skills = document.getElementById('userSkills').value;
  chrome.storage.local.set({ userSkills: skills });
});

document.getElementById('analyze').addEventListener('click', async () => {
  const jdText = document.getElementById('jd').value.trim();
  const userSkillsText = document.getElementById('userSkills').value.trim();
  const resultBox = document.getElementById('result');
  const analyzeBtn = document.getElementById('analyze');

  // Validation
  if (!jdText) {
    showError('Please paste a job description');
    return;
  }

  if (!userSkillsText) {
    showError('Please enter your skills');
    return;
  }

  // Parse user skills
  const userSkills = userSkillsText
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (userSkills.length === 0) {
    showError('Please enter at least one skill');
    return;
  }

  // Show loading state
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  resultBox.className = 'show loading';
  resultBox.innerHTML = '<p>🔍 Analyzing job description...</p>';

  try {
    const response = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_description: jdText,
        user_skills: userSkills
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    displayResults(data);

  } catch (error) {
    showError(`Backend error: ${error.message}\n\nMake sure your FastAPI server is running on http://127.0.0.1:8000`);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Job Match';
  }
});

function displayResults(data) {
  const resultBox = document.getElementById('result');
  resultBox.className = 'show';

  const percentage = data.match_score?.percentage || 0;
  const scoreColor = percentage >= 70 ? '#27ae60' : percentage >= 40 ? '#f39c12' : '#e74c3c';

  let html = `
    <div class="match-score" style="color: ${scoreColor}">
      📊 Match Score: ${data.match_score?.matched || 0}/${data.match_score?.total || 0} (${percentage}%)
    </div>
  `;

  // Required Skills
  if (data.required_skills && data.required_skills.length > 0) {
    html += `
      <div class="skill-section">
        <h3>✅ Required Skills</h3>
        ${data.required_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    `;
  }

  // Missing Skills
  if (data.missing_skills && data.missing_skills.length > 0) {
    html += `
      <div class="skill-section">
        <h3>⚠️ Skills to Learn</h3>
        ${data.missing_skills.map(skill => `<span class="skill-tag" style="background: #fee; color: #e74c3c">${skill}</span>`).join('')}
      </div>
    `;
  }

  // Preferred Skills
  if (data.preferred_skills && data.preferred_skills.length > 0) {
    html += `
      <div class="skill-section">
        <h3>⭐ Preferred Skills (Nice to Have)</h3>
        ${data.preferred_skills.map(skill => `<span class="skill-tag" style="background: #fff3cd; color: #856404">${skill}</span>`).join('')}
      </div>
    `;
  }

  // Learning Roadmap
  if (data.learning_roadmap && data.learning_roadmap.length > 0) {
    html += '<div class="skill-section"><h3>🎯 Learning Roadmap</h3>';
    data.learning_roadmap.forEach(item => {
      html += `
        <div class="roadmap-item">
          <h4>${item.skill} ${item.priority ? `(${item.priority} Priority)` : ''}</h4>
          <p>${item.description || ''}</p>
          ${item.resources && item.resources.length > 0 ? 
            item.resources.map(r => `<span class="resource-link">📚 ${r}</span>`).join('') 
            : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  resultBox.innerHTML = html;
}

function showError(message) {
  const resultBox = document.getElementById('result');
  resultBox.className = 'show error';
  resultBox.textContent = `❌ ${message}`;
}