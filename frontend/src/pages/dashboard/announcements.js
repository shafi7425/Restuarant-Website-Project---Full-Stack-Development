// src/pages/announcements.js

import { apiFetch, getUser, isLoggedIn, isTokenExpired, goTo } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

/* -------------------------
   Page Renderer
------------------------- */
export async function announcementsPage() {
    const app = document.getElementById("app");

    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    const user = getUser();
    if (user.role !== "admin") {
        goTo("/admin/dashboard");
        return;
    }

    app.innerHTML = `
        <div class="d-flex">
            <div id="sidebar-holder"></div>

            <main class="container-fluid p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Announcements</h1>
                    <button class="btn btn-primary" id="addBtn">+ Add</button>
                </div>

                <div id="announcementsTable"></div>
            </main>
        </div>

        <!-- Modal -->
        <div id="modalHolder"></div>
    `;

    document.getElementById("sidebar-holder").innerHTML = renderSidebar();
    sidebarInit();

    loadAnnouncements();
    document.getElementById("addBtn").addEventListener("click", openAddModal);
}

/* -------------------------
   Load Announcements
------------------------- */
async function loadAnnouncements() {
    const data = await apiFetch(`${API_BASE}/api/announcements`);

    const rows = data.map((a, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${escape(a.title)}</td>
            <td>
                <span class="badge ${a.status === "active" ? "bg-success" : "bg-secondary"}">
                    ${a.status}
                </span>
            </td>
            <td>${a.created_at}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="toggleStatus('${a._id}', '${a.status}')">Toggle</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement('${a._id}')">Delete</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("announcementsTable").innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th width="200">Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

/* -------------------------
   Add Modal
------------------------- */
function openAddModal() {
    document.getElementById("modalHolder").innerHTML = `
        <div class="modal fade show d-block" style="background:rgba(0,0,0,.4)">
            <div class="modal-dialog">
                <div class="modal-content p-3">
                    <h5>Add Announcement</h5>

                    <input id="title" class="form-control my-2" placeholder="Title">
                    <textarea id="message" class="form-control my-2" placeholder="Message"></textarea>

                    <select id="status" class="form-select my-2">
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                    </select>

                    <div class="text-end mt-3">
                        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-success" onclick="saveAnnouncement()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.saveAnnouncement = async function () {
    const title = document.getElementById("title").value;
    const message = document.getElementById("message").value;
    const status = document.getElementById("status").value;

    await apiFetch(`${API_BASE}/api/announcements`, {
        method: "POST",
        body: JSON.stringify({ title, message, status })
    });

    closeModal();
    loadAnnouncements();
};

/* -------------------------
   Delete
------------------------- */
window.deleteAnnouncement = async function (id) {
    if (!confirm("Delete this announcement?")) return;
    await apiFetch(`${API_BASE}/api/announcements/${id}`, { method: "DELETE" });
    loadAnnouncements();
};

/* -------------------------
   Toggle Status
------------------------- */
window.toggleStatus = async function (id, status) {
    const newStatus = status === "active" ? "disabled" : "active";
    await apiFetch(`${API_BASE}/api/announcements/status/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
    });
    loadAnnouncements();
};

/* -------------------------
   Helpers
------------------------- */
function closeModal() {
    document.getElementById("modalHolder").innerHTML = "";
}

function escape(text = "") {
    return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
