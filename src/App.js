import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://jobfinder-backend-production-866e.up.railway.app";

function JobFinder() {
  const [resume, setResume] = useState(null);
  const [threshold, setThreshold] = useState(0.2);
  const [entryLevel, setEntryLevel] = useState(false);
  const [results, setResults] = useState([]);
  const [lastJobCount, setLastJobCount] = useState(0);

  const handleMatch = async () => {
    if (!resume) return alert("Please upload a resume.");

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("threshold", threshold);
      formData.append("entryLevel", entryLevel);

      const res = await axios.post(`${API_BASE_URL}/api/match`, formData);
      setResults(res.data);
    } catch (error) {
      console.error("Match error:", error);
      alert("Failed to match jobs.");
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/update-jobs`);
      const { new_jobs } = res.data;

      const countRes = await axios.get(`${API_BASE_URL}/api/job-count`);
      const currentCount = countRes.data.count;
      alert(`✅ Jobs refreshed. New jobs: ${new_jobs}`);

      setLastJobCount(currentCount);
      handleMatch();
    } catch (error) {
      console.error("Refresh error:", error);
      alert("Failed to refresh jobs.");
    }
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/job-count`)
      .then((res) => setLastJobCount(res.data.count))
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🎯 AI Job Matcher</h1>

      <div className="space-y-4">
        <input
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={(e) => setResume(e.target.files[0])}
          required
        />
        <div>
          <label>Match Threshold: {threshold}</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <label>
          <input
            type="checkbox"
            checked={entryLevel}
            onChange={(e) => setEntryLevel(e.target.checked)}
          />
          Entry-Level Only
        </label>

        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🔄 Find & Refresh Jobs
        </button>
      </div>

      <hr className="my-6" />

      <div>
        {results.length > 0 && <h2 className="text-xl mb-2">🔍 Matched Jobs</h2>}
        {results.map((job, i) => (
          <div key={i} className="p-4 border rounded mb-4">
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-green-600 font-bold">Match Score: {job.score}</p>
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline"
            >
              Apply
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobFinder;
