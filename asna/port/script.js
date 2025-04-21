/**
 * © 2025 Fidal. All rights reserved.
 *
 * This software and associated documentation files (the "Code") are the intellectual property of the author.
 * Permission is not granted to use, copy, modify, merge, publish, distribute, sublicense, or sell
 * copies of the Code without explicit written permission from the author.
 *
 * The Code is provided "as is", without warranty of any kind, express or implied, including but not limited to
 * the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the
 * author be liable for any claim, damages, or other liability arising from the use of the Code.
 *
 * For licensing or collaboration inquiries, please contact: mrfidal@proton.me
 */

const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'bw-theme') {
  body.classList.add('bw-theme');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('bw-theme');
  if (body.classList.contains('bw-theme')) {
    localStorage.setItem('theme', 'bw-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem('theme', 'default');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

function handleImageError(img) {
  img.style.display = 'none';
  const fallback = img.nextElementSibling;
  fallback.style.display = 'flex';
}

document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', x);
    card.style.setProperty('--mouse-y', y);
  });
});
