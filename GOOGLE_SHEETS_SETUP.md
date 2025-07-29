# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for your Food Diary app.

## Prerequisites

1. Google account
2. Access to Google Cloud Console
3. Basic understanding of environment variables

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Google Sheets API
   - Google Drive API

## Step 3: Create Service Account Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `food-diary-sheets`
   - Description: `Service account for Food Diary Google Sheets integration`
4. Click "Create and Continue"
5. Skip granting roles for now (click "Continue")
6. Click "Done"

## Step 4: Generate and Download Key File

1. In the Credentials page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Choose "JSON" format
6. Download the key file and keep it secure

## Step 5: Configure Environment Variables

Open your `.env.local` file and update the following variables:

```env
# Your Google Spreadsheet ID (from the URL)
NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Service Account Credentials (from the downloaded JSON file)
GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
```

### Getting the Spreadsheet ID

1. Create a new Google Sheets document
2. Copy the URL (it looks like: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`)
3. The spreadsheet ID is the long string between `/d/` and `/edit` (e.g., `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`)

### Getting Service Account Credentials

From your downloaded JSON key file, copy:

- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (keep the quotes and newlines)

## Step 6: Share Your Google Sheet

1. Open your Google Sheets document
2. Click the "Share" button
3. Add your service account email (from the JSON file) as an editor
4. OR make the sheet publicly editable (less secure)

## Step 7: Test the Integration

1. Restart your development server: `npm run dev`
2. Open your app and go to "Google Sheets" settings
3. Paste your spreadsheet URL or ID
4. Enable the integration
5. Try adding a new food entry - it should appear in your Google Sheet!

## Troubleshooting

### Common Issues:

1. **"Service account credentials are not configured"**

   - Check that your environment variables are set correctly
   - Ensure the private key includes the full key with BEGIN/END lines

2. **"Failed to create entry in Google Sheets"**

   - Verify that your service account has edit access to the sheet
   - Check that the spreadsheet ID is correct

3. **"The caller does not have permission"**

   - Make sure you shared the Google Sheet with your service account email
   - Check that the Google Sheets API is enabled in your Google Cloud project

4. **"Spreadsheet not found"**
   - Verify the spreadsheet ID is correct
   - Ensure the sheet exists and is accessible

### Debugging Tips:

1. Check the browser console for detailed error messages
2. Verify your environment variables are loaded correctly
3. Test the Google Sheets API access using Google's API Explorer
4. Ensure your service account JSON file is valid

## Security Notes

- Keep your service account key file secure and never commit it to version control
- Consider using Google Cloud IAM roles for more granular permissions
- Regularly rotate your service account keys
- Use environment variables for all sensitive configuration

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Set the environment variables in your hosting platform's settings
2. Ensure the `NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID` is available to the client
3. Keep `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` as server-side only variables

For Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all three variables with their respective values

The integration will automatically sync your food diary entries with Google Sheets, providing a reliable backup and easy data access!
