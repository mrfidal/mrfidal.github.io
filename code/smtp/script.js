document.addEventListener('DOMContentLoaded', function() {

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    
    const stepIndicators = {
        step1: document.getElementById('step1-indicator'),
        step2: document.getElementById('step2-indicator'),
        step3: document.getElementById('step3-indicator'),
        step4: document.getElementById('step4-indicator')
    };
    
    const navigationButtons = {
        next1: document.getElementById('next-step1'),
        prev2: document.getElementById('prev-step2'),
        next2: document.getElementById('next-step2'),
        prev3: document.getElementById('prev-step3'),
        next3: document.getElementById('next-step3'),
        prev4: document.getElementById('prev-step4'),
        send: document.getElementById('send-emails')
    };
    
    const formElements = {
        smtpService: document.getElementById('smtp-service'),
        customSmtpGroup: document.getElementById('custom-smtp-group'),
        smtpHost: document.getElementById('smtp-host'),
        smtpPort: document.getElementById('smtp-port'),
        smtpSsl: document.getElementById('smtp-ssl'),
        smtpEmail: document.getElementById('smtp-email'),
        smtpPassword: document.getElementById('smtp-password'),
        fileUploadBtn: document.getElementById('file-upload-btn'),
        fileUploadInput: document.getElementById('file-upload-input'),
        fileName: document.getElementById('file-name'),
        emailPattern: document.getElementById('email-pattern'),
        emailSubject: document.getElementById('email-subject'),
        emailContent: document.getElementById('email-content'),
        emailPreview: document.getElementById('email-preview'),
        reviewService: document.getElementById('review-service'),
        reviewEmail: document.getElementById('review-email'),
        emailCount: document.getElementById('email-count'),
        emailListContainer: document.getElementById('email-list-container'),
        reviewSubject: document.getElementById('review-subject'),
        reviewContent: document.getElementById('review-content'),
        progressContainer: document.getElementById('progress-container'),
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        notification: document.getElementById('notification'),
        notificationMessage: document.getElementById('notification-message')
    };

 
    const SMTP_PRESETS = {
        'google': {
            host: 'smtp.gmail.com',
            port: 587,
            ssl: 'tls',
            help: 'Requires "Less secure apps" enabled or App Password if 2FA is on'
        },
        'outlook': {
            host: 'smtp-mail.outlook.com',
            port: 587,
            ssl: 'tls',
            help: 'Requires enabling "Allow less secure apps" in account settings'
        },
        'yahoo': {
            host: 'smtp.mail.yahoo.com',
            port: 465,
            ssl: 'ssl',
            help: 'Requires generating an App Password in account security settings'
        }
    };

   
    const state = {
        smtpConfig: {
            service: 'google',
            host: 'smtp.gmail.com',
            port: 587,
            ssl: 'tls',
            email: '',
            password: ''
        },
        emails: [],
        emailContent: {
            subject: '',
            body: ''
        },
        currentStep: 1
    };

   
    function initEventListeners() {
        
        formElements.smtpService.addEventListener('change', handleSmtpServiceChange);
        
     
        formElements.fileUploadBtn.addEventListener('click', () => formElements.fileUploadInput.click());
        formElements.fileUploadInput.addEventListener('change', handleFileUpload);
        
      
        formElements.emailContent.addEventListener('input', updateEmailPreview);
        formElements.emailSubject.addEventListener('input', updateEmailPreview);
        
    
        navigationButtons.next1.addEventListener('click', goToStep2);
        navigationButtons.prev2.addEventListener('click', () => goToStep(1));
        navigationButtons.next2.addEventListener('click', extractEmailsFromFile);
        navigationButtons.prev3.addEventListener('click', () => goToStep(2));
        navigationButtons.next3.addEventListener('click', goToStep4);
        navigationButtons.prev4.addEventListener('click', () => goToStep(3));
        navigationButtons.send.addEventListener('click', sendEmails);
    }


    function handleSmtpServiceChange() {
        const service = formElements.smtpService.value;
        
        if (service === 'custom') {
            formElements.customSmtpGroup.style.display = 'block';
        } else {
            formElements.customSmtpGroup.style.display = 'none';
            const preset = SMTP_PRESETS[service];
            if (preset) {
                state.smtpConfig = {
                    ...state.smtpConfig,
                    service: service,
                    host: preset.host,
                    port: preset.port,
                    ssl: preset.ssl
                };
            }
        }
    }

    
    function handleFileUpload() {
        if (formElements.fileUploadInput.files.length > 0) {
            const file = formElements.fileUploadInput.files[0];
            formElements.fileName.textContent = `Selected file: ${file.name} (${formatFileSize(file.size)})`;
        }
    }

  
    function updateEmailPreview() {
        const subject = formElements.emailSubject.value || 'No subject';
        const content = formElements.emailContent.value || 'No content';
        
        formElements.emailPreview.innerHTML = `
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="margin: 0.5rem 0; border-color: #eee;">
            ${content}
        `;
    }

   
    function goToStep(step) {
    
        [step1, step2, step3, step4].forEach(step => step.classList.remove('active'));
        
 
        Object.values(stepIndicators).forEach(indicator => {
            indicator.classList.remove('active', 'completed');
        });
        
    
        switch(step) {
            case 1:
                step1.classList.add('active');
                stepIndicators.step1.classList.add('active');
                break;
            case 2:
                step2.classList.add('active');
                stepIndicators.step1.classList.add('completed');
                stepIndicators.step2.classList.add('active');
                break;
            case 3:
                step3.classList.add('active');
                stepIndicators.step1.classList.add('completed');
                stepIndicators.step2.classList.add('completed');
                stepIndicators.step3.classList.add('active');
                break;
            case 4:
                step4.classList.add('active');
                stepIndicators.step1.classList.add('completed');
                stepIndicators.step2.classList.add('completed');
                stepIndicators.step3.classList.add('completed');
                stepIndicators.step4.classList.add('active');
                
            
                updateReviewSection();
                break;
        }
        
        state.currentStep = step;
    }

    function goToStep2() {

        const email = formElements.smtpEmail.value;
        const password = formElements.smtpPassword.value;
        
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        if (formElements.smtpService.value === 'custom') {
            const host = formElements.smtpHost.value;
            const port = formElements.smtpPort.value;
            const ssl = formElements.smtpSsl.value;
            
            if (!host || !port) {
                showNotification('Please enter SMTP host and port', 'error');
                return;
            }
            
            state.smtpConfig = {
                service: 'custom',
                host,
                port: parseInt(port),
                ssl,
                email,
                password
            };
        } else {
            state.smtpConfig = {
                ...state.smtpConfig,
                email,
                password
            };
        }
        
        goToStep(2);
    }

    function goToStep4() {
        const subject = formElements.emailSubject.value;
        const content = formElements.emailContent.value;
        
        if (!subject || !content) {
            showNotification('Please enter both subject and content', 'error');
            return;
        }
        
        state.emailContent = {
            subject,
            body: content
        };
        
        goToStep(4);
    }

    function updateReviewSection() {
        formElements.reviewService.textContent = state.smtpConfig.service === 'custom' ? 
            `Custom (${state.smtpConfig.host})` : 
            state.smtpConfig.service.charAt(0).toUpperCase() + state.smtpConfig.service.slice(1);
            
        formElements.reviewEmail.textContent = state.smtpConfig.email;
        formElements.emailCount.textContent = state.emails.length;
        formElements.reviewSubject.textContent = state.emailContent.subject;
        formElements.reviewContent.innerHTML = state.emailContent.body;
        
        // Update email list
        formElements.emailListContainer.innerHTML = '';
        state.emails.slice(0, 100).forEach(email => {
            const div = document.createElement('div');
            div.className = 'email-item';
            div.textContent = email;
            formElements.emailListContainer.appendChild(div);
        });
        
        if (state.emails.length > 100) {
            const div = document.createElement('div');
            div.className = 'email-item';
            div.textContent = `...and ${state.emails.length - 100} more`;
            formElements.emailListContainer.appendChild(div);
        }
    }


    async function testSmtpConnection(smtpConfig) {
        try {
            const response = await fetch('/api/test-smtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ smtpConfig })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'SMTP test failed');
            }
            return data;
        } catch (error) {
            console.error('SMTP Test Error:', error);
            throw error;
        }
    }

    async function extractEmailsFromFile() {
        if (formElements.fileUploadInput.files.length === 0) {
            showNotification('Please upload a file first', 'error');
            return;
        }
        
        const file = formElements.fileUploadInput.files[0];
        const pattern = formElements.emailPattern.value;
        
        try {
            showNotification('Extracting emails from file...', 'success');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('pattern', pattern);

            const response = await fetch('/api/extract-emails', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract emails');
            }

            state.emails = data.emails;
            showNotification(`Found ${data.emails.length} email addresses`, 'success');
            goToStep(3);
        } catch (error) {
            showNotification('Error extracting emails: ' + error.message, 'error');
            console.error('Error:', error);
        }
    }

    async function sendEmails() {
        if (state.emails.length === 0) {
            showNotification('No emails to send', 'error');
            return;
        }

        navigationButtons.send.disabled = true;
        formElements.progressContainer.style.display = 'block';
        formElements.progressBar.style.width = '0%';
        formElements.progressText.textContent = 'Testing SMTP connection...';

        try {
   
            const testResult = await testSmtpConnection(state.smtpConfig);
            if (testResult.status !== 'success') {
                showDetailedError({
                    message: testResult.message,
                    solution: testResult.solution || 'Check your SMTP settings and credentials'
                });
                return;
            }

            formElements.progressText.textContent = 'SMTP connection successful. Sending emails...';
            
         
            const response = await fetch('/api/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    smtpConfig: state.smtpConfig,
                    emails: state.emails,
                    subject: state.emailContent.subject,
                    content: state.emailContent.body
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send emails');
            }

            formElements.progressBar.style.width = '100%';
            formElements.progressText.innerHTML = `
                Completed! <br>
                Total: ${data.total} <br>
                Success: <span class="badge success">${data.success}</span> <br>
                Failed: <span class="badge danger">${data.failed}</span>
            `;

            showNotification(`Email sending completed! ${data.success} succeeded, ${data.failed} failed`, 'success');

 
            if (data.failed > 0) {
                const failedEmails = data.results.filter(r => r.status !== 'success');
                showDetailedError({
                    message: `${data.failed} emails failed to send`,
                    results: failedEmails
                });
            }

        } catch (error) {
            showDetailedError({
                message: error.message,
                solution: 'Check your SMTP settings and try again'
            });
            console.error('Error:', error);
        } finally {
            navigationButtons.send.disabled = false;
        }
    }


    function showNotification(message, type = 'success') {
        formElements.notification.className = `notification ${type}`;
        formElements.notification.querySelector('.notification-icon').innerHTML = 
            type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
        formElements.notificationMessage.textContent = message;
        formElements.notification.classList.add('show');
        
        setTimeout(() => {
            formElements.notification.classList.remove('show');
        }, 3000);
    }

    function showDetailedError(error) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-details';
        errorContainer.innerHTML = `
            <h3>Error Details</h3>
            <p>${error.message || 'Unknown error occurred'}</p>
            ${error.solution ? `<p class="solution">Solution: ${error.solution}</p>` : ''}
            ${error.results ? `
                <h4>Failed Emails:</h4>
                <ul class="error-list">
                    ${error.results.map(r => `
                        <li>${r.email}: ${r.message || 'No error message'}</li>
                    `).join('')}
                </ul>
            ` : ''}
        `;
        

        const prevError = formElements.notification.querySelector('.error-details');
        if (prevError) formElements.notification.removeChild(prevError);
        
        formElements.notification.appendChild(errorContainer);
        formElements.notification.classList.add('show');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }


    function init() {
        initEventListeners();
        updateEmailPreview();
    }

    init();
});
