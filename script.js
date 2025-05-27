// Global variables
let allData = {
    companies: [],
    people: [],
    properties: [],
    realEstateData: null
};

let filteredData = {
    companies: [],
    people: [],
    properties: []
};

let currentView = 'overview';
let currentViewMode = 'grid';

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadAllData();
});

// Event listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.closest('.nav-btn').dataset.view;
            switchView(view);
        });
    });

    // View mode toggles
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewMode = e.target.closest('.view-btn').dataset.view;
            switchViewMode(viewMode, e.target.closest('.view-controls'));
        });
    });

    // Search and filters
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('location-filter').addEventListener('change', handleFilter);
    document.getElementById('industry-filter').addEventListener('change', handleFilter);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Modal
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
            closeModal();
        }
    });
}

// Data loading functions
async function loadAllData() {
    showLoading(true);
    
    try {
        // Load all data files
        await Promise.all([
            loadCommercialRealEstateData(),
            loadGolfDataset(),
            loadBostonDenverDataset()
        ]);

        // Process and combine data
        processAllData();
        
        // Update UI
        updateStats();
        renderCurrentView();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check the console for details.');
    } finally {
        showLoading(false);
    }
}

async function loadCommercialRealEstateData() {
    try {
        const response = await fetch('./data/commercial_real_estate_data.json');
        const data = await response.json();
        allData.realEstateData = data;
        
        // Extract companies and properties from real estate data
        Object.keys(data).forEach(city => {
            if (data[city].companies) {
                data[city].companies.forEach(company => {
                    allData.companies.push({
                        ...company,
                        city: city,
                        source: 'real_estate',
                        type: 'company'
                    });
                    
                    // Add contacts as people
                    if (company.contacts) {
                        company.contacts.forEach(contact => {
                            allData.people.push({
                                ...contact,
                                city: city,
                                source: 'real_estate',
                                type: 'person',
                                company_info: {
                                    name: company.name,
                                    website: company.website,
                                    specialization: company.specialization
                                }
                            });
                        });
                    }
                });
            }
            
            if (data[city].properties) {
                data[city].properties.forEach(property => {
                    allData.properties.push({
                        ...property,
                        city: city,
                        source: 'real_estate',
                        type: 'property'
                    });
                });
            }
        });
    } catch (error) {
        console.error('Error loading commercial real estate data:', error);
    }
}

async function loadGolfDataset() {
    try {
        const response = await fetch('./data/golf_dataset_apollo-io-scraper_2025-05-10_09-16-27-978.json');
        const data = await response.json();
        
        data.forEach(person => {
            // Add person data
            allData.people.push({
                ...person,
                source: 'apollo_golf',
                type: 'person'
            });
            
            // Add company data if not already exists
            if (person.organization && person.organization.name) {
                const existingCompany = allData.companies.find(c => 
                    c.name === person.organization.name || c.id === person.organization.id
                );
                
                if (!existingCompany) {
                    allData.companies.push({
                        ...person.organization,
                        source: 'apollo_golf',
                        type: 'company',
                        employees: [person]
                    });
                } else {
                    // Add employee to existing company
                    if (!existingCompany.employees) {
                        existingCompany.employees = [];
                    }
                    existingCompany.employees.push(person);
                }
            }
        });
    } catch (error) {
        console.error('Error loading golf dataset:', error);
    }
}

async function loadBostonDenverDataset() {
    try {
        // Try to load the JSON file first, if it fails, we'll work with what we have
        const response = await fetch('./data/boston_denver_dataset_apollo-io-scraper_2025-05-10_09-07-45-683.json');
        
        if (response.ok) {
            const data = await response.json();
            
            data.forEach(person => {
                // Add person data
                allData.people.push({
                    ...person,
                    source: 'apollo_boston_denver',
                    type: 'person'
                });
                
                // Add company data if not already exists
                if (person.organization && person.organization.name) {
                    const existingCompany = allData.companies.find(c => 
                        c.name === person.organization.name || c.id === person.organization.id
                    );
                    
                    if (!existingCompany) {
                        allData.companies.push({
                            ...person.organization,
                            source: 'apollo_boston_denver',
                            type: 'company',
                            employees: [person]
                        });
                    } else {
                        // Add employee to existing company
                        if (!existingCompany.employees) {
                            existingCompany.employees = [];
                        }
                        existingCompany.employees.push(person);
                    }
                }
            });
        }
    } catch (error) {
        console.warn('Boston/Denver dataset not available or too large:', error);
    }
}

function processAllData() {
    // Remove duplicates and clean data
    allData.companies = removeDuplicates(allData.companies, 'name');
    allData.people = removeDuplicates(allData.people, 'email');
    allData.properties = removeDuplicates(allData.properties, 'name');
    
    // Initialize filtered data
    filteredData = {
        companies: [...allData.companies],
        people: [...allData.people],
        properties: [...allData.properties]
    };
}

function removeDuplicates(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (value && seen.has(value)) {
            return false;
        }
        if (value) seen.add(value);
        return true;
    });
}

// UI Functions
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    // Create a simple error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fed7d7;
        color: #c53030;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #feb2b2;
        z-index: 1002;
        max-width: 400px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function updateStats() {
    document.getElementById('total-companies').textContent = allData.companies.length;
    document.getElementById('total-people').textContent = allData.people.length;
    document.getElementById('total-properties').textContent = allData.properties.length;
}

function switchView(view) {
    currentView = view;
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${view}-section`);
    });
    
    renderCurrentView();
}

function switchViewMode(viewMode, container) {
    currentViewMode = viewMode;
    
    // Update view controls
    container.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewMode);
    });
    
    // Update grid class
    const grids = document.querySelectorAll('.cards-grid');
    grids.forEach(grid => {
        grid.classList.toggle('list-view', viewMode === 'list');
    });
}

function renderCurrentView() {
    switch (currentView) {
        case 'overview':
            renderOverview();
            break;
        case 'companies':
            renderCompanies();
            break;
        case 'people':
            renderPeople();
            break;
        case 'properties':
            renderProperties();
            break;
        case 'analytics':
            renderAnalytics();
            break;
    }
}

function renderOverview() {
    renderTopCompanies();
    renderGeographicChart();
    renderIndustryChart();
    renderRecentActivity();
}

function renderTopCompanies() {
    const container = document.getElementById('top-companies-list');
    const topCompanies = filteredData.companies
        .sort((a, b) => (b.estimated_num_employees || 0) - (a.estimated_num_employees || 0))
        .slice(0, 5);
    
    container.innerHTML = topCompanies.map(company => `
        <div class="overview-item" onclick="showCompanyDetails('${company.id || company.name}')">
            <div class="overview-item-info">
                <strong>${company.name}</strong>
                <span>${company.city || company.state || 'Unknown Location'}</span>
            </div>
            <div class="overview-item-stat">
                ${company.estimated_num_employees || 'N/A'} employees
            </div>
        </div>
    `).join('');
}

function renderGeographicChart() {
    const ctx = document.getElementById('geographic-chart');
    if (!ctx) return;
    
    // Clear previous chart
    if (window.geographicChart) {
        window.geographicChart.destroy();
    }
    
    // Count by location
    const locationCounts = {};
    [...filteredData.companies, ...filteredData.people].forEach(item => {
        const location = item.city || item.state || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    const labels = Object.keys(locationCounts).slice(0, 10);
    const data = labels.map(label => locationCounts[label]);
    
    window.geographicChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#764ba2', '#48bb78', '#ed8936', '#9f7aea',
                    '#38b2ac', '#f56565', '#4299e1', '#ed64a6', '#68d391'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderIndustryChart() {
    const ctx = document.getElementById('industry-chart');
    if (!ctx) return;
    
    // Clear previous chart
    if (window.industryChart) {
        window.industryChart.destroy();
    }
    
    // Count by industry
    const industryCounts = {};
    filteredData.companies.forEach(company => {
        const industry = company.industry || company.specialization || 'Unknown';
        industryCounts[industry] = (industryCounts[industry] || 0) + 1;
    });
    
    const labels = Object.keys(industryCounts).slice(0, 8);
    const data = labels.map(label => industryCounts[label]);
    
    window.industryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Companies',
                data: data,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    const recentItems = [
        ...filteredData.people.slice(0, 3).map(person => ({
            type: 'person',
            name: person.name || `${person.first_name} ${person.last_name}`,
            action: 'Added to database',
            time: 'Recently'
        })),
        ...filteredData.companies.slice(0, 2).map(company => ({
            type: 'company',
            name: company.name,
            action: 'Company profile updated',
            time: 'Recently'
        }))
    ];
    
    container.innerHTML = recentItems.map(item => `
        <div class="overview-item">
            <div class="overview-item-info">
                <strong>${item.name}</strong>
                <span>${item.action}</span>
            </div>
            <div class="overview-item-time">
                ${item.time}
            </div>
        </div>
    `).join('');
}

function renderCompanies() {
    const container = document.getElementById('companies-grid');
    container.innerHTML = filteredData.companies.map(company => createCompanyCard(company)).join('');
}

function renderPeople() {
    const container = document.getElementById('people-grid');
    container.innerHTML = filteredData.people.map(person => createPersonCard(person)).join('');
}

function renderProperties() {
    const container = document.getElementById('properties-grid');
    container.innerHTML = filteredData.properties.map(property => createPropertyCard(property)).join('');
}

function createCompanyCard(company) {
    const logo = company.logo_url || '';
    const initials = company.name ? company.name.split(' ').map(word => word[0]).join('').substring(0, 2) : 'CO';
    
    return `
        <div class="profile-card company-card" onclick="showCompanyDetails('${company.id || company.name}')">
            <div class="card-header">
                <div class="card-avatar">
                    ${logo ? `<img src="${logo}" alt="${company.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                    <span style="${logo ? 'display:none' : ''}">${initials}</span>
                </div>
                <div class="card-info">
                    <h3>${company.name}</h3>
                    <div class="subtitle">${company.industry || company.specialization || 'Company'}</div>
                    <div class="card-tags">
                        ${company.city ? `<span class="tag">${company.city}</span>` : ''}
                        ${company.state ? `<span class="tag">${company.state}</span>` : ''}
                        ${company.source ? `<span class="tag primary">${company.source}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="card-details">
                ${company.estimated_num_employees ? `
                    <div class="detail-item">
                        <span class="detail-label">Employees</span>
                        <span class="detail-value">${company.estimated_num_employees}</span>
                    </div>
                ` : ''}
                ${company.founded_year ? `
                    <div class="detail-item">
                        <span class="detail-label">Founded</span>
                        <span class="detail-value">${company.founded_year}</span>
                    </div>
                ` : ''}
                ${company.employees ? `
                    <div class="detail-item">
                        <span class="detail-label">Contacts</span>
                        <span class="detail-value">${company.employees.length}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="contact-info">
                ${company.website_url || company.website ? `
                    <div class="contact-item">
                        <i class="fas fa-globe"></i>
                        <a href="${company.website_url || company.website}" target="_blank">Website</a>
                    </div>
                ` : ''}
                ${company.phone || company.primary_phone?.number ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${company.phone || company.primary_phone.number}</span>
                    </div>
                ` : ''}
                ${company.linkedin_url ? `
                    <div class="contact-item">
                        <i class="fab fa-linkedin"></i>
                        <a href="${company.linkedin_url}" target="_blank">LinkedIn</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function createPersonCard(person) {
    const photo = person.photo_url || '';
    const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
    const initials = name ? name.split(' ').map(word => word[0]).join('').substring(0, 2) : 'PE';
    
    return `
        <div class="profile-card person-card" onclick="showPersonDetails('${person.id || person.email}')">
            <div class="card-header">
                <div class="card-avatar">
                    ${photo ? `<img src="${photo}" alt="${name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                    <span style="${photo ? 'display:none' : ''}">${initials}</span>
                </div>
                <div class="card-info">
                    <h3>${name}</h3>
                    <div class="subtitle">${person.title || person.headline || 'Professional'}</div>
                    <div class="card-tags">
                        ${person.city ? `<span class="tag">${person.city}</span>` : ''}
                        ${person.state ? `<span class="tag">${person.state}</span>` : ''}
                        ${person.source ? `<span class="tag primary">${person.source}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="card-details">
                ${person.organization_name || person.company ? `
                    <div class="detail-item">
                        <span class="detail-label">Company</span>
                        <span class="detail-value">${person.organization_name || person.company}</span>
                    </div>
                ` : ''}
                ${person.seniority ? `
                    <div class="detail-item">
                        <span class="detail-label">Seniority</span>
                        <span class="detail-value">${person.seniority}</span>
                    </div>
                ` : ''}
                ${person.employment_history ? `
                    <div class="detail-item">
                        <span class="detail-label">Experience</span>
                        <span class="detail-value">${person.employment_history.length} roles</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="contact-info">
                ${person.email ? `
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <a href="mailto:${person.email}">${person.email}</a>
                    </div>
                ` : ''}
                ${person.sanitized_phone ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${person.sanitized_phone}</span>
                    </div>
                ` : ''}
                ${person.linkedin_url ? `
                    <div class="contact-item">
                        <i class="fab fa-linkedin"></i>
                        <a href="${person.linkedin_url}" target="_blank">LinkedIn</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function createPropertyCard(property) {
    return `
        <div class="profile-card property-card" onclick="showPropertyDetails('${property.name}')">
            <div class="card-header">
                <div class="card-avatar">
                    <i class="fas fa-building"></i>
                </div>
                <div class="card-info">
                    <h3>${property.name}</h3>
                    <div class="subtitle">${property.type}</div>
                    <div class="card-tags">
                        ${property.city ? `<span class="tag">${property.city}</span>` : ''}
                        ${property.source ? `<span class="tag primary">${property.source}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="card-details">
                ${property.size ? `
                    <div class="detail-item">
                        <span class="detail-label">Size</span>
                        <span class="detail-value">${property.size}</span>
                    </div>
                ` : ''}
                ${property.developer ? `
                    <div class="detail-item">
                        <span class="detail-label">Developer</span>
                        <span class="detail-value">${property.developer}</span>
                    </div>
                ` : ''}
                ${property.address ? `
                    <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${property.address}</span>
                    </div>
                ` : ''}
            </div>
            
            ${property.description ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 0.875rem; color: #718096; line-height: 1.4;">
                        ${property.description.substring(0, 150)}${property.description.length > 150 ? '...' : ''}
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

// Detail modal functions
function showCompanyDetails(companyId) {
    const company = allData.companies.find(c => c.id === companyId || c.name === companyId);
    if (!company) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${company.name}</h2>
        <p><strong>Industry:</strong> ${company.industry || company.specialization || 'N/A'}</p>
        <p><strong>Location:</strong> ${company.city || 'N/A'}, ${company.state || 'N/A'}</p>
        <p><strong>Employees:</strong> ${company.estimated_num_employees || 'N/A'}</p>
        <p><strong>Founded:</strong> ${company.founded_year || 'N/A'}</p>
        
        ${company.services ? `
            <h3>Services</h3>
            <ul>
                ${company.services.map(service => `<li>${service}</li>`).join('')}
            </ul>
        ` : ''}
        
        ${company.portfolio ? `
            <h3>Portfolio</h3>
            <ul>
                ${company.portfolio.map(item => `<li>${item}</li>`).join('')}
            </ul>
        ` : ''}
        
        ${company.keywords ? `
            <h3>Keywords</h3>
            <div class="card-tags">
                ${company.keywords.slice(0, 20).map(keyword => `<span class="tag">${keyword}</span>`).join('')}
            </div>
        ` : ''}
        
        ${company.employees ? `
            <h3>Employees (${company.employees.length})</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                ${company.employees.map(emp => `
                    <div class="employment-item">
                        <h4>${emp.name || `${emp.first_name} ${emp.last_name}`}</h4>
                        <div class="company">${emp.title || emp.headline}</div>
                        <div class="duration">${emp.email || ''}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

function showPersonDetails(personId) {
    const person = allData.people.find(p => p.id === personId || p.email === personId);
    if (!person) return;
    
    const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            ${person.photo_url ? `<img src="${person.photo_url}" alt="${name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">` : ''}
            <div>
                <h2>${name}</h2>
                <p><strong>${person.title || person.headline || 'Professional'}</strong></p>
                <p>${person.organization_name || person.company || 'N/A'}</p>
            </div>
        </div>
        
        <p><strong>Location:</strong> ${person.city || 'N/A'}, ${person.state || 'N/A'}</p>
        <p><strong>Email:</strong> ${person.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${person.sanitized_phone || 'N/A'}</p>
        
        ${person.employment_history && person.employment_history.length > 0 ? `
            <h3>Employment History</h3>
            <div class="employment-history">
                ${person.employment_history.map(job => `
                    <div class="employment-item">
                        <h4>${job.title}</h4>
                        <div class="company">${job.organization_name}</div>
                        <div class="duration">
                            ${job.start_date || 'Unknown'} - ${job.current ? 'Present' : (job.end_date || 'Unknown')}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${person.departments && person.departments.length > 0 ? `
            <h3>Departments</h3>
            <div class="card-tags">
                ${person.departments.map(dept => `<span class="tag">${dept}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

function showPropertyDetails(propertyName) {
    const property = allData.properties.find(p => p.name === propertyName);
    if (!property) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${property.name}</h2>
        <p><strong>Type:</strong> ${property.type}</p>
        <p><strong>Location:</strong> ${property.address}</p>
        <p><strong>Size:</strong> ${property.size || 'N/A'}</p>
        <p><strong>Developer:</strong> ${property.developer || 'N/A'}</p>
        
        ${property.description ? `
            <h3>Description</h3>
            <p>${property.description}</p>
        ` : ''}
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// Search and filter functions
function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    applyFilters();
}

function handleFilter() {
    applyFilters();
}

function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const locationFilter = document.getElementById('location-filter').value;
    const industryFilter = document.getElementById('industry-filter').value;
    
    // Filter companies
    filteredData.companies = allData.companies.filter(company => {
        const matchesSearch = !searchQuery || 
            company.name.toLowerCase().includes(searchQuery) ||
            (company.industry && company.industry.toLowerCase().includes(searchQuery)) ||
            (company.specialization && company.specialization.toLowerCase().includes(searchQuery));
        
        const matchesLocation = !locationFilter ||
            (company.city && company.city.includes(locationFilter)) ||
            (company.state && company.state.includes(locationFilter));
        
        const matchesIndustry = !industryFilter ||
            (company.industry && company.industry.includes(industryFilter)) ||
            (company.specialization && company.specialization.includes(industryFilter));
        
        return matchesSearch && matchesLocation && matchesIndustry;
    });
    
    // Filter people
    filteredData.people = allData.people.filter(person => {
        const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const matchesSearch = !searchQuery ||
            name.toLowerCase().includes(searchQuery) ||
            (person.title && person.title.toLowerCase().includes(searchQuery)) ||
            (person.organization_name && person.organization_name.toLowerCase().includes(searchQuery));
        
        const matchesLocation = !locationFilter ||
            (person.city && person.city.includes(locationFilter)) ||
            (person.state && person.state.includes(locationFilter));
        
        const matchesIndustry = !industryFilter ||
            (person.industry && person.industry.includes(industryFilter));
        
        return matchesSearch && matchesLocation && matchesIndustry;
    });
    
    // Filter properties
    filteredData.properties = allData.properties.filter(property => {
        const matchesSearch = !searchQuery ||
            property.name.toLowerCase().includes(searchQuery) ||
            (property.type && property.type.toLowerCase().includes(searchQuery)) ||
            (property.developer && property.developer.toLowerCase().includes(searchQuery));
        
        const matchesLocation = !locationFilter ||
            (property.city && property.city.includes(locationFilter)) ||
            (property.address && property.address.includes(locationFilter));
        
        return matchesSearch && matchesLocation;
    });
    
    renderCurrentView();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('location-filter').value = '';
    document.getElementById('industry-filter').value = '';
    
    filteredData = {
        companies: [...allData.companies],
        people: [...allData.people],
        properties: [...allData.properties]
    };
    
    renderCurrentView();
}

function renderAnalytics() {
    renderCompanySizeChart();
    renderEmploymentTrendsChart();
    renderContactCoverageChart();
    renderDataQualityMetrics();
}

function renderCompanySizeChart() {
    const ctx = document.getElementById('company-size-chart');
    if (!ctx) return;
    
    if (window.companySizeChart) {
        window.companySizeChart.destroy();
    }
    
    const sizeRanges = {
        'Small (1-50)': 0,
        'Medium (51-200)': 0,
        'Large (201-1000)': 0,
        'Enterprise (1000+)': 0,
        'Unknown': 0
    };
    
    filteredData.companies.forEach(company => {
        const size = company.estimated_num_employees;
        if (!size) {
            sizeRanges['Unknown']++;
        } else if (size <= 50) {
            sizeRanges['Small (1-50)']++;
        } else if (size <= 200) {
            sizeRanges['Medium (51-200)']++;
        } else if (size <= 1000) {
            sizeRanges['Large (201-1000)']++;
        } else {
            sizeRanges['Enterprise (1000+)']++;
        }
    });
    
    window.companySizeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(sizeRanges),
            datasets: [{
                data: Object.values(sizeRanges),
                backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#9f7aea', '#718096']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderEmploymentTrendsChart() {
    const ctx = document.getElementById('employment-trends-chart');
    if (!ctx) return;
    
    if (window.employmentTrendsChart) {
        window.employmentTrendsChart.destroy();
    }
    
    // Count employment by year (simplified)
    const yearCounts = {};
    filteredData.people.forEach(person => {
        if (person.employment_history) {
            person.employment_history.forEach(job => {
                if (job.start_date) {
                    const year = new Date(job.start_date).getFullYear();
                    if (year > 2000 && year <= new Date().getFullYear()) {
                        yearCounts[year] = (yearCounts[year] || 0) + 1;
                    }
                }
            });
        }
    });
    
    const years = Object.keys(yearCounts).sort();
    const counts = years.map(year => yearCounts[year]);
    
    window.employmentTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'New Positions',
                data: counts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderContactCoverageChart() {
    const ctx = document.getElementById('contact-coverage-chart');
    if (!ctx) return;
    
    if (window.contactCoverageChart) {
        window.contactCoverageChart.destroy();
    }
    
    const coverage = {
        'Email': filteredData.people.filter(p => p.email).length,
        'Phone': filteredData.people.filter(p => p.sanitized_phone).length,
        'LinkedIn': filteredData.people.filter(p => p.linkedin_url).length,
        'Photo': filteredData.people.filter(p => p.photo_url).length
    };
    
    window.contactCoverageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(coverage),
            datasets: [{
                label: 'Coverage',
                data: Object.values(coverage),
                backgroundColor: ['#667eea', '#48bb78', '#ed8936', '#9f7aea']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderDataQualityMetrics() {
    const container = document.getElementById('data-quality-metrics');
    
    const totalPeople = filteredData.people.length;
    const totalCompanies = filteredData.companies.length;
    
    const emailCoverage = Math.round((filteredData.people.filter(p => p.email).length / totalPeople) * 100);
    const phoneCoverage = Math.round((filteredData.people.filter(p => p.sanitized_phone).length / totalPeople) * 100);
    const companyCoverage = Math.round((filteredData.people.filter(p => p.organization_name).length / totalPeople) * 100);
    const locationCoverage = Math.round((filteredData.people.filter(p => p.city).length / totalPeople) * 100);
    
    container.innerHTML = `
        <div class="metric-item">
            <div class="metric-value">${emailCoverage}%</div>
            <div class="metric-label">Email Coverage</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${phoneCoverage}%</div>
            <div class="metric-label">Phone Coverage</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${companyCoverage}%</div>
            <div class="metric-label">Company Info</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${locationCoverage}%</div>
            <div class="metric-label">Location Data</div>
        </div>
    `;
}

// Add some CSS for overview items
const additionalCSS = `
.overview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.overview-item:hover {
    background: #edf2f7;
}

.overview-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.overview-item-info strong {
    color: #2d3748;
    font-weight: 600;
}

.overview-item-info span {
    color: #718096;
    font-size: 0.875rem;
}

.overview-item-stat,
.overview-item-time {
    color: #667eea;
    font-weight: 500;
    font-size: 0.875rem;
}

.error-message {
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add the additional CSS to the page
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style); 