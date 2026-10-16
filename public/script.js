document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const list = document.getElementById("list");
  const select = document.getElementById("internshipSelect");
  const form = document.getElementById("form");

  fetch("/api/internships")
    .then(res => res.json())
    .then(data => {
      status.style.display = "none";
      data.data.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h4>${item.title} - ${item.company}</h4><p>${item.location}</p>`;
        list.appendChild(div);

        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.title} (${item.company})`;
        select.appendChild(opt);
      });
    })
    .catch(() => { status.innerText = "Error loading data."; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internship_id: select.value,
        applicant_name: document.getElementById("name").value,
        applicant_email: document.getElementById("email").value
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || data.error);
      form.reset();
    });
  });
});