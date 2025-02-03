import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import "./InvestorRelations.css"; // Import external CSS file

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip);

const ItemType = "METRIC";

const DraggableMetric = ({ metric, index, moveMetric, removeMetric }) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item) => {
      if (item.index !== index) {
        moveMetric(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <li ref={(node) => ref(drop(node))} className="metric-item">
      <span className="metric-name">
        <span className="drag-handle">☰</span> {metric}
      </span>
      <button className="remove-button" onClick={() => removeMetric(metric)}>
        ✖
      </button>
    </li>
  );
};

const InvestorRelations = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([
    "Revenue",
    "Gross Profit",
    "SG&A",
    "Net Profit",
  ]);
  const [customMetric, setCustomMetric] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [quarters, setQuarters] = useState(["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]);
  const [metricValues, setMetricValues] = useState({});
  const [commentary, setCommentary] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [viewingReport, setViewingReport] = useState(false);

  const moveMetric = (fromIndex, toIndex) => {
    const updatedMetrics = Array.from(selectedMetrics);
    const [movedMetric] = updatedMetrics.splice(fromIndex, 1);
    updatedMetrics.splice(toIndex, 0, movedMetric);
    setSelectedMetrics(updatedMetrics);
  };

  const addCustomMetric = () => {
    if (customMetric && !selectedMetrics.includes(customMetric)) {
      setSelectedMetrics([...selectedMetrics, customMetric]);
      setCustomMetric("");
    }
  };

  const removeMetric = (metric) => {
    setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
  };

  const finalizeMetrics = () => {
    setFinalized(true);
  };

  const goBack = () => {
    setFinalized(false);
  };

  const addPreviousQuarter = () => {
    const earliestQuarter = quarters[0];
    const [quarterNum, year] = earliestQuarter.split(" ");
    const newQuarterNum = parseInt(quarterNum[1]) - 1 || 4;
    const newYear = newQuarterNum === 4 ? parseInt(year) - 1 : year;
    const newQuarter = `Q${newQuarterNum} ${newYear}`;
    setQuarters([newQuarter, ...quarters]);
  };

  const updateMetricValue = (quarter, metric, value) => {
    setMetricValues({
      ...metricValues,
      [quarter]: {
        ...metricValues[quarter],
        [metric]: value,
      },
    });
  };

  const chartData = {
    labels: quarters,
    datasets: selectedMetrics.map((metric) => ({
      label: metric,
      data: quarters.map((quarter) => metricValues[quarter]?.[metric] || 0),
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    })),
  };

  const handleGenerateReport = async () => {
    try {
      const metricsSummary = quarters
        .map((quarter) => {
          const quarterMetrics = selectedMetrics
            .map((metric) => {
              const value = metricValues[quarter]?.[metric] ?? "N/A";
              return `${metric}: ${value}`;
            })
            .join(", ");
          return `${quarter}: ${quarterMetrics}`;
        })
        .join("\n");

      const prompt = `You are an investor relations professional crafting a professional report. Based on the following metrics and commentary, write a concise report for investors:
      
      Metrics:
      ${metricsSummary}
      
      Commentary:
      ${commentary}`;

      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an investor relations professional." },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        alert("An error occurred while generating the report. Please try again.");
        return;
      }

      const data = await response.json();
      const generatedReport = data.choices[0]?.message?.content || "No report generated.";
      setReportContent(generatedReport);
      setViewingReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("An error occurred while generating the report. Please try again.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <header>
          <h1 className="title">Investor Reporting AI</h1>
        </header>
        {viewingReport ? (
          <>
            <h1 className="title">Generated Report</h1>
            <pre className="report-content">{reportContent}</pre>
            <button className="button-primary" onClick={() => setViewingReport(false)}>
              Back to Edit
            </button>
          </>
        ) : finalized ? (
          <>
            <h1 className="title">Historical Data</h1>
            <div className="quarter-controls">
              <div className="add-quarter" onClick={addPreviousQuarter}>
                +
              </div>
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {quarters.map((quarter) => (
                      <th key={quarter}>{quarter}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedMetrics.map((metric) => (
                    <tr key={metric}>
                      <td>{metric}</td>
                      {quarters.map((quarter) => (
                        <td key={quarter}>
                          <input
                            type="number"
                            value={metricValues[quarter]?.[metric] || ""}
                            onChange={(e) => updateMetricValue(quarter, metric, e.target.value)}
                            className="input-field"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-container">
              <Bar data={chartData} />
            </div>
            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Add your commentary on metrics or the business..."
              className="textarea"
            ></textarea>
            <button className="button-primary" onClick={handleGenerateReport}>
              Generate Report
            </button>
            <button className="button-secondary" onClick={goBack}>
              Back to Metrics
            </button>
          </>
        ) : (
          <>
            <ul className="metric-list">
              {selectedMetrics.map((metric, index) => (
                <DraggableMetric
                  key={metric}
                  metric={metric}
                  index={index}
                  moveMetric={moveMetric}
                  removeMetric={removeMetric}
                />
              ))}
            </ul>
            <div className="input-group">
              <input
                type="text"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                placeholder="Add custom metric"
                className="input-field"
              />
              <button className="button-primary" onClick={addCustomMetric}>
                Add
              </button>
            </div>
            <div className="finalize-button-container">
              <button className="button-primary" onClick={finalizeMetrics}>
                Finalize Metrics
              </button>
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default InvestorRelations;
