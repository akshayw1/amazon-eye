# Amazon Eye Chrome Extension

A Chrome extension that adds a comprehensive trust score and product verification sidebar to Amazon product pages, designed with Amazon's visual theme.

## Features

- **Amazon Eye Button**: Positioned in the bottom-right corner with Amazon branding
- **Full-Height Sidebar**: Slides in from the right with complete product analysis
- **Voice Assistant Integration**: "Ask Amazon Eye" with microphone interface
- **Trust Score Display**: Large, prominent trust score with color-coded indicators
- **Comprehensive Metrics**: Verified reviews, spec changes, seller risk flags
- **Product Verification**: Detailed verification status with visual indicators
- **Barcode Scanner**: Quick product lookup functionality
- **Watchlist Integration**: View saved products and their trust scores
- **Multi-language Support**: Language selector with flag indicators
- **Notification System**: Alerts for trust score changes

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing these files
5. The extension should now be active when you visit Amazon pages

## Usage

1. Visit any Amazon product page
2. Click the "Amazon Eye" button in the bottom-right corner
3. Explore the comprehensive sidebar with:
   - Voice assistant for product questions
   - Quick action buttons for common queries
   - Language selection options
   - Detailed trust score analysis
   - Product verification status
   - Barcode scanning capability
   - Your product watchlist
4. Click the X button or the Amazon Eye button again to close the sidebar

## Current Implementation

This version uses mock data for demonstration purposes. The trust score and verification details are hardcoded in the `content.js` file. 