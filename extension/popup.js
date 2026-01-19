document.getElementById("analyze").addEventListener("click", async () => {
  const jdText = document.getElementById("jd").value;
  const resultBox = document.getElementById("result");

  resultBox.textContent = "Analyzing...";

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_description: jdText,
        user_skills: ["Python", "FastAPI", "Basic ML"]
      })
    });

    const data = await response.json();
    resultBox.textContent = JSON.stringify(data, null, 2);

  } catch (error) {
    resultBox.textContent = "Backend not running.";
  }
});
