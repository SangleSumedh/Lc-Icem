import React, { useState } from "react";
import { HelpCircle, Mail, Phone, Clock, LifeBuoy, Ticket } from "lucide-react";

const Help = () => {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    const newTicket = { id: Date.now(), title, description, priority };
    setTickets([...tickets, newTicket]);
    setTitle("");
    setDescription("");
    setPriority("Low");
    setFormSubmitted(true);
    setActiveTab("view"); 
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col justify-start items-start w-full max-w-4xl mx-auto p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">💡 How can we help?</h1>
      <p className="text-gray-600 mb-6">
        Find answers, guides, and resources to help you get the most out of our platform.
      </p>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        {/* Help Center */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <HelpCircle className="w-8 h-8 text-blue-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Help Center</h2>
          <p className="text-gray-600 text-sm">
            Browse FAQs, guides, and documentation to quickly resolve common issues.
          </p>
          <button className="mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Go to Help Center
          </button>
        </div>

    
        {/* Contact Support */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <LifeBuoy className="w-8 h-8 text-red-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
          <p className="text-gray-600 text-sm mb-3">
            Need personalized help? Reach out to our support team directly.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <a
                href="mailto:connect@gryphonacademy.co.in"
                className="text-blue-600 hover:underline"
              >
                connect@gryphonacademy.co.in
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <a href="tel:+918605234701" className="text-blue-600 hover:underline">
                +91 8605234701
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Mon–Sat, 10AM–7PM IST</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("create")}
          className={`pb-2 ${
            activeTab === "create"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Create Ticket
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`pb-2 ${
            activeTab === "view"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          View Tickets
        </button>
      </div>

      {/* Create Ticket Form */}
      {activeTab === "create" && (
        <div className="w-full bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">🎫 Create a New Ticket</h2>

          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-300"
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-300"
                rows={3}
                required
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border p-2 rounded-lg"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <div className="flex justify-end gap-3">
                <button
                  type="reset"
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg shadow mb-6 w-full">
              <h2 className="text-lg font-semibold mb-2">✅ Ticket Submitted!</h2>
              <p>Your ticket has been added successfully.</p>
              <button
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => setFormSubmitted(false)}
              >
                Submit Another Ticket
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Tickets */}
      {activeTab === "view" && (
        <div className="w-full mt-6 bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 Your Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-600">No tickets created yet.</p>
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="bg-gray-50 shadow p-4 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-bold">{t.title}</h3>
                    <p className="text-sm text-gray-600">{t.description}</p>
                    <span className="text-xs text-gray-500">
                      Priority: {t.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTicket(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Help;
