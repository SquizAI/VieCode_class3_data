# VibeCode Data Dashboard

A modern, responsive data dashboard for visualizing company, people, and property information from multiple data sources including Apollo.io scraped data and commercial real estate data.

## Features

### 📊 **Overview Dashboard**
- Real-time statistics showing total companies, people, and properties
- Geographic distribution charts
- Industry breakdown visualization
- Recent activity feed
- Top companies by employee count

### 🏢 **Company Profiles**
- Comprehensive company cards with logos, contact information, and key metrics
- Detailed company information including:
  - Industry and specialization
  - Employee count and founding year
  - Services and portfolio
  - Contact details (website, phone, LinkedIn)
  - Employee listings
  - Keywords and tags

### 👥 **People Profiles**
- Professional profile cards with photos and contact information
- Detailed person information including:
  - Current title and company
  - Employment history
  - Contact details (email, phone, LinkedIn)
  - Location and seniority level
  - Department information

### 🏗️ **Property Listings**
- Property cards with key details
- Information includes:
  - Property type and size
  - Developer and location
  - Detailed descriptions
  - Address information

### 🔍 **Search & Filtering**
- Real-time search across all data types
- Location-based filtering
- Industry-based filtering
- Clear filters functionality

### 📈 **Analytics**
- Company size distribution charts
- Employment trends over time
- Contact information coverage metrics
- Data quality indicators

### 🎨 **Modern UI/UX**
- Responsive design that works on all devices
- Beautiful gradient backgrounds and glassmorphism effects
- Smooth animations and transitions
- Grid and list view options
- Interactive modal dialogs for detailed views

## Data Sources

The dashboard integrates data from multiple sources:

1. **Commercial Real Estate Data** (`commercial_real_estate_data.json`)
   - Boston and Denver real estate companies
   - Property listings and details
   - Company contacts and information

2. **Golf Dataset** (`golf_dataset_apollo-io-scraper_2025-05-10_09-16-27-978.json`)
   - Apollo.io scraped data from golf industry
   - Professional profiles and employment history
   - Company information and employee data

3. **Boston/Denver Dataset** (`boston_denver_dataset_apollo-io-scraper_2025-05-10_09-07-45-683.json`)
   - Additional Apollo.io scraped data
   - Extended professional network information

## File Structure

```
VibeCode_class3_data/
├── index.html          # Main dashboard HTML
├── styles.css          # Comprehensive styling
├── script.js           # Dashboard functionality and data processing
├── README.md           # This file
└── data/
    ├── commercial_real_estate_data.json
    ├── golf_dataset_apollo-io-scraper_2025-05-10_09-16-27-978.json
    ├── golf_dataset_apollo-io-scraper_2025-05-10_09-16-27-978.csv
    ├── boston_denver_dataset_apollo-io-scraper_2025-05-10_09-07-45-683.json
    └── boston_denver_dataset_apollo-io-scraper_2025-05-10_09-07-45-683.csv
```

## How to Use

### 1. **Setup**
- Ensure all data files are in the `data/` directory
- Open `index.html` in a modern web browser
- The dashboard will automatically load and process all available data

### 2. **Navigation**
- Use the top navigation bar to switch between sections:
  - **Overview**: Dashboard summary and charts
  - **Companies**: Browse company profiles
  - **People**: Browse professional profiles
  - **Properties**: Browse property listings
  - **Analytics**: View data insights and metrics

### 3. **Search and Filter**
- Use the search bar to find specific companies, people, or properties
- Apply location filters to focus on specific geographic areas
- Use industry filters to narrow down by business sector
- Click "Clear Filters" to reset all filters

### 4. **View Options**
- Toggle between Grid and List views for better data presentation
- Click on any profile card to view detailed information in a modal
- Use the responsive design on mobile devices for on-the-go access

### 5. **Interactive Features**
- Click on company names in the overview to view detailed profiles
- Hover over charts for additional information
- Use contact links to directly email or visit LinkedIn profiles
- Navigate employment history and company relationships

## Technical Details

### **Technologies Used**
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, and animations
- **JavaScript (ES6+)**: Dynamic functionality and data processing
- **Chart.js**: Interactive charts and visualizations
- **Font Awesome**: Professional icons
- **Google Fonts**: Typography (Inter font family)

### **Key Features**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Processing**: Automatic deduplication and data cleaning
- **Error Handling**: Graceful handling of missing or corrupted data
- **Performance**: Efficient rendering of large datasets
- **Accessibility**: Semantic HTML and keyboard navigation support

### **Browser Compatibility**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Data Processing

The dashboard automatically:
- Loads data from multiple JSON sources
- Removes duplicate entries based on key fields
- Processes and normalizes data structures
- Creates relationships between companies and employees
- Generates analytics and metrics

## Customization

### **Adding New Data Sources**
1. Add your JSON file to the `data/` directory
2. Create a new loading function in `script.js`
3. Add the function to the `loadAllData()` promise chain
4. Update the data processing logic as needed

### **Styling Modifications**
- Modify `styles.css` for visual changes
- Update CSS custom properties for color schemes
- Adjust responsive breakpoints as needed

### **Feature Extensions**
- Add new chart types in the analytics section
- Create additional filter options
- Implement data export functionality
- Add user preferences and settings

## Performance Considerations

- Large datasets (>10MB) may take longer to load
- The Boston/Denver dataset is handled gracefully if too large
- Charts are destroyed and recreated to prevent memory leaks
- Efficient filtering algorithms for real-time search

## Troubleshooting

### **Common Issues**
1. **Data not loading**: Check browser console for network errors
2. **Charts not displaying**: Ensure Chart.js CDN is accessible
3. **Styling issues**: Verify Font Awesome and Google Fonts are loading
4. **Mobile responsiveness**: Test on actual devices, not just browser dev tools

### **Error Messages**
- The dashboard displays user-friendly error messages for data loading issues
- Check the browser console for detailed technical error information
- Ensure all data files are properly formatted JSON

## Future Enhancements

- **Data Export**: CSV/Excel export functionality
- **Advanced Analytics**: More sophisticated data insights
- **User Accounts**: Save preferences and custom views
- **Real-time Updates**: Live data synchronization
- **Integration APIs**: Connect with CRM systems
- **Advanced Search**: Full-text search with highlighting
- **Data Visualization**: Additional chart types and interactive maps

---

**Created for VibeCode Class 3 Data Visualization Project**

This dashboard provides a comprehensive view of your business data with modern web technologies and intuitive user experience design. 