# [Work Location Tracker ](https://ahemantkr19.github.io/wfh-tracker/login.html)

A web application for teams to track whether members are working from office or remotely.

## Features

- 📅 **Calendar View**: Visual monthly calendar to track work locations
- 👥 **Multi-User Support**: Each team member can track their own status
- 🎨 **Color-Coded**: Office (Green), Remote (Blue), Off (Orange)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Data Persistence**: Stores data on the server for team-wide access

## Setup Instructions

### 1. Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## How to Use

1. **Set Your Name**: Enter your name in the input field and click "Set User"
2. **Select Status**: Click on any date to cycle through:
   - Office (working from office)
   - Remote (working from home)
   - Off (day off)
   - Clear (remove status)
3. **Navigate Months**: Use Previous/Next buttons to view different months
4. **View Team Status**: Scroll down to see today's status for all team members

## Deployment Options

### Option 1: Local Network (Easiest)

1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Start the server and share your IP with team members:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

3. Make sure port 3000 is open in your firewall

### Option 2: Cloud Hosting (Recommended for Teams)

#### Heroku
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create your-app-name

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Render.com
1. Create account on render.com
2. Create new "Web Service"
3. Connect your Git repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy

### Option 3: VPS (Digital Ocean, AWS, etc.)

1. Set up a VPS with Node.js installed
2. Upload project files
3. Install dependencies: `npm install`
4. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```
5. Configure nginx as reverse proxy (optional)

## Data Storage

Data is stored in `data.json` in the following format:
```json
{
  "John Doe": {
    "2025-11-21": "office",
    "2025-11-22": "remote"
  },
  "Jane Smith": {
    "2025-11-21": "remote"
  }
}
```

## Customization

### Change Port
Edit `server.js` and modify the PORT variable:
```javascript
const PORT = process.env.PORT || 3000;
```

### Change Colors
Edit `styles.css` and modify the status badge colors:
```css
.status-badge.office { background: #4caf50; }
.status-badge.remote { background: #2196f3; }
.status-badge.off { background: #ff9800; }
```

## Troubleshooting

**Problem**: Team members can't access the site
- Ensure firewall allows port 3000
- Verify IP address is correct
- Check that server is running

**Problem**: Data not saving
- Check file permissions for `data.json`
- Verify server has write access to directory

**Problem**: Page not loading
- Ensure all files are in the same directory
- Check browser console for errors

## License

MIT License - Feel free to use and modify!
