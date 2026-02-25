
export function setupFormHandler() {
    const form = document.getElementById('quote-form');
    // Ensure form exists before attaching listener
    if (!form) return;

    const statusDiv = document.getElementById('quote-form-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        if (statusDiv) {
            statusDiv.classList.add('hidden');
            statusDiv.innerText = '';
            statusDiv.className = 'text-sm mt-2 hidden'; // Reset classes
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Honeypot check
        if (data._gotcha) {
            console.log('Spam detected via honeypot. Ignoring submission.');
            if (statusDiv) {
                statusDiv.innerText = "Thanks! We'll be in touch shortly.";
                statusDiv.classList.remove('hidden');
                statusDiv.classList.add('text-green-500');
            }
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
            return;
        }

        // Prepare data for CRM (mapping fields)
        const crmData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            square_footage: data.square_footage,
            project_type: data.project_type,
            floor_condition: data.floor_condition,
            desired_finish: data.desired_finish,
            project_timeline: data.project_timeline,
            notes: data.message // Mapping message to notes
        };

        try {
            // 1. Send to CRM (fire and forget or wait? Let's wait to aid debugging, but fail soft)
            try {
                // Assuming CRM is running locally on port 3000 for now. 
                // In production, this URL would need to be an environment variable or relative path if proxied.
                // Command Center is now at /command-center or separate port
                await fetch('https://pioneerconcretecoatings.com/app/api/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(crmData),
                });
                console.log('Lead sent to CRM');
            } catch (err) {
                console.error('Failed to send to CRM:', err);
                // We do NOT stop here, we still want to send the email via Formspree
            }

            // 2. Send to Formspree
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                if (statusDiv) {
                    statusDiv.innerText = "Thanks! We'll be in touch shortly.";
                    statusDiv.classList.remove('hidden');
                    statusDiv.classList.add('text-green-500');
                }
                form.reset();
            } else {
                const errorData = await response.json();
                if (statusDiv) {
                    statusDiv.innerText = errorData.error || "Oops! There was a problem submitting your form";
                    statusDiv.classList.remove('hidden');
                    statusDiv.classList.add('text-red-500');
                }
            }

        } catch (error) {
            console.error('Submission error:', error);
            if (statusDiv) {
                statusDiv.innerText = "Oops! There was a problem submitting your form";
                statusDiv.classList.remove('hidden');
                statusDiv.classList.add('text-red-500');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
}
