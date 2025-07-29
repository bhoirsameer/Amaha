
let popupTimeout;
const csrf_token = window.csrf_token || getCsrfToken();

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/method/amaha.amaha.doctype.healthcare_service.healthcare_service_api.get_list_of_healthcare_services')  // <-- Replace with your API endpoint
        .then(response => response.json())
        .then(data => {
            const serviceSelect = document.getElementById('service_select');
            serviceSelect.innerHTML = ''; // Clear existing options

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '';
            serviceSelect.appendChild(emptyOption);
            
            if (data.message && Array.isArray(data.message)) {
                data.message.forEach(service => {
                    const opt = document.createElement('option');
                    opt.value = service;
                    opt.textContent = service;
                    serviceSelect.appendChild(opt);
                });
            }
        })
        .catch(error => {
            const serviceSelect = document.getElementById('service_select');
            serviceSelect.innerHTML = '<option value="">Failed to load services</option>';
        });
});


function showPopup(type = 'success', title = '', message = '') {
    const existingPopup = document.querySelector('.popup-notification');
    if (existingPopup) {
        existingPopup.remove();
    }

    if (popupTimeout) {
        clearTimeout(popupTimeout);
    }

    const popup = document.createElement('div');
    popup.className = `popup-notification popup-${type}`;
    
    const popupContent = getPopupContent(type, title, message);
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-icon">
                ${popupContent.icon}
            </div>
            <div class="popup-text">
                <div class="popup-title">${popupContent.title}</div>
                <div class="popup-message">${popupContent.message}</div>
            </div>
            <button class="close-btn" onclick="hidePopup(this.parentElement.parentElement)">
                ×
            </button>
        </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    popupTimeout = setTimeout(() => {
        hidePopup(popup);
    }, 3000);
}

function hidePopup(popup) {
    if (!popup) return;
    
    popup.classList.remove('show');
    popup.classList.add('hide');
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 500);
}

function getPopupContent(type, customTitle = '', customMessage = '') {
    const defaultContent = {
        success: {
            icon: '✓',
            title: 'Success!',
            message: 'Appointment created successfully!'
        },
        error: {
            icon: '✕',
            title: 'Error',
            message: 'Something went wrong. Please try again.'
        },
        warning: {
            icon: '⚠',
            title: 'Warning',
            message: 'Please review your input and try again.'
        },
        info: {
            icon: 'ℹ',
            title: 'Information',
            message: 'Processing your request...'
        }
    };
    
    const content = defaultContent[type] || defaultContent.success;
    
    return {
        icon: content.icon,
        title: customTitle || content.title,
        message: customMessage || content.message
    };
}

function handleFormSubmission() {
    const form = document.getElementById('appointmentForm');
    
    if (!form) {
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        setLoadingState(submitBtn, submitText, true);
        showPopup('info', 'Processing', 'Creating your appointment...');
        const csrf_token = getCsrfToken();
        const formData = collectFormData(form);

        try {
            const response = await fetch("/api/method/amaha.amaha.doctype.patient_appointment.patient_appointment_api.create_appointment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Frappe-CSRF-Token": csrf_token
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            setLoadingState(submitBtn, submitText, false);
            handleApiResponse(result, form);

        } catch (error) {
            setLoadingState(submitBtn, submitText, false);
            showPopup('error', 'Connection Error', 'Unable to connect to server. Please check your connection and try again.');
        }
    });
}

function setLoadingState(submitBtn, submitText, isLoading) {
    if (!submitBtn || !submitText) return;
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitText.innerHTML = '<span class="loading-spinner"></span>Submitting...';
    } else {
        submitBtn.disabled = false;
        submitText.innerHTML = 'Submit';
    }
}

function collectFormData(form) {
    return {
        patient_name: form.patient_name.value,
        patient_email: form.patient_email.value,
        patient_mobile_number: form.patient_mobile_number.value,
        appointment_date: form.appointment_date.value,
        service: form.service.value,
        appointment_time: form.appointment_time.value,
        estimated_end_time: form.estimated_end_time.value
    };
}

function getCsrfToken() {

    try {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            return csrfMeta.getAttribute('content');
        }
        
        const csrfCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='));
        if (csrfCookie) {
            return csrfCookie.split('=')[1];
        }
        
        return '';
    } catch (error) {
        return '';
    }
}

function handleApiResponse(result, form) {

    if (result?.message?.message === "success") {
        const successMessage = result.message.success_message || 'Appointment created successfully!';
        showPopup('success', 'Appointment Created!', successMessage);
        form.reset();
        
    } else if (result?.message?.message === "error") {
        const errorMessage = result.message.error || 'Failed to create appointment. Please try again.';
        showPopup('error', 'Creation Failed', errorMessage);
        
    } else if (result?.message?.message === "warning") {
        const warningMessage = result.message.warning_message || 'Please review your information and try again.';
        showPopup('warning', 'Please Check', warningMessage);
        
    } else if (result?.error) {
        showPopup('error', 'Error', result.error);

    } else {
        showPopup('warning', 'Unexpected Response', 'Please check the console for details.');
    }

}

function initializeApp() {
    handleFormSubmission();
    setTimeout(() => {
        showPopup('info', 'Welcome!', 'Fill out the form to book your appointment.');
    }, 1000);
}

window.AppointmentForm = {
    showPopup: showPopup,
    hidePopup: hidePopup,
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

document.getElementById("service_select").addEventListener("change", fetch_and_update_service_details);
document.getElementById("appointment_time").addEventListener("change", fetch_and_update_service_details);
async function fetch_and_update_service_details(){

    const serviceSelect = document.getElementById("service_select").value;     
    const appointmentTimeInput = document.getElementById("appointment_time").value; 
    console.log(serviceSelect,appointmentTimeInput,"----0000000000000000000000============")

    try {
        const response = await fetch("/api/method/amaha.amaha.doctype.patient_appointment.patient_appointment_api.get_estimated_end_time_and_duration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Frappe-CSRF-Token": csrf_token
            },
            body: JSON.stringify({
                doc_name: serviceSelect,
                appointment_time: appointmentTimeInput
            })
        });

        const result = await response.json();
        if (result.message) {
            const endTimeInput = document.getElementById("estimated_end_time");
            endTimeInput.value = result.message.estimated_end_time; 
            
            const total_amount = document.getElementById("price");
            total_amount.value = result.message.price; 

            const service_duration = document.getElementById("service_duration");
            service_duration.value = result.message.duration; 
        }

    } catch (error) {
        setLoadingState(submitBtn, submitText, false);
        showPopup('error', 'Connection Error', 'Unable to connect to server. Please check your connection and try again.');
    }
}
