const fs = require('fs');

// This will be a VERY large translation structure
const enTranslations = {
  "steps": {
    "1": {
      "title": "Personal Information",
      "fullName": "Full Name",
      "businessName": "Business Name",
      "email": "Email",
      "phone": "Phone Number",
      "country": "Country",
      "preferredLanguage": "Preferred Language",
      "selectLanguage": "Select your preferred language"
    },
    "2": {
      "title": "Select Services",
      "subtitle": "Choose all services you're interested in"
    }
  },
  "services": {
    "website-development": "Website Development",
    "branding": "Logo Design & Branding",
    "seo": "SEO Services",
    "google-business": "Google Business Optimization",
    "social-setup": "Social Media Setup",
    "social-management": "Social Media Management",
    "ads": "Facebook & Instagram Ads",
    "email": "Business Email Setup",
    "lead-forms": "Lead Generation Forms",
    "maintenance": "Website Maintenance",
    "landing-pages": "Landing Pages"
  },
  "questionnaire": {
    "subtitle": "Please answer the following questions",
    "common": {
      "yes": "Yes",
      "no": "No",
      "uploadButton": "Click to upload files"
    },
    "website-development": {
      "businessInfo": {
        "title": "Business Information",
        "businessName": "Business Name",
        "contactPerson": "Contact Person",
        "email": "Email",
        "phone": "Phone Number"
      },
      "business": {
        "title": "Business",
        "describe": "Describe your business",
        "products": "What products or services do you offer?",
        "goal": "What is the primary goal of the website?",
        "goals": {
          "lead-generation": "Lead Generation",
          "information": "Information",
          "bookings": "Bookings",
          "online-store": "Online Store",
          "portfolio": "Portfolio",
          "other": "Other"
        }
      },
      "structure": {
        "title": "Website Structure",
        "pages": "Which pages do you want?",
        "pageOptions": {
          "home": "Home",
          "about": "About Us",
          "services": "Services",
          "products": "Products",
          "gallery": "Gallery",
          "blog": "Blog",
          "contact": "Contact",
          "faq": "FAQ",
          "other": "Other"
        }
      },
      "design": {
        "title": "Design",
        "inspiration": "Do you have a website you like as inspiration?",
        "style": "Describe the style you want"
      },
      "files": {
        "title": "Files",
        "logo": "Upload your logo (if available)",
        "photos": "Upload business photos (if available)"
      }
    },
    "branding": {
      "businessName": "Business Name",
      "industry": "Industry",
      "describe": "Describe your business",
      "logoLook": "How would you like the logo to look?",
      "colors": "Preferred colours",
      "references": "Do you have logo references or examples you like?",
      "referencesPlaceholder": "Paste URLs or describe logos you like..."
    },
    "seo": {
      "websiteUrl": "Website URL",
      "mainServices": "Main services",
      "cities": "Cities where you operate",
      "keywords": "Which keywords do you want to rank for?",
      "keywordsPlaceholder": "e.g., web design Kosovo, digital marketing Pristina..."
    },
    "google-business": {
      "exists": "Does the Google Business Profile already exist?",
      "businessName": "Business Name",
      "address": "Address",
      "phone": "Phone Number",
      "hours": "Business Hours",
      "hoursPlaceholder": "e.g., Mon-Fri: 9:00-17:00, Sat: 9:00-14:00",
      "category": "Business Category",
      "categoryPlaceholder": "e.g., Restaurant, Dentist, Hotel"
    },
    "social-setup": {
      "platforms": "Which platforms do you want?",
      "platformOptions": {
        "facebook": "Facebook",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "linkedin": "LinkedIn",
        "youtube": "YouTube"
      },
      "describe": "Describe your business",
      "logo": "Upload your logo"
    },
    "social-management": {
      "objective": "Main objective",
      "objectives": {
        "brand-awareness": "Brand Awareness",
        "lead-generation": "Lead Generation",
        "sales": "Sales",
        "follower-growth": "Follower Growth"
      },
      "platforms": "Which platforms should be managed?",
      "platformOptions": {
        "facebook": "Facebook",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "linkedin": "LinkedIn",
        "youtube": "YouTube"
      },
      "postsPerMonth": "How many posts per month?",
      "postsPlaceholder": "e.g., 20 posts",
      "logo": "Upload your logo",
      "media": "Upload photos or videos"
    },
    "ads": {
      "objective": "Campaign objective",
      "objectives": {
        "lead-generation": "Lead Generation",
        "traffic": "Traffic",
        "sales": "Sales",
        "messages": "Messages"
      },
      "budget": "Monthly advertising budget (€)",
      "targetArea": "Target city or area",
      "targetPlaceholder": "e.g., Pristina, Kosovo",
      "advertised": "What will be advertised?",
      "media": "Upload advertising photos or videos"
    },
    "email": {
      "domain": "Business Domain",
      "howMany": "How many email addresses do you need?",
      "names": "Write the email names you want",
      "namesPlaceholder": "e.g., info, contact, support, john, etc."
    },
    "lead-forms": {
      "purpose": "What is the purpose of the form?",
      "fields": "Which information should customers provide?",
      "fieldOptions": {
        "name": "Name",
        "email": "Email",
        "phone": "Phone",
        "company": "Company",
        "message": "Message",
        "other": "Other"
      },
      "emailDestination": "Which email address should receive submissions?"
    },
    "maintenance": {
      "websiteUrl": "Website URL",
      "problem": "What problem does the website currently have?",
      "tasks": "What would you like us to do?",
      "taskOptions": {
        "updates": "Updates",
        "backups": "Backups",
        "content": "Content Changes",
        "security": "Security",
        "optimization": "Optimization",
        "other": "Other"
      }
    },
    "landing-pages": {
      "product": "What product or service will be promoted?",
      "goal": "What is the main goal of the landing page?",
      "goals": {
        "lead-generation": "Lead Generation",
        "sales": "Sales",
        "bookings": "Bookings",
        "event": "Event"
      },
      "offer": "Describe the offer",
      "action": "What action should the visitor take?",
      "actions": {
        "submit-form": "Submit Form",
        "call": "Call",
        "send-message": "Send Message",
        "purchase": "Purchase Product"
      },
      "media": "Upload photos or videos"
    }
  },
  "validation": {
    "required": "This field is required",
    "emailInvalid": "Please enter a valid email address",
    "phoneInvalid": "Please enter a valid phone number",
    "selectService": "Please select at least one service"
  },
  "step": "Step",
  "of": "of",
  "back": "Back",
  "next": "Next",
  "submit": "Submit Project",
  "submitting": "Submitting...",
  "error": "Something went wrong. Please try again.",
  "success": {
    "title": "Thank You!",
    "message": "Your project inquiry has been submitted successfully. We'll contact you within 24 hours."
  }
};

// Read the en.json file
const filePath = './messages/en.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Replace the contact.form section with the new translations
data.contact.form = enTranslations;

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log('English translations updated successfully!');
