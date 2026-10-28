/**
 * Book Reading List Application
 * Lecture 11 Project
 * Author: Golu Kumar (JECRC University)
 */

const STORAGE_KEY = "golu_portfolio_book_list";

const defaultBooks = [
  {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    genre: "Software Engineering",
    status: "completed",
    rating: 5
  },
  {
    id: 2,
    title: "Eloquent JavaScript (4th Edition)",
    author: "Marijn Haverbeke",
    genre: "Web Development",
    status: "reading",
    rating: 5
  },
  {
    id: 3,
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen et al.",
    genre: "Computer Science",
    status: "reading",
    rating: 4
  },
  {
    id: 4,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    genre: "System Design",
    status: "want-to-read",
    rating: 5
  }
];

let books = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultBooks;
let currentFilter = "all";
let searchQuery = "";

// DOM Elements
const booksGrid = document.getElementById("books-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterTabs = document.querySelectorAll(".tab-btn");

const statTotal = document.getElementById("stat-total");
const statReading = document.getElementById("stat-reading");
const statCompleted = document.getElementById("stat-completed");
const statWant = document.getElementById("stat-want");

const modal = document.getElementById("book-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const bookForm = document.getElementById("book-form");

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  render();
}

function updateStats() {
  statTotal.textContent = books.length;
  statReading.textContent = books.filter(b => b.status === "reading").length;
  statCompleted.textContent = books.filter(b => b.status === "completed").length;
  statWant.textContent = books.filter(b => b.status === "want-to-read").length;
}

function renderStars(rating) {
  const full = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return full + empty;
}

function render() {
  updateStats();
  booksGrid.innerHTML = "";

  const filtered = books.filter(book => {
    const matchesFilter = currentFilter === "all" || book.status === currentFilter;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery) ||
      book.author.toLowerCase().includes(searchQuery) ||
      (book.genre && book.genre.toLowerCase().includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered.forEach(book => {
    const card = document.createElement("article");
    card.className = "book-card";

    const statusBadgeText =
      book.status === "reading"
        ? "Reading"
        : book.status === "completed"
        ? "Completed"
        : "Want to Read";

    card.innerHTML = `
      <div>
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-author">by ${escapeHtml(book.author)} · <small>${escapeHtml(book.genre || "General")}</small></p>
      </div>
      <div>
        <div class="book-meta">
          <span class="badge badge-${book.status}">${statusBadgeText}</span>
          <span class="star-rating" title="${book.rating} Stars">${renderStars(Number(book.rating))}</span>
        </div>
        <div class="book-actions">
          <button class="btn-delete" data-id="${book.id}">Remove</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-delete").addEventListener("click", () => {
      deleteBook(book.id);
    });

    booksGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  saveBooks();
}

// Modal Handlers
openModalBtn.addEventListener("click", () => {
  bookForm.reset();
  modal.hidden = false;
});

function closeModal() {
  modal.hidden = true;
}

closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

// Form Submission
bookForm.addEventListener("submit", e => {
  e.preventDefault();
  const newBook = {
    id: Date.now(),
    title: document.getElementById("book-title").value.trim(),
    author: document.getElementById("book-author").value.trim(),
    genre: document.getElementById("book-genre").value.trim(),
    status: document.getElementById("book-status").value,
    rating: Number(document.getElementById("book-rating").value)
  };

  books.unshift(newBook);
  saveBooks();
  closeModal();
});

// Filters & Search
filterTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    filterTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  render();
});

// Initial Render
render();
