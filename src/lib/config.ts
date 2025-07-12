// lib/config.ts
import type { Theme, Translations } from './types';

export const defaultTranslations: Translations = {
    // Company
    "company_name": "Bridge Ltd",
    "company_slogan": "Connecting brands to their audience through stellar customized products.",
    "company_copyright": "© {year} Bridge Ltd. All rights reserved.",

    // Header Navigation
    "header_nav_products": "Products",
    "header_nav_about": "About",
    "header_nav_contact": "Contact",

    // Footer Navigation
    "footer_nav_settings": "Settings",

    // Buttons
    "button_get_quote": "Get a Quote",
    "button_explore_products": "Explore Products",
    "button_request_quote": "Request a Quote",
    "button_show_more": "Show More Products",
    "button_contact_us": "Contact Us",
    "button_send_message": "Send Message",
    
    // Home Page
    "home_hero_title": "Customize Your Universe",
    "home_hero_subtitle": "Bridge Ltd offers premium, customizable products to help your brand shine. From tech gadgets to elegant gift solutions, we bring your vision to life.",
    "home_intro_title": "Quality That Speaks Volumes",
    "home_intro_subtitle": "We believe in the power of a lasting impression. That's why we source only the highest-quality materials for our products, ensuring your brand is represented with the excellence it deserves.",
    "home_products_title": "Our Top Products",
    "home_cta_title": "Ready to Create Something Amazing?",
    "home_cta_subtitle": "Let's collaborate on your next project. Our team is ready to help you design the perfect custom products.",

    // Products Page
    "products_hero_title": "Our Products",
    "products_hero_subtitle": "Find the perfect customizable products for your budget. No hidden fees, just stellar value.",
    "products_search_placeholder": "Search for products...",
    "products_not_found_title": "No Products Found",
    "products_not_found_subtitle": "Your search for \"{searchTerm}\" did not match any products.\nTry a different keyword or browse all products.",
    "products_button_clear_search": "Clear Search",
    "products_custom_order_title": "Need a Custom Order?",
    "products_custom_order_subtitle": "For bulk orders, unique requirements, or product combinations, contact us for a personalized quote. Our team is ready to build the perfect package for you.",
    "products_button_contact_sales": "Contact Sales",

    // About Page
    "about_hero_title": "About Bridge Ltd",
    "about_mission_title": "Our Mission",
    "about_mission_desc": "To provide businesses and individuals with exceptional, high-quality customizable products that create lasting impressions and elevate brand identity.",
    "about_vision_title": "Our Vision",
    "about_vision_desc": "To be the galaxy's leading partner in promotional and personalized products, known for our innovation, customer-centric approach, and stellar quality.",
    "about_values_title": "Our Values",
    "about_values_desc": "We are committed to quality, creativity, and customer satisfaction. We operate with integrity and a passion for helping our clients succeed.",
    "about_history_title": "Our Cosmic Journey",
    "about_history_p1": "Founded in a small workshop with a big dream, Bridge Ltd began its journey with a simple mission: to bridge the gap between brands and their customers through tangible, high-quality products. We saw a universe of possibilities in items that people use every day.",
    "about_history_p2": "Over the years, we've expanded our horizons, moving from simple pens to a diverse constellation of products including high-tech USB drives and elegant gift boxes. Our commitment to quality and customer service has been our North Star, guiding us through our growth and evolution.",
    "about_history_p3": "Today, we are proud to serve clients across the globe, helping them launch their brands into new orbits of recognition and success.",

    // Contact Page
    "contact_hero_title": "Get In Touch",
    "contact_hero_subtitle": "Have a question or a project in mind? We'd love to hear from you.",
    "contact_info_title": "Contact Information",
    "contact_info_subtitle": "Reach out to us directly through any of the channels below. We're ready to assist you.",
    "contact_info_email": "Email",
    "contact_info_phone": "Phone",
    "contact_info_office": "Office",
    "contact_form_title": "Send us a Message",
    "contact_form_subtitle": "Fill out the form and we'll get back to you shortly.",
    "contact_form_name_label": "Name",
    "contact_form_name_placeholder": "Your Name",
    "contact_form_email_label": "Email",
    "contact_form_email_placeholder": "your.email@example.com",
    "contact_form_product_label": "Product of Interest",
    "contact_form_product_placeholder": "Select a product",
    "contact_form_message_label": "Message",
    "contact_form_message_placeholder": "How can we help you today?",

    // Chatbot
    "chatbot_title": "AI Assistant",
    "chatbot_greeting": "Ask me anything about our products!",
    "chatbot_input_placeholder": "Type your message...",
    "chatbot_error": "Sorry, I'm having trouble connecting. Please try again later.",
};

export const defaultTheme: Theme = {
    colors: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 8%',
        cardForeground: '0 0% 98%',
        popover: '240 10% 4%',
        popoverForeground: '0 0% 98%',
        primary: '217 91% 60%',
        primaryForeground: '0 0% 100%',
        secondary: '339 82% 76%',
        secondaryForeground: '274 79% 11%',
        muted: '240 5% 25%',
        mutedForeground: '240 5% 65%',
        accent: '330 90% 65%',
        accentForeground: '0 0% 10%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        border: '240 5% 15%',
        input: '240 5% 15%',
        ring: '217 91% 60%',
        'chart-1': '12 76% 61%',
        'chart-2': '173 58% 39%',
        'chart-3': '197 37% 24%',
        'chart-4': '43 74% 66%',
        'chart-5': '27 87% 67%',
    },
    threeScene: {
        planetColor: '#4a90e2',
        moonColor: '#cccccc',
        galaxyInsideColor: '#ff6030',
        galaxyOutsideColor: '#1b3984',
        nebulaColor1: '#6a0dad',
        nebulaColor2: '#dc143c',
    }
};
