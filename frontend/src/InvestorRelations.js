import React, { useState } from "react";
import axios from "axios";

const InvestorRelations = () => {
    
    console.log("Loaded API Key:", process.env.REACT_APP_OPENAI_API_KEY);

  const [metrics, setMetrics] = useState([
    { label: "Revenue", value: "" },
    { label: "Net Profit", value: "" },
    { label: "Operating Expenses", value: "" },
    { label: "Cash Flow", value: "" },
    { label: "Customer Growth", value: "" },
  ]);

  const [timePeriod, setTimePeriod] = useState("Q1 2025");
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Get API Key from .env
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Update table values
  const handleChange = (index, value) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index].value = value;
    setMetrics(updatedMetrics);
  };

  // Send data to OpenAI API
  const generateSummary = async () => {
    setLoading(true);
    setAiSummary("");
  
    // Define the prompt before using it
    const prompt = `
      Generate a professional investor update for ${timePeriod}.
      Financial Metrics:
      ${metrics.map((m) => `${m.label}: ${m.value}`).join("\n")}
    `;
  
    console.log("Generated Prompt:", prompt); // Debugging log
  
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are an investor relations assistant who generates professional investor updates." },
            { role: "user", content: prompt },
          ],
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("API Response:", response.data); // Debugging log
      setAiSummary(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating AI summary:", error.response?.data || error.message);
      setAiSummary("Error: Could not generate summary.");
    }
  
    setLoading(false);
  };
    
  return (
    <div className="container mt-4">
      <h2 className="text-primary">Investor Relations Report Generator</h2>

      {/* Time Period Selection */}
      <label className="form-label mt-3">Select Time Period:</label>
      <select className="form-select" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
        <option>Q1 2025</option>
        <option>Q2 2025</option>
        <option>Q3 2025</option>
        <option>Q4 2025</option>
      </select>

      {/* Metrics Input Table */}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
            <tr key={index}>
              <td>{metric.label}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={metric.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Generate AI Summary Button */}
      <button className="btn btn-success mt-3" onClick={generateSummary} disabled={loading}>
        {loading ? "Generating..." : "Generate AI Summary"}
      </button>

      {/* AI Summary Output */}
      {aiSummary && (
        <div className="alert alert-info mt-4">
          <h4>AI-Generated Investor Update:</h4>
          <p>{aiSummary}</p>
        </div>
      )}
    </div>
  );
};


// Ensure correct export
export default InvestorRelations;
