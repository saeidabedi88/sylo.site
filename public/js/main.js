// Main.js - Frontend JavaScript for Acetec Content Manager

document.addEventListener('DOMContentLoaded', function() {
  // Form handling for single content item
  const contentForm = document.getElementById('contentForm');
  const saveButton = document.getElementById('saveContent');
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Trigger form validation
      if (!contentForm.checkValidity()) {
        contentForm.reportValidity();
        return;
      }
      
      // Get form data
      const topic = document.getElementById('topic').value;
      const keywords = document.getElementById('keywords').value;
      const platform = document.getElementById('platform').value;
      const publishDate = document.getElementById('publishDate').value;
      
      // Create data object
      const contentData = {
        topic,
        keywords,
        platform,
        publishDate
      };
      
      // Send data to server
      fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addContentModal'));
        modal.hide();
        
        // Refresh page to show new content
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to save content. Please try again.');
      });
    });
  }
  
  // Monthly planning form handling
  const monthlyPlanForm = document.getElementById('monthlyPlanForm');
  const saveMonthlyPlanButton = document.getElementById('saveMonthlyPlan');
  
  if (saveMonthlyPlanButton) {
    // Update the total count when platform counts change
    const platformCountInputs = document.querySelectorAll('.platform-count');
    const packageSizeSelect = document.getElementById('packageSize');
    const distributionWarning = document.getElementById('distributionWarning');
    
    // Function to validate distribution counts
    const validateDistribution = () => {
      const wordpressCount = parseInt(document.getElementById('wordpressCount').value) || 0;
      const facebookCount = parseInt(document.getElementById('facebookCount').value) || 0;
      const instagramCount = parseInt(document.getElementById('instagramCount').value) || 0;
      const packageSize = parseInt(packageSizeSelect.value);
      
      const totalCount = wordpressCount + facebookCount + instagramCount;
      
      if (totalCount !== packageSize) {
        distributionWarning.classList.remove('d-none');
        distributionWarning.textContent = `Total count (${totalCount}) must equal package size (${packageSize})`;
        return false;
      } else {
        distributionWarning.classList.add('d-none');
        return true;
      }
    };
    
    // Add event listeners to update counts when inputs change
    platformCountInputs.forEach(input => {
      input.addEventListener('change', validateDistribution);
    });
    
    // Update platform counts when package size changes
    packageSizeSelect.addEventListener('change', function() {
      const packageSize = parseInt(this.value);
      const countPerPlatform = Math.floor(packageSize / 3);
      const remainder = packageSize % 3;
      
      document.getElementById('wordpressCount').value = countPerPlatform + (remainder > 0 ? 1 : 0);
      document.getElementById('facebookCount').value = countPerPlatform + (remainder > 1 ? 1 : 0);
      document.getElementById('instagramCount').value = countPerPlatform;
      
      validateDistribution();
    });
    
    // Submit monthly plan
    saveMonthlyPlanButton.addEventListener('click', function() {
      // Trigger form validation
      if (!monthlyPlanForm.checkValidity()) {
        monthlyPlanForm.reportValidity();
        return;
      }
      
      // Check distribution
      if (!validateDistribution()) {
        return;
      }
      
      // Get form data
      const monthlyTheme = document.getElementById('monthlyTheme').value;
      const packageSize = parseInt(document.getElementById('packageSize').value);
      const startDate = document.getElementById('startDate').value;
      const keywords = document.getElementById('monthlyKeywords').value;
      const wordpressCount = parseInt(document.getElementById('wordpressCount').value);
      const facebookCount = parseInt(document.getElementById('facebookCount').value);
      const instagramCount = parseInt(document.getElementById('instagramCount').value);
      const topicSuggestions = document.getElementById('topicSuggestions').value;
      
      // Create data object
      const planData = {
        monthlyTheme,
        packageSize,
        startDate,
        keywords,
        distribution: {
          wordpress: wordpressCount,
          facebook: facebookCount,
          instagram: instagramCount
        },
        topicSuggestions
      };
      
      // Send data to server
      fetch('/api/content/monthly-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Monthly Plan Created:', data);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('monthlyPlanModal'));
        modal.hide();
        
        // Show success message
        alert(`Successfully created ${data.length} content items for the monthly plan!`);
        
        // Refresh page to show new content
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to create monthly plan. Please try again.');
      });
    });
    
    // Initialize date field with current date
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
      const today = new Date();
      const formattedDate = today.toISOString().substr(0, 10);
      startDateInput.value = formattedDate;
    }
    
    // Initial validation
    validateDistribution();
  }
  
  // Platform filter handling
  const filterButtons = document.querySelectorAll('.btn-group .btn-outline-primary');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get selected platform
      const platform = this.textContent.trim().toLowerCase();
      
      // Here you would filter the table based on platform
      if (platform === 'all') {
        window.location.href = '/';
      } else {
        window.location.href = `/?platform=${platform}`;
      }
    });
  });
  
  // Generate button handling
  document.querySelectorAll('.generate-btn').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.getAttribute('data-id');
      const topic = row.cells[0].textContent.trim();
      
      // Disable button and show loading state
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
      
      // Call the API to generate content
      fetch(`/api/content/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Generated:', data);
        // Update UI
        row.cells[3].innerHTML = '<span class="badge bg-warning">Generated</span>';
        this.classList.add('d-none');
        row.querySelector('.approve-btn').classList.remove('d-none');
        
        // Redirect to content detail page
        window.location.href = `/content/${id}`;
      })
      .catch(error => {
        console.error('Error:', error);
        alert(`Failed to generate content for "${topic}". Please try again.`);
        // Reset button state
        this.disabled = false;
        this.innerHTML = 'Generate';
      });
    });
  });
  
  // Approve button handling
  document.querySelectorAll('.approve-btn').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.getAttribute('data-id');
      const topic = row.cells[0].textContent;
      
      // Call the API to approve content
      fetch(`/api/content/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Approved:', data);
        // Update UI
        row.cells[3].innerHTML = '<span class="badge bg-success">Approved</span>';
        this.classList.add('d-none');
      })
      .catch(error => {
        console.error('Error:', error);
        alert(`Failed to approve content for "${topic}". Please try again.`);
      });
    });
  });
  
  // Delete button handling
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = row.getAttribute('data-id');
      const topic = row.cells[0].textContent;
      
      if (confirm(`Are you sure you want to delete "${topic}"?`)) {
        // Call the API to delete content
        fetch(`/api/content/${id}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Deleted:', data);
          // Remove row
          row.remove();
        })
        .catch(error => {
          console.error('Error:', error);
          alert(`Failed to delete content for "${topic}". Please try again.`);
        });
      }
    });
  });
  
  // Publish button handling
  document.querySelectorAll('.publish-btn').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const id = this.getAttribute('data-id');
      const topic = row.cells[0].textContent.trim();
      
      if (confirm(`Are you sure you want to publish "${topic}"?`)) {
        // Show loading state
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...';
        
        // Call the API to publish content
        fetch(`/api/content/${id}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Published:', data);
          // Update UI
          row.cells[3].innerHTML = '<span class="badge bg-primary">Published</span>';
          this.remove(); // Remove publish button
          alert(`Content published successfully!`);
        })
        .catch(error => {
          console.error('Error:', error);
          alert(`Failed to publish content for "${topic}". Please try again.`);
          this.disabled = false;
          this.innerHTML = 'Publish';
        });
      }
    });
  });
}); 