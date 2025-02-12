# Nature's Loops - Lofi Music Streaming Platform

A modern web application for streaming lofi music, built with Next.js 14, React, TypeScript, and TailwindCSS.

## Features

- 🎵 Continuous lofi music streaming
- 🌙 Dark mode support
- 🎨 Themed rooms with unique ambiance
- 📱 Responsive design
- 🎛️ Custom audio player with volume and progress controls
- ♿ Accessibility features

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd natures-loops
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Add your audio files to \`public/audio/\`:
- lofi-cafe.mp3
- night-city.mp3
- zen-garden.mp3
- coding-beats.mp3

4. Add your room images to \`public/images/\`:
- cafe.jpg
- city.jpg
- garden.jpg
- coding.jpg

### Development

Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

- \`/src/app\` - Next.js 14 app router pages and layouts
- \`/src/components\` - Reusable React components
- \`/src/utils\` - Utility functions and data
- \`/public\` - Static assets (audio, images)

## Technologies Used

- Next.js 14
- React
- TypeScript
- TailwindCSS
- Radix UI
- Lucide Icons

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

Inspired by [lofi.cafe](https://www.lofi.cafe)
