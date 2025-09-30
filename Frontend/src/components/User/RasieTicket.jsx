import React, { useState } from "react";

const RaiseTickets = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      subject,
      description,
      date: new Date().toISOString(),
    };

    // 🔹 API call to backend
    fetch("http://localhost:5000/student/raise-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Ticket raised successfully!");
        setSubject("");
        setDescription("");
      })
      .catch((err) => {
        console.error("Error raising ticket:", err);
        alert("Something went wrong!");
      });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Raise a Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
          className="w-full border rounded p-2"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your issue"
          className="w-full border rounded p-2 h-32"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
};

export default RaiseTickets;
