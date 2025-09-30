import React, { useEffect, useState } from "react";

const RaisedTicket = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/registrar/raised-tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.data);
      })
      .catch((err) => console.error("Error fetching tickets:", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Raised Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold">{ticket.subject}</h3>
              <p className="text-gray-600">{ticket.description}</p>
              <p className="text-sm text-gray-400">Raised on: {new Date(ticket.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RaisedTicket;
