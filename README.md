# WHENHL 
Easier and faster way to view NHL games, scores, standings, and player stats on mobile.

Built with React Native & Expo.
<br>

## Features
- **Games** - View upcoming and past NHL games with scores
- **Picks** - Make game predictions and track your picks
- **Standings** - View team standings: division, conference and league wide
- **Teams** - View all NHL teams’ stats, schedule and roster
- **Players** - View stat leaders, search players and view detailed stats
<br>

<img width="100%" src="preview.png" alt="preview"/>
<br>

## Download
[Download apk here](https://github.com/okkonie/whenhl/releases)
<br>

## Tech Stack
- [Expo](https://expo.dev/) - React Native framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- [NHL API](https://api-web.nhle.com/) - Official NHL data
- AsyncStorage - Local data persistence

## Installation
```bash
# clone the repo
git clone https://github.com/okkonie/whenhl.git

# Install dependencies
npm install

# Start the development server
npx expo start
```

## To-do
- [x] team item component
- [x] fix: games on wrong dateheader
- [x] fix: modal layout issue on build
- [x] top 100 modal FlatList
- [ ] PTS text
- [ ] ? gamestory
- [ ] playoff bracket (use regularSeasonEndDate to view if active)
- [ ] ? SQLite instead of AsyncStorage