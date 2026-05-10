// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileNav.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  });
});

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 80) {
      el.classList.add('active');
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Animated counters
const counters = document.querySelectorAll('.stat-number');
let countersDone = false;
const animateCounters = () => {
  if (countersDone) return;
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;
  const top = statsSection.getBoundingClientRect().top;
  if (top < window.innerHeight - 100) {
    countersDone = true;
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const update = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString() + suffix;
          requestAnimationFrame(update);
        } else {
          counter.textContent = target.toLocaleString() + suffix;
        }
      };
      update();
    });
  }
};
window.addEventListener('scroll', animateCounters);

// Progress bar animation
const animateProgress = () => {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const top = bar.getBoundingClientRect().top;
    if (top < window.innerHeight - 50) {
      bar.style.width = bar.getAttribute('data-width');
    }
  });
};
window.addEventListener('scroll', animateProgress);
window.addEventListener('load', animateProgress);

// Donation screenshot upload & collection system
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const removePreview = document.getElementById('removePreview');
const uploadStatus = document.getElementById('uploadStatus');
const donationForm = document.getElementById('donationForm');
const submitDonation = document.getElementById('submitDonation');
const donationSuccess = document.getElementById('donationSuccess');

let uploadedScreenshot = null; // Stores the base64 data of the uploaded screenshot
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (uploadArea) {
  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
}

// Remove preview button
if (removePreview) {
  removePreview.addEventListener('click', () => {
    uploadedScreenshot = null;
    previewImg.src = '';
    uploadPreview.style.display = 'none';
    fileInput.value = '';
    uploadArea.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" width="48" height="48"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      <p>Click or drag &amp; drop your payment screenshot here</p>
      <span style="font-size:0.8rem;color:#9CA3AF">Supports JPG, PNG, WEBP (Max 5MB)</span>
    `;
    uploadArea.classList.remove('uploaded');
    updateSubmitButton();
    showUploadStatus('', '');
  });
}

function handleFile(file) {
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showUploadStatus('Please upload an image file (JPG, PNG, WEBP).', 'error');
    return;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    showUploadStatus(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB allowed.`, 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedScreenshot = {
      data: e.target.result,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };
    previewImg.src = e.target.result;
    uploadPreview.style.display = 'block';
    uploadArea.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#059669" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      <p style="color:#059669;font-weight:600">Screenshot uploaded successfully!</p>
      <p style="font-size:0.8rem;color:#6B7280;margin-top:4px">${file.name} (${(file.size / 1024).toFixed(0)}KB) — Click to change</p>
    `;
    uploadArea.classList.add('uploaded');
    showUploadStatus('Screenshot ready for submission.', 'success');
    updateSubmitButton();
  };
  reader.readAsDataURL(file);
}

function showUploadStatus(message, type) {
  if (!uploadStatus) return;
  uploadStatus.textContent = message;
  uploadStatus.className = 'upload-status';
  if (type) uploadStatus.classList.add(type);
}

function updateSubmitButton() {
  if (!submitDonation) return;
  const name = document.getElementById('donorName')?.value.trim();
  const email = document.getElementById('donorEmail')?.value.trim();
  const amount = document.getElementById('donorAmount')?.value;
  const isValid = name && email && amount && uploadedScreenshot;
  submitDonation.disabled = !isValid;
}

// Listen for form input changes to update button state
['donorName', 'donorEmail', 'donorAmount', 'donorPhone', 'donorTransaction'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateSubmitButton);
});

// Handle donation form submission — collect & store the screenshot
if (donationForm) {
  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!uploadedScreenshot) {
      showUploadStatus('Please upload a payment screenshot before submitting.', 'error');
      return;
    }

    // Collect all donation data
    const donationRecord = {
      id: 'DON-' + Date.now(),
      donor: {
        name: document.getElementById('donorName').value.trim(),
        email: document.getElementById('donorEmail').value.trim(),
        phone: document.getElementById('donorPhone')?.value.trim() || '',
      },
      amount: parseFloat(document.getElementById('donorAmount').value),
      transactionId: document.getElementById('donorTransaction')?.value.trim() || '',
      screenshot: uploadedScreenshot,
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    };

    // Store in localStorage (collected donations)
    saveDonationRecord(donationRecord);

    // Show success state
    donationForm.style.display = 'none';
    donationSuccess.style.display = 'block';

    console.log('✅ Donation screenshot collected:', donationRecord);
  });
}

function saveDonationRecord(record) {
  try {
    const existing = JSON.parse(localStorage.getItem('inamigos_donations') || '[]');
    existing.push(record);
    localStorage.setItem('inamigos_donations', JSON.stringify(existing));
    console.log(`📦 Donation saved. Total collected: ${existing.length}`);
  } catch (err) {
    // If localStorage is full (due to large base64 images), store metadata without image data
    console.warn('localStorage full, saving metadata only:', err);
    const metaRecord = { ...record, screenshot: { ...record.screenshot, data: '[stored_locally]' } };
    const existing = JSON.parse(localStorage.getItem('inamigos_donations_meta') || '[]');
    existing.push(metaRecord);
    localStorage.setItem('inamigos_donations_meta', JSON.stringify(existing));
  }
}

function resetDonationForm() {
  donationForm.reset();
  donationForm.style.display = 'block';
  donationSuccess.style.display = 'none';
  uploadedScreenshot = null;
  previewImg.src = '';
  uploadPreview.style.display = 'none';
  fileInput.value = '';
  uploadArea.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" width="48" height="48"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    <p>Click or drag &amp; drop your payment screenshot here</p>
    <span style="font-size:0.8rem;color:#9CA3AF">Supports JPG, PNG, WEBP (Max 5MB)</span>
  `;
  uploadArea.classList.remove('uploaded');
  submitDonation.disabled = true;
  showUploadStatus('', '');
}

// Utility: View all collected donations (accessible from browser console)
window.viewCollectedDonations = function() {
  const donations = JSON.parse(localStorage.getItem('inamigos_donations') || '[]');
  const metaDonations = JSON.parse(localStorage.getItem('inamigos_donations_meta') || '[]');
  const all = [...donations, ...metaDonations];
  console.table(all.map(d => ({
    ID: d.id,
    Name: d.donor.name,
    Email: d.donor.email,
    Phone: d.donor.phone,
    Amount: '₹' + d.amount,
    TransactionID: d.transactionId,
    SubmittedAt: d.submittedAt,
    Status: d.status,
    HasScreenshot: d.screenshot?.data !== '[stored_locally]'
  })));
  return all;
};

// Utility: Export donations as JSON file
window.exportDonations = function() {
  const all = window.viewCollectedDonations();
  if (all.length === 0) { console.log('No donations to export.'); return; }
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inamigos_donations_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`📥 Exported ${all.length} donation(s).`);
};

// Chatbot
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInputField');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

const botResponses = {
  'donate': 'You can donate through our Donate section! We accept UPI payments. After transferring, upload a screenshot for confirmation.',
  'volunteer': 'We\'d love to have you! Please fill out the volunteer form in our Contact section, or email us at contact@inamigos.org.',
  'about': 'InAmigos Foundation was founded on September 23, 2020 by Govind Shukla. We are a Section 8 registered NGO creating social impact across India.',
  'seva': 'Project SEVA focuses on meals and clothing distribution for underprivileged communities. We\'ve distributed over 50,000 meals!',
  'education': 'Project BACHPANSHALA provides education and digital literacy for children in underserved communities.',
  'animal': 'Project JEEV is our animal welfare initiative. We feed 50+ stray animals daily!',
  'tree': 'Project PRAKRITI focuses on environmental sustainability. We\'ve planted over 20,000 trees!',
  'internship': 'Project VIKAS offers internship and skill development programs. Over 30,000 interns have been trained!',
  'contact': 'You can reach us at contact@inamigos.org or through the contact form on our website.',
  'hello': 'Hello! Welcome to InAmigos Foundation. How can I help you today? You can ask about donations, volunteering, or our initiatives!',
  'hi': 'Hi there! How can I assist you today? Feel free to ask about our projects, donations, or volunteering opportunities.',
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(botResponses)) {
    if (lower.includes(key)) return val;
  }
  return 'Thank you for your interest! You can ask me about our initiatives (SEVA, BACHPANSHALA, JEEV, UDAAN, PRAKRITI, VIKAS), donations, volunteering, or contact information.';
}

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
  });
  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });
  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
  });
}

function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  chatInput.value = '';
  setTimeout(() => {
    addMessage(getBotReply(msg), 'bot');
  }, 600);
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent! ✓';
    btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
