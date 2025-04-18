const fileUploadArea = document.getElementById('file-upload-area');
const fileInput = document.getElementById('bulk_emails_file');
const fileInfo = document.getElementById('file-info');

fileUploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        fileInfo.innerHTML = `
            <div class="alert alert-success d-flex align-items-center">
                <i class="fas fa-check-circle me-2"></i>
                <div>
                    <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)
                    <div class="text-muted">Ready to upload</div>
                </div>
            </div>
        `;
        fileUploadArea.style.borderColor = '#2ecc71';
    }
});

fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--primary-color)';
    fileUploadArea.style.backgroundColor = 'rgba(78, 115, 223, 0.05)';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#d1d3e2';
    fileUploadArea.style.backgroundColor = '';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#d1d3e2';
    fileUploadArea.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
});

const emailForm = document.getElementById('emailForm');
const counterDisplay = document.getElementById('counter-display');
const sentCounter = document.getElementById('sent-counter');
const totalCounter = document.getElementById('total-counter');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const currentEmail = document.getElementById('current-email');
const statusBadge = document.getElementById('status-badge');

let currentTaskId = null;
let updateInterval = null;

emailForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        currentTaskId = data.task_id;
        counterDisplay.style.display = 'block';
        progressContainer.style.display = 'block';
        updateInterval = setInterval(fetchUpdates, 1000);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function fetchUpdates() {
    if (!currentTaskId) return;
    
    fetch('/updates')
    .then(response => response.json())
    .then(data => {
        if (data.task_id === currentTaskId) {
            updateProgress(data.data);
        }
    });
    
    fetch(`/progress/${currentTaskId}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            clearInterval(updateInterval);
            return;
        }
        
        updateProgress(data);
        
        if (data.status === 'completed') {
            clearInterval(updateInterval);
            showCompletion(data.success_count, data.total);
        }
    });
}

function updateProgress(data) {
    const percent = Math.round((data.progress / data.total) * 100);
    
    animateCounter(sentCounter, data.success_count);
    animateCounter(totalCounter, data.total);
    
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
    currentEmail.textContent = data.current;
    
    if (data.status === 'success') {
        statusBadge.className = 'email-badge bg-success';
        statusBadge.textContent = 'Sent';
        showEmailNotification('success', `Sent to ${data.current}`);
    } else if (data.status === 'failed') {
        statusBadge.className = 'email-badge bg-danger';
        statusBadge.textContent = 'Failed';
        showEmailNotification('error', `Failed to send to ${data.current}`);
    }
}

function animateCounter(element, target) {
    const current = parseInt(element.textContent);
    if (current === target) return;
    
    const increment = target > current ? 1 : -1;
    let currentValue = current;
    
    const timer = setInterval(() => {
        currentValue += increment;
        element.textContent = currentValue;
        
        element.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            element.classList.remove('animate__animated', 'animate__bounceIn');
        }, 300);
        
        if (currentValue === target) {
            clearInterval(timer);
        }
    }, 50);
}

function showEmailNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast animate__animated animate__fadeInRight`;
    notification.role = 'alert';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check' : 'times'}-circle me-2"></i>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('animate__fadeInRight');
        notification.classList.add('animate__fadeOutRight');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function showCompletion(successCount, total) {
    Swal.fire({
        title: 'Process Completed',
        html: `Successfully sent ${successCount} of ${total} emails.`,
        icon: 'success',
        confirmButtonColor: 'var(--primary-color)'
    });
}

setTimeout(() => {
    document.querySelectorAll('.alert').forEach(alert => {
        new bootstrap.Alert(alert).close();
    });
}, 5000);
