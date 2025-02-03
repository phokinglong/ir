import React, { useState } from "react";

const InvestorSummaryForm = () => {
    const [companyName, setCompanyName] = useState("");
    const [timePeriod, setTimePeriod] = useState("");
    const [metrics, setMetrics] = useState([{ label: "", value: "" }]);
    const [generatedSummary, setGeneratedSummary] = useState("");

    const handleMetricChange = (index, field, value) => {
        const updatedMetrics = [...metrics];
        updatedMetrics[index][field] = value;
        setMetrics(updatedMetrics);
    };

    const addMetric = () => {
        setMetrics([...metrics, { label: "", value: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formattedMetrics = metrics.reduce((acc, metric) => {
            if (metric.label && metric.value) {
                acc.push({ [metric.label]: parseFloat(metric.value) });
            }
            return acc;
        }, []);

        const response = await fetch("/api/generate-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_name: companyName,
                time_period: timePeriod,
                metrics: formattedMetrics
            }),
        });

        const data = await response.json();
        setGeneratedSummary(data.summary);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Generate Investor Summary</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Company Name" className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <input type="text" placeholder="Time Period (e.g. Q4 2024)" className="input" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} required />
                
                <div>
                    <h3 className="text-lg font-semibold">Financial Metrics</h3>
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Metric Name (e.g. Revenue)"
                                className="input"
                                value={metric.label}
                                onChange={(e) => handleMetricChange(index, "label", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Value (e.g. 5.2)"
                                className="input"
                                value={metric.value}
                                onChange={(e) => handleMetricChange(index, "value", e.target.value)}
                            />
                        </div>
                    ))}
                    <button type="button" className="btn-secondary" onClick={addMetric}>+ Add Metric</button>
                </div>

                <button type="submit" className="btn">Generate Summary</button>
            </form>

            {generatedSummary && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-bold">Generated Investor Summary</h3>
                    <p className="mt-2 whitespace-pre-wrap">{generatedSummary}</p>
                </div>
            )}
        </div>
    );
};

export default InvestorSummaryForm;
