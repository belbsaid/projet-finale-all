const axios = require("axios");

async function testLeads() {
  try {
    const res = await axios.get("http://localhost:4000/api/leads");
    const leads = res.data?.data || res.data?.leads || res.data;
    if (leads && leads.length > 0) {
      const lead = leads[0];
      const leadId = lead._id || lead.id;
      console.log("Found lead:", leadId);

      try {
        console.log("Trying PATCH /api/leads/:id/status...");
        await axios.patch(`http://localhost:4000/api/leads/${leadId}/status`, {
          status: "Contacted",
        });
        console.log("PATCH success!");
      } catch (err) {
        console.error(
          "PATCH failed:",
          err?.response?.status,
          err?.response?.statusText,
        );
      }

      try {
        console.log("Trying PUT /api/leads/:id...");
        // We only send status to mimic a partial update if backend supports it
        await axios.put(`http://localhost:4000/api/leads/${leadId}`, {
          status: "Contacted",
        });
        console.log("PUT success!");
      } catch (err) {
        console.error(
          "PUT failed:",
          err?.response?.status,
          err?.response?.statusText,
        );
      }
    } else {
      console.log("No leads found.");
    }
  } catch (err) {
    console.error("Error fetching leads:", err);
  }
}
testLeads();
