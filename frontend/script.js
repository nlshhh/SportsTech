/* ==================================================
  SECTION 1: CALCULATORS & PAGE-SPECIFIC LOGIC
================================================== */

// Your calculator and modal functions remain unchanged...
// protein calc.
function calculateProtein() {
  const weight = document.getElementById("weight").value;
  const activityLevel = document.getElementById("activity-level").value;
  if (!weight || weight <= 0 || !activityLevel) {
    alert("Please enter valid weight and select activity level.");
    return;
  }
  let proteinPerKg;
  switch (activityLevel) {
    case "sedentary": proteinPerKg = 1.2; break;
    case "active": proteinPerKg = 1.5; break;
    case "very-active": proteinPerKg = 2.0; break;
    default: proteinPerKg = 1.2;
  }
  const proteinIntake = (weight * proteinPerKg).toFixed(2);
  document.getElementById("protein-result").innerHTML = `Recommended daily protein intake is: <strong>${proteinIntake} grams</strong>.`;
}

// Calorie Analyzer
function calculateCalories() {
  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const height = parseFloat(document.getElementById("height").value);
  const activityLevel = parseFloat(document.getElementById("activity").value);
  if (isNaN(age) || age <= 0 || isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0) {
    alert("Please enter valid values for age, weight, and height.");
    return;
  }
  let bmr = (gender === "male")
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  const tdee = bmr * activityLevel;
  document.getElementById("bmr-amount").innerText = bmr.toFixed(2);
  document.getElementById("tdee-amount").innerText = tdee.toFixed(2);
}

// --- Razorpay Payment Gateway Logic ---
function initializePaymentButtons() {
    const planButtons = document.querySelectorAll('.choose-plan-btn');
    if (planButtons.length === 0) return;

    planButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to choose a plan.');
                window.location.href = '/login.html';
                return;
            }
            const plan = button.dataset.plan;
            
            try {
                // Step 1: Create a Razorpay order via our backend
                const orderResponse = await fetch('/api/payments/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ plan: plan })
                });
                if (!orderResponse.ok) throw new Error('Could not create Razorpay order.');
                
                const data = await orderResponse.json();
                const { key_id, order, user } = data;
                
                // Step 2: Configure Razorpay options
                const options = {
                    key: key_id,
                    amount: order.amount,
                    currency: order.currency,
                    name: "SportsTech",
                    description: `Payment for ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                    image: "/images/SportsTech.PNG",
                    order_id: order.id,
                    
                    // Step 3: Define the handler for successful payment
                    handler: async function (response) {
                        try {
                            const verificationResponse = await fetch('/api/payments/verify-payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    planName: plan.charAt(0).toUpperCase() + plan.slice(1),
                                    amount: order.amount
                                })
                            });

                            if (!verificationResponse.ok) throw new Error('Payment verification failed.');
                            
                            const result = await verificationResponse.json();
                            alert(result.message);
                            window.location.href = '/payments.html?status=success';

                        } catch (error) {
                            console.error(error);
                            alert('Failed to verify your payment. Please contact support.');
                        }
                    },
                    
                    // Step 4: Prefill user details
                    prefill: {
                        name: user.name,
                        email: user.email,
                    },
                    theme: {
                        color: "#00b09b"
                    }
                };

                // Step 5: Open the Razorpay popup
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', (response) => alert(`Payment Failed: ${response.error.description}`));
                rzp.open();

            } catch (error) {
                console.error(error);
                alert('An error occurred. Please try again.');
            }
        });
    });
}

// --- Handles Contact Form Submission ---
async function handleContactForm(event) {
    event.preventDefault(); // Stop the form from reloading the page
    
    const messageEl = document.getElementById('contact-form-message');
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You must be logged in to send a message.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/contact/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subject, message })
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }
        
        // On success
        messageEl.textContent = data.message;
        messageEl.style.color = '#4F8A10'; // Green for success
        document.getElementById('contact-form').reset(); // Clear the form

    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.style.color = '#D8000C'; // Red for error
    }
}


/* ==================================================
  SECTION 2: WATER TRACKER (UPGRADED TO MONGODB)
================================================== */

class WaterTracker {
  constructor() {
    // 1. Find all necessary DOM elements and store them as properties
    this.goalInput = document.getElementById('goal');
    this.intakeInput = document.getElementById('intake');
    this.updateButton = document.querySelector('.water-tracker-section button');
    this.progressEl = document.getElementById('water-progress');
    this.progressTextEl = document.getElementById('water-progress-text');
    this.historyList = document.getElementById('water-history-list');
    this.token = localStorage.getItem('token');
    
    // 2. Initialize the tracker
    this.init();
  }

  // Set up event listeners
  init() {
    if (this.updateButton) {
      this.updateButton.addEventListener('click', () => this.updateWaterProgress());
    }
    this.loadWaterHistory();
  }
  
  // Method to get today's date string
  getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Method to render the progress bar UI
  renderProgressBar(total, goal) {
    let progress = (goal > 0) ? (total / goal) * 100 : 0;
    progress = Math.min(progress, 100);

    if (this.progressEl) {
      this.progressEl.style.width = progress + "%";
    }
    if (this.progressTextEl) {
      if (!this.token) {
        this.progressTextEl.innerText = "Log in to track your intake.";
      } else if (total >= goal && goal > 0) {
        this.progressTextEl.innerText = "🎉 Target Completed!";
      } else if (goal > 0) {
        this.progressTextEl.innerText = progress.toFixed(0) + "% - Keep Going!";
      } else {
        this.progressTextEl.innerText = "Set a goal to get started.";
      }
    }
  }

  // Method to fetch and display history from the database
  async loadWaterHistory() {
    if (!this.token) {
      this.renderProgressBar(0, 0);
      if(this.historyList) this.historyList.innerHTML = '<li>Please <a href="/login.html">log in</a> to view your history.</li>';
      return;
    }

    try {
      const response = await fetch('/api/water/history', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (response.status === 401) { logoutUser(); return; }
      if (!response.ok) throw new Error('Failed to fetch history');

      const history = await response.json();
      this.historyList.innerHTML = '';
      let todayDataFound = false;
      let pastEntriesFound = false;
      const today = this.getTodayDateString();

      for (const entry of history) {
        if (entry.date === today) {
          todayDataFound = true;
          this.goalInput.value = entry.goal;
          this.renderProgressBar(entry.totalIntake, entry.goal);
        } else {
          pastEntriesFound = true;
          const status = entry.completed ? "Completed" : "Not Completed";
          const li = document.createElement('li');
          li.innerHTML = `<strong>${entry.date}:</strong> ${entry.totalIntake.toFixed(1)}L / ${entry.goal.toFixed(1)}L (<strong>${status}</strong>)`;
          this.historyList.appendChild(li);
        }
      }
      if (!pastEntriesFound) this.historyList.innerHTML = '<li>No past history yet.</li>';
      if (!todayDataFound) this.renderProgressBar(0, parseFloat(this.goalInput.value) || 0);

    } catch (error) {
      console.error(error);
      if (this.historyList) this.historyList.innerHTML = '<li>Error loading history.</li>';
    }
  }

  // Method to save progress to the database
  async updateWaterProgress() {
    if (!this.token) {
      alert('Please log in to save your progress.');
      window.location.href = '/login.html';
      return;
    }

    let goal = parseFloat(this.goalInput.value);
    let intakeAmount = parseFloat(this.intakeInput.value);

    if (isNaN(goal) || goal <= 0) { alert("Please enter a valid daily goal."); return; }
    if (isNaN(intakeAmount) || intakeAmount < 0) { alert("Please enter a valid intake amount."); return; }
    if (intakeAmount === 0) return;

    try {
      const response = await fetch('/api/water/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          date: this.getTodayDateString(),
          goal: goal,
          intakeAmount: intakeAmount
        })
      });
      if (response.status === 401) { logoutUser(); return; }
      if (!response.ok) throw new Error('Failed to update progress');

      const updatedEntry = await response.json();
      this.renderProgressBar(updatedEntry.totalIntake, updatedEntry.goal);
      this.intakeInput.value = "";

    } catch (error) {
      console.error(error);
      alert('There was an error saving your progress.');
    }
  }
}

/* ==================================================
  SECTION 3: AUTHENTICATION & UI SCRIPT
================================================== */

function showAuthMessage(message, isError = false) {
    const msgEl = document.getElementById('auth-message');
    if (msgEl) {
        msgEl.textContent = message;
        msgEl.style.color = isError ? '#D8000C' : '#4F8A10';
    }
}

async function registerUser(firstName, lastName, email, password) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        showAuthMessage(data.message, false);
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    } catch (error) {
        showAuthMessage(error.message, true);
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('token', data.token);
        showAuthMessage('Login successful! Redirecting...', false);
        setTimeout(() => { window.location.href = '/'; }, 1000);
    } catch (error) {
        showAuthMessage(error.message, true);
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function checkLoginState() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'list-item';
    } else {
        if (loginLink) loginLink.style.display = 'list-item';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

/* ==================================================
  SECTION 4: GLOBAL EVENT LISTENERS
================================================== */

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    initializePaymentButtons();

    if (document.getElementById('water-progress')) {
      new WaterTracker();
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerUser(
                document.getElementById('firstName').value,
                document.getElementById('lastName').value,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginUser(
                document.getElementById('email').value,
                document.getElementById('password').value
            );
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
});